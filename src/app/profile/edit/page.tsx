"use client"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { useApp } from "@/lib/store"
import { useEffect, useState } from "react"
import { createBrowserSupabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function SubProfile(){
  const { currentUser, favorites } = useApp()
  const [transactions,setTransactions]=useState<any[]>([])
  useEffect(()=>{ if(currentUser) fetch("/api/transactions").then(r=>r.json()).then(d=> setTransactions(Array.isArray(d)? d : [])) },[currentUser])
  const [allPeletons,setAllPeletons]=useState<any[]>([])
  useEffect(()=>{ const s=createBrowserSupabase(); s.from("peletons").select("*").eq("verified", true).eq("active", true).then(({data})=> setAllPeletons(data||[])) },[])
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const isEdit = path.includes('/edit')
  const isFav = path.includes('/favorit')
  const isDuk = path.includes('/dukungan')
  const isNotif = path.includes('/notifikasi')
  const [avatarUrl, setAvatarUrl]=useState<string | null>((currentUser as any)?.avatar_url || null)
  const [uploadingAvatar, setUploadingAvatar]=useState(false)
  const [savingProfile, setSavingProfile]=useState(false)
  const [nameVal, setNameVal]=useState(currentUser?.name || "")
  const [phoneVal, setPhoneVal]=useState("")
  useEffect(()=>{ setAvatarUrl((currentUser as any)?.avatar_url || null); setNameVal(currentUser?.name || "") },[currentUser?.id])

  if(!currentUser){
    return (<div className="min-h-screen flex flex-col"><Navbar/><main className="flex-1 grid place-items-center p-8"><div className="text-center"><p>Silakan masuk terlebih dahulu</p><Link href="/login"><Button className="mt-3 rounded-full">Masuk</Button></Link></div></main><Footer/><BottomNav/></div>)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="mx-auto max-w-[1080px] px-3 sm:px-4 md:px-6 py-6">
          <Link href="/profile" className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Kembali ke Profil</Link>
          <h1 className="mt-2 text-[22px] font-black tracking-tight">
            {isEdit ? "Edit Profil" : isFav ? "Peleton Favorit" : isDuk ? "Riwayat Dukungan" : "Notifikasi"}
          </h1>

          {isEdit && (
            <div className="mt-4 max-w-lg rounded-[16px] border border-border bg-card p-6 grid gap-4">
              <div className="flex flex-col items-center gap-3">
                <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-border bg-muted grid place-items-center">
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <span className="text-xl font-black">{currentUser.name.slice(0,2).toUpperCase()}</span>}
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold cursor-pointer hover:bg-muted">
                  <input type="file" accept="image/*" className="hidden" onChange={async e=>{
                    const file=e.target.files?.[0]; if(!file || !currentUser) return
                    setUploadingAvatar(true)
                    try{
                      const sup=createBrowserSupabase()
                      const path=`avatars/${currentUser.id}-${Date.now()}-${file.name}`
                      const { error } = await sup.storage.from("avatars").upload(path, file, { upsert: true })
                      if(error) throw error
                      const { data } = sup.storage.from("avatars").getPublicUrl(path)
                      const url = data.publicUrl
                      setAvatarUrl(url)
                      // update profile immediately
                      await sup.from("profiles").update({ avatar_url: url }).eq("id", currentUser.id)
                      // also update local store if available
                      try{ localStorage.setItem("lkbb-avatar-url", url) }catch{}
                    }catch(err:any){ alert(err.message || "Gagal upload") }
                    finally{ setUploadingAvatar(false) }
                  }} />
                  {uploadingAvatar ? "Mengunggah..." : "Ganti Foto Profil"}
                </label>
                <p className="text-[11px] text-muted-foreground">Foto profil akan tampil di notifikasi transaksi ke semua user.</p>
              </div>
              <div><label className="text-xs font-bold">Nama</label><Input value={nameVal} onChange={e=> setNameVal(e.target.value)} /></div>
              <div><label className="text-xs font-bold">Email</label><Input value={currentUser.email} disabled className="opacity-60" /></div>
              <div><label className="text-xs font-bold">No. HP</label><Input value={phoneVal} onChange={e=> setPhoneVal(e.target.value)} placeholder="08xx-xxxx-xxxx" /></div>
              <Button disabled={savingProfile} className="rounded-full h-11" onClick={async ()=>{
                if(savingProfile) return
                setSavingProfile(true)
                try{
                  const sup=createBrowserSupabase()
                  const updates: any = {}
                  if(nameVal && nameVal!==currentUser.name) updates.public_name = nameVal
                  if(avatarUrl) updates.avatar_url = avatarUrl
                  if(Object.keys(updates).length>0){
                    const { error } = await sup.from("profiles").update(updates).eq("id", currentUser.id)
                    if(error) throw error
                    alert("Profil disimpan")
                    window.location.reload()
                  } else {
                    alert("Tidak ada perubahan")
                  }
                }catch(err:any){ alert(err.message || "Gagal simpan") }
                finally{ setSavingProfile(false) }
              }}>{savingProfile ? "Memproses..." : "Simpan Perubahan"}</Button>
            </div>
          )}

          {isFav && (
            <div className="mt-4">
              {favorites.length===0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada peleton favorit.</div> :
                <div className="grid sm:grid-cols-2 gap-3">
                  {allPeletons.filter(p=> favorites.includes(p.id)).map(p=> (
                    <div key={p.id} className="flex gap-3 rounded-xl border border-border bg-card p-3">
                      <img src={p.image_url || p.image} alt="" className="h-14 w-14 rounded-lg object-cover"/>
                      <div><div className="text-sm font-bold">{p.name}</div><div className="text-xs text-muted-foreground">{p.school}</div><Link href={`/peleton/${p.slug}`} className="text-xs font-bold text-gold">Lihat →</Link></div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {isDuk && (
            <div className="mt-4 space-y-2">
              {transactions.length===0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Belum ada transaksi. Transaksi dari DB akan muncul di sini dan di dashboard.</div> :
                transactions.map((tx:any)=> (
                  <div key={tx.id} className="rounded-xl border border-border bg-card p-4 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold">{tx.peletons?.name || tx.peletonName || tx.peleton_id}</div>
                      <div className="text-xs text-muted-foreground">{new Date(tx.created_at || tx.date).toLocaleString("id-ID")} • {tx.supports} ballot</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black">Rp{(tx.amount || 0).toLocaleString("id-ID")}</div>
                      <div className="text-xs font-bold text-emerald-600">{tx.status}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {isNotif && (
            <div className="mt-4 space-y-2">
              {[
                {t:"Dukungan berhasil", d:"Dukungan 50 ballot untuk SMKN 1 KERTOSONO berhasil tercatat", time:"2 jam lalu"},
                {t:"Voting dibuka", d:"Voting peleton terfavorit telah dibuka", time:"1 hari lalu"},
                {t:"Pengumuman", d:"Technical meeting 3 Oktober 2026 wajib hadir", time:"3 hari lalu"},
              ].map((n,i)=> (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <div className="text-sm font-bold">{n.t}</div>
                  <div className="text-sm text-muted-foreground">{n.d}</div>
                  <div className="text-xs text-muted-foreground">{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer /><BottomNav />
    </div>
  )
}
