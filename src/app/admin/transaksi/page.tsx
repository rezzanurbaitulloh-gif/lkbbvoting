import Link from "next/link"
import { Button } from "@/components/ui/button"

const txs = [
  {id:"TRX-39281", date:"2026-08-30 14:32", user:"Reja Saputra", peleton:"SMKN 1 KERTOSONO", amount:300000, method:"QRIS", status:"Success"},
  {id:"TRX-39280", date:"2026-08-30 13:11", user:"Alya Putri", peleton:"SMPN 1 NGANJUK", amount:150000, method:"QRIS", status:"Success"},
  {id:"TRX-39279", date:"2026-08-30 12:05", user:"Budi S", peleton:"SMAN 1 NGANJUK", amount:30000, method:"VA BCA", status:"Pending"},
  {id:"TRX-39278", date:"2026-08-29 19:45", user:"Siti R", peleton:"SMKN 2 NGANJUK", amount:300000, method:"QRIS", status:"Failed"},
  {id:"TRX-39277", date:"2026-08-29 18:20", user:"Dimas A", peleton:"MTsN 2 NGANJUK", amount:30000, method:"QRIS", status:"Expired"},
]

export default function Transaksi(){
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-black">Transaksi</h1>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full border border-border bg-card px-3 py-1">Semua</span>
          <span className="rounded-full bg-emerald-500 text-white px-3 py-1">Success</span>
          <span className="rounded-full border border-border bg-card px-3 py-1">Pending</span>
        </div>
      </div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[140px_160px_180px_120px_100px_90px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div>ID</div><div>TANGGAL</div><div>PELETON</div><div>JUMLAH</div><div>METODE</div><div>STATUS</div>
          </div>
          {txs.map(t=> (
            <Link key={t.id} href={`/admin/transaksi/${t.id}`} className="grid grid-cols-[140px_160px_180px_120px_100px_90px] gap-2 px-4 py-3 items-center border-b border-border/50 hover:bg-muted/40 text-sm">
              <div className="font-mono font-bold">{t.id}</div>
              <div className="text-xs text-muted-foreground">{t.date}</div>
              <div className="truncate">{t.peleton}</div>
              <div className="font-bold tabular-nums">Rp{t.amount.toLocaleString("id-ID")}</div>
              <div className="text-xs">{t.method}</div>
              <div><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${t.status==="Success"?"bg-emerald-500 text-white":t.status==="Pending"?"bg-amber-500 text-white":t.status==="Failed"?"bg-red-500 text-white":"bg-zinc-500 text-white"}`}>{t.status}</span></div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
