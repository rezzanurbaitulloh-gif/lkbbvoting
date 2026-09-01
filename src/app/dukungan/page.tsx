"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { peletons } from "@/lib/data"
import { competitionConfig } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/store"
import Link from "next/link"
import { Minus, Plus, ShieldCheck, ArrowRight } from "lucide-react"

function DukunganInner(){
  const sp = useSearchParams()
  const router = useRouter()
  const slug = sp.get("peleton")
  const peleton = peletons.find(p=>p.slug===slug) || peletons[0]
  const [qty,setQty]=useState(50)
  const { addTransaction } = useApp()
  const pkg = competitionConfig.packages.find(p=>p.supports===qty)
  const pricePer = competitionConfig.prices.online
  const total = qty * pricePer

  const quick = [10,50,100,300]

  const handlePay = ()=>{
    const tx = {
      id: "TRX-" + Date.now().toString().slice(-8),
      date: new Date().toISOString(),
      peletonId: peleton.id,
      peletonName: peleton.name,
      amount: total,
      supports: qty,
      method: "QRIS",
      status: "Success" as const,
    }
    addTransaction(tx)
    router.push(`/checkout?status=success&id=${tx.id}&peleton=${peleton.slug}&qty=${qty}&total=${total}`)
  }

  return (
    <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
      {/* Left */}
      <div className="space-y-4">
        <div className="rounded-[16px] border border-border bg-card overflow-hidden">
          <div className="h-2 bg-gold" />
          <div className="p-5 flex gap-4">
            <img src={peleton.image} alt="" className="h-20 w-20 rounded-xl object-cover border border-border" />
            <div className="min-w-0">
              <div className="flex gap-2">
                <Badge variant="gold">#{peleton.number}</Badge>
                <Badge variant="outline">{peleton.category}</Badge>
              </div>
              <div className="mt-1 text-[16px] font-black leading-tight">{peleton.name}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">{peleton.school} • {peleton.city}</div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              Dukungan untuk <b className="text-foreground">{peleton.name}</b> akan tercatat sebagai ballot resmi setelah pembayaran berhasil. Hanya peringkat yang ditampilkan ke publik.
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-border bg-card p-5">
          <h3 className="text-sm font-black">Pilih Paket Dukungan</h3>
          <p className="text-xs text-muted-foreground">Harga resmi: Rp3.000 / ballot (online)</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {competitionConfig.packages.map(p=> (
              <button key={p.supports} onClick={()=>setQty(p.supports)} className={`relative rounded-xl border p-4 text-left transition-colors ${qty===p.supports ? "border-[#C9A86A] bg-[#C9A86A0A]" : "border-border bg-card hover:border-border-strong"}`}>
                {p.popular && <span className="absolute -top-2 right-3 rounded-full bg-gold px-2 py-0.5 text-[10px] font-black text-gold-foreground">POPULER</span>}
                <div className="text-xs font-bold tracking-widest text-muted-foreground">{p.label.toUpperCase()}</div>
                <div className="mt-1 text-[18px] font-black tabular-nums">Rp{(p.price).toLocaleString("id-ID")}</div>
                <div className="text-xs text-muted-foreground">{p.supports} ballot</div>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="label-ceremonial">Atur Jumlah Ballot</div>
            <div className="mt-2 flex items-center gap-3">
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="h-11 w-11 rounded-full border border-border grid place-items-center hover:bg-muted"><Minus className="h-4 w-4"/></button>
              <div className="flex-1 rounded-full border border-border bg-muted h-11 grid place-items-center font-black tabular-nums">{qty}</div>
              <button onClick={()=>setQty(q=>q+1)} className="h-11 w-11 rounded-full border border-border grid place-items-center hover:bg-muted"><Plus className="h-4 w-4"/></button>
            </div>
            <div className="mt-2 flex gap-1.5">
              {quick.map(n=> (
                <button key={n} onClick={()=>setQty(n)} className={`flex-1 rounded-full py-2 text-xs font-bold border ${qty===n ? "bg-foreground text-background border-foreground" : "bg-card border-border"}`}>{n}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right - summary */}
      <div className="lg:sticky lg:top-[76px] h-fit space-y-4">
        <div className="rounded-[16px] border border-border bg-card p-5">
          <h3 className="text-sm font-black">Ringkasan Dukungan</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Peleton</span><span className="font-bold">{peleton.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Jumlah Ballot</span><span className="font-bold tabular-nums">{qty}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Harga per ballot</span><span className="tabular-nums">Rp{pricePer.toLocaleString("id-ID")}</span></div>
            <div className="hairline my-3" />
            <div className="flex justify-between text-[16px]"><span className="font-bold">Total</span><span className="font-black tabular-nums">Rp{total.toLocaleString("id-ID")}</span></div>
          </div>
          <Button onClick={handlePay} className="mt-5 w-full rounded-full h-[46px] gap-2">Lanjutkan ke Pembayaran <ArrowRight className="h-4 w-4"/></Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">Dengan melanjutkan, kamu akan diarahkan ke halaman pembayaran QRIS.</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4"/> Pembayaran aman & tercatat otomatis</div>
        </div>

        <div className="rounded-[16px] border border-border bg-card p-4">
          <h4 className="text-xs font-black tracking-wide">Cara Dukung</h4>
          <ol className="mt-2 grid gap-1.5 text-xs leading-relaxed text-muted-foreground list-decimal list-inside">
            <li>Pilih peleton favoritmu</li>
            <li>Tentukan jumlah ballot</li>
            <li>Selesaikan pembayaran QRIS</li>
            <li>Dukungan tercatat otomatis</li>
          </ol>
        </div>

        <div className="text-center">
          <Link href="/peleton" className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Kembali ke daftar peleton</Link>
        </div>
      </div>
    </div>
  )
}

export default function DukunganPage(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-[1080px] px-4 md:px-6 py-4">
            <div className="label-gold">Dukung Tim</div>
            <h1 className="text-[20px] font-black tracking-tight">DUKUNG PELETON FAVORITMU</h1>
          </div>
        </div>
        <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Memuat…</div>}>
          <DukunganInner />
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
