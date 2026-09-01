import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
export default function Settings(){
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl">
      <h1 className="text-[18px] font-black">Pengaturan Kompetisi</h1>
      {[
        {title:"Kompetisi", fields:["Nama Kompetisi","Tagline","Tanggal Pelaksanaan"]},
        {title:"Voting", fields:["Harga Online","Harga Offline","Batas Waktu Pembayaran"]},
        {title:"Pembayaran", fields:["Provider","Mode","Webhook"]},
        {title:"Brand", fields:["Logo LKBB","Logo Paskibra","Poster"]},
      ].map(sec=> (
        <div key={sec.title} className="rounded-[16px] border border-border bg-card p-5">
          <h3 className="text-sm font-black">{sec.title}</h3>
          <div className="mt-3 grid gap-3">
            {sec.fields.map(f=> (
              <div key={f}><label className="text-xs font-bold">{f}</label><Input placeholder={f} defaultValue={f.includes("Harga")?"3000": f.includes("Nama")?"LKBB JAVASOMA":""} /></div>
            ))}
            <Button size="sm" className="rounded-full w-fit">Simpan {sec.title}</Button>
          </div>
        </div>
      ))}
    </div>
  )
}
