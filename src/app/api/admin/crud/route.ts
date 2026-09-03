import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const ALLOWED_TABLES = ["peletons","news","announcements","timeline_stages","judges","sponsors","faqs","profiles","audit_logs","transactions","supports","competitions"]

async function requireAdmin(){
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(){ return cookieStore.getAll() },
        setAll(cookiesToSet){ try{ cookiesToSet.forEach(({name,value,options})=> cookieStore.set(name,value,options)) } catch{} },
      }
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if(!user) return { ok:false as const, status:401 }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if(profile?.role !== "ADMIN") return { ok:false as const, status:403 }
  return { ok:true as const, user, role: profile?.role }
}

export async function POST(req: Request){
  const auth = await requireAdmin() as any
  if(!auth.ok) return NextResponse.json({ error:"Unauthorized" }, { status: auth.status })
  const body = await req.json()
  const { table, data } = body
  if(!ALLOWED_TABLES.includes(table)) return NextResponse.json({ error:"Table not allowed" }, { status:400 })
  const service = createServiceSupabase()
  // For peletons, force verified + duplicate prevention (except offline is separate route)
  if(table==="peletons"){
    data.verified = true
    data.status = "Verified"
    if(!data.active) data.active = true
    // Duplicate check: number or name already exists (case-insensitive)
    if(data.number || data.name){
      const { data: existing } = await service.from("peletons").select("id, number, name").or(`number.eq.${data.number},name.ilike.${data.name}`)
      if(existing && existing.length>0){
        const dup = existing.find(e=> String(e.number).toLowerCase()===String(data.number).toLowerCase() || String(e.name).toLowerCase()===String(data.name).toLowerCase())
        if(dup) return NextResponse.json({ error: `Data tim sudah ada: #${dup.number} ${dup.name}. Tidak boleh duplikat.` }, { status:409 })
      }
    }
  }
  // Generic duplicate prevention for other important tables: name unique where applicable
  if(["sponsors","judges","news"].includes(table) && data.name){
    const { data: dup } = await service.from(table).select("id").ilike("name", data.name).limit(1)
    if(dup && dup.length>0) return NextResponse.json({ error: `Data ${table} dengan nama "${data.name}" sudah ada` }, { status:409 })
  }
  const { data: inserted, error } = await service.from(table).insert(data).select().single()
  if(error) return NextResponse.json({ error: error.message }, { status:500 })
  await service.from("audit_logs").insert({ user_id: auth.user.id, action: `${table}_create`, target: inserted.id, details: data })
  return NextResponse.json(inserted)
}

export async function PATCH(req: Request){
  const auth = await requireAdmin() as any
  if(!auth.ok) return NextResponse.json({ error:"Unauthorized" }, { status: auth.status })
  const body = await req.json()
  const { table, id, data } = body
  if(!ALLOWED_TABLES.includes(table) || !id) return NextResponse.json({ error:"Invalid" }, { status:400 })
  const service = createServiceSupabase()
  // Duplicate prevention on update for peletons
  if(table==="peletons" && (data.number || data.name)){
    const { data: existing } = await service.from("peletons").select("id, number, name")
    if(existing){
      const dup = existing.find(e=> e.id!==id && (String(e.number).toLowerCase()===String(data.number||"").toLowerCase() || String(e.name).toLowerCase()===String(data.name||"").toLowerCase()))
      if(dup) return NextResponse.json({ error: `Data tim sudah ada: #${dup.number} ${dup.name}. Tidak boleh duplikat.` }, { status:409 })
    }
  }
  const { data: updated, error } = await service.from(table).update(data).eq("id", id).select().single()
  if(error) return NextResponse.json({ error: error.message }, { status:500 })
  await service.from("audit_logs").insert({ user_id: auth.user.id, action: `${table}_update`, target: id, details: data })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request){
  const auth = await requireAdmin() as any
  if(!auth.ok) return NextResponse.json({ error:"Unauthorized" }, { status: auth.status })
  const { searchParams } = new URL(req.url)
  const table = searchParams.get("table")
  const id = searchParams.get("id")
  if(!table || !id || !ALLOWED_TABLES.includes(table)) return NextResponse.json({ error:"Invalid" }, { status:400 })
  const service = createServiceSupabase()
  // Handle FK: peleton has FK from transactions & supports. Delete children first.
  if(table === "peletons"){
    // Delete supports (cascade already, but ensure)
    await service.from("supports").delete().eq("peleton_id", id)
    // Delete transactions referencing this peleton
    await service.from("transactions").delete().eq("peleton_id", id)
    // Also clean peleton_members & gallery if exist (obsolete tables)
    try { await service.from("peleton_members").delete().eq("peleton_id", id) } catch {}
    try { await service.from("peleton_gallery").delete().eq("peleton_id", id) } catch {}
  }
  if(table === "transactions"){
    // also delete supports linked to this transaction
    await service.from("supports").delete().eq("transaction_id", id)
  }
  const { error } = await service.from(table).delete().eq("id", id)
  if(error) return NextResponse.json({ error: error.message }, { status:500 })
  await service.from("audit_logs").insert({ user_id: auth.user.id, action: `${table}_delete`, target: id })
  return NextResponse.json({ ok:true })
}
