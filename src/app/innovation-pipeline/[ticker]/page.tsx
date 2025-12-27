import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL , getTableSchema } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Innovation Pipeline - R&D & Product Innovation Analysis`,
    description: `${symbol} innovation pipeline analysis with R&D investment, product development, and innovation metrics. Understand how ${symbol} drives future growth through innovation and new products.`,
    keywords: [
      `${symbol} innovation`,
      `${symbol} innovation pipeline`,
      `${symbol} R&D`,
      `${symbol} product development`,
      `${symbol} new products`,
      `${symbol} research development`,
    ],
    openGraph: {
      title: `${symbol} Innovation Pipeline | R&D & Product Innovation`,
      description: `Comprehensive innovation analysis for ${symbol} with R&D investment and product pipeline.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/innovation-pipeline/${ticker.toLowerCase()}`,
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

export default async function InnovationPipelinePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/innovation-pipeline/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const innovationFaqs = [
    {
      question: `What is ${symbol} innovation pipeline?`,
      answer: `${symbol} innovation pipeline represents ${companyName}'s portfolio of products, services, and technologies currently in development. This includes R&D projects, clinical trials, product launches, technology investments, and strategic initiatives that will drive future revenue growth.`
    },
    {
      question: `How much does ${symbol} invest in R&D?`,
      answer: `${companyName}'s R&D investment is reported in financial statements as research and development expenses. Companies typically disclose R&D spending as absolute dollars and as a percentage of revenue, with levels varying significantly by industry and growth stage.`
    },
    {
      question: `Why is innovation important for ${symbol}?`,
      answer: `Innovation is crucial for ${symbol} because it drives competitive differentiation, future revenue streams, market leadership, premium pricing, and long-term sustainability. Strong innovation capabilities enable companies to adapt to changing markets and customer needs.`
    },
    {
      question: `What drives ${symbol} innovation success?`,
      answer: `${companyName}'s innovation success is driven by R&D investment, talent acquisition, technology partnerships, customer insights, agile development processes, risk-taking culture, patent portfolio, and the ability to commercialize innovations effectively.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Innovation`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Innovation Pipeline - R&D & Product Innovation Analysis`,
      description: `Comprehensive innovation analysis for ${symbol} (${companyName}) with R&D investment and product pipeline insights.`,
      url: pageUrl,
      keywords: [`${symbol} innovation`, `${symbol} R&D`, `${symbol} product development`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(innovationFaqs),
    getTableSchema({
      name: `${symbol} Innovation Pipeline History`,
      description: `Historical Innovation Pipeline data for ${companyName} (${symbol})`,
      url: pageUrl,
      columns: ['Period', 'Innovation Pipeline', 'Change'],
      rowCount: 5,
    }),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Analysis</Link>
            {' / '}
            <span>{symbol} Innovation</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Innovation Pipeline</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - R&D investment & product innovation analysis</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-xl border border-blue-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
              {snapshot.yearHigh && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W High</p>
                  <p className="text-2xl font-bold">${snapshot.yearHigh.toFixed(2)}</p>
                </div>
              )}
              {snapshot.yearLow && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W Low</p>
                  <p className="text-2xl font-bold">${snapshot.yearLow.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Innovation Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">💡</div>
              <h2 className="text-2xl font-bold mb-2">Innovation Pipeline Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed R&D metrics, product pipeline, and innovation strategy analysis for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=overview`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Company Analysis
              </Link>
            </div>
          </section>

          {/* Innovation Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Innovation Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'R&D Spend', desc: 'Total research investment' },
                { name: 'R&D to Revenue %', desc: 'Innovation intensity' },
                { name: 'Pipeline Projects', desc: 'Products in development' },
                { name: 'Patent Portfolio', desc: 'Intellectual property' },
                { name: 'New Product Revenue', desc: 'Innovation contribution' },
                { name: 'Time to Market', desc: 'Development velocity' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Innovation Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Innovation Tells You About {symbol}</h2>
            <div className="space-y-3">
              {[
                'Strong R&D investment indicates commitment to future growth and competitive positioning',
                'Robust innovation pipeline provides visibility into future revenue opportunities',
                'High percentage of revenue from new products demonstrates innovation effectiveness',
                'Patent portfolio strength reveals intellectual property advantages and barriers to entry',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-green-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Innovation Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} innovation pipeline and R&D strategy</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=overview`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Innovation
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {innovationFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="innovation-pipeline" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
