"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
import { Podium } from "@/components/competition/Podium"
export default function AdminKlasemen(){
  const [smp,setSmp]=useState<any[]>([])
  const [sma,setSma]=useState<any[]>([])
  const load = async ()=>{
    const s=createBrowserSupabase()
    const { data: smpData } = await s.from("team_ranking").select("*").eq("category","SMP").order("total_ballots",{ascending:false})
    const { data: smaData } = await s.from("team_ranking").select("*").eq("category","SMA").order("total_ballots",{ascending:false})
    if(smpData) setSmp(smpData)
    if(smaData) setSma(smaData)
  }
  useEffect(()=>{ load(); const i=setInterval(load,4000); const sup=createBrowserSupabase(); const ch=sup.channel("klasemen-podium").on("postgres_changes",{event:"*",schema:"public",table:"supports"},()=> load()).subscribe(); return ()=>{ clearInterval(i); sup.removeChannel(ch) } },[])
  const Section = ({title, list}:{title:string, list:any[]})=> (
    <div className="rounded-[16px] border border-border bg-card p-4">
      <h3 className="text-sm font-black">{title}</h3>
      
      <div className="mt-3 space-y-1">
        {list.length===0 ? <div className="p-6 text-center text-sm text-muted-foreground">Belum ada ranking.</div> :
          list.map((p,i)=> (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
            <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-black ${i===0 ? "bg-[#C9A86A] text-[#0B0C0F]" : i===1 ? "bg-zinc-300 text-black" : i===2 ? "bg-amber-700 text-white" : "bg-muted"}`}>{i+1}</div>
            <img src={p.image_url || p.image} alt="" className="h-8 w-8 rounded-full object-cover border"/>
            <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate">#{p.number} {p.name}</div><div className="text-xs text-muted-foreground truncate">{p.school} • {p.city} • {p.total_ballots?.toLocaleString("id-ID")} ballot</div></div>
            <div className="text-xs font-bold tabular-nums">#{p.number}</div>
          </div>
        ))}
      </div>
    </div>
  )
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-black">Klasemen — Admin</h1>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
      </div>

      {/* Podium realtime 2 kategori */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-[16px] border border-[#C9A86A]/20 bg-card p-4">
          <h3 className="text-xs font-black tracking-wide flex items-center gap-1.5">🏆 PODIUM SMP <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /></h3>
          <div className="mt-3">
            {smp.length===0 ? <div className="h-[200px] grid place-items-center text-sm text-muted-foreground">Belum ada data</div> : <div className="scale-[0.9] origin-top"><Podium teams={smp.slice(0,3)} /></div>}
          </div>
        </div>
        <div className="rounded-[16px] border border-[#C9A86A]/20 bg-card p-4">
          <h3 className="text-xs font-black tracking-wide flex items-center gap-1.5">🏆 PODIUM SMA <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /></h3>
          <div className="mt-3">
            {sma.length===0 ? <div className="h-[200px] grid place-items-center text-sm text-muted-foreground">Belum ada data</div> : <div className="scale-[0.9] origin-top"><Podium teams={sma.slice(0,3)} /></div>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="SMP / Sederajat" list={smp} />
        <Section title="SMA / Sederajat" list={sma} />
      </div>
    </div>
  )
}
