import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/lib/store"
import { RealtimeSupportNotification } from "@/components/realtime/RealtimeSupportNotification"
import { ToastProvider } from "@/components/ui/toast"
import { AppearanceProvider } from "@/components/layout/AppearanceProvider"
import { cn } from "@/lib/utils";

// Font standart tegas — Inter, satu keluarga untuk semua teks (body & heading) agar tegas dan konsisten
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400","500","600","700","800","900"],
})

export const metadata: Metadata = {
  title: {
    default: "LKBB JAVASOMA — Peleton Terfavorit 2026",
    template: "%s | LKBB JAVASOMA",
  },
  description: "Platform resmi PELETON TERFAVORIT — LKBB JAVASOMA THE IMPRESSION ASTRA DHARMA HAYUNING BUDAYA. Dukung peleton favoritmu.",
  keywords: ["LKBB","Paskibra","Peleton Terfavorit","Javasoma","SMK","Kertosono"],
  authors: [{ name: "PASKIBRA SMKN 1 KERTOSONO"}],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/assets/brand/lkbb-logo.jpg", type: "image/jpeg" },
    ],
    apple: "/icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "LKBB JAVASOMA — Peleton Terfavorit",
    description: "Siapa yang akan menjadi peleton pilihan publik? Dukung sekarang.",
    images: [{ url: "/assets/brand/lkbb-logo.jpg", width: 1200, height: 630, alt: "LKBB Javasoma"}]
  }
}
export const viewport: Viewport = {
  themeColor: "#08090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn("h-full", "antialiased", inter.variable, "font-sans")} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: `(function(){try{var t=localStorage.getItem('lkbb-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var v=t&&t!=='system'?t:(t==='system'?m:'dark');if(v==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark')}})()`}} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-[#C9A86A]/20">
        <ToastProvider>
          <AppProvider>
            <AppearanceProvider />
            {children}
            <RealtimeSupportNotification />
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
