"use client"
import Link from "next/link"
import { Heart, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/store"
import type { Peleton } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PeletonCard({ peleton, rank }: { peleton: Peleton; rank?: number }) {
  const { toggleFavorite, isFavorite } = useApp()
  const fav = isFavorite(peleton.id)
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[16px] border border-border bg-card shadow-subtle transition-all duration-300 hover:shadow-soft hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={peleton.image} alt={peleton.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {/* Rank */}
        {rank && (
          <div className="absolute left-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#0B0C0F] px-2.5 text-xs font-black tracking-widest text-white border border-white/15 shadow-lg">
            #{String(rank).padStart(2,"0")}
          </div>
        )}
        {!rank && (
          <div className="absolute left-3 top-3 rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-[11px] font-bold tracking-widest text-white border border-white/10">
            #{peleton.number}
          </div>
        )}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button onClick={(e)=>{e.preventDefault(); toggleFavorite(peleton.id)}} aria-label="favorite" className={cn("h-8 w-8 grid place-items-center rounded-full backdrop-blur border transition-colors", fav ? "bg-[#A51D2D] border-[#A51D2D] text-white" : "bg-black/40 border-white/15 text-white hover:bg-black/60")}>
            <Heart className={cn("h-3.5 w-3.5", fav && "fill-white")} />
          </button>
        </div>
        <div className="absolute bottom-0 inset-x-0 p-3 flex items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase">{peleton.category} • {peleton.province}</div>
            <div className="text-[11px] text-white/60 flex items-center gap-1"><MapPin className="h-3 w-3"/>{peleton.city}</div>
          </div>
          <Badge variant={peleton.category==="SMA" ? "crimson" : "gold"} className="shrink-0 text-[10px]">{peleton.category}</Badge>
        </div>
      </div>
      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-extrabold leading-tight tracking-tight text-foreground line-clamp-1">{peleton.name}</h3>
        <p className="text-[13px] font-medium text-muted-foreground line-clamp-1">{peleton.school}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">#{peleton.number} • 16 Anggota</div>
          <div className="h-1 w-12 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gold" style={{width: `${Math.min(100, (peleton.support/32000)*100)}%`}}/></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/peleton/${peleton.slug}`} className="contents">
            <Button variant="outline" size="sm" className="rounded-full w-full">Detail</Button>
          </Link>
          <Link href={`/dukungan?peleton=${peleton.slug}`} className="contents">
            <Button size="sm" className="rounded-full w-full">Dukung</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
