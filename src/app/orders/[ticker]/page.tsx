import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import { RelatedLinks } from '@/components/seo/RelatedLinks'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600

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
    console.error('Error fetching orders data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Order Trends - New Orders & Bookings ${currentYear}`
  const description = `Analyze ${symbol} order trends, new orders, and booking rates for ${companyName}. Track order momentum, booking growth, and demand indicators.`

  return {
    title,
    description,
    keywords: [
      `${symbol} orders`,
      `${symbol} order trends`,
      `${symbol} new orders`,
      `${symbol} bookings`,
      `${companyName} orders`,
      `${symbol} order growth`,
      `${symbol} booking rates`,
      `${symbol} order momentum`,
    ],
    openGraph: {
      title: `${symbol} Order Trends - New Orders & Bookings`,
      description,
      type: 'article',
      url: `${SITE_URL}/orders/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Order Trends`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/orders/${ticker.toLowerCase()}`,
    },
  }
}

export default async function OrdersPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const pageUrl = `${SITE_URL}/orders/${ticker.toLowerCase()}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Order Trends', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Order Trends - New Orders & Bookings ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) order trends, new bookings, and demand indicators.`,
    url: pageUrl,
    keywords: [
      `${symbol} orders`,
      `${symbol} order trends`,
      `${companyName} bookings`,
    ],
  })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What are ${symbol}'s recent order trends?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s order trends indicate the momentum in new business bookings and customer demand.`
        }
      },
      {
        '@type': 'Question',
        name: `How strong is ${symbol}'s order growth?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Order growth for ${companyName} reflects demand trends and future revenue potential.`
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
          <h1 className="text-4xl font-bold mb-4">{symbol} Order Trends</h1>
          <p className="text-xl text-muted-foreground mb-8">
            New orders and booking analysis for {companyName}
          </p>

          <div className="prose prose-invert max-w-none">
            <p>
              Analyze {companyName} ({symbol}) order trends and new bookings.
              Order momentum provides insights into demand trends and future revenue visibility.
            </p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </div>
    </>
  )
}
