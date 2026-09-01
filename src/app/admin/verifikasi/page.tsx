import { peletons } from "@/lib/data"
import { Button } from "@/components/ui/button"

export default function Verifikasi(){
  const pending = peletons.filter(p=>p.status==="Pending")
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-[18px] font-black">Verifikasi Peserta</h1>
      <p className="text-sm text-muted-foreground">Review dan setujui atau tolak pendaftaran peleton.</p>
      <div className="grid gap-3">
        {pending.length===0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Tidak ada antrian verifikasi — semua sudah diproses. Demo: 1 pending.</div> : null}
        {(pending.length ? pending : peletons.slice(-2)).map(p=> (
          <div key={p.id} className="rounded-[16px] border border-border bg-card p-4 flex gap-4">
            <img src={p.image} alt="" className="h-16 w-16 rounded-xl object-cover border" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black">{p.name} • #{p.number}</div>
              <div className="text-xs text-muted-foreground">{p.school} • {p.city} • {new Date(p.createdAt).toLocaleDateString("id-ID")}</div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700">Setujui</Button>
                <Button size="sm" variant="outline" className="rounded-full text-red-600 border-red-200">Tolak</Button>
                <Button size="sm" variant="ghost" className="rounded-full">Lihat Dokumen</Button>
              </div>
            </div>
            <div className="hidden md:block text-xs text-muted-foreground">Menunggu 2 hari</div>
          </div>
        ))}
      </div>
    </div>
  )
}
