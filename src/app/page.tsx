import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Hero } from "@/components/home/Hero"
import { Featured } from "@/components/home/Featured"
import { Story } from "@/components/home/Story"
import { createServerSupabase } from "@/lib/supabase"

export const revalidate = 0

export default async function HomePage(){
  const supabase = await createServerSupabase()
  // Fetch event
  const { data: event } = await supabase.from("competitions").select("*").order("created_at", { ascending: false }).limit(1).single()
  // Fetch peletons ordered by display_order (homepage)
  const { data: peletons } = await supabase.from("peletons").select("*").eq("verified", true).eq("active", true).order("display_order", { ascending: true })
  // Fetch sponsors for story
  const { data: sponsors } = await supabase.from("sponsors").select("*").eq("active", true).order("display_order", { ascending: true })

  // Fallback to hardcoded if DB empty (for build)
  const ev = event || null
  const teams = peletons || []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <Hero event={ev} />
        <Featured peletons={teams} />
        <Story sponsors={sponsors} event={ev} />
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
