"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"
import { ImageCropDialog } from "@/components/ui/image-crop-dialog"

export default function AdminPeleton(){
  const { toast } = useToast()
  const [teams, setTeams] = useState<any[]>([])
  const [filter, setFilter] = useState<"All"|"SMP"|"SMA">("All")
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any|null>(null)
  const [delTarget, setDelTarget] = useState<any|null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [uploading, setUploading] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [cropSrc, setCropSrc] = useState<string>("")
  const [cropField, setCropField] = useState<"image_url"|"logo_url"|null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [form, setForm] = useState<any>({ number:"", name:"", school:"", city:"Kertosono", province:"Jawa Timur", category:"SMA", image_url:"", logo_url:"", display_order:1, active:true })

  const load = ()=>{
    const supabase = createBrowserSupabase()
    supabase.from("peletons").select("*").order("display_order", {ascending:true}).then(({data})=> setTeams(data||[]))
  }
  useEffect(()=>{ load() },[])

  const filtered = filter==="All" ? teams : teams.filter(t=>t.category===filter)

  const toggleSelect = (id:string)=>{
    const next = new Set(selected)
    if(next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }
  const toggleAll = ()=>{
    if(selected.size===filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(t=>t.id)))
  }
  const handleBulkDelete = async ()=>{
    if(selected.size===0) return
    for(const id of selected){
      await fetch(`/api/admin/crud?table=peletons&id=${id}`, { method:"DELETE" })
    }
    toast({ title:`${selected.size} tim dihapus`, variant:"success"})
    setSelected(new Set())
    load()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "image_url"|"logo_url")=>{
    const file = e.target.files?.[0]
    if(!file) return
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    setCropField(field)
    setCropOpen(true)
    e.target.value = ""
  }
  const handleCropped = async (blob: Blob)=>{
    if(!cropField) return
    setUploading(cropField)
    try{
      const supabase = createBrowserSupabase()
      const path = `peleton/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
      const { error } = await supabase.storage.from("media").upload(path, blob)
      if(error) throw error
      const { data } = supabase.storage.from("media").getPublicUrl(path)
      setForm((prev:any)=> ({ ...prev, [cropField]: data.publicUrl }))
      toast({ title:"Gambar berhasil diunggah", variant:"success"})
    } catch(e:any){
      toast({ title:"Gagal unggah", description:e.message, variant:"error"})
    } finally{ setUploading(null); setCropSrc(""); setCropField(null) }
  }

  const openAdd = ()=>{
    setEditing(null)
    setForm({ number:"", name:"", school:"", city:"Kertosono", province:"Jawa Timur", category:"SMA", image_url:"", logo_url:"", display_order: teams.length+1, active:true })
    setOpen(true)
  }
  const openEdit = (p:any)=>{
    setEditing(p)
    setForm({ number:p.number, name:p.name, school:p.school, city:p.city, province:p.province, category:p.category, image_url:p.image_url||"", logo_url:p.logo_url||"", display_order:p.display_order, active:p.active })
    setOpen(true)
  }
  const handleSave = async ()=>{ if(saving) return; setSaving(true);
    if(!form.number || !form.name || !form.school || !form.category){
      toast({ title:"Lengkapi data", description:"Nomor, nama, sekolah, kategori wajib diisi", variant:"error" })
      return
    }
    const payload = { ...form, slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-" + form.number }
    try {
      let res
      if(editing){
        res = await fetch("/api/admin/crud", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"peletons", id: editing.id, data: payload }) })
      } else {
        res = await fetch("/api/admin/crud", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"peletons", data: payload }) })
      }
      const j = await res.json()
      if(!res.ok) throw new Error(j.error || "Gagal menyimpan")
      toast({ title: editing ? "Tim diperbarui" : "Tim ditambahkan", variant:"success" })
      setOpen(false)
      load()
    } catch(e:any){
      toast({ title:"Gagal", description:e.message, variant:"error" })
    } finally { setSaving(false) }
  }
  const handleDelete = async ()=>{
    if(!delTarget) return
    const res = await fetch(`/api/admin/crud?table=peletons&id=${delTarget.id}`, { method:"DELETE" })
    if(res.ok){ toast({ title:"Dihapus", variant:"success" }); load() } else { const j=await res.json(); toast({ title:"Gagal hapus", description:j.error, variant:"error" }) }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-black">Kelola Tim Peserta</h1>
          <p className="text-xs text-muted-foreground">Tim yang ditambahkan langsung tampil — tidak perlu persetujuan lagi. {teams.length} tim total</p>
        </div>
        <div className="flex gap-2">
          {selected.size>0 && <Button variant="outline" size="sm" className="rounded-full text-red-600" onClick={handleBulkDelete}>Hapus {selected.size} dipilih</Button>}
          <Button size="sm" className="rounded-full" onClick={openAdd}>Tambah Tim</Button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {(["All","SMP","SMA"] as const).map(c=>(
          <button key={c} onClick={()=>{ setFilter(c); setSelected(new Set()) }} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold border ${filter===c ? "bg-foreground text-background border-foreground" : "bg-card border-border"}`}>{c==="All" ? "Semua" : c==="SMP" ? "SMP / Sederajat" : "SMA / Sederajat"}</button>
        ))}
      </div>

      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <div className="grid grid-cols-[40px_60px_1fr_80px_60px_80px_140px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div><input type="checkbox" checked={filtered.length>0 && selected.size===filtered.length} onChange={toggleAll} /></div><div>NO</div><div>TIM</div><div>KELOMPOK</div><div>URUTAN</div><div>TAMPIL</div><div className="text-right">AKSI</div>
          </div>
          {filtered.map(p=> (
            <div key={p.id} className="grid grid-cols-[40px_60px_1fr_80px_60px_80px_140px] gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0">
              <div><input type="checkbox" checked={selected.has(p.id)} onChange={()=> toggleSelect(p.id)} /></div>
              <div className="font-mono text-sm">#{p.number}</div>
              <div className="flex gap-3 min-w-0">
                <img src={p.image_url} alt="" className="h-9 w-9 rounded-lg object-cover border" />
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.school} • #{p.number}</div>
                </div>
              </div>
              <div className="text-xs"><Badge variant="outline">{p.category}</Badge></div>
              <div className="text-xs font-mono">#{p.display_order}</div>
              <div><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${p.active ? "bg-emerald-500 text-white" : "bg-zinc-500 text-white"}`}>{p.active ? "Tampil" : "Disembunyikan"}</span></div>
              <div className="flex justify-end gap-1.5">
                <Link href={`/admin/peleton/${p.id}`}><Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Lihat</Button></Link>
                <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs" onClick={()=> openEdit(p)}>Ubah</Button>
                <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600" onClick={()=> setDelTarget(p)}>Hapus</Button>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="p-8 text-center text-sm text-muted-foreground">Belum ada tim di kelompok ini.</div>}
        </div>
        {/* Mobile cards */}
        <div className="md:hidden space-y-2 p-3">
          {filtered.map(p=> (
            <div key={p.id} className="rounded-xl border border-border p-3 flex flex-col gap-2">
              <div className="flex gap-3">
                <input type="checkbox" className="mt-1" checked={selected.has(p.id)} onChange={()=> toggleSelect(p.id)} />
                <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover border shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold">#{p.number}</span>
                    <Badge variant="outline" className="text-[11px]">{p.category}</Badge>
                    <span className={`ml-auto inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${p.active ? "bg-emerald-500 text-white" : "bg-zinc-500 text-white"}`}>{p.active ? "Tampil" : "Sembunyi"}</span>
                  </div>
                  <div className="text-sm font-bold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.school}</div>
                  <div className="text-[11px] text-muted-foreground">Urutan #{p.display_order}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <Link href={`/admin/peleton/${p.id}`}><Button variant="outline" size="sm" className="w-full rounded-full h-7 text-xs">Lihat</Button></Link>
                <Button variant="ghost" size="sm" className="w-full rounded-full h-7 text-xs border" onClick={()=> openEdit(p)}>Ubah</Button>
                <Button variant="ghost" size="sm" className="w-full rounded-full h-7 text-xs text-red-600 border border-red-200" onClick={()=> setDelTarget(p)}>Hapus</Button>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div className="p-6 text-center text-sm text-muted-foreground">Belum ada tim di kelompok ini.</div>}
        </div>
        {filtered.length>0 && (
          <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selected.size===filtered.length && filtered.length>0} onChange={toggleAll} /> Pilih semua ({filtered.length})</label>
            {selected.size>0 && <span className="text-xs font-bold">{selected.size} dipilih</span>}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Tim" : "Tambah Tim Baru"}</DialogTitle>
            <DialogDescription>Tim akan langsung tampil di website.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div><label className="text-xs font-bold">Nomor Peserta *</label><Input value={form.number} onChange={e=> setForm({...form, number:e.target.value})} placeholder="01" /></div>
              <div><label className="text-xs font-bold">Kelompok *</label><Select value={form.category} onValueChange={v=> setForm({...form, category:v})} options={[{value:"SMP",label:"SMP / Sederajat"},{value:"SMA",label:"SMA / Sederajat"}]} /></div>
            </div>
            <div><label className="text-xs font-bold">Nama Tim *</label><Input value={form.name} onChange={e=> setForm({...form, name:e.target.value})} placeholder="SMKN 1 KERTOSONO" /></div>
            <div><label className="text-xs font-bold">Nama Sekolah *</label><Input value={form.school} onChange={e=> setForm({...form, school:e.target.value})} placeholder="SMK Negeri 1 Kertosono" /></div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div><label className="text-xs font-bold">Kota</label><Input value={form.city} onChange={e=> setForm({...form, city:e.target.value})} /></div>
              <div><label className="text-xs font-bold">Provinsi</label><Input value={form.province} onChange={e=> setForm({...form, province:e.target.value})} /></div>
            </div>
            <div>
              <label className="text-xs font-bold">Foto Tim</label>
              {form.image_url ? (
                <img src={form.image_url} alt="Preview Foto Tim" className="mt-2 h-40 w-full object-cover rounded-xl border" />
              ) : (
                <div className="mt-2 h-32 grid place-items-center rounded-xl border border-dashed bg-muted text-xs text-muted-foreground">Belum ada foto — unggah di bawah</div>
              )}
              <div className="mt-2">
                <Input type="file" accept="image/*" onChange={e=> handleFileSelect(e, "image_url")} />
                {uploading==="image_url" && <span className="text-xs py-1 text-muted-foreground">Mengunggah...</span>}
                <p className="text-[11px] text-muted-foreground mt-1">Pilih gambar, lalu sesuaikan potongan dengan rasio bebas. Pratinjau langsung tampil.</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold">Logo Sekolah</label>
              {form.logo_url ? (
                <img src={form.logo_url} alt="Preview Logo" className="mt-2 h-24 w-24 object-cover rounded-xl border" />
              ) : (
                <div className="mt-2 h-24 w-24 grid place-items-center rounded-xl border border-dashed bg-muted text-xs text-muted-foreground text-center">Belum ada logo</div>
              )}
              <div className="mt-2">
                <Input type="file" accept="image/*" onChange={e=> handleFileSelect(e, "logo_url")} />
                {uploading==="logo_url" && <span className="text-xs py-1 text-muted-foreground">Mengunggah...</span>}
                <p className="text-[11px] text-muted-foreground mt-1">Unggah logo, potong bebas.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div><label className="text-xs font-bold">Urutan Tampil</label><Input type="number" value={form.display_order} onChange={e=> setForm({...form, display_order: parseInt(e.target.value)||1})} /></div>
              <div><label className="text-xs font-bold">Tampilkan di Website?</label><Select value={form.active ? "true":"false"} onValueChange={v=> setForm({...form, active: v==="true"})} options={[{value:"true",label:"Ya, tampilkan"},{value:"false",label:"Sembunyikan"}]} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setOpen(false)} disabled={saving}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Memproses..." : editing ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delTarget} onOpenChange={(o)=> !o && setDelTarget(null)} title="Hapus tim?" description={`Yakin hapus ${delTarget?.name} (#${delTarget?.number})? Data tidak bisa dikembalikan.`} onConfirm={handleDelete} />
      <ImageCropDialog open={cropOpen} onOpenChange={setCropOpen} src={cropSrc} onCropped={handleCropped} />
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">Tim yang ditambahkan admin langsung tampil. Tidak ada proses persetujuan lagi.</div>
    </div>
  )
}
