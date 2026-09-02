import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"

export default function TentangPage(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-border bg-[#08090B] text-white">
          <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 py-8">
            <div className="label-gold text-white/60">Tentang Kami</div>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.03em]">TENTANG LKBB</h1>
          </div>
        </div>
        <div className="mx-auto max-w-[1080px] px-3 sm:px-4 md:px-6 py-8 space-y-6">
          <div className="rounded-[16px] border border-border bg-card p-6 grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
            <div>
              <h2 className="text-[20px] font-black tracking-tight">Siapa Kami</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">Paskibra SMKN 1 Kertosono — Satria Cengkara — adalah penyelenggara LKBB Javasoma The Impression. Kami berdedikasi untuk memajukan tradisi baris-berbaris sebagai wujud disiplin, kebersamaan, dan kebanggaan generasi muda Jawa Timur.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3"><div className="label-ceremonial">Visi</div><div className="text-sm leading-relaxed">Menjadi wadah kompetisi PBB paling prestisius dan inspiratif di Jawa Timur.</div></div>
                <div className="rounded-xl bg-muted p-3"><div className="label-ceremonial">Misi</div><div className="text-sm leading-relaxed">Membangun disiplin, kekompakan, dan karakter generasi muda melalui PBB.</div></div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <img src="/assets/brand/paskibra-logo.jpg" alt="Paskibra" className="h-28 w-28 rounded-2xl object-cover border border-border" />
              <img src="/assets/brand/school-logo.jpg" alt="SMK" className="h-28 w-28 rounded-2xl object-cover border border-border" />
            </div>
          </div>

          <div className="rounded-[16px] border border-border bg-card p-6">
            <h3 className="text-sm font-black">Tujuan Kompetisi</h3>
            <ul className="mt-3 grid gap-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Menumbuhkan kedisiplinan dan kekompakan pelajar</li>
              <li>Menjadi ajang silaturahmi antar sekolah se-Jawa Timur</li>
              <li>Mengembangkan kreativitas variasi dan formasi</li>
              <li>Melestarikan nilai budaya melalui Astra Dharma Hayuning Budaya</li>
            </ul>
          </div>

          <div className="rounded-[16px] border border-border bg-card p-6">
            <h3 className="text-sm font-black">Kontak Penyelenggara</h3>
            <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
              <div>Alamat: SMK Negeri 1 Kertosono, Nganjuk, Jawa Timur</div>
              <div>Email: info@lkbb-event.id</div>
              <div>WhatsApp: 0812-3456-7890</div>
              <div>Instagram: @lkbb_event</div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
