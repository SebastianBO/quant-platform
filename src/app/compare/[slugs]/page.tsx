import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slugs: string }>
}

function parseComparison(slugs: string): { ticker1: string; ticker2: string } | null {
  // Parse "aapl-vs-msft" format
  const match = slugs.match(/^([a-z0-9.]+)-vs-([a-z0-9.]+)$/i)
  if (!match) return null
  return { ticker1: match[1].toUpperCase(), ticker2: match[2].toUpperCase() }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params
  const parsed = parseComparison(slugs)

  if (!parsed) {
    return { title: 'Stock Comparison | Lician' }
  }

  const { ticker1, ticker2 } = parsed
  const currentYear = new Date().getFullYear()

  return {
    title: `${ticker1} vs ${ticker2}: Which Stock is Better in ${currentYear}?`,
    description: `Compare ${ticker1} vs ${ticker2} stock. Side-by-side analysis of valuation, growth, profitability, and investment potential.`,
    keywords: [
      `${ticker1} vs ${ticker2}`,
      `${ticker1} or ${ticker2}`,
      `${ticker1} compared to ${ticker2}`,
      `${ticker1} ${ticker2} comparison`,
      `which is better ${ticker1} or ${ticker2}`
    ],
    openGraph: {
      title: `${ticker1} vs ${ticker2} Stock Comparison`,
      description: `Head-to-head comparison of ${ticker1} and ${ticker2} stocks.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/compare/${slugs.toLowerCase()}`,
    },
  }
}

// Dynamic rendering - no static params to avoid slow build
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

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
    price: stock1Data.snapshot.price || 0,
    marketCap: stock1Data.snapshot.market_cap || 0,
    pe: stock1Data.metrics?.price_to_earnings_ratio || 0,
    eps: stock1Data.metrics?.earnings_per_share || 0,
    revenueGrowth: stock1Data.metrics?.revenue_growth || 0,
    grossMargin: stock1Data.metrics?.gross_margin || 0,
  }

  const stock2 = {
    symbol: ticker2,
    name: stock2Data.companyFacts?.name || ticker2,
    price: stock2Data.snapshot.price || 0,
    marketCap: stock2Data.snapshot.market_cap || 0,
    pe: stock2Data.metrics?.price_to_earnings_ratio || 0,
    eps: stock2Data.metrics?.earnings_per_share || 0,
    revenueGrowth: stock2Data.metrics?.revenue_growth || 0,
    grossMargin: stock2Data.metrics?.gross_margin || 0,
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    return `$${(cap / 1e6).toFixed(2)}M`
  }

  const getWinner = (val1: number, val2: number, higherIsBetter = true) => {
    if (val1 === 0 && val2 === 0) return 'tie'
    if (higherIsBetter) return val1 > val2 ? 'stock1' : val1 < val2 ? 'stock2' : 'tie'
    return val1 < val2 ? 'stock1' : val1 > val2 ? 'stock2' : 'tie'
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${ticker1} vs ${ticker2}: Stock Comparison ${currentYear}`,
    description: `Side-by-side comparison of ${ticker1} and ${ticker2} stocks.`,
    author: { '@type': 'Organization', name: 'Lician' },
    publisher: { '@type': 'Organization', name: 'Lician' },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{ticker1} vs {ticker2}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {ticker1} vs {ticker2}: Which Stock is Better?
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Side-by-side comparison of {stock1.name} and {stock2.name} in {currentYear}
          </p>

          {/* Header Cards */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <h2 className="text-2xl font-bold text-green-500 mb-2">{stock1.symbol}</h2>
              <p className="text-muted-foreground mb-4">{stock1.name}</p>
              <p className="text-3xl font-bold">${stock1.price.toFixed(2)}</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border text-center">
              <h2 className="text-2xl font-bold text-blue-500 mb-2">{stock2.symbol}</h2>
              <p className="text-muted-foreground mb-4">{stock2.name}</p>
              <p className="text-3xl font-bold">${stock2.price.toFixed(2)}</p>
            </div>
          </div>

          {/* Comparison Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Metrics Comparison</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-4">Metric</th>
                    <th className="text-center p-4 text-green-500">{stock1.symbol}</th>
                    <th className="text-center p-4 text-blue-500">{stock2.symbol}</th>
                    <th className="text-center p-4">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-4">Market Cap</td>
                    <td className="text-center p-4">{formatMarketCap(stock1.marketCap)}</td>
                    <td className="text-center p-4">{formatMarketCap(stock2.marketCap)}</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.marketCap, stock2.marketCap) === 'stock1' ? 'text-green-500' : getWinner(stock1.marketCap, stock2.marketCap) === 'stock2' ? 'text-blue-500' : ''}>
                        {getWinner(stock1.marketCap, stock2.marketCap) === 'stock1' ? stock1.symbol : getWinner(stock1.marketCap, stock2.marketCap) === 'stock2' ? stock2.symbol : 'Tie'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">P/E Ratio</td>
                    <td className="text-center p-4">{stock1.pe > 0 ? stock1.pe.toFixed(2) : 'N/A'}</td>
                    <td className="text-center p-4">{stock2.pe > 0 ? stock2.pe.toFixed(2) : 'N/A'}</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.pe, stock2.pe, false) === 'stock1' ? 'text-green-500' : getWinner(stock1.pe, stock2.pe, false) === 'stock2' ? 'text-blue-500' : ''}>
                        {getWinner(stock1.pe, stock2.pe, false) === 'stock1' ? stock1.symbol : getWinner(stock1.pe, stock2.pe, false) === 'stock2' ? stock2.symbol : 'Tie'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">EPS (TTM)</td>
                    <td className="text-center p-4">${stock1.eps > 0 ? stock1.eps.toFixed(2) : 'N/A'}</td>
                    <td className="text-center p-4">${stock2.eps > 0 ? stock2.eps.toFixed(2) : 'N/A'}</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.eps, stock2.eps) === 'stock1' ? 'text-green-500' : getWinner(stock1.eps, stock2.eps) === 'stock2' ? 'text-blue-500' : ''}>
                        {getWinner(stock1.eps, stock2.eps) === 'stock1' ? stock1.symbol : getWinner(stock1.eps, stock2.eps) === 'stock2' ? stock2.symbol : 'Tie'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">Revenue Growth</td>
                    <td className="text-center p-4">{(stock1.revenueGrowth * 100).toFixed(1)}%</td>
                    <td className="text-center p-4">{(stock2.revenueGrowth * 100).toFixed(1)}%</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.revenueGrowth, stock2.revenueGrowth) === 'stock1' ? 'text-green-500' : getWinner(stock1.revenueGrowth, stock2.revenueGrowth) === 'stock2' ? 'text-blue-500' : ''}>
                        {getWinner(stock1.revenueGrowth, stock2.revenueGrowth) === 'stock1' ? stock1.symbol : getWinner(stock1.revenueGrowth, stock2.revenueGrowth) === 'stock2' ? stock2.symbol : 'Tie'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4">Gross Margin</td>
                    <td className="text-center p-4">{(stock1.grossMargin * 100).toFixed(1)}%</td>
                    <td className="text-center p-4">{(stock2.grossMargin * 100).toFixed(1)}%</td>
                    <td className="text-center p-4">
                      <span className={getWinner(stock1.grossMargin, stock2.grossMargin) === 'stock1' ? 'text-green-500' : getWinner(stock1.grossMargin, stock2.grossMargin) === 'stock2' ? 'text-blue-500' : ''}>
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
              className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 p-6 rounded-xl text-center"
            >
              <p className="font-bold text-green-500 mb-2">Analyze {stock1.symbol}</p>
              <p className="text-sm text-muted-foreground">Full quant analysis</p>
            </Link>
            <Link
              href={`/dashboard?ticker=${stock2.symbol}&tab=quant`}
              className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 p-6 rounded-xl text-center"
            >
              <p className="font-bold text-blue-500 mb-2">Analyze {stock2.symbol}</p>
              <p className="text-sm text-muted-foreground">Full quant analysis</p>
            </Link>
          </section>

          <section className="mt-12">
            <h3 className="text-lg font-bold mb-4">Related Comparisons</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/compare/aapl-vs-msft" className="text-sm text-green-500 hover:underline">AAPL vs MSFT</Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/compare/nvda-vs-amd" className="text-sm text-green-500 hover:underline">NVDA vs AMD</Link>
              <span className="text-muted-foreground">|</span>
              <Link href="/compare/googl-vs-meta" className="text-sm text-green-500 hover:underline">GOOGL vs META</Link>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
