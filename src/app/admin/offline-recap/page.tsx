"use client"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"
import { Search, Plus, Trash2, X, Pencil } from "lucide-react"

type Row = {
  id: string
  category: "SMP"|"SMA"|""
  teamId: string
  teamSearch: string
  qty: string
  open: boolean
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string)=>void
  options: {value:string,label:string, category?:string}[]
  placeholder: string
  disabled?: boolean
}){
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find(o=> o.value===value)
  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false)}
    document.addEventListener("mousedown",h); return()=> document.removeEventListener("mousedown",h)
  },[])
  const filtered = options.filter(o=>{
    if(!search) return true
    return o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase())
  })
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={()=> !disabled && setOpen(!open)}
        className={`flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className={selected ? "text-foreground truncate text-left" : "text-muted-foreground truncate"}>{selected?.label || placeholder}</span>
        <Search className="h-3.5 w-3.5 opacity-50 shrink-0 ml-2" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 rounded-lg border border-input px-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={e=> setSearch(e.target.value)}
                placeholder="Ketik untuk cari..."
                className="flex-1 h-8 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {search && <button onClick={()=> setSearch("")} className="p-1"><X className="h-3 w-3"/></button>}
            </div>
          </div>
          <div className="max-h-[180px] overflow-auto">
            {filtered.length===0 ? <div className="p-3 text-xs text-muted-foreground text-center">Tidak ditemukan</div> :
              filtered.map(opt=> (
                <button
                  key={opt.value}
                  type="button"
                  onClick={()=> { onChange(opt.value); setOpen(false); setSearch("") }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors ${value===opt.value ? "bg-muted font-bold" : ""}`}
                >
                  <span className="flex-1 truncate">{opt.label}</span>
                  {value===opt.value && <span className="text-[11px] text-primary">✓</span>}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default function OfflineRecap(){
  const { toast } = useToast()
  const [teams, setTeams] = useState<any[]>([])
  const [recent, setRecent] = useState<any[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [rows, setRows] = useState<Row[]>([{id:"1", category:"", teamId:"", teamSearch:"", qty:"", open:false}])
  const [saving, setSaving]=useState(false)
  // ledger selection + edit
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editTarget, setEditTarget] = useState<any|null>(null)
  const [editSupports, setEditSupports] = useState<string>("")
  const [editNote, setEditNote] = useState<string>("")
  const [editSaving, setEditSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any|null>(null)
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)

  const supabase = createBrowserSupabase()

  const loadTeams = ()=>{
    supabase.from("peletons").select("id, number, name, category").eq("active", true).order("category", {ascending:true}).order("number", {ascending:true}).then(({data})=>{
      const sorted = (data||[]).sort((a:any,b:any)=>{
        if(a.category!==b.category) return a.category.localeCompare(b.category)
        return parseInt(String(a.number).replace(/^0+/, "")||"0") - parseInt(String(b.number).replace(/^0+/, "")||"0")
      })
      setTeams(sorted)
    })
  }
  const loadRecent = ()=>{
    fetch("/api/admin/offline-recap?limit=100").then(r=> r.json()).then(d=> { if(Array.isArray(d)) setRecent(d) }).catch(()=>{})
  }
  useEffect(()=>{ loadTeams(); loadRecent() },[])

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }
  const toggleAll = () => {
    if (selected.size === recent.length && recent.length > 0) setSelected(new Set())
    else setSelected(new Set(recent.map((r:any)=> r.id)))
  }
  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    const ids = Array.from(selected)
    try {
      const res = await fetch(`/api/admin/offline-recap?ids=${ids.join(",")}`, { method: "DELETE" })
      const j = await res.json().catch(()=> ({}))
      if (!res.ok) throw new Error(j.error || "Gagal hapus")
      toast({ title: `${j.deleted ?? ids.length} data offline dihapus`, variant: "success" })
      setSelected(new Set())
      loadRecent()
    } catch (e:any) {
      toast({ title: "Gagal hapus", description: e.message, variant: "error" })
    }
  }
  const handleSingleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/admin/offline-recap?id=${deleteTarget.id}`, { method: "DELETE" })
      const j = await res.json().catch(()=> ({}))
      if (!res.ok) throw new Error(j.error || "Gagal hapus")
      toast({ title: "Data dihapus", description: `#${deleteTarget.peletons?.number} ${deleteTarget.peletons?.name} • ${deleteTarget.supports} ballot`, variant: "success" })
      loadRecent()
    } catch (e:any) {
      toast({ title: "Gagal hapus", description: e.message, variant: "error" })
    }
  }
  const openEdit = (row: any) => {
    setEditTarget(row)
    setEditSupports(String(row.supports ?? ""))
    setEditNote(row.note ?? "")
  }
  const handleEditSave = async () => {
    if (!editTarget) return
    const n = parseInt(editSupports, 10)
    if (!Number.isInteger(n) || n === 0 || n < -10000 || n > 10000) {
      toast({ title: "Jumlah tidak valid", description: "Wajib integer -10000..10000 dan !=0", variant: "error" })
      return
    }
    setEditSaving(true)
    try {
      const res = await fetch("/api/admin/offline-recap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editTarget.id, supports: n, note: editNote || null })
      })
      const j = await res.json().catch(()=> ({}))
      if (!res.ok) throw new Error(j.error || "Gagal ubah")
      toast({ title: "Data diperbarui", variant: "success" })
      setEditTarget(null)
      loadRecent()
    } catch (e:any) {
      toast({ title: "Gagal ubah", description: e.message, variant: "error" })
    } finally { setEditSaving(false) }
  }

  const addRow = ()=>{
    setRows(prev=> [...prev, {id: String(Date.now()+Math.random()), category:"" as any, teamId:"", teamSearch:"", qty:"", open:false}])
  }
  const removeRow = (id:string)=>{
    if(rows.length===1) return
    setRows(prev=> prev.filter(r=> r.id!==id))
  }
  const updateRow = (id:string, patch: Partial<Row>)=>{
    setRows(prev=> prev.map(r=> r.id===id ? {...r, ...patch} : r))
  }

  const handleSave = async ()=>{
    if(saving) return
    // validation
    const validRows = rows.filter(r=> r.teamId && r.qty && parseInt(r.qty)>0)
    if(validRows.length===0){
      toast({title:"Isi minimal 1 tim & jumlah ballot", variant:"error"})
      return
    }
    for(const r of validRows){
      const n = parseInt(r.qty)
      if(isNaN(n) || n<1 || n>10000){
        toast({title:`Jumlah ballot tidak valid untuk baris`, description:`${r.qty} harus 1-10000`, variant:"error"})
        return
      }
    }
    setSaving(true)
    let success = 0
    let failed = 0
    for(const r of validRows){
      try{
        const res = await fetch("/api/admin/offline-recap", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({peletons_id: r.teamId, peleton_id: r.teamId, supports: parseInt(r.qty)})
        })
        if(res.ok) success++
        else failed++
      }catch{ failed++ }
    }
    if(success>0){
      toast({title:`Berhasil`, description:`${success} tim ditambah ballot offline`, variant:"success"})
      setOpenDialog(false)
      setRows([{id:String(Date.now()), category:"", teamId:"", teamSearch:"", qty:"", open:false}])
      loadRecent()
    }
    if(failed>0) toast({title:`${failed} gagal`, variant:"error"})
    setSaving(false)
  }

  const resetAndOpen = ()=>{
    setRows([{id:String(Date.now()), category:"", teamId:"", teamSearch:"", qty:"", open:false}])
    setOpenDialog(true)
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-black">Offline Recap — Auditable</h1>
          
        </div>
        <Button onClick={resetAndOpen} className="rounded-full gap-2 shrink-0">
          <Plus className="h-4 w-4"/> Rekap Ballot
        </Button>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-5 pb-3 border-b border-border shrink-0">
            <DialogTitle>Rekap Ballot Offline</DialogTitle>
            <DialogDescription>Tambah ballot offline per tim. Bisa tambah banyak tim sekaligus via tombol Tambah Tim.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {rows.map((row, idx)=> {
              const teamOptions = teams
                .filter(t=> !row.category || t.category===row.category)
                .map(t=> ({value:t.id, label:`#${t.number} ${t.name} (${t.category})`, category:t.category}))
              return (
                <div key={row.id} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">Tim #{idx+1}</span>
                    {rows.length>1 && (
                      <button onClick={()=> removeRow(row.id)} className="h-7 w-7 grid place-items-center rounded-full hover:bg-red-50 text-red-600">
                        <Trash2 className="h-3.5 w-3.5"/>
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold">Kategori</label>
                    <div className="mt-1">
                      <SearchableSelect
                        value={row.category}
                        onChange={v=> { updateRow(row.id, {category: v as any, teamId:""}); }}
                        options={[{value:"SMA", label:"SMA / Sederajat"}, {value:"SMP", label:"SMP / Sederajat"}]}
                        placeholder="Pilih kategori (SMA/SMP) — ketik untuk cari"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Ketik untuk filter, atau scroll untuk pilih.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold">Pilih Tim</label>
                    <div className="mt-1">
                      <SearchableSelect
                        value={row.teamId}
                        onChange={v=> updateRow(row.id, {teamId: v})}
                        options={teamOptions}
                        placeholder={row.category ? `Pilih tim ${row.category} — ketik nama` : "Pilih kategori dulu, lalu ketik nama tim"}
                        disabled={!row.category && teamOptions.length===teams.length}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">Ketik cepat nama tim, atau scroll mencari. List menyesuaikan kategori.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold">Jumlah Ballot yang Ditambahkan</label>
                    <Input
                      type="number"
                      min={1}
                      max={10000}
                      value={row.qty}
                      onChange={e=> updateRow(row.id, {qty:e.target.value})}
                      placeholder="Contoh: 150"
                      className="mt-1"
                    />
                  </div>
                </div>
              )
            })}
            <Button variant="outline" onClick={addRow} className="w-full rounded-full gap-2 border-dashed">
              <Plus className="h-4 w-4"/> Tambah Tim
            </Button>
          </div>
          <div className="p-4 border-t border-border flex gap-2 justify-end shrink-0 bg-card">
            <Button variant="outline" onClick={()=> setOpenDialog(false)} disabled={saving} className="rounded-full">Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-full min-w-[120px]">
              {saving ? "Memproses..." : "Simpan Semua"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        <div className="p-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-black">Riwayat Offline Terbaru (ledger) — {recent.length} data</h3>
          {selected.size>0 && (
            <Button variant="outline" size="sm" className="rounded-full text-red-600 gap-2" onClick={()=> setBulkDeleteConfirm(true)}>
              <Trash2 className="h-3.5 w-3.5"/> Hapus {selected.size} dipilih
            </Button>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[720px] grid grid-cols-[40px_90px_1fr_90px_130px_120px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-y border-border bg-muted/30">
            <div><input type="checkbox" checked={selected.size===recent.length && recent.length>0} onChange={toggleAll} /></div>
            <div>NO / KAT</div>
            <div>TIM</div>
            <div>BALLOT</div>
            <div>WAKTU</div>
            <div className="text-right">AKSI</div>
          </div>
          {recent.length===0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Belum ada rekap offline.</div>
          ) : recent.map((r:any)=> (
            <div key={r.id} className="min-w-[720px] grid grid-cols-[40px_90px_1fr_90px_130px_120px] gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0 text-sm">
              <div><input type="checkbox" checked={selected.has(r.id)} onChange={()=> toggleSelect(r.id)} /></div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs">#{r.peletons?.number ?? "-"}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{r.peletons?.category ?? "-"}</Badge>
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate text-xs">{r.peletons?.name ?? r.peleton_id?.slice(0,8)}</div>
                <div className="text-[11px] text-muted-foreground truncate">{r.note || "—"}</div>
              </div>
              <div className={`font-black tabular-nums text-xs ${r.supports>0?"text-emerald-600":r.supports<0?"text-red-600":""}`}>{r.supports>0?`+${r.supports}`:r.supports}</div>
              <div className="text-[11px] text-muted-foreground leading-tight">{new Date(r.created_at).toLocaleDateString("id-ID")}<br/><span className="text-[10px]">{new Date(r.created_at).toLocaleTimeString("id-ID",{hour:'2-digit',minute:'2-digit'})}</span></div>
              <div className="flex justify-end gap-1.5">
                <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs gap-1" onClick={()=> openEdit(r)}><Pencil className="h-3 w-3"/>Ubah</Button>
                <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600" onClick={()=> setDeleteTarget(r)}><Trash2 className="h-3 w-3"/>Hapus</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2 p-3">
          {recent.length===0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Belum ada rekap offline.</div>
          ) : recent.map((r:any)=> (
            <div key={r.id} className="rounded-xl border border-border p-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-1" checked={selected.has(r.id)} onChange={()=> toggleSelect(r.id)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black">#{r.peletons?.number ?? "-"} </span>
                    <Badge variant="outline" className="text-[10px]">{r.peletons?.category ?? "-"}</Badge>
                    <span className={`ml-auto font-black text-xs ${r.supports>0?"text-emerald-600":"text-red-600"}`}>{r.supports>0?`+${r.supports}`:r.supports} ballot</span>
                  </div>
                  <div className="text-sm font-bold truncate">{r.peletons?.name ?? r.peleton_id?.slice(0,8)}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.note || "Tanpa catatan"}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString("id-ID")}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Button variant="outline" size="sm" className="w-full rounded-full h-8 text-xs gap-1" onClick={()=> openEdit(r)}><Pencil className="h-3 w-3"/>Ubah</Button>
                <Button variant="outline" size="sm" className="w-full rounded-full h-8 text-xs text-red-600 border-red-200 gap-1" onClick={()=> setDeleteTarget(r)}><Trash2 className="h-3 w-3"/>Hapus</Button>
              </div>
            </div>
          ))}
        </div>

        {recent.length>0 && (
          <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selected.size===recent.length && recent.length>0} onChange={toggleAll} /> Pilih semua ({recent.length})</label>
            {selected.size>0 ? <span className="text-xs font-bold">{selected.size} dipilih</span> : <span className="text-[11px] text-muted-foreground">Centang untuk hapus massal</span>}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o)=> !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Ubah Rekap Offline</DialogTitle>
            <DialogDescription>
              {editTarget ? `#${editTarget.peletons?.number} ${editTarget.peletons?.name} (${editTarget.peletons?.category})` : ""} — perubahan tercatat di audit log.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <label className="text-xs font-bold">Jumlah Ballot *</label>
              <Input type="number" value={editSupports} onChange={e=> setEditSupports(e.target.value)} placeholder="150" className="mt-1" />
              <p className="text-[11px] text-muted-foreground mt-1">Bisa negatif untuk koreksi (mis. -10). Range -10000..10000, 0 tidak boleh.</p>
            </div>
            <div>
              <label className="text-xs font-bold">Catatan (opsional)</label>
              <Input value={editNote} onChange={e=> setEditNote(e.target.value)} placeholder="Koreksi lapangan / revisi juri..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=> setEditTarget(null)} disabled={editSaving} className="rounded-full">Batal</Button>
            <Button onClick={handleEditSave} disabled={editSaving} className="rounded-full min-w-[100px]">{editSaving ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o)=> !o && setDeleteTarget(null)} title="Hapus rekap offline?" description={deleteTarget ? `Yakin hapus #${deleteTarget.peletons?.number} ${deleteTarget.peletons?.name} • ${deleteTarget.supports} ballot? Data tidak bisa dikembalikan, tercatat di audit log.` : ""} onConfirm={handleSingleDelete} />
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm} title={`Hapus ${selected.size} data offline?`} description={`Yakin hapus ${selected.size} data rekap offline terpilih? Tidak bisa dikembalikan, semua tercatat di audit log.`} onConfirm={handleBulkDelete} />
    </div>
  )
}
