"use client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
import { Check, Clock, Circle } from "lucide-react"

export default function TimelinePage(){
  const [timelineStages,setTimeline]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("timeline_stages").select("*").order("sort_order").then(({data})=> setTimeline(data||[])) },[])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#08090B] text-white">
          <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
            <div className="label-gold text-white/60">Jadwal Kompetisi</div>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.03em] leading-none">TIMELINE</h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">Ikuti setiap tahapan LKBB Javasoma 2026 dari pendaftaran hingga pengumuman pemenang.</p>
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
          {/* Desktop horizontal, mobile vertical */}
          <div className="hidden md:grid grid-cols-8 gap-3">
            {timelineStages.map(s=> (
              <div key={s.id} className={`rounded-2xl border p-4 text-center ${s.status==="current" ? "border-[#C9A86A] bg-[#C9A86A0A]" : s.status==="completed" ? "border-emerald-500/20 bg-emerald-500/5" : "border-dashed bg-card"}`}>
                <div className={`mx-auto h-10 w-10 rounded-full grid place-items-center text-sm font-black border ${s.status==="completed" ? "bg-emerald-500 text-white border-emerald-500" : s.status==="current" ? "bg-gold text-gold-foreground border-gold" : "bg-muted text-muted-foreground border-border"}`}>
                  {s.status==="completed" ? <Check className="h-5 w-5"/> : s.id}
                </div>
                <div className="mt-3 text-xs font-black leading-tight">{s.title}</div>
                <div className="text-[11px] text-muted-foreground">{s.date}</div>
                <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{s.description}</div>
              </div>
            ))}
          </div>

          <div className="md:hidden space-y-3">
            {timelineStages.map(s=> (
              <div key={s.id} className={`flex gap-3 rounded-2xl border p-4 ${s.status==="current" ? "border-[#C9A86A] bg-[#C9A86A0A]" : "border-border bg-card"}`}>
                <div className={`h-9 w-9 rounded-full grid place-items-center text-xs font-black shrink-0 ${s.status==="completed" ? "bg-emerald-500 text-white" : s.status==="current" ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground"}`}>
                  {s.status==="completed" ? <Check className="h-4 w-4"/> : s.id}
                </div>
                <div>
                  <div className="text-sm font-black">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.date} • {s.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[16px] border border-border bg-card p-5">
            <h3 className="text-sm font-black">Status Saat Ini</h3>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white"><Clock className="h-3.5 w-3.5"/> VOTING BERLANGSUNG</div>
            <p className="mt-2 text-sm text-muted-foreground">Voting peleton terfavorit dibuka 1 September 2026 hingga 24 Oktober 2026. Dukung peleton favoritmu sekarang.</p>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
