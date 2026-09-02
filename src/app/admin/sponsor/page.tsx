"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"
import { ImageCropDialog } from "@/components/ui/image-crop-dialog"

export default function Page(){
  const { toast } = useToast()
  const [list,setList]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [editing,setEditing]=useState<any|null>(null)
  const [delTarget,setDelTarget]=useState<any|null>(null)
  const [selected,setSelected]=useState<Set<string>>(new Set())
  const [saving,setSaving]=useState(false)
  const [form,setForm]=useState<any>({ name:"", tier:"Mitra Resmi", logo_url:"", url:"", display_order:1, active:"true" })
  const [uploading,setUploading]=useState<string|null>(null)
  const [cropSrc,setCropSrc]=useState("")
  const [cropOpen,setCropOpen]=useState(false)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0]
    if(!file) return
    setCropSrc(URL.createObjectURL(file))
    setCropOpen(true)
    e.target.value=""
  }
  const handleCropped = async (blob: Blob)=>{
    setUploading("logo_url")
    try{
      const supabase = createBrowserSupabase()
      const path = `sponsor/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error } = await supabase.storage.from("media").upload(path, blob)
      if(error) throw error
      const { data } = supabase.storage.from("media").getPublicUrl(path)
      setForm((prev:any)=> ({ ...prev, logo_url: data.publicUrl }))
      toast({ title:"Logo berhasil diunggah", variant:"success"})
    } catch(e:any){
      toast({ title:"Gagal unggah", description:e.message, variant:"error"})
    } finally{ setUploading(null); setCropSrc("") }
  }
  const load = ()=>{ const s=createBrowserSupabase(); s.from("sponsors").select("*").order("display_order").then(({data})=> setList(data||[])) }
  useEffect(()=>{ load() },[])
  const toggleSelect = (id:string)=>{ const n=new Set(selected); if(n.has(id)) n.delete(id); else n.add(id); setSelected(n) }
  const toggleAll = ()=>{ if(selected.size===list.length) setSelected(new Set()); else setSelected(new Set(list.map((i:any)=>i.id))) }
  const handleBulkDelete = async ()=>{ if(selected.size===0) return; for(const id of selected){ await fetch(`/api/admin/crud?table=sponsors&id=${id}`, { method:"DELETE" }) } ; toast({ title: `${selected.size} data dihapus`, variant:"success"}); setSelected(new Set()); load() }
  const openAdd = ()=>{ setEditing(null); setForm({ name:"", tier:"Mitra Resmi", logo_url:"", url:"", display_order:1, active:"true" }); setOpen(true) }
  const openEdit = (item:any)=>{ setEditing(item); setForm({ name: item.name ?? "", tier: item.tier==="Official Partner" ? "Mitra Resmi" : item.tier==="Main Sponsor" ? "Sponsor Utama" : item.tier==="Supporting Partner" ? "Mitra Pendukung" : item.tier==="Media Partner" ? "Mitra Media" : item.tier ?? "Mitra Resmi", logo_url: item.logo_url ?? "", url: item.url ?? "", display_order: item.display_order ?? 1, active: String(item.active ?? true) }); setOpen(true) }
  const handleSave = async ()=>{ if(saving) return; setSaving(true);
    const payload:any = { ...form, display_order: parseInt(form.display_order)||1, active: form.active==="true", tier: form.tier==="Mitra Resmi" ? "Official Partner" : form.tier==="Sponsor Utama" ? "Main Sponsor" : form.tier==="Mitra Pendukung" ? "Supporting Partner" : form.tier==="Mitra Media" ? "Media Partner" : form.tier };
    if(!payload.title && !payload.name && !payload.question) { toast({ title:"Lengkapi data", variant:"error" }); return }
    try{
      let res
      if(editing) res = await fetch("/api/admin/crud", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"sponsors", id: editing.id, data: payload }) })
      else res = await fetch("/api/admin/crud", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"sponsors", data: payload }) })
      const j = await res.json()
      if(!res.ok) throw new Error(j.error)
      toast({ title: editing ? "Diperbarui" : "Ditambahkan", variant:"success" })
      setOpen(false); load()
    } catch(e:any){ toast({ title:"Gagal", description:e.message, variant:"error" }) } finally { setSaving(false) }
  }
  const handleDelete = async ()=>{
    if(!delTarget) return
    const res = await fetch(`/api/admin/crud?table=sponsors&id=${delTarget.id}`, { method:"DELETE" })
    if(res.ok){ toast({ title:"Dihapus", variant:"success" }); load() } else { const j=await res.json(); toast({ title:"Gagal hapus", description:j.error, variant:"error" }) }
    setDelTarget(null)
  }
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-[18px] font-black">Sponsor</h1><p className="text-sm text-muted-foreground">{list.length} data tersimpan</p></div><div className="flex gap-2">{selected.size>0 && <Button variant="outline" size="sm" className="rounded-full text-red-600" onClick={handleBulkDelete}>Hapus {selected.size} dipilih</Button>}<Button size="sm" className="rounded-full" onClick={openAdd}>Tambah Baru</Button></div></div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <div className="grid gap-3">
          {list.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada data.</div> :
            list.map((item:any)=> (
            <div key={item.id} className="flex items-center gap-2 rounded-xl border border-border p-3">
              <input type="checkbox" checked={selected.has(item.id)} onChange={()=> toggleSelect(item.id)} />
              <div className="flex flex-1 items-center justify-between gap-3">
              <div className="min-w-0 flex-1"><div className="text-sm font-bold truncate">{item.title || item.name || item.question}</div><div className="text-xs text-muted-foreground truncate">{item.category || item.role || item.tier || ""} • {new Date(item.created_at).toLocaleDateString("id-ID")}</div></div>
              <div className="flex gap-1.5 shrink-0"><Button variant="outline" size="sm" className="rounded-full h-7 text-xs" onClick={()=> openEdit(item)}>Ubah</Button><Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600" onClick={()=> setDelTarget(item)}>Hapus</Button></div>
              </div>
            </div>
          ))}
        </div>
        {list.length>0 && (
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selected.size===list.length && list.length>0} onChange={toggleAll} /> Pilih semua ({list.length})</label>
            {selected.size>0 && <span className="text-xs font-bold">{selected.size} dipilih</span>}
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Ubah Sponsor" : "Tambah Sponsor"}</DialogTitle><DialogDescription>Isi semua kolom yang wajib.</DialogDescription></DialogHeader>
          <div className="grid gap-3">
            <div><label className="text-xs font-bold">Nama Sponsor *</label><Input value={form.name} onChange={e=> setForm({...form, name:e.target.value})} placeholder="Tulis nama sponsor" /></div>
            <div><label className="text-xs font-bold">Tingkatan Sponsor</label><Select value={String(form.tier)} onValueChange={v=> setForm({...form, tier:v})} options={[{value:"Main Sponsor",label:"Sponsor Utama"},{value:"Official Partner",label:"Mitra Resmi"},{value:"Supporting Partner",label:"Mitra Pendukung"},{value:"Media Partner",label:"Mitra Media"}]} /></div>
            <div>
              <label className="text-xs font-bold">Logo Sponsor</label>
              {form.logo_url ? (
                <img src={form.logo_url} alt="Preview" className="mt-2 h-32 w-full object-contain rounded-xl border bg-white" />
              ) : (
                <div className="mt-2 h-32 grid place-items-center rounded-xl border border-dashed bg-muted text-xs text-muted-foreground">Belum ada logo</div>
              )}
              <div className="mt-2">
                <Input type="file" accept="image/*" onChange={handleFileSelect} />
                {uploading==="logo_url" && <span className="text-xs py-1 text-muted-foreground">Mengunggah...</span>}
                <p className="text-[11px] text-muted-foreground mt-1">Pilih logo, lalu sesuaikan potongan rasio bebas. Pratinjau langsung tampil.</p>
              </div>
            </div>
            <div><label className="text-xs font-bold">Alamat Website</label><Input value={form.url} onChange={e=> setForm({...form, url:e.target.value})} placeholder="https://..." /></div>
            <div><label className="text-xs font-bold">Urutan Tampil</label><Input type="number" value={form.display_order} onChange={e=> setForm({...form, display_order: parseInt(e.target.value)||0})} placeholder="1" /></div>
            <div><label className="text-xs font-bold">Tampilkan di Website?</label><Select value={String(form.active)} onValueChange={v=> setForm({...form, active:v})} options={[{value:"true",label:"Ya, tampilkan"},{value:"false",label:"Sembunyikan"}]} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=> setOpen(false)} disabled={saving}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? "Memproses..." : editing ? "Simpan" : "Tambah"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!delTarget} onOpenChange={(o:any)=> !o && setDelTarget(null)} title="Hapus data?" description={`Yakin hapus ${delTarget?.title || delTarget?.name || ""}?`} onConfirm={handleDelete} />
      <ImageCropDialog open={cropOpen} onOpenChange={setCropOpen} src={cropSrc} onCropped={handleCropped} />
    </div>
  )
}
