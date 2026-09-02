"use client"
import { useState, useRef, useCallback } from "react"
import ReactCrop, { type Crop, centerCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement("canvas")
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = Math.floor(crop.width * scaleX)
  canvas.height = Math.floor(crop.height * scaleY)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas error")
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  )
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error("Gagal memotong gambar"))
    }, "image/jpeg", 0.92)
  })
}

export function ImageCropDialog({
  open,
  onOpenChange,
  src,
  onCropped,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  src: string
  onCropped: (blob: Blob) => void
}) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const c = centerCrop(
      { unit: "%", x: 10, y: 10, width: 80, height: 80 },
      width,
      height
    )
    setCrop(c)
  }

  const handleSave = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return
    const blob = await getCroppedImg(imgRef.current, completedCrop)
    onCropped(blob)
    onOpenChange(false)
  }, [completedCrop, onCropped, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Sesuaikan Gambar</DialogTitle>
          <DialogDescription>Geser dan ubah ukuran kotak potong — rasio bebas. Pratinjau langsung terlihat.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-auto bg-muted rounded-xl border">
          {src && (
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
              <img ref={imgRef} src={src} alt="Preview" onLoad={onImageLoad} className="max-w-full" />
            </ReactCrop>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={!completedCrop?.width}>Simpan Potongan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
