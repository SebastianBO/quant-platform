import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from "@/lib/seo"
import AspTrendContent from "./AspTrendContent"

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} ASP Trends - Average Selling Price Analysis`,
    description: `${symbol} Average Selling Price (ASP) trends analysis. Track ASP changes, pricing power, product mix shifts, and semiconductor pricing dynamics.`,
    keywords: [
      `${symbol} ASP`,
      `${symbol} average selling price`,
      `${symbol} pricing power`,
      `${symbol} semiconductor pricing`,
      `${symbol} product mix`,
      `${symbol} chip pricing`,
      `${symbol} pricing trends`,
    ],
    openGraph: {
      title: `${symbol} ASP Trends - Average Selling Price Analysis`,
      description: `Complete ASP analysis for ${symbol} including pricing power and product mix trends.`,
      type: "article",
    },
    alternates: {
      canonical: `https://lician.com/asp-trend/${ticker.toLowerCase()}`,
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

export default async function AspTrendPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts, historicalMetrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/asp-trend/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector || "Technology"
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What is ${symbol} ASP (Average Selling Price)?`,
      answer: `ASP represents the average price ${companyName} receives per semiconductor unit sold. ASP trends indicate pricing power, product mix shifts, and competitive dynamics in the chip market.`
    },
    {
      question: `Why does ASP matter for ${symbol} investors?`,
      answer: `ASP directly impacts ${symbol}\`s revenue as total sales equal unit volume multiplied by ASP. Rising ASP can drive revenue growth even with flat unit shipments, while also improving margins and profitability.`
    },
    {
      question: `What factors affect ${symbol} ASP trends?`,
      answer: `${symbol}\`s ASP is influenced by product mix (premium vs mainstream), technology node (advanced nodes command higher prices), supply-demand balance, and competitive intensity in the semiconductor market.`
    },
    {
      question: `How does product mix affect ${symbol} average selling price?`,
      answer: `A shift toward premium, high-performance products increases ${symbol}\`s ASP, while a mainstream-focused mix typically reduces it. Technology transitions and new product launches can significantly impact the overall ASP.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stocks", url: `${SITE_URL}/dashboard` },
    { name: `${symbol} ASP Trends`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} ASP Trends - Average Selling Price Analysis`,
    description: `Complete ASP analysis for ${symbol} (${companyName}) including pricing trends and product mix dynamics.`,
    url: pageUrl,
    keywords: [
      `${symbol} ASP`,
      `${symbol} average selling price`,
      `${symbol} pricing power`,
      `${symbol} semiconductor pricing`,
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
      <AspTrendContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={companyFacts}
        metrics={historicalMetrics || []}
      />
    </>
  )
}
