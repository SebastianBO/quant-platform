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
    title: `${symbol} R&D Spending - Research & Development Analysis`,
    description: `${symbol} research and development spending analysis with R&D trends, innovation investment, and efficiency metrics. Understand ${symbol}'s commitment to innovation and future growth.`,
    keywords: [
      `${symbol} R&D spending`,
      `${symbol} research and development`,
      `${symbol} innovation investment`,
      `${symbol} R&D to revenue`,
      `${symbol} R&D expenses`,
      `${symbol} technology investment`,
    ],
    openGraph: {
      title: `${symbol} R&D Spending | Research & Development Investment Analysis`,
      description: `Comprehensive R&D spending analysis for ${symbol} with innovation investment trends and efficiency metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/research-development/${ticker.toLowerCase()}`,
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

export default async function ResearchDevelopmentPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/research-development/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const rdFaqs = [
    {
      question: `What is ${symbol} R&D spending?`,
      answer: `${symbol} R&D (Research & Development) spending represents the investment ${companyName} makes in creating new products, technologies, and innovations. R&D expenses include salaries for researchers, laboratory costs, testing, prototypes, and development of new intellectual property.`
    },
    {
      question: `How much does ${symbol} spend on R&D?`,
      answer: `To see ${symbol}'s current R&D spending, check the income statement in the financial reports. R&D expenses are typically listed as operating expenses. The amount varies based on industry - technology and pharmaceutical companies usually spend 10-20% of revenue on R&D.`
    },
    {
      question: `Is high R&D spending good for ${symbol}?`,
      answer: `High R&D spending for ${symbol} can indicate strong innovation focus and investment in future growth. However, it must be balanced with profitability. The key is R&D efficiency - whether spending translates into valuable products, patents, and revenue growth. Compare R&D intensity to industry peers.`
    },
    {
      question: `What is ${symbol} R&D to revenue ratio?`,
      answer: `The R&D to revenue ratio shows what percentage of sales ${companyName} reinvests in innovation. A higher ratio indicates R&D intensity. Tech companies like software (15-20%) and biotech (often >50%) have higher ratios than traditional industries like retail (<1%). This metric reveals innovation commitment.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Financials', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} R&D`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} R&D Spending - Research & Development Analysis`,
      description: `Comprehensive R&D spending analysis for ${symbol} (${companyName}) with innovation investment trends and metrics.`,
      url: pageUrl,
      keywords: [`${symbol} R&D`, `${symbol} research and development`, `${symbol} innovation`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(rdFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Financials</Link>
            {' / '}
            <span>{symbol} R&D</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Research & Development</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - R&D spending & innovation investment analysis</p>

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

          {/* R&D Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">🔬</div>
              <h2 className="text-2xl font-bold mb-2">R&D Spending Analysis</h2>
              <p className="text-muted-foreground mb-6">Detailed R&D metrics, innovation trends, and development efficiency for {symbol}</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Income Statement
              </Link>
            </div>
          </section>

          {/* R&D Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key R&D Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total R&D Spending', desc: 'Annual R&D expenses' },
                { name: 'R&D to Revenue', desc: 'R&D intensity ratio' },
                { name: 'R&D per Employee', desc: 'Innovation per capita' },
                { name: 'R&D Growth Rate', desc: 'YoY R&D change' },
                { name: 'R&D to Market Cap', desc: 'Innovation investment %' },
                { name: 'R&D Efficiency', desc: 'Revenue per R&D dollar' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What R&D Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What R&D Spending Tells You</h2>
            <div className="space-y-3">
              {[
                'High R&D spending indicates strong commitment to innovation and future product development',
                'Growing R&D investment suggests the company is positioning for long-term competitive advantage',
                'R&D intensity (R&D/Revenue) shows how innovation-focused the business model is',
                'Consistent R&D spending through economic cycles demonstrates strategic commitment to innovation',
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
            <h2 className="text-2xl font-bold mb-4">Complete Financial Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} R&D spending and innovation trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Financials
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {rdFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="research-development" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
