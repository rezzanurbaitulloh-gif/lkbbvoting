"use client"
import Link from "next/link"
import { Heart, Share2, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"

export function PeletonCard({ peleton }: { peleton: any }){
  const { toggleFavorite, isFavorite } = useApp()
  const { toast } = useToast()
  const fav = isFavorite(peleton.id)
  const photo = peleton.image_url || peleton.image
  const logo = peleton.logo_url || peleton.image_url || peleton.image
  const number = peleton.number
  const name = peleton.name
  const slug = peleton.slug
  const category = peleton.category
  const profileUrl = `/tim/${slug}`
  const supportUrl = `/dukungan?peleton=${slug}`

  const handleShare = async (type: "profile" | "support") => {
    const url = `${window.location.origin}${type === "profile" ? profileUrl : supportUrl}`
    if (navigator.share) {
      try { await navigator.share({ title: name, url }); toast({ title: "Berhasil dibagikan", description: url }); return } catch {}
    }
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: type==="profile" ? "Link profil disalin" : "Link dukungan disalin", description: url, variant: "success" })
    } catch {
      toast({ title: "Gagal menyalin", description: url, variant: "error" })
    }
  }

  const handleFav = ()=>{
    toggleFavorite(peleton.id)
    toast({ title: fav ? "Dihapus dari favorit" : "Ditambahkan ke favorit", description: name })
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[16px] border border-border bg-card shadow-subtle hover:shadow-soft transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={photo} alt={name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-black/70 backdrop-blur px-2.5 py-1 text-[11px] font-black tracking-widest text-white border border-white/10">
          #{number}
        </div>
        <button onClick={handleFav} aria-label="favorite" className={cn("absolute right-3 top-3 h-8 w-8 grid place-items-center rounded-full backdrop-blur border transition-colors", fav ? "bg-[#A51D2D] border-[#A51D2D] text-white" : "bg-black/40 border-white/15 text-white hover:bg-black/60")}>
          <Heart className={cn("h-3.5 w-3.5", fav && "fill-white")} />
        </button>
        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold tracking-widest text-black border border-white/20">
          {category}
        </div>
      </div>
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
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-full h-8 w-full" onClick={() => handleShare("profile")} aria-label="Bagikan Profil">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" className="rounded-full h-8 w-full" onClick={() => handleShare("support")} aria-label="Bagikan Dukungan">
            <QrCode className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Compact variant for /tim — only #number, name, logo, ordered by total_ballots but number stays original
export function PeletonCardCompact({ peleton, rank }: { peleton: any, rank?: number }){
  const logo = peleton.logo_url || peleton.image_url || peleton.image
  return (
    <Link href={`/dukungan?peleton=${peleton.slug}`} className="flex items-center gap-3 rounded-[16px] border border-border bg-card p-3 hover:bg-muted/50 transition-colors">
      {rank && <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-black shrink-0 ${rank===1 ? "bg-[#C9A86A] text-[#0B0C0F]" : rank===2 ? "bg-[#9AA0A9] text-white" : rank===3 ? "bg-[#B45309] text-white" : "bg-muted text-foreground"}`}>{rank}</div>}
      <div className="h-11 w-11 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
        <img src={logo} alt={peleton.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold tracking-[0.12em] text-gold">#{peleton.number}</div>
        <div className="text-sm font-black leading-tight truncate">{peleton.name}</div>
        <div className="text-xs text-muted-foreground truncate">{peleton.school}</div>
      </div>
      <div className="hidden sm:block text-[11px] font-bold text-muted-foreground">#{peleton.number}</div>
    </Link>
  )
}
