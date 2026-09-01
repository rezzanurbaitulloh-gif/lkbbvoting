"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createBrowserSupabase } from "@/lib/supabase"

export default function Settings(){
  const [event,setEvent]=useState<any>(null)
  const [saving,setSaving]=useState(false)
  useEffect(()=>{
    const s=createBrowserSupabase()
    s.from("competitions").select("*").order("created_at",{ascending:false}).limit(1).single().then(({data})=> setEvent(data))
  },[])
  const handleSave = async (field: string, value: any)=>{
    setSaving(true)
    const res = await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, field, value }) })
    if(res.ok) alert("Disimpan")
    else alert("Gagal")
    setSaving(false)
  }
  if(!event) return <div className="p-8 text-sm">Memuat pengaturan...</div>
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl">
      <h1 className="text-[18px] font-black">Pengaturan Kompetisi (DB)</h1>
      <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
        <div><label className="text-xs font-bold">Nama Kompetisi</label><Input defaultValue={event.name} id="name" /></div>
        <div><label className="text-xs font-bold">Subtitle</label><Input defaultValue={event.subtitle} id="subtitle" /></div>
        <div><label className="text-xs font-bold">Tagline</label><Input defaultValue={event.tagline} id="tagline" /></div>
        <div><label className="text-xs font-bold">State</label><select defaultValue={event.state} id="state" className="w-full h-10 rounded-xl border border-input px-3 text-sm bg-transparent">
          {["NOT_STARTED","REGISTRATION","VERIFICATION","VOTING_OPEN","VOTING_CLOSED","RESULT_VERIFICATION","RESULT_PUBLISHED","COMPLETED"].map(s=> <option key={s} value={s}>{s}</option>)}
        </select></div>
        <Button disabled={saving} className="rounded-full" onClick={()=>{
          const name=(document.getElementById("name") as HTMLInputElement).value
          const subtitle=(document.getElementById("subtitle") as HTMLInputElement).value
          const state=(document.getElementById("state") as HTMLSelectElement).value
          handleSave("name", name)
        }}>Simpan Kompetisi</Button>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-black">Voting & Harga (dari settings JSONB)</h3>
        <div><label className="text-xs font-bold">Harga Online per ballot</label><Input defaultValue={event.settings?.online_price} id="online_price" type="number" /></div>
        <div><label className="text-xs font-bold">Harga Offline per ballot</label><Input defaultValue={event.settings?.offline_price} id="offline_price" type="number" /></div>
        <Button disabled={saving} className="rounded-full" onClick={async ()=>{
          const online=parseInt((document.getElementById("online_price") as HTMLInputElement).value)
          const offline=parseInt((document.getElementById("offline_price") as HTMLInputElement).value)
          const res=await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, settings: { online_price: online, offline_price: offline } }) })
          if(res.ok) alert("Harga disimpan"); else alert("Gagal")
        }}>Simpan Harga</Button>
        <p className="text-xs text-muted-foreground">Harga resmi dihitung server dari DB, tidak dari client.</p>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-black">WhatsApp & Kontak (settings)</h3>
        <div><label className="text-xs font-bold">WhatsApp Number</label><Input defaultValue={event.settings?.whatsapp?.number} id="wa" /></div>
        <Button className="rounded-full" onClick={async ()=>{
          const wa=(document.getElementById("wa") as HTMLInputElement).value
          const res=await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, settings: { whatsapp: { number: wa, enabled: true, message: event.settings?.whatsapp?.message } } }) })
          if(res.ok) alert("Disimpan")
        }}>Simpan WhatsApp</Button>
      </div>
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">Semua perubahan tercatat di audit_logs via server API. Tidak ada hardcode pricing.</div>
    </div>
  )
}
