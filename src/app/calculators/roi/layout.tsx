import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ROI Calculator - Calculate Return on Investment | Lician',
  description: 'Free ROI calculator to measure your investment returns. Calculate return on investment percentage, annualized ROI, and compare multiple investments. Simple and accurate.',
  keywords: ['roi calculator', 'return on investment calculator', 'investment return calculator', 'roi formula', 'calculate roi', 'investment roi', 'roi percentage calculator'],
  openGraph: {
    title: 'ROI Calculator - Calculate Return on Investment',
    description: 'Free ROI calculator to measure your investment returns. Calculate return on investment percentage and annualized ROI.',
    url: 'https://lician.com/calculators/roi',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/calculators/roi',
  },
}

export default function ROICalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
