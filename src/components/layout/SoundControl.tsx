"use client"
import { useState, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { getSoundEnabled, setSoundEnabled, unlockAudio } from "@/lib/sound"

export function SoundControl(){
  const [enabled, setEnabled] = useState(true)
  const [mounted, setMounted] = useState(false)
  useEffect(()=> {
    setMounted(true)
    setEnabled(getSoundEnabled())
  },[])
  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    setSoundEnabled(next)
    if(next) unlockAudio()
  }
  if(!mounted) {
    return (
      <button aria-label="Suara" className="h-9 w-9 grid place-items-center rounded-full border border-border hover:bg-muted transition-colors">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
      </button>
    )
  }
  return (
    <button
      onClick={toggle}
      aria-label={enabled ? "Matikan suara notifikasi" : "Nyalakan suara notifikasi"}
      title={enabled ? "Suara aktif — klik untuk mute" : "Suara dimatikan — klik untuk nyalakan"}
      className={`h-9 w-9 grid place-items-center rounded-full border border-border bg-transparent hover:bg-muted transition-colors ${enabled ? "text-foreground" : "text-muted-foreground opacity-60"}`}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  )
}
