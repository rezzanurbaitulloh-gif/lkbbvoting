import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"

export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "/api/payment/webhook/xendit", message: "Xendit webhook ready — configure in Xendit dashboard to https://lkbbvoting.my.id/api/payment/webhook/xendit (or https://lkbbvoting.my.id/api/payment/webhook/xendit)" })
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

      // Fetch peleton + supporter name for notifications
      const { data: peleton } = await service.from("peletons").select("id, slug, name, school, category, number").eq("id", trx.peleton_id).single()
      const { data: profile } = await service.from("profiles").select("public_name, email").eq("id", trx.user_id).single()
      const supporterName = profile?.public_name || profile?.email?.split("@")[0] || "Seseorang"
      const peletonName = peleton?.name || peleton?.school || "peleton"
      const peletonSlug = peleton?.slug || ""
      const peletonCategory = peleton?.category || ""

      // Dual notification system:
      // 1. Public notification (user_id = null) — for ALL users realtime, WITHOUT ballot count, no amount
      // 2. Private notification (user_id = trx.user_id) — for supporter only, WITH ballot_quantity
      const publicTitle = "Dukungan Baru!"
      const publicBody = `Selamat!! ${supporterName} telah mendukung ${peletonName}`
      const privateTitle = "Dukungan Berhasil!"
      const privateBody = `Selamat!! Kamu telah mendukung ${peletonName} — ${trx.supports} ballot`
      try {
        await service.from("notifications").insert([
          {
            user_id: null,
            title: publicTitle,
            body: publicBody,
            peleton_id: trx.peleton_id,
            peleton_name: peletonName,
            peleton_slug: peletonSlug,
            supporter_name: supporterName,
            data: { is_private: false, is_public: true, peleton_category: peletonCategory, peleton_number: peleton?.number },
          },
          {
            user_id: trx.user_id,
            title: privateTitle,
            body: privateBody,
            peleton_id: trx.peleton_id,
            peleton_name: peletonName,
            peleton_slug: peletonSlug,
            supporter_name: supporterName,
            data: { is_private: true, ballot_quantity: trx.supports, peleton_category: peletonCategory, peleton_number: peleton?.number },
          },
        ])
      } catch (notifErr) {
        console.error("notifications insert failed", notifErr)
      }

      // Audit log
      await service.from("audit_logs").insert({
        action: "transaction_paid",
        target: trx.id,
        details: { provider_ref, amount, peleton_id: trx.peleton_id, supports: trx.supports },
      })

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
