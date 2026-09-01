"use client"
import { useState, useMemo } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { PeletonCard } from "@/components/peleton/PeletonCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { peletons } from "@/lib/data"
import { Search } from "lucide-react"

const filters = ["Semua","SMP","SMA"]
const sorts = [
  { label:"Terpopuler", value:"populer"},
  { label:"Terbaru", value:"terbaru"},
  { label:"Nama A-Z", value:"az"},
]

export default function PeletonPage(){
  const [q,setQ]=useState("")
  const [filter,setFilter]=useState("Semua")
  const [sort,setSort]=useState("populer")

  const list = useMemo(()=>{
    let l=[...peletons].filter(p=>p.verified)
    if(q) l=l.filter(p=> p.name.toLowerCase().includes(q.toLowerCase()) || p.school.toLowerCase().includes(q.toLowerCase()) || p.city.toLowerCase().includes(q.toLowerCase()))
    if(filter!=="Semua") l=l.filter(p=>p.category===filter)
    if(sort==="populer") l.sort((a,b)=>b.support-a.support)
    if(sort==="az") l.sort((a,b)=>a.name.localeCompare(b.name))
    if(sort==="terbaru") l.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return l
  },[q,filter,sort])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        {/* Header editorial */}
        <div className="border-b border-border bg-[#08090B] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=1600&auto=format&fit=crop&q=60" alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090B] via-[#08090B]/90 to-[#08090B]/60" />
          <div className="relative mx-auto max-w-[1280px] px-4 md:px-6 py-8 md:py-10">
            <div className="label-gold text-white/60">Direktori Peserta</div>
            <h1 className="mt-2 text-[28px] md:text-[42px] font-black tracking-[-0.03em] leading-none">PELETON PESERTA</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60 text-pretty">Temukan peleton favoritmu. Dukung dengan ballot resmi dan jadilah bagian dari perjalanan mereka menuju gelar Peleton Terfavorit.</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari peleton, sekolah, kota…" className="h-[44px] w-full rounded-full border border-white/15 bg-white/10 backdrop-blur pl-10 pr-4 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C9A86A]" />
              </div>
              <div className="hidden sm:flex items-center text-xs text-white/50 gap-2">
                {list.length} peleton
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="sticky top-[64px] z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
              {filters.map(f=> (
                <button key={f} onClick={()=>setFilter(f)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold tracking-wide border transition-colors ${filter===f ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-muted"}`}>{f}</button>
              ))}
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
              {sorts.map(s=> (
                <button key={s.value} onClick={()=>setSort(s.value)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium border ${sort===s.value ? "bg-secondary border-border text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{s.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
          {list.length===0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto max-w-sm rounded-2xl border border-dashed border-border p-8">
                <div className="text-sm font-bold">Tidak ada peleton ditemukan</div>
                <p className="mt-1 text-sm text-muted-foreground">Coba kata kunci atau filter lain.</p>
                <Button variant="outline" className="mt-4 rounded-full" onClick={()=>{setQ(""); setFilter("Semua")}}>Reset Filter</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {list.map((p,i)=> <PeletonCard key={p.id} peleton={p} rank={sort==="populer" ? i+1 : undefined} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
