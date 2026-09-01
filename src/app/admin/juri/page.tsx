"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
export default function Page(){
  const [list,setList]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("judges").select("*").order("sort_order").then(({data})=> setList(data||[])) },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-[18px] font-black">Juri</h1><p className="text-sm text-muted-foreground">{list.length} juri dari DB</p></div><Button size="sm" className="rounded-full">Tambah Baru</Button></div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <div className="grid gap-2">
          {list.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada juri.</div> :
            list.map((j:any)=> (
            <div key={j.id} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="flex gap-3"><img src={j.photo_url} alt="" className="h-10 w-10 rounded-full object-cover border"/><div><div className="text-sm font-bold">{j.name}</div><div className="text-xs text-muted-foreground">{j.role}</div></div></div>
              <div className="flex gap-1.5"><Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Edit</Button><Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600">Hapus</Button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
