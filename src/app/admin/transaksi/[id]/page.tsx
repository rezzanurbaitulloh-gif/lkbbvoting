import Link from "next/link"
import { Button } from "@/components/ui/button"
export default async function TransaksiDetail({ params }: { params: Promise<{id:string}>}){
  const {id}=await params
  return (
    <div className="p-4 md:p-6 space-y-4">
      <Link href="/admin/transaksi" className="text-xs font-semibold">← Kembali</Link>
      <h1 className="text-[18px] font-black">Transaksi {id}</h1>
      <div className="rounded-[16px] border border-border bg-card p-5 grid gap-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Jumlah</span><span className="font-black">Rp300.000</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Peleton</span><span className="font-bold">SMKN 1 KERTOSONO</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">User</span><span>Reja Saputra • reja@lkbb.id</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Metode</span><span>QRIS</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="rounded-full bg-emerald-500 px-2 py-1 text-xs font-bold text-white">Success</span></div>
        <div className="hairline my-2" />
        <div className="text-xs text-muted-foreground">Dukungan hanya tercatat setelah transaksi Success — sesuai critical logic.</div>
        <div className="flex gap-2 mt-2">
          <Button size="sm" className="rounded-full">Tandai Success</Button>
          <Button size="sm" variant="outline" className="rounded-full">Tandai Failed</Button>
        </div>
      </div>
    </div>
  )
}
