"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"

export default function Page(){
  const { toast } = useToast()
  const [list,setList]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [editing,setEditing]=useState<any|null>(null)
  const [delTarget,setDelTarget]=useState<any|null>(null)
  const [form,setForm]=useState<any>({ name:"", role:"JURI PBB", bio:"", photo_url:"", sort_order:1 })
  const load = ()=>{ const s=createBrowserSupabase(); s.from("judges").select("*").order("sort_order").then(({data})=> setList(data||[])) }
  useEffect(()=>{ load() },[])
  const openAdd = ()=>{ setEditing(null); setForm({ name:"", role:"JURI PBB", bio:"", photo_url:"", sort_order:1 }); setOpen(true) }
  const openEdit = (item:any)=>{ setEditing(item); setForm({ name: item.name ?? "", role: item.role ?? "", bio: item.bio ?? "", photo_url: item.photo_url ?? "", sort_order: item.sort_order ?? 1 }); setOpen(true) }
  const handleSave = async ()=>{
    const payload:any = { ...form, sort_order: parseInt(form.sort_order)||1, active:true };
    if(!payload.title && !payload.name && !payload.question) { toast({ title:"Lengkapi data", variant:"error" }); return }
    try{
      let res
      if(editing) res = await fetch("/api/admin/crud", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"judges", id: editing.id, data: payload }) })
      else res = await fetch("/api/admin/crud", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"judges", data: payload }) })
      const j = await res.json()
      if(!res.ok) throw new Error(j.error)
      toast({ title: editing ? "Diperbarui" : "Ditambahkan", variant:"success" })
      setOpen(false); load()
    } catch(e:any){ toast({ title:"Gagal", description:e.message, variant:"error" }) }
  }
  const handleDelete = async ()=>{
    if(!delTarget) return
    const res = await fetch(`/api/admin/crud?table=judges&id=${delTarget.id}`, { method:"DELETE" })
    if(res.ok){ toast({ title:"Dihapus", variant:"success" }); load() } else { const j=await res.json(); toast({ title:"Gagal hapus", description:j.error, variant:"error" }) }
    setDelTarget(null)
  }
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-[18px] font-black">Juri</h1><p className="text-sm text-muted-foreground">{list.length} data dari DB</p></div><Button size="sm" className="rounded-full" onClick={openAdd}>Tambah Baru</Button></div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <div className="grid gap-2">
          {list.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada data.</div> :
            list.map((item:any)=> (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-border p-3 gap-3">
              <div className="min-w-0 flex-1"><div className="text-sm font-bold truncate">{item.title || item.name || item.question}</div><div className="text-xs text-muted-foreground truncate">{item.category || item.role || item.tier || ""} • {new Date(item.created_at).toLocaleDateString("id-ID")}</div></div>
              <div className="flex gap-1.5 shrink-0"><Button variant="outline" size="sm" className="rounded-full h-7 text-xs" onClick={()=> openEdit(item)}>Edit</Button><Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600" onClick={()=> setDelTarget(item)}>Hapus</Button></div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Juri" : "Tambah Juri"}</DialogTitle><DialogDescription>Isi semua field yang wajib.</DialogDescription></DialogHeader>
          <div className="grid gap-3">
            <div><label className="text-xs font-bold">Nama *</label><Input value={form.name} onChange={e=> setForm({...form, name:e.target.value})} placeholder="Nama juri" /></div>
            <div><label className="text-xs font-bold">Peran</label><Input value={form.role} onChange={e=> setForm({...form, role:e.target.value})} placeholder="JURI PBB" /></div>
            <div><label className="text-xs font-bold">Bio</label><textarea value={form.bio} onChange={e=> setForm({...form, bio:e.target.value})} placeholder="Bio singkat" className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-xs font-bold">Foto URL</label><Input value={form.photo_url} onChange={e=> setForm({...form, photo_url:e.target.value})} placeholder="https://..." /></div>
            <div><label className="text-xs font-bold">Urutan</label><Input type="number" value={form.sort_order} onChange={e=> setForm({...form, sort_order: parseInt(e.target.value)||0})} placeholder="1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=> setOpen(false)}>Batal</Button><Button onClick={handleSave}>{editing ? "Simpan" : "Tambah"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!delTarget} onOpenChange={(o:any)=> !o && setDelTarget(null)} title="Hapus data?" description={`Yakin hapus ${delTarget?.title || delTarget?.name || ""}?`} onConfirm={handleDelete} />
    </div>
  )
}
