export default function AuditLog(){
  const logs=[
    {time:"2026-08-30 14:32", user:"Admin", action:"Verifikasi Peleton", target:"SMKN 1 KERTOSONO", detail:"Disetujui"},
    {time:"2026-08-30 13:11", user:"Admin", action:"Publish Pengumuman", target:"Voting Dibuka", detail:"Published"},
    {time:"2026-08-29 19:45", user:"Finance", action:"Review Transaksi", target:"TRX-39278", detail:"Failed - timeout"},
    {time:"2026-08-29 18:20", user:"Super Admin", action:"Ubah Role", target:"budi@lkbb.id", detail:"USER → PARTICIPANT"},
    {time:"2026-08-28 09:12", user:"Admin", action:"Ubah Status Kompetisi", target:"Event", detail:"PRE_EVENT → VOTING_ACTIVE"},
  ]
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-[18px] font-black">Audit Log</h1>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[160px_140px_160px_160px_1fr] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div>WAKTU</div><div>USER</div><div>AKSI</div><div>TARGET</div><div>DETAIL</div>
          </div>
          {logs.map((l,i)=> (
            <div key={i} className="grid grid-cols-[160px_140px_160px_160px_1fr] gap-2 px-4 py-3 text-xs border-b border-border/50">
              <div className="font-mono">{l.time}</div><div className="font-bold">{l.user}</div><div>{l.action}</div><div className="truncate">{l.target}</div><div className="text-muted-foreground">{l.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
