"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
export default function Transaksi(){
  const { toast } = useToast()
  const [txs,setTxs]=useState<any[]>([])
  const [selected,setSelected]=useState<Set<string>>(new Set())
  const load = ()=>{ fetch("/api/transactions").then(r=> r.json()).then(data=> setTxs(Array.isArray(data)? data : [])).catch(()=>{}) }
  useEffect(()=>{ load() },[])
  const toggleSelect = (id:string)=>{ const n=new Set(selected); if(n.has(id)) n.delete(id); else n.add(id); setSelected(n) }
  const toggleAll = ()=>{ if(selected.size===txs.length) setSelected(new Set()); else setSelected(new Set(txs.map((t:any)=>t.id))) }
  const handleBulkDelete = async ()=>{ if(selected.size===0) return; for(const id of selected){ await fetch(`/api/admin/crud?table=transactions&id=${id}`, { method:"DELETE" }) } toast({ title:`${selected.size} transaksi dihapus`, variant:"success"}); setSelected(new Set()); load() }
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h1 className="text-[18px] font-black">Riwayat Transaksi</h1><p className="text-xs text-muted-foreground">{txs.length} transaksi — tercatat otomatis setelah pembayaran</p></div>{selected.size>0 && <Button variant="outline" size="sm" className="rounded-full text-red-600" onClick={handleBulkDelete}>Hapus {selected.size} dipilih</Button>}</div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden overflow-x-auto">
        <div className="min-w-[820px]">
          <div className="grid grid-cols-[40px_120px_140px_160px_100px_90px_80px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div><input type="checkbox" checked={selected.size===txs.length && txs.length>0} onChange={toggleAll} /></div><div>KODE</div><div>TANGGAL</div><div>NAMA TIM</div><div>JUMLAH BAYAR</div><div>CARA BAYAR</div><div>KEADAAN</div>
          </div>
          {txs.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada transaksi.</div> :
            txs.map((t:any)=> (
            <div key={t.id} className="grid grid-cols-[40px_120px_140px_160px_100px_90px_80px] gap-2 px-4 py-3 items-center border-b border-border/50 text-sm">
              <div><input type="checkbox" checked={selected.has(t.id)} onChange={()=> toggleSelect(t.id)} /></div>
              <div className="font-mono font-bold text-xs">{t.id.slice(0,8)}</div>
              <div className="text-xs">{new Date(t.created_at).toLocaleString("id-ID")}</div>
              <div className="text-xs truncate">{t.peletons?.name || t.peleton_id.slice(0,8)}</div>
              <div className="font-bold tabular-nums text-xs">Rp{t.amount?.toLocaleString("id-ID")} • {t.supports} dukungan</div>
              <div className="text-xs">{t.method || "QRIS"}</div>
              <div><span className={`rounded-full px-2 py-1 text-xs font-bold ${t.status==="Success"?"bg-emerald-500 text-white":t.status==="Pending"?"bg-amber-500 text-white":"bg-red-500 text-white"}`}>{t.status==="Success" ? "Berhasil" : t.status==="Pending" ? "Menunggu" : "Gagal"}</span></div>
            </div>
          ))}
        </div>
        {txs.length>0 && (
          <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selected.size===txs.length && txs.length>0} onChange={toggleAll} /> Pilih semua ({txs.length})</label>
            {selected.size>0 && <span className="text-xs font-bold">{selected.size} dipilih</span>}
          </div>
        )}
      </div>
    </div>
  )
}
