import { NextResponse } from "next/server"
import { createServiceSupabase, createServerSupabase } from "@/lib/supabase"
import { getPaymentProvider } from "@/lib/payment"

// POST /api/transactions — server calculates price, enforces event closure, creates transaction + DOKU QRIS
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

    // 4. Create transaction as PENDING with user_id — provider DOKU, never trust client amount
    const initialRef = `doku_${Date.now()}_${peletonId.slice(0,8)}`
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const { data: trx, error } = await service.from("transactions").insert({
      peleton_id: peletonId,
      user_id: user.id,
      amount,
      supports: quantity,
      method: "QRIS",
      status: "Pending",
      provider: "DOKU",
      provider_ref: initialRef,
      source: "online",
      expires_at: expiresAt,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // 5. Create DOKU QRIS via provider (server-side only, never expose secrets to browser)
    // Frontend must never call DOKU directly — we are the only caller
    let paymentUrl = `/checkout?id=${trx.id}&peleton=${slug}&qty=${quantity}&total=${amount}`
    let dokuReferenceNo: string | null = null
    let dokuQrContent: string | null = null
    let dokuQrUrl: string | null = null

    try {
      const provider = getPaymentProvider()
      const dokuRes = await provider.createPayment({
        transactionId: trx.id,
        peletonId,
        peletonSlug: slug || peleton.slug,
        userId: user.id,
        quantity,
        amount,
        email: user.email || undefined,
      })

      dokuReferenceNo = dokuRes.referenceNo || dokuRes.providerReference || null
      dokuQrContent = dokuRes.qrContent
      dokuQrUrl = dokuRes.qrUrl || null

      if (!dokuQrContent) throw new Error("DOKU tidak mengembalikan qrContent — cek merchantId/terminalId di Dashboard")

      // Persist DOKU references for webhook & status lookup
      await service.from("transactions").update({
        provider_ref: dokuReferenceNo || initialRef,
        doku_reference_no: dokuReferenceNo,
        qr_content: dokuQrContent,
        doku_qr_url: dokuQrUrl,
      } as any).eq("id", trx.id)
    } catch (dokuErr: any) {
      console.error("[doku] createPayment failed", dokuErr)
      // Hapus transaksi pending yang gagal generate QR agar tidak jadi transaksi amount 0 / QR palsu yang bikin simulator 5101
      await service.from("transactions").delete().eq("id", trx.id)
      const msg = dokuErr?.message || "Gagal generate QRIS DOKU"
      // Sanitize: jangan expose secret, tapi beri hint upload public key
      const isAuthError = /B2B token gagal|public\.pem|merchantId|401|500/i.test(msg)
      const hint = isAuthError ? " — Pastikan public.pem (dari private-pkcs8.key) sudah di-upload ke DOKU Dashboard Sandbox untuk client " + (process.env.DOKU_CLIENT_ID || "BRN-0272-1788400874210") + " dan DOKU_MERCHANT_ID/TERMINAL_ID benar." : ""
      return NextResponse.json({ error: msg + hint }, { status: 502 })
    }

    return NextResponse.json({
      transactionId: trx.id,
      provider: "DOKU",
      providerRef: dokuReferenceNo || initialRef,
      dokuReferenceNo,
      amount,
      quantity,
      expiresAt,
      paymentUrl,
      qrContent: dokuQrContent,
      qrString: dokuQrContent,
      qrUrl: dokuQrUrl,
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
