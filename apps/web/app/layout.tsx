import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AR&CO Law Firm | Expert Legal Services",
  description: "Professional legal services and facilitation centre in Pakistan. Expert corporate law, tax law, immigration, labour law, IP, real estate, litigation, and contract services.",
  generator: 'v0.app',
  keywords: ['law firm', 'legal services', 'Pakistan law', 'corporate law', 'tax law', 'immigration law', 'AR&CO'],
  authors: [{ name: 'AR&CO Law Associates' }],
  creator: 'AR&CO Law Associates',
  publisher: 'AR&CO Law Associates',
  metadataBase: new URL('https://arco-law.com'),
  openGraph: {
    title: 'AR&CO Law Firm | Expert Legal Services',
    description: 'Professional legal services and facilitation centre in Pakistan',
    type: 'website',
    locale: 'en_US',
    url: 'https://arco-law.com',
    siteName: 'AR&CO Law Associates',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AR&CO Law Firm | Expert Legal Services',
    description: 'Professional legal services and facilitation centre in Pakistan',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/assets/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
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
      <body suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
