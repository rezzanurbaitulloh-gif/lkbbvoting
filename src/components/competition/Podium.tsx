"use client"
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

// --- Crown (juara 1) ---
function Crown({ size = 52 }: { size?: number }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-[0_6px_16px_rgba(201,168,106,0.7)]" style={{ top: -size * 0.52 }}>
      <svg width={size} height={size * 0.62} viewBox="0 0 56 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-[crownBounce_2.8s_ease-in-out_infinite]">
        <defs>
          <linearGradient id="crown-g" x1="0" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE9A8" />
            <stop offset="35%" stopColor="#FFD700" />
            <stop offset="65%" stopColor="#C9A86A" />
            <stop offset="100%" stopColor="#8C6A2A" />
          </linearGradient>
        </defs>
        <path d="M10 23 L16 9 L28 18 L40 9 L46 23 Z" fill="url(#crown-g)" stroke="white" strokeWidth="1.1" strokeLinejoin="round" />
        <circle cx="16" cy="9" r="3" fill="white" stroke="#C9A86A" strokeWidth="0.7" />
        <circle cx="40" cy="9" r="3" fill="white" stroke="#C9A86A" strokeWidth="0.7" />
        <circle cx="28" cy="16.5" r="2" fill="#A51D2D" stroke="white" strokeWidth="0.6" />
        <rect x="10" y="23" width="36" height="5.5" rx="2" fill="#8C6A2A" stroke="white" strokeWidth="0.7" />
        <circle cx="15" cy="25.8" r="1" fill="white" opacity="0.9" />
        <circle cx="22" cy="25.8" r="1" fill="white" opacity="0.9" />
        <circle cx="28" cy="25.8" r="1.1" fill="white" />
        <circle cx="34" cy="25.8" r="1" fill="white" opacity="0.9" />
        <circle cx="41" cy="25.8" r="1" fill="white" opacity="0.9" />
      </svg>
    </div>
  )
}

function Laurel({ side, color }: { side: "left" | "right"; color: string }) {
  const d = side === "left"
    ? "M 32 10 C 28 12 24 16 22 22 C 24 20 28 18 32 16 M 30 18 C 26 20 22 24 20 30 C 24 27 28 24 30 20 M 28 26 C 26 28 24 31 22 34"
    : "M 12 10 C 16 12 20 16 22 22 C 20 20 16 18 12 16 M 14 18 C 18 20 22 24 24 30 C 20 27 16 24 14 20 M 16 26 C 18 28 20 31 22 34"
  return (
    <svg width="36" height="48" viewBox="0 0 44 44" fill="none" className="opacity-90" style={{ color }}>
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
      <path d={d} stroke="white" strokeWidth="0.4" opacity="0.2" fill="none" />
      {/* small leaves */}
      <ellipse cx={side === "left" ? 27 : 17} cy={14} rx={3} ry={1.6} fill="currentColor" opacity={0.9} transform={side === "left" ? "rotate(-28 27 14)" : "rotate(28 17 14)"} />
      <ellipse cx={side === "left" ? 24 : 20} cy={22} rx={3.2} ry={1.6} fill="currentColor" opacity={0.85} transform={side === "left" ? "rotate(-32 24 22)" : "rotate(32 20 22)"} />
      <ellipse cx={side === "left" ? 23 : 21} cy={31} rx={2.6} ry={1.4} fill="currentColor" opacity={0.8} transform={side === "left" ? "rotate(-22 23 31)" : "rotate(22 21 31)"} />
    </svg>
  )
}

function ShieldPodiumCard({ team, rank }: { team: Team; rank: number }) {
  const isFirst = rank === 1
  const isSecond = rank === 2
  // palettes
  const cfg = isFirst
    ? {
        border: "border-[#C9A86A]",
        borderGrad: "from-[#FFE9A8] via-[#C9A86A] to-[#8C6A2A]",
        bg: "from-[#0F172A] via-[#0B1220] to-[#020617]",
        glow: "shadow-[0_16px_48px_rgba(201,168,106,0.35),0_0_40px_rgba(201,168,106,0.18)]",
        medalBg: "from-[#FFE9A8] via-[#FFD700] to-[#B45309]",
        medalText: "text-[#5B3A00]",
        medalRing: "ring-[#C9A86A]",
        laurel: "#C9A86A",
        juaraBar: "from-[#B45309] via-[#C9A86A] to-[#B45309]",
        juaraText: "text-[#1A1400]",
        foot: "bg-[#0B1220] border-[#C9A86A]/30",
        height: "h-[360px] sm:h-[400px] md:h-[440px] lg:h-[520px]",
        width: "w-[148px] sm:w-[180px] md:w-[210px] lg:w-[280px]",
        logoSize: "h-[68px] w-[68px] sm:h-[76px] sm:w-[76px] md:h-[84px] md:w-[84px]",
      }
    : isSecond
    ? {
        border: "border-[#9CA3AF]",
        borderGrad: "from-[#E5E7EB] via-[#94A3B8] to-[#475569]",
        bg: "from-[#0F172A] via-[#0B1220] to-[#020617]",
        glow: "shadow-[0_12px_32px_rgba(148,163,184,0.22)]",
        medalBg: "from-[#F1F5F9] via-[#CBD5E1] to-[#64748B]",
        medalText: "text-[#1E293B]",
        medalRing: "ring-[#94A3B8]",
        laurel: "#94A3B8",
        juaraBar: "from-[#475569] via-[#94A3B8] to-[#475569]",
        juaraText: "text-white",
        foot: "bg-[#0B1220] border-[#475569]/30",
        height: "h-[300px] sm:h-[340px] md:h-[380px] lg:h-[440px]",
        width: "w-[136px] sm:w-[168px] md:w-[190px] lg:w-[260px]",
        logoSize: "h-[60px] w-[60px] sm:h-[68px] sm:w-[68px] md:h-[76px] md:w-[76px]",
      }
    : {
        border: "border-[#B45309]",
        borderGrad: "from-[#FDBA74] via-[#B45309] to-[#7C2D12]",
        bg: "from-[#1A0F0A] via-[#0F172A] to-[#020617]",
        glow: "shadow-[0_12px_32px_rgba(180,83,9,0.22)]",
        medalBg: "from-[#FDBA74] via-[#EA580C] to-[#7C2D12]",
        medalText: "text-white",
        medalRing: "ring-[#B45309]",
        laurel: "#B45309",
        juaraBar: "from-[#7C2D12] via-[#B45309] to-[#7C2D12]",
        juaraText: "text-white",
        foot: "bg-[#0F0A06] border-[#7C2D12]/30",
        height: "h-[286px] sm:h-[324px] md:h-[360px] lg:h-[420px]",
        width: "w-[136px] sm:w-[168px] md:w-[190px] lg:w-[260px]",
        logoSize: "h-[60px] w-[60px] sm:h-[68px] sm:w-[68px] md:h-[76px] md:w-[76px]",
      }

  // shield clip: chamfered top 14px
  const clip = "polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%, 0 14px)"

  return (
    <div className={`relative flex flex-col items-center ${cfg.width} shrink-0 ${isFirst ? "z-20" : "z-10"}`}>
      {/* crown for juara 1 */}
      {isFirst && <Crown size={isFirst ? 56 : 44} />}

      {/* shield body + gradient border trick */}
      <div
        className={`relative w-full ${cfg.height} bg-gradient-to-b ${cfg.borderGrad} p-[2px] ${cfg.glow} transition-transform duration-300`}
        style={{ clipPath: clip }}
      >
        <div className={`relative w-full h-full bg-gradient-to-b ${cfg.bg} flex flex-col items-center pt-7 sm:pt-8 md:pt-9 pb-[52px] overflow-hidden`} style={{ clipPath: clip }}>
          {/* subtle inner highlight + vignette */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_220px_at_50%_0%,rgba(201,168,106,0.12),transparent_70%)]" />
          <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-white/20" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `repeating-linear-gradient(135deg, transparent 0 10px, rgba(255,255,255,0.5) 10px 11px)` }} />

          {/* logo */}
          <div className={`relative ${cfg.logoSize} shrink-0 grid place-items-center drop-shadow-[0_4px_14px_rgba(0,0,0,0.6)]`}>
            <img src={team.logo_url || team.image_url || "/assets/brand/lkbb-logo.jpg"} alt={team.name} className="h-full w-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]" />
          </div>

          {/* laurel + medal */}
          <div className="relative mt-3 sm:mt-4 flex items-center justify-center gap-0.5 sm:gap-1">
            <Laurel side="left" color={cfg.laurel} />
            <div className={`h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full bg-gradient-to-br ${cfg.medalBg} grid place-items-center text-[16px] sm:text-[17px] md:text-[18px] font-black ${cfg.medalText} shadow-[0_4px_12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.7)] ring-2 ${cfg.medalRing} border border-white/40`}>
              {rank}
            </div>
            <Laurel side="right" color={cfg.laurel} />
          </div>

          {/* team name */}
          <div className="mt-3 sm:mt-4 text-center px-2 sm:px-3 max-w-full">
            <div className="text-[11px] sm:text-xs md:text-sm font-black leading-tight tracking-tight text-white line-clamp-2 break-words drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">{team.name}</div>
            <div className="mt-1 text-[10px] sm:text-[11px] md:text-xs leading-tight text-white/60 line-clamp-1">{team.school || ""}</div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/30 backdrop-blur border border-white/10 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-black text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A86A] animate-pulse" />#{team.number}
            </div>
            {/* online preview kecil seperti sebelumnya tapi lebih subtle */}
            <div className="mt-1.5 text-[10px] sm:text-[11px] font-bold tabular-nums text-[#C9A86A]">{Number(team.online_ballots ?? 0).toLocaleString("id-ID")} online</div>
          </div>

          {/* juara bar at bottom of shield */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className={`relative h-7 sm:h-8 rounded-[0] flex items-center justify-center bg-gradient-to-r ${cfg.juaraBar} shadow-[0_2px_10px_rgba(0,0,0,0.35)]`} style={{ clipPath: "polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%)" }}>
              <span className={`text-[10px] sm:text-[11px] md:text-xs font-black tracking-[0.14em] ${cfg.juaraText}`}>JUARA {rank}</span>
            </div>
          </div>

          {/* bottom thin line inside */}
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px] bg-white/10" />
        </div>
      </div>

      {/* podium foot base */}
      <div className={`-mt-[1px] w-[92%] h-[10px] sm:h-[12px] md:h-[14px] lg:h-[16px] ${cfg.foot} border-x border-b shadow-[0_6px_16px_rgba(0,0,0,0.45)] relative`}>
        <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
      </div>
    </div>
  )
}

export function Podium({ teams, category, showPoints = true }: { teams: Team[]; category?: string; showPoints?: boolean }) {
  if (!teams || teams.length === 0) return null

  const sorted = [...teams].sort((a, b) => {
    const aOn = a.online_ballots ?? 0
    const bOn = b.online_ballots ?? 0
    if (bOn !== aOn) return bOn - aOn
    const aTot = a.total_ballots ?? aOn
    const bTot = b.total_ballots ?? bOn
    if (bTot !== aTot) return bTot - aTot
    return String(a.number).localeCompare(String(b.number))
  }).slice(0, 3)

  const ordered = []
  if (sorted[1]) ordered.push({ team: sorted[1], rank: 2 as const })
  if (sorted[0]) ordered.push({ team: sorted[0], rank: 1 as const })
  if (sorted[2]) ordered.push({ team: sorted[2], rank: 3 as const })

  return (
    <div className="w-full">
      {category && (
        <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
          <span className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black tracking-wide shadow">{category}</span>
          <span className="text-[10px] sm:text-[11px] text-white/45">{teams.length} tim</span>
        </div>
      )}
      {/* shields row — side-by-side, juara 1 center taller */}
      <div className="flex items-end justify-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 max-w-[980px] mx-auto px-1">
        {ordered.map(({ team, rank }) => (
          <ShieldPodiumCard key={team.id} team={team} rank={rank} />
        ))}
      </div>
    </div>
  )
}

export function PodiumSection({ smp, sma, isPublished }: { smp: Team[]; sma: Team[]; isPublished: boolean }) {
  const [festive, setFestive] = useState(false)
  useEffect(() => {
    if (!isPublished) return
    setFestive(true)
    const t = setTimeout(() => setFestive(false), 4200)
    return () => clearTimeout(t)
  }, [isPublished])

  if (!isPublished) return null
  return (
    <section className="relative overflow-hidden bg-[#040A14] border-y border-[#C9A86A]/15 py-8 sm:py-10 md:py-12 lg:py-14">
      {/* background ornaments like screenshot */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#040A14]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_-40px,rgba(201,168,106,0.14),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(201,168,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,106,0.5) 1px, transparent 1px)`, backgroundSize: "56px 56px" }} />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C9A86A]/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C9A86A]/15 to-transparent" />
        {/* soft wave lines bottom like screenshot */}
        <svg className="absolute bottom-0 inset-x-0 h-[90px] w-full opacity-[0.18]" viewBox="0 0 1440 90" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 52 C 220 92 420 18 720 52 C 980 78 1120 28 1440 58" stroke="#C9A86A" strokeWidth="1" fill="none" />
          <path d="M0 66 C 240 98 440 32 720 66 C 1040 92 1200 42 1440 72" stroke="#C9A86A" strokeWidth="0.7" opacity="0.6" fill="none" />
        </svg>
      </div>

      {/* side ribbons — desktop only like screenshot */}
      <div className="pointer-events-none hidden lg:block absolute left-0 top-0 bottom-0 w-[84px]">
        <div className="absolute inset-0 bg-[#060B16] border-r border-[#C9A86A]/20" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 22px), 50% 100%, 0 calc(100% - 22px))" }} />
        <div className="absolute inset-[1px] border border-[#C9A86A]/20" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 22px), 50% 100%, 0 calc(100% - 22px))" }} />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center leading-[1.7] text-[10px] font-bold tracking-[0.16em] text-white/45">
            DISIPLIN<br/>LOYALITAS<br/>KEBERSAMAAN<br/>PRESTASI
            <div className="mx-auto mt-4 h-5 w-5 rotate-45 border border-[#C9A86A]/30 bg-[#C9A86A]/10 grid place-items-center"><div className="h-1.5 w-1.5 bg-[#C9A86A]/50 rotate-45" /></div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none hidden lg:block absolute right-0 top-0 bottom-0 w-[84px]">
        <div className="absolute inset-0 bg-[#060B16] border-l border-[#C9A86A]/20" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 22px), 50% 100%, 0 calc(100% - 22px))" }} />
        <div className="absolute inset-[1px] border border-[#C9A86A]/20" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 22px), 50% 100%, 0 calc(100% - 22px))" }} />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center leading-[1.7] text-[10px] font-bold tracking-[0.16em] text-white/45">
            SATU<br/>LANGKAH<br/>SATU<br/>TUJUAN
            <div className="mx-auto mt-4 h-5 w-5 rotate-45 border border-[#C9A86A]/30 bg-[#C9A86A]/10 grid place-items-center"><div className="h-1.5 w-1.5 bg-[#C9A86A]/50 rotate-45" /></div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 lg:px-[96px]">
        {/* header like screenshot */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-3">
            <span className="hidden sm:block h-px w-10 bg-[#C9A86A]/40" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] text-[#C9A86A]">HASIL SEMENTARA</span>
            <span className="hidden sm:block h-px w-10 bg-[#C9A86A]/40" />
          </div>
          <div className="mt-2 flex items-center justify-center gap-3 sm:gap-4">
            <span className="hidden sm:block h-px flex-1 max-w-[88px] bg-[#C9A86A]/30" />
            <h2 className="text-[22px] sm:text-[28px] md:text-[34px] lg:text-[40px] font-black tracking-[-0.03em] text-white leading-none" style={{ fontFamily: "ui-serif, Georgia, serif" }}>
              PODIUM PELETON TERFAVORIT
            </h2>
            <span className="hidden sm:block h-px flex-1 max-w-[88px] bg-[#C9A86A]/30" />
          </div>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-transparent to-[#C9A86A]/40" />
            <span className="text-[11px] sm:text-xs font-black tracking-[0.28em] text-white">LKBB 2025</span>
            <span className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-transparent to-[#C9A86A]/40" />
          </div>
          <p className="mt-2 text-[11px] sm:text-xs md:text-sm text-white/60 leading-relaxed">Javasoma The Impression – Astra Dharma Hayuning Budaya</p>
        </div>

        {/* festive dot */}
        {festive && (
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A86A] text-[#0B0C0F] px-3 py-1 text-[11px] font-black animate-[crownBounce_1.2s_ease_infinite]">🎉 Selamat! 🎉</div>
          </div>
        )}

        {/* SMP & SMA bersebelahan — end-user request */}
        <div className={`mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 ${festive ? "animate-[fadeIn_0.6s_ease-out]" : ""}`}>
          {sma.length > 0 && (
            <div className="relative">
              <Podium teams={sma} category="SMA / SEDERAJAT" />
            </div>
          )}
          {smp.length > 0 && (
            <div className="relative">
              <Podium teams={smp} category="SMP / SEDERAJAT" />
            </div>
          )}
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col items-center gap-2 text-center">
          <p className="text-[10px] sm:text-[11px] text-white/30 tracking-wide">Mahkota mewah di atas juara 1 — kalung medali untuk juara 2 & 3 • Peringkat berdasarkan online</p>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes crownBounce { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-2px) } }
        @keyframes fadeIn { from{ opacity:0; transform: translateY(12px)} to{opacity:1; transform: translateY(0)} }
      `}</style>
    </section>
  )
}
