import { Metadata } from 'next'
import { Suspense } from "react"
import AutonomousChat from "@/components/AutonomousChat"
import DashboardContent from "@/components/DashboardContent"
import FeaturedArticles from "@/components/FeaturedArticles"
import { Footer } from "@/components/footer"
import { SITE_URL } from "@/lib/seo"

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
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Lician...</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-background pt-4">
        <AutonomousChat />
      </main>
      <Suspense fallback={<LoadingState />}>
        <DashboardContent />
      </Suspense>
      <FeaturedArticles />
      <Footer />
    </>
  )
}
// Deployment: 1767853754
