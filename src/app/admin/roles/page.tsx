import { Button } from "@/components/ui/button"
const roles=[
  {name:"User Biasa", users:"Semua pendaftar", perms:"Melihat tim, memberi dukungan, melihat riwayat sendiri"},
  {name:"Super Admin", users:"Panitia inti", perms:"Mengelola semua data, pengguna, dan pengaturan website"},
]
export default function Roles(){
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><div><h1 className="text-[18px] font-black">Peran Pengguna</h1><p className="text-xs text-muted-foreground">Hanya 2 peran: User Biasa dan Super Admin</p></div></div>
      <div className="grid gap-3">
        {roles.map(r=> (
          <div key={r.name} className="rounded-[16px] border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-black">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.perms} • {r.users}</div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${r.name==="Super Admin" ? "bg-[#C9A86A] text-[#0B0C0F]" : "bg-secondary"}`}>{r.name==="Super Admin" ? "Akses Penuh" : "Terbatas"}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground">Super Admin bisa mengatur semua yang ada di website. User Biasa hanya bisa melihat dan memberi dukungan.</div>
    </div>
  )
}
