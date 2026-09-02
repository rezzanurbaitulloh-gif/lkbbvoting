import { NextResponse } from "next/server"
import { createServiceSupabase } from "@/lib/supabase"
import { requireAdmin } from "@/lib/auth"

export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const service = createServiceSupabase()

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const folder = (formData.get("folder") as string) || "general"
  const alt_text = (formData.get("alt_text") as string) || ""
  const caption = (formData.get("caption") as string) || ""

  if (!file) return NextResponse.json({ error: "file wajib" }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File maksimal 10MB" }, { status: 400 })

  const allowed = ["image/jpeg","image/png","image/webp","image/gif","image/svg+xml","video/mp4","application/pdf"]
  if (!allowed.includes(file.type) && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() || "jpg"
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
  const storagePath = `${folder}/${fileName}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await service.storage.from("media").upload(storagePath, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: pub } = service.storage.from("media").getPublicUrl(storagePath)
  const url = pub.publicUrl

  // try to get image dimensions (optional, not blocking)
  let width: number | null = null
  let height: number | null = null
  // leave null for now; frontend can parse

  const { data: inserted, error } = await service.from("media_library").insert({
    file_name: fileName,
    original_name: file.name,
    url,
    storage_path: storagePath,
    mime_type: file.type,
    size: file.size,
    width,
    height,
    alt_text: alt_text || file.name,
    caption: caption || null,
    folder,
    tags: [],
    uploaded_by: auth.user!.id,
  }).select().single()

  if (error) {
    // rollback storage
    await service.storage.from("media").remove([storagePath])
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await service.from("audit_logs").insert({ user_id: auth.user!.id, action: "media_upload", target: (inserted as any).id, details: { folder, original_name: file.name, size: file.size } })

  return NextResponse.json(inserted)
}
