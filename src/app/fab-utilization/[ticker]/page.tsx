import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from "@/lib/seo"
import FabUtilizationContent from "./FabUtilizationContent"

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Fab Utilization - Semiconductor Capacity Utilization`,
    description: `${symbol} fab utilization analysis. Track manufacturing capacity utilization, production efficiency, and demand signals in semiconductor fabrication.`,
    keywords: [
      `${symbol} fab utilization`,
      `${symbol} capacity utilization`,
      `${symbol} semiconductor manufacturing`,
      `${symbol} fab capacity`,
      `${symbol} production efficiency`,
      `${symbol} chip manufacturing`,
      `${symbol} foundry utilization`,
    ],
    openGraph: {
      title: `${symbol} Fab Utilization - Capacity Analysis`,
      description: `Complete fab utilization analysis for ${symbol} including capacity and efficiency metrics.`,
      type: "article",
    },
    alternates: {
      canonical: `https://lician.com/fab-utilization/${ticker.toLowerCase()}`,
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

export default async function FabUtilizationPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts, historicalMetrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/fab-utilization/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector || "Technology"
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What is ${symbol} fab utilization?`,
      answer: `Fab utilization measures the percentage of ${companyName}\`s semiconductor fabrication capacity being actively used for production. Higher utilization typically indicates strong demand and operational efficiency.`
    },
    {
      question: `Why does fab utilization matter for ${symbol} investors?`,
      answer: `Fab utilization directly impacts ${symbol}\`s profitability. High utilization spreads fixed manufacturing costs across more units, improving margins. Low utilization can signal weak demand or excess capacity.`
    },
    {
      question: `What is considered healthy fab utilization for ${symbol}?`,
      answer: `Optimal fab utilization is typically 80-90%. This level maximizes efficiency while maintaining flexibility. Utilization above 90% can indicate tight supply, while below 70% suggests excess capacity.`
    },
    {
      question: `How does fab utilization affect ${symbol} stock?`,
      answer: `High utilization often correlates with pricing power and margin expansion. Sustained high utilization may justify capacity investments, while declining utilization can signal revenue headwinds.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stocks", url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Fab Utilization`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Fab Utilization - Semiconductor Capacity Analysis`,
    description: `Complete fab utilization analysis for ${symbol} (${companyName}) including capacity metrics and demand signals.`,
    url: pageUrl,
    keywords: [
      `${symbol} fab utilization`,
      `${symbol} capacity utilization`,
      `${symbol} semiconductor manufacturing`,
      `${symbol} production efficiency`,
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
      <FabUtilizationContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={companyFacts}
        metrics={historicalMetrics || []}
      />
    </>
  )
}
