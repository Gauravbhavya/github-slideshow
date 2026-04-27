import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "M&M Relocations | Safe Moves. Smart Relocations.",
  description:
    "Trusted packers and movers in Darbhanga and across Bihar. Local and intercity household shifting with transparent pricing and no hidden charges.",
  generator: "v0.app",
  keywords: [
    "packers and movers Darbhanga",
    "movers Patna",
    "household shifting Bihar",
    "Darbhanga to Patna movers",
    "M&M Relocations",
  ],
}

export const viewport: Viewport = {
  themeColor: "#1a2a52",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
