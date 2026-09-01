"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createBrowserSupabase } from "@/lib/supabase"

export default function OfflineRecap(){
  const [teams, setTeams] = useState<any[]>([])
  const [selected, setSelected] = useState("")
  const [qty, setQty] = useState(100)
  const [note, setNote] = useState("")
  const [recent, setRecent] = useState<any[]>([])
  const supabase = createBrowserSupabase()

  useEffect(()=>{
    supabase.from("peletons").select("id, number, name, category").eq("active", true).order("display_order").then(({data})=> setTeams(data||[]))
    supabase.from("supports").select("*, peletons(number, name)").eq("source", "offline").order("created_at", {ascending:false}).limit(10).then(({data})=> setRecent(data||[]))
  },[])

  const handleAdd = async ()=>{
    if(!selected || !qty) return
    const { error } = await supabase.from("supports").insert({
      peleton_id: selected,
      transaction_id: crypto.randomUUID(),
      amount: qty * 5000,
      supports: qty,
      source: "offline",
      note
    })
    if(error) alert(error.message)
    else {
      await supabase.from("audit_logs").insert({ action: "offline_recap_add", target: selected, details: { qty, note } })
      alert(`+${qty} offline ballots ditambahkan (auditable)`)
      setNote("")
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-[18px] font-black">Offline Recap — Auditable</h1>
      <p className="text-xs text-muted-foreground">Tambah ballot offline per tim. Setiap penyesuaian tercatat di supports (source=offline) + audit_logs, tidak overwrite history.</p>
      <div className="rounded-[16px] border border-border bg-card p-4 grid gap-3 max-w-xl">
        <div><label className="text-xs font-bold">Pilih Tim</label>
          <select value={selected} onChange={e=> setSelected(e.target.value)} className="w-full h-10 rounded-xl border border-input bg-transparent px-3 text-sm">
            <option value="">-- pilih --</option>
            {teams.map((t:any)=> <option key={t.id} value={t.id}>#{t.number} {t.name} ({t.category})</option>)}
          </select>
        </div>
        <div><label className="text-xs font-bold">Jumlah Ballot Offline</label><Input type="number" value={qty} onChange={e=> setQty(parseInt(e.target.value)||0)} /></div>
        <div><label className="text-xs font-bold">Alasan / Catatan</label><Input value={note} onChange={e=> setNote(e.target.value)} placeholder="Rekap panitia hari H" /></div>
        <Button onClick={handleAdd} className="rounded-full">Tambah Offline Ballots</Button>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <h3 className="text-sm font-black">Riwayat Offline Terbaru (ledger)</h3>
        <div className="mt-3 space-y-2">
          {recent.map((r:any)=> (
            <div key={r.id} className="flex justify-between rounded-xl border border-border p-3 text-xs">
              <div>#{r.peletons?.number} {r.peletons?.name} • +{r.supports} offline</div>
              <div className="text-muted-foreground">{new Date(r.created_at).toLocaleString("id-ID")}</div>
            </div>
          ))}
          {recent.length===0 && <div className="text-xs text-muted-foreground">Belum ada rekap offline.</div>}
        </div>
      </div>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">Koreksi: jangan hapus, tambah entri baru dengan qty negatif (mis. -100) + alasan, tetap auditable.</div>
    </div>
  )
}
