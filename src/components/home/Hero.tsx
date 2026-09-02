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

export function Hero({ event, cms }: { event: any; cms?: any }){
  // cms: content dari cms_sections key=hero (dynamic). Fallback ke event/ hardcode jika tidak ada
  const cmsContent = cms?.content || {}
  const cmsSettings = cms?.settings || {}
  const votingEnd = event?.voting_end || cmsContent.fallbackDate || "2026-10-24T23:59:59+07:00"
  const cd = useCountdown(votingEnd)
  const [caraOpen, setCaraOpen] = useState(false)
  const bgImage = cmsContent.backgroundImage || "https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=1600&auto=format&fit=crop&q=70"
  const logoImage = cmsContent.logoImage || "/assets/brand/lkbb-logo.jpg"
  const eyebrow = cmsContent.eyebrow || "LKBB • JAVASOMA THE IMPRESSION"
  const heading1 = cmsContent.headingLine1 || "PELETON"
  const heading2 = cmsContent.headingLine2 || "TERFAVORIT"
  const subtitle = cmsContent.subtitle || "LKBB"
  const subtitle2 = cmsContent.subtitle2 || "JAVASOMA THE IMPRESSION"
  const tagline = cmsContent.tagline || "ASTRA DHARMA HAYUNING BUDAYA"
  const description = cmsContent.description || "Dukung peleton terbaik pilihanmu dan jadilah bagian dari kemeriahan LKBB tahun ini."
  const ctaPrimaryLabel = cmsContent.ctaPrimaryLabel || "LIHAT PESERTA"
  const ctaPrimaryLink = cmsContent.ctaPrimaryLink || "/tim"
  const ctaSecondaryLabel = cmsContent.ctaSecondaryLabel || "CARA DUKUNG"
  const overlayOpacity = cmsSettings.overlayOpacity ?? 0.32
  const showLogo = cmsSettings.showLogo !== false
  // if cms explicitly hidden, don't render (caller should handle)
  if (cms && cms.is_visible === false) return null
  return (
    <section className="relative overflow-hidden bg-[#08090B] text-white">
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="h-full w-full object-cover" style={{ opacity: overlayOpacity }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090B]/30 via-[#08090B]/55 to-[#08090B]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090B] via-[#08090B]/80 to-transparent" />
      </div>
      {/* subtle grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: `linear-gradient(#C9A86A 1px, transparent 1px), linear-gradient(90deg, #C9A86A 1px, transparent 1px)`, backgroundSize: '60px 60px'}} />
      {/* Logo LKBB hero — dekstop tetap di kanan, mobile float kecil dan hilang di <320 */}
      {showLogo && (
        <>
          <div className="absolute right-[4%] top-[10%] hidden lg:flex h-[380px] w-[380px] items-center justify-center opacity-95 pointer-events-none">
            <img src={logoImage} alt="Logo LKBB Javasoma" className="h-[280px] w-[280px] object-contain rounded-2xl border border-white/10 shadow-elevated bg-white max-w-[90vw] max-h-[45vh]" />
          </div>
          <div className="absolute right-[4%] top-[10%] flex lg:hidden h-[96px] w-[96px] sm:h-[110px] sm:w-[110px] items-center justify-center opacity-90 pointer-events-none max-[360px]:h-[72px] max-[360px]:w-[72px] max-[320px]:h-[56px] max-[320px]:w-[56px] max-[300px]:hidden">
            <img src={logoImage} alt="Logo LKBB" className="h-[72px] w-[72px] sm:h-[86px] sm:w-[86px] max-[360px]:h-[56px] max-[360px]:w-[56px] max-[320px]:h-[44px] max-[320px]:w-[44px] object-contain rounded-xl border border-white/10 bg-white shadow max-w-full" />
          </div>
        </>
      )}
      <div className="relative mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6">
        <div className="pt-8 sm:pt-10 md:pt-14 pb-6 md:pb-8">
          <div className="mx-auto max-w-[720px] text-center flex flex-col items-center px-1">
            <div className="inline-flex max-w-full items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <span className="h-px w-6 sm:w-8 bg-[#C9A86A] shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] sm:tracking-[0.18em] text-[#C9A86A] break-words text-center">{eyebrow}</span>
              <span className="h-px w-6 sm:w-8 bg-[#C9A86A] shrink-0" />
            </div>
            <h1 className="mt-3 text-balance font-black leading-[0.85] tracking-[-0.05em] text-center max-w-full break-words">
              <span className="block text-[44px] md:text-[68px] lg:text-[76px] text-[#C9A86A] leading-[0.9]">{heading1}</span>
              <span className="block text-[44px] md:text-[68px] lg:text-[76px] text-[#C9A86A] leading-[0.9]">{heading2}</span>
            </h1>
            <div className="mt-3 text-center max-w-full">
              <div className="text-[11px] sm:text-[13px] font-bold tracking-[0.14em] sm:tracking-[0.18em] text-white break-words">{subtitle}</div>
              <div className="text-[10px] sm:text-[12px] font-semibold tracking-[0.10em] sm:tracking-[0.12em] text-white/80 break-words">{subtitle2}</div>
              <div className="text-[10px] sm:text-[11px] tracking-[0.12em] sm:tracking-[0.14em] text-[#C9A86A] font-bold break-words">{tagline}</div>
            </div>
            <p className="mt-4 max-w-[520px] text-[12px] sm:text-[13px] leading-relaxed text-white/65 text-center px-2 sm:px-0">
              {description}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 justify-center w-full sm:w-auto px-2 sm:px-0">
              <Link href={ctaPrimaryLink} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-6 h-[42px] sm:h-[42px] max-[320px]:h-[40px] max-[320px]:text-[13px] bg-[#C9A86A] text-[#0B0C0F] hover:bg-[#C4A06A] font-black tracking-wide">{ctaPrimaryLabel}</Button>
              </Link>
              <Button onClick={()=> setCaraOpen(true)} variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-6 h-[42px] sm:h-[42px] max-[320px]:h-[40px] max-[320px]:text-[13px] bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white backdrop-blur">{ctaSecondaryLabel}</Button>
            </div>
            <CaraDukungDialog open={caraOpen} onOpenChange={setCaraOpen} />
          </div>
        </div>
        {/* Countdown bar — gap dan padding menyesuaikan layar kecil */}
        <div className="pb-6 sm:pb-8 md:pb-10">
          <div className="mx-auto max-w-[560px] text-center px-1">
            <div className="text-[9px] sm:text-[10px] font-bold tracking-[0.16em] sm:tracking-[0.18em] text-white/50">{cmsContent.title || "EVENT DIMULAI DALAM"}</div>
            <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
              {[
                {v: cd.days, l:"HARI"},
                {v: cd.hours, l:"JAM"},
                {v: cd.minutes, l:"MENIT"},
                {v: cd.seconds, l:"DETIK"},
              ].map(item=> (
                <div key={item.l} className="rounded-[10px] sm:rounded-[12px] border border-white/10 bg-[#0B0C0F]/80 backdrop-blur py-2.5 sm:py-3 md:py-4 px-1">
                  <div className="tabular-nums text-[28px] md:text-[32px] font-black leading-none text-white max-[360px]:text-[22px] max-[320px]:text-[20px]">{String(item.v).padStart(2,"0")}</div>
                  <div className="mt-1 text-[9px] sm:text-[10px] font-bold tracking-[0.10em] sm:tracking-[0.14em] text-white/50">{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
