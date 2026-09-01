import { NextResponse } from "next/server"
import { createServiceSupabase, createServerSupabase } from "@/lib/supabase"

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
    const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN"
    if (!isAdmin && trx.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // If already Success, return immediately
    if (trx.status === "Success") {
      return NextResponse.json({ status: "Success", transaction: trx })
    }

    // If Pending and has Xendit provider_ref (invoice id), query Xendit directly
    const xenditKey = process.env.XENDIT_SECRET_KEY
    if (trx.provider_ref && trx.provider_ref.startsWith("xnd_") === false && xenditKey && trx.status === "Pending") {
      // provider_ref is Xendit invoice id (not our mock xnd_...)
      try {
        const res = await fetch(`https://api.xendit.co/v2/invoices/${trx.provider_ref}`, {
          headers: {
            Authorization: `Basic ${Buffer.from(xenditKey + ":").toString("base64")}`,
          },
        })
        if (res.ok) {
          const inv: any = await res.json()
          // Xendit status: PENDING, PAID, EXPIRED, etc.
          if (inv.status === "PAID" || inv.status === "SETTLED") {
            // Update transaction to Success
            await service.from("transactions").update({ status: "Success" }).eq("id", trx.id)
            // Idempotency: check ledger
            const { data: existing } = await service.from("supports").select("id").eq("transaction_id", trx.id).single()
            if (!existing) {
              await service.from("supports").insert({
                peleton_id: trx.peleton_id,
                user_id: trx.user_id,
                transaction_id: trx.id,
                amount: trx.amount,
                supports: trx.supports,
                source: "online",
              })
              await service.from("audit_logs").insert({
                action: "transaction_paid_via_status_check",
                target: trx.id,
                details: { provider_ref: trx.provider_ref, amount: trx.amount, via: "status_check" },
              })
            }
            return NextResponse.json({ status: "Success", transaction: { ...trx, status: "Success" }, xendit: inv })
          } else if (inv.status === "EXPIRED") {
            await service.from("transactions").update({ status: "Expired" }).eq("id", trx.id)
            return NextResponse.json({ status: "Expired", transaction: { ...trx, status: "Expired" }, xendit: inv })
          } else {
            // Still pending
            return NextResponse.json({ status: inv.status, transaction: trx, xendit: inv })
          }
        } else {
          // Xendit not found or error, fallback to DB status
          const txt = await res.text()
          console.error("Xendit status check failed", res.status, txt)
        }
      } catch (e) {
        console.error("Xendit status error", e)
      }
    }

    // Fallback: return DB status
    return NextResponse.json({ status: trx.status, transaction: trx })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
