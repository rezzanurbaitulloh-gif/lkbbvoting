"use client"
import Link from "next/link"
import { useState } from "react"
import { Heart, Share2, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

export function PeletonCard({ peleton }: { peleton: any; rank?: number }) {
  const { toggleFavorite, isFavorite } = useApp()
  const fav = isFavorite(peleton.id)
  const [shareOpen, setShareOpen] = useState(false)
  const photo = peleton.image_url || peleton.image
  const logo = peleton.logo_url || peleton.image_url || peleton.image
  const number = peleton.number
  const name = peleton.name
  const slug = peleton.slug
  const category = peleton.category

  const profileUrl = `/peleton/${slug}`
  const supportUrl = `/dukungan?peleton=${slug}`

  const handleShare = async (type: "profile" | "support") => {
    const url = `${window.location.origin}${type === "profile" ? profileUrl : supportUrl}`
    if (navigator.share) {
      try { await navigator.share({ title: name, url }); return } catch {}
    }
    await navigator.clipboard.writeText(url)
    alert(`Link ${type === "profile" ? "profil" : "dukungan"} disalin: ${url}`)
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[16px] border border-border bg-card shadow-subtle hover:shadow-soft transition-all duration-300">
      {/* Team Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={photo} alt={name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-black/70 backdrop-blur px-2.5 py-1 text-[11px] font-black tracking-widest text-white border border-white/10">
          #{number}
        </div>
        <button onClick={() => toggleFavorite(peleton.id)} aria-label="favorite" className={cn("absolute right-3 top-3 h-8 w-8 grid place-items-center rounded-full backdrop-blur border transition-colors", fav ? "bg-[#A51D2D] border-[#A51D2D] text-white" : "bg-black/40 border-white/15 text-white hover:bg-black/60")}>
          <Heart className={cn("h-3.5 w-3.5", fav && "fill-white")} />
        </button>
        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold tracking-widest text-black border border-white/20">
          {category}
        </div>
      </div>

      {/* Content: Number + Name + Logo */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold tracking-[0.14em] text-gold">#{number}</div>
            <h3 className="text-[15px] font-black leading-tight tracking-tight text-foreground line-clamp-2 text-balance">{name}</h3>
            <p className="text-[12px] font-medium text-muted-foreground line-clamp-1">{peleton.school || ""}</p>
          </div>
          <img src={logo} alt="logo" className="h-12 w-12 rounded-xl object-cover border border-border bg-muted shrink-0" />
        </div>

        <Link href={supportUrl} className="mt-4">
          <Button size="sm" className="w-full rounded-full h-9 font-black tracking-wide">DUKUNG</Button>
        </Link>

        <div className="mt-2 flex gap-2 justify-end">
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => handleShare("profile")} aria-label="Bagikan Profil">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8" onClick={() => handleShare("support")} aria-label="Bagikan Dukungan">
            <QrCode className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
