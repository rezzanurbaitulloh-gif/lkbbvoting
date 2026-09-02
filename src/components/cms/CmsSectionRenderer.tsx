import Link from "next/link"
import { Button } from "@/components/ui/button"

type Section = {
  id: string
  key: string
  title: string
  type: string
  is_visible: boolean
  sort_order: number
  settings: Record<string, any>
  content: Record<string, any>
}

export function CmsSectionRenderer({ section }: { section: Section }){
  const c = section.content || {}
  const s = section.settings || {}

  switch(section.type){
    case "hero":
      // hero is handled separately by Hero component; this fallback text_block
      return (
        <section className="bg-[#08090B] text-white py-10 px-4">
          <div className="mx-auto max-w-[1280px]">
            <div className="text-[11px] tracking-[0.18em] text-[#C9A86A] font-bold">{c.eyebrow || ""}</div>
            <h2 className="text-3xl font-black text-[#C9A86A]">{c.headingLine1 || ""} {c.headingLine2 || ""}</h2>
            <p className="text-white/60 text-sm mt-2 max-w-[520px]">{c.description || ""}</p>
            <div className="mt-4 flex gap-2">
              {c.ctaPrimaryLabel && <Link href={c.ctaPrimaryLink || "/tim"}><Button className="rounded-full bg-[#C9A86A] text-[#0B0C0F]">{c.ctaPrimaryLabel}</Button></Link>}
              {c.ctaSecondaryLabel && <Button variant="outline" className="rounded-full bg-transparent border-white/20 text-white">{c.ctaSecondaryLabel}</Button>}
            </div>
          </div>
        </section>
      )
    case "banner":
      return (
        <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {c.image ? <img src={c.image} alt={c.alt || c.heading || ""} className="h-auto w-full object-cover" /> : <div className="p-8 text-center text-sm text-muted-foreground">Banner: {c.heading || "—"}</div>}
            {(c.heading || c.description) && (
              <div className="p-4">
                {c.heading && <div className="text-sm font-black">{c.heading}</div>}
                {c.description && <div className="text-xs text-muted-foreground mt-1">{c.description}</div>}
                {c.link && <Link href={c.link} className="mt-2 inline-flex text-xs font-bold text-[#C9A86A]">Lihat →</Link>}
              </div>
            )}
          </div>
        </section>
      )
    case "cta":
      return (
        <section className={`mx-auto max-w-[1280px] px-4 md:px-6 py-8 ${s.variant==="dark" ? "bg-[#08090B] text-white rounded-2xl my-6" : ""}`}>
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-black">{c.heading || "CTA"}</h3>
            {c.description && <p className="text-sm opacity-70 mt-1 max-w-[560px] mx-auto">{c.description}</p>}
            {c.buttonLabel && <Link href={c.buttonLink || "/tim"} className="mt-4 inline-flex"><Button className="rounded-full">{c.buttonLabel}</Button></Link>}
          </div>
        </section>
      )
    case "text_block":
      return (
        <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
          <h3 className="text-lg font-black">{c.heading || section.title}</h3>
          {c.body && <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{c.body}</p>}
        </section>
      )
    case "rich_text":
      return (
        <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
          <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: c.html || c.body || "" }} />
        </section>
      )
    case "image":
      return (
        <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-6 flex justify-center">
          {c.src ? <img src={c.src} alt={c.alt || ""} className="max-w-full rounded-2xl border border-border" /> : <div className="text-sm text-muted-foreground">— belum ada gambar —</div>}
        </section>
      )
    case "gallery":
      return (
        <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
          <h3 className="text-sm font-black mb-3">{c.title || section.title}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.isArray(c.images) ? c.images.map((url: string, i:number)=> <img key={i} src={url} alt="" className="h-40 w-full object-cover rounded-xl border" />) : <span className="text-xs text-muted-foreground">— belum ada gambar —</span>}
          </div>
        </section>
      )
    case "stats":
      return (
        <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Array.isArray(c.items) ? c.items : []).map((item:any,i:number)=>(
              <div key={i} className="rounded-xl border border-border bg-card p-4 text-center">
                <div className="text-xl font-black">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
            {(!c.items || c.items.length===0) && <div className="col-span-full text-center text-xs text-muted-foreground">— stats kosong —</div>}
          </div>
        </section>
      )
    default:
      // fallback: render raw content as key-value
      return (
        <section className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
          <div className="rounded-xl border border-dashed border-border p-4">
            <div className="text-xs font-bold">{section.title} — {section.type}</div>
            <pre className="mt-2 text-xs bg-muted p-3 rounded-xl overflow-auto">{JSON.stringify(c, null, 2)}</pre>
          </div>
        </section>
      )
  }
}

export function CmsSections({ sections }: { sections: Section[] }){
  // only visible already filtered; render in order
  if(!sections || sections.length===0) return null
  return (
    <>
      {sections.map(s=> <CmsSectionRenderer key={s.id} section={s} />)}
    </>
  )
}
