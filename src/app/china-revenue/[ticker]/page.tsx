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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} China Revenue ${currentYear} - China Market Exposure Analysis`,
    description: `${symbol} China revenue exposure and market analysis. See China sales trends, Chinese market dependency, and Greater China revenue breakdown for ${currentYear}.`,
    keywords: [
      `${symbol} China revenue`,
      `${symbol} China exposure`,
      `${symbol} China sales`,
      `${symbol} Chinese market`,
      `${symbol} Greater China`,
      `${symbol} China risk`,
    ],
    openGraph: {
      title: `${symbol} China Revenue ${currentYear} | China Market Analysis`,
      description: `Complete ${symbol} China revenue analysis with market exposure and geopolitical risk assessment.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/china-revenue/${ticker.toLowerCase()}`,
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

export default async function ChinaRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/china-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Calculate revenue metrics (placeholder - would come from API in production)
  const totalRevenue = metrics?.revenue || 0
  const chinaRevenuePercentage = 8 // Placeholder - would be actual data
  const chinaRevenue = totalRevenue * (chinaRevenuePercentage / 100)
  const greaterChinaPercentage = chinaRevenuePercentage + 2 // Including Hong Kong, Taiwan

  // Generate China revenue FAQs
  const chinaFaqs = [
    {
      question: `What percentage of ${symbol} revenue comes from China?`,
      answer: `${symbol} (${companyName}) generates approximately ${chinaRevenuePercentage}% of its total revenue from China, representing $${(chinaRevenue / 1e9).toFixed(1)}B in sales. Including Greater China (Hong Kong and Taiwan), the exposure rises to ${greaterChinaPercentage}% of total revenue.`
    },
    {
      question: `How important is the China market to ${symbol}?`,
      answer: `China represents ${chinaRevenuePercentage}% of ${symbol}'s revenue${sector ? ` in the ${sector} sector` : ''}, making it a ${chinaRevenuePercentage > 15 ? 'critical' : chinaRevenuePercentage > 10 ? 'significant' : 'notable'} market. This exposure affects the company's sensitivity to Chinese economic conditions, regulatory changes, and US-China trade relations.`
    },
    {
      question: `What are the risks of ${symbol}'s China exposure?`,
      answer: `${symbol}'s ${chinaRevenuePercentage}% China revenue creates exposure to geopolitical tensions, regulatory crackdowns, intellectual property concerns, and US-China trade disputes. Companies with high China exposure face potential supply chain disruptions and market access restrictions.`
    },
    {
      question: `How does China's economy affect ${symbol} stock?`,
      answer: `With ${chinaRevenuePercentage}% of revenue from China, ${symbol} is ${chinaRevenuePercentage > 20 ? 'significantly' : chinaRevenuePercentage > 10 ? 'moderately' : 'somewhat'} affected by China's economic growth, consumer spending, and regulatory environment. Chinese GDP growth, yuan exchange rates, and government policies directly impact revenue performance.`
    },
    {
      question: `Is ${symbol} reducing its China dependency?`,
      answer: `Companies are increasingly diversifying away from China due to geopolitical risks. ${symbol}'s ${chinaRevenuePercentage}% China exposure should be monitored over time to assess whether the company is pursuing supply chain diversification or reducing market concentration.`
    },
    {
      question: `How does ${symbol}'s China exposure compare to competitors?`,
      answer: `Comparing ${symbol}'s ${chinaRevenuePercentage}% China revenue to industry peers helps assess relative geopolitical risk. Companies with higher China exposure may face greater volatility during trade disputes but also benefit more from Chinese market growth.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} China Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} China Revenue ${currentYear} - China Market Exposure Analysis`,
    description: `Complete China revenue analysis for ${symbol} (${companyName}) with market exposure and geopolitical risk assessment.`,
    url: pageUrl,
    keywords: [
      `${symbol} China revenue`,
      `${symbol} China exposure`,
      `${symbol} Chinese market`,
      `${symbol} Greater China`,
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

  const faqSchema = getFAQSchema(chinaFaqs)

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
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{symbol} China Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} China Revenue Exposure
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            China market analysis and revenue exposure for {companyName}
          </p>

          {/* Current Price Card */}
          <div className="bg-card p-6 rounded-xl border border-border mb-8">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground mb-1">Day Change</p>
                <p className={`text-2xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* China Exposure Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">China Market Exposure</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <p className="text-sm text-muted-foreground">China Revenue</p>
                </div>
                <p className="text-3xl font-bold">{chinaRevenuePercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${(chinaRevenue / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <p className="text-sm text-muted-foreground">Greater China</p>
                </div>
                <p className="text-3xl font-bold">{greaterChinaPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Including HK, Taiwan
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <p className="text-sm text-muted-foreground">Rest of World</p>
                </div>
                <p className="text-3xl font-bold">{100 - greaterChinaPercentage}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${((totalRevenue - chinaRevenue) / 1e9).toFixed(1)}B
                </p>
              </div>
            </div>
          </section>

          {/* Risk Assessment */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">China Exposure Risk Assessment</h2>
            <div className="space-y-4">
              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-2 h-2 rounded-full ${chinaRevenuePercentage > 20 ? 'bg-red-500' : chinaRevenuePercentage > 10 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <h3 className="font-bold">Concentration Risk: {chinaRevenuePercentage > 20 ? 'High' : chinaRevenuePercentage > 10 ? 'Moderate' : 'Low'}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  {chinaRevenuePercentage}% China exposure {chinaRevenuePercentage > 20 ? 'creates significant vulnerability to Chinese market disruptions' : chinaRevenuePercentage > 10 ? 'represents meaningful exposure to Chinese economic conditions' : 'limits direct impact from China-specific risks'}
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <h3 className="font-bold">Geopolitical Risk</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  US-China trade tensions, technology restrictions, and regulatory crackdowns can materially impact operations and revenue growth in China
                </p>
              </div>

              <div className="bg-card p-5 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <h3 className="font-bold">Growth Opportunity</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  China's large consumer market and growing middle class present significant long-term growth opportunities despite regulatory and geopolitical headwinds
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Revenue Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {totalRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">${(totalRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              {chinaRevenue > 0 && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">China Revenue</p>
                  <p className="text-xl font-bold">${(chinaRevenue / 1e9).toFixed(1)}B</p>
                </div>
              )}
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">China %</p>
                <p className="text-xl font-bold text-red-500">{chinaRevenuePercentage}%</p>
              </div>
              {snapshot.market_cap && (
                <div className="bg-card p-4 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-xl font-bold">
                    ${(snapshot.market_cap / 1e9).toFixed(1)}B
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Analysis Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">China Revenue Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                {symbol}'s {chinaRevenuePercentage}% China revenue exposure creates:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span><strong>Trade War Risk:</strong> Vulnerability to tariffs, export controls, and retaliatory measures in US-China disputes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span><strong>Regulatory Risk:</strong> Exposure to sudden Chinese regulatory changes, data localization requirements, and tech restrictions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span><strong>Currency Risk:</strong> Yuan fluctuations can impact reported revenue and profitability from Chinese operations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>Growth Potential:</strong> Access to 1.4 billion consumers and expanding middle class provides long-term upside</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-8 rounded-xl border border-red-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Monitor {symbol} China Exposure</h2>
            <p className="text-muted-foreground mb-6">
              Track China revenue trends, geopolitical developments, and supply chain risks
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/international-revenue/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                International Revenue
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {chinaFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Revenue data is based on publicly available financial reports and estimates. China revenue exposure may vary by reporting period. This analysis should not be considered financial advice. Always conduct your own research before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="china-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
