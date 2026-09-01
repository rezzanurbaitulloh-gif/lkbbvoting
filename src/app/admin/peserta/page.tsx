"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
export default function Peserta(){
  const [list,setList]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("profiles").select("*").in("role",["PARTICIPANT","USER"]).order("created_at",{ascending:false}).limit(50).then(({data})=> setList(data||[])) },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-[18px] font-black">Manajemen Peserta</h1><Button size="sm" className="rounded-full">Tambah Peserta</Button></div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.4fr_1.2fr_120px_100px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div>NAMA</div><div>EMAIL</div><div>ROLE</div><div>AKSI</div>
          </div>
          {list.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada peserta.</div> :
            list.map((p:any)=> (
            <div key={p.id} className="grid grid-cols-[1.4fr_1.2fr_120px_100px] gap-2 px-4 py-3 items-center border-b border-border/50 text-sm">
              <div className="font-bold">{p.public_name || "-"}</div>
              <div className="text-xs text-muted-foreground">{p.email}</div>
              <div><span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">{p.role}</span></div>
              <div><Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Kelola</Button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
