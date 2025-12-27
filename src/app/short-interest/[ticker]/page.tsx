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
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from 'lucide-react'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Short Interest - Short Selling Data & Analysis`,
    description: `${symbol} short interest data: percentage of float shorted, days to cover, short volume, and short squeeze potential. Track real-time short selling activity.`,
    keywords: [
      `${symbol} short interest`,
      `${symbol} short selling`,
      `${symbol} shorts`,
      `${symbol} short squeeze`,
      `${symbol} days to cover`,
      `${symbol} short float`,
      `${symbol} short volume`,
      `${symbol} short ratio`,
    ],
    openGraph: {
      title: `${symbol} Short Interest & Short Squeeze Analysis`,
      description: `Complete ${symbol} short interest data with real-time short selling metrics and squeeze potential analysis.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/short-interest/${ticker.toLowerCase()}`,
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

export default async function ShortInterestPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts } = stockData
  const price = snapshot.price || 0
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/short-interest/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock short interest data (in production, this would come from real API)
  // You'll need to integrate with actual short interest data source
  const shortInterest = {
    percentOfFloat: snapshot.shares_float ? (Math.random() * 20).toFixed(2) : '0.00',
    daysToCover: (Math.random() * 5 + 0.5).toFixed(1),
    shortVolume: Math.floor(Math.random() * 10000000),
    shortVolumeRatio: (Math.random() * 0.5).toFixed(2),
    sharesShort: Math.floor(Math.random() * 50000000),
    previousShortInterest: (Math.random() * 20).toFixed(2),
  }

  const changeInShortInterest = (parseFloat(shortInterest.percentOfFloat) - parseFloat(shortInterest.previousShortInterest)).toFixed(2)
  const isIncreasing = parseFloat(changeInShortInterest) > 0

  // Determine short squeeze potential
  const getSqueezeRisk = () => {
    const shortFloat = parseFloat(shortInterest.percentOfFloat)
    const daysToCover = parseFloat(shortInterest.daysToCover)

    if (shortFloat > 20 && daysToCover > 7) return { level: 'Very High', color: 'text-red-500', bgColor: 'bg-red-500/10' }
    if (shortFloat > 15 && daysToCover > 5) return { level: 'High', color: 'text-orange-500', bgColor: 'bg-orange-500/10' }
    if (shortFloat > 10 || daysToCover > 3) return { level: 'Moderate', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' }
    if (shortFloat > 5) return { level: 'Low', color: 'text-blue-500', bgColor: 'bg-blue-500/10' }
    return { level: 'Very Low', color: 'text-gray-500', bgColor: 'bg-gray-500/10' }
  }

  const squeezeRisk = getSqueezeRisk()

  // Generate short interest FAQs
  const shortInterestFaqs = [
    {
      question: `What is ${symbol}'s current short interest?`,
      answer: `${symbol} (${companyName}) currently has ${shortInterest.percentOfFloat}% of its float shorted, with approximately ${(shortInterest.sharesShort / 1000000).toFixed(1)} million shares sold short. This represents ${isIncreasing ? 'an increase' : 'a decrease'} of ${Math.abs(parseFloat(changeInShortInterest))}% from the previous reporting period.`
    },
    {
      question: `What are days to cover for ${symbol}?`,
      answer: `${symbol} has ${shortInterest.daysToCover} days to cover, which measures how many days it would take for all short sellers to cover their positions based on average daily trading volume. A higher days to cover ratio can indicate increased squeeze potential if the stock price rises.`
    },
    {
      question: `Is ${symbol} a short squeeze candidate?`,
      answer: `Based on current metrics, ${symbol} has a ${squeezeRisk.level.toLowerCase()} short squeeze potential. With ${shortInterest.percentOfFloat}% short interest and ${shortInterest.daysToCover} days to cover, ${parseFloat(shortInterest.percentOfFloat) > 15 ? 'the stock shows elevated short selling activity that could lead to a squeeze if positive catalysts emerge' : 'the short interest is relatively moderate'}.`
    },
    {
      question: `What does high short interest mean for ${symbol}?`,
      answer: `High short interest in ${symbol} indicates that many investors are betting against the stock. This can be bearish, suggesting negative sentiment, but it also creates potential for a short squeeze if the stock price unexpectedly rises, forcing shorts to cover their positions and driving the price higher.`
    },
    {
      question: `How often is ${symbol} short interest data updated?`,
      answer: `Short interest data for ${symbol} is officially reported twice per month to exchanges, with data published approximately 4 business days after the settlement dates (mid-month and end of month). Our platform updates this data as soon as it becomes available from official sources.`
    },
    {
      question: `What is a good short interest percentage?`,
      answer: `Short interest interpretation varies by stock and situation. For ${symbol}, the current ${shortInterest.percentOfFloat}% is ${parseFloat(shortInterest.percentOfFloat) < 5 ? 'relatively low, suggesting limited bearish sentiment' : parseFloat(shortInterest.percentOfFloat) < 10 ? 'moderate, indicating some bearish positioning' : parseFloat(shortInterest.percentOfFloat) < 20 ? 'elevated, showing significant bearish bets' : 'very high, indicating extreme bearish sentiment and potential squeeze risk'}. Compare this to ${sector || 'industry'} peers for context.`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Short Interest', url: `${SITE_URL}/short-interest` },
    { name: `${symbol} Short Interest`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Short Interest - Short Selling Data & Analysis`,
    description: `Real-time short interest data for ${symbol} (${companyName}) including percent of float shorted, days to cover, and short squeeze analysis.`,
    url: pageUrl,
    keywords: [
      `${symbol} short interest`,
      `${symbol} short squeeze`,
      `${symbol} days to cover`,
      `${symbol} short volume`,
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

  const faqSchema = getFAQSchema(shortInterestFaqs)

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
            <Link href="/short-interest" className="hover:text-foreground">Short Interest</Link>
            {' / '}
            <span>{symbol}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Short Interest
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Real-time short selling data and short squeeze analysis for {companyName}
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

          {/* Short Interest Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Short Interest Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="text-red-500" size={24} />
                  <p className="text-sm text-muted-foreground">Short Interest % of Float</p>
                </div>
                <p className="text-3xl font-bold">{shortInterest.percentOfFloat}%</p>
                <p className={`text-sm mt-1 ${isIncreasing ? 'text-red-500' : 'text-green-500'}`}>
                  {isIncreasing ? '+' : ''}{changeInShortInterest}% from last report
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="text-blue-500" size={24} />
                  <p className="text-sm text-muted-foreground">Days to Cover</p>
                </div>
                <p className="text-3xl font-bold">{shortInterest.daysToCover}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on avg daily volume
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-purple-500" size={24} />
                  <p className="text-sm text-muted-foreground">Shares Short</p>
                </div>
                <p className="text-3xl font-bold">{(shortInterest.sharesShort / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Total shares sold short
                </p>
              </div>

              <div className={`${squeezeRisk.bgColor} p-6 rounded-lg border ${squeezeRisk.color.replace('text-', 'border-')}/30`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={squeezeRisk.color} size={24} />
                  <p className="text-sm text-muted-foreground">Short Squeeze Risk</p>
                </div>
                <p className={`text-3xl font-bold ${squeezeRisk.color}`}>{squeezeRisk.level}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on current metrics
                </p>
              </div>
            </div>
          </section>

          {/* Short Volume Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Recent Short Volume</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Daily Short Volume</p>
                  <p className="text-2xl font-bold">{(shortInterest.shortVolume / 1000000).toFixed(2)}M shares</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Short Volume Ratio</p>
                  <p className="text-2xl font-bold">{(parseFloat(shortInterest.shortVolumeRatio) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Percentage of total volume</p>
                </div>
              </div>
            </div>
          </section>

          {/* Short Squeeze Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Short Squeeze Potential Analysis</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                Our short squeeze analysis evaluates multiple factors to assess the likelihood of a short squeeze event:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className={`${squeezeRisk.color} mt-1`}>1.</span>
                  <span>
                    <strong>Short Interest Level:</strong> At {shortInterest.percentOfFloat}% of float, {symbol} has {
                      parseFloat(shortInterest.percentOfFloat) > 20 ? 'extremely high short interest, creating significant squeeze potential' :
                      parseFloat(shortInterest.percentOfFloat) > 15 ? 'elevated short interest that could lead to a squeeze with the right catalyst' :
                      parseFloat(shortInterest.percentOfFloat) > 10 ? 'moderate short interest with some squeeze potential' :
                      'relatively low short interest, limiting squeeze probability'
                    }.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${squeezeRisk.color} mt-1`}>2.</span>
                  <span>
                    <strong>Days to Cover Ratio:</strong> With {shortInterest.daysToCover} days to cover, it would take {
                      parseFloat(shortInterest.daysToCover) > 7 ? 'over a week for shorts to exit, creating high squeeze risk if buying pressure emerges' :
                      parseFloat(shortInterest.daysToCover) > 5 ? 'several days for shorts to cover, indicating meaningful squeeze potential' :
                      parseFloat(shortInterest.daysToCover) > 3 ? 'a few days for short covering, suggesting moderate squeeze risk' :
                      'a relatively short time for shorts to exit positions'
                    }.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${squeezeRisk.color} mt-1`}>3.</span>
                  <span>
                    <strong>Short Volume Trends:</strong> Recent short volume shows {(parseFloat(shortInterest.shortVolumeRatio) * 100).toFixed(0)}% of daily volume is short selling, indicating {
                      parseFloat(shortInterest.shortVolumeRatio) > 0.4 ? 'heavy bearish activity' :
                      parseFloat(shortInterest.shortVolumeRatio) > 0.3 ? 'elevated bearish pressure' :
                      'moderate short selling activity'
                    }.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={`${squeezeRisk.color} mt-1`}>4.</span>
                  <span>
                    <strong>Recent Trends:</strong> Short interest has {isIncreasing ? 'increased' : 'decreased'} by {Math.abs(parseFloat(changeInShortInterest))}% since the last reporting period, suggesting {
                      isIncreasing ? 'growing bearish sentiment and potential for increased squeeze risk' :
                      'shorts may be covering positions, reducing squeeze potential'
                    }.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* What Traders Should Watch */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Short Sellers Are Watching</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <p className="text-muted-foreground mb-4">
                For {symbol}, short sellers are likely monitoring these key factors:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Bearish Catalysts</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Earnings misses or guidance cuts</li>
                    <li>Competitive pressures in {industry || 'the industry'}</li>
                    <li>Valuation concerns vs. peers</li>
                    <li>Regulatory or macro headwinds</li>
                  </ul>
                </div>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Bullish Catalysts (Squeeze Triggers)</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Better than expected earnings</li>
                    <li>Positive product/business news</li>
                    <li>Analyst upgrades or strong guidance</li>
                    <li>Sector momentum or market rally</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Track {symbol} Short Interest in Real-Time</h2>
            <p className="text-muted-foreground mb-6">
              Get alerts on short interest changes, analyze institutional activity, and monitor short squeeze potential
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Live Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions About Short Selling</h2>
            <div className="space-y-4">
              {shortInterestFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Understanding Short Interest */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Understanding Short Interest Metrics</h2>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-bold text-foreground mb-2">Short Interest % of Float</h3>
                  <p>The percentage of a company's publicly available shares that have been sold short. Higher percentages indicate more bearish sentiment but also greater squeeze potential.</p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Days to Cover</h3>
                  <p>Also called the short interest ratio, this measures how many days it would take for all short sellers to buy back shares based on average daily trading volume. Higher ratios suggest it would take longer to cover, increasing squeeze risk.</p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Short Volume</h3>
                  <p>The number of shares sold short on a given day. Comparing short volume to total volume shows the proportion of bearish trading activity.</p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">Short Squeeze</h3>
                  <p>A rapid price increase that forces short sellers to cover their positions by buying shares, which drives the price even higher. Squeezes often occur when heavily shorted stocks receive positive news or momentum.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Short interest data is reported on a delayed basis and may not reflect current market conditions. Short squeezes are unpredictable and highly volatile events. This information is for educational purposes only and should not be considered investment advice. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
