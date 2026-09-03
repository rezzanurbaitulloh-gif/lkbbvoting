"use client"
import { useEffect } from "react"

export function AppearanceProvider(){
  useEffect(()=>{
    const apply = async ()=>{
      try{
        const res = await fetch("/api/cms/settings")
        const j = await res.json()
        const map = j.settings || {}
        // site_settings may be map key->value where value is json string
        let primary = map["appearance.primary_color"]
        if(primary===undefined) primary = map["appearance.primary_color"] || j.rows?.find((r:any)=> r.key==="appearance.primary_color")?.value
        // normalize: if object or quoted string
        if(typeof primary==="object" && primary!==null && (primary as any).value) primary = (primary as any).value
        if(typeof primary==="string") primary = primary.replace(/^"|"$/g,"")
        if(primary && typeof primary==="string" && /^#?[0-9A-Fa-f]{3,8}$/.test(primary.trim())){
          let c = primary.trim()
          if(!c.startsWith("#")) c = "#"+c
          document.documentElement.style.setProperty("--primary", c)
          document.documentElement.style.setProperty("--gold", c)
          document.documentElement.style.setProperty("--ring", c)
          // also set --chart-1
          document.documentElement.style.setProperty("--chart-1", c)
        }
        // theme — default dark premium (jangan jadi putih). Hanya light yang explicit remove dark
        let theme = map["appearance.theme"]
        if(typeof theme==="object" && theme!==null && (theme as any).value) theme = (theme as any).value
        if(typeof theme==="string") theme = theme.replace(/^"|"$/g,"")
        if(theme==="light") document.documentElement.classList.remove("dark")
        else document.documentElement.classList.add("dark")
      } catch {}
    }
    apply()
    // also listen for storage-like updates via custom event
    const handler = ()=> apply()
    window.addEventListener("lkbb-settings-updated", handler)
    return ()=> window.removeEventListener("lkbb-settings-updated", handler)
  },[])
  return null
}
