import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { PeletonCard } from "@/components/peleton/PeletonCard"

export function Featured({ peletons }: { peletons: any[] }){
  const featured = (peletons || []).slice(0,4)
  return (
    <section className="bg-[#08090B] border-y border-border/50">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8 md:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-[0.16em] text-[#C9A86A]">PESERTA</div>
            <h2 className="mt-1 text-[18px] md:text-[22px] font-black tracking-tight text-white">DUKUNG PELETON FAVORITMU!</h2>
            <p className="mt-1 text-xs text-white/50">Pilih peleton dan berikan dukunganmu</p>
          </div>
          <Link href="/peleton" className="hidden md:inline-flex text-xs font-semibold text-[#C9A86A] hover:text-white gap-1 items-center">LIHAT SEMUA <ArrowRight className="h-3 w-3"/></Link>
        </div>
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {featured.map((p:any)=> <PeletonCard key={p.id} peleton={{...p, image: p.image_url || p.image, cover: p.image_url || p.cover}} />)}
        </div>
        <Link href="/peleton" className="mt-6 flex md:hidden">
          <Button variant="outline" className="w-full rounded-full bg-transparent border-white/15 text-white">Lihat Semua</Button>
        </Link>
      </div>
    </section>
  )
}
