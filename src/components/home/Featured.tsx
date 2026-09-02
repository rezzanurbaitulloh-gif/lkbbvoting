import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PeletonCard } from "@/components/peleton/PeletonCard"

export function Featured({ peletons, showSementara, showFinal }: { peletons: any[]; showSementara?: boolean; showFinal?: boolean }){
  // Beranda harus urut nomor peserta (01,02,03...) — bukan ranking
  const sorted = [...(peletons || [])].sort((a:any,b:any)=>{
    const an = String(a.number||a.display_order||"").padStart(4,"0")
    const bn = String(b.number||b.display_order||"").padStart(4,"0")
    if(an!==bn) return an.localeCompare(bn)
    return (a.display_order||0)-(b.display_order||0)
  })
  const smp = sorted.filter((p:any)=> p.category==="SMP")
  const sma = sorted.filter((p:any)=> p.category==="SMA")
  const hasBadge = showSementara || showFinal
  return (
    <section className="bg-[#08090B] border-y border-border/50 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10">
        {hasBadge && (
          <div className="flex justify-center mb-4 px-2">
            {showSementara && <span className="inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-3 py-1 text-[11px] sm:text-xs font-black tracking-wide text-center max-w-full">HASIL SEMENTARA</span>}
            {showFinal && <span className="inline-flex rounded-full bg-[#C9A86A] text-white px-3 py-1 text-[11px] sm:text-xs font-black tracking-wide text-center max-w-full">HASIL FINAL</span>}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] sm:tracking-[0.16em] text-[#C9A86A]">PESERTA</div>
            <h2 className="mt-1 text-[16px] sm:text-[18px] md:text-[22px] font-black tracking-tight text-white leading-tight break-words">DUKUNG PELETON FAVORITMU!</h2>
            <p className="mt-1 text-[11px] sm:text-xs text-white/50 leading-snug">Beranda selalu urut nomor peserta (01, 02, 03...) — peringkat disembunyikan saat voting aktif</p>
          </div>
          <Link href="/tim" className="hidden md:inline-flex text-xs font-semibold text-[#C9A86A] hover:text-white gap-1 items-center shrink-0">LIHAT SEMUA <ArrowRight className="h-3 w-3"/></Link>
        </div>

        {/* SMP */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex rounded-full bg-white text-[#08090B] px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-black">SMP / SEDERAJAT</span>
            <span className="text-[11px] sm:text-xs text-white/50">{smp.length} tim</span>
          </div>
          {smp.length===0 ? <p className="text-xs text-white/40">Belum ada peleton SMP.</p> : (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {smp.map((p:any)=> <PeletonCard key={p.id} peleton={{...p, image: p.image_url || p.image, cover: p.image_url || p.cover}} />)}
          </div>
          )}
        </div>

        {/* SMA */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex rounded-full bg-white text-[#08090B] px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-black">SMA / SEDERAJAT</span>
            <span className="text-[11px] sm:text-xs text-white/50">{sma.length} tim</span>
          </div>
          {sma.length===0 ? <p className="text-xs text-white/40">Belum ada peleton SMA.</p> : (
          <div className="grid grid-cols-1 min-[360px]:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
