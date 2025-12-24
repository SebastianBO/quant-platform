import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import ProcessNodeContent from './ProcessNodeContent'

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

  const title = `${symbol} Process Node - Semiconductor Technology Node ${currentYear}`
  const description = `Analyze ${symbol} process node technology and chip manufacturing capabilities for ${companyName}. Track ${currentYear} semiconductor node transitions and advanced lithography.`

  return {
    title,
    description,
    keywords: [
      `${symbol} process node`,
      `${symbol} technology node`,
      `${symbol} semiconductor technology`,
      `${companyName} process node`,
      `${symbol} chip technology`,
      `${symbol} nm process`,
      `${symbol} node transition`,
      `${symbol} manufacturing process`,
      `${symbol} advanced node`,
      `${symbol} lithography technology`,
    ],
    openGraph: {
      title: `${symbol} Process Node - Semiconductor Technology Node`,
      description,
      type: 'article',
      url: `${SITE_URL}/process-node/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/process-node/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Process Node`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Process Node`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/process-node/${ticker.toLowerCase()}`,
    },
  }
}

export default async function ProcessNodePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const pageUrl = `${SITE_URL}/process-node/${ticker.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Process Node', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Process Node - Semiconductor Technology Node ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) process node technology and chip manufacturing capabilities.`,
    url: pageUrl,
    keywords: [
      `${symbol} process node`,
      `${symbol} technology node`,
      `${symbol} semiconductor technology`,
      `${companyName} process node`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What process node does ${symbol} use?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName} utilizes various semiconductor process nodes depending on product requirements. Advanced nodes (7nm, 5nm, 3nm) are used for cutting-edge chips, while mature nodes serve cost-sensitive applications.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${symbol} transitioning to advanced process nodes?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s process node roadmap includes transitions to more advanced manufacturing technologies. These transitions can improve chip performance, power efficiency, and enable competitive advantages in the semiconductor market.`
        }
      },
      {
        '@type': 'Question',
        name: `How does process node affect ${symbol}'s competitiveness?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Process node technology is critical for ${companyName}'s competitiveness. Advanced nodes enable better performance and power efficiency, while timely node transitions can capture market share in premium segments.`
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

      <ProcessNodeContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={data.fundamentals}
        metrics={data.metrics}
      />
    </>
  )
}
