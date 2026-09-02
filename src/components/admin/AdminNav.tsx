"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, Users, CreditCard, Trophy, Megaphone, Calendar, Star, Handshake, Settings, ScrollText, UserCog, Menu, FileText, Image as ImageIcon, Shield, Layers } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const nav = [
  { href:"/admin", label:"Dashboard", icon: LayoutDashboard },
  // Dynamic CMS — baru
  { href:"/admin/cms", label:"Konten Dinamis", icon: Layers },
  { href:"/admin/media", label:"Media Manager", icon: ImageIcon },
  { href:"/admin/peleton", label:"Peleton", icon: Users },
  { href:"/admin/transaksi", label:"Transaksi", icon: CreditCard },
  { href:"/admin/klasemen", label:"Klasemen", icon: Trophy },
  { href:"/admin/pengumuman", label:"Pengumuman", icon: Megaphone },
  { href:"/admin/timeline", label:"Jadwal", icon: Calendar },
  { href:"/admin/juri", label:"Juri", icon: Star },
  { href:"/admin/sponsor", label:"Sponsor", icon: Handshake },
  { href:"/admin/users", label:"Pengguna", icon: UserCog },
  { href:"/admin/access", label:"Hak Akses", icon: Shield },
  { href:"/admin/settings", label:"Pengaturan", icon: Settings },
  { href:"/admin/audit-log", label:"Riwayat", icon: ScrollText },
]

export function AdminNav({ children }: { children: React.ReactNode }){
  const path = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-muted/20 flex">
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border bg-card">
        <div className="h-[64px] flex items-center gap-3 px-5 border-b border-border">
          <img src="/assets/brand/lkbb-logo.jpg" alt="LKBB" className="h-8 w-8 rounded-lg object-cover border border-border" />
          <div>
            <div className="text-sm font-black leading-none">LKBB ADMIN</div>
            <div className="text-[11px] tracking-widest text-muted-foreground">JAVASOMA 2026</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold tracking-widest text-muted-foreground">CMS DINAMIS</div>
          {nav.slice(0,3).map(item=> {
            const active = path===item.href || path.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            )
          })}
          <div className="mt-2 h-px bg-border" />
          <div className="px-2 pt-2 pb-1 text-[10px] font-bold tracking-widest text-muted-foreground">KOMPETISI</div>
          {nav.slice(3,10).map(item=> {
            const active = path===item.href || path.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            )
          })}
          <div className="mt-2 h-px bg-border" />
          <div className="px-2 pt-2 pb-1 text-[10px] font-bold tracking-widest text-muted-foreground">SISTEM</div>
          {nav.slice(10).map(item=> {
            const active = path===item.href || path.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link href="/" className="block rounded-xl border border-border bg-muted p-3 text-center text-xs font-bold">← Kembali ke Website</Link>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 h-[56px] flex items-center justify-between px-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={()=> setOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <SheetContent side="left" className="w-[300px] p-0 overflow-hidden">
                <SheetHeader className="p-5 border-b">
                  <div className="flex items-center gap-3">
                    <img src="/assets/brand/lkbb-logo.jpg" alt="LKBB" className="h-8 w-8 rounded-lg object-cover border" />
                    <div>
                      <SheetTitle className="text-sm font-black leading-none text-left">LKBB ADMIN</SheetTitle>
                      <div className="text-[11px] tracking-widest text-muted-foreground text-left">JAVASOMA 2026</div>
                    </div>
                  </div>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                  {nav.map(item=> {
                    const active = path===item.href || path.startsWith(item.href + "/")
                    return (
                      <Link key={item.href} href={item.href} onClick={()=> setOpen(false)} className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                        <item.icon className="h-4 w-4" /> {item.label}
                      </Link>
                    )
                  })}
                </nav>
                <div className="p-3 border-t">
                  <Link href="/" onClick={()=> setOpen(false)} className="block rounded-xl border border-border bg-muted p-3 text-center text-xs font-bold">← Kembali ke Website</Link>
                </div>
              </SheetContent>
            </Sheet>
            <img src="/assets/brand/lkbb-logo.jpg" alt="" className="h-7 w-7 rounded-lg object-cover" />
            <span className="text-sm font-black">ADMIN LKBB</span>
          </div>
          <Link href="/" className="text-xs font-bold border border-border rounded-full px-3 py-1">Website →</Link>
        </header>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
