"use client"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { peletons } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/input"

const my = peletons[0]

export default function ParticipantSub(){
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  const isProfile = path.endsWith('/profile')
  const isMembers = path.endsWith('/members')
  const isGallery = path.endsWith('/gallery')
  const isStats = path.endsWith('/statistics')
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 bg-muted/20">
        <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <Link href="/participant" className="rounded-full border border-border bg-card px-3 py-1">Overview</Link>
            <Link href="/participant/profile" className={`rounded-full px-3 py-1 ${isProfile ? "bg-foreground text-background" : "border border-border bg-card"}`}>Profile</Link>
            <Link href="/participant/members" className={`rounded-full px-3 py-1 ${isMembers ? "bg-foreground text-background" : "border border-border bg-card"}`}>Anggota</Link>
            <Link href="/participant/gallery" className={`rounded-full px-3 py-1 ${isGallery ? "bg-foreground text-background" : "border border-border bg-card"}`}>Galeri</Link>
            <Link href="/participant/statistics" className={`rounded-full px-3 py-1 ${isStats ? "bg-foreground text-background" : "border border-border bg-card"}`}>Statistik</Link>
          </div>

          {isProfile && (
            <div className="mt-4 max-w-2xl rounded-[16px] border border-border bg-card p-6 space-y-4">
              <h1 className="text-[18px] font-black">Edit Profil Peleton</h1>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-bold">Nama Peleton</label><Input defaultValue={my.name} /></div>
                <div><label className="text-xs font-bold">Sekolah</label><Input defaultValue={my.school} /></div>
                <div><label className="text-xs font-bold">Kota</label><Input defaultValue={my.city} /></div>
                <div><label className="text-xs font-bold">Provinsi</label><Input defaultValue={my.province} /></div>
                <div><label className="text-xs font-bold">Kategori</label><Input defaultValue={my.category} /></div>
                <div><label className="text-xs font-bold">Nomor Peleton</label><Input defaultValue={my.number} /></div>
              </div>
              <div><label className="text-xs font-bold">Deskripsi</label><Textarea defaultValue={my.description} rows={4} /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-bold">Logo</label><div className="mt-1 flex gap-2 items-center"><img src={my.image} alt="" className="h-12 w-12 rounded-lg object-cover border"/><Button variant="outline" size="sm" className="rounded-full">Ganti Logo</Button></div></div>
                <div><label className="text-xs font-bold">Cover</label><div className="mt-1 flex gap-2 items-center"><img src={my.cover} alt="" className="h-12 w-20 rounded-lg object-cover border"/><Button variant="outline" size="sm" className="rounded-full">Ganti Cover</Button></div></div>
              </div>
              <Button className="rounded-full w-full h-11">Simpan Perubahan</Button>
            </div>
          )}

          {isMembers && (
            <div className="mt-4 rounded-[16px] border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-[18px] font-black">Kelola Anggota — 16 Personel</h1>
                <Button size="sm" className="rounded-full">Tambah Anggota</Button>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {my.members.map(m=> (
                  <div key={m.id} className="rounded-xl border border-border overflow-hidden">
                    <img src={m.photo} alt="" className="aspect-square w-full object-cover" />
                    <div className="p-3">
                      <div className="text-sm font-bold truncate">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.role}</div>
                      <div className="mt-2 flex gap-1.5">
                        <Button variant="outline" size="sm" className="flex-1 rounded-full text-xs h-7">Edit</Button>
                        <Button variant="ghost" size="sm" className="flex-1 rounded-full text-xs h-7 text-red-600">Hapus</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isGallery && (
            <div className="mt-4 rounded-[16px] border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-[18px] font-black">Galeri Peleton</h1>
                <Button size="sm" className="rounded-full">Upload Foto</Button>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {my.gallery.map(g=> (
                  <div key={g.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
                    <img src={g.url} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center gap-2">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="rounded-full h-7 text-xs">Jadikan Cover</Button>
                        <Button size="sm" variant="destructive" className="rounded-full h-7 text-xs">Hapus</Button>
                      </div>
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 text-[11px] bg-black/60 text-white rounded-full px-2 py-0.5 text-center truncate">{g.caption}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isStats && (
            <div className="mt-4 space-y-4">
              <div className="rounded-[16px] border border-border bg-card p-6">
                <h1 className="text-[18px] font-black">Statistik Dukungan</h1>
                <div className="mt-4 grid md:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-muted p-4 text-center"><div className="text-xs text-muted-foreground">Total Dukungan</div><div className="text-xl font-black">31.200</div><div className="text-xs text-emerald-600">+320 hari ini</div></div>
                  <div className="rounded-xl bg-muted p-4 text-center"><div className="text-xs text-muted-foreground">Peringkat</div><div className="text-xl font-black">#1</div><div className="text-xs text-muted-foreground">dari 11</div></div>
                  <div className="rounded-xl bg-muted p-4 text-center"><div className="text-xs text-muted-foreground">Pertumbuhan Harian</div><div className="text-xl font-black">+2.4%</div></div>
                  <div className="rounded-xl bg-muted p-4 text-center"><div className="text-xs text-muted-foreground">Mingguan</div><div className="text-xl font-black">+14%</div></div>
                </div>
                <div className="mt-6 h-40 rounded-xl border border-dashed border-border bg-muted/30 grid place-items-center text-xs text-muted-foreground">
                  Grafik pertumbuhan — chart restrained (demo)
                </div>
                <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-border p-4">
                    <h4 className="font-bold">Performa 7 Hari</h4>
                    <div className="mt-2 space-y-1.5">
                      {["Sen","Sel","Rab","Kam","Jum","Sab","Min"].map((d,i)=> (
                        <div key={d} className="flex items-center gap-2 text-xs">
                          <span className="w-8">{d}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gold" style={{width: `${40 + i*8}%`}}/></div>
                          <span className="tabular-nums">+{(200+i*40)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <h4 className="font-bold">Ringkasan</h4>
                    <ul className="mt-2 grid gap-1.5 text-xs text-muted-foreground list-disc list-inside">
                      <li>Puncak dukungan hari Sabtu</li>
                      <li>Rata-rata 280 ballot/hari</li>
                      <li>Stabil di peringkat 1 selama 5 hari</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer /><BottomNav />
    </div>
  )
}
