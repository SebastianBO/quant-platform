import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import LeadTimesContent from './LeadTimesContent'

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

  const title = `${symbol} Lead Times - Semiconductor Delivery Times ${currentYear}`
  const description = `Track ${symbol} lead times and chip delivery schedules for ${companyName}. Monitor ${currentYear} semiconductor order backlogs and supply chain trends.`

  return {
    title,
    description,
    keywords: [
      `${symbol} lead times`,
      `${symbol} delivery times`,
      `${symbol} chip lead times`,
      `${companyName} lead times`,
      `${symbol} order backlog`,
      `${symbol} delivery schedule`,
      `${symbol} supply chain`,
      `${symbol} manufacturing lead time`,
      `${symbol} chip availability`,
      `${symbol} semiconductor delivery`,
    ],
    openGraph: {
      title: `${symbol} Lead Times - Semiconductor Delivery Times`,
      description,
      type: 'article',
      url: `${SITE_URL}/lead-times/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/lead-times/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Lead Times`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Lead Times`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/lead-times/${ticker.toLowerCase()}`,
    },
  }
}

export default async function LeadTimesPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const pageUrl = `${SITE_URL}/lead-times/${ticker.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Lead Times', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Lead Times - Semiconductor Delivery Times ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) lead times and chip delivery schedules.`,
    url: pageUrl,
    keywords: [
      `${symbol} lead times`,
      `${symbol} delivery times`,
      `${symbol} chip lead times`,
      `${companyName} lead times`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are ${symbol}'s current lead times?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Lead times represent the duration from when ${companyName} receives a chip order to delivery. Shorter lead times indicate available capacity, while extended lead times suggest strong demand or supply constraints.`
        }
      },
      {
        '@type': 'Question',
        name: `Why are ${symbol} lead times important?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Lead times are a critical indicator of demand-supply balance for ${companyName}. Extended lead times often precede revenue growth and pricing power, while normalizing lead times can signal moderating demand.`
        }
      },
      {
        '@type': 'Question',
        name: `Are ${symbol} lead times increasing or decreasing?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Monitor ${companyName}'s lead time trends to understand industry demand dynamics. Increasing lead times typically indicate strengthening demand, while decreasing lead times may suggest capacity additions or demand softness.`
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

      <LeadTimesContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={data.fundamentals}
        metrics={data.metrics}
      />
    </>
  )
}
