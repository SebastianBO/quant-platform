import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Compound Interest Calculator - Free Investment Growth Calculator | Lician',
  description: 'Calculate compound interest on your investments. See how your money grows over time with our free compound interest calculator. Includes monthly contributions, various compounding frequencies, and year-by-year breakdown.',
  keywords: [
    'compound interest calculator',
    'investment calculator',
    'compound growth calculator',
    'retirement calculator',
    'investment growth calculator',
    'savings calculator',
    'compound interest formula',
    'how to calculate compound interest',
  ],
  openGraph: {
    title: 'Compound Interest Calculator - Investment Growth Calculator',
    description: 'Calculate how your investments grow with compound interest. Free calculator with monthly contributions and year-by-year breakdown.',
    type: 'website',
    url: `${SITE_URL}/calculators/compound-interest`,
  },
  alternates: {
    canonical: `${SITE_URL}/calculators/compound-interest`,
  },
}

export default function CompoundInterestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
