import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from "@/lib/seo"
import DesignWinsContent from "./DesignWinsContent"

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Design Wins - Semiconductor Customer Acquisitions`,
    description: `${symbol} design wins analysis. Track customer acquisitions, design win pipeline, and future revenue visibility in the semiconductor industry.`,
    keywords: [
      `${symbol} design wins`,
      `${symbol} customer wins`,
      `${symbol} semiconductor customers`,
      `${symbol} chip design`,
      `${symbol} customer acquisitions`,
      `${symbol} revenue pipeline`,
      `${symbol} market share`,
    ],
    openGraph: {
      title: `${symbol} Design Wins - Customer Acquisition Analysis`,
      description: `Complete design wins analysis for ${symbol} including customer pipeline and revenue visibility.`,
      type: "article",
    },
    alternates: {
      canonical: `https://lician.com/design-wins/${ticker.toLowerCase()}`,
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

export default async function DesignWinsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts, historicalMetrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/design-wins/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector || "Technology"
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What are ${symbol} design wins?`,
      answer: `Design wins are customer commitments to use ${companyName}\`s semiconductor products in their devices. These wins represent future revenue opportunities and validate the company\`s technology competitiveness.`
    },
    {
      question: `Why do design wins matter for ${symbol} investors?`,
      answer: `Design wins are leading indicators of future revenue. They typically convert to actual sales over 12-24 months as customer products move from development into production, creating a predictable revenue pipeline.`
    },
    {
      question: `How do design wins create competitive advantage for ${symbol}?`,
      answer: `Once ${companyName}\`s chips are designed into a customer\`s product, switching costs become significant. This creates customer stickiness and makes design wins a durable competitive moat.`
    },
    {
      question: `What indicates strong design win momentum for ${symbol}?`,
      answer: `Strong design win momentum is indicated by increasing customer count, expanding into new market segments, winning major OEM contracts, and growing the pipeline of future revenue opportunities.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stocks", url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Design Wins`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Design Wins - Semiconductor Customer Acquisitions`,
    description: `Complete design wins analysis for ${symbol} (${companyName}) including customer pipeline and revenue visibility.`,
    url: pageUrl,
    keywords: [
      `${symbol} design wins`,
      `${symbol} customer wins`,
      `${symbol} semiconductor customers`,
      `${symbol} revenue pipeline`,
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
      <DesignWinsContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={companyFacts}
        metrics={historicalMetrics || []}
      />
    </>
  )
}
