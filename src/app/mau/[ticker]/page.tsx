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
    title: `${symbol} MAU - Monthly Active Users & Growth Trends ${currentYear}`,
    description: `${symbol} monthly active users (MAU): Current MAU, historical growth, user trends, and engagement metrics. Analyze ${symbol}'s monthly user base evolution.`,
    keywords: [
      `${symbol} MAU`,
      `${symbol} monthly active users`,
      `${symbol} user count`,
      `${symbol} user growth`,
      `${symbol} active users`,
      `${symbol} user base`,
    ],
    openGraph: {
      title: `${symbol} MAU - Monthly Active Users Analysis`,
      description: `${symbol} monthly active users analysis with historical trends and growth metrics.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/mau/${ticker.toLowerCase()}`,
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

export default async function MAUPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/mau/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  const mauFaqs = [
    {
      question: `What is ${symbol}'s MAU (monthly active users)?`,
      answer: `${symbol} (${companyName}) monthly active users (MAU) represents the total number of unique users who engage with the platform at least once during a 30-day period. MAU is a key metric for measuring overall user base size and platform reach.`
    },
    {
      question: `How does ${symbol} calculate MAU?`,
      answer: `Monthly Active Users (MAU) for ${symbol} is calculated by counting unique users who perform at least one meaningful action on the platform within a rolling 30-day window. This metric provides a broader view of the total user base compared to DAU.`
    },
    {
      question: `What is a good MAU growth rate for ${symbol}?`,
      answer: `For ${sector || 'technology'} companies like ${symbol}, MAU growth rates vary by maturity stage. Early-stage companies often target 20-50% annual MAU growth, while mature platforms may see 5-15% growth. Consistent MAU growth indicates healthy user acquisition and retention.`
    },
    {
      question: `How does MAU relate to revenue for ${symbol}?`,
      answer: `${symbol}'s MAU is a leading indicator of revenue potential. Combined with ARPU (average revenue per user), MAU helps predict total revenue. Growing MAU with stable or increasing ARPU typically drives strong revenue growth.`
    },
    {
      question: `What is the DAU/MAU ratio for ${symbol}?`,
      answer: `The DAU/MAU ratio measures how frequently monthly users engage daily. A higher ratio indicates better engagement. For ${symbol}, this metric shows platform stickiness - how often users return within a month. Social platforms typically aim for ratios above 0.5.`
    },
    {
      question: `Where can I find ${symbol}'s MAU data?`,
      answer: `${symbol} reports MAU metrics in quarterly earnings releases, 10-Q/10-K filings, and investor presentations. Historical MAU trends are available in the company's investor relations section and financial databases.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/screener` },
    { name: `${symbol} MAU`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} MAU - Monthly Active Users Analysis ${currentYear}`,
    description: `Complete ${symbol} monthly active users analysis with growth trends and engagement metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} MAU`,
      `${symbol} monthly active users`,
      `${symbol} user growth`,
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

  const faqSchema = getFAQSchema(mauFaqs)

  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm mb-6" style={{ color: '#868f97' }}>
            <Link href="/" className="motion-safe:transition-all motion-safe:duration-150 ease-out hover:text-white focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">Home</Link>
            {' / '}
            <Link href="/screener" className="motion-safe:transition-all motion-safe:duration-150 ease-out hover:text-white focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">Stocks</Link>
            {' / '}
            <span>{symbol} MAU</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">
            {symbol} MAU - Monthly Active Users
          </h1>
          <p className="text-xl mb-8" style={{ color: '#868f97' }}>
            {companyName} monthly active users and growth trends
          </p>

          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 mb-8 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
            <div className="text-center">
              <p className="text-sm mb-2" style={{ color: '#868f97' }}>Monthly Active Users</p>
              <p className="text-4xl font-bold mb-4 tabular-nums">MAU Metrics</p>
              <p style={{ color: '#868f97' }}>
                Track monthly user base for {companyName}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Understanding MAU</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                <h3 className="font-bold mb-2" style={{ color: '#4ebe96' }}>What MAU Measures</h3>
                <ul className="text-sm space-y-2" style={{ color: '#868f97' }}>
                  <li>Total monthly user reach</li>
                  <li>User base growth trajectory</li>
                  <li>Market penetration levels</li>
                  <li>Acquisition effectiveness</li>
                </ul>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                <h3 className="font-bold mb-2" style={{ color: '#479ffa' }}>Why MAU Matters</h3>
                <ul className="text-sm space-y-2" style={{ color: '#868f97' }}>
                  <li>Predicts revenue potential</li>
                  <li>Shows network effects</li>
                  <li>Indicates brand strength</li>
                  <li>Guides valuation models</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">MAU vs DAU Comparison</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
              <div className="space-y-4">
                <div>
                  <p className="font-medium mb-2">DAU/MAU Ratio</p>
                  <p className="text-sm" style={{ color: '#868f97' }}>
                    The ratio of daily to monthly active users shows engagement frequency. Higher ratios indicate users engage with the platform more frequently within the month.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Engagement Interpretation</p>
                  <ul className="text-sm space-y-1 ml-4 tabular-nums" style={{ color: '#868f97' }}>
                    <li>0.6+ ratio: Exceptional daily engagement</li>
                    <li>0.4-0.6 ratio: Strong engagement</li>
                    <li>0.2-0.4 ratio: Moderate engagement</li>
                    <li>Below 0.2: Lower frequency use case</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 text-center mb-12 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
            <h2 className="text-2xl font-bold mb-4 text-balance">Get Full {symbol} Analysis</h2>
            <p className="mb-6" style={{ color: '#868f97' }}>
              View complete user metrics, financials, and AI-powered insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block px-8 py-3 rounded-lg font-medium text-white motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                style={{ backgroundColor: '#4ebe96' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3da67f'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4ebe96'}
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dau/${symbol.toLowerCase()}`}
                className="inline-block bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] px-8 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15] focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                View DAU Metrics
              </Link>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {mauFaqs.map((faq, index) => (
                <div key={index} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p style={{ color: '#868f97' }}>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="text-xs bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 mb-8" style={{ color: '#868f97' }}>
            <p><strong>Disclaimer:</strong> User metrics are based on company disclosures and public filings. MAU definitions may vary by company. Always conduct your own research before making investment decisions.</p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
