import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Hero } from "@/components/home/Hero"
import { Featured } from "@/components/home/Featured"
import { createServerSupabase } from "@/lib/supabase"

export const revalidate = 0

export default async function HomePage(){
  const supabase = await createServerSupabase()
  // Fetch event
  const { data: event } = await supabase.from("competitions").select("*").order("created_at", { ascending: false }).limit(1).single()
  // Fetch peletons beranda — selalu urut nomor peserta (number), bukan ranking
  const { data: peletonsRaw } = await supabase.from("peletons").select("*").eq("verified", true).eq("active", true).order("number", { ascending: true })
  // fallback sort di JS jika number belum konsisten
  const peletons = (peletonsRaw||[]).sort((a:any,b:any)=> String(a.number).localeCompare(String(b.number)))
  // Fallback to hardcoded if DB empty (for build)
  const ev = event || null
  const teams = peletons || []
  const isOnlineActive = ev?.state === "VOTING_OPEN" || (ev?.state as string) === "ACTIVE"
  const showSementara = !isOnlineActive && ev?.show_provisional_result && !ev?.show_final_result
  const showFinal = !isOnlineActive && ev?.show_final_result

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <Hero event={ev} />
        <Featured peletons={teams} showSementara={showSementara} showFinal={showFinal} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
