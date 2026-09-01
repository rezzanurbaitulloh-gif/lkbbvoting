"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Menu, X, Heart, User, Trophy, Home, Users, Calendar, Info } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { useApp } from "@/lib/store"

const nav = [
  { href: "/", label: "Beranda" },
  { href: "/peleton", label: "Peleton" },
  { href: "/klasemen", label: "Klasemen" },
  { href: "/kompetisi", label: "Kompetisi" },
  { href: "/galeri", label: "Galeri" },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { currentUser } = useApp()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-[64px] max-w-[1280px] items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-[#C9A86A30] bg-[#0B0C0F] flex items-center justify-center">
            <img src="/assets/brand/lkbb-logo.jpg" alt="LKBB" className="h-full w-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-extrabold tracking-[-0.02em] text-foreground">LKBB</span>
              <span className="text-[11px] font-bold tracking-[0.14em] text-gold">JAVASOMA</span>
            </div>
            <div className=" -mt-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground">THE IMPRESSION • 2026</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {nav.map(item=> {
            const active = pathname===item.href || (item.href!=="/" && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} className={cn("rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors", active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted")}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Link href="/search" className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors">
            <Search className="h-4 w-4 text-muted-foreground" />
          </Link>
          <ThemeToggle />
          <Link href={currentUser ? "/profile" : "/login"} className="hidden md:inline-flex">
            <Button variant="outline" size="sm" className="rounded-full gap-1.5">
              <User className="h-3.5 w-3.5" /> {currentUser ? currentUser.name.slice(0,8) : "Masuk"}
            </Button>
          </Link>
          <Link href="/peleton" className="hidden md:inline-flex">
            <Button size="sm" className="rounded-full px-5">Dukung</Button>
          </Link>
          <button onClick={()=>setOpen(!open)} className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-border">
            {open ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}
          </button>
        </div>
      </div>
      {/* Mobile sheet */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="mx-auto max-w-[1280px] p-4 grid gap-1">
            {nav.map(item=> (
              <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium", pathname===item.href ? "bg-secondary" : "hover:bg-muted")}>
                {item.label}
              </Link>
            ))}
            <div className="hairline my-2" />
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={()=>setOpen(false)}><Button variant="outline" className="w-full rounded-full">Masuk</Button></Link>
              <Link href="/peleton" onClick={()=>setOpen(false)}><Button className="w-full rounded-full">Dukung Sekarang</Button></Link>
            </div>
            <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
              <Link href="/tentang">Tentang</Link>
              <Link href="/kontak">Kontak</Link>
              <Link href="/faq">FAQ</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
