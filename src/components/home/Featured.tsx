import Link from "next/link"
import { peletons, getRankedPeletons } from "@/lib/data"
import { PeletonCard } from "@/components/peleton/PeletonCard"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Featured(){
  const featured = getRankedPeletons().slice(0,6)
  return (
    <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-10 md:py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="label-gold">Peserta LKBB</span>
          </div>
          <h2 className="mt-2 text-[22px] md:text-[28px] font-extrabold tracking-[-0.03em] leading-none text-foreground">PELETON PILIHAN</h2>
          <p className="mt-1 text-sm text-muted-foreground">Kenali dan dukung peleton favoritmu.</p>
        </div>
        <Link href="/peleton" className="hidden md:inline-flex">
          <Button variant="outline" className="rounded-full gap-2">Lihat Semua Tim <ArrowRight className="h-4 w-4"/></Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {featured.map((p, i)=> <PeletonCard key={p.id} peleton={p} rank={i+1} />)}
      </div>

      <Link href="/peleton" className="mt-6 flex md:hidden">
        <Button variant="outline" className="w-full rounded-full">Lihat Semua Tim</Button>
      </Link>
    </section>
  )
}
