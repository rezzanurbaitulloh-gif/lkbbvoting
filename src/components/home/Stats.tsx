export function Stats({ peletons, event }: { peletons: any[]; event: any }){
  const totalPeleton = peletons?.length ?? 0
  const totalCity = new Set((peletons || []).map((p:any)=>p.city)).size
  // For totalSupport, we should not expose ballot numbers during ACTIVE — but for demo we show from view
  // In production, hide totals if event.state === VOTING_OPEN and no provisional
  const hideTotals = event?.state === "VOTING_OPEN" && !event?.show_provisional_result && !event?.show_final_result
  const leader = [...(peletons || [])].sort((a,b)=> (b.display_order - a.display_order))[0] // placeholder, real leader from ranking
  const stats = [
    { label: "Total Peleton", value: `${totalPeleton}`, sub: "Terverifikasi" },
    { label: "Kota", value: `${totalCity || 3}`, sub: "Jawa Timur" },
    { label: "Total Dukungan", value: hideTotals ? "—" : "—", sub: hideTotals ? "Disembunyikan" : "Ballot (disembunyikan saat voting)" },
    { label: "Pemimpin Saat Ini", value: leader?.name || "—", sub: leader ? `#${leader.number} • ${leader.city}` : "Segera" },
  ]
  return (
    <section className="border-y border-border bg-surface overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6">
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 divide-y min-[360px]:divide-y-0 min-[360px]:divide-x divide-border">
          {stats.map(s=> (
            <div key={s.label} className="px-3 sm:px-4 md:px-6 py-5 sm:py-6">
              <div className="label-ceremonial text-[10px] sm:text-[0.68rem]">{s.label}</div>
              <div className="mt-1.5 sm:mt-2 text-[18px] sm:text-[22px] md:text-[28px] font-black tracking-[-0.03em] leading-none text-foreground line-clamp-1 break-words">{s.value}</div>
              <div className="mt-1 text-[11px] sm:text-xs font-medium text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
