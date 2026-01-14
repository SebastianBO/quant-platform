import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from "@/lib/seo"
import WaferStartsContent from "./WaferStartsContent"

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Wafer Starts - Semiconductor Production Capacity`,
    description: `${symbol} wafer starts analysis. Track semiconductor wafer production, manufacturing capacity, and chip production trends.`,
    keywords: [
      `${symbol} wafer starts`,
      `${symbol} wafer production`,
      `${symbol} semiconductor production`,
      `${symbol} fab capacity`,
      `${symbol} chip manufacturing`,
      `${symbol} production volume`,
      `${symbol} manufacturing capacity`,
    ],
    openGraph: {
      title: `${symbol} Wafer Starts - Production Capacity Analysis`,
      description: `Complete wafer starts analysis for ${symbol} including production capacity and trends.`,
      type: "article",
    },
    alternates: {
      canonical: `https://lician.com/wafer-starts/${ticker.toLowerCase()}`,
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

export default async function WaferStartsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts, historicalMetrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/wafer-starts/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector || "Technology"
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What are ${symbol} wafer starts?`,
      answer: `Wafer starts represent the number of silicon wafers ${companyName} begins processing in its fabrication facilities. This metric is a critical indicator of semiconductor production capacity and manufacturing activity.`
    },
    {
      question: `Why do wafer starts matter for ${symbol} investors?`,
      answer: `Higher wafer starts typically indicate increased production capacity, stronger demand, and potential revenue growth. Companies with expanding wafer starts are often investing in capacity expansion to meet market demand.`
    },
    {
      question: `What factors affect ${symbol} wafer starts?`,
      answer: `Key factors include fab capacity, customer demand trends, technology migrations to new process nodes, and capacity utilization. Wafer starts reflect both supply capability and demand signals.`
    },
    {
      question: `How do wafer starts relate to ${symbol} revenue?`,
      answer: `Wafer starts are a leading indicator of future revenue. Increased wafer starts today translate to finished chips and revenue in subsequent quarters, making this a valuable forward-looking metric.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stocks", url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Wafer Starts`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Wafer Starts - Semiconductor Production Analysis`,
    description: `Complete wafer starts analysis for ${symbol} (${companyName}) including production capacity and manufacturing trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} wafer starts`,
      `${symbol} wafer production`,
      `${symbol} semiconductor production`,
      `${symbol} fab capacity`,
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
      <WaferStartsContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={companyFacts}
        metrics={historicalMetrics || []}
      />
    </>
  )
}
