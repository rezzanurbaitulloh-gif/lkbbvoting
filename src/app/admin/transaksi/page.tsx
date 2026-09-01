"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { createBrowserSupabase } from "@/lib/supabase"
export default function Transaksi(){
  const [txs,setTxs]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("transactions").select("*, peletons(name,number)").order("created_at",{ascending:false}).limit(50).then(({data})=> setTxs(data||[])) },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-[18px] font-black">Transaksi</h1><div className="text-xs text-muted-foreground">{txs.length} transaksi dari DB (RLS: admin lihat semua, user lihat own)</div></div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[140px_160px_180px_120px_100px_90px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div>ID</div><div>TANGGAL</div><div>PELETON</div><div>JUMLAH</div><div>METODE</div><div>STATUS</div>
          </div>
          {txs.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada transaksi (atau RLS membatasi).</div> :
            txs.map((t:any)=> (
            <div key={t.id} className="grid grid-cols-[140px_160px_180px_120px_100px_90px] gap-2 px-4 py-3 items-center border-b border-border/50 text-sm">
              <div className="font-mono font-bold">{t.id.slice(0,8)}</div>
              <div className="text-xs">{new Date(t.created_at).toLocaleString("id-ID")}</div>
              <div className="text-xs truncate">{t.peletons?.name || t.peleton_id.slice(0,8)}</div>
              <div className="font-bold tabular-nums">Rp{t.amount?.toLocaleString("id-ID")} • {t.supports} ballot</div>
              <div className="text-xs">{t.method}</div>
              <div><span className={`rounded-full px-2 py-1 text-xs font-bold ${t.status==="Success"?"bg-emerald-500 text-white":t.status==="Pending"?"bg-amber-500 text-white":"bg-red-500 text-white"}`}>{t.status}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
