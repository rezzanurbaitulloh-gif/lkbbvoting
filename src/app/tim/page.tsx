import Link from "next/link"
import { createServerSupabase } from "@/lib/supabase"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Trophy } from "lucide-react"
import { PodiumSection } from "@/components/competition/Podium"

export const revalidate = 0

export default async function TimPage(){
  const supabase = await createServerSupabase()
  const { data: event } = await supabase.from("competitions").select("state, show_provisional_result, show_final_result").order("created_at", { ascending: false }).limit(1).single()
  const state = (event?.state as string) || "NOT_STARTED"
  const isNotStarted = state === "NOT_STARTED"
  const isActive = state === "ACTIVE" || state === "VOTING_OPEN"
  const isVotingClosed = state === "VOTING_CLOSED"
  const isPublished = state === "RESULT_PUBLISHED"
  const showRanking = isVotingClosed || isPublished
  const showPodium = isPublished

  // Ambil data sesuai status
  let smp: any[] = []
  let sma: any[] = []
  if (isNotStarted || isActive) {
    const { data } = await supabase.from("peletons").select("*").eq("verified", true).eq("active", true).order("number", { ascending: true })
    smp = (data||[]).filter(p=>p.category==='SMP')
    sma = (data||[]).filter(p=>p.category==='SMA')
  } else if (isVotingClosed) {
    const { data } = await supabase.from("team_ranking").select("*").order("online_ballots", { ascending: false })
    smp = (data||[]).filter(p=>p.category==='SMP')
    sma = (data||[]).filter(p=>p.category==='SMA')
  } else if (isPublished) {
    const { data } = await supabase.from("team_ranking").select("*").order("total_ballots", { ascending: false })
    smp = (data||[]).filter(p=>p.category==='SMP')
    sma = (data||[]).filter(p=>p.category==='SMA')
  }

  const renderGrid = (teams: any[]) => {
    // Minimal: hanya nomor urut, nama, foto logo tim (real DB, no hardcode)
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {teams.map((p:any)=> {
          const logo = p.logo_url || p.image_url || "/assets/brand/lkbb-logo.jpg"
          const number = String(p.number || "").padStart(2,"0")
          return (
            <Link key={p.id} href={`/tim/${p.slug}`} className="group rounded-[16px] border border-border bg-card overflow-hidden hover:border-[#C9A86A]/30 hover:shadow-soft transition-all flex flex-col items-center p-4 sm:p-5 text-center">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border border-border bg-muted shrink-0">
                <img src={logo} alt={p.name} className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform" />
              </div>
              <div className="mt-3 text-[11px] font-black tracking-[0.14em] text-gold">#{number}</div>
              <div className="mt-1 text-[13px] sm:text-sm font-black leading-tight line-clamp-2 break-words">{p.name}</div>
            </Link>
          )
        })}
      </div>
    )
  }

  const getHeaderBadge = () => {
    if (isNotStarted) return { label: "Belum Dimulai", color: "bg-zinc-500" }
    if (isActive) return { label: "Aktif — Dukungan Dibuka", color: "bg-emerald-500" }
    if (isVotingClosed) return { label: "Voting Ditutup", color: "bg-[#FACC15] text-[#0B0C0F]" }
    if (isPublished) return { label: "Hasil Dipublikasikan", color: "bg-[#C9A86A] text-[#0B0C0F]" }
    return { label: state, color: "bg-white/10" }
  }
  const headerBadge = getHeaderBadge()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#08090B] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"><img src="https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=1600&auto=format&fit=crop&q=60" alt="" className="h-full w-full object-cover" /></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090B] via-[#08090B]/85 to-transparent" />
          <div className="relative mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 py-8">
            <div className={`inline-flex rounded-full px-3 py-1 text-xs font-black tracking-wide ${headerBadge.color}`}>{headerBadge.label}</div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#C9A86A30] bg-[#C9A86A14] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[#D4B77A]"><Trophy className="h-3.5 w-3.5"/> {isPublished ? "HASIL AKHIR" : isVotingClosed ? "HASIL SEMENTARA — ONLINE SAJA" : isActive ? "DAFTAR TIM" : "BELUM DIMULAI"}</div>
            <h1 className="mt-3 text-[28px] md:text-[36px] font-black tracking-[-0.03em] leading-none">{isPublished ? "TANGGA JUARA" : isVotingClosed ? "PERINGKAT SEMENTARA" : "DAFTAR TIM"}</h1>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              {isNotStarted && "Pendaftaran dan voting belum dibuka. Daftar tim ditampilkan urut nomor peserta."}
              {isActive && "Masa dukungan dibuka — dukung tim favoritmu. Urutan berdasar nomor peserta. Dukungan dihitung realtime."}
              {isVotingClosed && "Voting ditutup — transaksi dihentikan. Menampilkan peringkat sementara berdasarkan dukungan online saja. Admin sedang merekap offline."}
              {isPublished && "Hasil akhir dipublikasikan — peringkat akhir online + offline + podium juara ditampilkan."}
            </p>
          </div>
        </div>

        {showPodium && (
          <PodiumSection smp={smp} sma={sma} isPublished={isPublished} />
        )}

        {/* SMP */}
        <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 py-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex rounded-full bg-foreground text-background px-3 py-1 text-xs font-black">SMP / SEDERAJAT</span>
            {isVotingClosed && <span className="inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">ONLINE SAJA</span>}
            {isPublished && <span className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">FINAL</span>}
            <span className="text-xs text-muted-foreground">{smp.length} tim</span>
          </div>
          {smp.length===0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada peleton SMP.</div> : renderGrid(smp)}
        </div>

        {/* SMA */}
        <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 pb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex rounded-full bg-foreground text-background px-3 py-1 text-xs font-black">SMA / SEDERAJAT</span>
            {isVotingClosed && <span className="inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">ONLINE SAJA</span>}
            {isPublished && <span className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">FINAL</span>}
            <span className="text-xs text-muted-foreground">{sma.length} tim</span>
          </div>
          {sma.length===0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada peleton SMA.</div> : renderGrid(sma)}
          {isActive || isNotStarted ? (
            <div className="mt-8 rounded-xl border border-[#C9A86A20] bg-[#C9A86A0A] p-4 text-center">
              <p className="text-xs leading-relaxed text-muted-foreground">Urutan berdasar nomor peserta (<code>#03</code>). Dukungan dihitung realtime saat aktif.</p>
            </div>
          ) : isVotingClosed ? (
            <div className="mt-8 rounded-xl border border-[#FACC15]/30 bg-[#FACC15]/10 p-4 text-center">
              <p className="text-xs leading-relaxed text-[#0B0C0F]">Peringkat sementara — hanya hitungan online. Admin sedang merekap offline. Hasil akhir akan diumumkan saat dipublikasikan.</p>
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-[#C9A86A20] bg-[#C9A86A0A] p-4 text-center">
              <p className="text-xs leading-relaxed text-muted-foreground">Peringkat akhir online + offline. Podium juara di atas menampilkan 3 teratas tiap kategori.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
