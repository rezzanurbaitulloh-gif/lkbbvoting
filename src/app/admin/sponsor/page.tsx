"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
export default function Page(){
  const [list,setList]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("sponsors").select("*").order("display_order").then(({data})=> setList(data||[])) },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-[18px] font-black">Sponsor</h1><p className="text-sm text-muted-foreground">{list.length} sponsor dari DB</p></div><Button size="sm" className="rounded-full">Tambah Baru</Button></div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <div className="grid gap-2">
          {list.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada sponsor.</div> :
            list.map((s:any)=> (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div><div className="text-sm font-bold">{s.name}</div><div className="text-xs text-muted-foreground">{s.tier} • {s.active ? "Aktif":"Nonaktif"}</div></div>
              <div className="flex gap-1.5"><Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Edit</Button><Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600">Hapus</Button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
