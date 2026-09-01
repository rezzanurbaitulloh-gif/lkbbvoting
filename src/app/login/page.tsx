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

export default function LoginPage(){
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [err,setErr]=useState("")
  const [loading,setLoading]=useState(false)
  const { login } = useApp()
  const router = useRouter()
  const onSubmit=(e:React.FormEvent)=>{
    e.preventDefault()
    if(!email || !password){ setErr("Email dan password wajib diisi"); return }
    if(!email.includes("@")){ setErr("Format email tidak valid"); return }
    setErr(""); setLoading(true)
    setTimeout(()=>{ login(email); router.push("/profile"); },800)
  }
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 grid place-items-center p-4 bg-muted/20">
        <div className="w-full max-w-[420px] rounded-[20px] border border-border bg-card p-6 md:p-8 shadow-soft">
          <div className="text-center">
            <img src="/assets/brand/lkbb-logo.jpg" alt="LKBB" className="mx-auto h-12 w-12 rounded-xl object-cover border border-border" />
            <h1 className="mt-3 text-[20px] font-black tracking-tight">Masuk ke Akun</h1>
            <p className="text-sm text-muted-foreground">Lanjutkan perjalanan dukunganmu</p>
          </div>
          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <div><label className="text-xs font-bold">Email</label><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.id" type="email" /></div>
            <div><label className="text-xs font-bold">Password</label><Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" /></div>
            {err && <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-600">{err}</div>}
            <Button type="submit" disabled={loading} className="rounded-full h-11 w-full">{loading?"Memproses…":"Masuk"}</Button>
            <div className="flex justify-between text-xs">
              <Link href="/forgot-password" className="font-semibold hover:underline">Lupa password?</Link>
              <Link href="/register" className="font-semibold text-gold hover:underline">Daftar</Link>
            </div>
          </form>
          <div className="hairline my-6" />
          <div className="text-center text-xs text-muted-foreground">Demo: gunakan email apapun & password apapun untuk masuk.</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-full" onClick={()=>{setEmail("user@lkbb.id"); setPassword("password")}}>Isi Demo User</Button>
            <Button variant="outline" className="rounded-full" onClick={()=>{setEmail("admin@lkbb.id"); setPassword("admin")}}>Isi Demo Admin</Button>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
