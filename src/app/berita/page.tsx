"use client"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"

export default function BeritaPage(){
  const [news,setNews]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("news").select("*").eq("published", true).order("created_at",{ascending:false}).then(({data})=> setNews(data||[])) },[])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#08090B] text-white">
          <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
            <div className="label-gold text-white/60">Kabar Terkini</div>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.03em]">BERITA</h1>
          </div>
        </div>
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {news.map(n=> (
            <Link key={n.id} href={`/berita/${n.slug}`} className="group rounded-[16px] border border-border bg-card overflow-hidden hover:shadow-soft transition-shadow">
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                <img src={n.image_url || n.image} alt={n.title} className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-gold px-2 py-0.5 font-bold text-gold-foreground text-[10px] tracking-widest">{n.category.toUpperCase()}</span>
                  <span className="text-muted-foreground">{n.date}</span>
                </div>
                <h3 className="mt-2 text-[15px] font-black leading-tight line-clamp-2 group-hover:text-gold transition-colors">{n.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{n.excerpt}</p>
                <div className="mt-3 text-xs font-semibold text-foreground">Baca selengkapnya →</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
