import { peletons, announcements } from "@/lib/data"
import { Users, Clock, CreditCard, Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AdminOverview(){
  const pending = peletons.filter(p=>p.status==="Pending").length
  const totalSupport = peletons.reduce((a,b)=>a+b.support,0)
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-black tracking-tight">Dashboard</h1>
        <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">VOTING AKTIF</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {label:"Total Peleton", value: peletons.length, sub:"11 terverifikasi", icon: Users},
          {label:"Pending Verifikasi", value: pending, sub:"Menunggu review", icon: Clock},
          {label:"Total Transaksi", value:"2.853", sub:"+18% minggu ini", icon: CreditCard},
          {label:"Pemimpin Saat Ini", value:"SMKN 1 KERTOSONO", sub:"#01 • Leading", icon: Trophy},
        ].map(card=> (
          <div key={card.label} className="rounded-[16px] border border-border bg-card p-4">
            <div className="text-xs font-bold tracking-widest text-muted-foreground">{card.label.toUpperCase()}</div>
            <div className="mt-1 text-[18px] font-black leading-tight truncate">{card.value}</div>
            <div className="text-xs text-muted-foreground">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_0.9fr] gap-4">
        <div className="rounded-[16px] border border-border bg-card p-4">
          <h3 className="text-sm font-black">Ranking SMP / Sederajat (Demo)</h3>
          <div className="mt-3">
            <div className="grid grid-cols-[32px_1fr_90px_90px] gap-2 px-2 py-2 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border">
              <div>#</div><div>Tim</div><div className="text-right">Online</div><div className="text-right">Total</div>
            </div>
            {[
              ["SMKN 1 KERTOSONO", 85300, 106300],
              ["SMPN 1 NGANJUK", 52100, 64600],
              ["SMPN 2 NGANJUK", 35800, 44500],
            ].map(([name,online,total],i)=> (
              <div key={name as string} className="grid grid-cols-[32px_1fr_90px_90px] gap-2 px-2 py-2.5 text-sm border-b border-border/50 last:border-0">
                <div className="font-black">{i+1}</div>
                <div className="font-bold truncate">{name as string}</div>
                <div className="text-right tabular-nums">{(online as number).toLocaleString("id-ID")}</div>
                <div className="text-right font-black tabular-nums">{(total as number).toLocaleString("id-ID")}</div>
              </div>
            ))}
          </div>
          <Link href="/admin/klasemen" className="mt-3 inline-flex text-xs font-bold text-gold hover:underline">Lihat klasemen lengkap →</Link>
        </div>

        <div className="space-y-4">
          <div className="rounded-[16px] border border-border bg-card p-4">
            <h3 className="text-sm font-black">Grafik Dukungan (Demo)</h3>
            <div className="mt-3 h-32 rounded-xl border border-dashed border-border bg-muted/30 grid place-items-center text-xs text-muted-foreground">
              Chart: Online vs Offline trend
            </div>
            <div className="mt-2 flex gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C9A86A]"/> Online</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#A51D2D]"/> Offline</span>
            </div>
          </div>
          <div className="rounded-[16px] border border-border bg-card p-4">
            <h3 className="text-sm font-black">Transaksi Terbaru</h3>
            <div className="mt-2 space-y-2">
              {[
                ["TRX-39281","SMKN 1 KERTOSONO","Rp300.000","Success"],
                ["TRX-39280","SMPN 1 NGANJUK","Rp150.000","Success"],
                ["TRX-39279","SMAN 1 NGANJUK","Rp30.000","Pending"],
              ].map(([id,team,amt,status])=> (
                <div key={id as string} className="flex justify-between rounded-xl border border-border p-2.5 text-xs">
                  <div><div className="font-mono font-bold">{id as string}</div><div className="text-muted-foreground">{team as string}</div></div>
                  <div className="text-right"><div className="font-bold">{amt as string}</div><div className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${status==="Success" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>{status as string}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-border bg-card p-4">
        <h3 className="text-sm font-black">Pengumuman Terbaru</h3>
        <div className="mt-2 grid md:grid-cols-3 gap-3">
          {announcements.slice(0,3).map(a=> (
            <div key={a.id} className="rounded-xl border border-border p-3">
              <div className="text-xs font-bold">{a.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{a.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
