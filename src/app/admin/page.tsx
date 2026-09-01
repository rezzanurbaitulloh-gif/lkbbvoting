"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserSupabase } from "@/lib/supabase"

export default function AdminOverview(){
  const [stats, setStats] = useState<any>({})
  const [ranking, setRanking] = useState<any[]>([])
  const [recentTx, setRecentTx] = useState<any[]>([])
  const [announcements, setAnn] = useState<any[]>([])
  useEffect(()=>{
    const supabase = createBrowserSupabase()
    supabase.from("peletons").select("*", {count:"exact", head:true}).eq("active", true).then(({count})=> setStats((s:any)=> ({...s, totalTeams: count})))
    supabase.from("peletons").select("*", {count:"exact", head:true}).eq("category", "SMP").eq("active", true).then(({count})=> setStats((s:any)=> ({...s, smp: count})))
    supabase.from("peletons").select("*", {count:"exact", head:true}).eq("category", "SMA").eq("active", true).then(({count})=> setStats((s:any)=> ({...s, sma: count})))
    supabase.from("transactions").select("*", {count:"exact", head:true}).then(({count})=> setStats((s:any)=> ({...s, transactions: count})))
    supabase.from("supports").select("supports").then(({data})=>{
      const total = (data||[]).reduce((a:any,b:any)=> a + (b.supports||0), 0)
      const online = (data||[]).filter((x:any)=> x.source==="online").reduce((a:any,b:any)=> a + b.supports,0)
      const offline = total - online
      setStats((s:any)=> ({...s, total, online, offline}))
    })
    supabase.from("team_ranking").select("*").order("total_ballots", {ascending:false}).limit(5).then(({data})=> setRanking(data||[]))
    supabase.from("transactions").select("*").order("created_at", {ascending:false}).limit(3).then(({data})=> setRecentTx(data||[]))
    supabase.from("announcements").select("*").order("created_at", {ascending:false}).limit(3).then(({data})=> setAnn(data||[]))
    supabase.from("competitions").select("state").order("created_at", {ascending:false}).limit(1).single().then(({data})=> setStats((s:any)=> ({...s, state: data?.state})))
  },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-black tracking-tight">Dashboard — DB Real</h1>
        <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">{stats.state || "VOTING_OPEN"}</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {label:"Total Peleton", value: stats.totalTeams ?? "-", sub:`${stats.smp ?? 0} SMP • ${stats.sma ?? 0} SMA`},
          {label:"Total Transaksi", value: stats.transactions ?? "-", sub:"Dari DB"},
          {label:"Online Ballots", value: stats.online ?? "-", sub:"Ledger online"},
          {label:"Total Ballots", value: stats.total ?? "-", sub:`${stats.offline ?? 0} offline`},
        ].map(card=> (
          <div key={card.label} className="rounded-[16px] border border-border bg-card p-4">
            <div className="text-xs font-bold tracking-widest text-muted-foreground">{card.label.toUpperCase()}</div>
            <div className="mt-1 text-[18px] font-black leading-tight truncate">{card.value}</div>
            <div className="text-xs text-muted-foreground">{card.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-4">
        <div className="rounded-[16px] border border-border bg-card p-4">
          <h3 className="text-sm font-black">Ranking Realtime (view team_ranking)</h3>
          <div className="mt-3">
            <div className="grid grid-cols-[32px_1fr_80px_80px] gap-2 px-2 py-2 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border">
              <div>#</div><div>Tim</div><div className="text-right">Online</div><div className="text-right">Total</div>
            </div>
            {ranking.map((r:any,i:number)=> (
              <div key={r.id} className="grid grid-cols-[32px_1fr_80px_80px] gap-2 px-2 py-2.5 text-sm border-b border-border/50 last:border-0">
                <div className="font-black">{i+1}</div>
                <div className="font-bold truncate">#{r.number} {r.name}</div>
                <div className="text-right tabular-nums">{r.online_ballots}</div>
                <div className="text-right font-black tabular-nums">{r.total_ballots}</div>
              </div>
            ))}
          </div>
          <Link href="/admin/klasemen" className="mt-3 inline-flex text-xs font-bold text-gold hover:underline">Lihat klasemen lengkap →</Link>
        </div>
        <div className="space-y-4">
          <div className="rounded-[16px] border border-border bg-card p-4">
            <h3 className="text-sm font-black">Transaksi Terbaru (DB)</h3>
            <div className="mt-2 space-y-2">
              {recentTx.map((t:any)=> (
                <div key={t.id} className="flex justify-between rounded-xl border border-border p-2.5 text-xs">
                  <div><div className="font-mono font-bold">{t.id.slice(0,8)}</div><div className="text-muted-foreground">{t.supports} ballots</div></div>
                  <div className="text-right"><div className="font-bold">Rp{t.amount?.toLocaleString("id-ID")}</div><div className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${t.status==="Success" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>{t.status}</div></div>
                </div>
              ))}
              {recentTx.length===0 && <div className="text-xs text-muted-foreground">Belum ada transaksi.</div>}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <h3 className="text-sm font-black">Pengumuman Terbaru (DB)</h3>
        <div className="mt-2 grid md:grid-cols-3 gap-3">
          {announcements.map((a:any)=> (
            <div key={a.id} className="rounded-xl border border-border p-3">
              <div className="text-xs font-bold">{a.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{a.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
