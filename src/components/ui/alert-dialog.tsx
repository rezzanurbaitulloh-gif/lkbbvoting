"use client"
import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Hapus",
  cancelText = "Batal",
  onConfirm,
  variant = "destructive",
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  variant?: "destructive" | "default"
}){
  const [loading, setLoading] = React.useState(false)
  const handleConfirm = async ()=>{
    setLoading(true)
    try { await onConfirm() } finally { setLoading(false); onOpenChange(false) }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={()=> onOpenChange(false)} disabled={loading}>{cancelText}</Button>
          <Button variant={variant==="destructive" ? "destructive" : "default"} onClick={handleConfirm} disabled={loading}>{loading ? "Memproses..." : confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
