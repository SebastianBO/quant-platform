import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import { RelatedLinks } from '@/components/seo/RelatedLinks'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

async function getStockData(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const fundamentalsRes = await fetch(`${baseUrl}/api/fundamentals?ticker=${ticker}`, {
      next: { revalidate: 3600 }
    })

    const fundamentals = fundamentalsRes.ok ? await fundamentalsRes.json() : null

    return {
      fundamentals,
    }
  } catch (error) {
    console.error('Error fetching capacity utilization data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Capacity Utilization - Production Efficiency ${currentYear}`
  const description = `Analyze ${symbol} capacity utilization rates for ${companyName}. Track production efficiency, facility utilization, and manufacturing capacity trends.`

  return {
    title,
    description,
    keywords: [
      `${symbol} capacity utilization`,
      `${symbol} production capacity`,
      `${symbol} facility utilization`,
      `${companyName} capacity`,
      `${symbol} manufacturing efficiency`,
      `${symbol} production efficiency`,
      `${symbol} utilization rate`,
    ],
    openGraph: {
      title: `${symbol} Capacity Utilization - Production Efficiency`,
      description,
      type: 'article',
      url: `${SITE_URL}/capacity-utilization/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Capacity Utilization`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/capacity-utilization/${ticker.toLowerCase()}`,
    },
  }
}

export default async function CapacityUtilizationPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const pageUrl = `${SITE_URL}/capacity-utilization/${ticker.toLowerCase()}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Capacity Utilization', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Capacity Utilization - Production Efficiency ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) capacity utilization, production efficiency, and manufacturing trends.`,
    url: pageUrl,
    keywords: [
      `${symbol} capacity utilization`,
      `${symbol} production capacity`,
      `${companyName} facility utilization`,
    ],
  })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s capacity utilization rate?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s capacity utilization measures the percentage of production capacity being used to meet demand.`
        }
      },
      {
        '@type': 'Question',
        name: `Why does ${symbol}'s capacity utilization matter?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `High capacity utilization for ${companyName} indicates strong demand and efficient operations, while low utilization may signal weak demand or excess capacity.`
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

      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold mb-4">{symbol} Capacity Utilization</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Production efficiency and facility utilization for {companyName}
          </p>

          <div className="prose prose-invert max-w-none">
            <p>
              Analyze {companyName} ({symbol}) capacity utilization and production efficiency.
              Capacity utilization rates provide insights into demand trends and operational efficiency.
            </p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </div>
    </>
  )
}
