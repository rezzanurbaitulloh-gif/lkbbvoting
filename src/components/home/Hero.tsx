"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CaraDukungDialog } from "./CaraDukungDialog"

function useCountdown(target: string){
  const [diff, setDiff] = useState({days:0,hours:0,minutes:0,seconds:0})
  useEffect(()=>{
    if(!target) return
    const t = new Date(target).getTime()
    const id=setInterval(()=>{
      const now=Date.now()
      const d=Math.max(0, t-now)
      setDiff({
        days: Math.floor(d/86400000),
        hours: Math.floor((d%86400000)/3600000),
        minutes: Math.floor((d%3600000)/60000),
        seconds: Math.floor((d%60000)/1000),
      })
    },1000)
    return ()=>clearInterval(id)
  },[target])
  return diff
}

export function Hero({ event }: { event: any }){
  const votingEnd = event?.voting_end || "2026-10-24T23:59:59+07:00"
  const cd = useCountdown(votingEnd)
  const [caraOpen, setCaraOpen] = useState(false)
  return (
    <section className="relative overflow-hidden bg-[#08090B] text-white">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=1600&auto=format&fit=crop&q=70" alt="" className="h-full w-full object-cover opacity-[0.32]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090B]/30 via-[#08090B]/55 to-[#08090B]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090B] via-[#08090B]/80 to-transparent" />
      </div>
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: `linear-gradient(#C9A86A 1px, transparent 1px), linear-gradient(90deg, #C9A86A 1px, transparent 1px)`, backgroundSize: '60px 60px'}} />
      {/* LKBB triangle watermark */}
      <div className="absolute right-[8%] top-[12%] hidden lg:block opacity-90">
        <div className="relative h-[420px] w-[420px] border border-[#C9A86A]/20 rotate-0" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: 'linear-gradient(180deg, rgba(201,168,106,0.08), transparent)'}} />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10">
          <div className="text-[11px] tracking-[0.32em] text-[#C9A86A] font-bold">LKBB</div>
          <div className="text-[10px] tracking-[0.18em] text-white/70">JAVASOMA</div>
        </div>
      </div>
      <div className="relative mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="pt-10 md:pt-14 pb-6 md:pb-8">
          <div className="max-w-[640px]">
            <div className="inline-flex items-center gap-2">
              <span className="h-px w-8 bg-[#C9A86A]" />
              <span className="text-[11px] font-bold tracking-[0.18em] text-[#C9A86A]">LKBB • JAVASOMA THE IMPRESSION</span>
            </div>
            <h1 className="mt-3 text-balance font-black leading-[0.85] tracking-[-0.05em]">
              <span className="block text-[44px] md:text-[68px] lg:text-[76px] text-[#C9A86A]">PELETON</span>
              <span className="block text-[44px] md:text-[68px] lg:text-[76px] text-[#C9A86A]">TERFAVORIT</span>
            </h1>
            <div className="mt-3">
              <div className="text-[13px] font-bold tracking-[0.18em] text-white">LKBB</div>
              <div className="text-[12px] font-semibold tracking-[0.12em] text-white/80">JAVASOMA THE IMPRESSION</div>
              <div className="text-[11px] tracking-[0.14em] text-[#C9A86A] font-bold">ASTRA DHARMA HAYUNING BUDAYA</div>
            </div>
            <p className="mt-4 max-w-[520px] text-[13px] leading-relaxed text-white/65">
              Dukung peleton terbaik pilihanmu dan jadilah bagian dari kemeriahan LKBB tahun ini.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tim">
                <Button size="lg" className="rounded-full px-6 h-[42px] bg-[#C9A86A] text-[#0B0C0F] hover:bg-[#C4A06A] font-black tracking-wide">LIHAT PESERTA</Button>
              </Link>
              <Button onClick={()=> setCaraOpen(true)} variant="outline" size="lg" className="rounded-full px-6 h-[42px] bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur">CARA DUKUNG</Button>
            </div>
            <CaraDukungDialog open={caraOpen} onOpenChange={setCaraOpen} />
          </div>
        </div>
        {/* Countdown bar like reference */}
        <div className="pb-8 md:pb-10">
          <div className="mx-auto max-w-[560px] text-center">
            <div className="text-[10px] font-bold tracking-[0.18em] text-white/50">EVENT DIMULAI DALAM</div>
            <div className="mt-3 grid grid-cols-4 gap-2 md:gap-3">
              {[
                {v: cd.days, l:"HARI"},
                {v: cd.hours, l:"JAM"},
                {v: cd.minutes, l:"MENIT"},
                {v: cd.seconds, l:"DETIK"},
              ].map(item=> (
                <div key={item.l} className="rounded-[12px] border border-white/10 bg-[#0B0C0F]/80 backdrop-blur py-3 md:py-4">
                  <div className="tabular-nums text-[28px] md:text-[32px] font-black leading-none text-white">{String(item.v).padStart(2,"0")}</div>
                  <div className="mt-1 text-[10px] font-bold tracking-[0.14em] text-white/50">{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
