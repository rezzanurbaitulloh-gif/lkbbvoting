import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)
}
export function formatNumber(n: number) {
  return new Intl.NumberFormat("id-ID").format(n)
}
export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}
export function getInitials(name: string) {
  return name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()
}
