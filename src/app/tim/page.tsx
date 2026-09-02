import { createServerSupabase } from "@/lib/supabase"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { PeletonCard, PeletonCardCompact } from "@/components/peleton/PeletonCard"
import { Trophy } from "lucide-react"

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

  const renderGrid = (teams: any[]) => {
    if (!showRanking) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {teams.map((p:any)=> <PeletonCard key={p.id} peleton={p} />)}
        </div>
      )
    }
    // Ranking aktif: urut total_ballots DESC, tampil compact #number, nama, logo saja, peringkat = posisi, poin hidden
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teams.map((p:any,i:number)=> (
          <PeletonCardCompact key={p.id} peleton={p} rank={i+1} />
        ))}
      </div>
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
          {smp.length===0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada peleton SMP.</div> : renderGrid(smp)}
        </div>

        {/* SMA */}
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex rounded-full bg-foreground text-background px-3 py-1 text-xs font-black">SMA / SEDERAJAT</span>
            {showSementara && <span className="inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">HASIL SEMENTARA</span>}
            {showFinal && <span className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">HASIL FINAL</span>}
            <span className="text-xs text-muted-foreground">{sma.length} tim</span>
          </div>
          {sma.length===0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada peleton SMA.</div> : renderGrid(sma)}
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
