"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"
import { MediaPicker } from "@/components/admin/MediaPicker"
import { Settings, Palette, Phone, Share2, Trophy, Image as ImgIcon, Eye, Sparkles } from "lucide-react"

const STATE_OPTIONS = [
  { value:"NOT_STARTED", label:"Belum Dimulai — belum bisa dukung" },
  { value:"ACTIVE", label:"Aktif — masa dukungan dibuka" },
  { value:"VOTING_CLOSED", label:"Voting Ditutup — transaksi dihentikan, tampil peringkat online saja" },
  { value:"RESULT_PUBLISHED", label:"Hasil Dipublikasikan — tampil peringkat akhir + podium juara" },
]

type Tab = "general"|"branding"|"contact"|"social"|"appearance"|"event"

export default function SettingsPage(){
  const { toast } = useToast()
  const [tab, setTab]=useState<Tab>("appearance")
  const [event,setEvent]=useState<any>(null)
  const [stateVal, setStateVal]=useState("")
  const [prov, setProv]=useState(false)
  const [fin, setFin]=useState(false)
  const [saving,setSaving]=useState(false)
  const [settingsMap, setSettingsMap]=useState<Record<string, any>>({})
  const [settingsRows, setSettingsRows]=useState<any[]>([])
  const [pickerFor, setPickerFor]=useState<string | null>(null)
  // appearance local state for live preview
  const [primaryColor, setPrimaryColor]=useState("#C9A86A")
  const [themeVal, setThemeVal]=useState("dark")
  const [heroBg, setHeroBg]=useState("")
  const [heroOverlay, setHeroOverlay]=useState(32)
  const [heroLogo, setHeroLogo]=useState("")
  const [sponsorEnabled, setSponsorEnabled]=useState(true)

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
      const map=j.map||{}
      const get = (k:string, fallback:string)=>{
        const v=map[k]; if(v===undefined||v===null) return fallback
        if(typeof v==="string") return v
        if(typeof v==="object" && v.value!==undefined) return String(v.value)
        if(typeof v==="object") return JSON.stringify(v).replace(/^"|"$/g,"")
        return String(v)
      }
      // init appearance states from DB
      const pc = get("appearance.primary_color","#C9A86A").replace(/"/g,"")
      const th = get("appearance.theme","dark").replace(/"/g,"")
      const hb = get("hero.background_image","").replace(/"/g,"")
      const ho = get("hero.overlay_opacity","0.32").replace(/"/g,"")
      const hl = get("hero.logo_image","").replace(/"/g,"")
      const sp = get("sponsors.enabled","true").replace(/"/g,"")
      // normalize color: ensure # prefix
      let normalized = pc.trim()
      if(normalized && !normalized.startsWith("#")) normalized = "#"+normalized
      if(/^#[0-9A-Fa-f]{3,8}$/.test(normalized)) setPrimaryColor(normalized)
      else setPrimaryColor("#C9A86A")
      setThemeVal(th==="light" ? "light" : "dark")
      setHeroBg(hb)
      if(hl) setHeroLogo(hl)
      const op = parseFloat(ho)
      if(!isNaN(op)) setHeroOverlay(Math.round(op>1? op : op*100))
      else setHeroOverlay(32)
      setSponsorEnabled(sp!=="false" && sp!=="0")
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
    if(res.ok){
      toast({ title:"Pengaturan disimpan", variant:"success" });
      loadSettings();
      // trigger appearance provider live update
      if(typeof window!=="undefined") window.dispatchEvent(new CustomEvent("lkbb-settings-updated"))
      // apply primary color live
      const pc = updates.find(u=> u.key==="appearance.primary_color")?.value
      if(pc && typeof document!=="undefined"){
        let c = String(pc).trim()
        if(!c.startsWith("#")) c = "#"+c
        if(/^#?[0-9A-Fa-f]{3,8}$/.test(c)){
          document.documentElement.style.setProperty("--primary", c)
          document.documentElement.style.setProperty("--gold", c)
          document.documentElement.style.setProperty("--ring", c)
        }
      }
    } else { const j=await res.json(); toast({ title:"Gagal", description:j.error, variant:"error" }) }
    setSaving(false)
  }

  const getVal = (key:string, fallback="")=>{
    const v = settingsMap[key]
    if(v===undefined || v===null) return fallback
    if(typeof v==="string") return v
    if(typeof v==="object" && v.value !== undefined) return String(v.value)
    return typeof v==="object" ? JSON.stringify(v) : String(v)
  }

  if(!event) return <div className="p-8 text-sm">Memuat pengaturan...</div>

  const tabs: {id:Tab, label:string, icon:any}[] = [
    {id:"appearance", label:"Tampilan", icon: Palette},
    {id:"general", label:"Umum", icon: Settings},
    {id:"branding", label:"Branding", icon: Palette},
    {id:"contact", label:"Kontak", icon: Phone},
    {id:"social", label:"Sosial", icon: Share2},
    {id:"event", label:"Event & Voting", icon: Trophy},
  ]

  // helper for appearance preview
  const previewPrimary = primaryColor || "#C9A86A"

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 max-w-5xl">
      <div>
        <h1 className="text-[18px] font-black flex items-center gap-2"><Settings className="h-5 w-5"/> Pengaturan Umum Website</h1>
        <p className="text-xs text-muted-foreground">Semua disimpan di database (site_settings + competitions). Admin dapat mengedit semua yang tampil di website termasuk background hero di beranda. Perubahan langsung tampil.</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map(t=> (
          <button key={t.id} onClick={()=> setTab(t.id)} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border ${tab===t.id ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-muted"}`}>
            <t.icon className="h-3.5 w-3.5"/> {t.label}
          </button>
        ))}
      </div>

      {tab==="general" && (
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4 sm:space-y-5">
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
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4 sm:space-y-5">
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
              const elId = k==="branding.logo" ? "logo" : k==="branding.logo_paskibra" ? "logo_paskibra" : k==="branding.logo_school" ? "logo_school" : "poster"
              return { key:k, value: (document.getElementById(elId) as HTMLInputElement).value, category:"branding" }
            })
            handleSaveSettings(updates)
          }}>Simpan Branding</Button>
          {pickerFor && <MediaPicker open={!!pickerFor} onOpenChange={(o)=> !o && setPickerFor(null)} onSelect={(url)=> { const el=document.getElementById(pickerFor) as HTMLInputElement; if(el) el.value=url }} folder="branding" />}
        </div>
      )}

      {tab==="contact" && (
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4 sm:space-y-5">
          <h3 className="text-sm font-black">Kontak</h3>
          <div><label className="text-xs font-bold">Email</label><Input id="c_email" defaultValue={getVal("contact.email")} /></div>
          <div><label className="text-xs font-bold">WhatsApp Umum</label><Input id="c_wa" defaultValue={getVal("contact.whatsapp")} placeholder="628xxx" /></div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-4 sm:space-y-5">
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
        <div className="space-y-4">
          {/* Warna & Tema */}
          <div className="rounded-[16px] border border-border bg-card p-5 space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl grid place-items-center text-white" style={{background: previewPrimary}}><Palette className="h-4 w-4"/></div>
              <div>
                <h3 className="text-sm font-black">Tampilan — Warna & Tema</h3>
                <p className="text-xs text-muted-foreground">Pilih warna primer dengan palette lengkap. Preview realtime di bawah.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold">Warna Primer</label>
                  <div className="mt-1.5 flex gap-2 items-center">
                    <div className="relative h-[42px] w-[64px] rounded-xl border border-border overflow-hidden shrink-0">
                      <input type="color" value={primaryColor} onChange={e=> setPrimaryColor(e.target.value)} className="absolute inset-0 h-full w-full p-0 border-0 cursor-pointer" style={{background: primaryColor}} />
                    </div>
                    <Input value={primaryColor} onChange={e=> setPrimaryColor(e.target.value)} placeholder="#C9A86A" className="flex-1 font-mono text-sm" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Gunakan palette warna penuh atau ketik hex manual (contoh #FF385C).</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["#C9A86A","#FF385C","#0066CC","#00A86B","#8B5CF6","#F59E0B","#EF4444","#0EA5E9","#111111","#F97316"].map(c=> (
                      <button key={c} onClick={()=> setPrimaryColor(c)} className="h-7 w-7 rounded-full border border-border shrink-0" style={{background:c}} title={c} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold">Tema Default</label>
                  <Select value={themeVal} onValueChange={setThemeVal} options={[{value:"dark",label:"Dark — gelap premium"},{value:"light",label:"Light — terang bersih"}]} />
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-border overflow-hidden bg-muted/20">
                <div className="px-3 py-2 border-b border-border bg-card flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5"><Eye className="h-3.5 w-3.5"/> Preview</span>
                  <span className="text-[11px] text-muted-foreground">Live — warna primer {previewPrimary}</span>
                </div>
                <div className="p-4 space-y-3" style={{"--preview-primary": previewPrimary} as any}>
                  <div className="flex gap-2">
                    <button className="rounded-full px-5 py-2 text-xs font-black text-white" style={{background: previewPrimary}}>Tombol Primer</button>
                    <button className="rounded-full px-5 py-2 text-xs font-bold border" style={{borderColor: previewPrimary, color: previewPrimary, background: "transparent"}}>Outline</button>
                  </div>
                  <div className="rounded-xl border p-3 flex items-center gap-3" style={{borderColor: previewPrimary+"40", background: previewPrimary+"0A"}}>
                    <div className="h-10 w-10 rounded-xl grid place-items-center text-white shrink-0" style={{background: previewPrimary}}>★</div>
                    <div className="min-w-0">
                      <div className="text-sm font-black">Card Aksen</div>
                      <div className="text-xs text-muted-foreground">Border & background menggunakan warna primer yang dipilih.</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-black text-white" style={{background: previewPrimary}}>Badge</span>
                    <span className="h-px flex-1" style={{background: previewPrimary+"30"}}/>
                    <span className="font-mono text-[11px]">{previewPrimary}</span>
                  </div>
                  <div className="rounded-xl p-3 text-white text-xs" style={{background: `linear-gradient(135deg, ${previewPrimary} 0%, #0B0C0F 100%)`}}>
                    Gradient preview — hero / header bisa pakai warna ini
                  </div>
                </div>
              </div>
            </div>

            <Button disabled={saving} className="rounded-full" onClick={()=>{
              const updates = [
                { key:"appearance.primary_color", value: primaryColor, category:"appearance" },
                { key:"appearance.theme", value: themeVal, category:"appearance" },
              ]
              handleSaveSettings(updates)
            }}>Simpan Warna & Tema</Button>
            <p className="text-xs text-muted-foreground">Warna primer dipakai di tombol, badge, garis aksen, dan elemen interaktif. Perubahan terlihat langsung setelah refresh.</p>
          </div>

          {/* Hero background — Background judul web di beranda */}
          <div className="rounded-[16px] border border-border bg-card p-5 space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-[#0B0C0F] grid place-items-center text-[#C9A86A] border"><ImgIcon className="h-4 w-4"/></div>
              <div>
                <h3 className="text-sm font-black">Background Judul Web di Beranda (Hero)</h3>
                <p className="text-xs text-muted-foreground">Gambar latar di balik tulisan PELETON TERFAVORIT. Bisa ganti foto, atur opasitas, dan preview langsung.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold">URL Gambar Background</label>
                  <div className="flex gap-2 mt-1.5">
                    <Input value={heroBg} onChange={e=> setHeroBg(e.target.value)} placeholder="https://... atau /assets/..." className="flex-1 font-mono text-sm" />
                    <Button type="button" variant="outline" size="sm" className="rounded-full shrink-0" onClick={()=> setPickerFor("heroBg")}><ImgIcon className="h-3.5 w-3.5"/> Pilih</Button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <label className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-bold cursor-pointer hover:bg-muted">
                      <input type="file" accept="image/*" className="hidden" onChange={async e=>{
                        const file=e.target.files?.[0]; if(!file) return
                        const sup=createBrowserSupabase()
                        const path=`branding/hero-${Date.now()}-${file.name}`
                        const { error } = await sup.storage.from("media").upload(path, file)
                        if(error){ toast({title:"Gagal upload", description:error.message, variant:"error"}); return }
                        const { data } = sup.storage.from("media").getPublicUrl(path)
                        setHeroBg(data.publicUrl)
                        toast({title:"Gambar diunggah", variant:"success"})
                      }} />
                      Upload Gambar
                    </label>
                    {heroBg && <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={()=> setHeroBg("")}>Hapus</Button>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Gunakan foto baris-berbaris / upacara beresolusi tinggi. Rasio 16:9 terbaik.</p>
                </div>

                <div>
                  <label className="text-xs font-bold">Opasitas Overlay ({heroOverlay}%)</label>
                  <input type="range" min={0} max={90} value={heroOverlay} onChange={e=> setHeroOverlay(parseInt(e.target.value))} className="w-full mt-1 accent-[#C9A86A]" />
                  <div className="flex justify-between text-[11px] text-muted-foreground"><span>Transparan</span><span>Pekat</span></div>
                </div>

                <div>
                  <label className="text-xs font-bold">Logo Watermark (opsional)</label>
                  <div className="flex gap-2 mt-1.5">
                    <Input value={heroLogo} onChange={e=> setHeroLogo(e.target.value)} placeholder="/assets/brand/lkbb-logo.jpg atau https://..." className="flex-1 font-mono text-sm" />
                    <Button type="button" variant="outline" size="sm" className="rounded-full shrink-0" onClick={()=> setPickerFor("heroLogo")}><ImgIcon className="h-3.5 w-3.5"/> Pilih</Button>
                  </div>
                  {heroLogo && <img src={heroLogo} alt="logo preview" className="mt-2 h-12 w-12 rounded-xl object-cover border bg-muted" onError={e=> (e.currentTarget.style.display='none')} />}
                </div>
              </div>

              {/* Hero preview */}
              <div className="rounded-xl overflow-hidden border border-border bg-[#08090B] relative h-[220px] sm:h-[260px] grid place-items-center text-center">
                {heroBg ? <img src={heroBg} alt="hero bg preview" className="absolute inset-0 h-full w-full object-cover" style={{opacity: heroOverlay/100}} onError={e=> (e.currentTarget.style.display='none')} /> : <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#08090B]" />}
                <div className="absolute inset-0 bg-gradient-to-b from-[#08090B]/20 via-[#08090B]/50 to-[#08090B]" />
                {heroLogo && <img src={heroLogo} alt="" className="absolute inset-0 m-auto h-[140px] w-[140px] object-contain opacity-10 pointer-events-none" />}
                <div className="relative px-4">
                  <div className="text-[10px] font-bold tracking-[0.18em] text-[#C9A86A]">LKBB • JAVASOMA THE IMPRESSION</div>
                  <div className="mt-1 text-[22px] font-black leading-none text-white" style={{fontFamily:"var(--font-cormorant)"}}>PELETON<br/><span style={{color: previewPrimary}}>TERFAVORIT</span></div>
                  <div className="mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-black text-[#0B0C0F]" style={{background: previewPrimary}}>LIHAT PESERTA</div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-[10px] text-white/50">Preview hero — background & warna primer realtime</div>
              </div>
            </div>

            <Button disabled={saving} className="rounded-full" onClick={()=>{
              const updates = [
                { key:"hero.background_image", value: heroBg, category:"appearance" },
                { key:"hero.overlay_opacity", value: String(heroOverlay/100), category:"appearance" },
                { key:"hero.logo_image", value: heroLogo, category:"appearance" },
              ]
              handleSaveSettings(updates)
            }}>Simpan Hero Background</Button>
            <p className="text-xs text-muted-foreground">Background ini tampil di beranda paling atas (Hero). Jika kosong, akan pakai background default dari CMS. Perubahan langsung tampil di beranda setelah disimpan.</p>
          </div>

          {/* Sponsor toggle */}
          <div className="rounded-[16px] border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500 grid place-items-center text-white"><Sparkles className="h-4 w-4"/></div>
              <div>
                <h3 className="text-sm font-black">Sponsor — Tampilkan / Sembunyikan</h3>
                <p className="text-xs text-muted-foreground">Kontrol apakah blok sponsor tampil di beranda & halaman kompetisi paling bawah.</p>
              </div>
            </div>
            <label className="flex items-center justify-between rounded-xl border border-border p-4 cursor-pointer hover:bg-muted/30 transition-colors">
              <div>
                <div className="text-sm font-bold">Tampilkan Sponsor di Website</div>
                <div className="text-xs text-muted-foreground">Jika dimatikan, sponsor tidak akan tampil di mana pun (beranda & kompetisi), meski data sponsor masih ada.</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black ${sponsorEnabled ? "text-emerald-600" : "text-zinc-500"}`}>{sponsorEnabled ? "TAMPIL" : "SEMBUNYI"}</span>
                <input type="checkbox" checked={sponsorEnabled} onChange={e=> setSponsorEnabled(e.target.checked)} className="h-5 w-10 appearance-none rounded-full bg-zinc-300 relative transition-colors checked:bg-emerald-500 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-5 cursor-pointer" />
              </div>
            </label>
            <div className="rounded-xl border border-dashed p-4 flex items-center justify-between bg-muted/20">
              <div className="flex gap-2">
                {["ASTRA","BRI","Telkomsel"].map(s=> <span key={s} className={`rounded-full px-3 py-1.5 text-xs font-bold border ${sponsorEnabled ? "bg-card border-border" : "bg-zinc-100 text-zinc-400 border-zinc-200 line-through"}`}>{s}</span>)}
              </div>
              <span className="text-xs text-muted-foreground">{sponsorEnabled ? "Pratinjau: sponsor tampil" : "Pratinjau: sponsor disembunyikan"}</span>
            </div>
            <Button disabled={saving} className="rounded-full" onClick={()=>{
              handleSaveSettings([{ key:"sponsors.enabled", value: sponsorEnabled ? "true" : "false", category:"general" }])
            }}>Simpan Pengaturan Sponsor</Button>
            <p className="text-xs text-muted-foreground">Kelola daftar sponsor di menu <b>Sponsor</b>. Toggle ini hanya mengontrol visibilitas global.</p>
          </div>
        </div>
      )}

      {tab==="event" && (
        <div className="space-y-4 sm:space-y-5">
          <div className="rounded-[16px] border border-border bg-card p-5 space-y-4 sm:space-y-5">
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


      {/* List settings — tanpa bahasa pemrograman, hanya nilai bersih */}
      <details className="rounded-[12px] border border-border bg-card">
        <summary className="p-3 text-xs font-bold cursor-pointer">Lihat semua pengaturan — {settingsRows.length} kunci</summary>
        <div className="p-3 border-t border-border max-h-[320px] overflow-y-auto space-y-1">
          {settingsRows.map((r:any)=> {
            const val = typeof r.value === 'string' ? r.value : typeof r.value === 'object' && r.value !== null ? (Array.isArray(r.value) ? r.value.join(', ') : Object.values(r.value).join(', ')).slice(0,60) : String(r.value)
            return (
              <div key={r.key} className="flex justify-between gap-2 text-xs border-b border-border/50 py-1.5">
                <span className="font-bold">{r.key}</span>
                <span className="truncate max-w-[50%] text-muted-foreground">{val.slice(0,60)}</span>
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{r.category}</span>
              </div>
            )
          })}
        </div>
      </details>
      {pickerFor && <MediaPicker open={!!pickerFor} onOpenChange={(o)=> !o && setPickerFor(null)} onSelect={(url)=> { 
        if(pickerFor==="heroBg") setHeroBg(url)
        else if(pickerFor==="heroLogo") setHeroLogo(url)
        else { const el=document.getElementById(pickerFor) as HTMLInputElement; if(el) el.value=url }
      }} folder="branding" />}
    </div>
  )
}
