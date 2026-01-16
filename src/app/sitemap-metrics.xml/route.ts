import { NextResponse } from 'next/server'
import { ALL_STOCKS_FULL as ALL_STOCKS } from '@/lib/stocks-full'

// All metric page types from the app
const METRIC_PAGES = [
  // Financial metrics
  'pe-ratio', 'peg-ratio', 'price-to-book', 'price-to-sales', 'ev-ebitda', 'price-to-fcf',
  'profit-margin', 'gross-margin', 'operating-margin', 'net-margin', 'ebit-margin',
  'free-cash-flow', 'free-cash-flow-margin', 'operating-cash-flow', 'financing-cash-flow',
  'revenue', 'earnings', 'eps', 'dividend', 'buybacks', 'debt-to-equity',
  'roa', 'roe', 'roic', 'roce', 'beta', 'volatility',
  // Additional high-value metrics
  'book-value', 'enterprise-value', 'growth',
  // Technical indicators
  'rsi', 'macd', 'bollinger-bands', 'moving-average', 'vwap', 'momentum',
  'stochastic', 'ichimoku', 'fibonacci', 'support-resistance', 'trend',
  'supertrend', 'aroon', 'cci', 'williams-r', 'parabolic-sar',
  'donchian-channels', 'keltner-channels', 'elder-ray', 'mass-index',
  'ultimate-oscillator', 'trix',
  // Analysis pages
  'forecast', 'prediction', 'valuation', 'analyst', 'rating', 'consensus',
  'target-price', 'guidance', 'earnings-surprise', 'revisions', 'sentiment',
  'upgrade-downgrade', 'peer-comparison', 'industry-rank', 'sector-analysis',
  // Ownership & flow
  'insider', 'institutional', 'ownership', 'short-interest', 'short-squeeze',
  'days-to-cover', 'borrow-rate', 'float', 'shares-outstanding', 'shares-short',
  // Fundamentals
  'financials', 'income-statement', 'balance-sheet', 'cash-flow', 'margins',
  'debt', 'debt-analysis', 'working-capital', 'inventory-turns',
  // Market data
  'quote', 'price', 'chart', 'history', 'volume', '52-week-high', 'market-cap',
  'options', 'splits', 'news', 'sec',
  // Investment thesis
  'bull-case', 'bear-case', 'investment-thesis', 'worth-buying', 'is-undervalued', 'is-overvalued',
  // Growth metrics
  'revenue-growth', 'earnings-growth', 'user-growth', 'subscriber-growth', 'arr-growth',
  // Sector-specific
  'streaming-subs', 'cloud-revenue', 'ev-deliveries', 'dau', 'mau', 'arpu',
  'gmv', 'tpv', 'take-rate', 'churn', 'expansion-revenue', 'gross-retention', 'dollar-based-retention',
]

// Generate sitemap for metric pages
// Formula: ~100 metrics × 588 stocks = ~58,800 pages

export const revalidate = 86400 // Daily

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = 10000 // 10K URLs per page

  // Generate all metric/stock combinations
  const allUrls: string[] = []

  for (const metric of METRIC_PAGES) {
    for (const stock of ALL_STOCKS) {
      allUrls.push(`/${metric}/${stock.toLowerCase()}`)
    }
  }

  // Pagination
  const totalPages = Math.ceil(allUrls.length / perPage)
  const start = (page - 1) * perPage
  const end = start + perPage
  const pageUrls = allUrls.slice(start, end)

  const currentDate = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pageUrls.map(url => `  <url>
    <loc>https://lician.com${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
