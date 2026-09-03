"use client"
// DARK ONLY — toggle di-disable, tampil indikator dark saja
export function ThemeToggle(){
  return (
    <div className="flex items-center rounded-full border border-border p-1 gap-0.5 bg-muted/30 opacity-60 pointer-events-none" title="Dark theme only">
      <span className="h-7 w-7 rounded-full grid place-items-center bg-background shadow-sm border border-border">
        <span className="h-3.5 w-3.5 rounded-full bg-foreground" />
      </span>
    </div>
  )
}
