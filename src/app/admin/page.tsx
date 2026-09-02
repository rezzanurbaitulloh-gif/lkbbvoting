"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function AdminOverview(){
  const [stats, setStats] = useState<any>({})
  const [ranking, setRanking] = useState<any[]>([])
  const [recentTx, setRecentTx] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  useEffect(()=>{
    fetch("/api/admin/stats").then(r=> r.json()).then(data=>{
      if(data.error) return
      setStats({
        totalTeams: data.totalTeams,
        smp: data.smp,
        sma: data.sma,
        totalUsers: data.totalUsers,
        transactions: data.totalTransactions,
        total: data.totalBallots,
        online: data.onlineBallots,
        offline: data.offlineBallots,
        state: data.event?.state,
        event: data.event,
        chartData: data.chartData || [],
        chartMax: data.chartMax || 1,
      })
      setRanking(data.ranking || [])
      setRecentTx(data.recentTransactions || [])
      setAuditLogs(data.auditLogs || [])
    }).catch(()=>{})
  },[])
  return (
    <div className="min-h-screen bg-[#0B0C0F] text-white p-4 md:p-6 space-y-4">
      {/* Header like reference */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-black tracking-tight">DASHBOARD</h1>
          <p className="text-xs text-white/50">Kontrol penuh LKBB JAVASOMA THE IMPRESSION</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#C9A86A] px-3 py-1 text-xs font-black text-[#0B0C0F]">{stats.state || "ACTIVE"}</span>
          <span className="hidden md:inline-flex text-xs text-white/50">20 Okt - 24 Okt 2026</span>
        </div>
      </div>
      {/* Row 1: peserta */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {label:"TOTAL PESERTA", value: stats.totalTeams ?? "-", sub:"Tim", dark:true},
          {label:"SMP / SEDERAJAT", value: stats.smp ?? "-", sub:"Tim"},
          {label:"SMA / SEDERAJAT", value: stats.sma ?? "-", sub:"Tim"},
          {label:"TOTAL USER", value: stats.totalUsers ?? "-", sub:"User"},
        ].map(card=> (
          <div key={card.label} className="rounded-[12px] border border-white/10 bg-[#17191F] p-4">
            <div className="text-[10px] font-bold tracking-widest text-white/40">{card.label}</div>
            <div className="mt-1 text-[22px] font-black leading-none text-white">{card.value}</div>
            <div className="text-[11px] text-white/40">{card.sub}</div>
          </div>
        ))}
      </div>
      {/* Row 2: transaksi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {label:"TOTAL TRANSAKSI", value: stats.transactions ?? "-", sub:"Transaksi"},
          {label:"ONLINE BALLOT", value: (stats.online ?? 0).toLocaleString("id-ID"), sub:"Ballot"},
          {label:"OFFLINE BALLOT", value: (stats.offline ?? 0).toLocaleString("id-ID"), sub:"Ballot"},
          {label:"TOTAL BALLOT", value: (stats.total ?? 0).toLocaleString("id-ID"), sub:"Ballot", gold:true},
        ].map(card=> (
          <div key={card.label} className={`rounded-[12px] border p-4 ${card.gold ? "bg-[#C9A86A] border-[#C9A86A] text-[#0B0C0F]" : "bg-[#17191F] border-white/10 text-white"}`}>
            <div className={`text-[10px] font-bold tracking-widest ${card.gold ? "text-[#0B0C0F]/70" : "text-white/40"}`}>{card.label}</div>
            <div className="mt-1 text-[20px] font-black leading-none">{card.value}</div>
            <div className={`text-[11px] ${card.gold ? "text-[#0B0C0F]/60" : "text-white/40"}`}>{card.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1.4fr_1fr_0.9fr] gap-4">
        <div className="rounded-[12px] border border-white/10 bg-[#17191F] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-wide">RANKING TERATAS (SMA / SEDERAJAT)</h3>
            <Link href="/admin/klasemen" className="text-[11px] font-bold text-[#C9A86A]">Lihat Selengkapnya →</Link>
          </div>
          <div className="mt-3 space-y-1">
            {ranking.map((r:any,i:number)=> (
              <div key={r.id} className="flex items-center gap-2 rounded-lg bg-[#0B0C0F] border border-white/5 px-3 py-2 text-xs">
                <span className={`h-6 w-6 rounded-full grid place-items-center font-black text-[11px] ${i===0 ? "bg-[#C9A86A] text-[#0B0C0F]" : "bg-white/10 text-white"}`}>{i+1}</span>
                <span className="font-bold truncate flex-1">#{r.number} {r.name}</span>
                <span className="tabular-nums font-bold text-[#C9A86A]">{(r.total_ballots ?? 0).toLocaleString("id-ID")}</span>
              </div>
            ))}
            {ranking.length===0 && <div className="text-xs text-white/40">Belum ada ranking.</div>}
          </div>
        </div>
        <div className="rounded-[12px] border border-white/10 bg-[#17191F] p-4">
          <h3 className="text-xs font-black tracking-wide">GRAFIK DUKUNGAN</h3>
          <div className="mt-3 h-[120px] flex items-end gap-1">
            {(stats.chartData || []).map((c:any)=> {
              const max = stats.chartMax || 1
              const total = c.online + c.offline
              const hasData = total > 0
              const totalH = max ? (total / max) * 100 : 0
              return (
                <div key={c.date} className="flex-1 flex flex-col gap-1">
                  <div className="flex-1 flex flex-col justify-end">
                    {/* Single bar showing total, with online portion gold, offline portion subtle on top if any */}
                    <div className="rounded-t overflow-hidden flex flex-col justify-end" style={{height: hasData ? `${Math.max(6, totalH)}%` : "0%"}} title={`Total: ${total} (Online:${c.online} Offline:${c.offline})`}>
                      {c.offline > 0 && <div className="bg-white/25 w-full" style={{height: `${(c.offline/total)*100}%`}} />}
                      <div className="bg-[#C9A86A] w-full flex-1 min-h-[4px]" />
                    </div>
                    {hasData && <div className="text-[9px] font-bold text-center text-white/60 tabular-nums">{total}</div>}
                  </div>
                  <div className="text-[9px] text-center text-white/40 truncate">{c.label}</div>
                </div>
              )
            })}
            {(!stats.chartData || stats.chartData.length===0) && <div className="flex-1 grid place-items-center text-[11px] text-white/30">Memuat grafik...</div>}
            {(stats.chartData || []).length>0 && (stats.chartData || []).every((c:any)=> c.online===0 && c.offline===0) && <div className="absolute inset-0 grid place-items-center text-[11px] text-white/30">Belum ada transaksi 5 hari terakhir</div>}
          </div>
          <div className="mt-2 flex gap-3 text-[10px] text-white/40">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#C9A86A]"/> Online</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-white/20"/> Offline</span>
          </div>
          <div className="mt-1 text-[10px] text-white/30">* 5 hari terakhir — data real dari supports ledger</div>
        </div>
        <div className="rounded-[12px] border border-white/10 bg-[#17191F] p-4">
          <h3 className="text-xs font-black tracking-wide">STATUS EVENT</h3>
          <div className="mt-3">
            <div className="text-[11px] text-white/40">STATUS SAAT INI</div>
            <div className="mt-1 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">{stats.state || "ACTIVE"}</div>
            <div className="mt-2 text-xs text-white/60">Dukungan sedang berlangsung</div>
            <div className="mt-3 grid gap-1 text-[11px]">
              <div className="flex justify-between"><span className="text-white/40">EVENT DIMULAI</span><span className="font-bold">24 Oktober 2026 08:00</span></div>
              <div className="flex justify-between"><span className="text-white/40">VOTING BERAKHIR</span><span className="font-bold">24 Oktober 2026 23:59</span></div>
            </div>
            <Link href="/admin/settings"><button className="mt-3 w-full rounded-full bg-[#C9A86A] text-[#0B0C0F] py-2 text-xs font-black">KELOLA EVENT</button></Link>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-4">
        <div className="rounded-[12px] border border-white/10 bg-[#17191F] p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-wide">TRANSAKSI TERBARU</h3>
            <Link href="/admin/transaksi" className="text-[11px] text-[#C9A86A]">Lihat Semua →</Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <div className="min-w-[520px] grid grid-cols-[110px_1fr_60px_90px_70px] gap-2 px-2 py-1 text-[10px] font-bold tracking-widest text-white/30 border-b border-white/5">
              <div>ID</div><div>USER</div><div>JUMLAH</div><div>NOMINAL</div><div>STATUS</div>
            </div>
            {recentTx.map((t:any)=> (
              <div key={t.id} className="min-w-[520px] grid grid-cols-[110px_1fr_60px_90px_70px] gap-2 px-2 py-2 text-xs border-b border-white/5">
                <div className="font-mono text-white/70">{t.id.slice(0,12)}</div>
                <div className="truncate">{t.peletons?.name || t.peleton_id.slice(0,8)}</div>
                <div className="tabular-nums">{t.supports}</div>
                <div className="tabular-nums">Rp{t.amount?.toLocaleString("id-ID")}</div>
                <div><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${t.status==="Success" ? "bg-emerald-500 text-white" : t.status==="Failed" ? "bg-red-500 text-white" : "bg-amber-500 text-white"}`}>{t.status}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[12px] border border-white/10 bg-[#17191F] p-4">
            <h3 className="text-xs font-black tracking-wide">KONTROL CEPAT</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/admin/peleton" className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 p-3 text-center text-xs font-bold">Tambah Tim</Link>
              <Link href="/admin/offline-recap" className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 p-3 text-center text-xs font-bold">Tambah Offline Ballot</Link>
              <Link href="/admin/settings" className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 p-3 text-center text-xs font-bold">Kelola Event</Link>
              <Link href="/admin/klasemen" className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 p-3 text-center text-xs font-bold">Lihat Ranking</Link>
            </div>
          </div>
          <div className="rounded-[12px] border border-white/10 bg-[#17191F] p-4">
            <h3 className="text-xs font-black tracking-wide">AKTIVITAS TERBARU</h3>
            <div className="mt-3 space-y-2 text-xs max-h-[120px] overflow-y-auto">
              {auditLogs.length===0 ? <div className="text-white/40">Belum ada aktivitas.</div> : auditLogs.slice(0,5).map((log:any)=> (
                <div key={log.id} className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#C9A86A] mt-1 shrink-0"/> 
                  <span className="text-white/70 truncate">{log.action} — {log.target?.slice(0,8) || "-"} <span className="text-white/40">{new Date(log.created_at).toLocaleDateString("id-ID")}</span></span>
                </div>
              ))}
            </div>
            <a href="/admin/audit-log" className="mt-2 inline-flex text-[11px] font-bold text-[#C9A86A]">Lihat Audit Log →</a>
          </div>
        </div>
      </div>
    </div>
  )
}
