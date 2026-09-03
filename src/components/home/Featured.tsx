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
    <section className="relative bg-[#08090B] border-y border-[#C9A86A]/10 overflow-hidden">
      {/* premium subtle gold glow behind */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_400px_at_20%_0%,rgba(201,168,106,0.07),transparent_60%)]" />
      <div className="pointer-events-none absolute top-0 inset-x-0 h-px gold-hairline-premium opacity-60" />
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-6 py-8 sm:py-10 md:py-12 relative">
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
            <h2 className="mt-3 text-[22px] sm:text-[26px] md:text-[30px] font-black tracking-[-0.03em] text-white leading-[0.9] break-words font-display">DUKUNG PELETON <span className="gold-gradient-text">FAVORITMU!</span></h2>
            <p className="mt-3 text-[13px] sm:text-sm text-white/50 leading-relaxed max-w-xl">Beranda selalu urut nomor peserta (01, 02, 03...) — peringkat disembunyikan saat voting aktif. Pilih peleton dan beri dukungan terbaik.</p>
          </div>
          <Link href="/tim" className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#C9A86A]/20 bg-white/[0.02] hover:bg-[#C9A86A]/10 px-4 py-2 text-xs font-semibold text-[#C9A86A] hover:text-white transition-colors shrink-0">LIHAT SEMUA <ArrowRight className="h-3 w-3"/></Link>
        </div>

        {/* SMP */}
        <div className="mt-10">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="inline-flex rounded-full bg-white text-[#08090B] px-4 py-1.5 text-xs font-black tracking-wide">SMP / SEDERAJAT</span>
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
            <span className="inline-flex rounded-full bg-white text-[#08090B] px-4 py-1.5 text-xs font-black tracking-wide">SMA / SEDERAJAT</span>
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
