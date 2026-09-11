"use client"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { Save, Eye, Smartphone, Tablet, Monitor, Undo2, Redo2, History, Plus, Layers, Settings, Palette, Type, Image as ImageIcon, Video, Minus, Box } from "lucide-react"

type Section = {
  id: string
  key: string
  title: string
  type: string
  is_visible: boolean
  sort_order: number
  settings: any
  content: any
  protected?: string
}

type Page = { id: string; slug: string; title: string }

export default function DesignStudio(){
  const { toast } = useToast()
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<string>("home")
  const [sections, setSections] = useState<Section[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<"desktop"|"tablet"|"mobile">("desktop")
  const [zoom, setZoom] = useState(100)
  const [history, setHistory] = useState<Section[][]>([])
  const [future, setFuture] = useState<Section[][]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [revisions, setRevisions] = useState<any[]>([])

  const selectedSection = sections.find(s => s.id === selectedId) || null

  const loadPages = async () => {
    const res = await fetch("/api/admin/cms/pages")
    const j = await res.json()
    if (Array.isArray(j)) setPages(j.map((p:any)=> ({id:p.id, slug:p.slug, title:p.title})))
    else if (j.pages) setPages(j.pages)
  }
  const loadSections = async (slug: string) => {
    const res = await fetch(`/api/admin/cms/sections?slug=${slug}`)
    const j = await res.json()
    if (Array.isArray(j)) setSections(j)
    else if (j.sections) setSections(j.sections)
    else if (j.data) setSections(j.data)
  }
  const loadRevisions = async () => {
    // Use cms_revisions via supabase directly? For now fetch audit_logs filtered
    try {
      const res = await fetch(`/api/admin/cms/sections?slug=${selectedPage}`)
      // revisions via cms_revisions not exposed, use audit_logs
      const r2 = await fetch("/api/cms/pages?include=sections")
      // fallback: just show local history
    } catch {}
  }

  useEffect(()=>{ loadPages() },[])
  useEffect(()=>{ loadSections(selectedPage); setSelectedId(null) },[selectedPage])

  const pushHistory = useCallback((prev: Section[]) => {
    setHistory(h => [...h.slice(-19), JSON.parse(JSON.stringify(prev))])
    setFuture([])
  }, [])

  const updateSection = useCallback((id: string, patch: Partial<Section>) => {
    pushHistory(sections)
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...patch, content: patch.content ? { ...s.content, ...patch.content } : s.content, settings: patch.settings ? { ...s.settings, ...patch.settings } : s.settings } : s))
  }, [sections, pushHistory])

  const updateContentField = (key: string, value: any) => {
    if (!selectedSection) return
    const newContent = { ...selectedSection.content, [key]: value }
    updateSection(selectedSection.id, { content: newContent })
  }
  const updateStyleField = (key: string, value: any) => {
    if (!selectedSection) return
    const newSettings = { ...selectedSection.settings, [key]: value }
    updateSection(selectedSection.id, { settings: newSettings })
  }

  const handleHide = (id: string) => {
    const s = sections.find(x=>x.id===id)
    if (!s) return
    if (s.key === "hero" || s.type === "hero") {
      toast({ title: "Protected", description: "Hero tidak boleh di-hide, gunakan visibility toggle", variant: "error" })
      return
    }
    updateSection(id, { is_visible: !s.is_visible })
  }
  const handleDuplicate = async (id: string) => {
    const s = sections.find(x=>x.id===id)
    if (!s) return
    if (s.protected === "system") { toast({ title: "Protected", description: "System element tidak boleh duplicate", variant: "error" }); return }
    pushHistory(sections)
    const newSec = { ...s, id: undefined, key: s.key + "_copy_" + Date.now().toString(36).slice(0,4), title: s.title + " Copy", sort_order: s.sort_order + 1 }
    const res = await fetch("/api/admin/cms/sections", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ ...newSec, page_id: pages.find(p=>p.slug===selectedPage)?.id }) })
    if (res.ok) { toast({ title: "Duplicated", variant: "success" }); loadSections(selectedPage) }
  }
  const handleDelete = async (id: string) => {
    const s = sections.find(x=>x.id===id)
    if (!s) return
    if (s.protected === "system" || s.protected === "protected") { toast({ title: "Protected", description: "Element protected tidak boleh dihapus", variant: "error" }); return }
    if (!confirm(`Hapus section "${s.title}"?`)) return
    pushHistory(sections)
    const res = await fetch(`/api/admin/cms/sections?id=${id}`, { method: "DELETE" })
    if (res.ok) { setSections(prev=> prev.filter(x=>x.id!==id)); toast({ title: "Dihapus", variant: "success" }) }
  }
  const handleReorder = async (from: number, to: number) => {
    if (from===to) return
    pushHistory(sections)
    const arr = [...sections]
    const [moved] = arr.splice(from,1)
    arr.splice(to,0,moved)
    const ordered = arr.map((s,i)=> ({...s, sort_order:i}))
    setSections(ordered)
    await fetch("/api/admin/cms/sections/reorder", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ page_id: pages.find(p=>p.slug===selectedPage)?.id, orderedIds: ordered.map(o=>o.id) }) })
  }

  const undo = () => {
    if (history.length===0) return
    const prev = history[history.length-1]
    setFuture(f=> [JSON.parse(JSON.stringify(sections)), ...f])
    setSections(prev)
    setHistory(h=> h.slice(0,-1))
  }
  const redo = () => {
    if (future.length===0) return
    const next = future[0]
    setHistory(h=> [...h, JSON.parse(JSON.stringify(sections))])
    setSections(next)
    setFuture(f=> f.slice(1))
  }

  const save = async () => {
    if (!selectedSection) {
      // save all
      setIsSaving(true)
      for (const s of sections) {
        await fetch("/api/admin/cms/sections", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: s.id, content: s.content, settings: s.settings, is_visible: s.is_visible, sort_order: s.sort_order }) })
      }
      setIsSaving(false)
      toast({ title: "Saved", description: "Draft tersimpan", variant: "success" })
      return
    }
    setIsSaving(true)
    const res = await fetch("/api/admin/cms/sections", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: selectedSection.id, content: selectedSection.content, settings: selectedSection.settings, is_visible: selectedSection.is_visible }) })
    setIsSaving(false)
    if (res.ok) toast({ title: "Saved", variant: "success" })
    else toast({ title: "Gagal simpan", variant: "error" })
  }

  const saveAll = async () => {
    setIsSaving(true)
    for (const s of sections) {
      await fetch("/api/admin/cms/sections", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id: s.id, content: s.content, settings: s.settings, is_visible: s.is_visible, sort_order: s.sort_order }) })
    }
    setIsSaving(false)
    toast({ title: "Semua tersimpan", variant: "success" })
  }

  // Keyboard shortcuts
  useEffect(()=>{
    const h = (e: KeyboardEvent)=>{
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="z" && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="z" && e.shiftKey) { e.preventDefault(); redo() }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="s") { e.preventDefault(); saveAll() }
      if (e.key==="Delete" && selectedId) { handleDelete(selectedId) }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="d" && selectedId) { e.preventDefault(); handleDuplicate(selectedId) }
      if (e.key==="Escape") setSelectedId(null)
    }
    window.addEventListener("keydown", h)
    return ()=> window.removeEventListener("keydown", h)
  }, [selectedId, sections, history, future])

  const viewportWidth = viewport==="mobile" ? 390 : viewport==="tablet" ? 768 : 1280
  const scale = zoom/100

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-white overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-white/[0.06] flex items-center justify-between px-3 sm:px-4 bg-[#111318] shrink-0">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-xs font-bold tracking-wide text-white/60 hover:text-white">← Dashboard</a>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm font-black">DESIGN STUDIO</span>
          <select value={selectedPage} onChange={e=> setSelectedPage(e.target.value)} className="ml-2 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
            {pages.map(p=> <option key={p.slug} value={p.slug} className="bg-[#111318]">{p.title} • {p.slug}</option>)}
            {pages.length===0 && <option value="home">Beranda • home</option>}
          </select>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-200">Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex h-8 rounded-full border border-white/10 bg-white/5 text-white/70" onClick={undo} disabled={history.length===0}><Undo2 className="h-3.5 w-3.5"/> Undo</Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex h-8 rounded-full border border-white/10 bg-white/5 text-white/70" onClick={redo} disabled={future.length===0}><Redo2 className="h-3.5 w-3.5"/> Redo</Button>
          <a href={`/${selectedPage==="home" ? "" : selectedPage}`} target="_blank" className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold text-white/70 hover:text-white"><Eye className="h-3.5 w-3.5"/> Preview</a>
          <Button size="sm" className="rounded-full bg-[#C9A86A] text-[#0C0A06] hover:bg-[#D4B77A] h-8 px-4 font-black" onClick={saveAll} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
          <Button size="sm" className="rounded-full bg-white text-[#0B0C0F] hover:bg-white/90 h-8 px-4 font-black hidden sm:inline-flex" onClick={()=> { saveAll(); toast({ title: "Published", description: "Perubahan live", variant: "success" }) }}>Publish</Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Elements */}
        <div className="w-[220px] shrink-0 border-r border-white/[0.06] bg-[#0F1115] hidden lg:flex flex-col">
          <div className="p-3 border-b border-white/[0.04]">
            <div className="text-[11px] font-bold tracking-widest text-white/60">ELEMENTS</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                {label:"Text", icon:Type, type:"text_block"},
                {label:"Button", icon:Box, type:"cta"},
                {label:"Image", icon:ImageIcon, type:"image"},
                {label:"Video", icon:Video, type:"video"},
                {label:"Section", icon:Layers, type:"banner"},
                {label:"Divider", icon:Minus, type:"divider"},
              ].map(it=> (
                <button key={it.label} onClick={async ()=>{
                  const pageId = pages.find(p=>p.slug===selectedPage)?.id
                  if(!pageId) return
                  const res = await fetch("/api/admin/cms/sections", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ page_id: pageId, key: it.label.toLowerCase()+"_"+Date.now().toString(36).slice(0,4), title: it.label, type: it.type, is_visible:true, sort_order: sections.length, settings:{}, content: it.type==="text_block" ? {text:"Teks baru"} : it.type==="image" ? {src:"", alt:""} : {} }) })
                  if(res.ok) loadSections(selectedPage)
                }} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] p-3 text-xs font-bold text-white/80">
                  <it.icon className="h-4 w-4 text-[#C9A86A]"/> {it.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-[11px] font-bold tracking-widest text-white/60 flex items-center gap-2"><Layers className="h-3 w-3"/> LAYERS</div>
            <div className="mt-2 space-y-1">
              {sections.map((s, idx)=> (
                <div key={s.id} onClick={()=> setSelectedId(s.id)} className={`group flex items-center gap-2 rounded-lg border px-2.5 py-2 cursor-pointer ${selectedId===s.id ? "bg-[#C9A86A]/10 border-[#C9A86A]/30 text-white" : "bg-white/[0.03] border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.06]"}`}>
                  <span className="text-[10px] font-mono text-white/40">{String(idx+1).padStart(2,"0")}</span>
                  <span className="text-xs font-bold truncate flex-1">{s.title || s.key}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{s.type}</span>
                  <button onClick={(e)=>{e.stopPropagation(); handleHide(s.id)}} className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/10 text-xs">{s.is_visible ? "👁" : "🚫"}</button>
                </div>
              ))}
              {sections.length===0 && <div className="text-xs text-white/40 py-6 text-center">Belum ada section.<br/>Klik + Text untuk tambah.</div>}
            </div>
          </div>
          <div className="p-3 border-t border-white/[0.04] flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 rounded-full border-white/10 bg-white/5 text-white/70 h-8 text-xs" onClick={()=> setShowHistory(!showHistory)}><History className="h-3.5 w-3.5"/> History</Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#040A14] overflow-auto flex flex-col items-center p-4 sm:p-6">
          <div className="shrink-0 flex items-center gap-2 mb-4">
            <span className="text-[11px] font-bold tracking-widest text-white/40">CANVAS</span>
            <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-white/60">{viewport} • {viewportWidth}px • {zoom}%</span>
          </div>
          <div className="w-full flex justify-center overflow-auto">
            <div className="bg-white shadow-2xl overflow-hidden border border-white/10" style={{ width: viewportWidth, transform: `scale(${scale})`, transformOrigin: "top center", minHeight: 600 }}>
              {/* Real preview: iframe to actual page */}
              <iframe src={`/${selectedPage==="home" ? "" : selectedPage}`} title="canvas" className="w-full h-[800px] border-0" style={{ width: viewportWidth, height: 900 }} />
              {/* Overlay selection: simple list of sections as clickable overlay for demo */}
              <div className="absolute inset-0 pointer-events-none" />
            </div>
          </div>
          {/* Fallback editable list below iframe for quick edit without iframe postMessage */}
          <div className="mt-6 w-full max-w-[900px] grid gap-3">
            {sections.map(s=> (
              <div key={s.id} onClick={()=> setSelectedId(s.id)} className={`rounded-xl border p-3 cursor-pointer text-left ${selectedId===s.id ? "border-[#C9A86A] bg-[#C9A86A]/10" : "border-white/10 bg-[#111318] hover:border-white/20"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{s.title} <span className="text-[10px] font-bold text-white/40">• {s.type} • {s.key}</span></span>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${s.is_visible ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>{s.is_visible ? "Visible" : "Hidden"}</span>
                </div>
                <div className="mt-1 text-xs text-white/60 truncate">{JSON.stringify(s.content).slice(0,120)}</div>
                <div className="mt-2 flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 rounded-full text-xs" onClick={(e)=>{e.stopPropagation(); setSelectedId(s.id)}}>Edit</Button>
                  <Button size="sm" variant="ghost" className="h-7 rounded-full text-xs" onClick={(e)=>{e.stopPropagation(); handleHide(s.id)}}>{s.is_visible ? "Hide" : "Show"}</Button>
                  <Button size="sm" variant="ghost" className="h-7 rounded-full text-xs" onClick={(e)=>{e.stopPropagation(); handleDuplicate(s.id)}}>Duplicate</Button>
                  <Button size="sm" variant="ghost" className="h-7 rounded-full text-xs text-red-400" onClick={(e)=>{e.stopPropagation(); handleDelete(s.id)}}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties */}
        <div className="w-[300px] shrink-0 border-l border-white/[0.06] bg-[#0F1115] hidden lg:flex flex-col">
          <div className="p-3 border-b border-white/[0.04] flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/60">PROPERTIES</span>
            {selectedSection && <span className="text-[10px] px-2 py-1 rounded-full bg-[#C9A86A]/20 text-[#C9A86A] font-bold">{selectedSection.type}</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {!selectedSection ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-white/5 grid place-items-center text-white/40"><Settings className="h-5 w-5"/></div>
                <div className="mt-3 text-sm font-bold text-white">Pilih element</div>
                <div className="text-xs text-white/50">Klik section di layers atau canvas</div>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-[11px] font-bold tracking-widest text-white/60">IDENTITY</div>
                  <div className="mt-2 grid gap-2">
                    <div><label className="text-xs font-bold text-white/70">Title</label><input value={selectedSection.title} onChange={e=> updateSection(selectedSection.id, {title: e.target.value})} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-sm text-white" /></div>
                    <div><label className="text-xs font-bold text-white/70">Key</label><input value={selectedSection.key} disabled className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-xs text-white/60" /></div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-white/70"><input type="checkbox" checked={selectedSection.is_visible} onChange={e=> updateSection(selectedSection.id, {is_visible: e.target.checked})} className="h-3.5 w-3.5 accent-[#C9A86A]"/> Visible</label>
                      {selectedSection.protected && <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-amber-500/20 text-amber-300">🔒 {selectedSection.protected}</span>}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-[11px] font-bold tracking-widest text-white/60 flex items-center gap-1.5"><Type className="h-3 w-3"/> CONTENT</div>
                  <div className="mt-2 grid gap-2 max-h-[260px] overflow-auto">
                    {Object.entries(selectedSection.content || {}).map(([k,v])=> (
                      <div key={k}>
                        <label className="text-xs font-bold text-white/70 truncate">{k}</label>
                        {String(v).startsWith("http") || k.toLowerCase().includes("image") || k.toLowerCase().includes("src") ? (
                          <div className="flex gap-1.5 mt-1">
                            <input value={String(v)} onChange={e=> updateContentField(k, e.target.value)} className="flex-1 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-xs text-white truncate" placeholder="https://..." />
                            <Button size="sm" variant="outline" className="h-9 rounded-full px-3 text-xs shrink-0" onClick={()=> {
                              const url = prompt("Paste image URL", String(v))
                              if(url!==null) updateContentField(k, url)
                            }}>Ganti</Button>
                          </div>
                        ) : String(v).length > 60 ? (
                          <textarea value={String(v)} onChange={e=> updateContentField(k, e.target.value)} rows={3} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-xs text-white" />
                        ) : (
                          <input value={String(v)} onChange={e=> updateContentField(k, e.target.value)} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-xs text-white" />
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="rounded-full w-full mt-1" onClick={()=>{
                      const k = prompt("Key baru")
                      if(!k) return
                      const val = prompt("Value")
                      updateContentField(k, val || "")
                    }}><Plus className="h-3.5 w-3.5"/> Tambah Field</Button>
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-[11px] font-bold tracking-widest text-white/60 flex items-center gap-1.5"><Palette className="h-3 w-3"/> STYLE</div>
                  <div className="mt-2 grid gap-2">
                    {["background","color","fontSize","padding","margin","borderRadius","opacity"].map(field=> (
                      <div key={field}>
                        <label className="text-xs font-bold text-white/60">{field}</label>
                        <input value={selectedSection.settings?.[field] || ""} onChange={e=> updateStyleField(field, e.target.value)} placeholder={field==="color" ? "#C9A86A" : field==="background" ? "var(--background)" : ""} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-xs text-white" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-full" onClick={()=> handleDuplicate(selectedSection.id)}>Duplicate</Button>
                  <Button variant="ghost" className="flex-1 rounded-full text-red-400" onClick={()=> handleDelete(selectedSection.id)}>Delete</Button>
                </div>
                <Button className="w-full rounded-full bg-[#C9A86A] text-[#0C0A06] font-black" onClick={save} disabled={isSaving}>{isSaving?"Saving...":"Save"}</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-10 border-t border-white/[0.06] bg-[#111318] flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <button onClick={()=> setViewport("desktop")} className={`h-7 px-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${viewport==="desktop" ? "bg-white text-[#0B0C0F]" : "bg-white/5 text-white/60"}`}><Monitor className="h-3.5 w-3.5"/> Desktop</button>
          <button onClick={()=> setViewport("tablet")} className={`h-7 px-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${viewport==="tablet" ? "bg-white text-[#0B0C0F]" : "bg-white/5 text-white/60"}`}><Tablet className="h-3.5 w-3.5"/> Tablet</button>
          <button onClick={()=> setViewport("mobile")} className={`h-7 px-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${viewport==="mobile" ? "bg-white text-[#0B0C0F]" : "bg-white/5 text-white/60"}`}><Smartphone className="h-3.5 w-3.5"/> Mobile</button>
          <span className="hidden sm:inline-flex h-4 w-px bg-white/10 mx-1" />
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-white/50">Zoom <button onClick={()=> setZoom(z=> Math.max(50,z-10))} className="h-6 w-6 rounded-full border border-white/10 grid place-items-center">−</button> {zoom}% <button onClick={()=> setZoom(z=> Math.min(200,z+10))} className="h-6 w-6 rounded-full border border-white/10 grid place-items-center">+</button></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] text-white/40">{history.length} undo • {future.length} redo</span>
          <span className="text-[11px] text-white/40">History</span>
        </div>
      </div>
    </div>
  )
}
