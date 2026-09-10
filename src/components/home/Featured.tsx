import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PeletonCard } from "@/components/peleton/PeletonCard"

export function Featured({ peletons, showSementara, showFinal }: { peletons: any[]; showSementara?: boolean; showFinal?: boolean }){
  // Beranda harus urut nomor peserta per kategori (SMP 01,02.. terpisah SMA 01,02..) — nomor = urutan tampil
  const sorted = [...(peletons || [])].sort((a:any,b:any)=>{
    if(a.category!==b.category) return String(a.category).localeCompare(String(b.category))
    return parseInt(String(a.number).replace(/^0+/,"")||"0") - parseInt(String(b.number).replace(/^0+/,"")||"0")
  })
  const smp = sorted.filter((p:any)=> p.category==="SMP")
  const sma = sorted.filter((p:any)=> p.category==="SMA")
  const hasBadge = showSementara || showFinal
  return (
    <section className="relative bg-[#09090b] border-y border-white/[0.06] overflow-hidden">
      {/* premium subtle gold glow behind — lebih menyatu */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(860px_420px_at_18%_-10%,rgba(201,168,106,0.08),transparent_62%)]" />
      <div className="pointer-events-none absolute top-0 inset-x-0 h-[0.5px] bg-gradient-to-r from-transparent via-[#C9A86A]/22 to-transparent opacity-80" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-6 py-10 sm:py-12 md:py-14 relative">
        {hasBadge && (
          <div className="flex justify-center mb-4 px-2">
            {showSementara && <span className="inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-3 py-1 text-[11px] sm:text-xs font-black tracking-wide text-center max-w-full shadow">HASIL SEMENTARA</span>}
            {showFinal && <span className="inline-flex rounded-full bg-gradient-to-r from-[#C9A86A] to-[#8C6A2A] text-white px-3 py-1 text-[11px] sm:text-xs font-black tracking-wide text-center max-w-full shadow">HASIL FINAL</span>}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#C9A86A]/60 hidden sm:block" />
              <span className="text-[11px] font-bold tracking-[0.18em] text-[#C9A86A]">PESERTA</span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#C9A86A]/60 hidden sm:block" />
            </div>
            <h2 className="mt-3 text-[22px] sm:text-[26px] md:text-[30px] font-black tracking-[-0.032em] text-white leading-[0.92] break-words font-display">DUKUNG PELETON <span className="gold-gradient-text">FAVORITMU!</span></h2>
            <p className="mt-3 text-[13px] sm:text-[13.5px] text-white/60 leading-relaxed max-w-xl">Beranda urut nomor tampil (01, 02, 03…) — SMP & SMA terpisah. Peringkat disembunyikan saat voting aktif.</p>
          </div>
          <Link href="/tim" className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#C9A86A]/20 bg-white/[0.02] hover:bg-[#C9A86A]/10 px-4 py-2 text-xs font-semibold text-[#C9A86A] hover:text-white transition-colors shrink-0">LIHAT SEMUA <ArrowRight className="h-3 w-3"/></Link>
        </div>

        {/* SMP */}
        <div className="mt-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex rounded-full bg-white text-[#09090b] px-4 py-1.5 text-xs font-black tracking-wide">SMP / SEDERAJAT</span>
            <span className="text-xs font-medium text-white/50 bg-white/5 px-2.5 py-1 rounded-full">{smp.length} tim</span>
          </div>
          {smp.length===0 ? <p className="text-sm text-white/40 py-6 text-center border border-dashed border-white/10 rounded-xl">Belum ada peleton SMP.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {smp.map((p:any)=> <PeletonCard key={p.id} peleton={{...p, image: p.image_url || p.image, cover: p.image_url || p.cover}} />)}
          </div>
          )}
        </div>

        {/* SMA */}
        <div className="mt-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex rounded-full bg-white text-[#09090b] px-4 py-1.5 text-xs font-black tracking-wide">SMA / SEDERAJAT</span>
            <span className="text-xs font-medium text-white/50 bg-white/5 px-2.5 py-1 rounded-full">{sma.length} tim</span>
          </div>
          {sma.length===0 ? <p className="text-sm text-white/40 py-6 text-center border border-dashed border-white/10 rounded-xl">Belum ada peleton SMA.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sma.map((p:any)=> <PeletonCard key={p.id} peleton={{...p, image: p.image_url || p.image, cover: p.image_url || p.cover}} />)}
          </div>
          )}
        </div>

        <Link href="/tim" className="mt-6 flex md:hidden">
          <Button variant="outline" className="w-full rounded-full bg-transparent border-white/15 text-white h-10 text-sm">Lihat Semua</Button>
        </Link>
      </div>
    </section>
  )
}
