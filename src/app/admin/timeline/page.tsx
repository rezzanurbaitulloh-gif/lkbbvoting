import { Button } from "@/components/ui/button"
export default function Page(){
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-black">Timeline</h1>
          <p className="text-sm text-muted-foreground">Atur tahapan kompetisi</p>
        </div>
        <Button size="sm" className="rounded-full">Tambah Baru</Button>
      </div>
      <div className="rounded-[16px] border border-border bg-card p-4">
        <div className="flex gap-2 text-xs mb-3">
          <span className="rounded-full bg-foreground text-background px-3 py-1">Semua</span>
          <span className="rounded-full border border-border bg-card px-3 py-1">Published</span>
          <span className="rounded-full border border-border bg-card px-3 py-1">Draft</span>
        </div>
        <div className="grid gap-2">
          {[1,2,3].map(i=> (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <div className="text-sm font-bold">Contoh Timeline #{i}</div>
                <div className="text-xs text-muted-foreground">Update 2 jam lalu • Status: Published</div>
              </div>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Edit</Button>
                <Button variant="ghost" size="sm" className="rounded-full h-7 text-xs text-red-600">Hapus</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
        CRUD untuk Timeline — Create, Edit, Publish, Unpublish, Delete, Reorder. Data terhubung ke backend via service abstraction.
      </div>
    </div>
  )
}
