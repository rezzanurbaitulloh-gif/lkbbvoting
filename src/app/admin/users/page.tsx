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
  const [newPassword,setNewPassword]=useState("")
  const [showPass,setShowPass]=useState(false)
  const [saving,setSaving]=useState(false)
  const [selected,setSelected]=useState<Set<string>>(new Set())
  const load = ()=>{ const s=createBrowserSupabase(); s.from("profiles").select("*").order("created_at",{ascending:false}).then(({data})=> setUsers(data||[])) }
  useEffect(()=>{ load() },[])
  const toggleSelect = (id:string)=>{ const n=new Set(selected); if(n.has(id)) n.delete(id); else n.add(id); setSelected(n) }
  const toggleAll = ()=>{ if(selected.size===users.length) setSelected(new Set()); else setSelected(new Set(users.map((u:any)=>u.id))) }
  const handleBulkDelete = async ()=>{ if(selected.size===0) return; for(const id of selected){ await fetch(`/api/admin/crud?table=profiles&id=${id}`, { method:"DELETE" }) } ; toast({ title: `${selected.size} pengguna dihapus`, variant:"success"}); setSelected(new Set()); load() }
  const openEdit = (u:any)=>{ setEditing(u); setRole(u.role==="SUPER_ADMIN" ? "SUPER_ADMIN" : "USER"); setNewPassword(""); setShowPass(false); setOpen(true) }
  const handleSave = async ()=>{ if(saving) return; setSaving(true);
    if(!editing) return
    // update role via crud
    let res = await fetch("/api/admin/crud", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ table:"profiles", id: editing.id, data: { role } }) })
    let j = await res.json()
    if(!res.ok){ toast({ title:"Gagal", description:j.error, variant:"error" }); setSaving(false); return }
    // if password provided, update via admin api
    if(newPassword){
      if(newPassword.length<6){ toast({ title:"Kata sandi minimal 6 karakter", variant:"error"}); return }
      res = await fetch("/api/admin/users/password", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ userId: editing.id, newPassword }) })
      j = await res.json()
      if(!res.ok){ toast({ title:"Gagal ubah kata sandi", description:j.error, variant:"error"}); setSaving(false); return }
    }
    toast({ title:"Pengguna diperbarui", variant:"success" }); setOpen(false); load(); setSaving(false)
  }
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-[18px] font-black">Kelola Pengguna</h1><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{users.length} orang</span>{selected.size>0 && <Button variant="outline" size="sm" className="rounded-full text-red-600" onClick={handleBulkDelete}>Hapus {selected.size} dipilih</Button>}</div></div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[40px_1.2fr_1fr_120px_120px_100px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
          <div><input type="checkbox" checked={selected.size===users.length && users.length>0} onChange={toggleAll} /></div><div>NAMA</div><div>EMAIL</div><div>PERAN</div><div>STATUS</div><div>AKSI</div>
        </div>
        {users.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada pengguna.</div> :
          users.map((u:any)=> (
          <div key={u.id} className="grid md:grid-cols-[40px_1.2fr_1fr_120px_120px_100px] gap-2 px-4 py-3 items-center border-b border-border/50 text-sm">
            <div className="hidden md:block"><input type="checkbox" checked={selected.has(u.id)} onChange={()=> toggleSelect(u.id)} /></div>
            <div className="font-bold truncate flex items-center gap-2"><input type="checkbox" className="md:hidden" checked={selected.has(u.id)} onChange={()=> toggleSelect(u.id)} />{u.public_name || "-"}</div>
            <div className="text-muted-foreground text-xs truncate">{u.email}</div>
            <div><span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">{u.role==="SUPER_ADMIN" ? "Super Admin" : "User Biasa"}</span></div>
            <div><span className="rounded-full bg-emerald-500 text-white px-2 py-1 text-xs font-bold">Aktif</span></div>
            <div><Button variant="outline" size="sm" className="rounded-full h-7 text-xs" onClick={()=> openEdit(u)}>Kelola</Button></div>
          </div>
        ))}
        {users.length>0 && (
          <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={selected.size===users.length && users.length>0} onChange={toggleAll} /> Pilih semua ({users.length})</label>
            {selected.size>0 && <span className="text-xs font-bold">{selected.size} dipilih</span>}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader><DialogTitle>Kelola Pengguna</DialogTitle><DialogDescription>{editing?.public_name} — {editing?.email}</DialogDescription></DialogHeader>
          <div className="grid gap-3">
            <div><label className="text-xs font-bold">Peran Pengguna</label><Select value={role} onValueChange={setRole} options={[{value:"USER",label:"User Biasa"},{value:"SUPER_ADMIN",label:"Super Admin — akses penuh"}]} /></div>
            <div>
              <label className="text-xs font-bold">Kata Sandi Baru (opsional)</label>
              <div className="flex gap-2">
                <input type={showPass ? "text" : "password"} value={newPassword} onChange={e=> setNewPassword(e.target.value)} placeholder="Kosongkan jika tidak diubah" className="flex-1 h-10 rounded-xl border border-input px-3 text-sm" />
                <Button variant="outline" size="sm" onClick={()=> setShowPass(!showPass)}>{showPass ? "Sembunyikan" : "Lihat"}</Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Demi keamanan, kata sandi lama tidak bisa dilihat. Masukkan kata sandi baru jika ingin mengubah.</p>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=> setOpen(false)}>Batal</Button><Button onClick={handleSave} disabled={saving}>{saving ? "Memproses..." : "Simpan"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
