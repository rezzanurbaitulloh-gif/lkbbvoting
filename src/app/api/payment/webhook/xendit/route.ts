import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "/api/payment/webhook/xendit", message: "Xendit webhook ready — configure in Xendit dashboard to https://lkbbvoting.vercel.app/api/payment/webhook/xendit (or https://lkbb.vercel.app/api/payment/webhook/xendit)" })
}

// POST /api/webhook/xendit — verify signature, idempotency, create ledger only on PAID
export async function POST(req: Request) {
  try {
    const payload = await req.json()
    // Xendit Invoice webhook sends: id, external_id, status, amount, payment_method, etc.
    // Our mock sends: provider_ref, status, amount
    const provider_ref = payload.provider_ref || payload.id || payload.external_id
    const external_id = payload.external_id
    const status = payload.status
    const amount = payload.amount

    // 1. Verify webhook token (Xendit sends X-CALLBACK-TOKEN header)
    const token = req.headers.get("x-callback-token") || req.headers.get("X-CALLBACK-TOKEN")
    if (token !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 })
    }

    if (!provider_ref && !external_id) return NextResponse.json({ error: "Missing provider_ref / external_id" }, { status: 400 })

    const service = createServiceSupabase()

    // 2. Find transaction by provider_ref or external_id (lkbb-<trx.id>)
    let trx: any = null
    if (external_id && external_id.startsWith("lkbb-")) {
      const trxId = external_id.replace("lkbb-", "")
      const { data } = await service.from("transactions").select("*").eq("id", trxId).single()
      trx = data
    }
    if (!trx && provider_ref) {
      const { data } = await service.from("transactions").select("*").eq("provider_ref", provider_ref).single()
      trx = data
    }
    if (!trx && external_id) {
      const { data } = await service.from("transactions").select("*").eq("provider_ref", external_id).single()
      trx = data
    }
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
