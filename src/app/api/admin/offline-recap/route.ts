import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

async function getUserAndRole() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, role: null, supabase }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  return { user, role: profile?.role || null, supabase }
}

export async function POST(req: Request) {
  try {
    const { user, role } = await getUserAndRole()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await req.json()
    const { peleton_id, supports, note } = body
    if (!peleton_id || !supports || typeof supports !== "number" || supports === 0) {
      return NextResponse.json({ error: "Invalid peleton_id or supports" }, { status: 400 })
    }
    if (supports < -10000 || supports > 10000) return NextResponse.json({ error: "Supports out of range -10000..10000" }, { status: 400 })
    if (supports !== Math.floor(supports)) return NextResponse.json({ error: "Supports must be integer" }, { status: 400 })

    const service = createServiceSupabase()
    // Validate peleton
    const { data: peleton } = await service.from("peletons").select("id").eq("id", peleton_id).single()
    if (!peleton) return NextResponse.json({ error: "Peleton not found" }, { status: 404 })

    // Price from DB
    const { data: event } = await service.from("competitions").select("settings").order("created_at", { ascending: false }).limit(1).single()
    const offlinePrice = event?.settings?.offline_price ?? 5000
    const amount = Math.abs(supports) * offlinePrice

    const transactionId = crypto.randomUUID()
    const { data: inserted, error } = await service.from("supports").insert({
      peleton_id,
      transaction_id: transactionId,
      amount: supports > 0 ? amount : 0,
      supports,
      source: "offline",
      note: note || null,
      admin_id: user.id,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Audit log server-side
    await service.from("audit_logs").insert({
      user_id: user.id,
      action: "offline_recap_add",
      target: peleton_id,
      details: { supports, note, amount, peleton_id },
    })

    return NextResponse.json({ ok: true, data: inserted })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET() {
  const { user, role } = await getUserAndRole()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const service = createServiceSupabase()
  const { data, error } = await service.from("supports").select("*, peletons(number,name)").eq("source", "offline").order("created_at", { ascending: false }).limit(20)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
