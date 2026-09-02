import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"

// GET all site_settings (grouped by category)
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const service = createServiceSupabase()
  const { data, error } = await service.from("site_settings").select("*").order("category", { ascending: true }).order("key", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // group by category for convenience
  const grouped: Record<string, any[]> = {}
  for (const row of (data as any) || []) {
    const cat = row.category || "general"
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(row)
  }
  // also map key->value
  const map: Record<string, any> = {}
  for (const row of (data as any) || []) map[row.key] = (row as any).value

  return NextResponse.json({ settings: data, grouped, map })
}

// PATCH bulk or single: { key, value, category?, description?, is_public? } OR { updates: [{key,value}] }
export async function PATCH(req: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const service = createServiceSupabase()
  const body = await req.json()

  // bulk
  if (Array.isArray(body.updates)) {
    const results = []
    for (const u of body.updates as any[]) {
      if (!u.key) continue
      const { data, error } = await service
        .from("site_settings")
        .upsert({
          key: u.key,
          value: u.value,
          category: u.category || "general",
          description: u.description,
          is_public: u.is_public !== undefined ? !!u.is_public : true,
          updated_by: auth.user!.id,
        }, { onConflict: "key" })
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      results.push(data)
      await service.from("audit_logs").insert({ user_id: auth.user!.id, action: "site_setting_update", target: u.key, details: { value: u.value } })
    }
    return NextResponse.json({ ok: true, updated: results })
  }

  // single
  const { key, value, category, description, is_public } = body
  if (!key) return NextResponse.json({ error: "key wajib" }, { status: 400 })

  const payload: any = { key, value, updated_by: auth.user!.id }
  if (category !== undefined) payload.category = category
  if (description !== undefined) payload.description = description
  if (is_public !== undefined) payload.is_public = !!is_public

  const { data, error } = await service.from("site_settings").upsert(payload, { onConflict: "key" }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await service.from("audit_logs").insert({ user_id: auth.user!.id, action: "site_setting_update", target: key, details: { value } })
  await service.from("cms_revisions").insert({ entity_type: "setting", entity_id: (data as any).id, action: "update", after: data, changed_by: auth.user!.id })

  return NextResponse.json(data)
}

// POST create new custom setting
export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const service = createServiceSupabase()
  const body = await req.json()
  const { key, value, category, description, is_public } = body
  if (!key || value === undefined) return NextResponse.json({ error: "key & value wajib" }, { status: 400 })
  if (!/^[a-z0-9._-]+$/.test(key)) return NextResponse.json({ error: "key hanya a-z 0-9 . _ -" }, { status: 400 })

  const { data, error } = await service.from("site_settings").insert({
    key: key.toLowerCase().trim(),
    value,
    category: category || "general",
    description: description || null,
    is_public: is_public !== false,
    updated_by: auth.user!.id,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await service.from("audit_logs").insert({ user_id: auth.user!.id, action: "site_setting_create", target: key })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const service = createServiceSupabase()
  const { searchParams } = new URL(req.url)
  const key = searchParams.get("key")
  if (!key) return NextResponse.json({ error: "key wajib" }, { status: 400 })

  const { data: existing } = await service.from("site_settings").select("is_system").eq("key", key).single()
  if ((existing as any)?.is_system) return NextResponse.json({ error: "Setting sistem tidak boleh dihapus" }, { status: 400 })

  const { error } = await service.from("site_settings").delete().eq("key", key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await service.from("audit_logs").insert({ user_id: auth.user!.id, action: "site_setting_delete", target: key })
  return NextResponse.json({ ok: true })
}
