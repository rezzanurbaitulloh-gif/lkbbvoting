"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/input"
import { createBrowserSupabase } from "@/lib/supabase"

export default function ParticipantProfile(){
  const [p, setP] = useState<any>(null)
  useEffect(()=>{
    const supabase = createBrowserSupabase()
    supabase.from("peletons").select("*").eq("slug", "smkn-1-kertosono").single().then(({data})=> setP(data))
  },[])
  if(!p) return <div className="min-h-screen grid place-items-center p-8">Memuat...</div>
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 bg-muted/20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <Link href="/participant" className="rounded-full border border-border bg-card px-3 py-1">Overview</Link>
            <Link href="/participant/profile" className="rounded-full bg-foreground text-background px-3 py-1">Profile</Link>
            <Link href="/participant/statistics" className="rounded-full border border-border bg-card px-3 py-1">Statistik</Link>
          </div>
          <div className="mt-4 max-w-2xl rounded-[16px] border border-border bg-card p-6 space-y-4">
            <h1 className="text-[18px] font-black">Edit Profil Peleton — 7 Field Saja</h1>
            <p className="text-xs text-muted-foreground">Spec §7: hanya 7 field — nomor, nama, kategori, foto, logo, urutan, aktif. Tidak ada gallery/member.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-bold">Nomor Peserta</label><Input defaultValue={p.number} /></div>
              <div><label className="text-xs font-bold">Nama Tim</label><Input defaultValue={p.name} /></div>
              <div><label className="text-xs font-bold">Kategori</label><Input defaultValue={p.category} /></div>
              <div><label className="text-xs font-bold">Display Order</label><Input defaultValue={p.display_order} type="number" /></div>
              <div><label className="text-xs font-bold">Status Aktif</label><Input defaultValue={p.active ? "AKTIF" : "NONAKTIF"} /></div>
              <div><label className="text-xs font-bold">Sekolah</label><Input defaultValue={p.school} /></div>
            </div>
            <div><label className="text-xs font-bold">Deskripsi</label><Textarea defaultValue={p.description} rows={3} /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-bold">Team Photo (1)</label><div className="mt-1 flex gap-2 items-center"><img src={p.image_url} alt="" className="h-12 w-12 rounded-lg object-cover border"/><Button variant="outline" size="sm" className="rounded-full">Ganti Foto</Button></div></div>
              <div><label className="text-xs font-bold">Team Logo (1)</label><div className="mt-1 flex gap-2 items-center"><img src={p.image_url} alt="" className="h-12 w-12 rounded-lg object-cover border"/><Button variant="outline" size="sm" className="rounded-full">Ganti Logo</Button></div></div>
            </div>
            <Button className="rounded-full w-full h-11">Simpan Perubahan</Button>
          </div>
        </div>
      </main>
      <Footer /><BottomNav />
    </div>
  )
}
