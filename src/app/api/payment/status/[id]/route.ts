import { NextResponse } from "next/server"
import { createServiceSupabase, createServerSupabase } from "@/lib/supabase"

// GET /api/payment/status/[id] — safe status check, never auto-marks PAID (webhook is authoritative)
// Polling is for UX only
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const service = createServiceSupabase()
    const { data: trx, error } = await service.from("transactions").select("*").eq("id", id).single()
    if (error || !trx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 })

    // Check ownership unless admin
    const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single()
    const isAdmin = profile?.role === "ADMIN"
    if (!isAdmin && trx.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Return DB status directly — webhook is ONLY authoritative for PAID
    // We intentionally do NOT query DOKU and auto-update to Success here
    // Optionally, we could query DOKU for display status without mutating, but we keep it simple for security
    // If you need live DOKU status for UX, uncomment below to query without mutation (read-only)
    // const { queryDokuQris } = await import("@/lib/payment/doku/qris")
    // if (trx.provider === "DOKU" && trx.status === "Pending" && trx.doku_reference_no) {
    //   const q = await queryDokuQris(trx.id, trx.doku_reference_no as any)
    //   // do not update DB, just return q.status for display
    // }

    return NextResponse.json({ status: trx.status, transaction: trx })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
