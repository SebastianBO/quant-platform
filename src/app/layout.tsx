import type React from "react"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { PostHogProvider, PostHogPageView } from "@/components/PostHogProvider"
import GlobalChat from "@/components/GlobalChat"
import { MobileTabBar } from "@/components/MobileTabBar"
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// Viewport configuration for responsive design and mobile optimization
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "your-google-verification-code",
  },
  alternates: {
    canonical: "https://lician.com",
  },
  category: 'finance',
  classification: 'Financial Services',
}

// Global structured data schemas
const organizationSchema = getOrganizationSchema()
const websiteSchema = getWebSiteSchema()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical external domains for performance */}
        <link rel="preconnect" href="https://supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://eodhd.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://financialdatasets.ai" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://logo.clearbit.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://eodhd.com" />
        <link rel="dns-prefetch" href="https://financialdatasets.ai" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.anthropic.com" />

        {/* Preload critical fonts for LCP */}
        <link
          rel="preload"
          href="/_next/static/media/a34f9d1faa5f3315-s.p.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Global Organization and Website Schema for search engines and AI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, websiteSchema]),
          }}
        />

        {/* Microsoft Clarity - Heatmaps & Session Recordings (FREE) */}
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}

        {/* PostHog initialized via React Provider for proper SPA navigation tracking */}

        {/* Google Analytics with Enhanced Measurement */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                    // Enhanced measurement settings
                    send_page_view: true,
                    // Custom dimensions for user segmentation
                    custom_map: {
                      'dimension1': 'user_type',
                      'dimension2': 'subscription_tier',
                      'dimension3': 'model_used'
                    },
                    // Link click tracking
                    link_attribution: true,
                    // Content grouping for financial pages
                    content_group1: window.location.pathname.startsWith('/stock/') ? 'Stock Pages' :
                                    window.location.pathname.startsWith('/compare/') ? 'Compare Pages' :
                                    window.location.pathname.startsWith('/sectors/') ? 'Sector Pages' :
                                    window.location.pathname.startsWith('/learn/') ? 'Learn Pages' :
                                    window.location.pathname === '/' ? 'Homepage' : 'Other'
                  });
                  // Track outbound link clicks
                  document.addEventListener('click', function(e) {
                    var link = e.target.closest('a');
                    if (link && link.hostname !== window.location.hostname) {
                      gtag('event', 'click', {
                        event_category: 'outbound',
                        event_label: link.href,
                        transport_type: 'beacon'
                      });
                    }
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <GlobalChat />
            <MobileTabBar />
          </ThemeProvider>
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  )
}
