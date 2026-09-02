"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"

export default function AdminDukungan(){
  const [leaders,setLeaders]=useState<any[]>([])
  const [stats,setStats]=useState<any>({ total:0, today:0, week:0 })
  useEffect(()=>{
    const s=createBrowserSupabase()
    s.from("team_ranking").select("*").order("total_ballots",{ascending:false}).limit(10).then(({data})=> setLeaders(data||[]))
    // real stats from supports ledger
    s.from("supports").select("supports, created_at, source").then(({data})=>{
      if(!data) return
      const total = data.reduce((sum:any, r:any)=> sum + (r.supports||0), 0)
      const now = new Date()
      const todayStr = now.toISOString().slice(0,10)
      const weekAgo = new Date(now.getTime()-7*86400000)
      const today = data.filter((r:any)=> (r.created_at||"").slice(0,10)===todayStr).reduce((sum:any,r:any)=> sum+r.supports,0)
      const week = data.filter((r:any)=> new Date(r.created_at) >= weekAgo).reduce((sum:any,r:any)=> sum+r.supports,0)
      setStats({ total, today, week })
    })
  },[])
  const leader = leaders[0]
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-[18px] font-black">Manajemen Dukungan</h1>
      <div className="grid md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Total Dukungan</div><div className="text-xl font-black">{stats.total.toLocaleString("id-ID")}</div><div className="text-xs text-muted-foreground">ballot dari ledger</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Hari Ini</div><div className="text-xl font-black">{stats.today.toLocaleString("id-ID")}</div></div>
        <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground">Minggu Ini</div><div className="text-xl font-black">{stats.week.toLocaleString("id-ID")}</div></div>
        <div className="rounded-xl border border-[#C9A86A30] bg-[#C9A86A0A] p-4">
          <div className="text-xs font-bold text-gold">Pemimpin</div>
          {leader ? <><div className="text-sm font-black truncate">{leader.name}</div><div className="text-xs text-muted-foreground">#{leader.number} • {leader.total_ballots?.toLocaleString("id-ID")} ballot</div></> : <div className="text-sm text-muted-foreground">Belum ada data</div>}
        </div>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <h3 className="text-sm font-black">Dukungan per Peleton (Top 6, DB-driven)</h3>
        <p className="text-xs text-muted-foreground">Diurut total_ballots DESC — data real dari view team_ranking</p>
        <div className="mt-3 space-y-2">
          {leaders.length===0 ? <div className="p-6 text-center text-sm text-muted-foreground">Belum ada dukungan.</div> :
            leaders.slice(0,6).map((p,i)=> (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
              <div className="h-7 w-7 rounded-full bg-muted grid place-items-center text-xs font-black">{i+1}</div>
              <img src={p.image_url || p.image} alt="" className="h-8 w-8 rounded-full object-cover border" />
              <div className="flex-1 min-w-0"><div className="text-sm font-bold truncate">{p.name}</div><div className="text-xs text-muted-foreground">{p.city} • #{p.number}</div></div>
              <div className="text-right"><div className="text-xs font-bold tabular-nums">{(p.total_ballots||0).toLocaleString("id-ID")} ballot</div><div className="text-xs text-muted-foreground">{p.category}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
