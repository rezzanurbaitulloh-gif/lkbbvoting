"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"
import { MediaPicker } from "@/components/admin/MediaPicker"
import { Settings, Palette, Phone, Share2, Globe, Trophy, Image as ImgIcon } from "lucide-react"

const STATE_OPTIONS = [
  { value:"NOT_STARTED", label:"Belum Dimulai — belum bisa dukung" },
  { value:"ACTIVE", label:"Aktif — masa dukungan dibuka" },
  { value:"VOTING_CLOSED", label:"Voting Ditutup — transaksi dihentikan, tampil peringkat online saja" },
  { value:"RESULT_PUBLISHED", label:"Hasil Dipublikasikan — tampil peringkat akhir + podium juara" },
]

type Tab = "event"|"general"|"branding"|"contact"|"social"|"appearance"|"seo"

export default function SettingsPage(){
  const { toast } = useToast()
  const [tab, setTab]=useState<Tab>("general")
  const [event,setEvent]=useState<any>(null)
  const [stateVal, setStateVal]=useState("")
  const [prov, setProv]=useState(false)
  const [fin, setFin]=useState(false)
  const [saving,setSaving]=useState(false)
  const [settingsMap, setSettingsMap]=useState<Record<string, any>>({})
  const [settingsRows, setSettingsRows]=useState<any[]>([])
  const [pickerFor, setPickerFor]=useState<string | null>(null)

  const loadEvent = async ()=>{
    const s=createBrowserSupabase()
    const { data } = await s.from("competitions").select("*").order("created_at",{ascending:false}).limit(1).single()
    setEvent(data)
    if(data){
      setStateVal(data.state)
      setProv(!!data.show_provisional_result)
      setFin(!!data.show_final_result)
    }
  }
  const loadSettings = async ()=>{
    const res = await fetch("/api/admin/settings")
    const j = await res.json()
    if(res.ok){
      setSettingsMap(j.map||{})
      setSettingsRows(j.settings||[])
    }
  }
  useEffect(()=>{ loadEvent(); loadSettings() },[])

  const handleSaveEventField = async (field: string, value: any)=>{
    setSaving(true)
    const res = await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, field, value }) })
    if(res.ok) toast({ title:"Disimpan", variant:"success" })
    else toast({ title:"Gagal", variant:"error" })
    setSaving(false)
  }
  const handleSaveSettings = async (updates: {key:string, value:any, category?:string}[])=>{
    setSaving(true)
    const res = await fetch("/api/admin/settings",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ updates }) })
    if(res.ok){ toast({ title:"Pengaturan disimpan", variant:"success" }); loadSettings() } else { const j=await res.json(); toast({ title:"Gagal", description:j.error, variant:"error" }) }
    setSaving(false)
  }

  const getVal = (key:string, fallback="")=>{
    const v = settingsMap[key]
    if(v===undefined || v===null) return fallback
    // jsonb may be string already parsed, or object
    if(typeof v==="string") return v
    if(typeof v==="object" && v.value !== undefined) return String(v.value)
    return typeof v==="object" ? JSON.stringify(v) : String(v)
  }

  if(!event) return <div className="p-8 text-sm">Memuat pengaturan...</div>

  const tabs: {id:Tab, label:string, icon:any}[] = [
    {id:"general", label:"Umum", icon: Settings},
    {id:"branding", label:"Branding", icon: Palette},
    {id:"contact", label:"Kontak", icon: Phone},
    {id:"social", label:"Sosial", icon: Share2},
    {id:"appearance", label:"Tampilan", icon: Globe},
    {id:"seo", label:"SEO", icon: Globe},
    {id:"event", label:"Event & Voting", icon: Trophy},
  ]

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 max-w-4xl">
      <div>
        <h1 className="text-[18px] font-black flex items-center gap-2"><Settings className="h-5 w-5"/> Pengaturan Umum Website & Hak Akses</h1>
        <p className="text-xs text-muted-foreground">Semua disimpan di database (site_settings + competitions). Tanpa edit kode manual. Tercatat di audit log. Perubahan langsung tampil.</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map(t=> (
          <button key={t.id} onClick={()=> setTab(t.id)} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border ${tab===t.id ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-muted"}`}>
            <t.icon className="h-3.5 w-3.5"/> {t.label}
          </button>
        ))}
      </div>

      {tab==="general" && (
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-black">Umum — Identitas Website</h3>
          <div><label className="text-xs font-bold">Nama Kompetisi</label><Input id="site_name" defaultValue={getVal("site.name","LKBB JAVASOMA")} /></div>
          <div><label className="text-xs font-bold">Sub-judul</label><Input id="site_subtitle" defaultValue={getVal("site.subtitle","The Impression")} /></div>
          <div><label className="text-xs font-bold">Tagline</label><Input id="site_tagline" defaultValue={getVal("site.tagline","ASTRA DHARMA HAYUNING BUDAYA")} /></div>
          <div><label className="text-xs font-bold">Penyelenggara</label><Input id="site_org" defaultValue={getVal("site.organizer","PASKIBRA SMKN 1 KERTOSONO")} /></div>
          <div><label className="text-xs font-bold">Deskripsi Footer</label><textarea id="site_desc" defaultValue={getVal("site.description","")} className="w-full min-h-[70px] rounded-xl border border-input px-3 py-2 text-sm" /></div>
          <Button disabled={saving} className="rounded-full" onClick={()=>{
            const updates = [
              { key:"site.name", value: (document.getElementById("site_name") as HTMLInputElement).value, category:"general" },
              { key:"site.subtitle", value: (document.getElementById("site_subtitle") as HTMLInputElement).value, category:"general" },
              { key:"site.tagline", value: (document.getElementById("site_tagline") as HTMLInputElement).value, category:"general" },
              { key:"site.organizer", value: (document.getElementById("site_org") as HTMLInputElement).value, category:"general" },
              { key:"site.description", value: (document.getElementById("site_desc") as HTMLTextAreaElement).value, category:"general" },
            ]
            handleSaveSettings(updates)
          }}>Simpan Umum</Button>
          <p className="text-xs text-muted-foreground">Nilai langsung dipakai Navbar & Footer (fetch dari DB).</p>
        </div>
      )}

      {tab==="branding" && (
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-black flex items-center gap-2"><ImgIcon className="h-4 w-4"/> Branding — Logo & Poster</h3>
          {[
            { key:"branding.logo", label:"Logo Utama", id:"logo" },
            { key:"branding.logo_paskibra", label:"Logo Paskibra", id:"logo_paskibra" },
            { key:"branding.logo_school", label:"Logo Sekolah", id:"logo_school" },
            { key:"branding.poster", label:"Poster Resmi", id:"poster" },
          ].map(item=> (
            <div key={item.key} className="space-y-2">
              <label className="text-xs font-bold">{item.label}</label>
              <div className="flex gap-2">
                <Input id={item.id} defaultValue={getVal(item.key, "")} placeholder="/assets/brand/... atau https://..." className="flex-1 font-mono text-sm" />
                <Button type="button" variant="outline" size="sm" className="rounded-full gap-1.5 shrink-0" onClick={()=> setPickerFor(item.id)}><ImgIcon className="h-3.5 w-3.5"/> Pilih Media</Button>
              </div>
              {getVal(item.key) && <img src={getVal(item.key)} alt="" className="h-16 w-16 rounded-xl object-cover border bg-muted" onError={e=> (e.currentTarget.style.display='none')} />}
            </div>
          ))}
          <Button disabled={saving} className="rounded-full" onClick={()=>{
            const updates = ["branding.logo","branding.logo_paskibra","branding.logo_school","branding.poster"].map(k=> {
              const id = k.split(".")[1] === "logo" ? "logo" : k.split(".")[1].includes("paskibra") ? "logo_paskibra" : k.split(".")[1].includes("school") ? "logo_school" : "poster"
              // map correctly
              const elId = k==="branding.logo" ? "logo" : k==="branding.logo_paskibra" ? "logo_paskibra" : k==="branding.logo_school" ? "logo_school" : "poster"
              return { key:k, value: (document.getElementById(elId) as HTMLInputElement).value, category:"branding" }
            })
            handleSaveSettings(updates)
          }}>Simpan Branding</Button>
          {pickerFor && <MediaPicker open={!!pickerFor} onOpenChange={(o)=> !o && setPickerFor(null)} onSelect={(url)=> { const el=document.getElementById(pickerFor) as HTMLInputElement; if(el) el.value=url }} folder="branding" />}
        </div>
      )}

      {tab==="contact" && (
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-black">Kontak</h3>
          <div><label className="text-xs font-bold">Email</label><Input id="c_email" defaultValue={getVal("contact.email")} /></div>
          <div><label className="text-xs font-bold">WhatsApp Umum</label><Input id="c_wa" defaultValue={getVal("contact.whatsapp")} placeholder="628xxx" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold">WA SMP</label><Input id="c_smp" defaultValue={getVal("contact.whatsapp_smp")} /></div>
            <div><label className="text-xs font-bold">WA SMA</label><Input id="c_sma" defaultValue={getVal("contact.whatsapp_sma")} /></div>
          </div>
          <div><label className="text-xs font-bold">Alamat</label><Input id="c_addr" defaultValue={getVal("contact.address")} /></div>
          <Button disabled={saving} className="rounded-full" onClick={()=>{
            const updates = [
              { key:"contact.email", value: (document.getElementById("c_email") as HTMLInputElement).value, category:"contact" },
              { key:"contact.whatsapp", value: (document.getElementById("c_wa") as HTMLInputElement).value, category:"contact" },
              { key:"contact.whatsapp_smp", value: (document.getElementById("c_smp") as HTMLInputElement).value, category:"contact" },
              { key:"contact.whatsapp_sma", value: (document.getElementById("c_sma") as HTMLInputElement).value, category:"contact" },
              { key:"contact.address", value: (document.getElementById("c_addr") as HTMLInputElement).value, category:"contact" },
            ]
            handleSaveSettings(updates)
          }}>Simpan Kontak</Button>
          <p className="text-xs text-muted-foreground">Footer & halaman Kontak akan otomatis pakai nilai ini.</p>
        </div>
      )}

      {tab==="social" && (
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-black">Sosial Media</h3>
          <div><label className="text-xs font-bold">Instagram</label><Input id="s_ig" defaultValue={getVal("social.instagram")} placeholder="https://instagram.com/..." /></div>
          <div><label className="text-xs font-bold">YouTube</label><Input id="s_yt" defaultValue={getVal("social.youtube")} /></div>
          <div><label className="text-xs font-bold">TikTok</label><Input id="s_tt" defaultValue={getVal("social.tiktok")} /></div>
          <Button disabled={saving} className="rounded-full" onClick={()=>{
            const updates = [
              { key:"social.instagram", value: (document.getElementById("s_ig") as HTMLInputElement).value, category:"social" },
              { key:"social.youtube", value: (document.getElementById("s_yt") as HTMLInputElement).value, category:"social" },
              { key:"social.tiktok", value: (document.getElementById("s_tt") as HTMLInputElement).value, category:"social" },
            ]
            handleSaveSettings(updates)
          }}>Simpan Sosial</Button>
        </div>
      )}

      {tab==="appearance" && (
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-black">Tampilan — Warna & Tema</h3>
          <div><label className="text-xs font-bold">Warna Primer (hex)</label><Input id="a_color" defaultValue={getVal("appearance.primary_color","#C9A86A")} placeholder="#C9A86A" /></div>
          <div><label className="text-xs font-bold">Tema Default</label><Select value={getVal("appearance.theme","dark")} onValueChange={(v)=> { (document.getElementById("a_theme") as HTMLInputElement).value=v }} options={[{value:"dark",label:"Dark"},{value:"light",label:"Light"}]} /><Input id="a_theme" type="hidden" defaultValue={getVal("appearance.theme","dark")} /></div>
          <Button disabled={saving} className="rounded-full" onClick={()=>{
            const updates = [
              { key:"appearance.primary_color", value: (document.getElementById("a_color") as HTMLInputElement).value, category:"appearance" },
              { key:"appearance.theme", value: (document.getElementById("a_theme") as HTMLInputElement).value, category:"appearance" },
            ]
            handleSaveSettings(updates)
          }}>Simpan Tampilan</Button>
          <p className="text-xs text-muted-foreground">Warna primer dipakai di tombol & aksen. Perubahan butuh refresh.</p>
        </div>
      )}

      {tab==="seo" && (
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-black">SEO</h3>
          <div><label className="text-xs font-bold">SEO Title Default</label><Input id="seo_title" defaultValue={getVal("seo.title")} /></div>
          <div><label className="text-xs font-bold">SEO Description Default</label><textarea id="seo_desc" defaultValue={getVal("seo.description")} className="w-full min-h-[70px] rounded-xl border border-input px-3 py-2 text-sm" /></div>
          <Button disabled={saving} className="rounded-full" onClick={()=>{
            const updates = [
              { key:"seo.title", value: (document.getElementById("seo_title") as HTMLInputElement).value, category:"seo" },
              { key:"seo.description", value: (document.getElementById("seo_desc") as HTMLTextAreaElement).value, category:"seo" },
            ]
            handleSaveSettings(updates)
          }}>Simpan SEO</Button>
          <div className="rounded-xl border border-border bg-muted/20 p-3 text-xs">Pengaturan SEO per-halaman ada di “Konten Dinamis → Kelola Konten → SEO fields”.</div>
        </div>
      )}

      {tab==="event" && (
        <div className="space-y-4">
          <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-black">Event & Voting</h3>
            <div><label className="text-xs font-bold">Nama Kompetisi (competitions.name)</label><Input defaultValue={event.name} id="name" /></div>
            <div><label className="text-xs font-bold">Sub-judul</label><Input defaultValue={event.subtitle} id="subtitle" /></div>
            <div><label className="text-xs font-bold">Tagline</label><Input defaultValue={event.tagline} id="tagline" /></div>
            <div><label className="text-xs font-bold">Status Event Saat Ini</label><Select value={stateVal} onValueChange={setStateVal} options={STATE_OPTIONS} /></div>
            <div className="text-xs text-muted-foreground">Hanya <b>Aktif</b> yang mengizinkan transaksi. <b>Belum Dimulai</b>: belum bisa dukung. <b>Voting Ditutup</b>: transaksi dihentikan, tampil peringkat <b>online saja</b>. <b>Hasil Dipublikasikan</b>: peringkat akhir + podium.</div>
            <Button disabled={saving} className="rounded-full" onClick={()=>{
              const name=(document.getElementById("name") as HTMLInputElement).value
              const subtitle=(document.getElementById("subtitle") as HTMLInputElement).value
              const tagline=(document.getElementById("tagline") as HTMLInputElement).value
              if(name!==event.name) handleSaveEventField("name", name)
              if(subtitle!==event.subtitle) handleSaveEventField("subtitle", subtitle)
              if(tagline!==event.tagline) handleSaveEventField("tagline", tagline)
              handleSaveEventField("state", stateVal)
            }}>Simpan Info & Status</Button>
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
            <h3 className="text-sm font-black">Tampilan Hasil</h3>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={prov} onChange={e=> setProv(e.target.checked)} /> Tampilkan <b>HASIL SEMENTARA</b> (badge kuning)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fin} onChange={e=> setFin(e.target.checked)} /> Tampilkan <b>HASIL FINAL</b> (badge emas)</label>
            <Button className="rounded-full" onClick={async ()=>{
              let r=await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, field:"show_provisional_result", value: prov }) })
              if(r.ok) r=await fetch("/api/admin/competitions",{ method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: event.id, field:"show_final_result", value: fin }) })
              if(r.ok) toast({ title:"Tampilan hasil disimpan", variant:"success" })
              else toast({ title:"Gagal", variant:"error" })
            }}>Simpan Tampilan Hasil</Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs">Semua perubahan tercatat di audit_logs & cms_revisions. Frontend (Navbar, Footer, Hero) otomatis membaca dari site_settings / cms_sections.</div>

      {/* List raw settings for debug / advanced */}
      <details className="rounded-[12px] border border-border bg-card">
        <summary className="p-3 text-xs font-bold cursor-pointer">Lihat semua site_settings (advanced) — {settingsRows.length} keys</summary>
        <div className="p-3 border-t border-border max-h-[320px] overflow-y-auto space-y-1">
          {settingsRows.map((r:any)=> (
            <div key={r.key} className="flex justify-between gap-2 text-xs font-mono border-b border-border/50 py-1">
              <span className="font-bold">{r.key}</span>
              <span className="truncate max-w-[50%] text-muted-foreground">{JSON.stringify(r.value).slice(0,80)}</span>
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{r.category}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
