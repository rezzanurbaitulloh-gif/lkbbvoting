import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, 30) || "user"
}

export async function POST(req: Request) {
  try {
    const { name, password } = await req.json()
    const rawName = (name || "").trim()
    const rawPassword = (password || "")

    if (!rawName || rawName.length < 3) {
      return NextResponse.json({ error: "Nama minimal 3 karakter." }, { status: 400 })
    }
    if (rawName.length > 30) {
      return NextResponse.json({ error: "Nama maksimal 30 karakter." }, { status: 400 })
    }
    if (!/^[a-zA-Z0-9 _-]+$/.test(rawName)) {
      return NextResponse.json({ error: "Nama hanya boleh huruf, angka, spasi, - dan _" }, { status: 400 })
    }
    if (!rawPassword || rawPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 })
    }

    const service = createServiceSupabase()

    // Check unique public_name case-insensitive
    const { data: existing } = await service.from("profiles").select("id").ilike("public_name", rawName).limit(1)
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Nama tersebut sudah digunakan. Silakan gunakan nama lain." }, { status: 409 })
    }

    // Generate fake email
    let slug = slugify(rawName)
    let email = `${slug}@lkbb.local`
    // Ensure email not already taken in profiles
    let attempt = 0
    while (attempt < 5) {
      const { data: emailExists } = await service.from("profiles").select("id").eq("email", email).limit(1)
      if (!emailExists || emailExists.length === 0) break
      attempt++
      email = `${slug}${attempt}@lkbb.local`
    }

    // Create auth user via admin API (auto-confirm)
    const { data: created, error: createErr } = await service.auth.admin.createUser({
      email,
      password: rawPassword,
      email_confirm: true,
      user_metadata: { public_name: rawName },
    })

    if (createErr) {
      // If email already exists in auth, return friendly
      if (createErr.message.includes("already registered")) {
        return NextResponse.json({ error: "Nama tersebut sudah digunakan. Silakan gunakan nama lain." }, { status: 409 })
      }
      return NextResponse.json({ error: createErr.message }, { status: 400 })
    }

    if (!created.user) {
      return NextResponse.json({ error: "Gagal membuat akun." }, { status: 500 })
    }

    // Ensure profile exists with correct public_name and role USER (trigger may have created, but ensure)
    const { error: profileErr } = await service.from("profiles").upsert({
      id: created.user.id,
      email,
      public_name: rawName,
      role: "USER",
    }, { onConflict: "id" })

    if (profileErr) {
      // Not fatal, but log
      console.error("profile upsert error", profileErr)
    }

    return NextResponse.json({ ok: true, message: "Akun berhasil dibuat. Silakan login dengan nama dan password." })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 })
  }
}
