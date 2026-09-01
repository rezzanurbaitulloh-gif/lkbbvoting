"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/store"

export default function RegisterPage(){
  const [name,setName]=useState("")
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [err,setErr]=useState("")
  const [loading,setLoading]=useState(false)
  const { login } = useApp()
  const router=useRouter()
  const onSubmit=(e:React.FormEvent)=>{
    e.preventDefault()
    if(!name || !email || !password){ setErr("Semua field wajib diisi"); return}
    if(password.length<6){ setErr("Password minimal 6 karakter"); return}
    setErr(""); setLoading(true)
    setTimeout(()=>{ login(email); router.push("/profile"); },800)
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 grid place-items-center p-4 bg-muted/20">
        <div className="w-full max-w-[420px] rounded-[20px] border border-border bg-card p-6 md:p-8 shadow-soft">
          <h1 className="text-[20px] font-black tracking-tight text-center">Buat Akun Baru</h1>
          <p className="text-sm text-muted-foreground text-center">Dukung peleton favoritmu sekarang</p>
          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <div><label className="text-xs font-bold">Nama Lengkap</label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama kamu" /></div>
            <div><label className="text-xs font-bold">Email</label><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.id" type="email" /></div>
            <div><label className="text-xs font-bold">Password</label><Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimal 6 karakter" type="password" /></div>
            {err && <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-600">{err}</div>}
            <Button type="submit" disabled={loading} className="rounded-full h-11 w-full">{loading?"Mendaftar…":"Daftar"}</Button>
            <div className="text-center text-xs">Sudah punya akun? <Link href="/login" className="font-bold text-gold hover:underline">Masuk</Link></div>
          </form>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
