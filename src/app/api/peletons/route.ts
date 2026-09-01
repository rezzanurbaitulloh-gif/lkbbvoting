import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") // SMP or SMA
  const orderBy = searchParams.get("orderBy") // display_order or ranking
  const supabase = await createServerSupabase()

  if (orderBy === "ranking") {
    // Use team_ranking view for performance-based order
    let query = supabase.from("team_ranking").select("*")
    if (category) query = query.eq("category", category)
    query = query.order("total_ballots", { ascending: false }).order("display_order", { ascending: true })
    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Default: display_order (homepage)
  let query = supabase.from("peletons").select("*").eq("verified", true).eq("active", true).order("display_order", { ascending: true })
  if (category) query = query.eq("category", category)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
