import { NextResponse } from "next/server"
import { createStaticSupabase } from "@/lib/supabase"

// Public — expose only is_public = true settings as key->value map
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const supabase = createStaticSupabase()
  let q = supabase.from("site_settings").select("key,value,category,description").eq("is_public", true)
  if (category) q = q.eq("category", category)
  const { data, error } = await q.order("key", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // flatten to map
  const map: Record<string, any> = {}
  for (const row of (data as any) || []) map[row.key] = (row as any).value
  return NextResponse.json({ settings: map, rows: data })
}
