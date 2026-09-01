"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const eventDate = event?.event_date ? new Date(event.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }).toUpperCase() : "24 OKTOBER 2026"
  const onlinePrice = event?.settings?.online_price ?? 3000
  const offlinePrice = event?.settings?.offline_price ?? 5000
  const cd = useCountdown(votingEnd)
  return (
    <section className="relative overflow-hidden border-b border-border bg-[#08090B] text-white">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=1600&auto=format&fit=crop&q=70" alt="" className="h-full w-full object-cover opacity-[0.28]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090B] via-[#08090B]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, backgroundSize: '40px 40px'}} />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 py-10 md:py-14 lg:py-16">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C9A86A30] bg-[#C9A86A14] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#D4B77A]">● {event?.name || "LKBB"} {event?.subtitle || "JAVASOMA THE IMPRESSION"}</span>
              <span className="hidden md:inline-flex text-[11px] tracking-[0.12em] text-white/60 font-semibold">{event?.tagline || "ASTRA DHARMA HAYUNING BUDAYA"}</span>
            </div>
            <h1 className="mt-5 text-balance font-extrabold leading-[0.9] tracking-[-0.04em]">
              <span className="block text-[42px] md:text-[64px] lg:text-[72px] text-white">PELETON</span>
              <span className="block text-[42px] md:text-[64px] lg:text-[72px] text-[#C9A86A]">TERFAVORIT</span>
            </h1>
            <p className="mt-4 max-w-[560px] text-[14px] md:text-[15px] leading-relaxed text-white/70 text-pretty">
              Berikan dukunganmu kepada peleton favoritmu dan jadilah bagian dari perjalanan mereka menuju gelar <b className="text-white">Peleton Terfavorit</b> — kompetisi paling prestisius se-Jawa Timur.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/peleton">
                <Button size="lg" className="rounded-full px-7 h-[46px] gap-2">Dukung Sekarang <ArrowRight className="h-4 w-4"/></Button>
              </Link>
              <Link href="/peleton">
                <Button variant="outline" size="lg" className="rounded-full px-7 h-[46px] bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white backdrop-blur">Lihat Peleton</Button>
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-[1.1fr_0.9fr] gap-3">
              <div className="rounded-[16px] border border-white/10 bg-white/[0.06] backdrop-blur p-4">
                <div className="text-center">
                  <div className="label-gold text-white/60">{event?.settings?.countdown_title || "Menuju Perhelatan"}</div>
                  <div className="mt-1 text-sm font-bold tracking-wide text-white">{eventDate}</div>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[
                      {v: cd.days, l:"HARI"},
                      {v: cd.hours, l:"JAM"},
                      {v: cd.minutes, l:"MENIT"},
                      {v: cd.seconds, l:"DETIK"},
                    ].map(item=> (
                      <div key={item.l} className="rounded-xl bg-[#0B0C0F] border border-white/10 py-2.5">
                        <div className="tabular-nums text-[18px] font-black leading-none text-[#D4B77A]">{String(item.v).padStart(2,"0")}</div>
                        <div className="mt-1 text-[10px] font-bold tracking-[0.12em] text-white/50">{item.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-[16px] border border-[#C9A86A20] bg-[#C9A86A0A] backdrop-blur p-4 flex flex-col justify-center">
                <div className="text-[11px] font-bold tracking-[0.14em] text-[#D4B77A]">DUKUNG PELETON FAVORITMU</div>
                <p className="mt-1 text-xs leading-relaxed text-white/60">Peleton Terfavorit ditentukan berdasarkan dukungan ballot.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#0B0C0F] border border-white/10 p-2.5 text-center">
                    <div className="text-[10px] font-bold tracking-widest text-white/50">ONLINE</div>
                    <div className="tabular-nums text-sm font-black text-white">Rp{onlinePrice.toLocaleString("id-ID")} <span className="text-[10px] font-medium text-white/50">/ ballot</span></div>
                  </div>
                  <div className="rounded-xl bg-[#0B0C0F] border border-white/10 p-2.5 text-center">
                    <div className="text-[10px] font-bold tracking-widest text-white/50">OFFLINE</div>
                    <div className="tabular-nums text-sm font-black text-white">Rp{offlinePrice.toLocaleString("id-ID")} <span className="text-[10px] font-medium text-white/50">/ ballot</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 -right-6 -top-6 bottom-0">
              <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#0B0C0F]">
                <img src="https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=1000&auto=format&fit=crop&q=70" alt="Paskibra" className="h-full w-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl border border-[#C9A86A30] bg-[#0B0C0F]/80 backdrop-blur p-3">
                  <img src="/assets/brand/lkbb-logo.jpg" alt="LKBB" className="h-12 w-12 rounded-xl object-cover border border-[#C9A86A30]" />
                  <div>
                    <div className="text-sm font-black tracking-tight text-white">{event?.name || "LKBB JAVASOMA"}</div>
                    <div className="text-[11px] tracking-[0.12em] text-[#D4B77A] font-bold">{event?.tagline || "ASTRA DHARMA HAYUNING BUDAYA"}</div>
                  </div>
                  <div className="ml-auto hidden xl:block text-right">
                    <div className="text-[10px] tracking-widest text-white/50 font-bold">KOMPETISI RESMI</div>
                    <div className="text-xs font-bold text-white">2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
