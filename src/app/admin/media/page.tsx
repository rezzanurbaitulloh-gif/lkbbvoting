"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/toast"
import { Image as ImgIcon, Upload, Trash2, Copy, Edit3, Search } from "lucide-react"

const FOLDERS = ["all","general","hero","banner","peleton","sponsors","juri","poster","branding","gallery","other"] as const

export default function MediaManager(){
  const { toast } = useToast()
  const [media, setMedia]=useState<any[]>([])
  const [total, setTotal]=useState(0)
  const [folder, setFolder]=useState<string>("all")
  const [search, setSearch]=useState("")
  const [uploading, setUploading]=useState(false)
  const [editing, setEditing]=useState<any|null>(null)
  const [editForm, setEditForm]=useState<any>({ alt_text:"", caption:"", folder:"general", tags:"" })
  const [delTarget, setDelTarget]=useState<any|null>(null)
  const [preview, setPreview]=useState<any|null>(null)

  const load = async ()=>{
    const res = await fetch(`/api/admin/media?folder=${folder}&search=${encodeURIComponent(search)}&limit=60`)
    const j = await res.json()
    if(res.ok){ setMedia(j.media||[]); setTotal(j.total||0) }
  }
  useEffect(()=>{ load() },[folder])
  useEffect(()=>{ const t=setTimeout(load, 400); return ()=> clearTimeout(t) },[search])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const files = e.target.files
    if(!files || files.length===0) return
    setUploading(true)
    for(const file of Array.from(files)){
      const fd = new FormData()
      fd.append("file", file)
      fd.append("folder", folder==="all" ? "general" : folder)
      const res = await fetch("/api/admin/media/upload",{ method:"POST", body: fd })
      const j = await res.json()
      if(!res.ok) toast({ title:"Gagal upload", description: j.error, variant:"error" })
    }
    toast({ title:"Upload selesai", variant:"success" })
    setUploading(false)
    load()
    e.target.value=""
  }

  const openEdit = (m:any)=>{
    setEditing(m)
    setEditForm({ alt_text: m.alt_text||"", caption: m.caption||"", folder: m.folder, tags: (m.tags||[]).join(", ") })
  }
  const handleSaveEdit = async ()=>{
    if(!editing) return
    const payload = { id: editing.id, alt_text: editForm.alt_text, caption: editForm.caption, folder: editForm.folder, tags: editForm.tags.split(",").map((s:string)=> s.trim()).filter(Boolean) }
    const res = await fetch("/api/admin/media",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) })
    if(res.ok){ toast({ title:"Media diperbarui", variant:"success" }); setEditing(null); load() } else { const j=await res.json(); toast({ title:"Gagal", description:j.error, variant:"error" }) }
  }
  const handleDelete = async ()=>{
    if(!delTarget) return
    const res = await fetch(`/api/admin/media?id=${delTarget.id}`,{ method:"DELETE" })
    if(res.ok){ toast({ title:"Dihapus", variant:"success" }); load() } else { const j=await res.json(); toast({ title:"Gagal", description:j.error, variant:"error" }) }
    setDelTarget(null)
  }
  const copyUrl = (url:string)=>{
    navigator.clipboard.writeText(url)
    toast({ title:"URL disalin", description: url.slice(0,60), variant:"success" })
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-black flex items-center gap-2"><ImgIcon className="h-5 w-5"/> Media Manager</h1>
          <p className="text-xs text-muted-foreground">CRUD & kelola semua aset: upload, ganti, hapus gambar/banner. Terhubung ke storage bucket. {total} file</p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-bold cursor-pointer hover:opacity-90">
          <Upload className="h-4 w-4"/> {uploading ? "Mengunggah..." : "Upload Media"}
          <input type="file" accept="image/*,video/*,application/pdf" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama file..." value={search} onChange={e=> setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={folder} onValueChange={setFolder} options={FOLDERS.map(f=> ({value:f, label: f==="all" ? "Semua Folder" : f}))} />
        <Button variant="outline" size="sm" className="rounded-full" onClick={load}>Refresh</Button>
      </div>

      <div className="rounded-[12px] border border-border bg-card overflow-hidden">
        {media.length===0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-2xl border border-dashed grid place-items-center text-muted-foreground">🖼️</div>
            <div className="mt-3 text-sm font-bold">Belum ada media di {folder}</div>
            <div className="text-xs text-muted-foreground">Upload gambar/banner pertama untuk dipakai di CMS tanpa edit kode.</div>
            <label className="mt-4 inline-flex rounded-full bg-foreground text-background px-5 py-2 text-xs font-bold cursor-pointer">
              Pilih File
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-3">
            {media.map(m=> (
              <div key={m.id} className="group rounded-xl border border-border overflow-hidden bg-card hover:border-foreground/30 transition-colors">
                <button onClick={()=> setPreview(m)} className="block w-full aspect-[4/3] bg-muted overflow-hidden text-left">
                  <img src={m.url} alt={m.alt_text||""} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform" />
                </button>
                <div className="p-2.5 space-y-1">
                  <div className="text-xs font-bold truncate" title={m.original_name}>{m.original_name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 font-bold">{m.folder}</span>
                    <span>{(m.size/1024).toFixed(0)} KB</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">{m.alt_text || "— tanpa alt —"}</div>
                  <div className="flex gap-1 pt-1">
                    <Button variant="outline" size="sm" className="h-7 flex-1 rounded-full text-xs gap-1" onClick={()=> copyUrl(m.url)}><Copy className="h-3 w-3"/> Salin URL</Button>
                    <Button variant="outline" size="sm" className="h-7 rounded-full text-xs" onClick={()=> openEdit(m)}><Edit3 className="h-3 w-3"/></Button>
                    <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs text-red-600" onClick={()=> setDelTarget(m)}><Trash2 className="h-3.5 w-3.5"/></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o)=> !o && setEditing(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Edit Media</DialogTitle><DialogDescription>{editing?.original_name}</DialogDescription></DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <img src={editing.url} alt="" className="h-40 w-full object-cover rounded-xl border" />
              <div className="rounded-xl bg-muted p-2 font-mono text-[11px] break-all">{editing.url}</div>
              <div><label className="text-xs font-bold">Alt Text (untuk SEO & aksesibilitas)</label><Input value={editForm.alt_text} onChange={e=> setEditForm({...editForm, alt_text:e.target.value})} placeholder="Deskripsi gambar" /></div>
              <div><label className="text-xs font-bold">Caption</label><Input value={editForm.caption} onChange={e=> setEditForm({...editForm, caption:e.target.value})} placeholder="Keterangan opsional" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold">Folder</label><Select value={editForm.folder} onValueChange={v=> setEditForm({...editForm, folder:v})} options={FOLDERS.filter(f=> f!=="all").map(f=> ({value:f,label:f}))} /></div>
                <div><label className="text-xs font-bold">Tags (pisah koma)</label><Input value={editForm.tags} onChange={e=> setEditForm({...editForm, tags:e.target.value})} placeholder="hero, banner" /></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={()=> setEditing(null)}>Batal</Button><Button onClick={handleSaveEdit}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={(o)=> !o && setPreview(null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader><DialogTitle>{preview?.original_name}</DialogTitle><DialogDescription>{preview?.folder} • {(preview?.size/1024).toFixed(1)} KB</DialogDescription></DialogHeader>
          {preview && (
            <div className="space-y-3">
              <img src={preview.url} alt="" className="w-full max-h-[420px] object-contain rounded-xl border bg-muted" />
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full flex-1" onClick={()=> copyUrl(preview.url)}>Salin URL</Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={()=> { setPreview(null); openEdit(preview) }}>Edit</Button>
              </div>
              <div className="rounded-xl bg-muted p-3 font-mono text-xs break-all">{preview.url}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delTarget} onOpenChange={(o)=> !o && setDelTarget(null)} title="Hapus media?" description={`Yakin hapus ${delTarget?.original_name}? File di storage ikut terhapus dan link yang sudah dipakai di CMS akan broken.`} onConfirm={handleDelete} />

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">Semua URL bersifat publik. Setelah upload, klik “Salin URL” lalu paste di editor section CMS (field gambar/banner). Perubahan gambar langsung tampil tanpa deploy.</div>
    </div>
  )
}
