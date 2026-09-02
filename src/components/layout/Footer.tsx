"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
export function Footer(){
  const [contact,setContact]=useState<any>(null)
  useEffect(()=>{
    const s=createBrowserSupabase()
    s.from("competitions").select("settings").order("created_at",{ascending:false}).limit(1).single().then(({data})=> setContact(data?.settings?.contact || data?.settings?.whatsapp))
  },[])
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_0.9fr_0.9fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img src="/assets/brand/lkbb-logo.jpg" alt="LKBB" className="h-10 w-10 rounded-xl object-cover border border-[#C9A86A30]" />
              <div>
                <div className="text-sm font-extrabold tracking-tight">LKBB JAVASOMA</div>
                <div className="text-[11px] tracking-[0.12em] text-gold font-bold">THE IMPRESSION</div>
              </div>
            </div>
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted-foreground text-pretty">
              Platform digital resmi PELETON TERFAVORIT — ASTRA DHARMA HAYUNING BUDAYA. Kompetisi baris-berbaris paling prestisius se-Jawa Timur.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <img src="/assets/brand/paskibra-logo.jpg" alt="Paskibra" className="h-8 w-8 rounded-lg object-cover border border-border" />
              <img src="/assets/brand/school-logo.jpg" alt="SMK" className="h-8 w-8 rounded-lg object-cover border border-border" />
              <span className="text-xs text-muted-foreground">Penyelenggara: <b className="text-foreground">PASKIBRA SMKN 1 KERTOSONO</b></span>
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
              <div>Email: <a href="mailto:info@lkbb-event.id" className="text-foreground">{contact?.email || "info@lkbb-event.id"}</a></div>
              <div>WhatsApp: <span className="text-foreground">{contact?.whatsapp || contact?.number || "0812-3456-7890"}</span></div>
              <div>Instagram: <a href={contact?.instagram || "#"} className="text-foreground">@lkbb_event</a></div>
              <div className="pt-2 flex gap-2">
                <a href="#" className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-muted text-xs">IG</a>
                <a href="#" className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-muted text-xs">YT</a>
                <a href="#" className="h-8 w-8 grid place-items-center rounded-full border border-border hover:bg-muted text-xs">TT</a>
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
