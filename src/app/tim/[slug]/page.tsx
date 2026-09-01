import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2, Heart, QrCode, Trophy } from "lucide-react"
import { createServerSupabase, createStaticSupabase } from "@/lib/supabase"

export const revalidate = 0

export async function generateStaticParams(){
  const supabase = createStaticSupabase()
  const { data } = await supabase.from("peletons").select("slug").eq("verified", true).eq("active", true)
  return (data || []).map((p:any)=> ({ slug: p.slug }))
}

export default async function PeletonDetail({ params }: { params: Promise<{slug:string}> }){
  const { slug } = await params
  const supabase = await createServerSupabase()
  const { data: peleton } = await supabase.from("peletons").select("*").eq("slug", slug).eq("verified", true).eq("active", true).single()
  if(!peleton) return notFound()

  // Ranking for this peleton (category-specific) — but hide totals if active and not provisional
  const { data: ranking } = await supabase.from("team_ranking").select("*").eq("category", peleton.category).order("total_ballots", { ascending: false })
  const rankIndex = (ranking || []).findIndex((r:any)=> r.id === peleton.id)
  const rank = rankIndex >= 0 ? rankIndex + 1 : null

  const { data: event } = await supabase.from("competitions").select("state, show_provisional_result, show_final_result").order("created_at", { ascending: false }).limit(1).single()
  const isOnlineActive = event?.state === "VOTING_OPEN" || (event?.state as string) === "ACTIVE"
  const showRank = !isOnlineActive
  const showSementara = !isOnlineActive && event?.show_provisional_result && !event?.show_final_result
  const showFinal = !isOnlineActive && event?.show_final_result

  const photo = peleton.image_url
  const logo = (peleton as any).logo_url || peleton.image_url
  const profileUrl = `/tim/${peleton.slug}`
  const supportUrl = `/dukungan?peleton=${peleton.slug}`

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="relative border-b border-border overflow-hidden bg-[#08090B] text-white">
          <div className="absolute inset-0">
            <img src={photo} alt="" className="h-full w-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/70 to-transparent" />
          </div>
          <div className="relative mx-auto max-w-[1280px] px-4 md:px-6 py-8 md:py-10">
            <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-end">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-white/10 bg-muted shadow-elevated">
                <img src={photo} alt={peleton.name} className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 rounded-full bg-[#0B0C0F] px-3 py-1 text-xs font-black tracking-widest border border-white/10">#{peleton.number}</div>
                {showRank && rank && <div className="absolute bottom-3 right-3 rounded-full bg-gold px-3 py-1 text-xs font-black text-gold-foreground">Peringkat #{rank}</div>}
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gold">{peleton.category}</Badge>
                  <Badge variant="outline" className="bg-white/10 border-white/15 text-white">{peleton.city} • {peleton.province}</Badge>
                  <Badge className="bg-emerald-500 text-white border-emerald-500">Terverifikasi</Badge>
                </div>
                <div className="mt-3 flex gap-3 items-center">
                  <img src={logo} alt="logo" className="h-14 w-14 rounded-xl object-cover border border-white/15 bg-white hidden md:block" />
                  <div>
                    <h1 className="text-[28px] md:text-[36px] font-black tracking-[-0.03em] leading-none text-balance">{peleton.name}</h1>
                    <p className="mt-1 text-sm font-medium text-white/70">{peleton.school}</p>
                    {showSementara && <span className="mt-2 inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">HASIL SEMENTARA</span>}
                    {showFinal && <span className="mt-2 inline-flex rounded-full bg-[#C9A86A] text-white px-2.5 py-1 text-[10px] font-black">HASIL FINAL</span>}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/60 text-pretty max-w-2xl">{peleton.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={supportUrl}><Button size="lg" className="rounded-full px-8 h-[46px] font-black">DUKUNG PELETON INI</Button></Link>
                  <Link href={profileUrl}><Button variant="outline" size="lg" className="rounded-full bg-white/10 border-white/15 text-white hover:bg-white/15 hover:text-white gap-2"><Share2 className="h-4 w-4"/> Bagikan Profil</Button></Link>
                  {showRank && <span className="inline-flex items-center rounded-full bg-[#C9A86A] px-3 py-1 text-xs font-black text-white">RANK #{rank}</span>}
                  <Link href={supportUrl}><Button variant="ghost" size="lg" className="rounded-full bg-white/5 text-white hover:bg-white/10 hover:text-white gap-2"><QrCode className="h-4 w-4"/> Bagikan Dukungan</Button></Link>
                </div>
                <div className="mt-6 flex gap-3 max-w-lg">
                  <div className="flex-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3 text-center">
                    <div className="text-[11px] font-bold tracking-widest text-white/50">NOMOR PESERTA</div>
                    <div className="text-sm font-black text-white">#{peleton.number}</div>
                  </div>
                  <div className="flex-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3 text-center">
                    <div className="text-[11px] font-bold tracking-widest text-white/50">KATEGORI</div>
                    <div className="text-sm font-black text-white">{peleton.category}</div>
                  </div>
                  <div className="flex-1 rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3 text-center">
                    <div className="text-[11px] font-bold tracking-widest text-white/50">STATUS</div>
                    <div className="text-sm font-black text-emerald-400">AKTIF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8 grid lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-6">
            <section className="rounded-[16px] border border-border bg-card p-5">
              <h2 className="text-sm font-black tracking-tight">Tentang Peleton</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{peleton.description} Peleton ini menjunjung tinggi disiplin, kekompakan, dan kebanggaan sekolah.</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted p-3"><div className="label-ceremonial">Sekolah</div><div className="font-semibold">{peleton.school}</div></div>
                <div className="rounded-xl bg-muted p-3"><div className="label-ceremonial">Kota / Provinsi</div><div className="font-semibold">{peleton.city} • {peleton.province}</div></div>
              </div>
            </section>

            <section className="rounded-[16px] border border-border bg-card p-5">
              <h2 className="text-sm font-black tracking-tight flex items-center gap-2"><Trophy className="h-4 w-4 text-muted-foreground"/> Informasi Kompetisi</h2>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-3 text-sm"><div className="font-bold">Nomor Peserta</div><div className="text-muted-foreground">#{peleton.number} — nomor resmi, bukan ranking</div></div>
                <div className="rounded-xl border border-border p-3 text-sm"><div className="font-bold">Kategori</div><div className="text-muted-foreground">{peleton.category} / SEDERAJAT</div></div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Ranking dan nomor peserta adalah konsep berbeda. #{peleton.number} tetap #{peleton.number} meskipun memimpin klasemen.</p>
            </section>
          </div>

          <div className="space-y-4 lg:sticky lg:top-[76px] h-fit">
            <div className="rounded-[16px] border border-border bg-card p-5">
              <h3 className="text-sm font-black">Dukungan</h3>
              <div className="mt-3 space-y-3">
                {showRank && rank ? (
                  <div className="flex items-center justify-between rounded-xl bg-muted p-3">
                    <span className="text-sm text-muted-foreground">Peringkat ({peleton.category})</span>
                    <span className="text-sm font-black">#{rank}</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[#C9A86A20] bg-[#C9A86A0A] p-3 text-center">
                    <div className="label-gold">Klasemen Disembunyikan</div>
                    <p className="text-xs text-muted-foreground">Ballot disembunyikan selama voting aktif.</p>
                  </div>
                )}
                <div className="rounded-xl border border-[#C9A86A20] bg-[#C9A86A0A] p-3 text-center">
                  <div className="label-gold">Status Kompetisi</div>
                  <div className="mt-1 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">{isOnlineActive ? "VOTING BERLANGSUNG" : event?.state}</div>
                  {showSementara && <div className="mt-2 inline-flex rounded-full bg-[#FACC15] text-[#0B0C0F] px-2.5 py-1 text-[10px] font-black">HASIL SEMENTARA</div>}
                  {showFinal && <div className="mt-2 inline-flex rounded-full bg-[#C9A86A] text-white px-2.5 py-1 text-[10px] font-black">HASIL FINAL</div>}
                </div>
                <Link href={supportUrl}><Button className="w-full rounded-full h-[44px] font-black">DUKUNG</Button></Link>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-full" onClick={() => typeof window !== 'undefined' && navigator.clipboard.writeText(window.location.origin + profileUrl)}>Bagikan Profil</Button>
                  <Button variant="outline" className="rounded-full" onClick={() => typeof window !== 'undefined' && navigator.clipboard.writeText(window.location.origin + supportUrl)}>Bagikan Dukungan</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
