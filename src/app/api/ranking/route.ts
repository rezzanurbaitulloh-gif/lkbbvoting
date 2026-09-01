import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const supabase = createServerSupabase()
  let query = supabase.from("team_ranking").select("*").order("total_ballots", { ascending: false })
  if (category) query = query.eq("category", category)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Public must not see ballot numbers during ACTIVE — strip totals
  const { data: event } = await supabase.from("competitions").select("state, show_provisional_result, show_final_result").order("created_at", { ascending: false }).limit(1).single()
  const isActive = event?.state === "VOTING_OPEN"
  const hideTotals = isActive && !event?.show_provisional_result && !event?.show_final_result
  if (hideTotals) {
    // Return only ranking order, without totals
    const sanitized = data?.map((row: any, idx: number) => ({
      rank: idx + 1,
      id: row.id,
      slug: row.slug,
      number: row.number,
      name: row.name,
      school: row.school,
      category: row.category,
      image_url: row.image_url,
      display_order: row.display_order,
      // totals hidden
    }))
    return NextResponse.json(sanitized)
  }
  return NextResponse.json(data)
}
