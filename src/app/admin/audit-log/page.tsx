"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
export default function AuditLog(){
  const [logs,setLogs]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("audit_logs").select("*").order("created_at",{ascending:false}).limit(50).then(({data})=> setLogs(data||[])) },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-[18px] font-black">Audit Log</h1>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[160px_140px_160px_160px_1fr] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div>WAKTU</div><div>USER</div><div>AKSI</div><div>TARGET</div><div>DETAIL</div>
          </div>
          {logs.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada audit log. Aksi sensitif akan tercatat di sini.</div> :
            logs.map((l:any,i:number)=> (
            <div key={l.id || i} className="grid grid-cols-[160px_140px_160px_160px_1fr] gap-2 px-4 py-3 text-xs border-b border-border/50">
              <div className="font-mono">{new Date(l.created_at).toLocaleString("id-ID")}</div><div className="font-bold">{l.user_id?.slice(0,8) || "System"}</div><div>{l.action}</div><div className="truncate">{l.target}</div><div className="text-muted-foreground">{JSON.stringify(l.details||l.details)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
