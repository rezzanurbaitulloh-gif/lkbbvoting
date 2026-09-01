"use client"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { createBrowserSupabase } from "@/lib/supabase"

const cats = ["All","Competition","Training","Participants","Ceremony","Behind the Scenes"]

export default function GaleriPage(){
  const [cat,setCat]=useState("All")
  const [active,setActive]=useState<string|null>(null)
  const [peletons,setPeletons]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("peletons").select("id,name,image_url").eq("verified", true).eq("active", true).order("display_order").then(({data})=> setPeletons(data||[])) },[])
  const allImages = peletons.map((p:any)=> ({ url: p.image_url, caption: p.name, peleton: p.name, id: p.id }))
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#08090B] text-white">
          <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
            <div className="label-gold text-white/60">Dokumentasi</div>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.03em]">GALERI</h1>
          </div>
        </div>
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
            {cats.map(c=> (
              <button key={c} onClick={()=>setCat(c)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold border ${cat===c ? "bg-foreground text-background border-foreground" : "bg-card border-border"}`}>{c}</button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {allImages.slice(0,12).map(img=> (
              <button key={img.id} onClick={()=>setActive(img.url)} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                <img src={img.url} alt={img.caption} className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-[11px] font-bold text-white line-clamp-1 opacity-0 group-hover:opacity-100">{img.caption}</div>
                  <div className="text-[10px] text-white/70 opacity-0 group-hover:opacity-100">{img.peleton}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
      {active && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur p-4 grid place-items-center" onClick={()=>setActive(null)}>
          <img src={active} alt="" className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain" />
        </div>
      )}
    </div>
  )
}
