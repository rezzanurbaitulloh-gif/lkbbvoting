"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select } from "@/components/ui/select"
import { createBrowserSupabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/toast"

export default function Users(){
  const { toast } = useToast()
  const [users,setUsers]=useState<any[]>([])
  const [open,setOpen]=useState(false)
  const [editing,setEditing]=useState<any|null>(null)
  const [role,setRole]=useState("USER")
  const load = ()=>{ const s=createBrowserSupabase(); s.from("profiles").select("*").order("created_at",{ascending:false}).then(({data})=> setUsers(data||[])) }
  useEffect(()=>{ load() },[])
  const openEdit = (u:any)=>{ setEditing(u); setRole(u.role); setOpen(true) }
  const handleSave = async ()=>{
    if(!editing) return
    const res = await fetch("/api/admin/crud", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"profiles", id: editing.id, data: { role } }) })
    const j = await res.json()
    if(res.ok){ toast({ title:"Role diperbarui", variant:"success" }); setOpen(false); load() }
    else toast({ title:"Gagal", description:j.error, variant:"error" })
  }
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-[18px] font-black">Manajemen Users</h1><span className="text-xs text-muted-foreground">{users.length} user</span></div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.2fr_1fr_120px_120px_100px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
          <div>NAMA</div><div>EMAIL</div><div>ROLE</div><div>STATUS</div><div>AKSI</div>
        </div>
        {users.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada user.</div> :
          users.map((u:any)=> (
          <div key={u.id} className="grid md:grid-cols-[1.2fr_1fr_120px_120px_100px] gap-2 px-4 py-3 items-center border-b border-border/50 text-sm">
            <div className="font-bold truncate">{u.public_name || "-"}</div>
            <div className="text-muted-foreground text-xs truncate">{u.email}</div>
            <div><span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">{u.role}</span></div>
            <div><span className="rounded-full bg-emerald-500 text-white px-2 py-1 text-xs font-bold">Aktif</span></div>
            <div><Button variant="outline" size="sm" className="rounded-full h-7 text-xs" onClick={()=> openEdit(u)}>Kelola</Button></div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Kelola User</DialogTitle><DialogDescription>{editing?.public_name} — {editing?.email}</DialogDescription></DialogHeader>
          <div className="grid gap-3">
            <div><label className="text-xs font-bold">Role</label><Select value={role} onValueChange={setRole} options={[{value:"USER",label:"User"},{value:"PARTICIPANT",label:"Participant"},{value:"ADMIN",label:"Admin"},{value:"SUPER_ADMIN",label:"Super Admin"}]} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=> setOpen(false)}>Batal</Button><Button onClick={handleSave}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
