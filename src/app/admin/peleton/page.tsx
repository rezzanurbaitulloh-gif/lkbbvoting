import Link from "next/link"
import { peletons } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AdminPeleton(){
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-black">Manajemen Peleton</h1>
        <Button size="sm" className="rounded-full">Tambah Peleton</Button>
      </div>
      <div className="flex gap-2 text-xs">
        <span className="rounded-full bg-foreground text-background px-3 py-1 font-bold">Semua ({peletons.length})</span>
        <span className="rounded-full border border-border bg-card px-3 py-1">Verified</span>
        <span className="rounded-full border border-border bg-card px-3 py-1">Pending</span>
      </div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_100px_120px] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
          <div>NO</div><div>PELETON</div><div>KATEGORI</div><div>STATUS</div><div className="text-right">AKSI</div>
        </div>
        {peletons.map(p=> (
          <div key={p.id} className="grid md:grid-cols-[60px_1fr_120px_100px_120px] gap-2 px-4 py-3 items-center border-b border-border/50 last:border-0">
            <div className="font-mono text-sm">#{p.number}</div>
            <div className="flex gap-3 min-w-0">
              <img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover border" />
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.school}</div>
              </div>
            </div>
            <div className="text-xs"><Badge variant="outline">{p.category}</Badge></div>
            <div><span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-bold ${p.status==="Verified" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>{p.status}</span></div>
            <div className="flex justify-end gap-1.5">
              <Link href={`/admin/peleton/${p.id}`}><Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Lihat</Button></Link>
              <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
