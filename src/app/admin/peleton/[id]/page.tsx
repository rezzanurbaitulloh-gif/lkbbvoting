"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createBrowserSupabase } from "@/lib/supabase"

export default function Detail(){
  const params = useParams() as { id: string }
  const id = params.id
  const [p,setP]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("peletons").select("*").eq("id", id).single().then(({data})=> { setP(data); setLoading(false) }) },[id])
  if(loading) return <div className="p-8 text-center text-sm">Memuat...</div>
  if(!p) return <div className="p-8 text-center"><Link href="/admin/peleton" className="text-xs font-semibold">← Kembali</Link><div className="mt-4 text-sm font-bold">Peleton tidak ditemukan</div></div>
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
      <Link href="/admin/peleton" className="text-xs font-semibold">← Kembali</Link>
      <h1 className="text-[18px] font-black">{p.name} — Admin View</h1>
      <div className="grid lg:grid-cols-[320px_1fr] gap-4">
        <img src={p.image_url || p.image} alt="" className="w-full rounded-xl border object-cover aspect-[4/3]" />
        <div className="rounded-[16px] border border-border bg-card p-5 space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sekolah</span><span className="font-bold">{p.school}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Kota</span><span className="font-bold">{p.city}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Kategori</span><span className="font-bold">{p.category}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`rounded-full px-2 py-1 text-xs font-bold ${p.status==="Verified"?"bg-emerald-500 text-white":"bg-amber-500 text-white"}`}>{p.status}</span></div>
          </div>
          <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">Peleton ini otomatis terverifikasi — tidak perlu aksi verifikasi lagi.</div>
          <Link href="/admin/peleton"><Button variant="outline" className="rounded-full w-full">Kembali ke Daftar</Button></Link>
        </div>
      </div>
    </div>
  )
}
