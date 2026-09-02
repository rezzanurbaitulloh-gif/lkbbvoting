import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const ALLOWED_TABLES = ["peletons","news","announcements","timeline_stages","judges","sponsors","faqs","profiles"]

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
  if(profile?.role !== "ADMIN" && profile?.role !== "SUPER_ADMIN") return { ok:false as const, status:403 }
  return { ok:true as const, user }
}

export async function POST(req: Request){
  const auth = await requireAdmin()
  if(!auth.ok) return NextResponse.json({ error:"Unauthorized" }, { status: auth.status })
  const body = await req.json()
  const { table, data } = body
  if(!ALLOWED_TABLES.includes(table)) return NextResponse.json({ error:"Table not allowed" }, { status:400 })
  const service = createServiceSupabase()
  // For peletons, force verified
  if(table==="peletons"){
    data.verified = true
    data.status = "Verified"
    if(!data.active) data.active = true
  }
  const { data: inserted, error } = await service.from(table).insert(data).select().single()
  if(error) return NextResponse.json({ error: error.message }, { status:500 })
  await service.from("audit_logs").insert({ user_id: auth.user.id, action: `${table}_create`, target: inserted.id, details: data })
  return NextResponse.json(inserted)
}

export async function PATCH(req: Request){
  const auth = await requireAdmin()
  if(!auth.ok) return NextResponse.json({ error:"Unauthorized" }, { status: auth.status })
  const body = await req.json()
  const { table, id, data } = body
  if(!ALLOWED_TABLES.includes(table) || !id) return NextResponse.json({ error:"Invalid" }, { status:400 })
  const service = createServiceSupabase()
  const { data: updated, error } = await service.from(table).update(data).eq("id", id).select().single()
  if(error) return NextResponse.json({ error: error.message }, { status:500 })
  await service.from("audit_logs").insert({ user_id: auth.user.id, action: `${table}_update`, target: id, details: data })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request){
  const auth = await requireAdmin()
  if(!auth.ok) return NextResponse.json({ error:"Unauthorized" }, { status: auth.status })
  const { searchParams } = new URL(req.url)
  const table = searchParams.get("table")
  const id = searchParams.get("id")
  if(!table || !id || !ALLOWED_TABLES.includes(table)) return NextResponse.json({ error:"Invalid" }, { status:400 })
  const service = createServiceSupabase()
  const { error } = await service.from(table).delete().eq("id", id)
  if(error) return NextResponse.json({ error: error.message }, { status:500 })
  await service.from("audit_logs").insert({ user_id: auth.user.id, action: `${table}_delete`, target: id })
  return NextResponse.json({ ok:true })
}
