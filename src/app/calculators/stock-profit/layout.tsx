import { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Stock Profit Calculator - Calculate Trading Gains & Losses | Lician',
  description: 'Free stock profit calculator. Calculate your trading profit or loss, percentage return, and annualized return. Includes commission costs, dividends, and short selling calculations.',
  keywords: [
    'stock profit calculator',
    'stock gain calculator',
    'trading profit calculator',
    'stock return calculator',
    'buy sell calculator',
    'stock loss calculator',
    'investment return calculator',
    'short selling calculator',
  ],
  openGraph: {
    title: 'Stock Profit Calculator - Calculate Your Trading Returns',
    description: 'Calculate stock trading profit or loss with commissions, dividends, and annualized returns. Free calculator for long and short positions.',
    type: 'website',
    url: `${SITE_URL}/calculators/stock-profit`,
  },
  alternates: {
    canonical: `${SITE_URL}/calculators/stock-profit`,
  },
}

export default function StockProfitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
