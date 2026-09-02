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

export default function AdminPeleton(){
  const { toast } = useToast()
  const [teams, setTeams] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any|null>(null)
  const [delTarget, setDelTarget] = useState<any|null>(null)
  const [form, setForm] = useState<any>({ number:"", name:"", school:"", city:"Kertosono", province:"Jawa Timur", category:"SMA", image_url:"", logo_url:"", display_order:1, active:true })

  const load = ()=>{
    const supabase = createBrowserSupabase()
    supabase.from("peletons").select("*").order("display_order", {ascending:true}).then(({data})=> setTeams(data||[]))
  }
  useEffect(()=>{ load() },[])

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
  const handleSave = async ()=>{
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
      toast({ title: editing ? "Peleton diperbarui" : "Peleton ditambahkan", variant:"success" })
      setOpen(false)
      load()
    } catch(e:any){
      toast({ title:"Gagal", description:e.message, variant:"error" })
    }
  }
  const handleDelete = async ()=>{
    if(!delTarget) return
    const res = await fetch(`/api/admin/crud?table=peletons&id=${delTarget.id}`, { method:"DELETE" })
    if(res.ok){ toast({ title:"Dihapus", variant:"success" }); load() } else { const j=await res.json(); toast({ title:"Gagal hapus", description:j.error, variant:"error" }) }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-black">Manajemen Peleton</h1>
          <p className="text-xs text-muted-foreground">Data langsung terverifikasi — tanpa proses verifikasi. {teams.length} tim</p>
        </div>
        <Button size="sm" className="rounded-full" onClick={openAdd}>Tambah Peleton</Button>
      </div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_80px_60px_80px_120px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
          <div>NO</div><div>PELETON</div><div>KAT</div><div>URUTAN</div><div>AKTIF</div><div className="text-right">AKSI</div>
        </div>
        {teams.map(p=> (
          <div key={p.id} className="grid md:grid-cols-[60px_1fr_80px_60px_80px_120px] gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0">
            <div className="font-mono text-sm">#{p.number}</div>
            <div className="flex gap-3 min-w-0">
              <img src={p.image_url} alt="" className="h-9 w-9 rounded-lg object-cover border" />
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.school}</div>
              </div>
            </div>
            <div className="text-xs"><Badge variant="outline">{p.category}</Badge></div>
            <div className="text-xs font-mono">#{p.display_order}</div>
            <div><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${p.active ? "bg-emerald-500 text-white" : "bg-zinc-500 text-white"}`}>{p.active ? "AKTIF" : "NONAKTIF"}</span></div>
            <div className="flex justify-end gap-1.5">
              <Link href={`/admin/peleton/${p.id}`}><Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Lihat</Button></Link>
              <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs" onClick={()=> openEdit(p)}>Edit</Button>
              <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600" onClick={()=> setDelTarget(p)}>Hapus</Button>
            </div>
          </div>
        ))}
        {teams.length===0 && <div className="p-8 text-center text-sm text-muted-foreground">Belum ada peleton.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Peleton" : "Tambah Peleton"}</DialogTitle>
            <DialogDescription>Data akan otomatis terverifikasi. Nomor urut & aktif menentukan urutan di beranda.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold">Nomor Peserta *</label><Input value={form.number} onChange={e=> setForm({...form, number:e.target.value})} placeholder="01" /></div>
              <div><label className="text-xs font-bold">Kategori *</label><Select value={form.category} onValueChange={v=> setForm({...form, category:v})} options={[{value:"SMP",label:"SMP / Sederajat"},{value:"SMA",label:"SMA / Sederajat"}]} /></div>
            </div>
            <div><label className="text-xs font-bold">Nama Peleton *</label><Input value={form.name} onChange={e=> setForm({...form, name:e.target.value})} placeholder="SMKN 1 KERTOSONO" /></div>
            <div><label className="text-xs font-bold">Sekolah *</label><Input value={form.school} onChange={e=> setForm({...form, school:e.target.value})} placeholder="SMK Negeri 1 Kertosono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold">Kota</label><Input value={form.city} onChange={e=> setForm({...form, city:e.target.value})} /></div>
              <div><label className="text-xs font-bold">Provinsi</label><Input value={form.province} onChange={e=> setForm({...form, province:e.target.value})} /></div>
            </div>
            <div><label className="text-xs font-bold">Foto Tim (URL)</label><Input value={form.image_url} onChange={e=> setForm({...form, image_url:e.target.value})} placeholder="https://..." /></div>
            <div><label className="text-xs font-bold">Logo (URL)</label><Input value={form.logo_url} onChange={e=> setForm({...form, logo_url:e.target.value})} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold">Urutan Tampil</label><Input type="number" value={form.display_order} onChange={e=> setForm({...form, display_order: parseInt(e.target.value)||1})} /></div>
              <div><label className="text-xs font-bold">Status</label><Select value={form.active ? "true":"false"} onValueChange={v=> setForm({...form, active: v==="true"})} options={[{value:"true",label:"Aktif"},{value:"false",label:"Nonaktif"}]} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editing ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!delTarget} onOpenChange={(o)=> !o && setDelTarget(null)} title="Hapus peleton?" description={`Yakin hapus ${delTarget?.name} (#${delTarget?.number})? Data tidak bisa dikembalikan.`} onConfirm={handleDelete} />
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">Semua peleton yang ditambahkan admin otomatis terverifikasi. Tidak ada halaman verifikasi lagi.</div>
    </div>
  )
}
