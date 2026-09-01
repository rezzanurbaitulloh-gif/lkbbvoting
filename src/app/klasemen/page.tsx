"use client"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Trophy, Crown, Medal, Minus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createBrowserSupabase } from "@/lib/supabase"

export default function KlasemenPage(){
  const [tab,setTab]=useState<"SMP"|"SMA">("SMP")
  const [ranking,setRanking]=useState<any[]>([])
  const [event, setEvent]=useState<any>(null)
  useEffect(()=>{
    const supabase = createBrowserSupabase()
    supabase.from("competitions").select("state, show_provisional_result, show_final_result").order("created_at", {ascending:false}).limit(1).single().then(({data})=> setEvent(data))
    supabase.from("team_ranking").select("*").eq("category", tab).order("total_ballots", {ascending:false}).then(({data})=> setRanking(data||[]))
  },[tab])

  const top3 = ranking.slice(0,3)
  const rest = ranking.slice(3)
  const hideTotals = event?.state === "VOTING_OPEN" && !event?.show_provisional_result && !event?.show_final_result

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#08090B] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"><img src="https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=1600&auto=format&fit=crop&q=60" alt="" className="h-full w-full object-cover" /></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090B] via-[#08090B]/85 to-transparent" />
          <div className="relative mx-auto max-w-[1280px] px-4 md:px-6 py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A86A30] bg-[#C9A86A14] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#D4B77A]"><Trophy className="h-3.5 w-3.5"/> KLASEMEN SEMENTARA</div>
            <h1 className="mt-3 text-[28px] md:text-[36px] font-black tracking-[-0.03em] leading-none">PAPAN PERINGKAT</h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">Peringkat DB-driven (online+offline) — {hideTotals ? "jumlah disembunyikan saat voting aktif" : "menampilkan total"}. Nomor peserta tetap, ranking terpisah.</p>
            <div className="mt-5 flex gap-2">
              {(["SMP","SMA"] as const).map(c=> (
                <button key={c} onClick={()=>setTab(c)} className={`rounded-full px-5 py-2 text-sm font-bold border transition-colors ${tab===c ? "bg-white text-[#08090B] border-white" : "bg-white/10 border-white/15 text-white hover:bg-white/15"}`}>{c} / SEDERAJAT</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
          <div className="grid md:grid-cols-3 gap-4">
            {top3.map((p:any,i:number)=> {
              const podiumStyle = i===0 ? "border-[#C9A86A] bg-[#C9A86A0A] md:order-2 md:-mt-4 md:scale-[1.02] shadow-elevated" : i===1 ? "border-border bg-card md:order-1" : "border-border bg-card md:order-3"
              const icon = i===0 ? <Crown className="h-5 w-5 text-[#C9A86A]" /> : i===1 ? <Medal className="h-5 w-5 text-[#9AA0A9]" /> : <Medal className="h-5 w-5 text-[#B45309]" />
              return (
                <div key={p.id} className={`relative overflow-hidden rounded-[20px] border-2 p-4 flex flex-col ${podiumStyle}`}>
                  <div className="flex items-center gap-2">
                    <div className={`h-9 w-9 rounded-full grid place-items-center text-sm font-black border ${i===0 ? "bg-[#C9A86A] text-[#0C0A06] border-[#C9A86A]" : "bg-muted border-border"}`}>{i+1}</div>
                    {icon}
                    <span className="ml-auto text-xs font-bold tracking-widest text-muted-foreground">#{p.number}</span>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <img src={p.image_url} alt="" className="h-16 w-16 rounded-xl object-cover border border-border" />
                    <div className="min-w-0">
                      <div className="text-[15px] font-black leading-tight line-clamp-1">{p.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{p.school}</div>
                      <div className="text-xs text-muted-foreground">{hideTotals ? "—" : `${p.total_ballots} ballot`}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/peleton/${p.slug}`} className="flex-1"><Button variant="outline" size="sm" className="w-full rounded-full">Detail</Button></Link>
                    <Link href={`/dukungan?peleton=${p.slug}`} className="flex-1"><Button size="sm" className="w-full rounded-full">Dukung</Button></Link>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground text-center">{hideTotals ? "Ranking 1st/2nd/3rd — # nomor peserta" : `1st = ranking, #${p.number} = nomor peserta`}</div>
                </div>
              )
            })}
          </div>
          <div className="mt-6 rounded-[16px] border border-border overflow-hidden bg-card">
            <div className="hidden md:grid grid-cols-[64px_1fr_180px_120px] gap-4 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
              <div>RANK</div><div>PELETON</div><div>ASAL</div><div className="text-right">STATUS</div>
            </div>
            <div className="divide-y divide-border">
              {rest.map((p:any,i:number)=> {
                const rank = i+4
                return (
                  <div key={p.id} className="grid md:grid-cols-[64px_1fr_180px_120px] gap-3 px-4 py-3 items-center hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="hidden md:block text-sm font-black tabular-nums">#{String(rank).padStart(2,"0")}</span>
                      <span className="md:hidden h-7 w-7 rounded-full bg-muted grid place-items-center text-xs font-black">{rank}</span>
                      <span className="hidden md:inline text-muted-foreground"><Minus className="h-3 w-3"/></span>
                    </div>
                    <Link href={`/peleton/${p.slug}`} className="flex items-center gap-3 min-w-0">
                      <img src={p.image_url} alt="" className="h-9 w-9 rounded-full object-cover border border-border" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold leading-tight truncate">{p.name} <span className="text-xs font-normal text-muted-foreground">#{p.number}</span></div>
                        <div className="text-xs text-muted-foreground truncate md:hidden">{p.school} • {p.category}</div>
                        <div className="hidden md:block text-xs text-muted-foreground truncate">{p.school}</div>
                      </div>
                    </Link>
                    <div className="hidden md:block text-sm text-muted-foreground">{p.school} • {p.category}</div>
                    <div className="flex md:justify-end">
                      <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/15 px-2.5 py-1 text-xs font-bold">Stabil</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-[#C9A86A20] bg-[#C9A86A0A] p-4 text-center">
            <p className="text-xs leading-relaxed text-muted-foreground">Klasemen dari view <code>team_ranking</code> (online+offline). Saat <b>VOTING_OPEN</b> tanpa provisional, total disembunyikan — hanya urutan.</p>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
