"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"

export default function ResultsControl(){
  const { toast } = useToast()
  const [event, setEvent] = useState<any>(null)
  const [provisional, setProvisional] = useState<any[]>([])
  const [final, setFinal] = useState<any[]>([])

  const load = ()=>{
    const supabase = createBrowserSupabase()
    supabase.from("competitions").select("*").order("created_at", {ascending:false}).limit(1).single().then(({data})=> setEvent(data))
    supabase.from("team_ranking").select("*").order("total_ballots", {ascending:false}).then(({data})=>{
      // provisional = online only, final = online+offline (view already does)
      // For demo, provisional is same as final but filtered
      setProvisional((data||[]).slice(0,3))
      setFinal((data||[]).slice(0,3))
    })
  }
  useEffect(()=>{ load() },[])

  const [toggling,setToggling]=useState<string|null>(null)
  const toggle = async (field: "show_provisional_result" | "show_final_result")=>{
    if(toggling) return
    setToggling(field)
    const res = await fetch("/api/admin/competitions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id, field, value: !event[field] })
    })
    if(!res.ok) {
      const d = await res.json()
      toast({ title: "Gagal", description: d.error || "Gagal mengubah", variant: "error" })
      setToggling(null)
      return
    }
    toast({ title: "Berhasil diperbarui", variant: "success" })
    load()
    setToggling(null)
  }

  if(!event) return <div className="p-8">Memuat...</div>
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4">
      <h1 className="text-[18px] font-black">Kontrol Publikasi Hasil</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-[16px] border border-border bg-card p-4">
          <h3 className="text-sm font-black">Hasil Sementara</h3>
          <p className="text-xs text-muted-foreground">Hasil sementara — belum termasuk rekap offline. Berdasarkan data online.</p>
          <div className="mt-3 space-y-1">
            {provisional.map((p:any,i:number)=> <div key={p.id} className="flex justify-between rounded-xl border border-border p-2 text-xs"><span>{i+1}st #{p.number} {p.name}</span><span>{p.online_ballots} online</span></div>)}
          </div>
          <Button disabled={!!toggling} onClick={()=>toggle("show_provisional_result")} className={`mt-3 w-full rounded-full ${event.show_provisional_result ? "bg-emerald-600" : ""}`}>{toggling==="show_provisional_result" ? "Memproses..." : event.show_provisional_result ? "✓ Ditampilkan" : "Tampilkan Sementara"}</Button>
        </div>
        <div className="rounded-[16px] border border-[#C9A86A30] bg-[#C9A86A0A] p-4">
          <h3 className="text-sm font-black">Hasil Akhir</h3>
          <p className="text-xs text-muted-foreground">ONLINE + OFFLINE = FINAL. Dari view team_ranking.</p>
          <div className="mt-3 space-y-1">
            {final.map((p:any,i:number)=> <div key={p.id} className="flex justify-between rounded-xl border border-border bg-white p-2 text-xs"><span>{i+1}st #{p.number} {p.name}</span><span className="font-black">{p.total_ballots} total</span></div>)}
          </div>
          <Button disabled={!!toggling} onClick={()=>toggle("show_final_result")} className="mt-3 w-full rounded-full">{toggling==="show_final_result" ? "Memproses..." : event.show_final_result ? "✓ Ditampilkan" : "Tampilkan Final"}</Button>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-black">Podium Preview (SMA)</h3>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          {final.filter((p:any)=> p.category==="SMA").slice(0,3).map((p:any,i:number)=> (
            <div key={p.id} className="rounded-xl border-2 border-gold bg-gold/5 p-3 text-center">
              <div className="text-xs font-black">{i===0?"1st":i===1?"2nd":"3rd"}</div>
              <div className="text-sm font-black">#{p.number} {p.name}</div>
              <div className="text-xs text-muted-foreground">{p.total_ballots} ballot</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">1st = ranking, #03 = nomor peserta — tidak boleh tertukar.</p>
      </div>
    </div>
  )
}
