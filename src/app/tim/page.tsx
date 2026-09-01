import { createServerSupabase } from "@/lib/supabase"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { PeletonCard } from "@/components/peleton/PeletonCard"
import Link from "next/link"
import { Trophy, Crown, Medal, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const revalidate = 0

export default async function TimPage(){
  const supabase = await createServerSupabase()
  const { data: event } = await supabase.from("competitions").select("state, show_provisional_result, show_final_result").order("created_at", { ascending: false }).limit(1).single()
  const isOnlineActive = event?.state === "VOTING_OPEN" || (event?.state as string) === "ACTIVE"
  const showSementara = !isOnlineActive && event?.show_provisional_result && !event?.show_final_result
  const showFinal = !isOnlineActive && event?.show_final_result
  const showRanking = !isOnlineActive

  let smp: any[] = []
  let sma: any[] = []
  if (isOnlineActive) {
    const { data } = await supabase.from("peletons").select("*").eq("verified", true).eq("active", true).order("display_order", { ascending: true })
    smp = (data||[]).filter(p=>p.category==='SMP')
    sma = (data||[]).filter(p=>p.category==='SMA')
  } else {
    const { data } = await supabase.from("team_ranking").select("*").order("total_ballots", { ascending: false })
    smp = (data||[]).filter(p=>p.category==='SMP')
    sma = (data||[]).filter(p=>p.category==='SMA')
  }

  const renderGrid = (teams: any[], category: string) => {
    if (!showRanking) {
      // display_order, tanpa rank
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {teams.map((p:any)=> <PeletonCard key={p.id} peleton={p} />)}
        </div>
      )
    }
    // ranking: 1-based index, but number (#03) stays original
    const top3 = teams.slice(0,3)
    const rest = teams.slice(3)
    return (
      <>
        <div className="grid md:grid-cols-3 gap-4">
          {top3.map((p:any,i:number)=> {
            const podiumStyle = i===0 ? "border-[#C9A86A] bg-[#C9A86A0A] md:order-2 md:-mt-4 md:scale-[1.02] shadow-elevated" : i===1 ? "border-border bg-card md:order-1" : "border-border bg-card md:order-3"
            const icon = i===0 ? <Crown className="h-5 w-5 text-[#C9A86A]" /> : i===1 ? <Medal className="h-5 w-5 text-[#9AA0A9]" /> : <Medal className="h-5 w-5 text-[#B45309]" />
            const rank = i+1
            return (
              <div key={p.id} className={`relative overflow-hidden rounded-[20px] border-2 p-4 flex flex-col ${podiumStyle}`}>
                <div className="flex items-center gap-2">
                  <div className={`h-9 w-9 rounded-full grid place-items-center text-sm font-black border ${i===0 ? "bg-[#C9A86A] text-[#0C0A06] border-[#C9A86A]" : "bg-muted border-border"}`}>{rank}</div>
                  {icon}
                  <span className="ml-auto text-xs font-bold tracking-widest text-muted-foreground">#{p.number}</span>
                </div>
                <div className="mt-3 flex gap-3">
                  <img src={p.image_url} alt="" className="h-16 w-16 rounded-xl object-cover border border-border" />
                  <div className="min-w-0">
                    <div className="text-[15px] font-black leading-tight line-clamp-1">{p.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{p.school}</div>
                    <div className="text-xs text-muted-foreground">#{p.number} • {p.category}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/tim/${p.slug}`} className="flex-1"><Button variant="outline" size="sm" className="w-full rounded-full">Detail</Button></Link>
                  <Link href={`/dukungan?peleton=${p.slug}`} className="flex-1"><Button size="sm" className="w-full rounded-full">Dukung</Button></Link>
                </div>
                <div className="mt-2 text-[11px] text-muted-foreground text-center">#{p.number} = nomor peserta • Ranking {rank}</div>
              </div>
            )
          })}
        </div>
        {rest.length>0 && (
        <div className="mt-6 rounded-[16px] border border-border overflow-hidden bg-card">
          <div className="hidden md:grid grid-cols-[64px_1fr_180px_120px] gap-4 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div>RANK</div><div>PELETON</div><div>ASAL</div><div className="text-right">STATUS</div>
          </div>
          <div className="divide-y divide-border">
            {rest.map((p:any,i:number)=> {
              const rank = i+4
              return (
                <div key={p.id} className="grid md:grid-cols-[64px_1fr_180px_120px] gap-3 px-4 py-3 items-center hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="hidden md:block text-sm font-black tabular-nums">#{String(rank).padStart(2,"0")}</span>
                    <span className="md:hidden h-7 w-7 rounded-full bg-muted grid place-items-center text-xs font-black">{rank}</span>
                    <span className="hidden md:inline text-muted-foreground"><Minus className="h-3 w-3"/></span>
                  </div>
                  <Link href={`/tim/${p.slug}`} className="flex items-center gap-3 min-w-0">
                    <img src={p.image_url} alt="" className="h-9 w-9 rounded-full object-cover border border-border" />
                    <div className="min-w-0">
                      <div className="text-sm font-bold leading-tight truncate">{p.name} <span className="text-xs font-normal text-muted-foreground">#{p.number}</span></div>
                      <div className="text-xs text-muted-foreground truncate md:hidden">{p.school} • {p.category}</div>
                      <div className="hidden md:block text-xs text-muted-foreground truncate">{p.school}</div>
                    </div>
                  </Link>
                  <div className="hidden md:block text-sm text-muted-foreground">{p.school} • {p.category}</div>
                  <div className="flex md:justify-end">
                    <span className="inline-flex rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/15 px-2.5 py-1 text-xs font-bold">Stabil</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#08090B] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"><img src="https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=1600&auto=format&fit=crop&q=60" alt="" className="h-full w-full object-cover" /></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090B] via-[#08090B]/85 to-transparent" />
          <div className="relative mx-auto max-w-[1280px] px-4 md:px-6 py-8">
            {showSementara && <div className="inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-3 py-1 text-xs font-black tracking-wide">HASIL SEMENTARA</div>}
            {showFinal && <div className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-3 py-1 text-xs font-black tracking-wide">HASIL FINAL</div>}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#C9A86A30] bg-[#C9A86A14] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#D4B77A]"><Trophy className="h-3.5 w-3.5"/> {showRanking ? (showFinal ? "HASIL FINAL" : showSementara ? "HASIL SEMENTARA" : "PAPAN PERINGKAT") : "DIREKTORI PESERTA"}</div>
            <h1 className="mt-3 text-[28px] md:text-[36px] font-black tracking-[-0.03em] leading-none">{showRanking ? "PAPAN PERINGKAT" : "PELETON PESERTA"}</h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              {showRanking ? "Peringkat diurut total_ballots DESC (online+offline). Nomor peserta (#03) tetap. Poin/ballot tidak ditampilkan — hanya ranking." : "Temukan peleton favoritmu. Dukung dengan ballot resmi — peringkat disembunyikan selama voting aktif."}
            </p>
          </div>
        </div>

        {/* SMP */}
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex rounded-full bg-foreground text-background px-3 py-1 text-xs font-black">SMP / SEDERAJAT</span>
            {showSementara && <span className="inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">HASIL SEMENTARA</span>}
            {showFinal && <span className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">HASIL FINAL</span>}
            <span className="text-xs text-muted-foreground">{smp.length} tim</span>
          </div>
          {smp.length===0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada peleton SMP.</div> : renderGrid(smp, "SMP")}
        </div>

        {/* SMA */}
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex rounded-full bg-foreground text-background px-3 py-1 text-xs font-black">SMA / SEDERAJAT</span>
            {showSementara && <span className="inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">HASIL SEMENTARA</span>}
            {showFinal && <span className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">HASIL FINAL</span>}
            <span className="text-xs text-muted-foreground">{sma.length} tim</span>
          </div>
          {sma.length===0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada peleton SMA.</div> : renderGrid(sma, "SMA")}
          {!showRanking && (
            <div className="mt-8 rounded-xl border border-[#C9A86A20] bg-[#C9A86A0A] p-4 text-center">
              <p className="text-xs leading-relaxed text-muted-foreground">Klasemen disembunyikan selama voting aktif. Beranda & Tim menampilkan urutan <b>display_order</b> panitia.</p>
            </div>
          )}
          {showRanking && (
            <div className="mt-8 rounded-xl border border-[#C9A86A20] bg-[#C9A86A0A] p-4 text-center">
              <p className="text-xs leading-relaxed text-muted-foreground">Diurut <b>total_ballots DESC</b>. Nomor peserta (<code>#03</code>) tetap — ranking terpisah (#1). Poin tidak ditampilkan.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
