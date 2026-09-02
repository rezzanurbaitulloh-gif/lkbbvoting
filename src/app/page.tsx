import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Hero } from "@/components/home/Hero"
import { Featured } from "@/components/home/Featured"
import { PodiumSection } from "@/components/competition/Podium"
import { CmsSections } from "@/components/cms/CmsSectionRenderer"
import { createServerSupabase } from "@/lib/supabase"

export const revalidate = 0
export default async function HomePage(){
  const supabase = await createServerSupabase()
  const { data: event } = await supabase.from("competitions").select("*").order("created_at", { ascending: false }).limit(1).single()

  // Dynamic CMS — fetch home sections & site settings (fallback gracefully if tables not yet migrated)
  let cmsSections: any[] = []
  let siteSettings: Record<string, any> = {}
  try {
    const { data: page } = await supabase.from("cms_pages").select("id").eq("slug","home").single()
    if(page){
      const { data: secs } = await supabase.from("cms_sections").select("*").eq("page_id", (page as any).id).eq("is_visible", true).order("sort_order",{ascending:true})
      cmsSections = secs || []
    }
    const { data: settingsRows } = await supabase.from("site_settings").select("key,value").eq("is_public", true)
    for(const r of (settingsRows as any)||[]) siteSettings[r.key]= (r as any).value
  } catch {}

  const heroSection = cmsSections.find((s:any)=> s.key==="hero" || s.type==="hero")
  const countdownSection = cmsSections.find((s:any)=> s.key==="countdown" || s.type==="countdown")
  const extraSections = cmsSections.filter((s:any)=> s.key!=="hero" && s.key!=="countdown" && s.type!=="countdown" && !(s.key==="hero"||s.type==="hero"))
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

  // Featured & podium dapat di-hide via CMS visibility
  const showFeatured = !cmsSections.find((s:any)=> s.key==="featured") || cmsSections.find((s:any)=> s.key==="featured")?.is_visible !== false
  const showPodiumViaCms = !cmsSections.find((s:any)=> s.key==="podium") || cmsSections.find((s:any)=> s.key==="podium")?.is_visible !== false

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar siteSettings={siteSettings} />
      <main className="flex-1 pb-[72px] md:pb-0">
        <Hero event={ev} cms={heroSection || null} />
        {/* Extra CMS sections after hero (banner, stats, etc.) — order controlled by sort_order */}
        {extraSections.filter((s:any)=> s.sort_order < (cmsSections.find((x:any)=> x.key==="featured")?.sort_order ?? 999)).map((s:any)=> (
          <CmsSections key={s.id} sections={[s]} />
        ))}
        {(isPublished || isVotingClosed) && showPodiumViaCms && (smpPodium.length>0 || smaPodium.length>0) && (
          <PodiumSection smp={teams.filter(p=>p.category==='SMP')} sma={teams.filter(p=>p.category==='SMA')} isPublished={true} />
        )}
        {showFeatured && <Featured peletons={teams} showSementara={showSementara} showFinal={showFinal} />}
        {extraSections.filter((s:any)=> {
          const featOrder = cmsSections.find((x:any)=> x.key==="featured")?.sort_order ?? 0
          return s.sort_order > featOrder
        }).map((s:any)=> (
          <CmsSections key={s.id} sections={[s]} />
        ))}
        {isVotingClosed && (
          <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 pb-6">
            <div className="rounded-xl border border-[#FACC15]/30 bg-[#FACC15]/10 p-4 text-center">
              <p className="text-xs font-bold text-[#0B0C0F]">Voting ditutup — peringkat sementara online saja. Admin sedang merekap offline.</p>
            </div>
          </div>
        )}
      </main>
      <Footer siteSettings={siteSettings} />
      <BottomNav />
    </div>
  )
}
