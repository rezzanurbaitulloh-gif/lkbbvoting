import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { news } from "@/lib/data"

export function generateStaticParams(){ return news.map(n=> ({slug: n.slug})) }

export default async function BeritaDetail({ params }: { params: Promise<{slug:string}>}){
  const { slug } = await params
  const item = news.find(n=>n.slug===slug)
  if(!item) return notFound()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="mx-auto max-w-[800px] px-4 md:px-6 py-6">
          <Link href="/berita" className="text-xs font-semibold text-muted-foreground hover:text-foreground">← Kembali ke Berita</Link>
          <div className="mt-4 overflow-hidden rounded-[16px] border border-border">
            <img src={item.image} alt={item.title} className="aspect-[16/9] w-full object-cover" />
          </div>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="rounded-full bg-gold px-2 py-1 font-bold text-gold-foreground">{item.category}</span>
            <span className="text-muted-foreground">{item.date} • {item.author}</span>
          </div>
          <h1 className="mt-3 text-[26px] font-black leading-tight tracking-tight text-balance">{item.title}</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{item.excerpt}</p>
          <div className="hairline my-6" />
          <article className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm leading-relaxed text-muted-foreground">{item.content}</p>
            <p className="text-sm leading-relaxed text-muted-foreground mt-4">Kompetisi LKBB Javasoma The Impression terus berkomitmen untuk menghadirkan pengalaman terbaik bagi peserta dan pendukung. Nantikan update selanjutnya di website resmi dan media sosial kami.</p>
          </article>
          <div className="mt-8 flex gap-2">
            <span className="text-xs font-bold">Bagikan:</span>
            <button className="rounded-full border border-border px-3 py-1 text-xs font-semibold">WhatsApp</button>
            <button className="rounded-full border border-border px-3 py-1 text-xs font-semibold">Salin Link</button>
          </div>
          <div className="mt-8 rounded-[16px] border border-border bg-card p-5">
            <h3 className="text-sm font-black">Berita Lainnya</h3>
            <div className="mt-3 grid gap-2">
              {news.filter(n=>n.slug!==slug).slice(0,2).map(n=> (
                <Link key={n.id} href={`/berita/${n.slug}`} className="flex gap-3 rounded-xl border border-border p-3 hover:bg-muted">
                  <img src={n.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
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
