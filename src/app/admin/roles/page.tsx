import { Button } from "@/components/ui/button"
const roles=[
  {name:"Super Admin", users:1, perms:"Semua akses"},
  {name:"Admin", users:3, perms:"Peleton, Transaksi, Klasemen"},
  {name:"Content Manager", users:2, perms:"Berita, Pengumuman, Galeri"},
  {name:"Finance", users:1, perms:"Transaksi, Dukungan"},
  {name:"Participant Manager", users:1, perms:"Verifikasi, Peserta"},
]
export default function Roles(){
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-[18px] font-black">Roles & Permissions</h1><Button size="sm" className="rounded-full">Tambah Role</Button></div>
      <div className="grid gap-3">
        {roles.map(r=> (
          <div key={r.name} className="rounded-[16px] border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-black">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.perms} • {r.users} users</div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">Atur</Button>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">Implementasi role-aware permissions: setiap aksi dicek server-side berdasarkan role.</div>
    </div>
  )
}
