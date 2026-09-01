import { Button } from "@/components/ui/button"
export default function Users(){
  const users=[
    {name:"Reja Saputra", email:"reja@lkbb.id", role:"ADMIN", status:"Aktif"},
    {name:"Alya Putri", email:"alya@lkbb.id", role:"USER", status:"Aktif"},
    {name:"Budi S", email:"budi@lkbb.id", role:"PARTICIPANT", status:"Aktif"},
    {name:"Siti R", email:"siti@lkbb.id", role:"CONTENT", status:"Suspended"},
  ]
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-[18px] font-black">Manajemen Users</h1><Button size="sm" className="rounded-full">Undang User</Button></div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.2fr_1fr_120px_120px_100px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
          <div>NAMA</div><div>EMAIL</div><div>ROLE</div><div>STATUS</div><div>AKSI</div>
        </div>
        {users.map(u=> (
          <div key={u.email} className="grid md:grid-cols-[1.2fr_1fr_120px_120px_100px] gap-2 px-4 py-3 items-center border-b border-border/50 text-sm">
            <div className="font-bold">{u.name}</div>
            <div className="text-muted-foreground text-xs">{u.email}</div>
            <div><span className="rounded-full bg-secondary px-2 py-1 text-xs font-bold">{u.role}</span></div>
            <div><span className={`rounded-full px-2 py-1 text-xs font-bold ${u.status==="Aktif"?"bg-emerald-500 text-white":"bg-red-500 text-white"}`}>{u.status}</span></div>
            <div><Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Kelola</Button></div>
          </div>
        ))}
      </div>
    </div>
  )
}
