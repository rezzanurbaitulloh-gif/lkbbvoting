"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/store"
import { createBrowserSupabase } from "@/lib/supabase"

export default function InvoicePage(){
  const params = useParams() as { id: string }
  const id = params.id
  const { currentUser } = useApp()
  const [tx, setTx] = useState<any>(null)
  const [peleton, setPeleton] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(()=>{
    if(!id) return
    const fetchTx = async ()=>{
      setLoading(true)
      try{
        const res = await fetch(`/api/transactions?id=${id}`)
        if(!res.ok){
          const j = await res.json().catch(()=> ({}))
          throw new Error(j.error || "Gagal memuat transaksi")
        }
        const data = await res.json()
        // API returns single object when id query, or array
        const t = Array.isArray(data) ? data[0] : data
        if(!t || t.error) throw new Error("Transaksi tidak ditemukan")
        setTx(t)
        // fetch peleton detail for invoice
        if(t.peleton_id){
          const sup = createBrowserSupabase()
          const { data: p } = await sup.from("peletons").select("name,school,category,number,logo_url,image_url").eq("id", t.peleton_id).single()
          if(p) setPeleton(p)
          else if(t.peletons) setPeleton(t.peletons)
        } else if(t.peletons){
          setPeleton(t.peletons)
        }
      }catch(e:any){
        setError(e.message || "Gagal")
      }finally{
        setLoading(false)
      }
    }
    fetchTx()
  },[id])

  if(!currentUser){
    return (
      <div className="min-h-screen flex flex-col bg-[#08090B] text-white">
        <Navbar />
        <main className="flex-1 grid place-items-center p-8 bg-[#08090B]">
          <div className="text-center rounded-2xl border border-white/10 bg-[#111318] p-8">
            <div className="text-sm font-black">Belum Masuk</div>
            <p className="text-sm text-white/60">Masuk untuk melihat invoice.</p>
            <Link href="/login"><Button className="mt-3 rounded-full">Masuk</Button></Link>
          </div>
        </main>
        <Footer /><BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] text-white">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 bg-[#08090B]">
        <div className="mx-auto max-w-[720px] px-3 sm:px-4 md:px-6 py-6">
          <Link href="/profile/dukungan" className="text-xs font-semibold text-white/60 hover:text-white">← Kembali ke Riwayat</Link>
          <h1 className="mt-2 text-[22px] font-black tracking-tight">INVOICE TRANSAKSI</h1>
          <p className="text-xs text-white/50">Detail lengkap transaksi dukungan — simpan sebagai bukti</p>

          {loading ? (
            <div className="mt-6 rounded-[16px] border border-white/10 bg-[#111318] p-8 text-center text-sm text-white/60">Memuat invoice...</div>
          ) : error ? (
            <div className="mt-6 rounded-[16px] border border-red-500/20 bg-red-500/10 p-8 text-center text-sm text-red-400">{error}</div>
          ) : tx ? (
            <div className="mt-6 space-y-4">
              {/* Invoice Card */}
              <div className="rounded-[16px] border border-white/10 bg-[#111318] overflow-hidden">
                <div className="h-1 bg-[var(--primary)]" />
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold tracking-[0.14em] text-[var(--primary)]">LKBB JAVASOMA — INVOICE</div>
                      <div className="mt-1 font-mono text-xs text-white/60">ID: {tx.id}</div>
                      <div className="font-mono text-xs text-white/60">Ref: {tx.provider_ref || tx.doku_reference_no || "-"}</div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${tx.status==="Success" ? "bg-emerald-500 text-white" : tx.status==="Pending" ? "bg-amber-500 text-white" : "bg-red-500 text-white"}`}>{tx.status}</div>
                      <div className="mt-1 text-xs text-white/50">{new Date(tx.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</div>
                    </div>
                  </div>

                  <div className="hairline my-4 bg-white/10" />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] font-bold tracking-widest text-white/40">PELETON</div>
                      <div className="mt-2 flex gap-3">
                        <div className="h-12 w-12 bg-transparent grid place-items-center shrink-0">
                          <img src={peleton?.logo_url || peleton?.image_url || "/assets/brand/lkbb-logo.jpg"} alt="" className="h-full w-full object-contain bg-transparent" />
                        </div>
                        <div>
                          <div className="text-sm font-black">{peleton?.name || tx.peletons?.name || "-"}</div>
                          <div className="text-xs text-white/60">{peleton?.school || ""}</div>
                          <div className="text-xs text-white/50">#{peleton?.number || ""} • {peleton?.category || ""}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold tracking-widest text-white/40">PEMBAYAR</div>
                      <div className="mt-2">
                        <div className="text-sm font-bold">{currentUser.name}</div>
                        <div className="text-xs text-white/60">{currentUser.email}</div>
                        <div className="text-xs text-white/50">User ID: {currentUser.id.slice(0,8)}...</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between"><span className="text-white/50">Jumlah Ballot</span><span className="font-black tabular-nums">{tx.supports} ballot</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Harga per Ballot</span><span className="tabular-nums">Rp{tx.supports ? Math.round(tx.amount / tx.supports).toLocaleString("id-ID") : tx.amount?.toLocaleString("id-ID")}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Metode</span><span className="font-bold">{tx.method || "QRIS"} • {tx.provider || "DOKU"}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Provider Ref</span><span className="font-mono text-xs">{tx.provider_ref?.slice(0,16) || "-"}...</span></div>
                      {tx.expires_at && <div className="flex justify-between"><span className="text-white/50">Kadaluarsa</span><span className="text-xs">{new Date(tx.expires_at).toLocaleString("id-ID")}</span></div>}
                      <div className="hairline my-2 bg-white/10" />
                      <div className="flex justify-between text-[16px]"><span className="font-bold">Total Bayar</span><span className="font-black tabular-nums text-[var(--primary)]">Rp{Number(tx.amount).toLocaleString("id-ID")}</span></div>
                    </div>
                  </div>

                  {tx.qr_content && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white p-4 flex flex-col items-center">
                      <div className="text-xs font-bold tracking-widest text-black/60">QRIS CONTENT</div>
                      <div className="mt-2 font-mono text-[10px] break-all text-black/70 max-w-full">{tx.qr_content.slice(0,80)}...</div>
                      <div className="text-[11px] text-black/50 mt-1">Simpan QR ini sebagai bukti</div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-full bg-white text-black hover:bg-white/90" onClick={()=> window.print()}>Cetak Invoice</Button>
                    <Link href="/profile/dukungan"><Button variant="ghost" className="rounded-full border border-white/15 text-white hover:bg-white/10">Kembali</Button></Link>
                  </div>

                  <div className="mt-4 text-[11px] text-white/30 text-center">Invoice ini sah sebagai bukti transaksi digital LKBB JAVASOMA THE IMPRESSION — Astra Dharma Hayuning Budaya</div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#111318] p-4">
                <h3 className="text-xs font-black tracking-wide">BANTUAN</h3>
                <p className="mt-1 text-xs text-white/50">Jika status masih Pending setelah bayar via DOKU Sandbox, gunakan Cek Status di halaman Checkout atau hubungi panitia via Kontak.</p>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
