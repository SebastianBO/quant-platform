import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Dividend Yield Calculator - Calculate Dividend Income & Yield | Lician',
  description: 'Free dividend yield calculator. Calculate dividend yield, annual income, yield on cost, and project future dividend growth with DRIP reinvestment. See year-by-year income projections.',
  keywords: [
    'dividend yield calculator',
    'dividend income calculator',
    'dividend calculator',
    'yield on cost calculator',
    'DRIP calculator',
    'dividend reinvestment calculator',
    'stock dividend calculator',
    'annual dividend income',
  ],
  openGraph: {
    title: 'Dividend Yield Calculator - Calculate Your Dividend Income',
    description: 'Calculate dividend yield, annual income, and project future growth with DRIP reinvestment. Free calculator with year-by-year projections.',
    type: 'website',
    url: `${SITE_URL}/calculators/dividend-yield`,
  },
  alternates: {
    canonical: `${SITE_URL}/calculators/dividend-yield`,
  },
}

export default function DividendYieldLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
