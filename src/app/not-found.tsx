import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"
import { Button } from "@/components/ui/button"
export default function NotFound(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 grid place-items-center p-8 pb-[72px] md:pb-8">
        <div className="text-center max-w-sm">
          <div className="text-[48px] font-black tracking-[-0.04em] leading-none">404</div>
          <div className="mt-2 text-sm font-black">Halaman tidak ditemukan</div>
          <p className="text-sm text-muted-foreground">Halaman yang kamu cari tidak tersedia atau telah dipindahkan.</p>
          <Link href="/"><Button className="mt-4 rounded-full">Kembali ke Beranda</Button></Link>
        </div>
      </main>
      <Footer /><BottomNav />
    </div>
  )
}
