import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/providers/AuthProvider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { FEATURES, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Free Earnings Tracker for Prolific Participants`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "prolific",
    "prolific earnings tracker",
    "prolific participant",
    "prolific hourly rate",
    "prolific csv",
    "prolific submissions export",
    "prolific earnings calculator",
    "prolific tax",
    "survey earnings tracker",
    "beermoney tracker",
  ],
  applicationName: SITE_NAME,
  category: "Finance",
  metadataBase: new URL(SITE_URL),
  // Canonical for "/" only; routes with public pages set their own (see the
  // (auth)/login and (auth)/register layouts). Private pages are noindex.
  alternates: { canonical: "/" },
  // Image comes from src/app/opengraph-image.tsx (Next.js file convention).
  openGraph: {
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Google Search Console: set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel to
  // the content value of the HTML-tag verification method.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
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
        {/* Plain <script> so the JSON-LD is in the server HTML (next/script injects it client-side). */}
        <script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web",
              isAccessibleForFree: true,
              offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
              featureList: FEATURES,
              image: `${SITE_URL}/opengraph-image`,
            }).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  )
}
