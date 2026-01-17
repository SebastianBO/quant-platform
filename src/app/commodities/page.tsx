import { Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp, TrendingDown, ArrowRight, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getBreadcrumbSchema, getFAQSchema, getArticleSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'

export const revalidate = 3600
export const dynamic = 'force-dynamic' // Prevent build-time fetching from localhost

// SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Commodity Prices Today | Gold, Oil, Silver & Natural Gas Prices | Lician',
  description: 'Track real-time commodity prices including gold price, crude oil price today, silver price, natural gas, copper, wheat, corn, and more. Live commodity market data and trends.',
  keywords: [
    'gold price',
    'oil price today',
    'crude oil price',
    'silver price',
    'commodity prices',
    'natural gas price',
    'copper price',
    'wheat price',
    'corn price',
    'brent crude oil',
    'WTI oil price',
    'commodity market',
    'commodity trading',
    'precious metals prices',
    'energy commodities',
    'agricultural commodities',
  ],
  openGraph: {
    title: 'Commodity Prices Today | Gold, Oil, Silver Prices',
    description: 'Track real-time commodity prices including gold, crude oil, silver, natural gas, copper, and agricultural commodities. Live market data and trends.',
    url: `${SITE_URL}/commodities`,
    type: 'article',
    images: [
      {
        url: `${SITE_URL}/og-commodities.png`,
        width: 1200,
        height: 630,
        alt: 'Commodity Prices - Gold, Oil, Silver',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commodity Prices Today | Gold, Oil, Silver',
    description: 'Track real-time commodity prices - gold, crude oil, silver, natural gas, copper and more.',
  },
  alternates: {
    canonical: `${SITE_URL}/commodities`,
  },
}

interface CommodityData {
  symbol: string
  name: string
  unit: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  week52High: number
  week52Low: number
  history: { date: string; price: number }[]
  error?: string
}

interface CommoditiesResponse {
  commodities: Record<string, CommodityData>
  lastUpdated: string
}

async function getCommodities(): Promise<CommoditiesResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/commodities?commodity=all`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })

    if (!response.ok) {
      throw new Error('Failed to fetch commodities')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching commodities:', error)
    // Return fallback data
    return {
      commodities: {},
      lastUpdated: new Date().toISOString(),
    }
  }
}

// FAQ Schema Data
const commodityFAQs = [
  {
    question: 'What are commodity prices?',
    answer: 'Commodity prices are the market values of raw materials and primary goods traded globally, including precious metals (gold, silver), energy (crude oil, natural gas), agricultural products (wheat, corn), and industrial metals (copper, aluminum). These prices fluctuate based on supply, demand, geopolitical events, and economic conditions.',
  },
  {
    question: 'How do I invest in commodities?',
    answer: 'You can invest in commodities through several methods: commodity futures contracts, ETFs (Exchange-Traded Funds) that track commodity prices, stocks of commodity-producing companies, physical ownership of precious metals, mutual funds focused on commodities, or commodity index funds. Each method has different risk profiles and investment minimums.',
  },
  {
    question: 'What affects gold prices?',
    answer: 'Gold prices are influenced by inflation expectations, US dollar strength, interest rates, geopolitical uncertainty, central bank policies, jewelry and industrial demand, mining supply, and investor sentiment. Gold often serves as a safe-haven asset during economic uncertainty, causing prices to rise during market turmoil.',
  },
  {
    question: 'Why do oil prices fluctuate?',
    answer: 'Oil prices fluctuate due to global supply and demand dynamics, OPEC production decisions, geopolitical tensions in oil-producing regions, economic growth rates, weather events, refinery capacity, inventory levels, currency exchange rates, and speculation in futures markets. Both WTI and Brent crude prices are key benchmarks.',
  },
  {
    question: 'What is the difference between WTI and Brent crude oil?',
    answer: 'WTI (West Texas Intermediate) is a light, sweet crude oil sourced from US oil fields, primarily used as a US benchmark. Brent crude comes from the North Sea and serves as the international benchmark for oil prices. WTI is lighter and sweeter (lower sulfur) than Brent, though prices typically trade close together with slight premiums or discounts.',
  },
  {
    question: 'Are commodities a good inflation hedge?',
    answer: 'Commodities are considered effective inflation hedges because their prices often rise during inflationary periods. As the cost of goods and services increases, raw materials typically become more expensive. Precious metals like gold and silver, energy commodities, and agricultural products historically maintain purchasing power during inflation, though past performance does not guarantee future results.',
  },
  {
    question: 'What are the risks of commodity investing?',
    answer: 'Commodity investing carries risks including high price volatility, geopolitical risks, weather and natural disasters affecting supply, currency fluctuations, leverage in futures contracts, storage and holding costs for physical commodities, liquidity concerns, and contango/backwardation in futures markets. Commodities can experience rapid price swings and may not be suitable for all investors.',
  },
  {
    question: 'How do agricultural commodity prices affect food costs?',
    answer: 'Agricultural commodity prices (wheat, corn, soybeans) directly impact food costs as they are key inputs for bread, cereals, livestock feed, cooking oils, and processed foods. When drought, floods, or poor harvests reduce supply, commodity prices rise, leading to higher grocery costs. Currency exchange rates and global trade policies also influence how commodity price changes affect consumer food prices.',
  },
  {
    question: 'What is natural gas used for?',
    answer: 'Natural gas is used for electricity generation (40% of US electricity), residential and commercial heating, industrial processes, cooking, and increasingly as a transportation fuel. It is also a feedstock for fertilizers, plastics, and chemicals. Natural gas prices affect utility bills, manufacturing costs, and are influenced by seasonal demand (higher in winter for heating, summer for cooling).',
  },
  {
    question: 'Why is copper called "Dr. Copper"?',
    answer: 'Copper is nicknamed "Dr. Copper" because its price movements are seen as a diagnostic tool for global economic health. As copper is widely used in construction, electronics, power generation, and manufacturing, rising copper prices suggest strong economic growth and industrial activity, while falling prices may indicate economic slowdown.',
  },
  {
    question: 'What drives silver prices?',
    answer: 'Silver prices are driven by both investment demand (similar to gold as a precious metal) and industrial demand (electronics, solar panels, medical applications). Silver prices correlate with gold but tend to be more volatile. Factors include inflation expectations, industrial production, jewelry demand, mining supply, and the gold-to-silver ratio.',
  },
  {
    question: 'How are commodity prices determined?',
    answer: 'Commodity prices are determined by global supply and demand in futures markets, spot markets, and exchanges like CME, ICE, and LME. Prices reflect production costs, inventory levels, weather conditions, geopolitical events, currency values, speculative trading, and economic growth forecasts. Futures contracts establish future delivery prices, while spot prices reflect immediate delivery.',
  },
  {
    question: 'What is a commodity ETF?',
    answer: 'A commodity ETF (Exchange-Traded Fund) is an investment fund that tracks the price of a commodity or basket of commodities. These ETFs can hold physical commodities (like gold), futures contracts, or stocks of commodity-producing companies. They provide easy exposure to commodities without the complexity of futures trading or physical storage.',
  },
  {
    question: 'Should I invest in gold or silver?',
    answer: 'The choice between gold and silver depends on your investment goals and risk tolerance. Gold is more stable, liquid, and traditionally used as a wealth preservation tool and inflation hedge. Silver is more volatile with both investment and industrial demand, offering higher potential returns but greater price swings. Many investors hold both as part of a diversified portfolio.',
  },
]

export default async function CommoditiesPage() {
  const data = await getCommodities()
  const commodities = data.commodities

  // Organize commodities by category
  const preciousMetals = {
    gold: commodities.GOLD,
    silver: commodities.SILVER,
  }

  const energy = {
    wti: commodities.WTI,
    brent: commodities.BRENT,
    naturalGas: commodities.NATURAL_GAS,
  }

  const industrialMetals = {
    copper: commodities.COPPER,
    aluminum: commodities.ALUMINUM,
  }

  const agricultural = {
    wheat: commodities.WHEAT,
    corn: commodities.CORN,
    cotton: commodities.COTTON,
    sugar: commodities.SUGAR,
    coffee: commodities.COFFEE,
  }

  // Structured Data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Commodities', url: `${SITE_URL}/commodities` },
  ])

  const faqSchema = getFAQSchema(commodityFAQs)

  const articleSchema = getArticleSchema({
    headline: 'Commodity Prices Today - Gold, Oil, Silver & More',
    description: 'Track real-time commodity prices including gold, crude oil, silver, natural gas, copper, and agricultural commodities with live market data and trends.',
    url: `${SITE_URL}/commodities`,
    keywords: ['gold price', 'oil price', 'silver price', 'commodity prices', 'natural gas', 'copper', 'crude oil'],
  })

  return (
    <>
      <Header />
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, faqSchema, articleSchema]),
        }}
      />

      <main className="min-h-screen bg-background text-white pt-20">
        <div className="max-w-[1800px] mx-auto px-6 py-8">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#868f97] mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">Commodities</span>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">Commodity Prices Today</h1>
            <p className="text-xl text-[#868f97] mb-2">
              Track real-time prices for gold, crude oil, silver, natural gas, copper, and agricultural commodities
            </p>
            <p className="text-sm text-[#868f97]">
              Last updated: {new Date(data.lastUpdated).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>

          {/* Precious Metals */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Precious Metals</h2>
              <Link
                href="#faq"
                className="text-sm text-[#4ebe96] hover:text-[#4ebe96]/80 flex items-center gap-1"
              >
                Learn about precious metals
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CommodityCard commodity={preciousMetals.gold} />
              <CommodityCard commodity={preciousMetals.silver} />
            </div>
          </section>

          {/* Energy Commodities */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Energy Commodities</h2>
              <Link
                href="#faq"
                className="text-sm text-[#4ebe96] hover:text-[#4ebe96]/80 flex items-center gap-1"
              >
                Learn about oil & gas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CommodityCard commodity={energy.wti} />
              <CommodityCard commodity={energy.brent} />
              <CommodityCard commodity={energy.naturalGas} />
            </div>
          </section>

          {/* Industrial Metals */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Industrial Metals</h2>
              <Link
                href="#faq"
                className="text-sm text-[#4ebe96] hover:text-[#4ebe96]/80 flex items-center gap-1"
              >
                Learn about industrial metals
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CommodityCard commodity={industrialMetals.copper} />
              <CommodityCard commodity={industrialMetals.aluminum} />
            </div>
          </section>

          {/* Agricultural Commodities */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Agricultural Commodities</h2>
              <Link
                href="#faq"
                className="text-sm text-[#4ebe96] hover:text-[#4ebe96]/80 flex items-center gap-1"
              >
                Learn about agricultural investing
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <CommodityCard commodity={agricultural.wheat} compact />
              <CommodityCard commodity={agricultural.corn} compact />
              <CommodityCard commodity={agricultural.cotton} compact />
              <CommodityCard commodity={agricultural.sugar} compact />
              <CommodityCard commodity={agricultural.coffee} compact />
            </div>
          </section>

          {/* Market Insights */}
          <section className="mb-8">
            <Card className="bg-gradient-to-br from-[#4ebe96]/10 to-[#479ffa]/10 border-[#4ebe96]/20">
              <CardHeader>
                <CardTitle className="text-xl">Commodity Market Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-background/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Inflation Hedge</h3>
                    <p className="text-sm text-[#868f97]">
                      Commodities like gold and silver historically maintain purchasing power during inflationary periods, making them popular inflation hedges.
                    </p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Portfolio Diversification</h3>
                    <p className="text-sm text-[#868f97]">
                      Adding commodities to a portfolio can reduce overall risk through diversification, as commodity prices often move independently of stocks and bonds.
                    </p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Supply & Demand Dynamics</h3>
                    <p className="text-sm text-[#868f97]">
                      Commodity prices are driven by global supply and demand, geopolitical events, weather patterns, and economic growth expectations.
                    </p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg">
                    <h3 className="font-semibold mb-2">Investment Methods</h3>
                    <p className="text-sm text-[#868f97]">
                      Invest in commodities through ETFs, futures contracts, commodity stocks, or physical ownership depending on your risk tolerance and goals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions About Commodity Investing</h2>
            <div className="space-y-4">
              {commodityFAQs.map((faq, index) => (
                <Card key={index} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#868f97]">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <section className="mb-8">
            <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
              <CardHeader>
                <CardTitle>Related Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/"
                    className="p-4 bg-white/[0.05] rounded-2xl hover:bg-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out"
                  >
                    <h3 className="font-semibold mb-2">Stock Market</h3>
                    <p className="text-sm text-[#868f97]">
                      Track stock prices and analyze companies
                    </p>
                  </Link>
                  <Link
                    href="/dashboard?tab=screener"
                    className="p-4 bg-white/[0.05] rounded-2xl hover:bg-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out"
                  >
                    <h3 className="font-semibold mb-2">Stock Screener</h3>
                    <p className="text-sm text-[#868f97]">
                      Find commodity-related stocks
                    </p>
                  </Link>
                  <Link
                    href="/dashboard?tab=portfolio"
                    className="p-4 bg-white/[0.05] rounded-2xl hover:bg-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out"
                  >
                    <h3 className="font-semibold mb-2">Portfolio Analyzer</h3>
                    <p className="text-sm text-[#868f97]">
                      Analyze your commodity investments
                    </p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Disclaimer */}
          <div className="text-sm text-[#868f97] border-t border-white/[0.08] pt-6">
            <p className="mb-2">
              <strong>Disclaimer:</strong> Commodity prices are provided for informational purposes only and should not be considered investment advice. Commodity investing carries significant risks including price volatility, leverage risks, and potential for substantial losses. Past performance does not guarantee future results.
            </p>
            <p>
              Always conduct thorough research and consider consulting with a qualified financial advisor before making investment decisions. Prices may be delayed and are subject to market conditions.
            </p>
          </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function CommodityCard({ commodity, compact = false }: { commodity?: CommodityData; compact?: boolean }) {
  if (!commodity || commodity.error) {
    return (
      <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center text-[#868f97]">
            <p className="text-sm">Data temporarily unavailable</p>
            {commodity?.error && (
              <p className="text-xs mt-1">{commodity.error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPositive = commodity.changePercent >= 0
  const percentChange = Math.abs(commodity.changePercent)
  const absChange = Math.abs(commodity.change)

  return (
    <Card className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:border-[#4ebe96]/50 motion-safe:transition-all motion-safe:duration-150 ease-out">
      <CardContent className={compact ? 'p-4' : 'p-6'}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`font-bold ${compact ? 'text-base' : 'text-lg'}`}>{commodity.name}</h3>
              <p className="text-xs text-[#868f97]">{commodity.unit}</p>
            </div>
          </div>

          {/* Price */}
          <div>
            <div className={`font-bold tabular-nums ${compact ? 'text-2xl' : 'text-3xl'}`}>
              ${commodity.price.toFixed(2)}
            </div>
            <div className={`flex items-center gap-2 mt-1 ${isPositive ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="font-medium">
                {isPositive ? '+' : '-'}${absChange.toFixed(2)} ({isPositive ? '+' : '-'}
                {percentChange.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* 52 Week Range */}
          {!compact && commodity.week52High > 0 && commodity.week52Low > 0 && (
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <div className="flex justify-between text-xs text-[#868f97]">
                <span>52W Low: ${commodity.week52Low.toFixed(2)}</span>
                <span>52W High: ${commodity.week52High.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff5c5c] via-yellow-500 to-[#4ebe96]"
                  style={{
                    width: `${
                      ((commodity.price - commodity.week52Low) /
                        (commodity.week52High - commodity.week52Low)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Previous Close */}
          {!compact && (
            <div className="text-sm text-[#868f97]">
              Previous: ${commodity.previousClose.toFixed(2)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
