import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Insider Trading ${currentYear} - CEO & Executive Stock Purchases`,
    description: `${symbol} insider trading activity. Track insider buys and sells, CEO transactions, executive stock purchases, and Form 4 SEC filings.`,
    keywords: [
      `${symbol} insider trading`,
      `${symbol} insider buying`,
      `${symbol} insider selling`,
      `${symbol} CEO stock purchase`,
      `${symbol} executive trades`,
      `${symbol} form 4 filings`,
    ],
    openGraph: {
      title: `${symbol} Insider Trading - Executive Stock Transactions`,
      description: `Track ${symbol} insider buying and selling activity from executives and directors.`,
      type: 'article',
      url: `https://lician.com/insider/${ticker.toLowerCase()}`,
      images: [{
        url: `https://lician.com/api/og/stock/${ticker.toLowerCase()}`,
        width: 1200,
        height: 630,
        alt: `${symbol} Insider Trading Activity`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Insider Trading ${currentYear}`,
      description: `Track ${symbol} insider buying and selling activity from executives and directors.`,
      images: [`https://lician.com/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `https://lician.com/insider/${ticker.toLowerCase()}`,
    },
  }
}

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

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export default async function InsiderPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts, insiderTrades } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/insider/${ticker.toLowerCase()}`

  const trades = insiderTrades || []
  const buys = trades.filter((t: any) => t.transaction_shares > 0)
  const sells = trades.filter((t: any) => t.transaction_shares < 0)

  const totalBuyValue = buys.reduce((sum: number, t: any) => sum + (Math.abs(t.transaction_shares) * (t.price_per_share || 0)), 0)
  const totalSellValue = sells.reduce((sum: number, t: any) => sum + (Math.abs(t.transaction_shares) * (t.price_per_share || 0)), 0)

  const netSentiment = buys.length > sells.length ? 'Bullish' : sells.length > buys.length ? 'Bearish' : 'Neutral'

  const netBuyValue = totalBuyValue - totalSellValue
  const insiderFaqs = [
    {
      question: `Are insiders buying or selling ${symbol}?`,
      answer: trades.length > 0
        ? `In recent months, ${symbol} insiders have made ${buys.length} purchases and ${sells.length} sales. ${netSentiment === 'Bullish' ? 'More insider buying than selling suggests confidence in the company.' : netSentiment === 'Bearish' ? 'More insider selling may indicate executives taking profits.' : 'Insider activity is balanced between buys and sells.'}`
        : `Recent insider trading data for ${symbol} is being updated.`
    },
    {
      question: `What is ${symbol} insider trading activity?`,
      answer: trades.length > 0
        ? `${symbol} has had ${trades.length} insider transactions recently. Total insider buying: ${formatCurrency(totalBuyValue)}. Total insider selling: ${formatCurrency(totalSellValue)}.`
        : `Check back for the latest ${symbol} insider trading activity.`
    },
    {
      question: `Why do insiders buy ${symbol} stock?`,
      answer: `Insiders (executives, directors, major shareholders) may buy ${symbol} stock because they believe it's undervalued or expect positive developments. Insider buying is often seen as a bullish signal since they have deep knowledge of the company.`
    },
    {
      question: `Why do insiders sell ${symbol} stock?`,
      answer: `Insiders may sell for various reasons including diversification, personal financial needs, or as part of planned 10b5-1 trading plans. Insider selling doesn't always indicate bearish sentiment - context matters.`
    },
    {
      question: `What is the net insider activity for ${symbol}?`,
      answer: trades.length > 0
        ? `${symbol} insiders have net ${netBuyValue > 0 ? 'bought' : 'sold'} ${formatCurrency(Math.abs(netBuyValue))} worth of stock recently. ${netBuyValue > 0 ? 'Net buying indicates collective insider confidence in the stock.' : 'Net selling may reflect profit-taking or diversification needs.'}`
        : `Net insider activity data for ${symbol} will be available when recent transactions are reported.`
    },
    {
      question: `How do I track ${symbol} insider trades?`,
      answer: `${symbol} insider trades are disclosed through SEC Form 4 filings, which must be submitted within 2 business days of the transaction. This page automatically tracks and displays the latest Form 4 filings for ${companyName}.`
    },
    {
      question: `What is a 10b5-1 trading plan for ${symbol}?`,
      answer: `A 10b5-1 trading plan allows ${symbol} insiders to set up predetermined trading schedules when they don't have material non-public information. This protects executives from insider trading accusations while allowing them to diversify holdings.`
    },
    {
      question: `Is ${symbol} insider buying a good sign?`,
      answer: `${symbol} insider buying can be a positive signal since executives know the company intimately. However, context matters - consider the size of purchases relative to their holdings, the number of insiders buying, and whether it's open market purchases versus options exercises.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Insider Trading', url: `${SITE_URL}/insider-trading` },
      { name: `${symbol} Insider Trading`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Insider Trading ${currentYear} - Executive Stock Transactions`,
      description: `Track ${symbol} insider buying and selling activity from executives and directors.`,
      url: pageUrl,
      keywords: [`${symbol} insider trading`, `${symbol} insider buying`, `${symbol} insider selling`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(insiderFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/insider-trading" className="hover:text-foreground">Insider Trading</Link>
            {' / '}
            <span>{symbol}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Insider Trading {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Executive & director stock transactions</p>

          {/* Summary Card */}
          <div className={`p-8 rounded-xl border mb-8 ${netSentiment === 'Bullish' ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30' : netSentiment === 'Bearish' ? 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30' : 'bg-card border-border'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Net Sentiment</p>
                <p className={`text-2xl font-bold ${netSentiment === 'Bullish' ? 'text-green-500' : netSentiment === 'Bearish' ? 'text-red-500' : ''}`}>
                  {netSentiment}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Insider Buys</p>
                <p className="text-2xl font-bold text-green-500">{buys.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Insider Sells</p>
                <p className="text-2xl font-bold text-red-500">{sells.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Stock Price</p>
                <p className="text-2xl font-bold">${snapshot.price?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Value Summary */}
          {(totalBuyValue > 0 || totalSellValue > 0) && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Transaction Value Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/30">
                  <p className="text-muted-foreground text-sm mb-1">Total Insider Buying</p>
                  <p className="text-3xl font-bold text-green-500">{formatCurrency(totalBuyValue)}</p>
                </div>
                <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
                  <p className="text-muted-foreground text-sm mb-1">Total Insider Selling</p>
                  <p className="text-3xl font-bold text-red-500">{formatCurrency(totalSellValue)}</p>
                </div>
              </div>
            </section>
          )}

          {/* Recent Transactions */}
          {trades.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Recent Insider Transactions</h2>
              <div className="space-y-3">
                {trades.slice(0, 10).map((trade: any, i: number) => (
                  <div key={i} className={`p-4 rounded-lg border ${trade.transaction_shares > 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{trade.owner || 'Insider'}</p>
                        <p className="text-sm text-muted-foreground">{trade.owner_title || 'Executive'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{trade.transaction_date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${trade.transaction_shares > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trade.transaction_shares > 0 ? 'BUY' : 'SELL'}
                        </p>
                        <p className="text-sm">{Math.abs(trade.transaction_shares).toLocaleString()} shares</p>
                        {trade.price_per_share && <p className="text-xs text-muted-foreground">@ ${trade.price_per_share.toFixed(2)}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {trades.length === 0 && (
            <div className="bg-card p-8 rounded-lg border border-border text-center mb-12">
              <p className="text-muted-foreground">No recent insider trading activity for {symbol}.</p>
            </div>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">Institutional ownership, financials, and AI insights</p>
            <Link href={`/stock/${symbol.toLowerCase()}`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {insiderFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
