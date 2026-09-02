"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, Menu, Heart, User, Trophy, Home, Users, Calendar, Info, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { SoundControl } from "./SoundControl"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useApp } from "@/lib/store"

// 4 MENU UTAMA sesuai ATURAN UTAMA: [Beranda, Tim, Kompetisi, Profile]
const nav = [
  { href: "/", label: "Beranda" },
  { href: "/tim", label: "Tim" },
  { href: "/kompetisi", label: "Kompetisi" },
  { href: "/profile", label: "Profile" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileSearch, setMobileSearch] = useState("")
  const { currentUser, isAdmin, logout } = useApp()
  const profileRef = useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const handler = (e: MouseEvent) => {
      if(profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return ()=> document.removeEventListener("mousedown", handler)
  },[])
  const handleSearchSubmit = (e: React.FormEvent)=>{
    e.preventDefault()
    const q = mobileSearch.trim()
    if(!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setMobileSearch("")
    setOpen(false)
  }
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

        {/* Desktop nav - 4 items */}
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
          <SoundControl />
          <ThemeToggle />
          {currentUser ? (
            <div className="hidden md:flex relative" ref={profileRef}>
              <button
                onClick={()=> setProfileOpen(!profileOpen)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-muted pl-1 pr-3 py-1 transition-colors"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <div className="h-7 w-7 rounded-full bg-foreground text-background grid place-items-center text-xs font-black">
                  {currentUser.name.slice(0,2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold max-w-[80px] truncate">{currentUser.name.split(" ")[0]}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", profileOpen && "rotate-180")} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-[240px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <div className="text-sm font-bold leading-tight truncate">{currentUser.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{currentUser.email}</div>
                    {isAdmin && <div className="mt-1 inline-flex rounded-full bg-gold px-2 py-0.5 text-[10px] font-black tracking-widest text-gold-foreground">ADMIN</div>}
                  </div>
                  <div className="p-1.5">
                    <Link href="/profile" onClick={()=> setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                      <User className="h-4 w-4 text-muted-foreground" /> Profile
                    </Link>
                    <Link href="/profile/edit" onClick={()=> setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
                      <Settings className="h-4 w-4 text-muted-foreground" /> Pengaturan
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" onClick={()=> setProfileOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-muted transition-colors">
                        <LayoutDashboard className="h-4 w-4 text-gold" /> Dashboard Admin
                      </Link>
                    )}
                  </div>
                  <div className="h-px bg-border" />
                  <div className="p-1.5">
                    <button
                      onClick={async ()=>{ setProfileOpen(false); await logout(); router.push("/"); router.refresh() }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden md:inline-flex">
              <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                <User className="h-3.5 w-3.5" /> Masuk
              </Button>
            </Link>
          )}
          <Link href="/tim" className="hidden md:inline-flex">
            <Button size="sm" className="rounded-full px-5">Dukung</Button>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-full border border-border" onClick={()=> setOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <SheetContent side="right" className="w-[320px] p-0 overflow-hidden">
              <SheetHeader className="p-5 border-b text-left">
                <div className="flex items-center gap-3">
                  <img src="/assets/brand/lkbb-logo.jpg" alt="LKBB" className="h-8 w-8 rounded-xl object-cover border" />
                  <div>
                    <SheetTitle className="text-sm font-black">LKBB JAVASOMA</SheetTitle>
                    <div className="text-[11px] tracking-widest text-muted-foreground">THE IMPRESSION • 2026</div>
                  </div>
                </div>
              </SheetHeader>
              <nav className="flex-1 overflow-y-auto p-4 grid gap-1">
                {nav.map(item=> (
                  <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium", pathname===item.href ? "bg-secondary" : "hover:bg-muted")}>
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                {currentUser ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
                      <div className="h-10 w-10 rounded-full bg-foreground text-background grid place-items-center text-sm font-black">
                        {currentUser.name.slice(0,2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{currentUser.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{currentUser.email}</div>
                      </div>
                      {isAdmin && <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-[10px] font-black text-gold-foreground">ADMIN</span>}
                    </div>
                    <Link href="/profile" onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted"><User className="h-4 w-4 text-muted-foreground"/> Profile</Link>
                    <Link href="/profile/edit" onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted"><Settings className="h-4 w-4 text-muted-foreground"/> Pengaturan</Link>
                    {isAdmin && <Link href="/admin" onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold hover:bg-muted"><LayoutDashboard className="h-4 w-4 text-gold"/> Dashboard Admin</Link>}
                    <button onClick={async ()=>{ setOpen(false); await logout(); router.push("/"); router.refresh() }} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 text-left"><LogOut className="h-4 w-4"/> Logout</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={()=>setOpen(false)}><Button variant="outline" className="w-full rounded-full">Masuk</Button></Link>
                    <Link href="/tim" onClick={()=>setOpen(false)}><Button className="w-full rounded-full">Dukung Sekarang</Button></Link>
                  </div>
                )}
                <div className="flex gap-4 pt-2 text-xs text-muted-foreground">
                  <Link href="/tentang">Tentang</Link>
                  <Link href="/kontak">Kontak</Link>
                  <Link href="/pengumuman">Info</Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Mobile search bar — khusus untuk cari nama tim */}
      <div className="lg:hidden border-t border-border bg-muted/20 px-4 py-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={mobileSearch}
            onChange={e=> setMobileSearch(e.target.value)}
            placeholder="Cari nama tim..."
            className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#C9A86A]"
          />
          <button type="submit" aria-label="Cari" className="absolute right-1 h-8 w-8 grid place-items-center rounded-full bg-foreground text-background">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

    </header>
  )
}
