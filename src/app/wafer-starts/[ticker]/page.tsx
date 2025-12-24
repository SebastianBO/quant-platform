import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import WaferStartsContent from './WaferStartsContent'

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

  const title = `${symbol} Wafer Starts - Semiconductor Production Capacity ${currentYear}`
  const description = `Analyze ${symbol} wafer starts and semiconductor manufacturing capacity for ${companyName}. Track ${currentYear} production trends and fab utilization.`

  return {
    title,
    description,
    keywords: [
      `${symbol} wafer starts`,
      `${symbol} production capacity`,
      `${symbol} semiconductor manufacturing`,
      `${companyName} wafer production`,
      `${symbol} fab capacity`,
      `${symbol} chip production`,
      `${symbol} manufacturing output`,
      `${symbol} wafer production trend`,
      `${symbol} foundry capacity`,
      `${symbol} semiconductor output`,
    ],
    openGraph: {
      title: `${symbol} Wafer Starts - Semiconductor Production Capacity`,
      description,
      type: 'article',
      url: `${SITE_URL}/wafer-starts/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/wafer-starts/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Wafer Starts`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Wafer Starts`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/wafer-starts/${ticker.toLowerCase()}`,
    },
  }
}

export default async function WaferStartsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const pageUrl = `${SITE_URL}/wafer-starts/${ticker.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Wafer Starts', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Wafer Starts - Semiconductor Production Capacity ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) wafer starts and semiconductor manufacturing capacity.`,
    url: pageUrl,
    keywords: [
      `${symbol} wafer starts`,
      `${symbol} production capacity`,
      `${symbol} semiconductor manufacturing`,
      `${companyName} wafer production`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are ${symbol}'s wafer starts?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Wafer starts represent the number of silicon wafers ${companyName} begins processing in its fabrication facilities. This metric is a key indicator of semiconductor production capacity and manufacturing activity.`
        }
      },
      {
        '@type': 'Question',
        name: `How does ${symbol} wafer production impact revenue?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Higher wafer starts typically indicate increased production capacity and potential revenue growth for ${companyName}. Wafer starts are a leading indicator of future chip shipments and sales.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${symbol} increasing wafer production capacity?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Track ${companyName}'s wafer start trends and fab expansion announcements to understand production capacity changes. Capital expenditure on new fabs indicates future capacity growth.`
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

      <WaferStartsContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={data.fundamentals}
        metrics={data.metrics}
      />
    </>
  )
}
