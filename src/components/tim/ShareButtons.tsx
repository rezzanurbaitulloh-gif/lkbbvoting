"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { ShareSheet } from "@/components/share/ShareSheet"
export function ShareButtons({ profileUrl, supportUrl }: { profileUrl: string; supportUrl: string }){
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const share = async (type: "profile"|"support")=>{
    const full = window.location.origin + (type==="profile" ? profileUrl : supportUrl)
    const t = type==="profile" ? "Profil Tim LKBB" : "Dukung Tim di LKBB Javasoma"
    if(navigator.share){
      try { await navigator.share({ title: t, url: full }); toast({ title: "Berhasil dibagikan", variant: "success" }); return } catch {}
    }
    setUrl(full); setTitle(t); setOpen(true)
  }
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="rounded-full" onClick={()=> share("profile")}>Bagikan Profil</Button>
        <Button variant="outline" className="rounded-full" onClick={()=> share("support")}>Bagikan Dukungan</Button>
      </div>
      <ShareSheet open={open} onOpenChange={setOpen} url={url} title={title} />
    </>
  )
}
