"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
export default function Page(){
  const [list,setList]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("peletons").select("id,name,image_url,number").eq("active", true).order("display_order").then(({data})=> setList(data||[])) },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-[18px] font-black">Galeri</h1><p className="text-sm text-muted-foreground">Galeri peleton — foto tim (DB) • {list.length} peleton</p></div><Button size="sm" className="rounded-full">Upload</Button></div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {list.map((p:any)=> (
            <div key={p.id} className="rounded-xl overflow-hidden border border-border">
              <img src={p.image_url} alt={p.name} className="aspect-[4/3] w-full object-cover"/>
              <div className="p-2"><div className="text-xs font-bold truncate">#{p.number} {p.name}</div></div>
            </div>
          ))}
        </div>
        {list.length===0 && <div className="p-8 text-center text-sm text-muted-foreground">Belum ada galeri.</div>}
      </div>
    </div>
  )
}
