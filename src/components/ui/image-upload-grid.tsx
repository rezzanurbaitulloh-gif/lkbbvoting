"use client"
import { useRef, useState, useCallback } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"

type Props = {
  label?: string
  value: string | null
  onChange: (url: string | null) => void
  folder?: string // storage folder prefix
  bucket?: string // storage bucket, default media
  description?: string
  // logo specific: allow with/without background toggle, and ensure transparency
  logoMode?: boolean
  // accept string for file type
  accept?: string
}

async function removeWhiteBackground(file: File | Blob): Promise<Blob> {
  // Convert near-white pixels to transparent — true tanpa latar belakang
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        URL.revokeObjectURL(url)
        resolve(file as Blob)
        return
      }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      // threshold for white: r,g,b > 240 and not too transparent
      // also keep strong colors, only remove near-white background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        // if pixel is near white, make it transparent
        // use 240 threshold, and also check that r,g,b are close to each other (not colored white-ish but still)
        if (r > 240 && g > 240 && b > 240) {
          // distance from white
          const dist = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2)
          if (dist < 30) {
            data[i + 3] = 0
          } else {
            // semi transparent for edge
            const alpha = Math.min(255, dist * 8)
            data[i + 3] = alpha
          }
        }
      }
      ctx.putImageData(imageData, 0, 0)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url)
        if (blob) resolve(blob)
        else resolve(file as Blob)
      }, "image/png", 1.0)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file as Blob)
    }
    img.src = url
  })
}

export function ImageUploadGrid({ label, value, onChange, folder = "general", bucket = "media", description, logoMode = false, accept = "image/*" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [bgMode, setBgMode] = useState<"with" | "without">("without") // default transparent untuk logo
  const { toast } = useToast()

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith("image/")) {
      toast({ title: "File harus gambar", variant: "error" })
      return
    }
    setUploading(true)
    try {
      let blob: Blob = file
      // Jika logoMode dan tanpa latar belakang, proses hapus background putih
      if (logoMode && bgMode === "without") {
        // if file is already png with transparency, try to keep but also run removal for white bg jpg
        blob = await removeWhiteBackground(file)
      }
      const supabase = createBrowserSupabase()
      const ext = file.name.split(".").pop() || (bgMode === "without" ? "png" : "jpg")
      const finalExt = logoMode && bgMode === "without" ? "png" : ext
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${finalExt}`
      const { error } = await supabase.storage.from(bucket).upload(path, blob, { contentType: blob.type || file.type })
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      onChange(data.publicUrl)
      toast({ title: "Gambar berhasil diunggah", variant: "success" })
    } catch (e: any) {
      toast({ title: "Gagal unggah", description: e.message, variant: "error" })
    } finally {
      setUploading(false)
    }
  }, [folder, logoMode, bgMode, onChange, toast])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-bold">{label} {logoMode && <span className="font-normal text-muted-foreground">(asli, tidak di-crop)</span>}</label>}
      {logoMode && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBgMode("with")}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-bold border transition-colors ${bgMode === "with" ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-muted"}`}
          >
            Dengan Latar Belakang
          </button>
          <button
            type="button"
            onClick={() => setBgMode("without")}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-bold border transition-colors ${bgMode === "without" ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-muted"}`}
          >
            Tanpa Latar Belakang
          </button>
        </div>
      )}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative grid place-items-center rounded-xl border-2 border-dashed bg-transparent cursor-pointer transition-colors overflow-hidden
          ${dragOver ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-border hover:border-[var(--primary)]/50 hover:bg-muted/20"}
          ${value ? "h-auto min-h-[160px] p-2" : "h-[160px]"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Mengunggah...</span>
          </div>
        ) : value ? (
          <div className="relative w-full">
            <div className="relative w-full min-h-[140px] grid place-items-center bg-transparent">
              {/* checkerboard for transparent preview when without background */}
              {logoMode && bgMode === "without" && (
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`, backgroundSize: `16px 16px`, backgroundPosition: `0 0, 0 8px, 8px -8px, -8px 0px` }} />
              )}
              <img src={value} alt="preview" className="relative max-h-[160px] max-w-full object-contain bg-transparent" />
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mt-2 text-center text-[11px] text-muted-foreground">Klik atau drag & drop untuk ganti • {logoMode && bgMode === "without" ? "Transparan (tanpa latar)" : logoMode ? "Dengan latar" : "Gambar asli"}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-center px-4">
            <div className="h-10 w-10 rounded-full bg-muted grid place-items-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-xs font-bold">Drag & drop gambar di sini</div>
            <div className="text-[11px] text-muted-foreground">atau klik grid untuk upload</div>
            {description && <div className="text-[11px] text-muted-foreground">{description}</div>}
            {logoMode && <div className="text-[10px] text-muted-foreground">Logo akan tampil asli (shield) tanpa di-crop lingkaran • Background transparan jika pilih tanpa latar</div>}
          </div>
        )}
      </div>
      {logoMode && bgMode === "without" && value && (
        <p className="text-[11px] text-emerald-600">✓ Tanpa latar belakang — background hitam halaman akan tembus, logo asli terlihat jelas</p>
      )}
    </div>
  )
}
