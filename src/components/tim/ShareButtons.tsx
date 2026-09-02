"use client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
export function ShareButtons({ profileUrl, supportUrl }: { profileUrl: string; supportUrl: string }){
  const { toast } = useToast()
  const share = async (type: "profile"|"support")=>{
    const url = window.location.origin + (type==="profile" ? profileUrl : supportUrl)
    if(navigator.share){
      try { await navigator.share({ title: "LKBB JAVASOMA", url }); toast({ title: "Berhasil dibagikan", description: url }); return } catch {}
    }
    try {
      await navigator.clipboard.writeText(url)
      toast({ title: type==="profile" ? "Link profil disalin" : "Link dukungan disalin", description: url, variant: "success" })
    } catch {
      toast({ title: "Gagal menyalin", description: url, variant: "error" })
    }
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="outline" className="rounded-full" onClick={()=> share("profile")}>Bagikan Profil</Button>
      <Button variant="outline" className="rounded-full" onClick={()=> share("support")}>Bagikan Dukungan</Button>
    </div>
  )
}
