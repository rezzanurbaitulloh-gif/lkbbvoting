"use client"
import { Moon, Sun, Monitor } from "lucide-react"
import { useApp } from "@/lib/store"
import { Button } from "@/components/ui/button"
export function ThemeToggle(){
  const { theme, setTheme } = useApp()
  return (
    <div className="flex items-center rounded-full border border-border p-1 gap-0.5 bg-muted/30">
      {(["light","dark","system"] as const).map(t=> (
        <button key={t} onClick={()=>setTheme(t)} className={`h-7 w-7 rounded-full grid place-items-center transition-colors ${theme===t ? "bg-background shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`} aria-label={t}>
          {t==="light" ? <Sun className="h-3.5 w-3.5"/> : t==="dark" ? <Moon className="h-3.5 w-3.5"/> : <Monitor className="h-3.5 w-3.5"/>}
        </button>
      ))}
    </div>
  )
}
