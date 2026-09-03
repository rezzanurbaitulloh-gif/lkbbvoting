"use client"
import { useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Input, Textarea } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function KontakPage(){
  const [sent,setSent]=useState(false)
  const [loading,setLoading]=useState(false)
  const onSubmit=(e:React.FormEvent)=>{
    e.preventDefault()
    setLoading(true)
    setTimeout(()=>{setLoading(false); setSent(true)},900)
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#09090b] text-white">
          <div className="mx-auto max-w-[1080px] px-3 sm:px-4 md:px-6 py-8">
            <div className="label-gold text-white/60">Hubungi Kami</div>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.03em]">KONTAK</h1>
          </div>
        </div>
        <div className="mx-auto max-w-[1080px] px-3 sm:px-4 md:px-6 py-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-[16px] border border-border bg-card p-5">
              <h3 className="text-sm font-black">Informasi Kontak</h3>
              <div className="mt-3 grid gap-2 text-sm">
                <div><span className="text-muted-foreground">Email</span><br/><span className="font-bold">info@lkbb-event.id</span></div>
                <div><span className="text-muted-foreground">WhatsApp Panitia</span><br/><span className="font-mono font-bold">0812-3456-7890</span></div>
                <div><span className="text-muted-foreground">Instagram</span><br/><span className="font-bold">@lkbb_event</span></div>
                <div><span className="text-muted-foreground">Alamat</span><br/><span>SMK Negeri 1 Kertosono, Nganjuk, Jawa Timur</span></div>
              </div>
            </div>
            <div className="rounded-[16px] border border-border bg-card p-5">
              <h4 className="text-sm font-black">Jam Operasional</h4>
              <p className="text-sm text-muted-foreground">Senin - Sabtu, 08.00 - 17.00 WIB</p>
            </div>
          </div>
          <div className="rounded-[16px] border border-border bg-card p-6">
            <h3 className="text-sm font-black">Kirim Pesan</h3>
            {sent ? (
              <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Pesan terkirim!</div>
                <p className="text-xs text-muted-foreground">Tim kami akan membalas dalam 1x24 jam.</p>
                <Button variant="outline" className="mt-3 rounded-full" onClick={()=>setSent(false)}>Kirim Pesan Lain</Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-4 grid gap-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-bold">Nama</label><Input required placeholder="Nama lengkap" /></div>
                  <div><label className="text-xs font-bold">Email</label><Input required type="email" placeholder="email@contoh.id" /></div>
                </div>
                <div><label className="text-xs font-bold">Subjek</label><Input required placeholder="Judul pesan" /></div>
                <div><label className="text-xs font-bold">Pesan</label><Textarea required placeholder="Tulis pesanmu…" rows={5} /></div>
                <Button type="submit" disabled={loading} className="rounded-full h-11">{loading ? "Mengirim…" : "Kirim Pesan"}</Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
