import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import DesignWinsContent from './DesignWinsContent'

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

  const title = `${symbol} Design Wins - Semiconductor Customer Wins ${currentYear}`
  const description = `Track ${symbol} design wins and customer acquisitions for ${companyName}. Analyze ${currentYear} chip design wins and future revenue pipeline.`

  return {
    title,
    description,
    keywords: [
      `${symbol} design wins`,
      `${symbol} customer wins`,
      `${symbol} chip design wins`,
      `${companyName} design wins`,
      `${symbol} customer acquisitions`,
      `${symbol} revenue pipeline`,
      `${symbol} chip wins`,
      `${symbol} design-in`,
      `${symbol} customer pipeline`,
      `${symbol} semiconductor wins`,
    ],
    openGraph: {
      title: `${symbol} Design Wins - Semiconductor Customer Wins`,
      description,
      type: 'article',
      url: `${SITE_URL}/design-wins/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/design-wins/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Design Wins`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Design Wins`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/design-wins/${ticker.toLowerCase()}`,
    },
  }
}

export default async function DesignWinsPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const pageUrl = `${SITE_URL}/design-wins/${ticker.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Design Wins', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Design Wins - Semiconductor Customer Wins ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) design wins and customer acquisitions in the semiconductor industry.`,
    url: pageUrl,
    keywords: [
      `${symbol} design wins`,
      `${symbol} customer wins`,
      `${symbol} chip design wins`,
      `${companyName} design wins`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are ${symbol}'s design wins?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Design wins are customer commitments to use ${companyName}'s semiconductor products in their devices. These wins represent future revenue opportunities and validate the company's technology competitiveness.`
        }
      },
      {
        '@type': 'Question',
        name: `How do design wins impact ${symbol} revenue?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Design wins are leading indicators of future revenue for ${companyName}. They typically convert to actual sales over 12-24 months as customer products move into production, creating a predictable revenue pipeline.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${symbol} winning new customers?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Track ${companyName}'s design win announcements and customer diversification to understand market share gains and competitive positioning in the semiconductor industry.`
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

      <DesignWinsContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={data.fundamentals}
        metrics={data.metrics}
      />
    </>
  )
}
