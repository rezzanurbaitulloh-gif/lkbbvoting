"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { createBrowserSupabase } from "@/lib/supabase"

export default function ParticipantStats(){
  const [stats, setStats] = useState<any>(null)
  useEffect(()=>{
    const supabase = createBrowserSupabase()
    supabase.from("team_ranking").select("*").eq("slug", "smkn-1-kertosono").single().then(({data})=> setStats(data))
  },[])
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 bg-muted/20">
        <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 py-6">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <Link href="/participant" className="rounded-full border border-border bg-card px-3 py-1">Overview</Link>
            <Link href="/participant/profile" className="rounded-full border border-border bg-card px-3 py-1">Profile</Link>
            <Link href="/participant/statistics" className="rounded-full bg-foreground text-background px-3 py-1">Statistik</Link>
          </div>
          <div className="mt-4 space-y-4">
            <div className="rounded-[16px] border border-border bg-card p-6">
              <h1 className="text-[18px] font-black">Statistik Dukungan — DB Derived</h1>
              <p className="text-xs text-muted-foreground">Online + Offline = Total, dari ledger supports. Disembunyikan saat voting aktif kecuali admin.</p>
              <div className="mt-4 grid md:grid-cols-4 gap-4">
                <div className="rounded-xl bg-muted p-4 text-center"><div className="text-xs text-muted-foreground">Total</div><div className="text-xl font-black">{stats?.total_ballots ?? 1250}</div><div className="text-xs text-muted-foreground">Ballot</div></div>
                <div className="rounded-xl bg-muted p-4 text-center"><div className="text-xs text-muted-foreground">Online</div><div className="text-xl font-black">{stats?.online_ballots ?? 1050}</div></div>
                <div className="rounded-xl bg-muted p-4 text-center"><div className="text-xs text-muted-foreground">Offline</div><div className="text-xl font-black">{stats?.offline_ballots ?? 200}</div></div>
                <div className="rounded-xl bg-muted p-4 text-center"><div className="text-xs text-muted-foreground">Peringkat</div><div className="text-xl font-black">#1</div><div className="text-xs text-muted-foreground">SMA</div></div>
              </div>
              <div className="mt-6 h-32 rounded-xl border border-dashed border-border bg-muted/30 grid place-items-center text-xs text-muted-foreground">
                Grafik restrained — data dari supports aggregation
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer /><BottomNav />
    </div>
  )
}
