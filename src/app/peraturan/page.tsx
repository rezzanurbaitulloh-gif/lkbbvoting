import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { BottomNav } from "@/components/layout/BottomNav"

const sections = [
  { title:"Ketentuan Umum", items:["Peserta adalah siswa aktif SMP/MTs & SMA/MA/SMK se-derajat","Satu peleton terdiri dari 13-16 anggota termasuk Danton (15+1 atau 12+1)","Maksimal 2 pasukan per instansi, homogen atau campuran dalam 1 instansi","Keputusan juri bersifat mutlak dan dapat dipertanggungjawabkan"]},
  { title:"Ketentuan Peserta", items:["Pendaftaran 3 Agustus 2026 s.d. kuota terpenuhi (booking 1 Agustus, DP maksimal 30 Agustus)","Berkas diserahkan saat Technical Meeting 2 Oktober 2026 dan ditutup hari-H sebelum apel","Wajib Technical Meeting 2 Oktober 2026 pukul 13.30 WIB di SMKN 1 Kertosono","Peserta tidak boleh terlambat di DP 1 (absen)"]},
  { title:"Ketentuan Kompetisi", items:["Setiap tim diberikan waktu tampil 10 menit","Gerakan PBB mengacu pada PERPANG TNI No. 58 Tahun 2018","Urutan penampilan PBB → Variasi → Formasi, tidak boleh dibalik","Variasi & Formasi dilarang menggunakan musik dan unsur SARA"]},
  { title:"Ketentuan Dukungan", items:["Dukungan via ballot online Rp3.000 / offline Rp5.000","Dukungan hanya tercatat setelah pembayaran berhasil","Dukungan tidak dapat dikembalikan","Hanya ranking yang ditampilkan ke publik"]},
  { title:"Diskualifikasi", items:["Memalsukan data peserta","Melakukan kecurangan voting/payment","Bersikap tidak sportif kepada juri/peserta lain","Melanggar norma kesopanan"]},
  { title:"Hasil & Pengumuman", items:["Rekapitulasi online + offline oleh panitia","Hasil final dipublikasikan 26 Oktober 2026","Protes diajukan maksimal 1x24 jam setelah pengumuman"]},
]

export default function PeraturanPage(){
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-[72px] md:pb-0">
        <div className="border-b border-white/10 bg-[#09090b] text-white">
          <div className="mx-auto max-w-[1280px] px-3 sm:px-4 md:px-6 py-8">
            <div className="label-gold text-white/60">Regulasi Resmi</div>
            <h1 className="mt-2 text-[30px] font-black tracking-[-0.03em]">PERATURAN KOMPETISI</h1>
          </div>
        </div>
        <div className="mx-auto max-w-[1080px] px-3 sm:px-4 md:px-6 py-8 space-y-4">
          {sections.map(sec=> (
            <div key={sec.title} className="rounded-[16px] border border-white/10 bg-white/5 backdrop-blur p-6">
              <h2 className="text-sm font-black tracking-tight">{sec.title.toUpperCase()}</h2>
              <ul className="mt-3 grid gap-2">
                {sec.items.map((it,i)=> (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rounded-[16px] border border-primary/20 bg-primary/5 p-5 text-center">
            <p className="text-sm font-medium">Aturan lengkap ada di Juknis Resmi.</p>
            <div className="mt-3 flex justify-center gap-2">
              <a href="/juknis/juknis-lkbb-javasoma.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-4 text-xs font-bold hover:bg-primary/20 transition-colors">Lihat Juknis</a>
              <a href="/juknis/juknis-lkbb-javasoma.pdf" download className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-bold text-black hover:opacity-90 transition-opacity">Unduh PDF</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  )
}
