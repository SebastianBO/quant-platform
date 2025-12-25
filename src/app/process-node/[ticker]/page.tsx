import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getCorporationSchema,
  SITE_URL,
} from "@/lib/seo"
import ProcessNodeContent from "./ProcessNodeContent"

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Process Node - Semiconductor Technology Analysis`,
    description: `${symbol} process node analysis. Track semiconductor technology nodes, chip manufacturing capabilities, and technology leadership in the semiconductor industry.`,
    keywords: [
      `${symbol} process node`,
      `${symbol} technology node`,
      `${symbol} semiconductor technology`,
      `${symbol} chip manufacturing`,
      `${symbol} 3nm`,
      `${symbol} 5nm`,
      `${symbol} advanced node`,
    ],
    openGraph: {
      title: `${symbol} Process Node - Technology Analysis`,
      description: `Complete process node analysis for ${symbol} including technology leadership and capabilities.`,
      type: "article",
    },
    alternates: {
      canonical: `https://lician.com/process-node/${ticker.toLowerCase()}`,
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

export default async function ProcessNodePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)

  if (!stockData?.snapshot) {
    notFound()
  }

  const { companyFacts, historicalMetrics } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/process-node/${ticker.toLowerCase()}`
  const sector = companyFacts?.sector || "Technology"
  const industry = companyFacts?.industry

  const faqs = [
    {
      question: `What process nodes does ${symbol} use?`,
      answer: `${companyName} utilizes various semiconductor process nodes depending on product requirements. Advanced nodes (7nm, 5nm, 3nm, and beyond) are used for cutting-edge chips requiring maximum performance and power efficiency.`
    },
    {
      question: `Why do process nodes matter for ${symbol}?`,
      answer: `Process node technology is critical for competitiveness. Advanced nodes enable better performance, power efficiency, and transistor density, while timely node transitions can capture market share in premium segments.`
    },
    {
      question: `What are leading-edge process nodes for ${symbol}?`,
      answer: `Leading-edge nodes (3nm, 5nm) offer maximum performance and power efficiency for premium products. These nodes command higher prices and margins but require significant R&D and manufacturing investment.`
    },
    {
      question: `How does process node transition affect ${symbol} stock?`,
      answer: `Successful node transitions can drive revenue growth and margin expansion as ${companyName} captures premium market segments. Delays or yield issues in node transitions can negatively impact competitiveness and financial performance.`
    },
  ]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Stocks", url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Process Node`, url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Process Node - Semiconductor Technology Analysis`,
    description: `Complete process node analysis for ${symbol} (${companyName}) including technology capabilities and roadmap.`,
    url: pageUrl,
    keywords: [
      `${symbol} process node`,
      `${symbol} technology node`,
      `${symbol} semiconductor technology`,
      `${symbol} advanced node`,
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
      <ProcessNodeContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={companyFacts}
        metrics={historicalMetrics || []}
      />
    </>
  )
}
