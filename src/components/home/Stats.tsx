import { peletons } from "@/lib/data"

export function Stats(){
  const totalPeleton = peletons.filter(p=>p.verified).length
  const totalCity = new Set(peletons.map(p=>p.city)).size
  const totalSupport = peletons.reduce((a,b)=>a+b.support,0)
  const leader = [...peletons].sort((a,b)=>b.support-a.support)[0]
  const stats = [
    { label: "Total Peleton", value: `${totalPeleton}`, sub: "Terverifikasi" },
    { label: "Kota", value: `${totalCity}`, sub: "Jawa Timur" },
    { label: "Total Dukungan", value: `${(totalSupport).toLocaleString("id-ID")}`, sub: "Ballot" },
    { label: "Pemimpin Saat Ini", value: leader.name, sub: `#${leader.number} • ${leader.city}` },
  ]
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
          {stats.map(s=> (
            <div key={s.label} className="px-3 md:px-6 py-6">
              <div className="label-ceremonial">{s.label}</div>
              <div className="mt-2 text-[22px] md:text-[28px] font-black tracking-[-0.03em] leading-none text-foreground line-clamp-1">{s.value}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
