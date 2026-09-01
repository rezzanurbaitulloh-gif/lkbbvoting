"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { createBrowserSupabase } from "@/lib/supabase"

export default function BeritaDetail(){
  const params = useParams() as { slug: string }
  const slug = params.slug
  const [item,setItem]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [others,setOthers]=useState<any[]>([])
  useEffect(()=>{
    const s=createBrowserSupabase()
    s.from("news").select("*").eq("slug", slug).eq("published", true).single().then(({data})=> {
      setItem(data); setLoading(false)
      if(data) s.from("news").select("*").neq("slug", slug).eq("published", true).limit(2).then(({data:d})=> setOthers(d||[]))
    })
  },[slug])
  if(loading) return <div className="min-h-screen grid place-items-center p-8 text-sm">Memuat...</div>
  if(!item) return (
    <div className="min-h-screen flex flex-col">
      <Navbar /><main className="flex-1 grid place-items-center p-8"><div className="text-center"><div className="text-sm font-bold">Berita tidak ditemukan</div><Link href="/berita" className="text-xs text-gold">Kembali</Link></div></main><Footer />
    </div>
  )
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="mx-auto max-w-[800px] px-4 md:px-6 py-6">
          <Link href="/berita" className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Kembali ke Berita</Link>
          <div className="mt-4 overflow-hidden rounded-[16px] border border-border">
            <img src={item.image_url || item.image} alt={item.title} className="aspect-[16/9] w-full object-cover" />
          </div>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="rounded-full bg-gold px-2 py-1 font-bold text-gold-foreground">{item.category}</span>
            <span className="text-muted-foreground">{item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : item.date} • {item.author}</span>
          </div>
          <h1 className="mt-3 text-[26px] font-black leading-tight tracking-tight text-balance">{item.title}</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{item.excerpt}</p>
          <div className="hairline my-6" />
          <article className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
          </article>
          <div className="mt-8 rounded-[16px] border border-border bg-card p-5">
            <h3 className="text-sm font-black">Berita Lainnya</h3>
            <div className="mt-3 grid gap-2">
              {others.map((n:any)=> (
                <Link key={n.id} href={`/berita/${n.slug}`} className="flex gap-3 rounded-xl border border-border p-3 hover:bg-muted">
                  <img src={n.image_url || n.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div>
                    <div className="text-sm font-bold line-clamp-1">{n.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{n.excerpt}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
