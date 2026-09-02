"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function MediaPicker({
  open, onOpenChange, onSelect, folder = "general",
}: { open: boolean; onOpenChange: (v: boolean)=>void; onSelect: (url: string)=>void; folder?: string }){
  const [media, setMedia] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)

  const load = async ()=>{
    const res = await fetch(`/api/admin/media?folder=${folder}&search=${encodeURIComponent(search)}&limit=30`)
    const j = await res.json()
    if (res.ok) setMedia(j.media || [])
  }
  useEffect(()=>{ if(open) load() },[open, search])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0]
    if(!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", folder)
    const res = await fetch("/api/admin/media/upload",{ method:"POST", body: fd })
    const j = await res.json()
    if(res.ok){ load() }
    setUploading(false)
    e.target.value=""
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] max-h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle>Pilih Media — {folder}</DialogTitle></DialogHeader>
        <div className="flex gap-2">
          <Input placeholder="Cari nama file..." value={search} onChange={e=> setSearch(e.target.value)} className="flex-1" />
          <label className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-4 py-2 text-xs font-bold cursor-pointer hover:opacity-90">
            {uploading ? "Mengunggah..." : "Upload"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto max-h-[400px] p-1">
          {media.length===0 ? <div className="col-span-full p-8 text-center text-sm text-muted-foreground">Belum ada media. Upload dulu.</div> :
            media.map(m=> (
              <button key={m.id} onClick={()=> { onSelect(m.url); onOpenChange(false) }} className="group rounded-xl border border-border overflow-hidden hover:border-foreground text-left">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img src={m.url} alt={m.alt_text||""} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform" />
                </div>
                <div className="p-2">
                  <div className="text-[11px] font-bold truncate">{m.original_name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{m.folder} • {(m.size/1024).toFixed(0)}KB</div>
                </div>
              </button>
            ))
          }
        </div>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={()=> onOpenChange(false)}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
