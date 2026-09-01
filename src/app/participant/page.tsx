"use client"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { peletons } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Image as ImgIcon, BarChart3, TrendingUp, Edit } from "lucide-react"

const myPeleton = peletons[0]

export default function ParticipantDashboard(){
  const rank = 1
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 bg-muted/20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <Link href="/participant" className="rounded-full bg-foreground text-background px-3 py-1">Overview</Link>
            <Link href="/participant/profile" className="rounded-full border border-border bg-card px-3 py-1">Profile</Link>
            <Link href="/participant/members" className="rounded-full border border-border bg-card px-3 py-1">Anggota</Link>
            <Link href="/participant/gallery" className="rounded-full border border-border bg-card px-3 py-1">Galeri</Link>
            <Link href="/participant/statistics" className="rounded-full border border-border bg-card px-3 py-1">Statistik</Link>
          </div>

          <div className="mt-4 rounded-[20px] border border-border bg-card overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-[#08090B] to-[#1E232F]" />
            <div className="px-6 pb-6">
              <div className="flex gap-4 -mt-10">
                <img src={myPeleton.image} alt="" className="h-20 w-20 rounded-2xl object-cover border-4 border-card shadow-soft" />
                <div className="pt-10">
                  <h1 className="text-[18px] font-black leading-tight">{myPeleton.name}</h1>
                  <p className="text-sm text-muted-foreground">{myPeleton.school} • {myPeleton.city}</p>
                </div>
                <div className="ml-auto hidden md:block pt-10">
                  <Link href="/peleton/smkn-1-kertosono" target="_blank"><Button variant="outline" size="sm" className="rounded-full">Lihat Profil Publik</Button></Link>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-4 gap-4">
                <div className="rounded-xl bg-muted p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><Trophy className="h-4 w-4"/> Peringkat Saat Ini</div>
                  <div className="mt-1 text-[24px] font-black">#{rank}</div>
                  <div className="text-xs text-emerald-600 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> Naik 1 peringkat</div>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <div className="text-xs font-bold text-muted-foreground">Total Dukungan</div>
                  <div className="mt-1 text-[24px] font-black tabular-nums">{myPeleton.support.toLocaleString("id-ID")}</div>
                  <div className="text-xs text-muted-foreground">Ballot terverifikasi</div>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <div className="text-xs font-bold text-muted-foreground">Pertumbuhan</div>
                  <div className="mt-1 text-[24px] font-black text-emerald-600">+12%</div>
                  <div className="text-xs text-muted-foreground">7 hari terakhir</div>
                </div>
                <div className="rounded-xl bg-[#C9A86A0A] border border-[#C9A86A20] p-4">
                  <div className="text-xs font-bold tracking-widest text-gold">STATUS</div>
                  <div className="mt-1 text-sm font-black">VOTING BERLANGSUNG</div>
                  <div className="text-xs text-muted-foreground">Profile 92% lengkap</div>
                </div>
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-black">Aksi Cepat</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link href="/participant/profile"><Button variant="outline" className="w-full rounded-full gap-2"><Edit className="h-4 w-4"/> Edit Profil</Button></Link>
                    <Link href="/participant/members"><Button variant="outline" className="w-full rounded-full gap-2"><Users className="h-4 w-4"/> Kelola Anggota</Button></Link>
                    <Link href="/participant/gallery"><Button variant="outline" className="w-full rounded-full gap-2"><ImgIcon className="h-4 w-4"/> Kelola Galeri</Button></Link>
                    <Link href="/participant/statistics"><Button variant="outline" className="w-full rounded-full gap-2"><BarChart3 className="h-4 w-4"/> Lihat Statistik</Button></Link>
                  </div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-black">Informasi Kompetisi</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Kategori</span><span className="font-bold">{myPeleton.category} / Sederajat</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status Verifikasi</span><span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white">Terverifikasi</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Technical Meeting</span><span className="font-bold">3 Okt 2026</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Pelaksanaan</span><span className="font-bold">24 Okt 2026</span></div>
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
