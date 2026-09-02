"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/toast"
import { Layers, Eye, EyeOff, Image as ImgIcon, Settings, Trash2, ExternalLink } from "lucide-react"

export default function CmsPages(){
  const { toast } = useToast()
  const [pages, setPages] = useState<any[]>([])
  const [open, setOpen]=useState(false)
  const [editing, setEditing]=useState<any|null>(null)
  const [delTarget, setDelTarget]=useState<any|null>(null)
  const [saving, setSaving]=useState(false)
  const [form, setForm]=useState<any>({ slug:"", title:"", description:"", is_published:true, seo_title:"", seo_description:"", sort_order:0 })

  const load = async ()=>{
    const res = await fetch("/api/admin/cms/pages")
    const j = await res.json()
    if(res.ok) setPages(j.pages||[])
  }
  useEffect(()=>{ load() },[])

  const openAdd = ()=>{
    setEditing(null)
    setForm({ slug:"", title:"", description:"", is_published:true, seo_title:"", seo_description:"", sort_order: pages.length+1 })
    setOpen(true)
  }
  const openEdit = (p:any)=>{
    setEditing(p)
    setForm({ slug:p.slug, title:p.title, description:p.description||"", is_published: p.is_published, seo_title: p.seo_title||"", seo_description: p.seo_description||"", sort_order: p.sort_order })
    setOpen(true)
  }
  const handleSave = async ()=>{
    if(saving) return
    setSaving(true)
    try{
      if(!form.slug || !form.title) throw new Error("Slug & judul wajib")
      const payload:any = { ...form, sort_order: parseInt(form.sort_order)||0, is_published: !!form.is_published }
      let res
      if(editing){
        res = await fetch("/api/admin/cms/pages",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: editing.id, ...payload }) })
      } else {
        res = await fetch("/api/admin/cms/pages",{ method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) })
      }
      const j = await res.json()
      if(!res.ok) throw new Error(j.error)
      toast({ title: editing ? "Halaman diperbarui" : "Halaman dibuat", variant:"success" })
      setOpen(false); load()
    } catch(e:any){ toast({ title:"Gagal", description:e.message, variant:"error" }) }
    finally{ setSaving(false) }
  }
  const handleDelete = async ()=>{
    if(!delTarget) return
    const res = await fetch(`/api/admin/cms/pages?id=${delTarget.id}`,{ method:"DELETE" })
    if(res.ok){ toast({ title:"Dihapus", variant:"success" }); load() } else { const j=await res.json(); toast({ title:"Gagal", description:j.error, variant:"error" }) }
    setDelTarget(null)
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-black flex items-center gap-2"><Layers className="h-5 w-5" /> Konten Dinamis — Halaman</h1>
          <p className="text-xs text-muted-foreground">Kelola semua halaman tanpa edit kode. Tambah halaman baru, atur urutan, dan kelola section di dalamnya. {pages.length} halaman</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/media"><Button variant="outline" size="sm" className="rounded-full gap-1.5"><ImgIcon className="h-4 w-4"/> Media</Button></Link>
          <Link href="/admin/settings"><Button variant="outline" size="sm" className="rounded-full gap-1.5"><Settings className="h-4 w-4"/> Pengaturan</Button></Link>
          <Button size="sm" className="rounded-full" onClick={openAdd}>Tambah Halaman</Button>
        </div>
      </div>

      <div className="rounded-[12px] border border-amber-500/20 bg-amber-500/10 p-3 text-xs">Semua perubahan tersimpan di database (cms_pages & cms_sections). Halaman sistem (Beranda, Tim) tidak boleh dihapus slug-nya. Gunakan section builder untuk ubah teks, gambar, banner, struktur halaman.</div>

      <div className="grid gap-3">
        {pages.map(p=> (
          <div key={p.id} className="rounded-[16px] border border-border bg-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-foreground text-background px-2.5 py-1 text-[11px] font-black">/{p.slug}</span>
                {p.is_system && <span className="rounded-full bg-amber-500 text-white px-2 py-0.5 text-[11px] font-bold">Sistem</span>}
                {p.is_published ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[11px] font-bold"><Eye className="h-3 w-3"/> Publish</span> : <span className="inline-flex items-center gap-1 rounded-full bg-zinc-400 text-white px-2 py-0.5 text-[11px] font-bold"><EyeOff className="h-3 w-3"/> Draft</span>}
                <span className="text-[11px] text-muted-foreground">#{p.sort_order} • {p.sections_count ?? 0} section</span>
              </div>
              <div className="mt-1 text-sm font-black truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground truncate">{p.description || "—"}</div>
              {p.seo_title && <div className="text-[11px] text-muted-foreground">SEO: {p.seo_title}</div>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <Link href={`/admin/cms/${p.slug}`}><Button size="sm" className="rounded-full h-8 text-xs">Kelola Konten</Button></Link>
              <Link href={p.slug==="home" ? "/" : `/${p.slug}`} target="_blank"><Button variant="outline" size="sm" className="rounded-full h-8 text-xs gap-1"><ExternalLink className="h-3.5 w-3.5"/> Lihat</Button></Link>
              <Button variant="outline" size="sm" className="rounded-full h-8 text-xs" onClick={()=> openEdit(p)}>Ubah</Button>
              {!p.is_system && <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs text-red-600" onClick={()=> setDelTarget(p)}><Trash2 className="h-3.5 w-3.5"/></Button>}
            </div>
          </div>
        ))}
        {pages.length===0 && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada halaman.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader><DialogTitle>{editing ? "Ubah Halaman" : "Tambah Halaman Baru"}</DialogTitle><DialogDescription>Slug dipakai sebagai URL (contoh: about → /about). Halaman tanpa edit kode langsung tampil.</DialogDescription></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold">Slug *</label><Input value={form.slug} onChange={e=> setForm({...form, slug:e.target.value.toLowerCase()})} placeholder="home" disabled={!!editing?.is_system} /></div>
              <div><label className="text-xs font-bold">Urutan</label><Input type="number" value={form.sort_order} onChange={e=> setForm({...form, sort_order:e.target.value})} /></div>
            </div>
            <div><label className="text-xs font-bold">Judul Halaman *</label><Input value={form.title} onChange={e=> setForm({...form, title:e.target.value})} placeholder="Beranda" /></div>
            <div><label className="text-xs font-bold">Deskripsi (opsional)</label><Input value={form.description} onChange={e=> setForm({...form, description:e.target.value})} placeholder="Kegunaan halaman ini" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-bold">SEO Title</label><Input value={form.seo_title} onChange={e=> setForm({...form, seo_title:e.target.value})} placeholder="LKBB — ..." /></div>
              <div><label className="text-xs font-bold">Publish?</label><Select value={form.is_published ? "true":"false"} onValueChange={v=> setForm({...form, is_published: v==="true"})} options={[{value:"true",label:"Ya, publish"},{value:"false",label:"Draft"}]} /></div>
            </div>
            <div><label className="text-xs font-bold">SEO Description</label><textarea value={form.seo_description} onChange={e=> setForm({...form, seo_description:e.target.value})} className="w-full min-h-[60px] rounded-xl border border-input px-3 py-2 text-sm" placeholder="Deskripsi untuk Google" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=> setOpen(false)} disabled={saving}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : editing ? "Simpan" : "Buat"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!delTarget} onOpenChange={(o)=> !o && setDelTarget(null)} title="Hapus halaman?" description={`Yakin hapus /${delTarget?.slug}? Semua section di dalamnya ikut terhapus.`} onConfirm={handleDelete} />
    </div>
  )
}
