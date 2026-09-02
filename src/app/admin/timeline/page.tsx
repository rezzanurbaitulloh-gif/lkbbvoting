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
  const [selected,setSelected]=useState<Set<string>>(new Set())
  const [saving,setSaving]=useState(false)
  const [form,setForm]=useState<any>({ title:"", date:"", description:"", status:"upcoming", sort_order:1 })
  const load = ()=>{ const s=createBrowserSupabase(); s.from("timeline_stages").select("*").order("sort_order").then(({data})=> setList(data||[])) }
  useEffect(()=>{ load() },[])
  const toggleSelect = (id:string)=>{ const n=new Set(selected); if(n.has(id)) n.delete(id); else n.add(id); setSelected(n) }
  const toggleAll = ()=>{ if(selected.size===list.length) setSelected(new Set()); else setSelected(new Set(list.map((i:any)=>i.id))) }
  const handleBulkDelete = async ()=>{ if(selected.size===0) return; for(const id of selected){ await fetch(`/api/admin/crud?table=timeline_stages&id=${id}`, { method:"DELETE" }) } ; toast({ title: `${selected.size} data dihapus`, variant:"success"}); setSelected(new Set()); load() }
  const openAdd = ()=>{ setEditing(null); setForm({ title:"", date:"", description:"", status:"upcoming", sort_order:1 }); setOpen(true) }
  const openEdit = (item:any)=>{ setEditing(item); setForm({ title: item.title ?? "", date: item.date ?? "", description: item.description ?? "", status: item.status ?? "upcoming", sort_order: item.sort_order ?? 1 }); setOpen(true) }
  const handleSave = async ()=>{ if(saving) return; setSaving(true);
    const payload:any = { ...form, sort_order: parseInt(form.sort_order)||1 };
    if(!payload.title && !payload.name && !payload.question) { toast({ title:"Lengkapi data", variant:"error" }); return }
    try{
      let res
      if(editing) res = await fetch("/api/admin/crud", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"timeline_stages", id: editing.id, data: payload }) })
      else res = await fetch("/api/admin/crud", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"timeline_stages", data: payload }) })
      const j = await res.json()
      if(!res.ok) throw new Error(j.error)
      toast({ title: editing ? "Diperbarui" : "Ditambahkan", variant:"success" })
      setOpen(false); load()
    } catch(e:any){ toast({ title:"Gagal", description:e.message, variant:"error" }) } finally { setSaving(false) }
  }
  const handleDelete = async ()=>{
    if(!delTarget) return
    const res = await fetch(`/api/admin/crud?table=timeline_stages&id=${delTarget.id}`, { method:"DELETE" })
    if(res.ok){ toast({ title:"Dihapus", variant:"success" }); load() } else { const j=await res.json(); toast({ title:"Gagal hapus", description:j.error, variant:"error" }) }
    setDelTarget(null)
  }
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-[18px] font-black">Jadwal Acara</h1><p className="text-sm text-muted-foreground">{list.length} data tersimpan</p></div><div className="flex gap-2">{selected.size>0 && <Button variant="outline" size="sm" className="rounded-full text-red-600" onClick={handleBulkDelete}>Hapus {selected.size} dipilih</Button>}<Button size="sm" className="rounded-full" onClick={openAdd}>Tambah Baru</Button></div></div>
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
          <DialogHeader><DialogTitle>{editing ? "Ubah Jadwal Acara" : "Tambah Jadwal Acara"}</DialogTitle><DialogDescription>Isi semua kolom yang wajib.</DialogDescription></DialogHeader>
          <div className="grid gap-3">
            <div><label className="text-xs font-bold">Nama Tahapan *</label><Input value={form.title} onChange={e=> setForm({...form, title:e.target.value})} placeholder="Contoh: Pendaftaran" /></div>
            <div><label className="text-xs font-bold">Tanggal Pelaksanaan</label><Input value={form.date} onChange={e=> setForm({...form, date:e.target.value})} placeholder="Contoh: Oktober 2026" /></div>
            <div><label className="text-xs font-bold">Keterangan</label><textarea value={form.description} onChange={e=> setForm({...form, description:e.target.value})} placeholder="Jelaskan tahapan ini" className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2 text-sm" /></div>
            <div><label className="text-xs font-bold">Status Tahapan</label><Select value={String(form.status)} onValueChange={v=> setForm({...form, status:v})} options={[{value:"completed",label:"Sudah Selesai"},{value:"current",label:"Sedang Berlangsung"},{value:"upcoming",label:"Akan Datang"}]} /></div>
            <div><label className="text-xs font-bold">Urutan Tampil</label><Input type="number" value={form.sort_order} onChange={e=> setForm({...form, sort_order: parseInt(e.target.value)||0})} placeholder="1" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=> setOpen(false)} disabled={saving}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? "Memproses..." : editing ? "Simpan" : "Tambah"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!delTarget} onOpenChange={(o:any)=> !o && setDelTarget(null)} title="Hapus data?" description={`Yakin hapus ${delTarget?.title || delTarget?.name || ""}?`} onConfirm={handleDelete} />
    </div>
  )
}
