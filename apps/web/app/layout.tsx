import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth/auth-context"
import { PracticeAreasProvider } from "@/components/practice-areas"
import PracticeAreasOverlayWrapper from "@/components/practice-areas/PracticeAreasOverlayWrapper"
import { FacilitationProvider, FacilitationOverlayWrapper } from "@/components/facilitation"
import { ConsultationProvider, ConsultationOverlayWrapper } from "@/components/consultation"
import { AboutProvider, AboutOverlayWrapper } from "@/components/about"
import PageTransition from "@/components/PageTransition"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: 'AR&CO Law Associates',
  description: 'Legal services in Pakistan for corporate advisory, dispute resolution, intellectual property, and regulatory representation.',
  keywords: ['law firm', 'legal services', 'Pakistan law', 'corporate law', 'tax law', 'immigration law', 'AR&CO'],
  authors: [{ name: 'AR&CO Law Associates' }],
  creator: 'AR&CO Law Associates',
  publisher: 'AR&CO Law Associates',
  metadataBase: new URL('https://arandcolaw.com'),
  openGraph: {
    title: 'AR&CO Law Associates',
    description: 'Legal services in Pakistan for corporate advisory, dispute resolution, and regulatory matters.',
    type: 'website',
    locale: 'en_PK',
    url: 'https://arandcolaw.com',
    siteName: 'AR&CO Law Associates',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AR&CO Law Firm',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AR&CO Law Associates',
    description: 'Legal services in Pakistan for corporate advisory, dispute resolution, and regulatory matters.',
    images: ['/twitter-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload hero video so download starts immediately with the HTML,
            in parallel with JS chunk downloads. Mobile uses a smaller 1080p file.
            media attr ensures each device only preloads the file it will use. */}
        <link rel="preload" href="/banner/hero-bg.mp4" as="fetch" crossOrigin="anonymous" media="(min-width: 769px)" fetchPriority="high" />
        <link rel="preload" href="/banner/hero-bg-mobile.mp4" as="video" media="(max-width: 768px)" fetchPriority="high" />
        <link
          rel="preload"
          href="/fonts/lora/Lora-VariableItalic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/lora/Lora-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <PracticeAreasProvider>
            <FacilitationProvider>
              <ConsultationProvider>
                <AboutProvider>
                  <PageTransition />
                  {children}
                  <PracticeAreasOverlayWrapper />
                  <FacilitationOverlayWrapper />
                  <Suspense><ConsultationOverlayWrapper /></Suspense>
                  <AboutOverlayWrapper />
                </AboutProvider>
              </ConsultationProvider>
            </FacilitationProvider>
          </PracticeAreasProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}