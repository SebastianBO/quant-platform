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

  return {
    title: `${symbol} PEG Ratio - Price/Earnings to Growth Analysis`,
    description: `${symbol} PEG ratio analysis. Compare P/E ratio to earnings growth rate. View PEG ratio trends, industry averages, and value assessment for ${symbol} stock.`,
    keywords: [
      `${symbol} PEG ratio`,
      `${symbol} PEG`,
      `${symbol} price to earnings growth`,
      `${symbol} PEG analysis`,
      `${symbol} growth valuation`,
      `${symbol} PEG trend`,
    ],
    openGraph: {
      title: `${symbol} PEG Ratio | Price/Earnings to Growth Analysis`,
      description: `Comprehensive ${symbol} PEG ratio analysis with growth metrics and valuation assessment.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/peg-ratio/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function PEGRatioPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/peg-ratio/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const pegRatio = snapshot.pegRatio || 0
  const peRatio = snapshot.pe || 0

  const pegFaqs = [
    {
      question: `What is ${symbol} PEG ratio?`,
      answer: `${symbol} has a PEG ratio of ${pegRatio.toFixed(2)}. The PEG ratio divides the P/E ratio by earnings growth rate to assess if a stock is overvalued or undervalued relative to its growth potential.`
    },
    {
      question: `Is ${symbol} PEG ratio good?`,
      answer: `A PEG ratio below 1.0 generally indicates undervaluation, while above 1.0 suggests overvaluation. ${symbol}'s PEG of ${pegRatio.toFixed(2)} should be compared to industry peers and historical averages for proper context.`
    },
    {
      question: `How is PEG ratio calculated?`,
      answer: `PEG ratio = (P/E ratio) / (Earnings growth rate). For ${symbol}, this divides its P/E ratio of ${peRatio.toFixed(2)} by its expected earnings growth rate.`
    },
    {
      question: `What is a good PEG ratio for growth stocks?`,
      answer: `Growth investors typically look for PEG ratios between 0.5 and 2.0. A PEG below 1.0 suggests the stock may be undervalued relative to growth, while above 2.0 may indicate overvaluation.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} PEG Ratio`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} PEG Ratio - Price/Earnings to Growth Analysis`,
      description: `PEG ratio analysis for ${symbol} (${companyName}) with growth metrics and valuation.`,
      url: pageUrl,
      keywords: [`${symbol} PEG ratio`, `${symbol} PEG`, `${symbol} growth valuation`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(pegFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} PEG Ratio</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} PEG Ratio Analysis</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Price/Earnings to Growth ratio analysis</p>

          {/* PEG Ratio Card */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">PEG Ratio</p>
                <p className="text-4xl font-bold">{pegRatio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">P/E Ratio</p>
                <p className="text-3xl font-bold">{peRatio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold">${price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* What is PEG Ratio */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is PEG Ratio?</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                The PEG (Price/Earnings to Growth) ratio is a valuation metric that refines the P/E ratio by accounting for expected earnings growth.
                It helps investors determine if a stock is fairly valued relative to its growth potential.
              </p>
              <p className="text-muted-foreground">
                A PEG ratio of 1.0 suggests the stock is fairly valued. Below 1.0 may indicate undervaluation, while above 1.0 could signal overvaluation.
              </p>
            </div>
          </section>

          {/* PEG Interpretation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Interpreting {symbol} PEG Ratio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-green-500 text-2xl font-bold mb-2">&lt; 1.0</div>
                <p className="font-bold mb-1">Potentially Undervalued</p>
                <p className="text-sm text-muted-foreground">Stock may be trading below its growth potential</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-yellow-500 text-2xl font-bold mb-2">1.0 - 2.0</div>
                <p className="font-bold mb-1">Fairly Valued</p>
                <p className="text-sm text-muted-foreground">Stock price aligns with growth expectations</p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="text-red-500 text-2xl font-bold mb-2">&gt; 2.0</div>
                <p className="font-bold mb-1">Potentially Overvalued</p>
                <p className="text-sm text-muted-foreground">Stock may be priced above growth justification</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Full Valuation Analysis for {symbol}</h2>
            <p className="text-muted-foreground mb-6">Get comprehensive valuation metrics, peer comparisons, and AI-powered insights</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=valuation`} className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {pegFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="peg-ratio" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
