"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createBrowserSupabase } from "@/lib/supabase"

export default function AdminPeleton(){
  const [teams, setTeams] = useState<any[]>([])
  useEffect(()=>{
    const supabase = createBrowserSupabase()
    supabase.from("peletons").select("*").order("display_order", {ascending:true}).then(({data})=> setTeams(data||[]))
  },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-black">Manajemen Peleton — 7 Field</h1>
          <p className="text-xs text-muted-foreground">Hanya: nomor, nama, kategori, foto, logo, urutan, aktif — spec §7</p>
        </div>
        <Button size="sm" className="rounded-full">Tambah Peleton</Button>
      </div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_80px_60px_80px_100px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
          <div>NO</div><div>PELETON</div><div>KAT</div><div>URUTAN</div><div>AKTIF</div><div className="text-right">AKSI</div>
        </div>
        {teams.map(p=> (
          <div key={p.id} className="grid md:grid-cols-[60px_1fr_80px_60px_80px_100px] gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0">
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
              <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs">Edit</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">Admin tidak perlu upload anggota/galeri — sudah dihapus per spec §8. Cukup foto + logo.</div>
    </div>
  )
}
