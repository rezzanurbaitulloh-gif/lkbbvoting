import { NextResponse } from "next/server"
import { createServiceSupabase, createServerSupabase } from "@/lib/supabase"

// POST /api/transactions — server calculates price, enforces event closure, creates transaction + Xendit QRIS
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { peletonId, slug, quantity } = body
    if (!peletonId || !quantity || quantity < 1 || quantity > 10000) {
      return NextResponse.json({ error: "Invalid quantity or peleton" }, { status: 400 })
    }

    const supabase = await createServerSupabase()
    const service = createServiceSupabase()

    // Require login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Harus login terlebih dahulu untuk melakukan transaksi." }, { status: 401 })
    }

    // Rate limiting stub: check quantity bounds strictly
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      return NextResponse.json({ error: "Quantity must be 1-1000" }, { status: 400 })
    }

    // Hanya status Aktif yang boleh transaksi (4 status baru)
    const { data: event } = await supabase.from("competitions").select("state, settings").order("created_at", { ascending: false }).limit(1).single()
    if (!event) return NextResponse.json({ error: "Event not configured" }, { status: 500 })
    const state = event.state as string
    const canTransact = state === "ACTIVE" || state === "VOTING_OPEN"
    if (!canTransact) {
      const msg =
        state === "NOT_STARTED" ? "Belum dimulai — transaksi belum dibuka" :
        state === "VOTING_CLOSED" ? "Voting ditutup — transaksi dihentikan" :
        state === "RESULT_PUBLISHED" ? "Hasil sudah dipublikasikan — transaksi dihentikan" :
        "Transaksi ditutup — status tidak mengizinkan"
      return NextResponse.json({ error: msg }, { status: 403 })
    }

    // 2. Validate peleton
    const { data: peleton } = await supabase.from("peletons").select("id, slug, verified, active").eq("id", peletonId).single()
    if (!peleton || !peleton.verified || !peleton.active) {
      return NextResponse.json({ error: "Peleton tidak valid" }, { status: 404 })
    }

    // 3. Server-calculated price (never trust client)
    const onlinePrice = event.settings?.online_price ?? 3000
    const amount = quantity * onlinePrice

    // 4. Create transaction as PENDING with user_id
    const providerRef = `xnd_${Date.now()}_${peletonId.slice(0,8)}`
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const { data: trx, error } = await service.from("transactions").insert({
      peleton_id: peletonId,
      user_id: user.id,
      amount,
      supports: quantity,
      method: "QRIS",
      status: "Pending",
      provider: "XENDIT",
      provider_ref: providerRef,
      source: "online",
      expires_at: expiresAt,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // 5. Create Xendit Invoice (real QRIS) — if keys present, call Xendit; else fallback to mock checkout
    const xenditKey = process.env.XENDIT_SECRET_KEY
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lkbbvoting.my.id"
    let paymentUrl = `/checkout?id=${trx.id}&peleton=${slug}&qty=${quantity}&total=${amount}`
    let xenditInvoiceId: string | null = null
    let xenditQrString: string | null = null

    if (xenditKey) {
      try {
        const externalId = `lkbb-${trx.id}`
        const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${Buffer.from(xenditKey + ":").toString("base64")}`,
          },
          body: JSON.stringify({
            external_id: externalId,
            amount,
            payer_email: user.email || "supporter@lkbb.local",
            description: `Dukungan ${quantity} ballot untuk ${peleton.slug} (#${peleton.slug})`,
            currency: "IDR",
            payment_methods: ["QRIS"],
            success_redirect_url: `${appUrl}/checkout?id=${trx.id}&status=success`,
            failure_redirect_url: `${appUrl}/checkout?id=${trx.id}&status=failed`,
            customer: {
              given_names: user.email?.split("@")[0] || "Supporter",
              email: user.email || "supporter@lkbb.local",
            },
            items: [
              {
                name: `Ballot ${peleton.slug}`,
                quantity,
                price: onlinePrice,
                category: "Ballot",
                url: `${appUrl}/peleton/${slug}`,
              },
            ],
            should_send_email: false,
            invoice_duration: 900, // 15 minutes
          }),
        })
        if (xenditRes.ok) {
          const xData: any = await xenditRes.json()
          xenditInvoiceId = xData.id
          paymentUrl = xData.invoice_url || paymentUrl
          // Xendit Invoice may contain qr_code string in actions or payment_methods
          // For QRIS, the QR is shown on invoice_url; we also store id for webhook matching
          if (xenditInvoiceId) {
            await service.from("transactions").update({ provider_ref: xenditInvoiceId }).eq("id", trx.id)
          }
        } else {
          const errText = await xenditRes.text()
          console.error("Xendit invoice failed", xenditRes.status, errText)
          // fallback to mock checkout — keep providerRef as generated
        }
      } catch (xErr) {
        console.error("Xendit error", xErr)
      }
    }

    return NextResponse.json({
      transactionId: trx.id,
      providerRef: xenditInvoiceId || providerRef,
      xenditInvoiceId,
      amount,
      quantity,
      expiresAt,
      paymentUrl,
      qrString: xenditQrString,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 })
  }
}

// GET /api/transactions?userId=... — for history (requires auth)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const peletonId = searchParams.get("peletonId")
  const id = searchParams.get("id")
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const isAdmin = profile?.role === "ADMIN"
  if (id) {
    let q = supabase.from("transactions").select("*").eq("id", id).single()
    // RLS will enforce; but also check ownership if not admin
    const { data, error } = await q
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    if (!isAdmin && data.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    return NextResponse.json(data)
  }
  let query = supabase.from("transactions").select("*, peletons(name,number)").order("created_at", { ascending: false }).limit(50)
  if (peletonId) query = query.eq("peleton_id", peletonId)
  if (!isAdmin) query = query.eq("user_id", user.id)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
