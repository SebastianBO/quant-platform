import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'
import { PopularComparisons } from '@/components/seo/RelatedLinks'
import { LastUpdatedStatic } from '@/components/seo/LastUpdated'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

// Popular stock comparisons for static generation (100+ comparisons)
const POPULAR_COMPARISONS = [
  // Tech Giants - All Major Permutations (AAPL, MSFT, GOOGL, AMZN, META, NVDA, TSLA)
  'aapl-vs-msft',
  'aapl-vs-googl',
  'aapl-vs-amzn',
  'aapl-vs-meta',
  'aapl-vs-nvda',
  'aapl-vs-tsla',
  'msft-vs-googl',
  'msft-vs-amzn',
  'msft-vs-meta',
  'msft-vs-nvda',
  'msft-vs-tsla',
  'googl-vs-amzn',
  'googl-vs-meta',
  'googl-vs-nvda',
  'googl-vs-tsla',
  'amzn-vs-meta',
  'amzn-vs-nvda',
  'amzn-vs-tsla',
  'meta-vs-nvda',
  'meta-vs-tsla',
  'nvda-vs-tsla',

  // Semiconductors
  'nvda-vs-amd',
  'nvda-vs-intc',
  'nvda-vs-avgo',
  'nvda-vs-qcom',
  'nvda-vs-mu',
  'amd-vs-intc',
  'amd-vs-avgo',
  'amd-vs-qcom',
  'amd-vs-mu',
  'intc-vs-avgo',
  'intc-vs-qcom',
  'intc-vs-mu',
  'avgo-vs-qcom',
  'avgo-vs-mu',
  'qcom-vs-mu',

  // Finance - Banks & Payments
  'jpm-vs-bac',
  'jpm-vs-wfc',
  'jpm-vs-c',
  'jpm-vs-gs',
  'jpm-vs-ms',
  'bac-vs-wfc',
  'bac-vs-c',
  'bac-vs-gs',
  'wfc-vs-c',
  'wfc-vs-gs',
  'gs-vs-ms',
  'v-vs-ma',
  'v-vs-axp',
  'v-vs-pypl',
  'ma-vs-axp',
  'ma-vs-pypl',
  'axp-vs-pypl',

  // Auto/EV
  'tsla-vs-f',
  'tsla-vs-gm',
  'tsla-vs-rivn',
  'tsla-vs-lcid',
  'f-vs-gm',
  'f-vs-rivn',
  'gm-vs-rivn',
  'rivn-vs-lcid',

  // Streaming/Entertainment
  'dis-vs-nflx',
  'dis-vs-wbd',
  'dis-vs-para',
  'nflx-vs-wbd',
  'nflx-vs-para',
  'wbd-vs-para',

  // Retail
  'amzn-vs-wmt',
  'wmt-vs-tgt',
  'wmt-vs-cost',
  'cost-vs-tgt',
  'hd-vs-low',
  'hd-vs-wmt',
  'low-vs-wmt',
  'tgt-vs-cost',

  // Cloud/SaaS
  'crm-vs-now',
  'crm-vs-orcl',
  'crm-vs-adbe',
  'now-vs-orcl',
  'snow-vs-pltr',
  'snow-vs-ddog',
  'snow-vs-crwd',
  'ddog-vs-crwd',
  'pltr-vs-ddog',
  'pltr-vs-crwd',
  'orcl-vs-sap',
  'adbe-vs-crm',

  // Healthcare
  'jnj-vs-pfe',
  'jnj-vs-lly',
  'jnj-vs-abbv',
  'unh-vs-cvs',
  'unh-vs-ci',
  'lly-vs-mrk',
  'lly-vs-pfe',
  'abbv-vs-bmy',
  'abbv-vs-pfe',
  'pfe-vs-mrk',
  'cvs-vs-ci',
  'bmy-vs-mrk',

  // Energy
  'xom-vs-cvx',
  'xom-vs-cop',
  'xom-vs-slb',
  'cvx-vs-cop',
  'cvx-vs-hal',
  'cop-vs-eog',
  'slb-vs-hal',
  'eog-vs-slb',

  // ETFs - Index & Sector
  'spy-vs-voo',
  'spy-vs-qqq',
  'spy-vs-vti',
  'spy-vs-dia',
  'spy-vs-iwm',
  'voo-vs-vti',
  'voo-vs-qqq',
  'qqq-vs-vti',
  'qqq-vs-arkk',
  'qqq-vs-iwm',
  'vti-vs-iwm',
  'dia-vs-qqq',
  'arkk-vs-spy',

  // Consumer Goods
  'ko-vs-pep',
  'pg-vs-ul',
  'cl-vs-pg',
  'ko-vs-mnst',

  // Telecom
  'vz-vs-t',
  't-vs-tmus',
  'vz-vs-tmus',

  // Aerospace & Defense
  'ba-vs-lmt',
  'ba-vs-rtx',
  'lmt-vs-noc',
  'rtx-vs-lmt',
]

export async function generateStaticParams() {
  return POPULAR_COMPARISONS.map((slugs) => ({ slugs }))
}

interface Props {
  params: Promise<{ slugs: string }>
}

function parseComparison(slugs: string): { ticker1: string; ticker2: string } | null {
  // Parse "aapl-vs-msft" format
  const match = slugs.match(/^([a-z0-9.]+)-vs-([a-z0-9.]+)$/i)
  if (!match) return null
  return { ticker1: match[1].toUpperCase(), ticker2: match[2].toUpperCase() }
}

// Fetch stock data for metadata
async function getStockDataForMeta(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

// Safe formatting helper for metadata (before safeFixed is defined in component)
function safeNum(val: unknown, decimals: number = 0): string {
  if (val === null || val === undefined) return 'N/A'
  const num = Number(val)
  if (isNaN(num)) return 'N/A'
  return num.toFixed(decimals)
}

// Format market cap for display
function formatMarketCapShort(cap: number): string {
  if (typeof cap !== 'number' || isNaN(cap)) return 'N/A'
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(0)}B`
  return `$${(cap / 1e6).toFixed(0)}M`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params
  const parsed = parseComparison(slugs)

  if (!parsed) {
    return { title: 'Stock Comparison | Lician' }
  }

  const { ticker1, ticker2 } = parsed
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().toLocaleString('en-US', { month: 'short' })
  const currentDay = new Date().getDate()

  // Fetch real data for both stocks
  const [stock1Data, stock2Data] = await Promise.all([
    getStockDataForMeta(ticker1),
    getStockDataForMeta(ticker2)
  ])

  const price1 = stock1Data?.snapshot?.price
  const price2 = stock2Data?.snapshot?.price
  const pe1 = stock1Data?.metrics?.price_to_earnings_ratio
  const pe2 = stock2Data?.metrics?.price_to_earnings_ratio
  const cap1 = stock1Data?.snapshot?.market_cap
  const cap2 = stock2Data?.snapshot?.market_cap

  // Build dynamic title (under 60 chars)
  // Format: "AAPL vs MSFT 2026: Which Stock Wins?"
  let title = `${ticker1} vs ${ticker2} ${currentYear}: Which Stock Wins?`
  if (title.length > 60) {
    title = `${ticker1} vs ${ticker2}: Stock Comparison ${currentYear}`
  }
  if (title.length > 60) {
    title = `${ticker1} vs ${ticker2} | Stock Comparison`
  }

  // Build dynamic description (155-160 chars max)
  // Formula: Both prices + Key metrics + Winner hint + CTA
  let description = `Compare ${ticker1} vs ${ticker2} stock. Side-by-side valuation, growth & profitability analysis. Updated ${currentMonth} ${currentDay}.`

  // Only include price in description if both prices are valid (non-zero)
  const hasValidPrices = typeof price1 === 'number' && typeof price2 === 'number' &&
                         !isNaN(price1) && !isNaN(price2) && price1 > 0 && price2 > 0

  if (hasValidPrices) {
    const peStr1 = typeof pe1 === 'number' && pe1 > 0 ? `, PE ${safeNum(pe1, 0)}` : ''
    const peStr2 = typeof pe2 === 'number' && pe2 > 0 ? `, PE ${safeNum(pe2, 0)}` : ''
    const stock1Str = `${ticker1} ($${safeNum(price1, 0)}${peStr1})`
    const stock2Str = `${ticker2} ($${safeNum(price2, 0)}${peStr2})`
    const ctaStr = `. Full comparison & winner.`

    description = `${stock1Str} vs ${stock2Str}${ctaStr}`

    // Add cap info if space allows
    const hasValidCaps = typeof cap1 === 'number' && typeof cap2 === 'number' && cap1 > 0 && cap2 > 0
    if (description.length < 130 && hasValidCaps) {
      const capStr = ` ${formatMarketCapShort(cap1)} vs ${formatMarketCapShort(cap2)} cap.`
      if ((description + capStr).length <= 160) {
        description = `${stock1Str} vs ${stock2Str}.${capStr.slice(1)}${ctaStr}`
      }
    }

    if (description.length > 160) {
      description = `${ticker1} at $${safeNum(price1, 0)} vs ${ticker2} at $${safeNum(price2, 0)}. Compare PE, growth & margins. See which wins.`
    }
  }

  return {
    title,
    description,
    keywords: [
      `${ticker1} vs ${ticker2}`,
      `${ticker1} or ${ticker2}`,
      `${ticker1} compared to ${ticker2}`,
      `${ticker1} ${ticker2} comparison`,
      `which is better ${ticker1} or ${ticker2}`
    ],
    openGraph: {
      title: `${ticker1} vs ${ticker2} Stock Comparison`,
      description,
      type: 'article',
      url: `${SITE_URL}/compare/${slugs.toLowerCase()}`,
      images: [{
        url: `${SITE_URL}/api/og/stock/${ticker1.toLowerCase()}`,
        width: 1200,
        height: 630,
        alt: `${ticker1} vs ${ticker2} Stock Comparison`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${ticker1} vs ${ticker2}: Which Stock is Better?`,
      description,
      images: [`${SITE_URL}/api/og/stock/${ticker1.toLowerCase()}`],
    },
    alternates: {
      canonical: `https://lician.com/compare/${slugs.toLowerCase()}`,
    },
  }
}

// Allow dynamic paths beyond the static ones
export const dynamicParams = true

// ISR: Cache pages for 1 hour - critical for Google indexing at scale
export const revalidate = 3600

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params
  const parsed = parseComparison(slugs)

  if (!parsed) {
    notFound()
  }

  const { ticker1, ticker2 } = parsed
  const currentYear = new Date().getFullYear()

  // Capture the data fetch time for freshness signal
  const dataFetchTime = new Date()

  const [stock1Data, stock2Data] = await Promise.all([
    getStockData(ticker1),
    getStockData(ticker2)
  ])

  if (!stock1Data?.snapshot || !stock2Data?.snapshot) {
    notFound()
  }

  const stock1 = {
    symbol: ticker1,
    name: stock1Data.companyFacts?.name || ticker1,
    price: stock1Data.snapshot.price || null,
    marketCap: stock1Data.snapshot.market_cap || null,
    pe: stock1Data.metrics?.price_to_earnings_ratio || null,
    eps: stock1Data.metrics?.earnings_per_share || null,
    revenueGrowth: stock1Data.metrics?.revenue_growth ?? null,
    grossMargin: stock1Data.metrics?.gross_margin ?? null,
  }

  const stock2 = {
    symbol: ticker2,
    name: stock2Data.companyFacts?.name || ticker2,
    price: stock2Data.snapshot.price || null,
    marketCap: stock2Data.snapshot.market_cap || null,
    pe: stock2Data.metrics?.price_to_earnings_ratio || null,
    eps: stock2Data.metrics?.earnings_per_share || null,
    revenueGrowth: stock2Data.metrics?.revenue_growth ?? null,
    grossMargin: stock2Data.metrics?.gross_margin ?? null,
  }

  // Safe number formatting helper - prevents toFixed errors on null/undefined/NaN
  const safeFixed = (val: unknown, decimals: number = 1): string => {
    if (val === null || val === undefined) return 'N/A'
    const num = Number(val)
    if (isNaN(num)) return 'N/A'
    return num.toFixed(decimals)
  }

  const formatMarketCap = (cap: number | null) => {
    if (cap === null || typeof cap !== 'number' || isNaN(cap) || cap === 0) return 'N/A'
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    return `$${(cap / 1e6).toFixed(2)}M`
  }

  const getWinner = (val1: number | null, val2: number | null, higherIsBetter = true) => {
    // Handle null/undefined/zero as "no data"
    const v1Valid = val1 !== null && val1 !== undefined && val1 !== 0
    const v2Valid = val2 !== null && val2 !== undefined && val2 !== 0
    if (!v1Valid && !v2Valid) return 'tie'
    if (!v1Valid) return 'stock2'
    if (!v2Valid) return 'stock1'
    if (higherIsBetter) return val1 > val2 ? 'stock1' : val1 < val2 ? 'stock2' : 'tie'
    return val1 < val2 ? 'stock1' : val1 > val2 ? 'stock2' : 'tie'
  }

  const pageUrl = `${SITE_URL}/compare/${slugs.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${ticker1} vs ${ticker2}`, url: pageUrl },
  ])

  // Article Schema with dateModified
  const articleSchema = getArticleSchema({
    headline: `${ticker1} vs ${ticker2}: Which Stock is Better in ${currentYear}?`,
    description: `Head-to-head comparison of ${stock1.name} (${ticker1}) and ${stock2.name} (${ticker2}). Compare valuation, growth, profitability, and investment potential.`,
    url: pageUrl,
    dateModified: dataFetchTime.toISOString(),
    keywords: [
      `${ticker1} vs ${ticker2}`,
      `${ticker1} or ${ticker2}`,
      `compare ${ticker1} ${ticker2}`,
      `which stock is better ${ticker1} ${ticker2}`,
    ],
  })

  // FAQ Schema for comparison - expanded to 8 FAQs for better SEO
  const peWinner = stock1.pe > 0 && stock2.pe > 0 ? (stock1.pe < stock2.pe ? ticker1 : ticker2) : null
  const growthWinner = stock1.revenueGrowth > stock2.revenueGrowth ? ticker1 : stock2.revenueGrowth > stock1.revenueGrowth ? ticker2 : null
  const marginWinner = stock1.grossMargin > stock2.grossMargin ? ticker1 : stock2.grossMargin > stock1.grossMargin ? ticker2 : null
  const capWinner = stock1.marketCap > stock2.marketCap ? ticker1 : ticker2

  const comparisonFaqs = [
    {
      question: `Is ${ticker1} or ${ticker2} a better investment?`,
      answer: `Comparing ${ticker1} and ${ticker2}: ${stock1.name} has a market cap of ${formatMarketCap(stock1.marketCap)} while ${stock2.name} has ${formatMarketCap(stock2.marketCap)}. Both companies have their strengths - use our detailed metrics comparison to make an informed decision.`,
    },
    {
      question: `What is the difference between ${ticker1} and ${ticker2}?`,
      answer: `${ticker1} (${stock1.name}) and ${ticker2} (${stock2.name}) differ in valuation, growth rates, and profitability metrics. Our comparison shows which company leads in each category.`,
    },
    {
      question: `Which stock has better value: ${ticker1} or ${ticker2}?`,
      answer: `Based on P/E ratios, ${peWinner ? (peWinner === ticker1 ? `${ticker1} trades at a lower multiple (${safeFixed(stock1.pe, 1)}x vs ${safeFixed(stock2.pe, 1)}x)` : `${ticker2} trades at a lower multiple (${safeFixed(stock2.pe, 1)}x vs ${safeFixed(stock1.pe, 1)}x)`) : 'compare detailed valuation metrics on our dashboard'}.`,
    },
    {
      question: `Which is growing faster: ${ticker1} or ${ticker2}?`,
      answer: growthWinner
        ? `${growthWinner === ticker1 ? ticker1 : ticker2} has higher revenue growth at ${safeFixed((growthWinner === ticker1 ? stock1.revenueGrowth : stock2.revenueGrowth) * 100, 1)}% vs ${safeFixed((growthWinner === ticker1 ? stock2.revenueGrowth : stock1.revenueGrowth) * 100, 1)}% for ${growthWinner === ticker1 ? ticker2 : ticker1}.`
        : `Both ${ticker1} and ${ticker2} show similar growth rates. Check our detailed analysis for quarterly trends.`,
    },
    {
      question: `Which company is more profitable: ${ticker1} or ${ticker2}?`,
      answer: marginWinner
        ? `${marginWinner === ticker1 ? stock1.name : stock2.name} (${marginWinner}) has higher gross margins at ${safeFixed((marginWinner === ticker1 ? stock1.grossMargin : stock2.grossMargin) * 100, 1)}% compared to ${safeFixed((marginWinner === ticker1 ? stock2.grossMargin : stock1.grossMargin) * 100, 1)}% for ${marginWinner === ticker1 ? ticker2 : ticker1}.`
        : `Both companies show comparable profitability metrics. View the full comparison above for detailed analysis.`,
    },
    {
      question: `Which is the larger company: ${ticker1} or ${ticker2}?`,
      answer: `${capWinner === ticker1 ? stock1.name : stock2.name} (${capWinner}) is larger with a market cap of ${formatMarketCap(capWinner === ticker1 ? stock1.marketCap : stock2.marketCap)} compared to ${formatMarketCap(capWinner === ticker1 ? stock2.marketCap : stock1.marketCap)} for ${capWinner === ticker1 ? ticker2 : ticker1}.`,
    },
    {
      question: `Should I buy ${ticker1} or ${ticker2} in ${currentYear}?`,
      answer: `Both ${ticker1} and ${ticker2} have investment merit. ${ticker1} trades at $${safeFixed(stock1.price, 2)} while ${ticker2} trades at $${safeFixed(stock2.price, 2)}. Consider your investment goals, risk tolerance, and portfolio diversification before deciding. Our AI analysis tools can provide personalized insights.`,
    },
    {
      question: `What are the key differences between ${ticker1} and ${ticker2} stock?`,
      answer: `Key differences: Market Cap (${formatMarketCap(stock1.marketCap)} vs ${formatMarketCap(stock2.marketCap)}), P/E Ratio (${stock1.pe > 0 ? safeFixed(stock1.pe, 1) + 'x' : 'N/A'} vs ${stock2.pe > 0 ? safeFixed(stock2.pe, 1) + 'x' : 'N/A'}), Revenue Growth (${safeFixed(stock1.revenueGrowth * 100, 1)}% vs ${safeFixed(stock2.revenueGrowth * 100, 1)}%), Gross Margin (${safeFixed(stock1.grossMargin * 100, 1)}% vs ${safeFixed(stock2.grossMargin * 100, 1)}%).`,
    },
  ]
  const faqSchema = getFAQSchema(comparisonFaqs)

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]) }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white transition-colors duration-100">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white transition-colors duration-100">Stocks</Link>
            {' / '}
            <span>{ticker1} vs {ticker2}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {ticker1} vs {ticker2}: Which Stock is Better?
          </h1>
          <p className="text-xl text-[#868f97] mb-4">
            Side-by-side comparison of {stock1.name} and {stock2.name} in {currentYear}
          </p>

          {/* Last Updated Timestamp */}
          <LastUpdatedStatic
            timestamp={dataFetchTime}
            className="mb-8"
            prefix="Comparison Updated"
          />

          {/* Header Cards */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08] text-center">
              <h2 className="text-2xl font-bold text-[#4ebe96] mb-2">{stock1.symbol}</h2>
              <p className="text-[#868f97] mb-4">{stock1.name}</p>
              <p className="text-3xl font-bold">{stock1.price && stock1.price > 0 ? `$${stock1.price.toFixed(2)}` : '—'}</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08] text-center">
              <h2 className="text-2xl font-bold text-[#479ffa] mb-2">{stock2.symbol}</h2>
              <p className="text-[#868f97] mb-4">{stock2.name}</p>
              <p className="text-3xl font-bold">{stock2.price && stock2.price > 0 ? `$${stock2.price.toFixed(2)}` : '—'}</p>
            </div>
          </div>

          {/* Comparison Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Metrics Comparison</h2>
            <div className="bg-[#1a1a1a] rounded-xl border border-white/[0.08] overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/[0.05]">
                  <tr>
                    <th className="text-left p-4">Metric</th>
                    <th className="text-center p-4 text-[#4ebe96]">{stock1.symbol}</th>
                    <th className="text-center p-4 text-[#479ffa]">{stock2.symbol}</th>
                    <th className="text-center p-4">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]">
                  <tr>
                    <td className="p-4">Market Cap</td>
                    <td className="text-center p-4">{formatMarketCap(stock1.marketCap)}</td>
                    <td className="text-center p-4">{formatMarketCap(stock2.marketCap)}</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.marketCap, stock2.marketCap) === 'stock1' ? 'text-[#4ebe96]' : getWinner(stock1.marketCap, stock2.marketCap) === 'stock2' ? 'text-[#479ffa]' : ''}>
                        {getWinner(stock1.marketCap, stock2.marketCap) === 'stock1' ? stock1.symbol : getWinner(stock1.marketCap, stock2.marketCap) === 'stock2' ? stock2.symbol : 'Tie'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">P/E Ratio</td>
                    <td className="text-center p-4">{typeof stock1.pe === 'number' && stock1.pe > 0 ? safeFixed(stock1.pe, 2) : 'N/A'}</td>
                    <td className="text-center p-4">{typeof stock2.pe === 'number' && stock2.pe > 0 ? safeFixed(stock2.pe, 2) : 'N/A'}</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.pe, stock2.pe, false) === 'stock1' ? 'text-[#4ebe96]' : getWinner(stock1.pe, stock2.pe, false) === 'stock2' ? 'text-[#479ffa]' : ''}>
                        {getWinner(stock1.pe, stock2.pe, false) === 'stock1' ? stock1.symbol : getWinner(stock1.pe, stock2.pe, false) === 'stock2' ? stock2.symbol : 'Tie'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">EPS (TTM)</td>
                    <td className="text-center p-4">${typeof stock1.eps === 'number' && stock1.eps > 0 ? safeFixed(stock1.eps, 2) : 'N/A'}</td>
                    <td className="text-center p-4">${typeof stock2.eps === 'number' && stock2.eps > 0 ? safeFixed(stock2.eps, 2) : 'N/A'}</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.eps, stock2.eps) === 'stock1' ? 'text-[#4ebe96]' : getWinner(stock1.eps, stock2.eps) === 'stock2' ? 'text-[#479ffa]' : ''}>
                        {getWinner(stock1.eps, stock2.eps) === 'stock1' ? stock1.symbol : getWinner(stock1.eps, stock2.eps) === 'stock2' ? stock2.symbol : 'Tie'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">Revenue Growth</td>
                    <td className="text-center p-4">{safeFixed(stock1.revenueGrowth * 100, 1)}%</td>
                    <td className="text-center p-4">{safeFixed(stock2.revenueGrowth * 100, 1)}%</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.revenueGrowth, stock2.revenueGrowth) === 'stock1' ? 'text-[#4ebe96]' : getWinner(stock1.revenueGrowth, stock2.revenueGrowth) === 'stock2' ? 'text-[#479ffa]' : ''}>
                        {getWinner(stock1.revenueGrowth, stock2.revenueGrowth) === 'stock1' ? stock1.symbol : getWinner(stock1.revenueGrowth, stock2.revenueGrowth) === 'stock2' ? stock2.symbol : 'Tie'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">Gross Margin</td>
                    <td className="text-center p-4">{safeFixed(stock1.grossMargin * 100, 1)}%</td>
                    <td className="text-center p-4">{safeFixed(stock2.grossMargin * 100, 1)}%</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.grossMargin, stock2.grossMargin) === 'stock1' ? 'text-[#4ebe96]' : getWinner(stock1.grossMargin, stock2.grossMargin) === 'stock2' ? 'text-[#479ffa]' : ''}>
                        {getWinner(stock1.grossMargin, stock2.grossMargin) === 'stock1' ? stock1.symbol : getWinner(stock1.grossMargin, stock2.grossMargin) === 'stock2' ? stock2.symbol : 'Tie'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <section className="grid grid-cols-2 gap-6">
            <Link
              href={`/dashboard?ticker=${stock1.symbol}&tab=quant`}
              className="bg-[#4ebe96]/20 hover:bg-[#4ebe96]/30 border border-[#4ebe96]/30 p-6 rounded-xl text-center transition-colors duration-100"
            >
              <p className="font-bold text-[#4ebe96] mb-2">Analyze {stock1.symbol}</p>
              <p className="text-sm text-[#868f97]">Full quant analysis</p>
            </Link>
            <Link
              href={`/dashboard?ticker=${stock2.symbol}&tab=quant`}
              className="bg-[#479ffa]/20 hover:bg-[#479ffa]/30 border border-[#479ffa]/30 p-6 rounded-xl text-center transition-colors duration-100"
            >
              <p className="font-bold text-[#479ffa] mb-2">Analyze {stock2.symbol}</p>
              <p className="text-sm text-[#868f97]">Full quant analysis</p>
            </Link>
          </section>

          {/* Individual Stock Analysis Links */}
          <section className="mt-12">
            <h3 className="text-lg font-bold mb-4">Analyze Each Stock</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-[#4ebe96]">{stock1.symbol}</h4>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/should-i-buy/${stock1.symbol.toLowerCase()}`} className="text-sm text-[#868f97] hover:text-white transition-colors duration-100">
                    Should I Buy {stock1.symbol}?
                  </Link>
                  <Link href={`/prediction/${stock1.symbol.toLowerCase()}`} className="text-sm text-[#868f97] hover:text-white transition-colors duration-100">
                    {stock1.symbol} Prediction
                  </Link>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-[#479ffa]">{stock2.symbol}</h4>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/should-i-buy/${stock2.symbol.toLowerCase()}`} className="text-sm text-[#868f97] hover:text-white transition-colors duration-100">
                    Should I Buy {stock2.symbol}?
                  </Link>
                  <Link href={`/prediction/${stock2.symbol.toLowerCase()}`} className="text-sm text-[#868f97] hover:text-white transition-colors duration-100">
                    {stock2.symbol} Prediction
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {comparisonFaqs.map((faq, index) => (
                <div key={index} className="bg-[#1a1a1a] p-5 rounded-lg border border-white/[0.08]">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Comparisons */}
          <PopularComparisons currentSlug={slugs} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
