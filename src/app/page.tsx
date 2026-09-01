import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Hero } from "@/components/home/Hero"
import { Stats } from "@/components/home/Stats"
import { Featured } from "@/components/home/Featured"
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview"
import { HowItWorks } from "@/components/home/HowItWorks"
import { Story } from "@/components/home/Story"
import { TimelinePreview } from "@/components/home/TimelinePreview"

export default function HomePage(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <Hero />
        <Stats />
        <Featured />
        <LeaderboardPreview />
        <HowItWorks />
        <Story />
        <TimelinePreview />
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
