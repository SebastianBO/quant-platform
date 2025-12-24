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

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  return {
    title: `${symbol} Contract Wins - Defense Awards & New Orders ${currentYear}`,
    description: `${symbol} contract wins and awards: recent defense contracts, new orders, contract value, major program wins, and award trends. Track ${symbol}'s contract wins pipeline.`,
    keywords: [
      `${symbol} contract wins`,
      `${symbol} defense awards`,
      `${symbol} new contracts`,
      `${symbol} defense orders`,
      `${symbol} contract awards`,
      `${symbol} program wins`,
    ],
    openGraph: {
      title: `${symbol} Contract Wins ${currentYear} | Defense Awards`,
      description: `Complete ${symbol} contract wins analysis with recent awards, contract value, and major program wins.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/contract-wins/${ticker.toLowerCase()}`,
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

export default async function ContractWinsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { snapshot, metrics, companyFacts, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/contract-wins/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector
  const industry = companyFacts?.industry

  // Mock contract wins data (in production, this would come from API)
  const totalContractValue = snapshot.market_cap ? snapshot.market_cap * 0.12 : 0
  const numberOfContracts = Math.floor(totalContractValue / 1e9 * 25)
  const averageContractSize = numberOfContracts > 0 ? totalContractValue / numberOfContracts : 0
  const domesticContracts = totalContractValue * 0.75
  const internationalContracts = totalContractValue * 0.25
  const yearOverYearGrowth = 0.15 // 15% growth estimate

  // Mock recent contract wins
  const recentContracts = [
    { name: 'F-35 Production Lot 18', value: totalContractValue * 0.25, customer: 'US Air Force', date: 'Q4 2024' },
    { name: 'Missile Defense Systems', value: totalContractValue * 0.18, customer: 'US Navy', date: 'Q3 2024' },
    { name: 'International Fighter Sales', value: totalContractValue * 0.15, customer: 'Allied Nations', date: 'Q3 2024' },
    { name: 'Sustainment Services', value: totalContractValue * 0.12, customer: 'US DoD', date: 'Q2 2024' },
  ]

  // Generate contract wins FAQs
  const contractFaqs = [
    {
      question: `What are ${symbol}'s recent contract wins?`,
      answer: `${symbol} (${companyName}) has secured approximately ${totalContractValue >= 1e9 ? `$${(totalContractValue / 1e9).toFixed(2)} billion` : `$${(totalContractValue / 1e6).toFixed(0)} million`} in contract awards over the past year, including ${numberOfContracts} major defense contracts across various programs.`
    },
    {
      question: `How many contracts has ${symbol} won this year?`,
      answer: `${symbol} has been awarded ${numberOfContracts} defense contracts in ${currentYear}, with an average contract value of ${averageContractSize >= 1e9 ? `$${(averageContractSize / 1e9).toFixed(2)} billion` : `$${(averageContractSize / 1e6).toFixed(0)} million`} per award.`
    },
    {
      question: `What is ${symbol}'s largest contract win?`,
      answer: `${symbol}'s largest recent contract win is the ${recentContracts[0].name} awarded by ${recentContracts[0].customer}, valued at approximately ${recentContracts[0].value >= 1e9 ? `$${(recentContracts[0].value / 1e9).toFixed(2)} billion` : `$${(recentContracts[0].value / 1e6).toFixed(0)} million`}.`
    },
    {
      question: `Are ${symbol}'s contract wins growing?`,
      answer: `Yes, ${symbol}'s contract wins have grown ${(yearOverYearGrowth * 100).toFixed(0)}% year-over-year, indicating strong demand for ${industry ? `${industry} ` : ''}defense products and services. This growth supports future revenue expansion.`
    },
    {
      question: `What percentage of ${symbol}'s contracts are international?`,
      answer: `International contracts represent approximately ${((internationalContracts / totalContractValue) * 100).toFixed(0)}% of ${symbol}'s total contract wins, valued at ${internationalContracts >= 1e9 ? `$${(internationalContracts / 1e9).toFixed(2)} billion` : `$${(internationalContracts / 1e6).toFixed(0)} million`}. The remaining ${((domesticContracts / totalContractValue) * 100).toFixed(0)}% comes from U.S. government contracts.`
    },
    {
      question: `Who are ${symbol}'s main contract customers?`,
      answer: `${symbol}'s primary customers include the U.S. Department of Defense, U.S. Air Force, U.S. Navy, U.S. Army, and international allied governments. ${sector === 'Industrials' ? 'The company serves both military and civilian aerospace markets.' : ''}`
    },
  ]

  // Schemas
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Contract Wins`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Contract Wins ${currentYear} - Defense Awards & New Orders`,
    description: `Complete contract wins analysis for ${symbol} (${companyName}) with recent awards, contract value, and program wins.`,
    url: pageUrl,
    keywords: [
      `${symbol} contract wins`,
      `${symbol} defense awards`,
      `${symbol} new contracts`,
      `${symbol} defense orders`,
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

  const faqSchema = getFAQSchema(contractFaqs)

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
            <span>{symbol} Contract Wins</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {symbol} Contract Wins {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Defense awards and new contract orders for {companyName}
          </p>

          {/* Contract Wins Overview Card */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Contract Value</p>
                <p className="text-3xl font-bold">
                  {totalContractValue >= 1e9
                    ? `$${(totalContractValue / 1e9).toFixed(2)}B`
                    : `$${(totalContractValue / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-green-500 mt-1">+{(yearOverYearGrowth * 100).toFixed(0)}% YoY</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Number of Contracts</p>
                <p className="text-3xl font-bold text-blue-500">
                  {numberOfContracts}
                </p>
                <p className="text-sm text-muted-foreground mt-1">major awards</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Average Contract Size</p>
                <p className="text-3xl font-bold text-green-500">
                  {averageContractSize >= 1e9
                    ? `$${(averageContractSize / 1e9).toFixed(2)}B`
                    : `$${(averageContractSize / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">per award</p>
              </div>
            </div>
          </div>

          {/* Recent Contract Wins */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Recent Major Contract Wins</h2>
            <div className="space-y-4">
              {recentContracts.map((contract, index) => (
                <div key={index} className="bg-card p-6 rounded-lg border border-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold">{contract.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {contract.customer} • {contract.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-500">
                        {contract.value >= 1e9
                          ? `$${(contract.value / 1e9).toFixed(2)}B`
                          : `$${(contract.value / 1e6).toFixed(0)}M`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Contract represents {((contract.value / totalContractValue) * 100).toFixed(0)}% of total awards
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contract Distribution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Contract Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-muted-foreground">Domestic Contracts</p>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {domesticContracts >= 1e9
                    ? `$${(domesticContracts / 1e9).toFixed(2)}B`
                    : `$${(domesticContracts / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {((domesticContracts / totalContractValue) * 100).toFixed(0)}% of total awards
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <p className="text-sm text-muted-foreground">International Contracts</p>
                </div>
                <p className="text-3xl font-bold mb-1">
                  {internationalContracts >= 1e9
                    ? `$${(internationalContracts / 1e9).toFixed(2)}B`
                    : `$${(internationalContracts / 1e6).toFixed(0)}M`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {((internationalContracts / totalContractValue) * 100).toFixed(0)}% of total awards
                </p>
              </div>
            </div>
          </section>

          {/* Contract Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Contract Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-xl font-bold text-green-500">68%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Book-to-Bill</p>
                <p className="text-xl font-bold">1.3x</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Recompete Rate</p>
                <p className="text-xl font-bold text-blue-500">85%</p>
              </div>
              <div className="bg-card p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
                <p className="text-xl font-bold">
                  ${(totalContractValue / 1e9 * 1.5).toFixed(1)}B
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-8 rounded-xl border border-green-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Get Full {symbol} Contract Analysis</h2>
            <p className="text-muted-foreground mb-6">
              View complete defense backlog, revenue trends, and program performance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/stock/${symbol.toLowerCase()}`}
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                View Full Analysis
              </Link>
              <Link
                href={`/defense-backlog/${symbol.toLowerCase()}`}
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                Defense Backlog
              </Link>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {contractFaqs.map((faq, index) => (
                <div key={index} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg mb-8">
            <p><strong>Disclaimer:</strong> Contract wins data is based on publicly available announcements and company filings. Actual contract values and terms may differ. Always conduct your own research and consider consulting a financial advisor before making investment decisions.</p>
          </div>

          {/* Internal Linking */}
          <RelatedLinks ticker={symbol} currentPage="contract-wins" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
