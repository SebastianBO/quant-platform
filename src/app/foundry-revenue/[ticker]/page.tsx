import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from "@/lib/seo"
import FoundryRevenueContent from "./FoundryRevenueContent"

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Foundry Revenue - Semiconductor Foundry Business Analysis`,
    description: `${symbol} foundry revenue analysis. Track semiconductor manufacturing services revenue, foundry market share, and chip fabrication business performance.`,
    keywords: [
      `${symbol} foundry revenue`,
      `${symbol} foundry business`,
      `${symbol} semiconductor foundry`,
      `${symbol} chip manufacturing`,
      `${symbol} wafer fabrication`,
      `${symbol} foundry market share`,
      `${symbol} contract manufacturing`,
    ],
    openGraph: {
      title: `${symbol} Foundry Revenue - Foundry Business Analysis`,
      description: `Complete foundry revenue analysis for ${symbol} including market share and growth trends.`,
      type: "article",
    },
    alternates: {
      canonical: `https://lician.com/foundry-revenue/${ticker.toLowerCase()}`,
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

export default async function FoundryRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts, historicalMetrics, incomeStatements } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/foundry-revenue/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector || "Technology"
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What is ${symbol} foundry revenue?`,
      answer: `Foundry revenue represents income ${companyName} generates from semiconductor manufacturing services for other companies. This business model separates chip design from manufacturing, serving fabless semiconductor companies.`
    },
    {
      question: `Why does foundry revenue matter for ${symbol} investors?`,
      answer: `Foundry revenue growth indicates market share gains and industry demand. Strong foundry revenue reflects competitive technology, customer diversification, and fab capacity expansion.`
    },
    {
      question: `What drives ${symbol} foundry revenue growth?`,
      answer: `Key drivers include technology leadership (advanced process nodes), customer diversification, capacity expansion through fab investments, and market share gains versus other foundries.`
    },
    {
      question: `How competitive is ${symbol} in the foundry market?`,
      answer: `Foundry competitiveness depends on process technology leadership, manufacturing yields, capacity availability, and customer relationships. Leading-edge nodes command premium pricing and higher margins.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stocks", url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Foundry Revenue`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Foundry Revenue - Semiconductor Foundry Business`,
    description: `Complete foundry revenue analysis for ${symbol} (${companyName}) including market share and business performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} foundry revenue`,
      `${symbol} foundry business`,
      `${symbol} semiconductor foundry`,
      `${symbol} chip manufacturing`,
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
      <FoundryRevenueContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={companyFacts}
        metrics={historicalMetrics || []}
        incomeStatements={incomeStatements || []}
      />
    </>
  )
}
