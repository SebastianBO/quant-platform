import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from "@/lib/seo"
import LeadTimesContent from "./LeadTimesContent"

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Lead Times - Semiconductor Delivery Times Analysis`,
    description: `${symbol} lead times analysis. Track chip delivery schedules, supply-demand dynamics, and order backlog in the semiconductor industry.`,
    keywords: [
      `${symbol} lead times`,
      `${symbol} delivery times`,
      `${symbol} semiconductor supply`,
      `${symbol} chip shortage`,
      `${symbol} order backlog`,
      `${symbol} supply chain`,
      `${symbol} demand signals`,
    ],
    openGraph: {
      title: `${symbol} Lead Times - Delivery Analysis`,
      description: `Complete lead times analysis for ${symbol} including supply-demand dynamics.`,
      type: "article",
    },
    alternates: {
      canonical: `https://lician.com/lead-times/${ticker.toLowerCase()}`,
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

export default async function LeadTimesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts, historicalMetrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/lead-times/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector || "Technology"
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What are ${symbol} lead times?`,
      answer: `Lead times represent the duration from when ${companyName} receives a chip order to delivery. Shorter lead times indicate available capacity, while extended lead times suggest strong demand or supply constraints.`
    },
    {
      question: `Why do lead times matter for ${symbol} investors?`,
      answer: `Lead times are a critical indicator of demand-supply balance. Extended lead times often precede revenue growth and pricing power, while normalizing lead times can signal moderating demand.`
    },
    {
      question: `What do extending lead times indicate for ${symbol}?`,
      answer: `Extending lead times typically indicate strengthening demand or supply constraints, which is often bullish for ${symbol}. This can lead to pricing power and revenue growth as demand outpaces supply.`
    },
    {
      question: `What do shortening lead times mean for ${symbol}?`,
      answer: `Shortening lead times may indicate weakening demand or new capacity additions coming online. This can signal potential revenue headwinds or increased competition in the semiconductor market.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stocks", url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Lead Times`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Lead Times - Semiconductor Delivery Analysis`,
    description: `Complete lead times analysis for ${symbol} (${companyName}) including supply-demand dynamics and backlog trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} lead times`,
      `${symbol} delivery times`,
      `${symbol} semiconductor supply`,
      `${symbol} order backlog`,
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
      <LeadTimesContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={companyFacts}
        metrics={historicalMetrics || []}
      />
    </>
  )
}
