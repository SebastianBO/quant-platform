import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import MemoryPricingContent from './MemoryPricingContent'

interface Props {
  params: Promise<{ ticker: string }>
}

// Allow dynamic rendering
export const dynamic = 'force-dynamic'

// Fetch stock data
async function getStockData(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const [fundamentalsRes, metricsRes] = await Promise.all([
      fetch(`${baseUrl}/api/fundamentals?ticker=${ticker}`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${baseUrl}/api/v1/financial-metrics?ticker=${ticker}&period=annual&limit=5`, {
        next: { revalidate: 3600 }
      }),
    ])

    const fundamentals = fundamentalsRes.ok ? await fundamentalsRes.json() : null
    const metrics = metricsRes.ok ? await metricsRes.json() : { financial_metrics: [] }

    return {
      fundamentals,
      metrics: metrics.financial_metrics || [],
    }
  } catch (error) {
    console.error('Error fetching stock data:', error)
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Memory Pricing - DRAM & NAND Pricing Trends ${currentYear}`
  const description = `Track ${symbol} memory chip pricing and DRAM/NAND trends for ${companyName}. Analyze ${currentYear} memory market pricing and semiconductor margins.`

  return {
    title,
    description,
    keywords: [
      `${symbol} memory pricing`,
      `${symbol} DRAM pricing`,
      `${symbol} NAND pricing`,
      `${companyName} memory pricing`,
      `${symbol} memory market`,
      `${symbol} chip pricing`,
      `${symbol} memory trends`,
      `${symbol} semiconductor pricing`,
      `${symbol} memory ASP`,
      `${symbol} storage pricing`,
    ],
    openGraph: {
      title: `${symbol} Memory Pricing - DRAM & NAND Pricing Trends`,
      description,
      type: 'article',
      url: `${SITE_URL}/memory-pricing/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/memory-pricing/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Memory Pricing`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Memory Pricing`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/memory-pricing/${ticker.toLowerCase()}`,
    },
  }
}

export default async function MemoryPricingPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const pageUrl = `${SITE_URL}/memory-pricing/${ticker.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Memory Pricing', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Memory Pricing - DRAM & NAND Pricing Trends ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) memory chip pricing trends and DRAM/NAND market dynamics.`,
    url: pageUrl,
    keywords: [
      `${symbol} memory pricing`,
      `${symbol} DRAM pricing`,
      `${symbol} NAND pricing`,
      `${companyName} memory pricing`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are ${symbol}'s memory pricing trends?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Memory pricing for ${companyName} follows cyclical patterns based on supply-demand dynamics in DRAM and NAND markets. Pricing directly impacts revenue and profitability for memory semiconductor companies.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${symbol} memory pricing improving?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Memory pricing trends affect ${companyName}'s financial performance. Rising prices typically indicate industry supply discipline and strong demand, while declining prices suggest oversupply or weak end-market demand.`
        }
      },
      {
        '@type': 'Question',
        name: `How does memory pricing impact ${symbol} stock?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Memory pricing is a critical driver of ${companyName}'s stock performance. The cyclical nature of DRAM and NAND pricing creates volatility in revenue, margins, and earnings for memory semiconductor companies.`
        }
      },
    ],
  }

  const schemas = [breadcrumbSchema, articleSchema, faqSchema]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />

      <MemoryPricingContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={data.fundamentals}
        metrics={data.metrics}
      />
    </>
  )
}
