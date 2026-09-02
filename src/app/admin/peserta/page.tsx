"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
export default function Peserta(){
  const { toast } = useToast()
  const [list,setList]=useState<any[]>([])
  const [selected,setSelected]=useState<Set<string>>(new Set())
  const load = ()=>{ const s=createBrowserSupabase(); s.from("profiles").select("*").eq("role","USER").order("created_at",{ascending:false}).limit(50).then(({data})=> setList(data||[])) }
  useEffect(()=>{ load() },[])
  const toggleSelect = (id:string)=>{ const n=new Set(selected); if(n.has(id)) n.delete(id); else n.add(id); setSelected(n) }
  const toggleAll = ()=>{ if(selected.size===list.length) setSelected(new Set()); else setSelected(new Set(list.map((p:any)=>p.id))) }
  const handleBulkDelete = async ()=>{ if(selected.size===0) return; for(const id of selected){ await fetch(`/api/admin/crud?table=profiles&id=${id}`, { method:"DELETE" }) } toast({ title:`${selected.size} peserta dihapus`, variant:"success"}); setSelected(new Set()); load() }
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-[18px] font-black">Daftar Peserta</h1><p className="text-xs text-muted-foreground">{list.length} peserta — hanya User Biasa</p></div>{selected.size>0 && <Button variant="outline" size="sm" className="rounded-full text-red-600" onClick={handleBulkDelete}>Hapus {selected.size} dipilih</Button>}</div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[560px] grid grid-cols-[40px_1.4fr_1.2fr_110px_90px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div><input type="checkbox" checked={selected.size===list.length && list.length>0} onChange={toggleAll} /></div><div>NAMA LENGKAP</div><div>ALAMAT EMAIL</div><div>PERAN</div><div>AKSI</div>
          </div>
          {list.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada peserta.</div> :
            list.map((p:any)=> (
            <div key={p.id} className="min-w-[560px] grid grid-cols-[40px_1.4fr_1.2fr_110px_90px] gap-2 px-4 py-3 items-center border-b border-border/50 text-sm">
              <div><input type="checkbox" checked={selected.has(p.id)} onChange={()=> toggleSelect(p.id)} /></div>
              <div className="font-bold truncate">{p.public_name || "-"}</div>
              <div className="text-xs text-muted-foreground truncate">{p.email}</div>
              <div><span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">User Biasa</span></div>
              <div><Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600" onClick={async()=>{ await fetch(`/api/admin/crud?table=profiles&id=${p.id}`, {method:"DELETE"}); toast({title:"Dihapus", variant:"success"}); load() }}>Hapus</Button></div>
            </div>
          ))}
        </div>
        {/* Mobile */}
        <div className="md:hidden space-y-2 p-3">
          {list.length===0 ? <div className="p-6 text-center text-sm text-muted-foreground">Belum ada peserta.</div> :
            list.map((p:any)=> (
            <div key={p.id} className="rounded-xl border border-border p-3 flex gap-3">
              <input type="checkbox" className="mt-1" checked={selected.has(p.id)} onChange={()=> toggleSelect(p.id)} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{p.public_name || "-"}</div>
                <div className="text-xs text-muted-foreground truncate">{p.email}</div>
                <div className="mt-1"><span className="rounded-full bg-secondary px-2 py-1 text-[11px] font-bold">User Biasa</span></div>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600 shrink-0" onClick={async()=>{ await fetch(`/api/admin/crud?table=profiles&id=${p.id}`, {method:"DELETE"}); toast({title:"Dihapus", variant:"success"}); load() }}>Hapus</Button>
            </div>
          ))}
        </div>
        {list.length>0 && (
          <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selected.size===list.length && list.length>0} onChange={toggleAll} /> Pilih semua ({list.length})</label>
            {selected.size>0 && <span className="text-xs font-bold">{selected.size} dipilih</span>}
          </div>
        )}
      </div>
    </div>
  )
}
