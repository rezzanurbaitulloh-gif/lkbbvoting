"use client"
import { useEffect, useState, useRef } from "react"

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

// --- Crown (juara 1) with glow pulse ---
function Crown({ size = 52 }: { size?: number }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{ top: -size * 0.52 }}>
      <div className="absolute inset-0 -z-10 blur-[14px] opacity-60 bg-[radial-gradient(40px_18px_at_50%_70%,rgba(201,168,106,0.9),transparent_70%)] animate-[crownGlow_2.2s_ease-in-out_infinite]" />
      <svg width={size} height={size * 0.62} viewBox="0 0 56 34" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-[crownBounce_2.8s_ease-in-out_infinite] drop-shadow-[0_6px_16px_rgba(201,168,106,0.7)]">
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

function Laurel({ side, color, delay = 0 }: { side: "left" | "right"; color: string; delay?: number }) {
  const d = side === "left"
    ? "M 32 10 C 28 12 24 16 22 22 C 24 20 28 18 32 16 M 30 18 C 26 20 22 24 20 30 C 24 27 28 24 30 20 M 28 26 C 26 28 24 31 22 34"
    : "M 12 10 C 16 12 20 16 22 22 C 20 20 16 18 12 16 M 14 18 C 18 20 22 24 24 30 C 20 27 16 24 14 20 M 16 26 C 18 28 20 31 22 34"
  return (
    <svg width="36" height="48" viewBox="0 0 44 44" fill="none" className="opacity-90 animate-[laurelSway_3.2s_ease-in-out_infinite]" style={{ color, animationDelay: `${delay}ms` }}>
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.95" />
      <path d={d} stroke="white" strokeWidth="0.4" opacity="0.2" fill="none" />
      <ellipse cx={side === "left" ? 27 : 17} cy={14} rx={3} ry={1.6} fill="currentColor" opacity={0.9} transform={side === "left" ? "rotate(-28 27 14)" : "rotate(28 17 14)"} />
      <ellipse cx={side === "left" ? 24 : 20} cy={22} rx={3.2} ry={1.6} fill="currentColor" opacity={0.85} transform={side === "left" ? "rotate(-32 24 22)" : "rotate(32 20 22)"} />
      <ellipse cx={side === "left" ? 23 : 21} cy={31} rx={2.6} ry={1.4} fill="currentColor" opacity={0.8} transform={side === "left" ? "rotate(-22 23 31)" : "rotate(22 21 31)"} />
    </svg>
  )
}

function ShieldPodiumCard({ team, rank, delay = 0 }: { team: Team; rank: number; delay?: number }) {
  const isFirst = rank === 1
  const isSecond = rank === 2
  // palettes — refined with hover & proper heights
  const cfg = isFirst
    ? {
        borderGrad: "from-[#FFE9A8] via-[#C9A86A] to-[#8C6A2A]",
        bg: "from-[#0F172A] via-[#0B1220] to-[#020617]",
        glow: "shadow-[0_18px_56px_rgba(201,168,106,0.38),0_0_42px_rgba(201,168,106,0.20)]",
        glowHover: "hover:shadow-[0_22px_64px_rgba(201,168,106,0.45),0_0_52px_rgba(201,168,106,0.28)]",
        medalBg: "from-[#FFE9A8] via-[#FFD700] to-[#B45309]",
        medalText: "text-[#5B3A00]",
        medalRing: "ring-[#C9A86A]",
        laurel: "#C9A86A",
        juaraBar: "from-[#8C6A2A] via-[#C9A86A] to-[#8C6A2A]",
        juaraText: "text-[#1A1400]",
        foot: "bg-[#0B1220] border-[#C9A86A]/30",
        // more proper ratio: w ~ 1, h ~ 1.75 on mobile, 1.85 desktop
        height: "h-[282px] xs:h-[312px] sm:h-[360px] md:h-[410px] lg:h-[508px]",
        width: "w-[108px] xs:w-[126px] sm:w-[162px] md:w-[192px] lg:w-[272px]",
        logoSize: "h-[54px] w-[54px] xs:h-[60px] xs:w-[60px] sm:h-[72px] sm:w-[72px] md:h-[80px] md:w-[80px] lg:h-[88px] lg:w-[88px]",
      }
    : isSecond
    ? {
        borderGrad: "from-[#E5E7EB] via-[#94A3B8] to-[#475569]",
        bg: "from-[#0F172A] via-[#0B1220] to-[#020617]",
        glow: "shadow-[0_14px_36px_rgba(148,163,184,0.22)]",
        glowHover: "hover:shadow-[0_18px_44px_rgba(148,163,184,0.30)]",
        medalBg: "from-[#F8FAFC] via-[#CBD5E1] to-[#64748B]",
        medalText: "text-[#1E293B]",
        medalRing: "ring-[#94A3B8]",
        laurel: "#94A3B8",
        juaraBar: "from-[#334155] via-[#94A3B8] to-[#334155]",
        juaraText: "text-white",
        foot: "bg-[#0B1220] border-[#475569]/30",
        height: "h-[242px] xs:h-[268px] sm:h-[310px] md:h-[350px] lg:h-[432px]",
        width: "w-[100px] xs:w-[116px] sm:w-[150px] md:w-[176px] lg:w-[248px]",
        logoSize: "h-[50px] w-[50px] xs:h-[56px] xs:w-[56px] sm:h-[66px] sm:w-[66px] md:h-[72px] md:w-[72px] lg:h-[78px] lg:w-[78px]",
      }
    : {
        borderGrad: "from-[#FDBA74] via-[#B45309] to-[#7C2D12]",
        bg: "from-[#1A0F0A] via-[#0F172A] to-[#020617]",
        glow: "shadow-[0_14px_36px_rgba(180,83,9,0.22)]",
        glowHover: "hover:shadow-[0_18px_44px_rgba(180,83,9,0.30)]",
        medalBg: "from-[#FDBA74] via-[#EA580C] to-[#7C2D12]",
        medalText: "text-white",
        medalRing: "ring-[#B45309]",
        laurel: "#B45309",
        juaraBar: "from-[#7C2D12] via-[#B45309] to-[#7C2D12]",
        juaraText: "text-white",
        foot: "bg-[#0F0A06] border-[#7C2D12]/30",
        height: "h-[232px] xs:h-[258px] sm:h-[298px] md:h-[336px] lg:h-[414px]",
        width: "w-[100px] xs:w-[116px] sm:w-[150px] md:w-[176px] lg:w-[248px]",
        logoSize: "h-[50px] w-[50px] xs:h-[56px] xs:w-[56px] sm:h-[66px] sm:w-[66px] md:h-[72px] md:w-[72px] lg:h-[78px] lg:w-[78px]",
      }

  const clip = "polygon(13px 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 0 100%, 0 13px)"

  return (
    <div
      className={`relative flex flex-col items-center ${cfg.width} shrink-0 ${isFirst ? "z-20" : "z-10"} group/card`}
      style={{ animation: `shieldEnter 0.72s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${delay}ms` }}
    >
      {/* soft aura behind juara 1 */}
      {isFirst && <div className="pointer-events-none absolute -inset-3 -z-10 bg-[radial-gradient(320px_180px_at_50%_20%,rgba(201,168,106,0.22),transparent_70%)] blur-[1px] opacity-70 group-hover/card:opacity-100 transition-opacity" />}
      {isFirst && <Crown size={isFirst ? 54 : 44} />}

      {/* shield with hover lift + shimmer */}
      <div
        className={`relative w-full ${cfg.height} bg-gradient-to-b ${cfg.borderGrad} p-[1.5px] sm:p-[2px] ${cfg.glow} ${cfg.glowHover} transition-all duration-400 will-change-transform group-hover/card:-translate-y-1.5 group-hover/card:scale-[1.01]`}
        style={{ clipPath: clip, animation: isFirst ? `floatY 3.6s ease-in-out infinite` : undefined, animationDelay: isFirst ? `${delay + 600}ms` : undefined }}
      >
        <div className={`relative w-full h-full bg-gradient-to-b ${cfg.bg} flex flex-col items-center pt-[22px] xs:pt-6 sm:pt-8 md:pt-9 pb-[46px] sm:pb-[52px] overflow-hidden`} style={{ clipPath: clip }}>
          {/* inner highlights */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_220px_at_50%_0%,rgba(201,168,106,0.13),transparent_68%)]" />
          <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/22 to-transparent" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `repeating-linear-gradient(135deg, transparent 0 11px, rgba(255,255,255,0.55) 11px 12px)` }} />
          {/* shimmer sweep */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ clipPath: clip }}>
            <div className="absolute -inset-x-8 top-0 h-[46%] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent -skew-x-12 translate-x-[-140%] group-hover/card:translate-x-[140%] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]" />
          </div>

          {/* logo with subtle float for juara 1 */}
          <div className={`relative ${cfg.logoSize} shrink-0 grid place-items-center drop-shadow-[0_4px_14px_rgba(0,0,0,0.55)] ${isFirst ? "animate-[logoFloat_3.8s_ease-in-out_infinite]" : ""}`} style={{ animationDelay: `${delay + 200}ms` }}>
            <img src={team.logo_url || team.image_url || "/assets/brand/lkbb-logo.jpg"} alt={team.name} className="h-full w-full object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]" loading="lazy" />
          </div>

          {/* laurel + medal with pulse */}
          <div className="relative mt-2.5 xs:mt-3 sm:mt-4 flex items-center justify-center gap-0.5 sm:gap-1">
            <Laurel side="left" color={cfg.laurel} delay={delay} />
            <div className={`relative h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full bg-gradient-to-br ${cfg.medalBg} grid place-items-center text-[14px] xs:text-[15px] sm:text-[16px] md:text-[18px] font-black ${cfg.medalText} shadow-[0_4px_14px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.72)] ring-2 ${cfg.medalRing} border border-white/40 animate-[medalPulse_2.4s_ease-in-out_infinite]`} style={{ animationDelay: `${delay + 400}ms` }}>
              <span className="relative z-10">{rank}</span>
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/22 to-white/0 opacity-60" />
            </div>
            <Laurel side="right" color={cfg.laurel} delay={delay + 120} />
          </div>

          {/* team name — more proper spacing & line clamp */}
          <div className="mt-2.5 xs:mt-3 sm:mt-4 text-center px-1.5 xs:px-2 sm:px-3 max-w-full flex-1 flex flex-col items-center">
            <div className="text-[10px] xs:text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-black leading-[1.15] tracking-tight text-white line-clamp-2 break-words drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)] min-h-[2.2em] flex items-center">{team.name}</div>
            <div className="mt-1 text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs leading-tight text-white/55 line-clamp-1 max-w-[92%]">{team.school || ""}</div>
            <div className="mt-1.5 xs:mt-2 inline-flex items-center gap-1 xs:gap-1.5 rounded-full bg-black/28 backdrop-blur border border-white/10 px-2 xs:px-2.5 py-1 text-[9px] xs:text-[10px] sm:text-[11px] font-black text-white shadow-[0_1px_6px_rgba(0,0,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A86A] animate-pulse shrink-0" />#{team.number}
            </div>
            <div className="mt-1 xs:mt-1.5 text-[9px] xs:text-[10px] sm:text-[11px] font-bold tabular-nums tracking-wide text-[#C9A86A]">{Number(team.online_ballots ?? 0).toLocaleString("id-ID")} online</div>
          </div>

          {/* juara bar — proper pill with clip */}
          <div className="absolute bottom-[10px] xs:bottom-3 left-2 right-2 xs:left-3 xs:right-3">
            <div className={`relative h-[26px] xs:h-[28px] sm:h-8 flex items-center justify-center bg-gradient-to-r ${cfg.juaraBar} shadow-[0_3px_12px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.28)] overflow-hidden`} style={{ clipPath: "polygon(9px 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 9px 100%, 0 50%)" }}>
              <span className={`relative text-[9px] xs:text-[10px] sm:text-[11px] lg:text-xs font-black tracking-[0.14em] ${cfg.juaraText}`}>JUARA {rank}</span>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/14 to-transparent -skew-x-12 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-700 ease-out" />
            </div>
          </div>
        </div>
      </div>

      {/* podium foot — proper depth with inner line */}
      <div className={`-mt-[1px] w-[90%] h-[10px] xs:h-[11px] sm:h-[13px] md:h-[15px] lg:h-[16px] ${cfg.foot} border-x border-b shadow-[0_8px_18px_rgba(0,0,0,0.42)] relative overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-px bg-white/14" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-black/10" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-black/20" />
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

  const ordered: Array<{ team: Team; rank: 1 | 2 | 3; delay: number }> = []
  if (sorted[1]) ordered.push({ team: sorted[1], rank: 2, delay: 120 })
  if (sorted[0]) ordered.push({ team: sorted[0], rank: 1, delay: 260 })
  if (sorted[2]) ordered.push({ team: sorted[2], rank: 3, delay: 400 })

  return (
    <div className="w-full">
      {category && (
        <div className="flex items-center justify-center gap-2 mb-3 xs:mb-4 sm:mb-5">
          <span className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black tracking-wide shadow-[0_2px_10px_rgba(201,168,106,0.25)]">{category}</span>
          <span className="text-[10px] sm:text-[11px] text-white/45 tabular-nums">{teams.length} tim</span>
        </div>
      )}
      {/* shields row — proper gap & responsive, juara 1 center taller, no overflow on 320px */}
      <div className="flex items-end justify-center gap-[6px] xs:gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 max-w-[980px] mx-auto px-0.5 sm:px-1">
        {ordered.map(({ team, rank, delay }) => (
          <ShieldPodiumCard key={team.id} team={team} rank={rank} delay={delay} />
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
      {/* background ornaments like screenshot — more depth & subtle motion */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#040A14]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_50%_-40px,rgba(201,168,106,0.16),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `linear-gradient(rgba(201,168,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,106,0.5) 1px, transparent 1px)`, backgroundSize: "56px 56px" }} />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C9A86A]/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C9A86A]/15 to-transparent" />
        {/* floating orbs behind — gentle drift */}
        <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-[#C9A86A]/[0.07] blur-3xl animate-[floatOrb_9s_ease-in-out_infinite]" />
        <div className="absolute -bottom-16 -left-12 h-72 w-72 rounded-full bg-[#C9A86A]/[0.05] blur-3xl animate-[floatOrb_11s_ease-in-out_infinite_reverse]" />
        {/* soft wave lines bottom like screenshot */}
        <svg className="absolute bottom-0 inset-x-0 h-[88px] sm:h-[90px] w-full opacity-[0.16] sm:opacity-[0.18]" viewBox="0 0 1440 90" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
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
        @keyframes crownBounce { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-2.2px) } }
        @keyframes crownGlow { 0%,100%{ opacity:0.55; transform: scale(1) } 50%{ opacity:0.95; transform: scale(1.06) } }
        @keyframes floatY { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-5px) } }
        @keyframes logoFloat { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-3px) } }
        @keyframes medalPulse { 0%,100%{ transform: scale(1); box-shadow: 0 4px 14px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.72) } 50%{ transform: scale(1.05); box-shadow: 0 6px 18px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.85) } }
        @keyframes laurelSway { 0%,100%{ transform: rotate(-0.6deg) } 50%{ transform: rotate(0.6deg) } }
        @keyframes shieldEnter { 0%{ opacity:0; transform: translateY(22px) scale(0.96) } 100%{ opacity:1; transform: translateY(0) scale(1) } }
        @keyframes floatOrb { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-10px) } }
        @keyframes fadeIn { from{ opacity:0; transform: translateY(12px)} to{opacity:1; transform: translateY(0)} }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  )
}
