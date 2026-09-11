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

function Crown({ size = 52 }: { size?: number }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]" style={{ top: -size * 0.48 }}>
      <svg width={size} height={size * 0.56} viewBox="0 0 56 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20 L16 9 L28 16 L40 9 L46 20 Z" fill="#C9A86A" stroke="white" strokeWidth="1" strokeLinejoin="round" />
        <rect x="10" y="20" width="36" height="4.5" rx="1.2" fill="#8C6A2A" stroke="white" strokeWidth="0.6" />
        <circle cx="16" cy="9" r="1.8" fill="white" opacity="0.9" />
        <circle cx="40" cy="9" r="1.8" fill="white" opacity="0.9" />
        <circle cx="28" cy="14.5" r="1.4" fill="white" opacity="0.9" />
      </svg>
    </div>
  )
}

function Laurel({ side, color }: { side: "left" | "right"; color: string }) {
  const d = side === "left" ? "M 32 11 C 28 13 25 17 23 22" : "M 12 11 C 16 13 19 17 21 22"
  return (
    <svg width="28" height="36" viewBox="0 0 44 36" fill="none" className="opacity-70" style={{ color }}>
      <path d={d} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9" />
      <ellipse cx={side === "left" ? 27 : 17} cy={14} rx={2.6} ry={1.4} fill="currentColor" opacity="0.85" transform={side === "left" ? "rotate(-22 27 14)" : "rotate(22 17 14)"} />
      <ellipse cx={side === "left" ? 24 : 20} cy={21} rx={2.8} ry={1.4} fill="currentColor" opacity="0.8" transform={side === "left" ? "rotate(-26 24 21)" : "rotate(26 20 21)"} />
    </svg>
  )
}

function ShieldPodiumCard({ team, rank, delay = 0 }: { team: Team; rank: number; delay?: number }) {
  const isFirst = rank === 1
  const isSecond = rank === 2
  const cfg = isFirst
    ? {
        borderGrad: "from-[#C9A86A]/70 via-[#C9A86A] to-[#8C6A2A]/70",
        bg: "from-[#111318] via-[#0F1115] to-[#0A0C10]",
        glow: "shadow-[0_10px_28px_rgba(0,0,0,0.38),0_0_18px_rgba(201,168,106,0.10)]",
        medalBg: "from-[#FFE9A8] via-[#FFD700] to-[#B45309]",
        medalText: "text-[#5B3A00]",
        medalRing: "ring-[#C9A86A]/60",
        laurel: "#C9A86A",
        juaraBar: "from-[#8C6A2A] via-[#C9A86A] to-[#8C6A2A]",
        juaraText: "text-[#1A1400]",
        foot: "bg-white/[0.02] backdrop-blur border-white/[0.06]",
        height: "h-[236px] xs:h-[264px] sm:h-[308px] md:h-[340px] lg:h-[368px] xl:h-[404px]",
        width: "w-full",
        logoSize: "h-[46px] w-[46px] xs:h-[52px] xs:w-[52px] sm:h-[60px] sm:w-[60px] md:h-[66px] md:w-[66px] lg:h-[70px] lg:w-[70px] xl:h-[76px] xl:w-[76px]",
      }
    : isSecond
    ? {
        borderGrad: "from-white/[0.10] via-white/[0.14] to-white/[0.08]",
        bg: "from-[#111318] via-[#0F1115] to-[#0A0C10]",
        glow: "shadow-[0_8px_22px_rgba(0,0,0,0.32)]",
        medalBg: "from-[#F8FAFC] via-[#CBD5E1] to-[#64748B]",
        medalText: "text-[#1E293B]",
        medalRing: "ring-white/20",
        laurel: "#9AA0A9",
        juaraBar: "from-[#1E242E] via-[#2E333E] to-[#1E242E]",
        juaraText: "text-white/90",
        foot: "bg-white/[0.02] backdrop-blur border-white/[0.05]",
        height: "h-[192px] xs:h-[216px] sm:h-[260px] md:h-[288px] lg:h-[312px] xl:h-[348px]",
        width: "w-full",
        logoSize: "h-[40px] w-[40px] xs:h-[46px] xs:w-[46px] sm:h-[54px] sm:w-[54px] md:h-[60px] md:w-[60px] lg:h-[64px] lg:w-[64px] xl:h-[68px] xl:w-[68px]",
      }
    : {
        borderGrad: "from-[#B45309]/40 via-[#B45309]/55 to-[#7C2D12]/40",
        bg: "from-[#111318] via-[#0F1115] to-[#0A0C10]",
        glow: "shadow-[0_8px_22px_rgba(0,0,0,0.32)]",
        medalBg: "from-[#FDBA74] via-[#C7772A] to-[#7C2D12]",
        medalText: "text-white",
        medalRing: "ring-[#B45309]/40",
        laurel: "#9AA0A9",
        juaraBar: "from-[#1E242E] via-[#3A2A1A] to-[#1E242E]",
        juaraText: "text-white/85",
        foot: "bg-white/[0.02] backdrop-blur border-white/[0.05]",
        height: "h-[184px] xs:h-[208px] sm:h-[252px] md:h-[278px] lg:h-[302px] xl:h-[336px]",
        width: "w-full",
        logoSize: "h-[40px] w-[40px] xs:h-[46px] xs:w-[46px] sm:h-[54px] sm:w-[54px] md:h-[60px] md:w-[60px] lg:h-[64px] lg:w-[64px] xl:h-[68px] xl:w-[68px]",
      }

  const clip = "polygon(13px 0, calc(100% - 13px) 0, 100% 13px, 100% 100%, 0 100%, 0 13px)"

  return (
    <div className={`relative flex flex-col items-center ${cfg.width} min-w-0 flex-1 ${isFirst ? "z-20" : "z-10"} group/card`} style={{ animation: `shieldEnter 0.6s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${delay}ms` }}>
      {isFirst && <Crown size={50} />}
      <div className={`relative w-full ${cfg.height} bg-gradient-to-b ${cfg.borderGrad} p-[1px] ${cfg.glow} transition-transform duration-200 will-change-transform group-hover/card:-translate-y-[1px]`} style={{ clipPath: clip }}>
        <div className={`relative w-full h-full bg-gradient-to-b ${cfg.bg} flex flex-col items-center pt-[22px] xs:pt-6 sm:pt-8 md:pt-9 pb-[46px] sm:pb-[52px] overflow-hidden`} style={{ clipPath: clip }}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(560px_220px_at_50%_0%,rgba(201,168,106,0.08),transparent_68%)]" />
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
          <div className={`relative ${cfg.logoSize} shrink-0 grid place-items-center drop-shadow-[0_4px_14px_rgba(0,0,0,0.45)]`}>
            <img src={team.logo_url || team.image_url || "/assets/brand/lkbb-logo.jpg"} alt={team.name} className="h-full w-full object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]" loading="lazy" />
          </div>
          <div className="relative mt-2.5 xs:mt-3 sm:mt-4 flex items-center justify-center gap-1 sm:gap-1.5">
            <Laurel side="left" color={cfg.laurel} />
            <div className={`relative h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 md:h-10 md:w-10 rounded-full bg-gradient-to-br ${cfg.medalBg} grid place-items-center text-[13px] xs:text-[14px] sm:text-[15px] font-black ${cfg.medalText} shadow-[0_3px_10px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ${cfg.medalRing} border border-white/30`}>
              <span className="relative z-10">{rank}</span>
            </div>
            <Laurel side="right" color={cfg.laurel} />
          </div>
          <div className="mt-2.5 xs:mt-3 sm:mt-4 text-center px-1.5 xs:px-2 sm:px-3 max-w-full flex-1 flex flex-col items-center">
            <div className="text-[10px] xs:text-[11px] sm:text-xs md:text-[13px] lg:text-sm font-black leading-[1.15] tracking-tight text-white line-clamp-2 break-words drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)] min-h-[2.2em] flex items-center">{team.name}</div>
            <div className="mt-1 text-[9px] xs:text-[10px] sm:text-[11px] md:text-xs leading-tight text-white/55 line-clamp-1 max-w-[92%]">{team.school || ""}</div>
            <div className="mt-1.5 xs:mt-2 inline-flex items-center gap-1 xs:gap-1.5 rounded-full bg-black/28 backdrop-blur border border-white/10 px-2 xs:px-2.5 py-1 text-[9px] xs:text-[10px] sm:text-[11px] font-black text-white shadow-[0_1px_6px_rgba(0,0,0,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A86A] shrink-0" />#{team.number}
            </div>
            <div className="mt-1 xs:mt-1.5 text-[9px] xs:text-[10px] sm:text-[11px] font-bold tabular-nums tracking-wide text-[#C9A86A]">{Number(team.online_ballots ?? 0).toLocaleString("id-ID")} online</div>
          </div>
          <div className="absolute bottom-[10px] xs:bottom-3 left-2 right-2 xs:left-3 xs:right-3">
            <div className={`relative h-[26px] xs:h-[28px] sm:h-8 flex items-center justify-center bg-gradient-to-r ${cfg.juaraBar} shadow-[0_2px_8px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.18)] overflow-hidden`} style={{ clipPath: "polygon(9px 0, calc(100% - 9px) 0, 100% 50%, calc(100% - 9px) 100%, 9px 100%, 0 50%)" }}>
              <span className={`relative text-[9px] xs:text-[10px] sm:text-[11px] lg:text-xs font-black tracking-[0.14em] ${cfg.juaraText}`}>JUARA {rank}</span>
            </div>
          </div>
        </div>
      </div>
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
  if (sorted[1]) ordered.push({ team: sorted[1], rank: 2, delay: 100 })
  if (sorted[0]) ordered.push({ team: sorted[0], rank: 1, delay: 200 })
  if (sorted[2]) ordered.push({ team: sorted[2], rank: 3, delay: 300 })

  return (
    <div className="w-full">
      {category && (
        <div className="flex items-center justify-center gap-2 mb-3 xs:mb-4 sm:mb-5">
          <span className="inline-flex rounded-full bg-[#C9A86A] text-[#0B0C0F] px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-black tracking-wide shadow-[0_2px_10px_rgba(201,168,106,0.25)]">{category}</span>
          <span className="text-[10px] sm:text-[11px] text-white/45 tabular-nums">{teams.length} tim</span>
        </div>
      )}
      <div className="grid grid-cols-3 items-end gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 lg:gap-3 xl:gap-4 max-w-[560px] lg:max-w-none mx-auto w-full px-0">
        {ordered.map(({ team, rank, delay }) => (
          <ShieldPodiumCard key={team.id} team={team} rank={rank} delay={delay} />
        ))}
      </div>
    </div>
  )
}

export function PodiumSection({ smp, sma, isPublished, variant = "final" }: { smp: Team[]; sma: Team[]; isPublished: boolean; variant?: "final" | "provisional" }) {
  const [festive, setFestive] = useState(false)
  const isFinal = variant === "final" && isPublished
  const isProvisional = variant === "provisional" && !isPublished && (smp.length>0 || sma.length>0)
  useEffect(() => {
    if (!isFinal) return
    setFestive(true)
    const t = setTimeout(() => setFestive(false), 2800)
    return () => clearTimeout(t)
  }, [isFinal])

  if (!isPublished && !isProvisional) return null
  return (
    <section className="relative overflow-hidden bg-[#09090b] border-y border-white/[0.05] py-10 sm:py-12 md:py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#09090b]" />
        <div className="absolute inset-0 bg-[radial-gradient(860px_380px_at_50%_-20px,rgba(201,168,106,0.06),transparent_68%)]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `linear-gradient(rgba(201,168,106,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,106,0.5) 1px, transparent 1px)`, backgroundSize: "56px 56px" }} />
        <svg className="absolute bottom-0 inset-x-0 h-[70px] sm:h-[80px] w-full opacity-[0.07] sm:opacity-[0.09]" viewBox="0 0 1440 90" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 52 C 220 92 420 18 720 52 C 980 78 1120 28 1440 58" stroke="#C9A86A" strokeWidth="0.7" fill="none" />
          <path d="M0 66 C 240 98 440 32 720 66 C 1040 92 1200 42 1440 72" stroke="#C9A86A" strokeWidth="0.5" opacity="0.5" fill="none" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2.5">
            <span className="hidden sm:block h-px w-8 bg-white/10" />
            <span className={`text-[11px] font-bold tracking-[0.18em] ${isFinal ? "text-[#C9A86A]" : "text-white/60"}`}>{isFinal ? "HASIL FINAL" : "HASIL SEMENTARA"}</span>
            <span className="hidden sm:block h-px w-8 bg-white/10" />
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="hidden sm:block h-px w-8 bg-gradient-to-r from-transparent to-[#C9A86A]/20" />
            <h2 className="text-[20px] xs:text-[22px] sm:text-[26px] md:text-[30px] lg:text-[32px] font-black tracking-[-0.03em] text-white leading-[0.92] font-display">
              PODIUM PELETON <span className={isFinal ? "gold-gradient-text" : "text-white"}>TERFAVORIT</span>
            </h2>
            <span className="hidden sm:block h-px w-8 bg-gradient-to-l from-transparent to-[#C9A86A]/20" />
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-2.5">
            <span className="h-px flex-1 max-w-[140px] bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-[11px] font-bold tracking-[0.18em] text-white/70">LKBB 2025 • JAVASOMA</span>
            <span className="h-px flex-1 max-w-[140px] bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <p className="mt-2 text-[12px] sm:text-[13px] text-white/50 leading-relaxed">Javasoma The Impression – Astra Dharma Hayuning Budaya</p>
          {isProvisional && <p className="mt-1.5 text-[11px] font-bold tracking-wide text-amber-200/80">Peringkat sementara — hanya online</p>}
        </div>

        {festive && (
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A86A] text-[#0B0C0F] px-3 py-1 text-[11px] font-black">🎉 Selamat! 🎉</div>
          </div>
        )}

        <div className={`mt-7 sm:mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 lg:gap-6 xl:gap-8 ${festive ? "animate-[fadeIn_0.5s_ease-out]" : ""}`}>
          {sma.length > 0 && (
            <div className="relative overflow-visible">
              <Podium teams={sma} category="SMA / SEDERAJAT" />
            </div>
          )}
          {smp.length > 0 && (
            <div className="relative overflow-visible">
              <Podium teams={smp} category="SMP / SEDERAJAT" />
            </div>
          )}
        </div>

        <div className="mt-7 sm:mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-[11px] text-white/35 tracking-wide">Peringkat berdasarkan dukungan online</p>
          <div className="h-[0.5px] w-20 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes shieldEnter { 0%{ opacity:0; transform: translateY(16px) scale(0.98) } 100%{ opacity:1; transform: translateY(0) scale(1) } }
        @keyframes fadeIn { from{ opacity:0; transform: translateY(10px)} to{opacity:1; transform: translateY(0)} }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </section>
  )
}
