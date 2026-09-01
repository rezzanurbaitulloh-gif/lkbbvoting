"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Button } from "@/components/ui/button"
import { peletons } from "@/lib/data"
import { CheckCircle2, Clock3, XCircle, Timer } from "lucide-react"

function CheckoutInner(){
  const sp = useSearchParams()
  const status = sp.get("status") || "pending"
  const id = sp.get("id") || "TRX-00000000"
  const slug = sp.get("peleton")
  const qty = sp.get("qty") || "50"
  const total = sp.get("total") || "150000"
  const peleton = peletons.find(p=>p.slug===slug) || peletons[0]

  const config = {
    success: { title:"DUKUNGAN BERHASIL", desc:`Terima kasih telah memberikan dukungan kepada ${peleton.name}`, icon: CheckCircle2, color:"bg-emerald-500", bg:"bg-emerald-500/10 border-emerald-500/20" },
    pending: { title:"PEMBAYARAN MENUNGGU", desc:"Selesaikan pembayaran sebelum waktu habis", icon: Clock3, color:"bg-amber-500", bg:"bg-amber-500/10 border-amber-500/20" },
    failed: { title:"PEMBAYARAN TIDAK BERHASIL", desc:"Pembayaran gagal. Silakan coba lagi.", icon: XCircle, color:"bg-red-500", bg:"bg-red-500/10 border-red-500/20" },
    expired: { title:"TRANSAKSI KEDALUWARSA", desc:"Waktu pembayaran telah habis", icon: Timer, color:"bg-zinc-500", bg:"bg-zinc-500/10 border-zinc-500/20" },
  }[status as string] || { title:"PEMBAYARAN MENUNGGU", desc:"Menunggu", icon: Clock3, color:"bg-amber-500", bg:"bg-amber-500/10 border-amber-500/20" }

  const Icon = config.icon

  return (
    <div className="mx-auto max-w-[560px] px-4 md:px-6 py-8">
      <div className={`rounded-[20px] border p-6 md:p-8 text-center ${config.bg}`}>
        <div className={`mx-auto h-20 w-20 rounded-full ${config.color} grid place-items-center text-white shadow-lg`}>
          <Icon className="h-10 w-10" />
        </div>
        <h1 className="mt-5 text-[20px] font-black tracking-tight">{config.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">{config.desc}</p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 text-left">
          <div className="flex gap-3">
            <img src={peleton.image} alt="" className="h-14 w-14 rounded-xl object-cover border border-border" />
            <div>
              <div className="text-sm font-black">{peleton.name}</div>
              <div className="text-xs text-muted-foreground">{peleton.school}</div>
              <div className="text-xs font-bold tabular-nums">{qty} BALLOT • Rp{Number(total).toLocaleString("id-ID")}</div>
            </div>
          </div>
          <div className="hairline my-3" />
          <div className="grid gap-1.5 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">ID Transaksi</span><span className="font-mono font-bold">{id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Metode</span><span className="font-bold">QRIS</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="inline-flex rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white">{status.toUpperCase()}</span></div>
          </div>
        </div>

        {status==="pending" && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-bold tracking-widest">BAYAR SEBELUM</div>
            <div className="tabular-nums text-[24px] font-black text-amber-600">14:59</div>
            <div className="mx-auto mt-3 h-40 w-40 rounded-xl border border-border bg-white grid place-items-center">
              <div className="text-[10px] leading-tight text-center text-muted-foreground">QRIS<br/>Scan untuk membayar<br/><span className="font-mono text-xs">● ● ● ●</span></div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Gunakan aplikasi e-wallet atau mobile banking untuk scan QRIS</p>
          </div>
        )}

        <div className="mt-6 grid gap-2">
          {status==="success" ? (
            <>
              <Link href="/profile/dukungan"><Button className="w-full rounded-full h-11">Lihat Transaksi</Button></Link>
              <Link href="/"><Button variant="outline" className="w-full rounded-full">Kembali ke Beranda</Button></Link>
            </>
          ) : status==="pending" ? (
            <>
              <Button className="w-full rounded-full h-11" onClick={()=>window.location.href=`/checkout?status=success&id=${id}&peleton=${slug}&qty=${qty}&total=${total}`}>Saya Sudah Bayar</Button>
              <Link href="/peleton"><Button variant="outline" className="w-full rounded-full">Batal</Button></Link>
            </>
          ) : (
            <>
              <Link href={`/dukungan?peleton=${slug}`}><Button className="w-full rounded-full h-11">Coba Lagi</Button></Link>
              <Link href="/"><Button variant="outline" className="w-full rounded-full">Kembali</Button></Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-muted-foreground">
        Butuh bantuan? <a href="/kontak" className="font-semibold text-foreground hover:underline">Hubungi Panitia</a>
      </div>
    </div>
  )
}

export default function CheckoutPage(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20 pb-[72px] md:pb-0">
        <Suspense fallback={<div className="p-8 text-center">Memuat…</div>}>
          <CheckoutInner />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
