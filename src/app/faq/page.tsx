"use client"
import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { faqs } from "@/lib/data"
import { ChevronDown } from "lucide-react"

const cats = ["All","Competition","Peleton","Support","Payment","Results","Technical"] as const

export default function FAQPage(){
  const [cat,setCat]=useState<string>("All")
  const [open,setOpen]=useState<string|null>(faqs[0]?.id || null)
  const list = cat==="All" ? faqs : faqs.filter(f=>f.category===cat)
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#08090B] text-white">
          <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-8">
            <div className="label-gold text-white/60">Bantuan</div>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.03em]">FAQ</h1>
            <p className="text-sm text-white/60">Temukan jawaban untuk pertanyaan umum seputar LKBB.</p>
          </div>
        </div>
        <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-6">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2">
            {cats.map(c=> (
              <button key={c} onClick={()=>setCat(c)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold border ${cat===c ? "bg-foreground text-background border-foreground" : "bg-card border-border"}`}>{c}</button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {list.map(f=> (
              <div key={f.id} className="rounded-[12px] border border-border bg-card overflow-hidden">
                <button onClick={()=>setOpen(open===f.id?null:f.id)} className="w-full flex items-center justify-between p-4 text-left">
                  <div>
                    <div className="text-[11px] font-bold tracking-widest text-gold">{f.category.toUpperCase()}</div>
                    <div className="text-sm font-bold leading-tight">{f.question}</div>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open===f.id ? "rotate-180" : ""}`} />
                </button>
                {open===f.id && <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{f.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
