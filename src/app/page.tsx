import { Metadata } from 'next'
import { Suspense } from 'react'
import ManusStyleHome from "@/components/ManusStyleHome"
import { SITE_URL, getDataCatalogSchema, getOrganizationSchema, getWebSiteSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: 'Lician - AI-Powered Stock Analysis & Investment Research Platform',
  description: 'Free AI-powered stock analysis platform with real-time data, DCF valuations, financial metrics, analyst ratings, and investment insights. Research stocks, compare companies, and make informed investment decisions.',
  keywords: [
    'stock analysis',
    'AI stock analysis',
    'stock research',
    'investment research',
    'stock screener',
    'DCF valuation',
    'fundamental analysis',
    'stock market analysis',
    'stock picker',
    'investment platform',
  ],
  openGraph: {
    title: 'Lician - AI Stock Analysis Platform',
    description: 'Free AI-powered stock analysis with real-time data, valuations, and investment insights.',
    type: 'website',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lician - AI Stock Analysis Platform',
    description: 'Free AI-powered stock analysis with real-time data, valuations, and investment insights.',
  },
  alternates: {
    canonical: SITE_URL,
  },
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-dvh bg-black">
      <div className="text-center">
        <div className="motion-safe:animate-spin rounded-full size-12 border-t-2 border-[#4ebe96] mx-auto mb-4" />
        <p className="text-[#868f97]">Loading Lician...</p>
      </div>
    </div>
  )
}

export default function Home() {
  // Generate schema markup for homepage SEO
  const organizationSchema = getOrganizationSchema()
  const webSiteSchema = getWebSiteSchema()
  const dataCatalogSchema = getDataCatalogSchema()

  return (
    <>
      {/* JSON-LD Schema Markup for enhanced SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, webSiteSchema, dataCatalogSchema])
        }}
      />
      <Suspense fallback={<LoadingState />}>
        <ManusStyleHome />
      </Suspense>
    </>
  )
}
