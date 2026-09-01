"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"

export default function AdminDukungan(){
  const [leaders,setLeaders]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("team_ranking").select("*").order("total_ballots",{ascending:false}).limit(10).then(({data})=> setLeaders(data||[])) },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-[18px] font-black">Manajemen Dukungan</h1>
      <div className="grid md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Total Dukungan</div><div className="text-xl font-black">230.500</div><div className="text-xs text-emerald-600">+12% minggu ini</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Hari Ini</div><div className="text-xl font-black">1.420</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Minggu Ini</div><div className="text-xl font-black">8.320</div></div>
        <div className="rounded-xl border border-[#C9A86A30] bg-[#C9A86A0A] p-4"><div className="text-xs font-bold text-gold">Pemimpin</div><div className="text-sm font-black">{leaders[0].name}</div><div className="text-xs text-muted-foreground">#{leaders[0].number}</div></div>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <h3 className="text-sm font-black">Dukungan per Peleton</h3>
        <div className="mt-3 space-y-2">
          {leaders.slice(0,6).map((p,i)=> (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
              <div className="h-7 w-7 rounded-full bg-muted grid place-items-center text-xs font-black">{i+1}</div>
              <img src={p.image_url || p.image} alt="" className="h-8 w-8 rounded-full object-cover border" />
              <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate">{p.name}</div><div className="text-xs text-muted-foreground">{p.city}</div></div>
              <div className="text-right"><div className="text-xs font-bold">● Verifikasi</div><div className="text-xs text-muted-foreground">Stabil</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
