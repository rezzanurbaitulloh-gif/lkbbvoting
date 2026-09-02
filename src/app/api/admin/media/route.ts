import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"

export async function GET(req: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const service = createServiceSupabase()
  const { searchParams } = new URL(req.url)
  const folder = searchParams.get("folder")
  const search = searchParams.get("search")
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  let q = service.from("media_library").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + limit - 1)
  if (folder && folder !== "all") q = q.eq("folder", folder)
  if (search) q = q.ilike("original_name", `%${search}%`)

  const { data, error, count } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ media: data, total: count })
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const service = createServiceSupabase()
  const body = await req.json()
  const { id, alt_text, caption, folder, tags } = body
  if (!id) return NextResponse.json({ error: "id wajib" }, { status: 400 })

  const patch: any = {}
  if (alt_text !== undefined) patch.alt_text = alt_text
  if (caption !== undefined) patch.caption = caption
  if (folder !== undefined) patch.folder = folder
  if (tags !== undefined) patch.tags = tags

  const { data, error } = await service.from("media_library").update(patch).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await service.from("audit_logs").insert({ user_id: auth.user!.id, action: "media_update", target: id, details: patch })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const service = createServiceSupabase()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id wajib" }, { status: 400 })

  const { data: media } = await service.from("media_library").select("storage_path").eq("id", id).single()
  // delete from storage
  if ((media as any)?.storage_path) {
    await service.storage.from("media").remove([(media as any).storage_path])
  }
  const { error } = await service.from("media_library").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await service.from("audit_logs").insert({ user_id: auth.user!.id, action: "media_delete", target: id })
  return NextResponse.json({ ok: true })
}
