import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import FabUtilizationContent from './FabUtilizationContent'

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

  const title = `${symbol} Fab Utilization - Semiconductor Capacity Utilization ${currentYear}`
  const description = `Track ${symbol} fab utilization rates and manufacturing efficiency for ${companyName}. Analyze ${currentYear} capacity utilization and production trends.`

  return {
    title,
    description,
    keywords: [
      `${symbol} fab utilization`,
      `${symbol} capacity utilization`,
      `${symbol} manufacturing efficiency`,
      `${companyName} fab utilization`,
      `${symbol} production efficiency`,
      `${symbol} foundry utilization`,
      `${symbol} fab capacity`,
      `${symbol} utilization rate`,
      `${symbol} semiconductor capacity`,
      `${symbol} fab efficiency`,
    ],
    openGraph: {
      title: `${symbol} Fab Utilization - Semiconductor Capacity Utilization`,
      description,
      type: 'article',
      url: `${SITE_URL}/fab-utilization/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/fab-utilization/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Fab Utilization`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Fab Utilization`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/fab-utilization/${ticker.toLowerCase()}`,
    },
  }
}

export default async function FabUtilizationPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const pageUrl = `${SITE_URL}/fab-utilization/${ticker.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Fab Utilization', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Fab Utilization - Semiconductor Capacity Utilization ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) fab utilization rates and manufacturing efficiency.`,
    url: pageUrl,
    keywords: [
      `${symbol} fab utilization`,
      `${symbol} capacity utilization`,
      `${symbol} manufacturing efficiency`,
      `${companyName} fab utilization`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s fab utilization rate?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Fab utilization rate measures the percentage of ${companyName}'s semiconductor fabrication capacity being actively used for production. Higher utilization typically indicates strong demand and operational efficiency.`
        }
      },
      {
        '@type': 'Question',
        name: `Why is fab utilization important for ${symbol}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Fab utilization is crucial for ${companyName} because it directly impacts profitability. High utilization spreads fixed costs across more units, improving margins, while low utilization can signal weak demand or excess capacity.`
        }
      },
      {
        '@type': 'Question',
        name: `How does ${symbol} capacity utilization affect stock price?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Changes in ${companyName}'s fab utilization can significantly impact stock price as they reflect demand trends, operational efficiency, and future revenue potential in the semiconductor industry.`
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

      <FabUtilizationContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={data.fundamentals}
        metrics={data.metrics}
      />
    </>
  )
}
