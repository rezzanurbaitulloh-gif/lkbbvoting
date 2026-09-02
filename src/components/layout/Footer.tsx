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
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src={logoMain} alt={siteName} className="h-10 w-10 rounded-xl object-cover border border-[#C9A86A30]" />
              <div>
                <div className="text-sm font-extrabold tracking-tight">{siteName}</div>
                <div className="text-[11px] tracking-[0.12em] text-gold font-bold">{siteSubtitle}</div>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted-foreground text-pretty">
              {siteDesc}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <img src={logoPaskibra} alt="Paskibra" className="h-8 w-8 rounded-lg object-cover border border-border" />
              <img src={logoSchool} alt="SMK" className="h-8 w-8 rounded-lg object-cover border border-border" />
              <span className="text-xs text-muted-foreground">Penyelenggara: <b className="text-foreground">{organizer}</b></span>
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
              <div>Instagram: <a href={ig} target="_blank" className="text-foreground">@lkbb_event</a></div>
              <div className="pt-2 flex gap-2">
                <a href={ig} target="_blank" className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-muted text-xs">IG</a>
                <a href={yt} target="_blank" className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-muted text-xs">YT</a>
                <a href={tt} target="_blank" className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-muted text-xs">TT</a>
              </div>
            </div>
          </div>
        </div>
        <div className="hairline my-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© 2026 LKBB JAVASOMA THE IMPRESSION. All rights reserved. — Astra Dharma Hayuning Budaya</div>
          <div className="flex gap-4">
            <Link href="/peraturan">Kebijakan Privasi</Link>
            <Link href="/peraturan">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
