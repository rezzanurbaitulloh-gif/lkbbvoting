"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

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

// --- Festive Confetti ---
function Confetti({ active }: { active: boolean }) {
  if (!active) return null
  const pieces = Array.from({ length: 28 })
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((_, i) => {
        const left = (i * 37) % 100
        const delay = (i * 0.12) % 2
        const duration = 2.2 + (i % 5) * 0.3
        const size = i % 3 === 0 ? 8 : i % 3 === 1 ? 6 : 10
        const color = i % 4 === 0 ? "#C9A86A" : i % 4 === 1 ? "#FFD700" : i % 4 === 2 ? "#FFF7CC" : "#A51D2D"
        const shape = i % 2 === 0 ? "rounded-full" : "rounded-[2px] rotate-45"
        return (
          <span
            key={i}
            className={`absolute ${shape} animate-[confettiFall_${duration}s_ease-in_infinite]`}
            style={{
              left: `${left}%`,
              top: `-12px`,
              width: size,
              height: size,
              background: color,
              animationDelay: `${delay}s`,
              boxShadow: i % 3 === 0 ? "0 0 8px rgba(201,168,106,0.6)" : undefined,
            }}
          />
        )
      })}
      <style>{`@keyframes confettiFall { 0%{ transform: translateY(-10px) rotate(0deg) translateX(0); opacity:1 } 100%{ transform: translateY(420px) rotate(720deg) translateX(${Math.random() > 0.5 ? 20 : -20}px); opacity:0 } }`}</style>
    </div>
  )
}

function PodiumCard({ team, rank, height }: { team: Team; rank: number; height: string }) {
  const isFirst = rank === 1
  const isSecond = rank === 2
  const isThird = rank === 3

  // Premium metallic palettes — not flat, with depth
  const podiumBg = isFirst
    ? "bg-gradient-to-b from-[#FDE68A] via-[#C9A86A] to-[#8C6A2A] shadow-[0_16px_40px_rgba(201,168,106,0.45),inset_0_1px_0_rgba(255,255,255,0.6)]"
    : isSecond
    ? "bg-gradient-to-b from-[#E5E7EB] via-[#C0C0C0] to-[#8E8E93] shadow-[0_12px_28px_rgba(192,192,192,0.35),inset_0_1px_0_rgba(255,255,255,0.7)]"
    : "bg-gradient-to-b from-[#FDBA74] via-[#CD7F32] to-[#7C4A1E] shadow-[0_12px_28px_rgba(205,127,50,0.35),inset_0_1px_0_rgba(255,255,255,0.5)]"

  const borderColor = isFirst ? "border-[#C9A86A]" : isSecond ? "border-[#C9A86A]/30" : "border-[#CD7F32]/40"
  const rankLabel = rank === 1 ? "JUARA 1" : rank === 2 ? "JUARA 2" : "JUARA 3"

  // Luxury crown on TOP of logo (like worn), and necklace medals for 2nd/3rd
  const LuxuryCrown = () => (
    <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-[0_4px_10px_rgba(201,168,106,0.7)] animate-[crownBounce_2.8s_ease-in-out_infinite]">
      <svg width="56" height="32" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`crownGrad-${rank}`} x1="0" y1="0" x2="0" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE9A8" />
            <stop offset="35%" stopColor="#FFD700" />
            <stop offset="65%" stopColor="#C9A86A" />
            <stop offset="100%" stopColor="#8C6A2A" />
          </linearGradient>
          <radialGradient id={`gem-${rank}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#C9A86A" />
          </radialGradient>
        </defs>
        {/* base band */}
        <path d="M10 22 L16 9 L28 17 L40 9 L46 22 Z" fill={`url(#crownGrad-${rank})`} stroke="white" strokeWidth="1" strokeLinejoin="round" />
        {/* jewels on tips */}
        <circle cx="16" cy="9" r="3.2" fill="white" stroke="#C9A86A" strokeWidth="0.7" />
        <circle cx="28" cy="17" r="3.6" fill="white" stroke="#8C6A2A" strokeWidth="0.7" />
        <circle cx="40" cy="9" r="3.2" fill="white" stroke="#C9A86A" strokeWidth="0.7" />
        {/* center gem red */}
        <circle cx="28" cy="13.5" r="1.8" fill="#A51D2D" stroke="white" strokeWidth="0.5" />
        <circle cx="16" cy="9" r="1.1" fill="#2DD4BF" />
        <circle cx="40" cy="9" r="1.1" fill="#2DD4BF" />
        {/* band bottom with pearls */}
        <rect x="10" y="22" width="36" height="5.5" rx="2.2" fill="#8C6A2A" stroke="white" strokeWidth="0.6" />
        <circle cx="15" cy="24.8" r="1" fill="white" opacity="0.95" />
        <circle cx="22" cy="24.8" r="1" fill="white" opacity="0.95" />
        <circle cx="28" cy="24.8" r="1.1" fill="white" />
        <circle cx="34" cy="24.8" r="1" fill="white" opacity="0.95" />
        <circle cx="41" cy="24.8" r="1" fill="white" opacity="0.95" />
        {/* inner highlight */}
        <path d="M14 20.5 L28 15 L42 20.5" stroke="white" strokeWidth="0.6" opacity="0.35" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
  const MedalNecklace = () => {
    const isSilver = isSecond
    const medalGradient = isSilver ? "from-[#E5E7EB] via-[#C0C0C0] to-[#8E8E93]" : "from-[#FDBA74] via-[#CD7F32] to-[#7C4A1E]"
    const chainColor = isSilver ? "#C0C0C0" : "#CD7F32"
    return (
      <div className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        {/* chain */}
        <svg width="44" height="18" viewBox="0 0 44 18" fill="none" className="overflow-visible">
          <path d="M 10 0 L 18 10 M 34 0 L 26 10" stroke={chainColor} strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
          <path d="M 10 0 L 12 4 L 14 7 L 16 10 M 34 0 L 32 4 L 30 7 L 28 10" stroke="white" strokeWidth="0.5" opacity="0.4" fill="none" />
          {/* small chain links */}
          <circle cx="12" cy="4" r="1.1" fill={chainColor} stroke="white" strokeWidth="0.4" />
          <circle cx="15" cy="7" r="1.1" fill={chainColor} stroke="white" strokeWidth="0.4" />
          <circle cx="32" cy="4" r="1.1" fill={chainColor} stroke="white" strokeWidth="0.4" />
          <circle cx="29" cy="7" r="1.1" fill={chainColor} stroke="white" strokeWidth="0.4" />
        </svg>
        {/* medal pendant */}
        <div className={`-mt-1 h-8 w-8 rounded-full bg-gradient-to-br ${medalGradient} grid place-items-center text-[11px] font-black text-white shadow-[0_3px_10px_rgba(0,0,0,0.35)] border-2 border-white ring-1 ring-black/10`}>
          <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">{rank}</span>
        </div>
        <div className={`h-1 w-6 rounded-full -mt-0.5 opacity-30 blur-[1px] ${isSilver ? "bg-black" : "bg-[#7C4A1E]"}`} />
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center flex-1 max-w-[180px] min-w-0 ${isFirst ? "z-10" : "z-0"}`}>
      {/* Logo with crown ON TOP (luxury) for juara 1, necklace medal for 2 & 3 — transparent, original shield shape */}
      <div className="flex flex-col items-center relative pt-5">
        {isFirst && <LuxuryCrown />}
        <div className={`relative h-20 w-20 md:h-[88px] md:w-[88px] bg-transparent shrink-0 grid place-items-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${isFirst ? "animate-[float_3.2s_ease-in-out_infinite]" : ""}`}>
          <img
            src={team.logo_url || team.image_url || "/assets/brand/lkbb-logo.jpg"}
            alt={team.name}
            className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
            style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}
          />
          {/* rank badge top-right — small, keep but no white border clipping logo */}
          <div className={`absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full grid place-items-center text-[11px] font-black shadow border border-white/20 ${isFirst ? "bg-[#0B0C0F] text-[var(--primary)]" : "bg-white text-[#0B0C0F]"}`}>
            {rank}
          </div>
        </div>
        {!isFirst && <MedalNecklace />}
        {/* rank label below necklace/crown */}
        <div className={`relative z-10 flex flex-col items-center ${isFirst ? "mt-2" : "mt-6"}`}>
          {isFirst ? (
            <span className="inline-flex rounded-full bg-gradient-to-r from-[#FFD700] via-[#C9A86A] to-[#8C6A2A] px-2.5 py-1 text-[10px] font-black tracking-widest text-white shadow border border-white/20">JUARA 1</span>
          ) : (
            <span className="text-[9px] font-black tracking-[0.14em] text-muted-foreground">{rankLabel}</span>
          )}
        </div>

        {/* Text below crown/medal */}
        <div className="mt-2.5 text-center max-w-[150px]">
          {isFirst && <div className="text-[9px] font-black tracking-[0.16em] text-[#C9A86A]">— JUARA 1 —</div>}
          <div className="mt-1 text-[13px] md:text-sm font-black leading-tight line-clamp-2 text-white md:text-foreground break-words">{team.name}</div>
          <div className="text-[11px] text-white/60 md:text-muted-foreground line-clamp-1">{team.school || ""}</div>
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-[#0B0C0F] md:bg-[#0B0C0F] text-white px-2.5 py-1 text-[11px] font-black border border-white/10">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A86A] animate-pulse" />
            #{team.number}
          </div>
          {team.total_ballots !== undefined && (
            <div className="mt-1 text-[11px] font-bold tabular-nums text-[#C9A86A]">{Number(team.total_ballots).toLocaleString("id-ID")} dukungan</div>
          )}
          {team.online_ballots !== undefined && team.total_ballots === undefined && (
            <div className="mt-1 text-[11px] font-bold tabular-nums text-[#C9A86A]">{Number(team.online_ballots).toLocaleString("id-ID")} online</div>
          )}
        </div>
      </div>

      {/* Podium step — premium, not generic flat: metallic, top highlight, side bevel, subtle texture */}
      <div className={`mt-3 w-full rounded-t-[14px] md:rounded-t-[16px] border-t-[3px] flex flex-col items-center justify-start pt-3 sm:pt-4 shadow-xl ${podiumBg} ${isFirst ? "text-[#1A1400]" : "text-white"} ${height} relative overflow-hidden min-w-0`}>
        {/* top highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[78%] bg-white/50" />
        {/* side bevel */}
        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/15 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/10 to-transparent" />
        {/* subtle diagonal texture */}
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `repeating-linear-gradient(135deg, transparent 0 8px, rgba(255,255,255,0.4) 8px 9px)` }} />
        {/* inner highlight */}
        <div className="absolute inset-0 rounded-t-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] pointer-events-none" />

        <div className={`relative text-[28px] md:text-4xl font-black tracking-tighter leading-none ${isFirst ? "text-[#1A1400] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]" : "text-white"}`}>
          {rank}
        </div>
        <div className={`relative mt-0.5 text-[9px] font-black tracking-[0.16em] ${isFirst ? "text-[#1A1400]/70" : "text-white/80"}`}>#{team.number}</div>
        {/* decorative bottom line */}
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-black/10" />
        {/* shimmer for juara 1 */}
        {isFirst && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-[shimmer_2.6s_ease-in-out_infinite]" style={{ backgroundSize: "200% 100%" }} />}
      </div>

      <style>{`
        @keyframes float { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-4px) } }
        @keyframes crownBounce { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-2px) } }
        @keyframes shimmer { 0%{ transform: translateX(-100%) skewX(-12deg) } 100%{ transform: translateX(200%) skewX(-12deg) } }
      `}</style>
    </div>
  )
}

export function Podium({ teams, category, showPoints = true }: { teams: Team[]; category?: string; showPoints?: boolean }) {
  if (!teams || teams.length === 0) return null

  const sorted = [...teams].sort((a, b) => {
    const aTotal = a.total_ballots ?? a.online_ballots ?? 0
    const bTotal = b.total_ballots ?? b.online_ballots ?? 0
    return bTotal - aTotal
  }).slice(0, 3)

  const orderedForDisplay = []
  if (sorted[1]) orderedForDisplay.push({ team: sorted[1], rank: 2, height: "h-[132px] sm:h-[148px] md:h-[160px]" })
  if (sorted[0]) orderedForDisplay.push({ team: sorted[0], rank: 1, height: "h-[168px] sm:h-[186px] md:h-[200px]" })
  if (sorted[2]) orderedForDisplay.push({ team: sorted[2], rank: 3, height: "h-[116px] sm:h-[128px] md:h-[140px]" })

  return (
    <div className="w-full">
      {category && (
        <div className="flex items-center justify-center gap-2 mb-5 sm:mb-6">
          <span className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-3 py-1 text-[11px] font-black tracking-wide shadow">{category}</span>
          <span className="text-[11px] text-white/50">{teams.length} tim</span>
        </div>
      )}
      <div className="flex items-end justify-center gap-2 sm:gap-3 md:gap-4 max-w-[640px] mx-auto px-1">
        {orderedForDisplay.map(({ team, rank, height }) => (
          <PodiumCard key={team.id} team={team} rank={rank} height={height} />
        ))}
      </div>
      {sorted.length > 0 && (
        <div className="mt-5 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 backdrop-blur border border-white/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#C9A86A] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wide text-white/80">Peringkat Akhir</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function PodiumSection({ smp, sma, isPublished }: { smp: Team[]; sma: Team[]; isPublished: boolean }) {
  const [festive, setFestive] = useState(false)
  useEffect(() => {
    if (!isPublished) return
    // festive burst when podium mounts (website closed → podium appears di beranda)
    setFestive(true)
    const t = setTimeout(() => setFestive(false), 4200)
    return () => clearTimeout(t)
  }, [isPublished])

  if (!isPublished) return null
  return (
    <section className="relative overflow-hidden bg-[#09090b] border-y border-[#C9A86A]/15 py-8 sm:py-10 md:py-14">
      {/* festive background — subtle radial gold glow + confetti */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(600px_320px_at_50%_0%,rgba(201,168,106,0.18),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(201,168,106,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,106,0.6) 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C9A86A]/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C9A86A]/20 to-transparent" />
      </div>
      <Confetti active={festive} />

      {/* subtle floating orbs behind */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-64 w-64 rounded-full bg-[#C9A86A]/10 blur-3xl animate-[float_6s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-[#C9A86A]/5 blur-3xl animate-[float_7s_ease-in-out_infinite_reverse]" />

      <div className="relative mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C9A86A] to-[#8C6A2A] px-4 py-1.5 text-xs font-black tracking-wide text-white shadow-[0_4px_16px_rgba(201,168,106,0.35)]">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            HASIL AKHIR — TANGGA JUARA
            <span className="hidden sm:inline-flex h-1.5 w-1.5 rounded-full bg-white/60" />
          </div>
          <h2 className="mt-3 text-[22px] sm:text-[26px] md:text-[32px] font-black tracking-[-0.02em] text-white leading-none">
            PODIUM <span className="text-[#C9A86A]">JUARA</span>
          </h2>
          <p className="mt-2 text-[12px] sm:text-sm text-white/55 leading-relaxed">
            Peringkat akhir berdasarkan total dukungan online + offline. Selamat kepada para juara — meriah!
          </p>
          {/* festive badge */}
          {festive && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#C9A86A] text-[#0B0C0F] px-3 py-1 text-[11px] font-black animate-[crownBounce_1.2s_ease_infinite]">
              🎉 Selamat! 🎉
            </div>
          )}
        </div>

        <div className={`mt-8 sm:mt-10 grid gap-8 sm:gap-10 ${festive ? "animate-[fadeIn_0.6s_ease-out]" : ""}`}>
          {sma.length > 0 && (
            <div className="relative rounded-[20px] border border-white/[0.06] bg-white/[0.02] backdrop-blur p-4 sm:p-6">
              <Podium teams={sma} category="SMA / SEDERAJAT" />
            </div>
          )}
          {smp.length > 0 && (
            <div className="relative rounded-[20px] border border-white/[0.06] bg-white/[0.02] backdrop-blur p-4 sm:p-6">
              <Podium teams={smp} category="SMP / SEDERAJAT" />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-[11px] text-white/30">Mahkota mewah di atas logo juara 1 — kalung medali untuk juara 2 & 3</p>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{ transform: translateY(0)} 50%{ transform: translateY(-8px)} }
        @keyframes fadeIn { from{ opacity:0; transform: translateY(12px)} to{opacity:1; transform: translateY(0)} }
      `}</style>
    </section>
  )
}
