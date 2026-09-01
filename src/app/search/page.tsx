"use client"
import { useState, useMemo } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { peletons, news, announcements } from "@/lib/data"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function SearchPage(){
  const [q,setQ]=useState("")
  const peletonResults = useMemo(()=> q ? peletons.filter(p=> `${p.name} ${p.school} ${p.city}`.toLowerCase().includes(q.toLowerCase())).slice(0,6) : [],[q])
  const newsResults = useMemo(()=> q ? news.filter(n=> `${n.title} ${n.excerpt}`.toLowerCase().includes(q.toLowerCase())).slice(0,4) : [],[q])
  const annResults = useMemo(()=> q ? announcements.filter(a=> `${a.title} ${a.content}`.toLowerCase().includes(q.toLowerCase())).slice(0,4) : [],[q])
  const hasQuery = q.trim().length>1
  const total = peletonResults.length + newsResults.length + annResults.length

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#08090B] text-white">
          <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-6">
            <h1 className="text-[22px] font-black tracking-tight">PENCARIAN</h1>
            <div className="mt-4 relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari peleton, berita, pengumuman…" className="h-[44px] w-full rounded-full border border-white/15 bg-white/10 backdrop-blur pl-10 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C9A86A] text-white" autoFocus />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-6">
          {!hasQuery ? (
            <div className="py-10 text-center">
              <div className="text-sm font-bold">Cari peleton, berita, atau informasi kompetisi</div>
              <p className="text-xs text-muted-foreground">Ketik minimal 2 karakter untuk memulai pencarian</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["SMKN 1 Kertosono","Paskibra","Javasoma","Peleton"].map(k=> (
                  <button key={k} onClick={()=>setQ(k)} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted">{k}</button>
                ))}
              </div>
            </div>
          ) : total===0 ? (
            <div className="py-10 text-center"><div className="text-sm font-bold">Tidak ada hasil untuk &quot;{q}&quot;</div><p className="text-xs text-muted-foreground">Coba kata kunci lain</p></div>
          ) : (
            <div className="space-y-6">
              {peletonResults.length>0 && (
                <div>
                  <h3 className="text-xs font-black tracking-widest">PELETON • {peletonResults.length}</h3>
                  <div className="mt-2 grid sm:grid-cols-2 gap-2">
                    {peletonResults.map(p=> (
                      <Link key={p.id} href={`/peleton/${p.slug}`} className="flex gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted">
                        <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                        <div><div className="text-sm font-bold">{p.name}</div><div className="text-xs text-muted-foreground">{p.school} • {p.city}</div></div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {newsResults.length>0 && (
                <div>
                  <h3 className="text-xs font-black tracking-widest">BERITA • {newsResults.length}</h3>
                  <div className="mt-2 grid gap-2">
                    {newsResults.map(n=> (
                      <Link key={n.id} href={`/berita/${n.slug}`} className="rounded-xl border border-border bg-card p-3 hover:bg-muted">
                        <div className="text-sm font-bold">{n.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{n.excerpt}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {annResults.length>0 && (
                <div>
                  <h3 className="text-xs font-black tracking-widest">PENGUMUMAN • {annResults.length}</h3>
                  <div className="mt-2 grid gap-2">
                    {annResults.map(a=> (
                      <div key={a.id} className="rounded-xl border border-border bg-card p-3">
                        <div className="text-sm font-bold">{a.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">{a.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
