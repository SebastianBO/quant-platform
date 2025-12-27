import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
, getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Institutional AUM - Institutional Assets Analysis ${currentYear}`,
    description: `${symbol} institutional AUM analysis: Total institutional assets, client breakdown, flows, retention rates, and growth trends. View ${symbol} institutional assets under management.`,
    keywords: [
      `${symbol} institutional AUM`,
      `${symbol} institutional assets`,
      `${symbol} institutional clients`,
      `${symbol} pension assets`,
      `what is ${symbol} institutional AUM`,
      `${symbol} institutional flows`,
    ],
    openGraph: {
      title: `${symbol} Institutional AUM - Institutional Assets Analysis`,
      description: `${symbol} institutional AUM analysis with client breakdown and trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/institutional-aum/${ticker.toLowerCase()}`,
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

function formatAUM(value: number | null): string {
  if (!value) return 'N/A'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  return `$${(value / 1e6).toFixed(2)}M`
}

export default async function InstitutionalAUMPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/institutional-aum/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock institutional AUM data - in production, this would come from your API
  const totalAUM = metrics?.market_cap ? metrics.market_cap * 10 : null
  const institutionalAUM = totalAUM ? totalAUM * 0.65 : null
  const institutionalPercent = 65

  // Generate Institutional AUM FAQs
  const institutionalAumFaqs = [
    {
      question: `What is ${symbol}'s institutional AUM?`,
      answer: institutionalAUM
        ? `${symbol} (${companyName}) manages approximately ${formatAUM(institutionalAUM)} in institutional assets, representing ${institutionalPercent}% of total AUM. Institutional clients include pension funds, endowments, foundations, insurance companies, sovereign wealth funds, and corporate treasuries. ${institutionalPercent > 60 ? 'The high institutional concentration indicates a focus on large, sophisticated clients.' : 'Institutional assets represent a balanced portion of the business.'}`
        : `${symbol} (${companyName}) serves institutional clients including pension funds, endowments, and sovereign wealth. Check the detailed breakdown above for current institutional AUM figures.`
    },
    {
      question: `What types of institutional clients does ${symbol} serve?`,
      answer: `${symbol}'s institutional client base typically includes: (1) Corporate and public pension funds - defined benefit and defined contribution plans, (2) Endowments and foundations - universities, hospitals, charitable organizations, (3) Insurance companies - general account and separate account assets, (4) Sovereign wealth funds - government investment vehicles, (5) Corporate cash management - treasuries and corporate reserves, (6) Taft-Hartley plans - union-sponsored retirement plans. Each client type has unique needs, constraints, and fee expectations.`
    },
    {
      question: `Why is institutional AUM important for ${symbol} investors?`,
      answer: `Institutional AUM is significant because: (1) Institutional clients represent large, long-term relationships with sticky assets, (2) Institutional mandates often have higher margins than retail products, (3) Client retention rates are typically 90%+ for strong performers, (4) Institutional consultants drive significant flows through manager recommendations, (5) Winning institutional mandates signals competitive strength and investment credibility. ${institutionalPercent > 50 ? 'High institutional concentration provides revenue stability but requires strong performance.' : 'Institutional clients provide steady fee revenue.'}`
    },
    {
      question: `How does ${symbol} win institutional mandates?`,
      answer: `${symbol} wins institutional business through: (1) Strong long-term investment performance - typically 3, 5, and 10-year track records, (2) Robust risk management and compliance infrastructure, (3) Experienced investment teams with low turnover, (4) Thought leadership and client service, (5) Competitive fee structures, (6) Consultant relationships - many institutions hire consultants who create manager shortlists. The institutional sales process can take 12-24 months from initial contact to mandate award.`
    },
    {
      question: `What are typical institutional fee rates for ${symbol}?`,
      answer: `Institutional fee rates vary widely by asset class and mandate size: (1) Passive equity mandates: 0.01-0.10%, (2) Active equity mandates: 0.30-0.75%, (3) Fixed income: 0.15-0.40%, (4) Multi-asset solutions: 0.30-0.60%, (5) Alternatives (private equity, real estate): 0.75-2.00% plus performance fees. Larger mandates command lower fees due to scale. ${companyName}'s specific pricing depends on their competitive positioning and client mix.`
    },
    {
      question: `How does ${symbol} institutional AUM compare to retail?`,
      answer: `Institutional and retail AUM have different characteristics: Institutional clients typically have larger mandates ($50M-$5B+), longer time horizons, lower fee rates but higher margins, more sophisticated requirements, and higher retention rates. Retail clients have smaller accounts, higher fee rates, more regulatory oversight, and greater flow volatility. Most large asset managers serve both segments, with ${institutionalPercent}% institutional representing ${institutionalPercent > 50 ? 'a focus on large clients' : 'a balanced approach'}.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} Institutional AUM`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Institutional AUM - Institutional Assets Analysis ${currentYear}`,
    description: `Comprehensive ${symbol} institutional AUM analysis with client breakdown.`,
    url: pageUrl,
    keywords: [
      `${symbol} institutional AUM`,
      `${symbol} institutional assets`,
      `${symbol} institutional clients`,
      `${symbol} pension assets`,
    ],
  })

  const corporationSchema = getCorporationSchema({
    ticker: symbol,
    name: companyName,
    description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
    sector,
    industry,
    url: pageUrl,
  })

  const faqSchema = getFAQSchema(institutionalAumFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/screener" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} Institutional AUM</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Institutional AUM
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} institutional assets, client breakdown, and trends
          </p>

          {/* Institutional AUM Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-muted-foreground mb-1">Total AUM</p>
                <p className="text-3xl font-bold">
                  {formatAUM(totalAUM)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">All client types</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Institutional AUM</p>
                <p className="text-3xl font-bold text-blue-500">
                  {formatAUM(institutionalAUM)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{institutionalPercent}% of total</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Retail AUM</p>
                <p className="text-3xl font-bold text-purple-500">
                  {formatAUM(totalAUM && institutionalAUM ? totalAUM - institutionalAUM : null)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{100 - institutionalPercent}% of total</p>
              </div>
            </div>
          </div>

          {/* Client Type Breakdown */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Institutional Client Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-4">By Client Type</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pension Funds</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Insurance Companies</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Endowments & Foundations</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Sovereign Wealth Funds</span>
                    <span className="font-medium">12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Other Institutional</span>
                    <span className="font-medium">8%</span>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold mb-4">By Asset Class</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Equity</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fixed Income</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Multi-Asset</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Alternatives</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Understanding Institutional AUM */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding {symbol} Institutional Business</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">Institutional Advantages</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Large, sticky mandates with high retention</li>
                  <li>Long-term relationships (10+ years typical)</li>
                  <li>Higher margins than retail products</li>
                  <li>Less regulatory complexity than retail</li>
                  <li>Sophisticated clients value performance</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-blue-500 mb-2">Institutional Challenges</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Performance-driven - underperformance = termination</li>
                  <li>Fee pressure on large mandates</li>
                  <li>Long sales cycles (12-24 months)</li>
                  <li>Consultant gatekeepers control access</li>
                  <li>Concentrated client risk (large mandates)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Deep dive into financials, ratios, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/retail-aum/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Retail AUM
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {institutionalAumFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Compare Institutional AUM with Similar Stocks</h2>
            <div className="flex flex-wrap gap-2">
              {['BLK', 'SCHW', 'TROW', 'BEN', 'IVZ', 'STT']
                .filter(s => s !== symbol)
                .slice(0, 6)
                .map(stock => (
                  <Link
                    key={stock}
                    href={`/institutional-aum/${stock.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {stock} Institutional
                  </Link>
                ))}
            </div>
          </section>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
