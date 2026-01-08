import { Metadata } from 'next'
import ManusStyleHome from "@/components/ManusStyleHome"
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

export default function Home() {
  return <ManusStyleHome />
}
