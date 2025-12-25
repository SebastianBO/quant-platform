import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from "@/lib/seo"
import MemoryPricingContent from "./MemoryPricingContent"

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Memory Pricing - DRAM & NAND Price Trends`,
    description: `${symbol} memory pricing analysis. Track DRAM and NAND pricing trends, memory market cycles, and semiconductor memory pricing dynamics.`,
    keywords: [
      `${symbol} memory pricing`,
      `${symbol} DRAM pricing`,
      `${symbol} NAND pricing`,
      `${symbol} memory market`,
      `${symbol} semiconductor memory`,
      `${symbol} memory chips`,
      `${symbol} memory cycle`,
    ],
    openGraph: {
      title: `${symbol} Memory Pricing - DRAM & NAND Analysis`,
      description: `Complete memory pricing analysis for ${symbol} including DRAM and NAND market trends.`,
      type: "article",
    },
    alternates: {
      canonical: `https://lician.com/memory-pricing/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const [stockRes, metricsRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stock?ticker=${ticker}`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/v1/financial-metrics?ticker=${ticker}&limit=8`,
        { next: { revalidate: 3600 } }
      ),
    ])

    if (!stockRes.ok) return null

    const stockData = await stockRes.json()
    const metricsData = metricsRes.ok ? await metricsRes.json() : []

    return { ...stockData, historicalMetrics: metricsData }
  } catch {
    return null
  }
}

export default async function MemoryPricingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts, historicalMetrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/memory-pricing/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector || "Technology"
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `How does memory pricing affect ${symbol}?`,
      answer: `Memory pricing for ${companyName} follows cyclical patterns based on supply-demand dynamics in DRAM and NAND markets. Pricing directly impacts revenue and profitability for memory semiconductor companies.`
    },
    {
      question: `Why is memory pricing so volatile for ${symbol}?`,
      answer: `Memory pricing is cyclical due to the commodity-like nature of DRAM and NAND. Industry capacity additions, inventory levels, and end-market demand create boom-bust cycles that significantly impact ${symbol}\`s financial performance.`
    },
    {
      question: `What drives memory price cycles for ${symbol}?`,
      answer: `Key drivers include supply discipline (capacity additions and production cuts), end-market demand (PC, smartphone, data center), channel inventory levels, and technology transitions affecting cost structures.`
    },
    {
      question: `How should investors track ${symbol} memory pricing?`,
      answer: `Investors should monitor spot and contract prices for DRAM and NAND, industry supply discipline announcements, inventory levels at customers, and end-market demand trends to anticipate ${symbol}\`s financial performance.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stocks", url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Memory Pricing`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Memory Pricing - DRAM & NAND Price Analysis`,
    description: `Complete memory pricing analysis for ${symbol} (${companyName}) including DRAM and NAND market dynamics.`,
    url: pageUrl,
    keywords: [
      `${symbol} memory pricing`,
      `${symbol} DRAM pricing`,
      `${symbol} NAND pricing`,
      `${symbol} memory market`,
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

  const faqSchema = getFAQSchema(faqs)
  const schemas = [breadcrumbSchema, articleSchema, corporationSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <MemoryPricingContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={companyFacts}
        metrics={historicalMetrics || []}
      />
    </>
  )
}
