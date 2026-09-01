import { Button } from "@/components/ui/button"
const participants=[
  {name:"Rizky Pratama", email:"rizky@smkn1kts.sch.id", role:"PARTICIPANT", peleton:"SMKN 1 KERTOSONO", status:"Aktif"},
  {name:"Alya Putri", email:"alya@smpn1nganjuk.sch.id", role:"PARTICIPANT", peleton:"SMPN 1 NGANJUK", status:"Aktif"},
  {name:"Bima Saputra", email:"bima@sman1nganjuk.sch.id", role:"PARTICIPANT", peleton:"SMAN 1 NGANJUK", status:"Pending"},
]
export default function Peserta(){
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-[18px] font-black">Manajemen Peserta</h1><Button size="sm" className="rounded-full">Tambah Peserta</Button></div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.4fr_1.2fr_1fr_120px_100px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div>NAMA</div><div>EMAIL</div><div>PELETON</div><div>STATUS</div><div>AKSI</div>
          </div>
          {participants.map(p=> (
            <div key={p.email} className="grid grid-cols-[1.4fr_1.2fr_1fr_120px_100px] gap-2 px-4 py-3 items-center border-b border-border/50 text-sm">
              <div className="font-bold">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.email}</div>
              <div className="text-xs">{p.peleton}</div>
              <div><span className={`rounded-full px-2 py-1 text-xs font-bold ${p.status==="Aktif"?"bg-emerald-500 text-white":"bg-amber-500 text-white"}`}>{p.status}</span></div>
              <div><Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Kelola</Button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
