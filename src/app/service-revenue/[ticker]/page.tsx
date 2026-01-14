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
    console.error('Error fetching service revenue data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Service Revenue - Recurring Service Income ${currentYear}`
  const description = `Analyze ${symbol} service revenue streams for ${companyName}. Track maintenance contracts, support services, and recurring service income trends.`

  return {
    title,
    description,
    keywords: [
      `${symbol} service revenue`,
      `${symbol} recurring revenue`,
      `${symbol} maintenance contracts`,
      `${companyName} service income`,
      `${symbol} support services`,
      `${symbol} service contracts`,
      `${symbol} subscription revenue`,
    ],
    openGraph: {
      title: `${symbol} Service Revenue - Recurring Service Income`,
      description,
      type: 'article',
      url: `${SITE_URL}/service-revenue/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Service Revenue`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/service-revenue/${ticker.toLowerCase()}`,
    },
  }
}

export default async function ServiceRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const pageUrl = `${SITE_URL}/service-revenue/${ticker.toLowerCase()}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Service Revenue', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Service Revenue - Recurring Service Income ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) service revenue, maintenance contracts, and recurring income.`,
    url: pageUrl,
    keywords: [
      `${symbol} service revenue`,
      `${symbol} recurring revenue`,
      `${companyName} maintenance contracts`,
    ],
  })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s service revenue?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s service revenue includes maintenance contracts, support services, and other recurring service income.`
        }
      },
      {
        '@type': 'Question',
        name: `How much of ${symbol}'s revenue is from services?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Service revenue for ${companyName} provides predictable recurring income with typically higher profit margins.`
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
          <h1 className="text-4xl font-bold mb-4">{symbol} Service Revenue</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Recurring service income and maintenance contracts for {companyName}
          </p>

          <div className="prose prose-invert max-w-none">
            <p>
              Analyze {companyName} ({symbol}) service revenue from maintenance contracts, support services, and subscriptions.
              Service revenue provides predictable recurring income and enhances customer relationships.
            </p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </div>
    </>
  )
}
