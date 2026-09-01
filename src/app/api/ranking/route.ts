import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const supabase = await createServerSupabase()
  const { data: event } = await supabase.from("competitions").select("state, show_provisional_result, show_final_result").order("created_at", { ascending: false }).limit(1).single()
  const isOnlineActive = event?.state === "VOTING_OPEN" || event?.state === "ACTIVE"
  const showRanking = !isOnlineActive
  // When ONLINE active, ranking is NOT visible at all — return display_order, no totals
  // When NONAKTIF, ranking visible (team_ranking) with label SEMENTARA/FINAL
  if (!showRanking) {
    let q = supabase.from("peletons").select("id,slug,number,name,school,category,image_url,logo_url,display_order").eq("active", true).eq("verified", true).order("display_order", { ascending: true })
    if (category) q = q.eq("category", category)
    const { data, error } = await q
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    // Never expose totals when online active
    return NextResponse.json((data || []).map((row: any) => ({
      rank: null,
      ...row,
    })))
  }
  let query = supabase.from("team_ranking").select("*").order("total_ballots", { ascending: false })
  if (category) query = query.eq("category", category)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // When nonaktif, still hide totals from public? Spec says poin/ballot tetap tidak ditampilkan kepada publik (hanya admin)
  // So always strip totals for public API, even when ranking visible — only order matters
  const sanitized = data?.map((row: any, idx: number) => ({
    rank: idx + 1,
    id: row.id,
    slug: row.slug,
    number: row.number,
    name: row.name,
    school: row.school,
    category: row.category,
    image_url: row.image_url,
    logo_url: row.logo_url,
    display_order: row.display_order,
    // totals hidden for public
  }))
  return NextResponse.json(sanitized)
}
