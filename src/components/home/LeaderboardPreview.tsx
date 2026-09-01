import Link from "next/link"
import { getRankedPeletons } from "@/lib/data"
import { ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LeaderboardPreview(){
  const smp = getRankedPeletons("SMP").slice(0,5)
  const sma = getRankedPeletons("SMA").slice(0,5)
  const Row = ({p,i}:{p:any,i:number})=> (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
      <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-black ${i<3 ? "bg-gold text-gold-foreground" : "bg-muted text-muted-foreground"}`}>{i+1}</div>
      <img src={p.image} alt="" className="h-9 w-9 rounded-full object-cover border border-border" />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold leading-tight truncate">{p.name}</div>
        <div className="text-xs text-muted-foreground truncate">{p.school} • {p.city}</div>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-600"><TrendingUp className="h-3.5 w-3.5"/> stabil</div>
    </div>
  )
  return (
    <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <div className="label-gold flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold"/>Klasemen Sementara</div>
          <h2 className="mt-1 text-[20px] font-extrabold tracking-tight">PEREBUTAN TAHTA TERFAVORIT</h2>
          <p className="text-sm text-muted-foreground">Peringkat berdasarkan dukungan terverifikasi. Hanya ranking yang ditampilkan ke publik.</p>
        </div>
        <Link href="/klasemen" className="hidden md:inline-flex"><Button className="rounded-full gap-2">Lihat Klasemen <ArrowRight className="h-4 w-4"/></Button></Link>
      </div>
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="rounded-[16px] border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black">SMP / SEDERAJAT</h3>
            <span className="text-xs text-muted-foreground">Top 5</span>
          </div>
          <div className="mt-3 grid gap-2">
            {smp.map((p,i)=> <Row key={p.id} p={p} i={i} />)}
          </div>
        </div>
        <div className="rounded-[16px] border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black">SMA / SEDERAJAT</h3>
            <span className="text-xs text-muted-foreground">Top 5</span>
          </div>
          <div className="mt-3 grid gap-2">
            {sma.map((p,i)=> <Row key={p.id} p={p} i={i} />)}
          </div>
        </div>
      </div>
      <Link href="/klasemen" className="mt-4 flex md:hidden"><Button variant="outline" className="w-full rounded-full">Lihat Klasemen Lengkap</Button></Link>
    </section>
  )
}
