"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Ticket, CreditCard, Trophy, Newspaper, Megaphone, Calendar, Star, Handshake, HelpCircle, Settings, ScrollText, UserCog } from "lucide-react"

const nav = [
  { href:"/admin", label:"Dashboard", icon: LayoutDashboard },
  { href:"/admin/peleton", label:"Peleton", icon: Users },
  { href:"/admin/dukungan", label:"Dukungan", icon: Ticket },
  { href:"/admin/transaksi", label:"Transaksi", icon: CreditCard },
  { href:"/admin/klasemen", label:"Klasemen", icon: Trophy },
  { href:"/admin/berita", label:"Berita", icon: Newspaper },
  { href:"/admin/pengumuman", label:"Pengumuman", icon: Megaphone },
  { href:"/admin/timeline", label:"Timeline", icon: Calendar },
  { href:"/admin/juri", label:"Juri", icon: Star },
  { href:"/admin/sponsor", label:"Sponsor", icon: Handshake },
  { href:"/admin/faq", label:"FAQ", icon: HelpCircle },
  { href:"/admin/users", label:"Users", icon: UserCog },
  { href:"/admin/settings", label:"Pengaturan", icon: Settings },
  { href:"/admin/audit-log", label:"Audit Log", icon: ScrollText },
]

export function AdminNav({ children }: { children: React.ReactNode }){
  const path = usePathname()
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
          {nav.map(item=> {
            const active = path===item.href
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
            <img src="/assets/brand/lkbb-logo.jpg" alt="" className="h-7 w-7 rounded-lg object-cover" />
            <span className="text-sm font-black">ADMIN LKBB</span>
          </div>
          <Link href="/" className="text-xs font-bold border border-border rounded-full px-3 py-1">Website →</Link>
        </header>
        <div className="lg:hidden border-b border-border bg-card overflow-x-auto scrollbar-none">
          <nav className="flex gap-1.5 p-2">
            {nav.map(item=> {
              const active = path===item.href
              return (
                <Link key={item.href} href={item.href} className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border ${active ? "bg-foreground text-background border-foreground" : "bg-card border-border"}`}>
                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
