import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Button } from "@/components/ui/button"

export default function MembersRemoved(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0 bg-muted/20">
        <div className="mx-auto max-w-[640px] px-4 md:px-6 py-12">
          <div className="rounded-[16px] border border-amber-500/20 bg-amber-500/10 p-6 text-center">
            <h1 className="text-[18px] font-black">Fitur Anggota Dihapus</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Sesuai spec §8, manajemen anggota individual telah dihapus. Peleton hanya membutuhkan <b>1 foto tim + 1 logo</b>. Tidak perlu upload anggota satu per satu.</p>
            <div className="mt-4 flex gap-2 justify-center">
              <Link href="/participant/profile"><Button className="rounded-full">Kelola Profil (7 field)</Button></Link>
              <Link href="/participant"><Button variant="outline" className="rounded-full">Kembali ke Overview</Button></Link>
            </div>
          </div>
        </div>
      </main>
      <Footer /><BottomNav />
    </div>
  )
}
