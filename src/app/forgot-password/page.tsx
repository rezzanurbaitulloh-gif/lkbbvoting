"use client"
import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ForgotPage(){
  const [sent,setSent]=useState(false)
  const [email,setEmail]=useState("")
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 grid place-items-center p-4 bg-muted/20">
        <div className="w-full max-w-[420px] rounded-[20px] border border-border bg-card p-6 md:p-8 shadow-soft">
          <h1 className="text-[20px] font-black tracking-tight text-center">Lupa Password</h1>
          <p className="text-sm text-muted-foreground text-center">Masukkan email untuk reset password</p>
          {!sent ? (
            <form onSubmit={e=>{e.preventDefault(); setSent(true)}} className="mt-6 grid gap-3">
              <div><label className="text-xs font-bold">Email</label><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.id" type="email" required /></div>
              <Button type="submit" className="rounded-full h-11 w-full">Kirim Link Reset</Button>
              <Link href="/login" className="text-center text-xs font-semibold hover:underline">← Kembali ke Masuk</Link>
            </form>
          ) : (
            <div className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Link reset terkirim!</div>
              <p className="text-xs text-muted-foreground">Periksa inbox {email} untuk melanjutkan reset password.</p>
              <Link href="/login"><Button variant="outline" className="mt-3 rounded-full w-full">Kembali ke Masuk</Button></Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
