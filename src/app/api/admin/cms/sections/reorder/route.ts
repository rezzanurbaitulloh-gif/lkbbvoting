import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"

// POST { page_id, orderedIds: string[] } — reorder sekalian
export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const service = createServiceSupabase()
  const { page_id, orderedIds } = await req.json()
  if (!page_id || !Array.isArray(orderedIds)) return NextResponse.json({ error: "page_id & orderedIds wajib" }, { status: 400 })

  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]
    await service.from("cms_sections").update({ sort_order: i + 1 }).eq("id", id).eq("page_id", page_id)
  }

  await service.from("cms_revisions").insert({
    entity_type: "section",
    entity_id: page_id,
    action: "reorder",
    after: { orderedIds },
    changed_by: auth.user!.id,
  })
  await service.from("audit_logs").insert({ user_id: auth.user!.id, action: "cms_section_reorder", target: page_id, details: { orderedIds } })
  return NextResponse.json({ ok: true })
}
