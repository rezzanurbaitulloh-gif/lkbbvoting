"use client"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Trophy, BarChart3, Edit, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"

export default function ParticipantDashboard(){
  const [peleton, setPeleton] = useState<any>(null)
  const [rank, setRank] = useState<number | null>(null)
  useEffect(()=>{
    const supabase = createBrowserSupabase()
    supabase.from("peletons").select("*").eq("slug", "smkn-1-kertosono").single().then(({data})=> setPeleton(data))
    supabase.from("team_ranking").select("*").eq("category", "SMA").order("total_ballots", {ascending:false}).then(({data})=>{
      const idx = (data||[]).findIndex((r:any)=> r.slug==="smkn-1-kertosono")
      if(idx>=0) setRank(idx+1)
    })
  },[])
  const p = peleton
  if(!p) return <div className="min-h-screen grid place-items-center p-8">Memuat...</div>
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 bg-muted/20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <Link href="/participant" className="rounded-full bg-foreground text-background px-3 py-1">Overview</Link>
            <Link href="/participant/profile" className="rounded-full border border-border bg-card px-3 py-1">Profile</Link>
            <Link href="/participant/statistics" className="rounded-full border border-border bg-card px-3 py-1">Statistik</Link>
          </div>
          <div className="mt-4 rounded-[20px] border border-border bg-card overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-[#08090B] to-[#1E232F]" />
            <div className="px-6 pb-6">
              <div className="flex gap-4 -mt-10">
                <img src={p.image_url} alt="" className="h-20 w-20 rounded-2xl object-cover border-4 border-card shadow-soft" />
                <div className="pt-10">
                  <h1 className="text-[18px] font-black leading-tight">{p.name}</h1>
                  <p className="text-sm text-muted-foreground">{p.school} • {p.city}</p>
                </div>
                <div className="ml-auto hidden md:block pt-10">
                  <Link href={`/peleton/${p.slug}`} target="_blank"><Button variant="outline" size="sm" className="rounded-full">Lihat Profil Publik</Button></Link>
                </div>
              </div>
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-muted p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><Trophy className="h-4 w-4"/> Peringkat Saat Ini</div>
                  <div className="mt-1 text-[24px] font-black">#{rank ?? "-"}</div>
                  <div className="text-xs text-muted-foreground">Kategori {p.category}</div>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <div className="text-xs font-bold text-muted-foreground">Nomor Peserta</div>
                  <div className="mt-1 text-[24px] font-black">#{p.number}</div>
                  <div className="text-xs text-muted-foreground">Bukan ranking</div>
                </div>
                <div className="rounded-xl bg-[#C9A86A0A] border border-[#C9A86A20] p-4">
                  <div className="text-xs font-bold tracking-widest text-gold">STATUS</div>
                  <div className="mt-1 text-sm font-black">VOTING BERLANGSUNG</div>
                  <div className="text-xs text-muted-foreground">Display order: {p.display_order}</div>
                </div>
              </div>
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-black">Aksi Cepat</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link href="/participant/profile"><Button variant="outline" className="w-full rounded-full gap-2"><Edit className="h-4 w-4"/> Edit Profil</Button></Link>
                    <Link href="/participant/statistics"><Button variant="outline" className="w-full rounded-full gap-2"><BarChart3 className="h-4 w-4"/> Lihat Statistik</Button></Link>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Kelola hanya 7 field: nomor, nama, kategori, foto, logo, urutan, aktif — sesuai spec §7.</p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-black">Informasi Kompetisi</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Kategori</span><span className="font-bold">{p.category} / Sederajat</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">Terverifikasi</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Display Order</span><span className="font-bold">#{p.display_order}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
