"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ToastItem = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error"
}

const ToastContext = React.createContext<{
  toasts: ToastItem[]
  toast: (t: Omit<ToastItem, "id">) => void
  dismiss: (id: string) => void
} | null>(null)

export function useToast(){
  const ctx = React.useContext(ToastContext)
  if(!ctx) throw new Error("useToast outside provider")
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }){
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const toast = React.useCallback((t: Omit<ToastItem, "id">)=>{
    const id = Math.random().toString(36).slice(2,9)
    setToasts(prev=> [...prev, { id, ...t }])
    setTimeout(()=> {
      setToasts(prev=> prev.filter(x=> x.id !== id))
    }, 2800)
  },[])
  const dismiss = React.useCallback((id:string)=>{
    setToasts(prev=> prev.filter(x=> x.id !== id))
  },[])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-[92%] max-w-[420px]">
        {toasts.map(t=> (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto relative overflow-hidden rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300",
              t.variant === "error" ? "bg-[#1A0A0A] border-red-500/30 text-white" :
              t.variant === "success" ? "bg-[#0A1A0F] border-emerald-500/30 text-white" :
              "bg-[#111318] border-white/10 text-white"
            )}
          >
            <div className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", t.variant==="error" ? "bg-red-500" : t.variant==="success" ? "bg-emerald-500" : "bg-[#C9A86A]")} />
            <div className="flex-1 min-w-0">
              {t.title && <div className="text-sm font-bold leading-tight">{t.title}</div>}
              {t.description && <div className="text-xs leading-relaxed text-white/70">{t.description}</div>}
            </div>
            <button onClick={()=> dismiss(t.id)} className="h-6 w-6 grid place-items-center rounded-full hover:bg-white/10 shrink-0">
              <X className="h-3.5 w-3.5 text-white/60" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// helper for imperative use outside React (fallback)
let externalToast: ((t: Omit<ToastItem,"id">)=>void) | null = null
export function setExternalToast(fn: (t: Omit<ToastItem,"id">)=>void){
  externalToast = fn
}
export function toast(opts: Omit<ToastItem,"id">){
  if(externalToast) externalToast(opts)
  else console.log("[toast]", opts)
}
