"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
export default function AdminKlasemen(){
  const [smp,setSmp]=useState<any[]>([])
  const [sma,setSma]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("team_ranking").select("*").eq("category","SMP").order("total_ballots",{ascending:false}).then(({data})=> setSmp(data||[])); s.from("team_ranking").select("*").eq("category","SMA").order("total_ballots",{ascending:false}).then(({data})=> setSma(data||[])) },[])
  const Section = ({title, list}:{title:string, list:any[]})=> (
    <div className="rounded-[16px] border border-border bg-card p-4">
      <h3 className="text-sm font-black">{title}</h3>
      <p className="text-xs text-muted-foreground mb-2">Diurut total ballot tertinggi • Nomor peserta tetap — poin tidak diubah manual</p>
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
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-[18px] font-black">Klasemen — Admin</h1>
      <p className="text-sm text-muted-foreground">Papan peringkat real-time dari view team_ranking (online+offline). Jangan diubah manual — hanya lewat transaksi terverifikasi.</p>
      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="SMP / Sederajat" list={smp} />
        <Section title="SMA / Sederajat" list={sma} />
      </div>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">⚠️ Ranking otomatis dari ledger supports. Urutan = total ballot tertinggi.</div>
    </div>
  )
}
