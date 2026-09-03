"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
export function Footer({ siteSettings }: { siteSettings?: Record<string, any> } = {}){
  const [contact,setContact]=useState<any>(null)
  const [dynamic, setDynamic]=useState<Record<string,any>>(siteSettings||{})
  useEffect(()=>{
    if(siteSettings && Object.keys(siteSettings).length>0){ setDynamic(siteSettings) }
    else {
      fetch("/api/cms/settings").then(r=> r.json()).then(j=> { if(j.settings) setDynamic(j.settings) }).catch(()=>{})
    }
    const s=createBrowserSupabase()
    s.from("competitions").select("settings").order("created_at",{ascending:false}).limit(1).single().then(({data})=> setContact(data?.settings?.contact || data?.settings?.whatsapp))
  },[siteSettings])
  const siteName = (dynamic["site.name"] as string) || "LKBB JAVASOMA"
  const siteSubtitle = (dynamic["site.subtitle"] as string) || "THE IMPRESSION"
  const siteDesc = (dynamic["site.description"] as string) || "Platform digital resmi PELETON TERFAVORIT — ASTRA DHARMA HAYUNING BUDAYA. Kompetisi baris-berbaris paling prestisius se-Jawa Timur."
  const organizer = (dynamic["site.organizer"] as string) || "PASKIBRA SMKN 1 KERTOSONO"
  const logoMain = (dynamic["branding.logo"] as string) || "/assets/brand/lkbb-logo.jpg"
  const logoPaskibra = (dynamic["branding.logo_paskibra"] as string) || "/assets/brand/paskibra-logo.jpg"
  const logoSchool = (dynamic["branding.logo_school"] as string) || "/assets/brand/school-logo.jpg"
  const email = (dynamic["contact.email"] as string) || contact?.email || "info@lkbb-event.id"
  const whatsapp = (dynamic["contact.whatsapp"] as string) || contact?.whatsapp || contact?.number || "0812-3456-7890"
  const ig = (dynamic["social.instagram"] as string) || "#"
  const yt = (dynamic["social.youtube"] as string) || "#"
  const tt = (dynamic["social.tiktok"] as string) || "#"
  // parse social.list
  let socialList: {platform:string, url:string, visible:boolean}[] = []
  const rawList = dynamic["social.list"] as any
  if(rawList){
    try{
      let parsed: any = rawList
      if(typeof rawList==="string"){
        // may be JSON string with quotes
        const cleaned = rawList.replace(/^"|"$/g,"").replace(/\\"/g,'"')
        parsed = JSON.parse(cleaned)
      } else if(typeof rawList==="object" && (rawList as any).value){
        const v = (rawList as any).value
        if(typeof v==="string") parsed = JSON.parse(v.replace(/^"|"$/g,"").replace(/\\"/g,'"'))
        else parsed = v
      }
      if(Array.isArray(parsed)) socialList = parsed.filter((it:any)=> it.url && it.platform).map((it:any)=> ({platform: String(it.platform).toLowerCase(), url: String(it.url), visible: it.visible!==false}))
    }catch{}
  }
  if(socialList.length===0){
    // fallback to 3 individual keys
    if(ig && ig!=="#") socialList.push({platform:"instagram", url: ig, visible:true})
    if(yt && yt!=="#") socialList.push({platform:"youtube", url: yt, visible:true})
    if(tt && tt!=="#") socialList.push({platform:"tiktok", url: tt, visible:true})
    const fb = dynamic["social.facebook"] as string
    const tw = dynamic["social.twitter"] as string
    const li = dynamic["social.linkedin"] as string
    if(fb) socialList.push({platform:"facebook", url: fb, visible:true})
    if(tw) socialList.push({platform:"twitter", url: tw, visible:true})
    if(li) socialList.push({platform:"linkedin", url: li, visible:true})
  }
  socialList = socialList.filter(s=> s.visible)
  const platformIcon = (p:string)=>{
    const plat = p.toLowerCase()
    if(plat==="instagram") return <span className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white h-full w-full grid place-items-center text-[10px] font-black rounded-full">IG</span>
    if(plat==="tiktok") return <span className="bg-black text-white h-full w-full grid place-items-center rounded-full text-[10px]">♪</span>
    if(plat==="youtube") return <span className="bg-red-600 text-white h-full w-full grid place-items-center rounded-full text-[10px] font-bold">YT</span>
    if(plat==="facebook") return <span className="bg-[#1877F2] text-white h-full w-full grid place-items-center rounded-full text-[10px] font-black">f</span>
    if(plat==="twitter" || plat==="x") return <span className="bg-black text-white h-full w-full grid place-items-center rounded-full text-[10px]">𝕏</span>
    if(plat==="linkedin") return <span className="bg-[#0A66C2] text-white h-full w-full grid place-items-center rounded-full text-[10px] font-bold">in</span>
    if(plat==="whatsapp") return <span className="bg-[#25D366] text-white h-full w-full grid place-items-center rounded-full text-[10px]">WA</span>
    if(plat==="telegram") return <span className="bg-[#26A5E4] text-white h-full w-full grid place-items-center rounded-full text-[10px]">TG</span>
    return <span className="bg-muted text-foreground h-full w-full grid place-items-center rounded-full text-[10px]">{plat.slice(0,2).toUpperCase()}</span>
  }
  return (
    <footer className="mt-auto border-t border-[#C9A86A]/10 bg-surface overflow-hidden relative">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px gold-hairline-premium opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_80%_0%,rgba(201,168,106,0.06),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 py-8 sm:py-10">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 min-[360px]:grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <img src={logoMain} alt={siteName} className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover border border-[#C9A86A30] shrink-0" />
              <div className="min-w-0">
                <div className="text-[13px] sm:text-sm font-extrabold tracking-tight break-words leading-tight">{siteName}</div>
                <div className="text-[10px] sm:text-[11px] tracking-[0.12em] text-gold font-bold">{siteSubtitle}</div>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-[12px] sm:text-[13px] leading-relaxed text-muted-foreground text-pretty break-words">
              {siteDesc}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <img src={logoPaskibra} alt="Paskibra" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover border border-border shrink-0" />
              <img src={logoSchool} alt="SMK" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover border border-border shrink-0" />
              <span className="text-[11px] sm:text-xs text-muted-foreground break-words">Penyelenggara: <b className="text-foreground">{organizer}</b></span>
            </div>
          </div>
          <div>
            <div className="label-ceremonial mb-3">Navigasi</div>
            <ul className="grid gap-2 text-sm">
              <li><Link href="/" className="hover:text-foreground text-muted-foreground">Beranda</Link></li>
              <li><Link href="/tim" className="hover:text-foreground text-muted-foreground">Tim</Link></li>
              <li><Link href="/kompetisi" className="hover:text-foreground text-muted-foreground">Kompetisi</Link></li>
              <li><Link href="/timeline" className="hover:text-foreground text-muted-foreground">Timeline</Link></li>
            </ul>
          </div>
          <div>
            <div className="label-ceremonial mb-3">Informasi</div>
            <ul className="grid gap-2 text-sm">
              <li><Link href="/peraturan" className="hover:text-foreground text-muted-foreground">Peraturan</Link></li>
              <li><Link href="/timeline" className="hover:text-foreground text-muted-foreground">Jadwal</Link></li>
              <li><Link href="/juri" className="hover:text-foreground text-muted-foreground">Dewan Juri</Link></li>
              <li><Link href="/pengumuman" className="hover:text-foreground text-muted-foreground">Pengumuman</Link></li>
              <li><Link href="/kompetisi" className="hover:text-foreground text-muted-foreground">Kompetisi</Link></li>
            </ul>
          </div>
          <div>
            <div className="label-ceremonial mb-3">Kontak</div>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div>Email: <a href={`mailto:${email}`} className="text-foreground">{email}</a></div>
              <div>WhatsApp: <span className="text-foreground">{whatsapp}</span></div>
              {socialList.filter(s=> s.platform==="instagram").slice(0,1).map(s=> (
                <div key={s.url}>Instagram: <a href={s.url} target="_blank" className="text-foreground">{s.url.replace("https://","").replace("http://","")}</a></div>
              ))}
              <div className="pt-2 flex gap-2 flex-wrap">
                {socialList.map(s=> (
                  <a key={s.platform+"-"+s.url} href={s.url} target="_blank" title={s.platform} className="h-8 w-8 rounded-full border border-border overflow-hidden hover:scale-105 transition-transform grid place-items-center">
                    {platformIcon(s.platform)}
                  </a>
                ))}
                {socialList.length===0 && <span className="text-xs">—</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="hairline my-6 sm:my-8" />
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-3 text-[11px] sm:text-xs text-muted-foreground text-center md:text-left">
          <div className="leading-relaxed">© 2026 LKBB JAVASOMA THE IMPRESSION. All rights reserved. — Astra Dharma Hayuning Budaya</div>
          <div className="flex gap-3 sm:gap-4 shrink-0">
            <Link href="/peraturan" className="hover:text-foreground whitespace-nowrap">Kebijakan Privasi</Link>
            <Link href="/peraturan" className="hover:text-foreground whitespace-nowrap">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
