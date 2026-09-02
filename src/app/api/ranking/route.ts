import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const supabase = await createServerSupabase()
  const { data: event } = await supabase.from("competitions").select("state, show_provisional_result, show_final_result").order("created_at", { ascending: false }).limit(1).single()
  const state = event?.state as string
  const isActive = state === "ACTIVE" || state === "VOTING_OPEN"
  const isVotingClosed = state === "VOTING_CLOSED"
  const isPublished = state === "RESULT_PUBLISHED"
  const showRanking = isVotingClosed || isPublished
  // BELUM DIMULAI & AKTIF: ranking tidak tampil — return display_order (urut nomor)
  if (!showRanking) {
    let q = supabase.from("peletons").select("id,slug,number,name,school,category,image_url,logo_url,display_order").eq("active", true).eq("verified", true).order("number", { ascending: true })
    if (category) q = q.eq("category", category)
    const { data, error } = await q
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json((data || []).map((row: any) => ({
      rank: null,
      ...row,
    })))
  }
  // VOTING_DITUTUP: ranking online saja, HASIL_DIPUBLIKASIKAN: ranking overall
  const orderField = isPublished ? "total_ballots" : "online_ballots"
  let query = supabase.from("team_ranking").select("*").order(orderField as any, { ascending: false })
  if (category) query = query.eq("category", category)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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
    // Untuk VOTING_DITUTUP tampilkan online saja, untuk HASIL_DIPUBLIKASIKAN tampil total
    online_ballots: row.online_ballots,
    total_ballots: isPublished ? row.total_ballots : undefined,
    offline_ballots: isPublished ? row.offline_ballots : undefined,
  }))
  return NextResponse.json(sanitized)
}
