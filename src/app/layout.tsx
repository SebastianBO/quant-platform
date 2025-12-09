import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL('https://lician.com'),
  title: {
    default: "Lician - AI-Powered Stock Research & Analysis Platform",
    template: "%s | Lician"
  },
  description: "Make better investment decisions with AI-powered stock analysis, real-time quotes, DCF valuations, short interest data, and institutional ownership tracking. Free stock research tools.",
  keywords: [
    "stock analysis",
    "AI stock research",
    "stock screener",
    "DCF calculator",
    "short interest",
    "institutional ownership",
    "earnings calendar",
    "stock valuation",
    "investment research",
    "stock market analysis",
    "financial analysis",
    "stock price prediction"
  ],
  authors: [{ name: "Lician" }],
  creator: "Lician",
  publisher: "Lician",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lician.com",
    siteName: "Lician",
    title: "Lician - AI-Powered Stock Research & Analysis Platform",
    description: "Make better investment decisions with AI-powered stock analysis, real-time quotes, DCF valuations, and institutional ownership tracking.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lician - Stock Research Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lician - AI-Powered Stock Research",
    description: "Make better investment decisions with AI-powered stock analysis and real-time market data.",
    images: ["/og-image.png"],
    creator: "@lician",
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://lician.com",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
