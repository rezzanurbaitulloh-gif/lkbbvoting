import { NextResponse } from "next/server"
import { createStaticSupabase } from "@/lib/supabase"

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createStaticSupabase()

  const { data: page, error } = await supabase.from("cms_pages").select("*").eq("slug", slug).eq("is_published", true).single()
  if (error || !page) return NextResponse.json({ error: "Page not found" }, { status: 404 })

  const { data: sections } = await supabase
    .from("cms_sections")
    .select("*")
    .eq("page_id", (page as any).id)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })

  return NextResponse.json({ page, sections: sections || [] })
}
