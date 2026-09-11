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

  const selectedParts = selectedId?.split("-") || []
  const selectedSectionId = selectedParts.length > 1 && sections.some(s=> s.id===selectedParts[0]) ? selectedParts[0] : selectedId
  const selectedSubKey = selectedParts.length > 1 && selectedId?.includes("-") ? selectedId.substring(selectedSectionId!.length + 1) : null
  const selectedSection = sections.find(s => s.id === selectedSectionId) || sections.find(s => s.id === selectedId) || null
  const isSubElement = !!selectedSubKey && selectedSection && selectedSection.content && selectedSubKey in selectedSection.content

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
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-3 sm:px-4 bg-white/5 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-xs font-bold tracking-wide text-white/60 hover:text-white">← Dashboard</a>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm font-black">DESIGN STUDIO</span>
          <select value={selectedPage} onChange={e=> setSelectedPage(e.target.value)} className="ml-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs font-bold">
            {pages.map(p=> <option key={p.slug} value={p.slug} className="bg-white/5 backdrop-blur">{p.title} • {p.slug}</option>)}
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
        <div className="w-[220px] shrink-0 border-r border-white/10 bg-white/5 backdrop-blur hidden lg:flex flex-col">
          <div className="p-3 border-b border-white/10">
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
                }} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/5 p-3 text-xs font-bold text-white/80">
                  <it.icon className="h-4 w-4 text-[#C9A86A]"/> {it.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-[11px] font-bold tracking-widest text-white/60 flex items-center gap-2"><Layers className="h-3 w-3"/> LAYERS</div>
            <div className="mt-2 space-y-1">
              {sections.map((s, idx)=> (
                <div key={s.id} onClick={()=> setSelectedId(s.id)} className={`group flex items-center gap-2 rounded-lg border px-2.5 py-2 cursor-pointer ${selectedId===s.id ? "bg-[#C9A86A]/10 border-[#C9A86A]/30 text-white" : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/5"}`}>
                  <span className="text-[10px] font-mono text-white/40">{String(idx+1).padStart(2,"0")}</span>
                  <span className="text-xs font-bold truncate flex-1">{s.title || s.key}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10">{s.type}</span>
                  <button onClick={(e)=>{e.stopPropagation(); handleHide(s.id)}} className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/10 text-xs">{s.is_visible ? "👁" : "🚫"}</button>
                </div>
              ))}
              {sections.length===0 && <div className="text-xs text-white/40 py-6 text-center">Belum ada section.<br/>Klik + Text untuk tambah.</div>}
            </div>
          </div>
          <div className="p-3 border-t border-white/10 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 rounded-full border-white/10 bg-white/5 text-white/70 h-8 text-xs" onClick={()=> setShowHistory(!showHistory)}><History className="h-3.5 w-3.5"/> History</Button>
          </div>
        </div>

        {/* Canvas — FULL WEBSITE PREVIEW, semua elemen editable */}
        <div className="flex-1 bg-[#09090b] overflow-auto flex flex-col items-center p-2 sm:p-4">
          <div className="shrink-0 flex items-center gap-2 mb-3 sm:mb-4">
            <span className="text-[11px] font-bold tracking-widest text-white/40">CANVAS</span>
            <span className="text-[11px] px-2 py-1 rounded-full bg-white/10 text-white/60">{viewport} • {viewportWidth}px • {zoom}%</span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-white/30 ml-2">Klik elemen untuk edit • Drag untuk pindah • Handle untuk resize</span>
          </div>
          <div className="w-full flex justify-center overflow-auto pb-6 sm:pb-8">
            <div className="bg-[#09090b] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 rounded-[12px] flex flex-col" style={{ width: viewportWidth, transform: `scale(${scale})`, transformOrigin: "top center", minHeight: 680 }}>
              {/* Full website preview — header + sections + footer, semua editable */}
              <div className="h-14 border-b border-white/10 bg-white/5 backdrop-blur flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2"><div className="h-8 w-8 rounded bg-[#C9A86A] grid place-items-center text-[10px] font-black text-[#0C0A06]">LKBB</div><span className="text-xs font-black text-white">LKBB JAVASOMA</span></div>
                <div className="hidden sm:flex gap-1 text-[11px] text-white/60"><span>Beranda</span><span>Tim</span><span>Kompetisi</span><span>Profile</span></div>
                <div className="h-7 px-3 rounded-full bg-white text-[#0B0C0F] text-xs font-black grid place-items-center">Preview</div>
              </div>
              <div className="flex-1 w-full overflow-auto max-h-[700px]">
                {sections.length===0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-white/5 grid place-items-center text-white/20"><Plus className="h-6 w-6"/></div>
                    <div className="mt-3 text-sm font-bold text-white">Canvas kosong</div>
                    <div className="text-xs text-white/50">Tambah section dari panel ELEMENTS</div>
                  </div>
                ) : sections.filter(s=> s.is_visible).map(s=> {
                  const isSelected = selectedId===s.id || selectedId?.startsWith(s.id + "-")
                  const content = s.content || {}
                  const handleSelect = (subId?: string) => setSelectedId(subId ? `${s.id}-${subId}` : s.id)
                  return (
                    <div
                      key={s.id}
                      onClick={()=> setSelectedId(s.id)}
                      className={`relative group/section cursor-pointer transition-all ${isSelected ? "ring-2 ring-[#C9A86A] ring-inset z-10" : "hover:ring-1 hover:ring-white/15"}`}
                      draggable
                      onDragStart={(e)=> { e.dataTransfer.setData("text/plain", s.id); (e.target as HTMLElement).style.opacity="0.5" }}
                      onDragEnd={(e)=> (e.target as HTMLElement).style.opacity="1"}
                      onDragOver={(e)=> e.preventDefault()}
                      onDrop={(e)=> {
                        const draggedId = e.dataTransfer.getData("text/plain")
                        if(!draggedId || draggedId===s.id) return
                        const from = sections.findIndex(x=>x.id===draggedId)
                        const to = sections.findIndex(x=>x.id===s.id)
                        if(from>=0 && to>=0) handleReorder(from,to)
                      }}
                    >
                      {isSelected && <div className="absolute -top-0 left-0 right-0 h-6 bg-[#C9A86A] flex items-center justify-between px-2.5 z-20"><span className="text-[11px] font-black text-[#0C0A06] flex items-center gap-1.5"><Box className="h-3 w-3"/> {s.title} • {s.type}</span><span className="text-[10px] font-bold text-[#0C0A06]/70">Drag ↕ • Klik elemen di dalam untuk edit detail</span></div>}
                      {/* Drag handle */}
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 hidden group-hover/section:flex flex-col gap-0.5 bg-black/60 backdrop-blur rounded-full p-1 border border-white/10">
                        <div className="h-1 w-3 bg-white/40 rounded-full" /><div className="h-1 w-3 bg-white/40 rounded-full" /><div className="h-1 w-3 bg-white/40 rounded-full" />
                      </div>
                      {/* Resize handles */}
                      {isSelected && <>
                        <div className="absolute -top-1 -left-1 h-3 w-3 bg-[#C9A86A] border-2 border-white rounded-full shadow cursor-nw-resize" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#C9A86A] border-2 border-white rounded-full shadow cursor-ne-resize" />
                        <div className="absolute -bottom-1 -left-1 h-3 w-3 bg-[#C9A86A] border-2 border-white rounded-full shadow cursor-sw-resize" />
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-[#C9A86A] border-2 border-white rounded-full shadow cursor-se-resize" />
                      </>}
                      {/* Section visual by type — tiap sub-elemen bisa klik terpisah */}
                      {s.type==="hero" && (
                        <div className="relative overflow-hidden bg-[#09090b] text-white p-8 sm:p-10 text-center" style={{ background: s.settings?.background || undefined }}>
                          {content.backgroundImage && <img src={String(content.backgroundImage)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
                          <div className="relative space-y-2">
                            <div onClick={(e)=>{e.stopPropagation(); handleSelect("eyebrow")}} className={`inline-block px-2 py-1 rounded ${selectedId===s.id+"-eyebrow" ? "ring-1 ring-[#C9A86A] bg-[#C9A86A]/10" : "hover:bg-white/5"}`}><div className="text-[11px] font-bold tracking-[0.18em] text-[#C9A86A]">{String(content.eyebrow || "LKBB • JAVASOMA THE IMPRESSION")}</div></div>
                            <div onClick={(e)=>{e.stopPropagation(); handleSelect("title")}} className={`block ${selectedId===s.id+"-title" ? "ring-1 ring-[#C9A86A] bg-white/5 rounded" : "hover:bg-white/5"}`}><h2 className="text-[28px] sm:text-[32px] font-black leading-none tracking-tight" style={{ color: content.titleColor || "#fff" }}>{String(content.headingLine1 || "PELETON")} <span className="gold-gradient-text">{String(content.headingLine2 || "TERFAVORIT")}</span></h2></div>
                            <div onClick={(e)=>{e.stopPropagation(); handleSelect("subtitle")}} className={`inline-block px-2 py-1 rounded ${selectedId===s.id+"-subtitle" ? "ring-1 ring-[#C9A86A] bg-white/5" : "hover:bg-white/5"}`}><div className="text-[11px] tracking-[0.14em] text-white/70">{String(content.subtitle || "LKBB")} • {String(content.subtitle2 || "JAVASOMA")}</div></div>
                            <div onClick={(e)=>{e.stopPropagation(); handleSelect("tagline")}} className={`inline-block px-2 py-1 rounded ${selectedId===s.id+"-tagline" ? "ring-1 ring-[#C9A86A] bg-white/5" : "hover:bg-white/5"}`}><div className="text-xs text-[#C9A86A] font-bold tracking-wide">{String(content.tagline || "ASTRA DHARMA HAYUNING BUDAYA")}</div></div>
                            <div className="flex justify-center gap-2 pt-2">
                              <span onClick={(e)=>{e.stopPropagation(); handleSelect("ctaPrimary")}} className={`rounded-full px-5 py-2 text-xs font-black cursor-pointer ${selectedId===s.id+"-ctaPrimary" ? "ring-2 ring-[#C9A86A] bg-[#C9A86A] text-[#0C0A06]" : "bg-[#C9A86A] text-[#0C0A06] hover:bg-[#D4B77A]"}`}>{String(content.ctaPrimaryLabel || "LIHAT PESERTA")}</span>
                              <span onClick={(e)=>{e.stopPropagation(); handleSelect("ctaSecondary")}} className={`rounded-full border px-5 py-2 text-xs font-bold cursor-pointer ${selectedId===s.id+"-ctaSecondary" ? "ring-2 ring-white bg-white text-[#0B0C0F]" : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"}`}>{String(content.ctaSecondaryLabel || "CARA DUKUNG")}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {s.type==="countdown" && (
                        <div onClick={(e)=>{e.stopPropagation(); handleSelect("countdown")}} className={`bg-[#0B0C0F] border-y border-white/5 p-6 text-center cursor-pointer ${selectedId===s.id+"-countdown" ? "ring-1 ring-[#C9A86A] ring-inset" : ""}`}>
                          <div className="text-[10px] font-bold tracking-[0.16em] text-white/50">{String(content.title || "EVENT DIMULAI DALAM")}</div>
                          <div className="mt-3 grid grid-cols-4 gap-2 max-w-[420px] mx-auto">
                            {[["43","HARI"],["12","JAM"],["28","MENIT"],["05","DETIK"]].map(([v,l])=> (
                              <div key={l} className="rounded-xl border border-white/10 bg-white/5 py-3"><div className="text-[22px] font-black text-white">{v}</div><div className="text-[9px] tracking-widest text-white/50">{l}</div></div>
                            ))}
                          </div>
                        </div>
                      )}
                      {s.type==="featured" && (
                        <div className="bg-[#09090b] p-6">
                          <div onClick={(e)=>{e.stopPropagation(); handleSelect("featured-title")}} className={`flex items-center gap-2 mb-3 cursor-pointer p-1 rounded ${selectedId===s.id+"-featured-title" ? "ring-1 ring-[#C9A86A] bg-white/5" : "hover:bg-white/5"}`}><span className="text-[11px] font-bold tracking-widest text-[#C9A86A]">01 — PESERTA</span><span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-white text-[#09090b] font-black">SMP / SMA</span></div>
                          <h3 onClick={(e)=>{e.stopPropagation(); handleSelect("featured-h3")}} className={`text-[18px] font-black text-white cursor-pointer p-1 rounded ${selectedId===s.id+"-featured-h3" ? "ring-1 ring-[#C9A86A] bg-white/5" : "hover:bg-white/5"}`}>{String(content.title || "DUKUNG PELETON FAVORITMU!")}</h3>
                          <p className="text-xs text-white/60 mt-1">{String(content.description || "Beranda urut nomor tampil")}</p>
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[1,2,3,4,5,6].map(i=> (
                              <div key={i} onClick={(e)=>{e.stopPropagation(); handleSelect("team-"+i)}} className={`rounded-xl border p-3 cursor-pointer ${selectedId===s.id+"-team-"+i ? "border-[#C9A86A] bg-[#C9A86A]/10" : "border-white/10 bg-white/5 backdrop-blur hover:border-white/20"}`}>
                                <div className="aspect-[4/3] rounded-lg bg-white/5 grid place-items-center text-white/20 text-xs">Foto #{i} — klik untuk edit ukuran/posisi</div>
                                <div className="mt-2 h-3 w-20 bg-white/10 rounded" /><div className="mt-1 h-3 w-28 bg-white/5 rounded" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {s.type==="podium" && (
                        <div className="bg-[#09090b] p-6 text-center border-y border-white/5">
                          <div className="text-[10px] tracking-[0.16em] text-[#C9A86A] font-bold">HASIL SEMENTARA</div>
                          <h3 className="text-[18px] font-black text-white mt-1">PODIUM PELETON TERFAVORIT</h3>
                          <div className="mt-4 flex items-end justify-center gap-2">
                            {[2,1,3].map(rank=> (
                              <div key={rank} onClick={(e)=>{e.stopPropagation(); handleSelect("podium-"+rank)}} className={`rounded-t-xl border bg-gradient-to-b cursor-pointer ${rank===1?"from-amber-200 via-[#C9A86A] to-[#8C6A2A] h-[140px] w-[90px]":"from-zinc-200 to-zinc-500 h-[110px] w-[80px]"} grid place-items-center text-[#0C0A06] font-black ${selectedId===s.id+"-podium-"+rank ? "ring-2 ring-[#C9A86A]" : ""}`}>{rank}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {s.type==="sponsors" && (
                        <div className="bg-[#09090b] border-y border-white/5 p-6">
                          <div className="text-center text-[11px] tracking-widest text-white/50">DIDUKUNG OLEH</div>
                          <div className="mt-3 flex justify-center gap-3 flex-wrap">
                            {[1,2,3,4].map(i=> <div key={i} onClick={(e)=>{e.stopPropagation(); handleSelect("sponsor-"+i)}} className={`h-12 w-20 rounded-xl border grid place-items-center text-[10px] cursor-pointer ${selectedId===s.id+"-sponsor-"+i ? "border-[#C9A86A] bg-[#C9A86A]/10 text-[#C9A86A]" : "border-white/10 bg-white/5 text-white/30"}`}>Logo</div>)}
                          </div>
                        </div>
                      )}
                      {s.type==="cta" && (
                        <div className="bg-[#C9A86A] p-8 text-center">
                          <h3 onClick={(e)=>{e.stopPropagation(); handleSelect("cta-title")}} className={`text-[18px] font-black cursor-pointer p-1 rounded ${selectedId===s.id+"-cta-title" ? "ring-2 ring-[#0C0A06] bg-white/20" : ""} text-[#0C0A06]`}>{String(content.title || "SIAP MENDUKUNG?")}</h3>
                          <div onClick={(e)=>{e.stopPropagation(); handleSelect("cta-button")}} className={`mt-3 inline-flex rounded-full px-6 py-2 text-xs font-black cursor-pointer ${selectedId===s.id+"-cta-button" ? "ring-2 ring-white bg-white text-[#0C0A06]" : "bg-[#0C0A06] text-white"}`}>{String(content.buttonLabel || "Dukung Sekarang")}</div>
                        </div>
                      )}
                      {s.type==="text_block" && (
                        <div className="bg-white/5 backdrop-blur p-6 border-y border-white/5">
                          <h3 onClick={(e)=>{e.stopPropagation(); handleSelect("text-title")}} className={`text-sm font-black cursor-pointer p-1 rounded ${selectedId===s.id+"-text-title" ? "ring-1 ring-[#C9A86A] bg-white/5 text-white" : "text-white hover:bg-white/5"}`}>{String(content.title || s.title)}</h3>
                          <p onClick={(e)=>{e.stopPropagation(); handleSelect("text-body")}} className={`text-sm mt-2 cursor-pointer p-1 rounded ${selectedId===s.id+"-text-body" ? "ring-1 ring-[#C9A86A] bg-white/5 text-white" : "text-white/60 hover:bg-white/5"}`}>{String(content.text || content.description || "Teks editable — klik untuk ubah di panel kanan. Drag untuk pindah, handle untuk resize.")}</p>
                        </div>
                      )}
                      {s.type==="banner" && (
                        <div className="bg-gradient-to-r from-[#C9A86A] to-[#8C6A2A] p-6 text-center">
                          <div onClick={(e)=>{e.stopPropagation(); handleSelect("banner-title")}} className={`text-sm font-black cursor-pointer p-1 rounded ${selectedId===s.id+"-banner-title" ? "ring-1 ring-white bg-white/20 text-[#0C0A06]" : "text-[#0C0A06] hover:bg-white/10"}`}>{String(content.title || "Banner")}</div>
                          <div className="text-xs text-[#0C0A06]/70">{String(content.text || "")}</div>
                        </div>
                      )}
                      {s.type==="image" && (
                        <div className="bg-white/5 backdrop-blur p-6 text-center">
                          {content.src ? <img onClick={(e)=>{e.stopPropagation(); handleSelect("image-src")}} src={String(content.src)} alt={String(content.alt||"")} className={`mx-auto max-h-[320px] rounded-xl border cursor-pointer ${selectedId===s.id+"-image-src" ? "border-[#C9A86A] ring-2 ring-[#C9A86A]/50" : "border-white/10 hover:border-white/20"}`} /> : <div onClick={(e)=>{e.stopPropagation(); handleSelect("image-src")}} className={`h-[180px] rounded-xl border border-dashed bg-white/5 grid place-items-center text-white/30 text-xs cursor-pointer ${selectedId===s.id+"-image-src" ? "border-[#C9A86A] bg-[#C9A86A]/10" : "border-white/10 hover:border-[#C9A86A]/30"}`}>Image — kosong, klik untuk ganti • Drag untuk pindah</div>}
                        </div>
                      )}
                      {s.type==="divider" && <div onClick={(e)=>{e.stopPropagation(); handleSelect("divider")}} className={`bg-[#09090b] p-4 cursor-pointer ${selectedId===s.id+"-divider" ? "bg-[#C9A86A]/10 ring-1 ring-[#C9A86A] ring-inset" : "hover:bg-white/5"}`}><div className="h-px bg-white/10 w-full" style={{ height: s.settings?.thickness || "1px", background: s.settings?.color || undefined }} /></div>}
                      {!["hero","countdown","featured","podium","sponsors","cta","text_block","banner","image","divider"].includes(s.type) && (
                        <div className="bg-white/5 backdrop-blur p-6 border-y border-white/5">
                          <div className="text-xs font-bold text-white/50">{s.type} • {s.key}</div>
                          <div className="text-sm text-white mt-1">{s.title}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="h-[1px] bg-white/10 w-full" />
              <div className="bg-white/5 backdrop-blur p-3 text-center text-xs text-white/30">End of page • {sections.length} sections • Semua elemen bisa di-drag, di-resize, dihapus, diubah warna/ukuran</div>
              <div className="bg-white/5 backdrop-blur border-t border-white/5 p-2 text-center text-[11px] text-white/20">Footer • LKBB JAVASOMA 2026 — full website preview</div>
            </div>
          </div>
          <div className="mt-3 text-center text-[11px] text-white/30">Preview full website • Klik teks untuk edit • Drag ↕ untuk urutan • Handle sudut untuk resize • Semua halaman (Beranda/Tim/Kompetisi) tersedia di selector atas</div>
        </div>

        {/* Properties */}
        <div className="w-[300px] shrink-0 border-l border-white/10 bg-white/5 backdrop-blur hidden lg:flex flex-col">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-white/60">PROPERTIES</span>
            {selectedSection && <span className="text-[10px] px-2 py-1 rounded-full bg-[#C9A86A]/20 text-[#C9A86A] font-bold">{selectedSection.type}</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {!selectedSection ? (
              <div className="py-12 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-white/5 grid place-items-center text-white/40"><Settings className="h-5 w-5"/></div>
                <div className="mt-3 text-sm font-bold text-white">Pilih element</div>
                <div className="text-xs text-white/50">Klik section di layers atau canvas — semua elemen bisa diklik</div>
              </div>
            ) : isSubElement ? (
              <>
                <div className="rounded-xl bg-[#C9A86A]/10 border border-[#C9A86A]/20 p-3">
                  <div className="text-[11px] font-bold tracking-widest text-[#C9A86A]">ELEMENT TERPILIH</div>
                  <div className="mt-1 text-xs font-black text-white">{String(selectedSubKey)}</div>
                  <div className="text-[11px] text-white/60 truncate">{String(selectedSection.content[selectedSubKey] || "").slice(0,60)}</div>
                  <div className="mt-2 flex gap-1.5">
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/60">Drag untuk pindah</span>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/60">Handle untuk resize</span>
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="text-[11px] font-bold tracking-widest text-white/60 flex items-center gap-1.5"><Type className="h-3 w-3"/> TEXT</div>
                  <div className="mt-2 grid gap-2">
                    <div><label className="text-xs font-bold text-white/70">Content</label>
                      {String(selectedSection.content[selectedSubKey] || "").length > 60 ? (
                        <textarea value={String(selectedSection.content[selectedSubKey] || "")} onChange={e=> updateContentField(selectedSubKey!, e.target.value)} rows={3} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-xs text-white" />
                      ) : (
                        <input value={String(selectedSection.content[selectedSubKey] || "")} onChange={e=> updateContentField(selectedSubKey!, e.target.value)} className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-xs text-white" />
                      )}
                    </div>
                    {(String(selectedSubKey).toLowerCase().includes("image") || String(selectedSection.content[selectedSubKey] || "").startsWith("http")) && (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="flex-1 rounded-full h-8 text-xs" onClick={()=>{
                          const url = prompt("Ganti gambar URL", String(selectedSection.content[selectedSubKey] || ""))
                          if(url!==null) updateContentField(selectedSubKey!, url)
                        }}>Ganti Gambar</Button>
                        <Button size="sm" variant="ghost" className="rounded-full h-8 text-xs" onClick={()=> updateContentField(selectedSubKey!, "")}>Hapus</Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="text-[11px] font-bold tracking-widest text-white/60 flex items-center gap-1.5"><Palette className="h-3 w-3"/> STYLE</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-white/60">Warna</label><input type="color" value={selectedSection.settings?.[selectedSubKey+"Color"] || "#C9A86A"} onChange={e=> updateStyleField(selectedSubKey+"Color", e.target.value)} className="mt-1 w-full h-9 rounded-lg bg-white/5 border border-white/10" /></div>
                    <div><label className="text-xs text-white/60">Ukuran</label><input type="range" min="10" max="72" value={parseInt(String(selectedSection.settings?.[selectedSubKey+"Size"] || "16"))} onChange={e=> updateStyleField(selectedSubKey+"Size", e.target.value+"px")} className="mt-1 w-full" /><span className="text-[10px] text-white/40">{selectedSection.settings?.[selectedSubKey+"Size"] || "16px"}</span></div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="rounded-full h-8 text-xs" onClick={()=> { const v = prompt("Warna background (hex atau transparent)", selectedSection.settings?.[selectedSubKey+"Bg"] || ""); if(v!==null) updateStyleField(selectedSubKey+"Bg", v) }}>Background</Button>
                    <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs text-red-400" onClick={()=> { updateContentField(selectedSubKey!, ""); setSelectedId(selectedSection.id)}}>Hapus Elemen</Button>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full rounded-full border border-white/10 bg-white/5 text-white/70" onClick={()=> setSelectedId(selectedSection.id)}>← Kembali ke Section</Button>
              </>
            ) : (
              <>
                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
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

                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
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

                <div className="rounded-xl bg-white/5 border border-white/10 p-3">
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
      <div className="h-10 border-t border-white/10 bg-white/5 backdrop-blur flex items-center justify-between px-3 shrink-0">
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
