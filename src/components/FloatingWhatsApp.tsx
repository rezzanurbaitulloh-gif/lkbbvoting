"use client"
import { useEffect, useState, useRef } from "react"

export function FloatingWhatsApp({ siteSettings }: { siteSettings?: Record<string, any> }) {
  const [number, setNumber] = useState<string | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [hasDragged, setHasDragged] = useState(false)
  const offset = useRef({ x: 0, y: 0 })
  const btnRef = useRef<HTMLAnchorElement>(null)
  const size = 56

  // Fetch number from siteSettings or API
  useEffect(() => {
    const getFloating = (settings: Record<string, any>) => {
      // Priority: contact.whatsapp_floating > floating.whatsapp > contact.whatsapp > contact.whatsapp_smp etc
      const candidates = [
        settings["contact.whatsapp_floating"],
        settings["floating.whatsapp"],
        settings["contact.whatsapp"],
        settings["contact.whatsapp_smp"],
      ]
      for (const c of candidates) {
        if (!c) continue
        let v = c
        if (typeof v === "object" && (v as any).value !== undefined) v = (v as any).value
        if (typeof v === "string") {
          v = v.replace(/^"|"$/g, "").trim()
          if (v && v !== "0812-3456-7890" && v.length >= 8) return v
          // allow default if no floating set, fallback to whatsapp
          if (v && c === settings["contact.whatsapp"]) return v
        }
      }
      return null
    }

    if (siteSettings && Object.keys(siteSettings).length > 0) {
      const n = getFloating(siteSettings)
      if (n) setNumber(n)
    } else {
      fetch("/api/cms/settings").then(r=>r.json()).then(j=>{
        const settings = j.settings || {}
        const n = getFloating(settings)
        if (n) setNumber(n)
      }).catch(()=>{})
    }
  }, [siteSettings])

  // Also fetch directly if siteSettings not provided via props
  useEffect(()=>{
    if(number) return
    fetch("/api/cms/settings").then(r=>r.json()).then(j=>{
      const settings = j.settings || {}
      const candidates = [settings["contact.whatsapp_floating"], settings["floating.whatsapp"], settings["contact.whatsapp"]]
      for(const c of candidates){
        if(!c) continue
        let v=c
        if(typeof v==="object" && (v as any).value!==undefined) v=(v as any).value
        if(typeof v==="string"){
          v=v.replace(/^"|"$/g,"").trim()
          if(v) { setNumber(v); break }
        }
      }
    }).catch(()=>{})
  },[])

  // Initial position bottom-right
  useEffect(()=>{
    const init = ()=>{
      const x = window.innerWidth - size - 16
      const y = window.innerHeight - size - 80 // above BottomNav
      setPos({ x: Math.max(16, x), y: Math.max(16, y) })
    }
    init()
    window.addEventListener("resize", init)
    return ()=> window.removeEventListener("resize", init)
  },[])

  const normalizeNumber = (num: string)=>{
    let n = num.replace(/[^0-9+]/g, "")
    // remove leading 0 and replace with 62
    if(n.startsWith("0")) n = "62" + n.slice(1)
    if(n.startsWith("+62")) n = n.slice(1)
    if(!n.startsWith("62") && n.length >= 9) {
      // if already 62, keep, else if starts with 8, add 62
      if(n.startsWith("8")) n = "62"+n
    }
    // remove + 
    n = n.replace(/^\+/, "")
    return n
  }

  const handlePointerDown = (e: React.PointerEvent)=>{
    setDragging(true)
    setHasDragged(false)
    const rect = btnRef.current?.getBoundingClientRect()
    if(rect){
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent)=>{
    if(!dragging) return
    const x = e.clientX - offset.current.x
    const y = e.clientY - offset.current.y
    // clamp
    const maxX = window.innerWidth - size - 8
    const maxY = window.innerHeight - size - 8
    const clampedX = Math.min(Math.max(8, x), maxX)
    const clampedY = Math.min(Math.max(8, y), maxY)
    setPos({ x: clampedX, y: clampedY })
    if(Math.abs(e.clientX - (pos.x + offset.current.x)) > 3 || Math.abs(e.clientY - (pos.y + offset.current.y)) > 3){
      setHasDragged(true)
    }
  }

  const handlePointerUp = (e: React.PointerEvent)=>{
    if(!dragging) return
    setDragging(false)
    // Snap to nearest edge (left or right)
    const centerX = pos.x + size/2
    const isLeft = centerX < window.innerWidth / 2
    const snapX = isLeft ? 16 : window.innerWidth - size - 16
    // Keep Y as is but clamp
    const maxY = window.innerHeight - size - 8
    const snapY = Math.min(Math.max(8, pos.y), maxY)
    setPos({ x: snapX, y: snapY })
    // if was drag, prevent click navigation
    setTimeout(()=> setHasDragged(false), 200)
  }

  if(!number) return null
  const waNumber = normalizeNumber(number)
  const href = `https://wa.me/${waNumber}?text=${encodeURIComponent("Halo Panitia LKBB JAVASOMA, saya ingin bertanya...")}`

  const onClick = (e: React.MouseEvent)=>{
    if(hasDragged){
      e.preventDefault()
      return
    }
  }

  return (
    <a
      ref={btnRef}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ left: pos.x, top: pos.y, touchAction: "none" }}
      className={`fixed z-[60] h-14 w-14 rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(0,0,0,0.35)] grid place-items-center border border-white/20 select-none ${dragging ? "cursor-grabbing scale-105" : "cursor-grab hover:scale-105"} transition-transform`}
      aria-label="Chat WhatsApp"
      title="Drag untuk pindah, lepas untuk menempel ke pinggir"
    >
      <svg role="img" viewBox="0 0 24 24" className="h-7 w-7 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white border-2 border-[#25D366] animate-pulse" />
    </a>
  )
}
