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
} from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} ARPU - Average Revenue Per User Analysis ${currentYear}`,
    description: `${symbol} average revenue per user (ARPU): Current ARPU, trends, monetization efficiency, and user value metrics. Analyze ${symbol}'s revenue per user.`,
    keywords: [
      `${symbol} ARPU`,
      `${symbol} average revenue per user`,
      `${symbol} revenue per user`,
      `${symbol} monetization`,
      `${symbol} user value`,
      `${symbol} ARPU growth`,
    ],
    openGraph: {
      title: `${symbol} ARPU - Average Revenue Per User`,
      description: `${symbol} average revenue per user analysis with monetization trends and efficiency metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/arpu/${ticker.toLowerCase()}`,
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

export default async function ARPUPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/arpu/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const arpuFaqs = [
    {
      question: `What is ${symbol}'s ARPU (average revenue per user)?`,
      answer: `${symbol} (${companyName}) average revenue per user (ARPU) is calculated by dividing total revenue by the number of active users. ARPU is a critical metric for ${sector || 'technology'} companies to measure monetization effectiveness and user value.`
    },
    {
      question: `How is ARPU calculated for ${symbol}?`,
      answer: `ARPU for ${symbol} is calculated by dividing total revenue by the number of average users during a specific period (monthly or annually). The formula is: ARPU = Total Revenue / Number of Active Users. This can be calculated on a monthly (ARPU) or annual (AARPU) basis.`
    },
    {
      question: `Why is ARPU important for ${symbol} investors?`,
      answer: `ARPU is crucial for ${symbol} investors because it shows how effectively the company monetizes its user base. Rising ARPU indicates successful pricing strategies, product improvements, or better user engagement, while declining ARPU may signal pricing pressure or user quality issues.`
    },
    {
      question: `What drives ARPU growth for ${symbol}?`,
      answer: `${symbol}'s ARPU growth is driven by factors including premium feature adoption, advertising revenue increases, subscription tier upgrades, new monetization features, and improved user engagement. ${sector ? `In the ${sector} sector, ` : ''}successful companies balance ARPU growth with user acquisition.`
    },
    {
      question: `How does ${symbol}'s ARPU compare to competitors?`,
      answer: `Comparing ${symbol}'s ARPU to competitors helps evaluate monetization efficiency and pricing power. Higher ARPU can indicate premium positioning or superior engagement, while lower ARPU might suggest growth-focused user acquisition or a freemium model.`
    },
    {
      question: `What is the difference between ARPU and ARPPU for ${symbol}?`,
      answer: `ARPU (Average Revenue Per User) measures revenue across all users, while ARPPU (Average Revenue Per Paying User) focuses only on users who make payments. For ${symbol}, ARPPU is typically higher than ARPU and shows monetization of engaged users specifically.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} ARPU`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} ARPU - Average Revenue Per User Analysis ${currentYear}`,
    description: `Complete ${symbol} average revenue per user analysis with monetization trends and efficiency metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} ARPU`,
      `${symbol} average revenue per user`,
      `${symbol} monetization`,
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

  const faqSchema = getFAQSchema(arpuFaqs)

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
            <span>{symbol} ARPU</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} ARPU - Average Revenue Per User
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {companyName} average revenue per user and monetization metrics
          </p>

          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Average Revenue Per User</p>
              <p className="text-4xl font-bold mb-4">ARPU Metrics</p>
              <p className="text-muted-foreground">
                Track monetization efficiency for {companyName}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding ARPU</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-green-500 mb-2">What ARPU Measures</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Monetization effectiveness</li>
                  <li>User value and quality</li>
                  <li>Pricing power and strategy</li>
                  <li>Revenue generation efficiency</li>
                </ul>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold text-emerald-500 mb-2">Why ARPU Matters</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Predicts revenue sustainability</li>
                  <li>Shows monetization success</li>
                  <li>Guides pricing decisions</li>
                  <li>Indicates product value</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ARPU Calculation</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">Formula</p>
                  <div className="bg-secondary/50 p-4 rounded-lg font-mono text-sm">
                    ARPU = Total Revenue / Number of Active Users
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Example Calculation</p>
                  <p className="text-sm text-muted-foreground">
                    If {symbol} generates $1 billion in quarterly revenue with 100 million MAU:
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Quarterly ARPU = $1,000,000,000 / 100,000,000 = $10 per user
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Annual ARPU = $10 × 4 quarters = $40 per user per year
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ARPU Growth Drivers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Premium Features</h3>
                <p className="text-sm text-muted-foreground">
                  Subscription upgrades and premium tier adoption increase per-user revenue
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Ad Revenue</h3>
                <p className="text-sm text-muted-foreground">
                  Higher ad loads and better targeting improve monetization per user
                </p>
              </div>
              <div className="bg-card p-5 rounded-lg border border-border">
                <h3 className="font-bold mb-2">Engagement</h3>
                <p className="text-sm text-muted-foreground">
                  Increased usage and engagement drive more revenue opportunities
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-blue-600/20 to-green-600/20 p-8 rounded-xl border border-blue-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete financials, user metrics, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Revenue Analysis
              </Link>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {arpuFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> ARPU calculations are based on publicly reported data. Actual ARPU may vary based on revenue recognition policies and user definition. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
