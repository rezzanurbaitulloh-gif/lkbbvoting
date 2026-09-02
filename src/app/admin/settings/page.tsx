"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"

const STATE_OPTIONS = [
  { value:"NOT_STARTED", label:"Belum Dimulai — belum bisa dukung" },
  { value:"ACTIVE", label:"Aktif — masa dukungan dibuka" },
  { value:"VOTING_CLOSED", label:"Voting Ditutup — transaksi dihentikan, tampil peringkat online saja" },
  { value:"RESULT_PUBLISHED", label:"Hasil Dipublikasikan — tampil peringkat akhir + podium juara" },
]

export default function Settings(){
  const { toast } = useToast()
  const [event,setEvent]=useState<any>(null)
  const [saving,setSaving]=useState(false)
  const [stateVal, setStateVal]=useState("")
  const [prov, setProv]=useState(false)
  const [fin, setFin]=useState(false)
  useEffect(()=>{
    const s=createBrowserSupabase()
    s.from("competitions").select("*").order("created_at",{ascending:false}).limit(1).single().then(({data})=> {
      setEvent(data)
      if(data){
        setStateVal(data.state)
        setProv(!!data.show_provisional_result)
        setFin(!!data.show_final_result)
      }
    })
  },[])
  const handleSave = async (field: string, value: any)=>{
    setSaving(true)
    const res = await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, field, value }) })
    if(res.ok) toast({ title:"Disimpan", variant:"success" })
    else toast({ title:"Gagal", variant:"error" })
    setSaving(false)
  }
  if(!event) return <div className="p-8 text-sm">Memuat pengaturan...</div>
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl">
      <h1 className="text-[18px] font-black">Pengaturan Kompetisi</h1>
      <p className="text-xs text-muted-foreground">Semua disimpan ke database — tercatat di audit log.</p>
      <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
        <div><label className="text-xs font-bold">Nama Kompetisi</label><Input defaultValue={event.name} id="name" /></div>
        <div><label className="text-xs font-bold">Sub-judul</label><Input defaultValue={event.subtitle} id="subtitle" /></div>
        <div><label className="text-xs font-bold">Tagline</label><Input defaultValue={event.tagline} id="tagline" /></div>
        <div><label className="text-xs font-bold">Status Event Saat Ini</label><Select value={stateVal} onValueChange={setStateVal} options={STATE_OPTIONS} /></div>
        <div className="text-xs text-muted-foreground">Hanya <b>Aktif</b> yang mengizinkan transaksi. <b>Belum Dimulai</b>: belum bisa dukung. <b>Voting Ditutup</b>: transaksi dihentikan, tampil peringkat <b>online saja</b> (admin bisa rekap offline). <b>Hasil Dipublikasikan</b>: tampil peringkat akhir <b>online+offline</b> + podium juara.</div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={saving} className="rounded-full" onClick={()=>{
            const name=(document.getElementById("name") as HTMLInputElement).value
            const subtitle=(document.getElementById("subtitle") as HTMLInputElement).value
            const tagline=(document.getElementById("tagline") as HTMLInputElement).value
            if(name!==event.name) handleSave("name", name)
            if(subtitle!==event.subtitle) handleSave("subtitle", subtitle)
            if(tagline!==event.tagline) handleSave("tagline", tagline)
            handleSave("state", stateVal)
          }}>Simpan Info & Status</Button>
        </div>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-black">Harga Ballot</h3>
        <div><label className="text-xs font-bold">Harga Online per ballot (Rp)</label><Input defaultValue={event.settings?.online_price} id="online_price" type="number" /></div>
        <div><label className="text-xs font-bold">Harga Offline per ballot (Rp)</label><Input defaultValue={event.settings?.offline_price} id="offline_price" type="number" /></div>
        <Button disabled={saving} className="rounded-full" onClick={async ()=>{
          const online=parseInt((document.getElementById("online_price") as HTMLInputElement).value)
          const offline=parseInt((document.getElementById("offline_price") as HTMLInputElement).value)
          const res=await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, settings: { online_price: online, offline_price: offline } }) })
          if(res.ok) toast({ title:"Harga disimpan", variant:"success" }); else toast({ title:"Gagal", variant:"error" })
        }}>Simpan Harga</Button>
        <p className="text-xs text-muted-foreground">Harga resmi dihitung server dari DB, tidak dari client.</p>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-black">Kontak WhatsApp</h3>
        <div><label className="text-xs font-bold">Nomor WhatsApp</label><Input defaultValue={event.settings?.whatsapp?.number} id="wa" placeholder="628xxx" /></div>
        <Button className="rounded-full" onClick={async ()=>{
          const wa=(document.getElementById("wa") as HTMLInputElement).value
          const res=await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, settings: { whatsapp: { number: wa, enabled: true, message: event.settings?.whatsapp?.message } } }) })
          if(res.ok) toast({ title:"WhatsApp disimpan", variant:"success" })
        }}>Simpan WhatsApp</Button>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-black">Tampilan Hasil</h3>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={prov} onChange={e=> setProv(e.target.checked)} /> Tampilkan <b>HASIL SEMENTARA</b> (badge kuning)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fin} onChange={e=> setFin(e.target.checked)} /> Tampilkan <b>HASIL FINAL</b> (badge emas)</label>
        <p className="text-xs text-muted-foreground">Hanya tampil saat voting tidak aktif (!VOTING_OPEN & !Aktif) — di Beranda + Tim.</p>
        <Button className="rounded-full" onClick={async ()=>{
          let r=await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, field:"show_provisional_result", value: prov }) })
          if(r.ok) r=await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, field:"show_final_result", value: fin }) })
          if(r.ok) toast({ title:"Tampilan hasil disimpan", description:"Badge akan muncul di Beranda & Tim saat nonaktif", variant:"success" })
          else toast({ title:"Gagal", variant:"error" })
        }}>Simpan Tampilan Hasil</Button>
      </div>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">Semua perubahan tercatat di audit_logs. Transaksi nonaktif di-403 server-side.</div>
    </div>
  )
}
