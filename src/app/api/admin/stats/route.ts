import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

async function requireAdmin() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, status: 401 }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "ADMIN" && profile?.role !== "SUPER_ADMIN") return { ok: false as const, status: 403 }
  return { ok: true as const, user, supabase }
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.status === 401 ? "Unauthorized" : "Forbidden" }, { status: auth.status })
  const service = createServiceSupabase()
  const [peletons, peletonsSMP, peletonsSMA, users, transactions, supports, ranking, recentTx, competitions, auditLogs] = await Promise.all([
    service.from("peletons").select("*", { count: "exact", head: true }).eq("active", true),
    service.from("peletons").select("*", { count: "exact", head: true }).eq("category", "SMP").eq("active", true),
    service.from("peletons").select("*", { count: "exact", head: true }).eq("category", "SMA").eq("active", true),
    service.from("profiles").select("*", { count: "exact", head: true }),
    service.from("transactions").select("*", { count: "exact", head: true }),
    service.from("supports").select("supports,source"),
    service.from("team_ranking").select("*").order("total_ballots", { ascending: false }).limit(5),
    service.from("transactions").select("*, peletons(name,number)").order("created_at", { ascending: false }).limit(5),
    service.from("competitions").select("*").order("created_at", { ascending: false }).limit(1).single(),
    service.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  const total = (supports.data || []).reduce((a: any, b: any) => a + (b.supports || 0), 0)
  const online = (supports.data || []).filter((x: any) => x.source === "online").reduce((a: any, b: any) => a + b.supports, 0)
  const offline = total - online

  return NextResponse.json({
    totalTeams: peletons.count ?? 0,
    smp: peletonsSMP.count ?? 0,
    sma: peletonsSMA.count ?? 0,
    totalUsers: users.count ?? 0,
    totalTransactions: transactions.count ?? 0,
    totalBallots: total,
    onlineBallots: online,
    offlineBallots: offline,
    ranking: ranking.data || [],
    recentTransactions: recentTx.data || [],
    event: competitions.data || null,
    auditLogs: auditLogs.data || [],
  })
}
