import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/providers/AuthProvider"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Prolific Tracker - Track Your Earnings",
  description: "Track and analyze your Prolific research study earnings with instant CSV import, advanced analytics, and goal tracking.",
  keywords: ["prolific", "earnings tracker", "research studies", "hourly rate calculator"],
  authors: [{ name: "ProlificTracker" }],
  openGraph: {
    title: "Prolific Tracker - Track Your Earnings",
    description: "The easiest way to track and analyze your Prolific research earnings",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
