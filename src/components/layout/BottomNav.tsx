"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"

// 4 MENU UTAMA — konsisten dengan Navbar
const items = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/tim", label: "Tim", icon: Users },
  { href: "/kompetisi", label: "Kompetisi", icon: Trophy },
  { href: "/profile", label: "Profil", icon: User },
]

export function BottomNav(){
  const path = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl md:hidden pb-safe">
      <div className="grid grid-cols-4">
        {items.map(({href,label,icon:Icon})=>{
          const active = path===href || (href!=="/" && path.startsWith(href))
          return (
            <Link key={href} href={href} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium", active ? "text-foreground" : "text-muted-foreground")}>
              <Icon className={cn("h-5 w-5", active && "text-gold")} strokeWidth={active?2.2:1.8} />
              <span className={cn("tracking-wide", active && "font-bold")}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
