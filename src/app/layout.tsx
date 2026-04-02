import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/providers/AuthProvider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  // 🔥 Core SEO
  title: {
    default: "Prolific Tracker - Free Earnings Tracker for Prolific Researchers",
    template: "%s | Prolific Tracker",
  },
  description: "Free earnings tracker for Prolific researchers. Upload your CSV, view dual-currency analytics (GBP & USD), track weekly goals, and see beautiful charts. No spreadsheets needed!",
  keywords: [
    "prolific",
    "prolific tracker",
    "prolific earnings",
    "prolific earnings tracker",
    "research study tracker",
    "prolific csv",
    "prolific analytics",
    "hourly rate calculator",
    "beermoney tracker",
    "survey earnings",
    "prolific studies",
  ],
  authors: [{ name: "Prolific Tracker" }],
  creator: "Prolific Tracker",
  publisher: "Prolific Tracker",

  // 🔥 Base URL for all relative URLs
  metadataBase: new URL("https://prolific-tracker-alpha.vercel.app"),

  // 🔥 Open Graph (Facebook, LinkedIn, Discord previews)
  openGraph: {
    title: "Prolific Tracker - Free Earnings Tracker",
    description: "Upload your Prolific CSV and instantly see your earnings, hourly rate, and trends. 100% free, no spreadsheets needed!",
    url: "https://prolific-tracker-alpha.vercel.app",
    siteName: "Prolific Tracker",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Prolific Tracker - Track Your Research Earnings",
      },
    ],
  },

  // 🔥 Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Prolific Tracker - Free Earnings Tracker",
    description: "Upload your Prolific CSV and instantly see your earnings, hourly rate, and trends. 100% free!",
    images: ["/og-image.png"],
    creator: "@prolifictracker",
  },

  // 🔥 Favicon & Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // 🔥 Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 🔥 Verification (uncomment and add your codes when you have them)
  // verification: {
  //   google: "your-google-verification-code",
  // },

  // 🔥 Alternate languages (if you add multi-language support later)
  alternates: {
    canonical: "https://prolific-tracker-alpha.vercel.app",
  },

  // 🔥 App-specific
  applicationName: "Prolific Tracker",
  category: "Finance",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* 🔥 Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* 🔥 Theme color for mobile browsers */}
        <meta name="theme-color" content="#3b82f6" />

        {/* 🔥 Prevent phone number detection (iOS) */}
        <meta name="format-detection" content="telephone=no" />

        {/*
          🔥 Google Analytics - OPTIONAL
          Uncomment and replace G-XXXXXXXXXX with your actual ID when you set it up
        */}
        {/*
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
        */}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>

        {/* 🔥 Vercel Analytics - Track pageviews and user behavior */}
        <Analytics />

        {/* 🔥 Vercel Speed Insights - Track performance metrics */}
        <SpeedInsights />

        {/* 🔥 Structured Data for Google Rich Results */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Prolific Tracker",
              "url": "https://prolific-tracker-alpha.vercel.app",
              "description": "Free earnings tracker for Prolific researchers. Upload CSV, view analytics, track goals.",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "CSV Import",
                "Dual Currency Support (GBP & USD)",
                "Weekly Goal Tracking",
                "Calendar View",
                "Analytics Dashboard",
                "Hourly Rate Calculator"
              ],
              "screenshot": "https://prolific-tracker-alpha.vercel.app/og-image.png"
            }),
          }}
        />
      </body>
    </html>
  )
}
