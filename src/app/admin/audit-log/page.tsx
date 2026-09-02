"use client"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"

const AKSI_LABEL: Record<string,string> = {
  transaction_paid: "Pembayaran dukungan berhasil",
  transaction_paid_via_status_check: "Pembayaran dukungan terverifikasi",
  competition_field_update: "Pengaturan lomba diubah",
  competition_settings_update: "Pengaturan lomba diubah",
  offline_recap_add: "Dukungan offline dicatat",
  profiles_create: "Pengguna baru ditambahkan",
  profiles_update: "Data pengguna diperbarui",
  profiles_delete: "Pengguna dihapus",
  peletons_create: "Tim baru ditambahkan",
  peletons_update: "Data tim diperbarui",
  peletons_delete: "Tim dihapus",
  news_create: "Berita ditambahkan",
  news_update: "Berita diperbarui",
  news_delete: "Berita dihapus",
  announcements_create: "Pengumuman ditambahkan",
  announcements_update: "Pengumuman diperbarui",
  announcements_delete: "Pengumuman dihapus",
  timeline_stages_create: "Jadwal ditambahkan",
  timeline_stages_update: "Jadwal diperbarui",
  timeline_stages_delete: "Jadwal dihapus",
  judges_create: "Juri ditambahkan",
  judges_update: "Data juri diperbarui",
  judges_delete: "Juri dihapus",
  sponsors_create: "Sponsor ditambahkan",
  sponsors_update: "Data sponsor diperbarui",
  sponsors_delete: "Sponsor dihapus",
  faqs_create: "Tanya jawab ditambahkan",
  faqs_update: "Tanya jawab diperbarui",
  faqs_delete: "Tanya jawab dihapus",
  password_update: "Kata sandi pengguna diubah",
  sponsors: "Sponsor",
}

function humanAksi(action:string){
  return AKSI_LABEL[action] || action.replace(/_/g," ")
}

function humanDetail(log:any){
  const d = log.details || {}
  const a = log.action
  if(a?.startsWith("transaction_paid")){
    const jml = d.supports ? `${Number(d.supports).toLocaleString("id-ID")} dukungan` : ""
    const nominal = d.amount ? ` senilai Rp${Number(d.amount).toLocaleString("id-ID")}` : ""
    if(jml || nominal) return `Dukungan masuk: ${jml}${nominal ? ` (${nominal})` : ""}`.trim()
    return "Dukungan berhasil dicatat"
  }
  if(a==="competition_field_update" || a==="competition_settings_update"){
    if(d.field==="state"){
      const map:Record<string,string> = {
        NOT_STARTED:"Belum dimulai",
        VOTING_OPEN:"Masa dukungan dibuka",
        ACTIVE:"Masa dukungan dibuka",
        VOTING_CLOSED:"Masa dukungan ditutup",
        RESULT_VERIFICATION:"Verifikasi hasil",
        RESULT_PUBLISHED:"Hasil dipublikasikan",
        COMPLETED:"Selesai",
      }
      return `Status lomba diubah menjadi "${map[d.value]||d.value}"`
    }
    if(d.field==="show_provisional_result" || d.field==="show_final_result"){
      return d.value ? "Hasil ditampilkan di website" : "Hasil disembunyikan"
    }
    return "Pengaturan lomba diperbarui"
  }
  if(a==="offline_recap_add"){
    const jml = d.supports ? `${d.supports>0?"+":""}${d.supports} dukungan offline` : "dukungan offline"
    const catatan = d.note ? ` — catatan: ${d.note}` : ""
    return `${jml}${catatan}`
  }
  if(a?.includes("profiles")){
    if(d.role) return `Peran diubah menjadi ${d.role==="SUPER_ADMIN"?"Super Admin":"User Biasa"}`
    return "Data pengguna diperbarui"
  }
  if(a?.includes("peletons")){
    if(d.name) return `Tim "${d.name}"`
    return "Data tim diperbarui"
  }
  if(a?.includes("news") && d.title) return `"${d.title}"`
  if(a?.includes("announcements") && d.title) return `"${d.title}"`
  if(a?.includes("timeline") && d.title) return `"${d.title}"`
  if(a?.includes("judges") && d.name) return `Juri "${d.name}"`
  if(a?.includes("sponsors") && d.name) return `Sponsor "${d.name}"`
  if(a?.includes("faqs") && d.question) return `"${d.question.slice(0,60)}"`
  return d.note || d.title || d.name || "-"
}

export default function AuditLog(){
  const [logs,setLogs]=useState<any[]>([])
  const [users,setUsers]=useState<Record<string,string>>({})
  useEffect(()=>{
    const s=createBrowserSupabase();
    s.from("audit_logs").select("*").order("created_at",{ascending:false}).limit(50).then(({data})=> setLogs(data||[]))
    s.from("profiles").select("id,public_name,email").then(({data})=>{
      const m:Record<string,string> = {}
      ;(data||[]).forEach((u:any)=> m[u.id]=u.public_name || u.email?.split("@")[0] || "Pengguna")
      setUsers(m)
    })
  },[])
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-[18px] font-black">Riwayat Aktivitas</h1>
        <p className="text-xs text-muted-foreground">Semua perubahan penting tercatat otomatis untuk transparansi.</p>
      </div>
      <div className="rounded-[16px] border border-border bg-card overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[600px] grid grid-cols-[140px_120px_180px_1fr] gap-2 px-4 py-3 text-[11px] font-bold tracking-widest text-muted-foreground border-b border-border bg-muted/30">
            <div>WAKTU</div><div>PENGGUNA</div><div>KEJADIAN</div><div>RINCIAN</div>
          </div>
          {logs.length===0 ? <div className="p-8 text-center text-sm text-muted-foreground">Belum ada aktivitas.</div> :
            logs.map((l:any,i:number)=> (
            <div key={l.id || i} className="min-w-[600px] grid grid-cols-[140px_120px_180px_1fr] gap-3 px-4 py-3 text-xs border-b border-border/50 items-start">
              <div className="tabular-nums text-muted-foreground">{new Date(l.created_at).toLocaleString("id-ID",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
              <div className="font-bold truncate">{l.user_id ? (users[l.user_id] || "Pengguna") : "Sistem"}</div>
              <div className="font-medium">{humanAksi(l.action)}</div>
              <div className="text-muted-foreground leading-relaxed line-clamp-2">{humanDetail(l)}</div>
            </div>
          ))}
        </div>
        {/* Mobile */}
        <div className="md:hidden space-y-2 p-3">
          {logs.length===0 ? <div className="p-6 text-center text-sm text-muted-foreground">Belum ada aktivitas.</div> :
            logs.map((l:any,i:number)=> (
            <div key={l.id || i} className="rounded-xl border border-border p-3 flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] tabular-nums text-muted-foreground">{new Date(l.created_at).toLocaleDateString("id-ID",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                <span className="text-[11px] font-bold">{l.user_id ? (users[l.user_id] || "Pengguna") : "Sistem"}</span>
              </div>
              <div className="text-sm font-bold">{humanAksi(l.action)}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{humanDetail(l)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
