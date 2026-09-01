import { notFound } from "next/navigation"
import Link from "next/link"
import { peletons } from "@/lib/data"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Share2, MapPin, Users, Trophy, Image as ImageIcon } from "lucide-react"

export function generateStaticParams(){
  return peletons.map(p=> ({ slug: p.slug }))
}

export default async function PeletonDetail({ params }: { params: Promise<{slug:string}> }){
  const { slug } = await params
  const peleton = peletons.find(p=>p.slug===slug)
  if(!peleton) return notFound()
  const rank = [...peletons].filter(p=>p.verified).sort((a,b)=>b.support-a.support).findIndex(p=>p.id===peleton.id)+1

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        {/* Hero */}
        <div className="relative border-b border-border overflow-hidden bg-[#08090B] text-white">
          <div className="absolute inset-0">
            <img src={peleton.cover} alt="" className="h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090B] via-[#08090B]/70 to-transparent" />
          </div>
          <div className="relative mx-auto max-w-[1280px] px-4 md:px-6 py-8 md:py-12">
            <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-end">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border border-white/10 bg-muted shadow-elevated">
                <img src={peleton.image} alt={peleton.name} className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 rounded-full bg-[#0B0C0F] px-3 py-1 text-xs font-black tracking-widest border border-white/10">#{peleton.number}</div>
                <div className="absolute bottom-3 right-3 rounded-full bg-gold px-3 py-1 text-xs font-black text-gold-foreground">Peringkat #{rank}</div>
              </div>
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gold">{peleton.category}</Badge>
                  <Badge variant="outline" className="bg-white/10 border-white/15 text-white">{peleton.city} • {peleton.province}</Badge>
                  {peleton.verified ? <Badge className="bg-emerald-500 text-white border-emerald-500">Terverifikasi</Badge> : <Badge variant="secondary">Menunggu Verifikasi</Badge>}
                </div>
                <h1 className="mt-3 text-[30px] md:text-[40px] font-black tracking-[-0.03em] leading-none text-balance">{peleton.name}</h1>
                <p className="mt-1 text-sm font-medium text-white/70">{peleton.school} • 16 Anggota</p>
                <p className="mt-4 text-sm leading-relaxed text-white/60 text-pretty max-w-2xl">{peleton.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/dukungan?peleton=${peleton.slug}`}><Button size="lg" className="rounded-full px-8 h-[46px]">DUKUNG PELETON INI</Button></Link>
                  <Button variant="outline" size="lg" className="rounded-full bg-white/10 border-white/15 text-white hover:bg-white/15 hover:text-white"><Share2 className="h-4 w-4"/> Bagikan</Button>
                  <Button variant="ghost" size="lg" className="rounded-full bg-white/5 text-white hover:bg-white/10 hover:text-white"><Heart className="h-4 w-4"/> Favorit</Button>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg">
                  {[
                    {l:"Anggota", v:"16"},
                    {l:"Kategori", v:peleton.category},
                    {l:"Asal", v:peleton.city},
                  ].map(item=> (
                    <div key={item.l} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3 text-center">
                      <div className="text-[11px] font-bold tracking-widest text-white/50">{item.l.toUpperCase()}</div>
                      <div className="text-sm font-black text-white">{item.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8 grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Left */}
          <div className="space-y-6">
            <section className="rounded-[16px] border border-border bg-card p-5">
              <h2 className="text-sm font-black tracking-tight flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground"/> Tentang Peleton</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{peleton.description} Peleton ini berlatih secara konsisten dengan menjunjung tinggi nilai disiplin, kekompakan, dan kebanggaan sekolah. Setiap formasi dirancang untuk menampilkan presisi dan keindahan gerakan yang memukau dewan juri dan publik.</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-muted p-3"><div className="label-ceremonial">Sekolah</div><div className="font-semibold">{peleton.school}</div></div>
                <div className="rounded-xl bg-muted p-3"><div className="label-ceremonial">Kota / Provinsi</div><div className="font-semibold">{peleton.city} • {peleton.province}</div></div>
              </div>
            </section>

            <section className="rounded-[16px] border border-border bg-card p-5">
              <h2 className="text-sm font-black tracking-tight">Anggota Peleton — 16 Personel</h2>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {peleton.members.map(m=> (
                  <div key={m.id} className="rounded-xl border border-border overflow-hidden bg-card">
                    <div className="aspect-square overflow-hidden bg-muted"><img src={m.photo} alt={m.name} className="h-full w-full object-cover" /></div>
                    <div className="p-2.5">
                      <div className="text-xs font-bold leading-tight line-clamp-1">{m.name}</div>
                      <div className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-widest ${m.role==="Danton" ? "bg-gold text-gold-foreground" : m.role==="Danru" ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"}`}>{m.role.toUpperCase()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[16px] border border-border bg-card p-5">
              <h2 className="text-sm font-black tracking-tight flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground"/> Galeri</h2>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {peleton.gallery.map(g=> (
                  <div key={g.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
                    <img src={g.url} alt={g.caption} className="h-full w-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 text-[11px] font-medium text-white line-clamp-1 opacity-0 group-hover:opacity-100">{g.caption}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right sticky */}
          <div className="space-y-4 lg:sticky lg:top-[76px] h-fit">
            <div className="rounded-[16px] border border-border bg-card p-5">
              <h3 className="text-sm font-black">Performa</h3>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-muted p-3">
                  <span className="text-sm text-muted-foreground">Peringkat</span>
                  <span className="text-sm font-black">#{rank} / {peletons.filter(p=>p.verified).length}</span>
                </div>
                <div className="rounded-xl border border-[#C9A86A20] bg-[#C9A86A0A] p-3 text-center">
                  <div className="label-gold">Status Kompetisi</div>
                  <div className="mt-1 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">VOTING BERLANGSUNG</div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Dukungan hanya tercatat setelah pembayaran berhasil.</p>
                </div>
                <Link href={`/dukungan?peleton=${peleton.slug}`}><Button className="w-full rounded-full h-[44px]">Dukung Peleton Ini</Button></Link>
                <Button variant="outline" className="w-full rounded-full">Bagikan Profil</Button>
              </div>
            </div>

            <div className="rounded-[16px] border border-border bg-card p-5">
              <h3 className="text-sm font-black">Bagikan</h3>
              <p className="mt-1 text-xs text-muted-foreground">Ajak teman mendukung peleton ini.</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["WhatsApp","Instagram","Salin Link"].map(label=> (
                  <button key={label} className="rounded-xl border border-border bg-muted py-2.5 text-xs font-semibold hover:bg-secondary">{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
