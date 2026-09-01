import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"

// POST /api/webhook/xendit — verify signature, idempotency, create ledger only on PAID
export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const { provider_ref, status, amount } = payload // Xendit sends provider_ref and status

    // 1. Verify webhook token (Xendit sends X-CALLBACK-TOKEN header)
    const token = req.headers.get("x-callback-token") || req.headers.get("X-CALLBACK-TOKEN")
    if (token !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 })
    }

    if (!provider_ref) return NextResponse.json({ error: "Missing provider_ref" }, { status: 400 })

    const service = createServiceSupabase()

    // 2. Find transaction by provider_ref
    const { data: trx } = await service.from("transactions").select("*").eq("provider_ref", provider_ref).single()
    if (!trx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 })

    // 3. Idempotency: if already Success, do not create ledger again
    if (trx.status === "Success" && status === "PAID") {
      return NextResponse.json({ ok: true, message: "Already processed (idempotent)" })
    }

    // 4. Only PAID creates ledger
    if (status === "PAID" || status === "Success") {
      // Update transaction to Success
      await service.from("transactions").update({ status: "Success" }).eq("id", trx.id)

      // Check if ledger already exists for this transaction (idempotency via transaction_id)
      const { data: existing } = await service.from("supports").select("id").eq("transaction_id", trx.id).single()
      if (existing) {
        return NextResponse.json({ ok: true, message: "Ledger already exists (idempotent)" })
      }

      // Insert into ledger
      await service.from("supports").insert({
        peleton_id: trx.peleton_id,
        user_id: trx.user_id,
        transaction_id: trx.id,
        amount: trx.amount,
        supports: trx.supports,
        source: "online",
      })

      // Optionally: update peletons.support_count via trigger or manually
      // For now, rely on view team_ranking which aggregates supports, not support_count
      // But we can also increment materialized count for backwards compat
      // await service.rpc("increment_support", { peleton_id: trx.peleton_id, qty: trx.supports })

      // Audit log
      await service.from("audit_logs").insert({
        action: "transaction_paid",
        target: trx.id,
        details: { provider_ref, amount, peleton_id: trx.peleton_id, supports: trx.supports },
      })

      // Realtime: Supabase Realtime will automatically broadcast if enabled on supports/transactions
      // Public notification: "[USER] telah mendukung [TEAM]" — without quantity, handled via Realtime channel

      return NextResponse.json({ ok: true, shouldRecordSupport: true })
    }

    if (status === "FAILED" || status === "EXPIRED") {
      await service.from("transactions").update({ status }).eq("id", trx.id)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
