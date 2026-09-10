import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"

// GET /api/cron/expire-transactions
// Called by Vercel Cron every minute to auto-cancel pending transactions past 15 min
// Also can be called manually with ?key=CRON_SECRET

export async function GET(req: Request) {
  const url = new URL(req.url)
  const auth = req.headers.get("authorization")
  const key = url.searchParams.get("key") || url.searchParams.get("token")

  // Simple protection: allow if CRON_SECRET matches or if running on Vercel Cron (has vercel header)
  const cronSecret = process.env.CRON_SECRET
  const vercelCron = req.headers.get("x-vercel-cron") || req.headers.get("x-vercel-cron-job")
  const isVercelCron = !!vercelCron || req.headers.get("user-agent")?.includes("vercel")

  if (cronSecret) {
    const provided = auth?.replace("Bearer ", "") || key || ""
    if (!isVercelCron && provided !== cronSecret) {
      // Allow unauthenticated for now if no secret? But if secret set, require it
      // For Vercel Cron without secret header, allow if vercel cron header present
      if (provided !== cronSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }
  }

  const service = createServiceSupabase()
  const now = new Date().toISOString()

  // Find pending transactions past expires_at
  const { data: expired, error } = await service
    .from("transactions")
    .select("id, status, expires_at, provider")
    .eq("status", "Pending")
    .lt("expires_at", now)
    .limit(100)

  if (error) {
    console.error("[cron] fetch expired failed", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ ok: true, expired: 0, message: "No expired pending" })
  }

  let updated = 0
  for (const trx of expired) {
    // Double-check status is still Pending before update (race)
    const { error: updErr } = await service
      .from("transactions")
      .update({ status: "Expired" })
      .eq("id", trx.id)
      .eq("status", "Pending")

    if (!updErr) {
      updated++
      // Audit log
      try {
        await service.from("audit_logs").insert({
          action: "transaction_expired_auto",
          target: trx.id,
          details: { provider: trx.provider || "DOKU", reason: "15min timeout", expired_at: trx.expires_at, now },
        })
      } catch {}
    }
  }

  return NextResponse.json({ ok: true, expired: expired.length, updated, now })
}

// Also allow POST for manual trigger
export async function POST(req: Request) {
  return GET(req)
}
