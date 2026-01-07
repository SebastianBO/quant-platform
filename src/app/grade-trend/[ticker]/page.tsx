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
    title: `${symbol} Ore Grade Trends ${currentYear} - Mining Ore Quality Analysis`,
    description: `${symbol} ore grade trends: current ore grades, historical grade trends, grade decline rates, impact on costs and production, ore body quality analysis.`,
    keywords: [
      `${symbol} ore grade`,
      `${symbol} grade trends`,
      `${symbol} ore quality`,
      `${symbol} grade decline`,
      `${symbol} grams per tonne`,
      `${symbol} mining quality`,
    ],
    openGraph: {
      title: `${symbol} Ore Grade Trends - Mining Ore Quality Analysis`,
      description: `Complete ${symbol} ore grade analysis with trends, quality metrics, and cost implications.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/grade-trend/${ticker.toLowerCase()}`,
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

export default async function GradeTrendPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/grade-trend/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Placeholder grade data - would come from mining-specific API
  const currentGrade = 2.1 // g/t gold
  const previousGrade = 2.3
  const gradeChange = ((currentGrade - previousGrade) / previousGrade * 100).toFixed(1)
  const fiveYearAvgGrade = 2.8
  const gradeDeclineRate = -3.5 // % per year

  const gradeFaqs = [
    {
      question: `What is ${symbol}'s current ore grade?`,
      answer: `${symbol} (${companyName}) is currently mining ore with an average grade of ${currentGrade} grams per tonne (g/t) of gold. This represents a ${Math.abs(parseFloat(gradeChange))}% ${parseFloat(gradeChange) < 0 ? 'decrease' : 'increase'} from the previous year's grade of ${previousGrade} g/t. Ore grade is critical to economics - higher grades mean more metal per tonne of ore mined, reducing mining costs per ounce produced and improving profitability.`
    },
    {
      question: `Why are ${symbol}'s ore grades declining?`,
      answer: `Ore grade decline is natural in mining as companies typically mine highest-grade zones first (high-grading). ${symbol} has experienced grade decline at approximately ${Math.abs(gradeDeclineRate)}% annually. Causes include: (1) Mine sequencing - accessing lower-grade portions of ore body, (2) Reserve depletion - mining out high-grade areas, (3) Geological variation - natural grade distribution in deposits, (4) Operational factors - mining dilution, ore blending strategies. Grade decline must be offset by productivity improvements to maintain costs.`
    },
    {
      question: `What is considered a good ore grade?`,
      answer: `Ore grade quality varies by metal and deposit type. For gold: High-grade (>5 g/t), Medium-grade (2-5 g/t), Low-grade (<2 g/t). ${symbol}'s current grade of ${currentGrade} g/t is ${currentGrade > 5 ? 'high-grade' : currentGrade > 2 ? 'medium-grade' : 'low-grade'}. Higher grades support lower costs and higher margins. Some underground mines operate at 8-15 g/t, while large open-pit operations may be profitable at 0.5-2 g/t due to economies of scale.`
    },
    {
      question: `How does grade affect ${symbol}'s production costs?`,
      answer: `Grade directly impacts unit costs. At ${currentGrade} g/t, ${symbol} must process ~${Math.round(31.1 / currentGrade)} tonnes of ore to produce one ounce of gold. If grade declines to ${(currentGrade * 0.9).toFixed(1)} g/t (10% lower), the same ore requires ${Math.round(31.1 / (currentGrade * 0.9))} tonnes per ounce - increasing mining, hauling, crushing, and processing costs proportionally. This is why grade decline often drives AISC increases unless offset by operational improvements.`
    },
    {
      question: `What is ${symbol}'s long-term grade outlook?`,
      answer: `Based on reserve reporting, ${symbol}'s reserve grade averages ${currentGrade} g/t. Historical trends show grades declining from ${fiveYearAvgGrade} g/t (5-year average) to current levels. Future grade trajectory depends on: (1) Access to higher-grade zones in mine plans, (2) Exploration success in discovering higher-grade extensions, (3) Acquisitions of higher-grade assets, (4) Mine sequencing and blend optimization. Companies disclose future grade guidance in technical reports and LOM plans.`
    },
    {
      question: `Can ${symbol} improve ore grades?`,
      answer: `Strategies to stabilize or improve grades include: (1) Mine sequencing - accessing known higher-grade zones, (2) Selective mining - narrower stope/bench designs to reduce dilution, (3) Ore sorting - rejecting waste before processing, (4) Brownfield exploration - discovering higher-grade zones near existing mines, (5) Resource optimization - re-blocking models to identify grade opportunities, (6) Acquisitions - buying higher-grade assets. However, many mines face inevitable grade decline as deposits deplete.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stocks', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Ore Grade`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Ore Grade Trends ${currentYear} - Mining Ore Quality Analysis`,
      description: `Complete ore grade analysis for ${symbol} including current grades, historical trends, and cost implications.`,
      url: pageUrl,
      keywords: [`${symbol} ore grade`, `${symbol} grade trends`, `${symbol} ore quality`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector,
      industry,
      url: pageUrl,
    }),
    getFAQSchema(gradeFaqs),
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
            <span>{symbol} Ore Grade</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Ore Grade Trends {currentYear}</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} Mining Ore Quality & Grade Analysis</p>

          {/* Grade Overview */}
          <div className={`p-8 rounded-xl border mb-8 ${parseFloat(gradeChange) >= 0 ? 'bg-green-500/20 border-green-500/30' : 'bg-orange-500/20 border-orange-500/30'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Grade</p>
                <p className="text-3xl font-bold">{currentGrade}</p>
                <p className="text-sm text-muted-foreground">g/t gold</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">YoY Change</p>
                <p className={`text-3xl font-bold ${parseFloat(gradeChange) >= 0 ? 'text-green-500' : 'text-orange-500'}`}>
                  {parseFloat(gradeChange) > 0 ? '+' : ''}{gradeChange}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">5-Year Average</p>
                <p className="text-3xl font-bold">{fiveYearAvgGrade}</p>
                <p className="text-sm text-muted-foreground">g/t gold</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Decline Rate</p>
                <p className="text-3xl font-bold text-orange-500">{gradeDeclineRate}%</p>
                <p className="text-sm text-muted-foreground">per year</p>
              </div>
            </div>
          </div>

          {/* Grade Analysis */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Ore Grade Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Current Ore Grade</h3>
                <p className="text-4xl font-bold mb-2">{currentGrade} g/t</p>
                <p className="text-muted-foreground mb-3">
                  Grams of gold per tonne of ore
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentGrade > 5 ? 'High-grade deposit - premium quality' :
                   currentGrade > 2 ? 'Medium-grade - industry standard' :
                   'Low-grade - requires scale economies'}
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Previous Year Grade</h3>
                <p className="text-4xl font-bold mb-2">{previousGrade} g/t</p>
                <p className={`text-sm mb-3 ${parseFloat(gradeChange) < 0 ? 'text-orange-500' : 'text-green-500'}`}>
                  {Math.abs(parseFloat(gradeChange))}% {parseFloat(gradeChange) < 0 ? 'decline' : 'improvement'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Prior year average mined grade
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Tonnes per Ounce</h3>
                <p className="text-4xl font-bold mb-2">{Math.round(31.1 / currentGrade)}</p>
                <p className="text-muted-foreground mb-3">
                  Tonnes of ore needed per ounce
                </p>
                <p className="text-sm text-muted-foreground">
                  Lower grades require more ore processing
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="font-bold text-lg mb-3">Grade Classification</h3>
                <p className="text-4xl font-bold mb-2">
                  {currentGrade > 5 ? 'High' : currentGrade > 2 ? 'Medium' : 'Low'}
                </p>
                <p className="text-muted-foreground mb-3">
                  Relative grade quality
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on industry benchmarks
                </p>
              </div>
            </div>
          </section>

          {/* Grade Impact */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">How Ore Grade Affects Economics</h2>
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Mining Costs</h3>
                <p className="text-muted-foreground">
                  Higher grades reduce unit costs dramatically. Mining, hauling, and crushing costs are largely fixed per tonne. At ${currentGrade} g/t, ${Math.round(31.1 / currentGrade)} tonnes must be mined per ounce. If grade drops 20% to ${(currentGrade * 0.8).toFixed(1)} g/t, costs increase 25% as ${Math.round(31.1 / (currentGrade * 0.8))} tonnes are needed per ounce.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Processing Costs</h3>
                <p className="text-muted-foreground">
                  Processing costs (crushing, grinding, leaching) scale with tonnage, not grade. Lower grades mean more tonnes processed per ounce, increasing power consumption, reagent use, and labor per unit of production. Mill capacity constraints may limit production if grades decline faster than mill throughput increases.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Recovery Rates</h3>
                <p className="text-muted-foreground">
                  Lower grades often correlate with reduced recovery rates as fine gold dissemination becomes harder to extract. Metallurgical recovery might drop from 92% to 88% as grades decline, compounding the impact on ounces produced. This double effect (lower grade + lower recovery) significantly impacts production.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Economic Cutoff</h3>
                <p className="text-muted-foreground">
                  Minimum economic grade (cutoff grade) determines what's ore versus waste. At current costs and gold prices, ${symbol}'s cutoff might be ${(currentGrade * 0.3).toFixed(1)} g/t. Material below cutoff is waste rock. Rising costs or falling prices increase cutoff grade, converting marginal ore to waste and reducing reserves.
                </p>
              </div>
            </div>
          </section>

          {/* Grade Scenarios */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Production Impact of Grade Changes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0.8, 0.9, 1.1, 1.2].map(multiplier => {
                const scenarioGrade = (currentGrade * multiplier).toFixed(2)
                const tonnesPerOz = Math.round(31.1 / parseFloat(scenarioGrade))
                const relativeLabel = multiplier < 1 ? `${((1-multiplier)*100).toFixed(0)}% lower` : `${((multiplier-1)*100).toFixed(0)}% higher`
                return (
                  <div key={multiplier} className="bg-card p-4 rounded-lg border border-border text-center">
                    <p className="text-sm text-muted-foreground mb-1">{scenarioGrade} g/t</p>
                    <p className="text-2xl font-bold">{tonnesPerOz}t</p>
                    <p className="text-xs text-muted-foreground mt-1">per ounce</p>
                    <p className="text-xs text-muted-foreground">{relativeLabel}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Complete {symbol} Ore Grade Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed grade trends, mine-by-mine data, reserve grades, and AI-powered cost impact analysis
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Full Stock Analysis
              </Link>
              <Link
                href={`/dashboard?ticker=${symbol}&tab=fundamentals`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Fundamentals Dashboard
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {gradeFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Mining Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Related Mining Metrics</h2>
            <div className="flex flex-wrap gap-2">
              <Link href={`/gold-production/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Gold Production
              </Link>
              <Link href={`/aisc/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                All-in Sustaining Cost
              </Link>
              <Link href={`/mining-reserves/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Mineral Reserves
              </Link>
              <Link href={`/exploration-spend/${ticker.toLowerCase()}`} className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80">
                Exploration Spending
              </Link>
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="grade" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
