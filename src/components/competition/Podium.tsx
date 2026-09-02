"use client"
import Link from "next/link"

type Team = {
  id: string
  slug: string
  number: string
  name: string
  school?: string
  image_url?: string
  logo_url?: string
  total_ballots?: number
  online_ballots?: number
  offline_ballots?: number
}

function PodiumCard({ team, rank, height }: { team: Team; rank: number; height: string }) {
  const isFirst = rank === 1
  const isSecond = rank === 2
  const isThird = rank === 3
  const bgColor = isFirst ? "bg-gradient-to-b from-[#C9A86A] to-[#B89A5A]" : isSecond ? "bg-gradient-to-b from-[#C0C0C0] to-[#A8A8A8]" : "bg-gradient-to-b from-[#CD7F32] to-[#B87333]"
  const textColor = isFirst ? "text-[#0B0C0F]" : "text-white"
  const rankLabel = rank === 1 ? "JUARA 1" : rank === 2 ? "JUARA 2" : "JUARA 3"
  const crown = rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉"

  return (
    <div className="flex flex-col items-center flex-1 max-w-[180px]">
      {/* Logo + Name above podium */}
      <div className="flex flex-col items-center mb-3 text-center">
        <div className={`relative h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden border-4 shadow-xl bg-white ${isFirst ? "border-[#C9A86A] scale-110" : isSecond ? "border-[#C0C0C0]" : "border-[#CD7F32]"}`}>
          <img
            src={team.logo_url || team.image_url || "/assets/brand/lkbb-logo.jpg"}
            alt={team.name}
            className="h-full w-full object-cover"
          />
          <div className={`absolute -top-2 -right-2 h-7 w-7 rounded-full flex items-center justify-center text-sm font-black shadow ${isFirst ? "bg-[#FFD700] text-[#0B0C0F]" : isSecond ? "bg-[#C0C0C0] text-white" : "bg-[#CD7F32] text-white"}`}>
            {rank}
          </div>
        </div>
        <div className="mt-3">
          <div className={`text-[10px] font-black tracking-[0.14em] ${isFirst ? "text-[#C9A86A]" : "text-muted-foreground"}`}>{rankLabel}</div>
          <div className="mt-1 text-sm font-black leading-tight line-clamp-2">{team.name}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">{team.school || ""}</div>
          <div className="mt-1 inline-flex rounded-full bg-[#0B0C0F] text-white px-2.5 py-1 text-[11px] font-black">#{team.number}</div>
          {team.total_ballots !== undefined && (
            <div className="mt-1 text-xs font-bold tabular-nums text-[#C9A86A]">{Number(team.total_ballots).toLocaleString("id-ID")} dukungan</div>
          )}
          {team.online_ballots !== undefined && team.total_ballots === undefined && (
            <div className="mt-1 text-xs font-bold tabular-nums text-[#C9A86A]">{Number(team.online_ballots).toLocaleString("id-ID")} online</div>
          )}
        </div>
      </div>

      {/* Podium step */}
      <div className={`w-full rounded-t-2xl border-t-4 flex flex-col items-center justify-start pt-4 shadow-xl ${bgColor} ${textColor} ${height} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative text-3xl md:text-4xl font-black opacity-90">{crown}</div>
        <div className="relative mt-1 text-3xl md:text-5xl font-black">{rank}</div>
        <div className="relative mt-1 text-[10px] font-bold tracking-widest opacity-80">#{team.number}</div>
        {/* Decorative shine */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-white/30" />
      </div>
    </div>
  )
}

export function Podium({ teams, category, showPoints = true }: { teams: Team[]; category?: string; showPoints?: boolean }) {
  if (!teams || teams.length === 0) return null

  // Ensure we have at most 3, ordered 1,2,3
  const sorted = [...teams].sort((a, b) => {
    const aTotal = a.total_ballots ?? a.online_ballots ?? 0
    const bTotal = b.total_ballots ?? b.online_ballots ?? 0
    return bTotal - aTotal
  }).slice(0, 3)

  // For display, we want order: 2nd, 1st, 3rd (so 1st in middle is highest)
  const orderedForDisplay = []
  if (sorted[1]) orderedForDisplay.push({ team: sorted[1], rank: 2, height: "h-[140px] md:h-[160px]" })
  if (sorted[0]) orderedForDisplay.push({ team: sorted[0], rank: 1, height: "h-[180px] md:h-[200px]" })
  if (sorted[2]) orderedForDisplay.push({ team: sorted[2], rank: 3, height: "h-[120px] md:h-[140px]" })

  return (
    <div className="w-full">
      {category && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-flex rounded-full bg-[#0B0C0F] text-white px-3 py-1 text-xs font-black">{category}</span>
          <span className="text-xs text-muted-foreground">{teams.length} tim</span>
        </div>
      )}
      <div className="flex items-end justify-center gap-2 md:gap-4 max-w-[640px] mx-auto">
        {orderedForDisplay.map(({ team, rank, height }) => (
          <PodiumCard key={team.id} team={team} rank={rank} height={height} />
        ))}
      </div>
      {sorted.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A86A]/10 border border-[#C9A86A]/20 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-[#C9A86A] animate-pulse" />
            <span className="text-xs font-bold text-[#C9A86A]">Peringkat Akhir</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function PodiumSection({ smp, sma, isPublished }: { smp: Team[]; sma: Team[]; isPublished: boolean }) {
  if (!isPublished) return null
  return (
    <section className="bg-gradient-to-b from-[#0B0C0F] via-[#0B0C0F] to-[#0B0C0F]/95 border-y border-[#C9A86A]/20 py-10 md:py-14">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A86A] px-3 py-1 text-xs font-black text-[#0B0C0F]">
            🏆 HASIL AKHIR — TANGGA JUARA
          </div>
          <h2 className="mt-3 text-[24px] md:text-[32px] font-black tracking-tight text-white">PODIUM JUARA</h2>
          <p className="mt-2 text-sm text-white/60 max-w-xl mx-auto">Peringkat akhir berdasarkan total dukungan online + offline. Selamat kepada para juara!</p>
        </div>

        <div className="mt-10 grid gap-10">
          {sma.length > 0 && (
            <div>
              <Podium teams={sma} category="SMA / SEDERAJAT" />
            </div>
          )}
          {smp.length > 0 && (
            <div>
              <Podium teams={smp} category="SMP / SEDERAJAT" />
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-white/40">Logo tim dan nama ditampilkan di atas podium sesuai desain juara 1-2-3</p>
        </div>
      </div>
    </section>
  )
}
