import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PeletonCard } from "@/components/peleton/PeletonCard"

export function Featured({ peletons, showSementara, showFinal }: { peletons: any[]; showSementara?: boolean; showFinal?: boolean }){
  const smp = (peletons || []).filter((p:any)=> p.category==="SMP")
  const sma = (peletons || []).filter((p:any)=> p.category==="SMA")
  const hasBadge = showSementara || showFinal
  return (
    <section className="bg-[#08090B] border-y border-border/50">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8 md:py-10">
        {hasBadge && (
          <div className="flex justify-center mb-4">
            {showSementara && <span className="inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-3 py-1 text-xs font-black tracking-wide">HASIL SEMENTARA</span>}
            {showFinal && <span className="inline-flex rounded-full bg-[#C9A86A] text-white px-3 py-1 text-xs font-black tracking-wide">HASIL FINAL</span>}
          </div>
        )}
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-[0.16em] text-[#C9A86A]">PESERTA</div>
            <h2 className="mt-1 text-[18px] md:text-[22px] font-black tracking-tight text-white">DUKUNG PELETON FAVORITMU!</h2>
            <p className="mt-1 text-xs text-white/50">Beranda selalu urut display_order — peringkat disembunyikan saat voting aktif</p>
          </div>
          <Link href="/tim" className="hidden md:inline-flex text-xs font-semibold text-[#C9A86A] hover:text-white gap-1 items-center">LIHAT SEMUA <ArrowRight className="h-3 w-3"/></Link>
        </div>

        {/* SMP */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex rounded-full bg-white text-[#08090B] px-3 py-1 text-xs font-black">SMP / SEDERAJAT</span>
            <span className="text-xs text-white/50">{smp.length} tim</span>
          </div>
          {smp.length===0 ? <p className="text-xs text-white/40">Belum ada peleton SMP.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {smp.map((p:any)=> <PeletonCard key={p.id} peleton={{...p, image: p.image_url || p.image, cover: p.image_url || p.cover}} />)}
          </div>
          )}
        </div>

        {/* SMA */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex rounded-full bg-white text-[#08090B] px-3 py-1 text-xs font-black">SMA / SEDERAJAT</span>
            <span className="text-xs text-white/50">{sma.length} tim</span>
          </div>
          {sma.length===0 ? <p className="text-xs text-white/40">Belum ada peleton SMA.</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sma.map((p:any)=> <PeletonCard key={p.id} peleton={{...p, image: p.image_url || p.image, cover: p.image_url || p.cover}} />)}
          </div>
          )}
        </div>

        <Link href="/tim" className="mt-6 flex md:hidden">
          <Button variant="outline" className="w-full rounded-full bg-transparent border-white/15 text-white">Lihat Semua</Button>
        </Link>
      </div>
    </section>
  )
}
