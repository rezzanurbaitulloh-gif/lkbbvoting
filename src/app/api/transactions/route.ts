import { NextResponse } from "next/server"
import { createServiceSupabase, createServerSupabase } from "@/lib/supabase"

// POST /api/transactions — server calculates price, enforces event closure, creates transaction
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { peletonId, slug, quantity } = body
    if (!peletonId || !quantity || quantity < 1 || quantity > 10000) {
      return NextResponse.json({ error: "Invalid quantity or peleton" }, { status: 400 })
    }

    const supabase = createServerSupabase()
    const service = createServiceSupabase()

    // 1. Check event state server-side
    const { data: event } = await supabase.from("competitions").select("state, settings").order("created_at", { ascending: false }).limit(1).single()
    if (!event) return NextResponse.json({ error: "Event not configured" }, { status: 500 })
    if (event.state === "VOTING_CLOSED" || event.state === "COMPLETED" || event.state === "RESULT_PUBLISHED") {
      return NextResponse.json({ error: "DUKUNGAN TELAH DITUTUP" }, { status: 403 })
    }

    // 2. Validate peleton
    const { data: peleton } = await supabase.from("peletons").select("id, slug, verified, active").eq("id", peletonId).single()
    if (!peleton || !peleton.verified || !peleton.active) {
      return NextResponse.json({ error: "Peleton tidak valid" }, { status: 404 })
    }

    // 3. Server-calculated price (never trust client)
    const onlinePrice = event.settings?.online_price ?? 3000
    const amount = quantity * onlinePrice

    // 4. Create transaction as PENDING
    const providerRef = `xnd_${Date.now()}_${peletonId.slice(0,8)}`
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    // In real Xendit flow, call Xendit API here to create invoice/QRIS, get payment URL
    // For now, mock provider_ref and create DB row
    const { data: trx, error } = await service.from("transactions").insert({
      peleton_id: peletonId,
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

    return NextResponse.json({
      transactionId: trx.id,
      providerRef,
      amount,
      quantity,
      expiresAt,
      paymentUrl: `/checkout?status=pending&id=${trx.id}&peleton=${slug}&qty=${quantity}&total=${amount}`,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 })
  }
}

// GET /api/transactions?userId=... — for history (requires auth, but demo)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const peletonId = searchParams.get("peletonId")
  const supabase = createServerSupabase()
  let query = supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50)
  if (peletonId) query = query.eq("peleton_id", peletonId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
