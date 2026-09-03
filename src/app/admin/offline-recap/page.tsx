"use client"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"
import { Search, Plus, Trash2, X } from "lucide-react"

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

  const supabase = createBrowserSupabase()

  const loadTeams = ()=>{
    supabase.from("peletons").select("id, number, name, category").eq("active", true).order("display_order").then(({data})=> setTeams(data||[]))
  }
  const loadRecent = ()=>{
    fetch("/api/admin/offline-recap").then(r=> r.json()).then(d=> { if(Array.isArray(d)) setRecent(d) }).catch(()=>{})
  }
  useEffect(()=>{ loadTeams(); loadRecent() },[])

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
          <p className="text-xs text-muted-foreground">Tambah ballot offline per tim via popup multi-row. Tercatat di supports (source=offline) + audit_logs.</p>
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
    </div>
  )
}
