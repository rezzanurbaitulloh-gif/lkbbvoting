import { notFound } from "next/navigation"
import { peletons } from "@/lib/data"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function generateStaticParams(){ return peletons.map(p=> ({id: p.id})) }
export default async function Detail({ params }: { params: Promise<{id:string}>}){
  const {id}=await params
  const p=peletons.find(x=>x.id===id)
  if(!p) return notFound()
  return (
    <div className="p-4 md:p-6 space-y-4">
      <Link href="/admin/peleton" className="text-xs font-semibold">← Kembali</Link>
      <h1 className="text-[18px] font-black">{p.name} — Admin View</h1>
      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <img src={p.image} alt="" className="w-full rounded-xl border object-cover aspect-[4/3]" />
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sekolah</span><span className="font-bold">{p.school}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Kota</span><span className="font-bold">{p.city}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Kategori</span><span className="font-bold">{p.category}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`rounded-full px-2 py-1 text-xs font-bold ${p.status==="Verified"?"bg-emerald-500 text-white":"bg-amber-500 text-white"}`}>{p.status}</span></div>
          </div>
          <div className="flex gap-2">
            <Button className="rounded-full flex-1">Verifikasi</Button>
            <Button variant="outline" className="rounded-full flex-1">Tolak</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
