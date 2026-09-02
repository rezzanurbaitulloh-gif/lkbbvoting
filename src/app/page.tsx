import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Hero } from "@/components/home/Hero"
import { Featured } from "@/components/home/Featured"
import { PodiumSection } from "@/components/competition/Podium"
import { createServerSupabase } from "@/lib/supabase"

export const revalidate = 0
export default async function HomePage(){
  const supabase = await createServerSupabase()
  const { data: event } = await supabase.from("competitions").select("*").order("created_at", { ascending: false }).limit(1).single()
  const state = (event?.state as string) || "NOT_STARTED"
  const isNotStarted = state === "NOT_STARTED"
  const isActive = state === "ACTIVE" || state === "VOTING_OPEN"
  const isVotingClosed = state === "VOTING_CLOSED"
  const isPublished = state === "RESULT_PUBLISHED"

  let teams: any[] = []
  let smpPodium: any[] = []
  let smaPodium: any[] = []
  if (isNotStarted || isActive) {
    const { data } = await supabase.from("peletons").select("*").eq("verified", true).eq("active", true).order("number", { ascending: true })
    teams = (data||[]).sort((a:any,b:any)=> String(a.number).localeCompare(String(b.number)))
  } else if (isVotingClosed) {
    const { data } = await supabase.from("team_ranking").select("*").order("online_ballots", { ascending: false })
    teams = data||[]
    smpPodium = teams.filter(p=>p.category==='SMP').slice(0,3)
    smaPodium = teams.filter(p=>p.category==='SMA').slice(0,3)
  } else if (isPublished) {
    const { data } = await supabase.from("team_ranking").select("*").order("total_ballots", { ascending: false })
    teams = data||[]
    smpPodium = teams.filter(p=>p.category==='SMP').slice(0,3)
    smaPodium = teams.filter(p=>p.category==='SMA').slice(0,3)
  }

  const ev = event || null
  const showSementara = isVotingClosed
  const showFinal = isPublished

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <Hero event={ev} />
        {isPublished && (smpPodium.length>0 || smaPodium.length>0) && (
          <PodiumSection smp={teams.filter(p=>p.category==='SMP')} sma={teams.filter(p=>p.category==='SMA')} isPublished={isPublished} />
        )}
        <Featured peletons={teams} showSementara={showSementara} showFinal={showFinal} />
        {isVotingClosed && (
          <div className="mx-auto max-w-[1280px] px-4 md:px-6 pb-6">
            <div className="rounded-xl border border-[#FACC15]/30 bg-[#FACC15]/10 p-4 text-center">
              <p className="text-xs font-bold text-[#0B0C0F]">Voting ditutup — peringkat sementara online saja. Admin sedang merekap offline.</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
