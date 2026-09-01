import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase.from("competitions").select("*").order("created_at", { ascending: false }).limit(1).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Do not expose sensitive settings directly? But event is public
  return NextResponse.json(data)
}
