import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema , getTableSchema } from '@/lib/seo'
import { RelatedLinks } from '@/components/seo/RelatedLinks'

interface Props {
  params: Promise<{ ticker: string }>
}

export const dynamic = 'force-dynamic'

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
    console.error('Error fetching aftermarket revenue data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Aftermarket Revenue - Parts & Support ${currentYear}`
  const description = `Analyze ${symbol} aftermarket revenue streams for ${companyName}. Track parts, maintenance, and support revenue trends and recurring income.`

  return {
    title,
    description,
    keywords: [
      `${symbol} aftermarket revenue`,
      `${symbol} parts revenue`,
      `${symbol} support revenue`,
      `${companyName} aftermarket`,
      `${symbol} recurring revenue`,
      `${symbol} maintenance revenue`,
      `${symbol} service parts`,
    ],
    openGraph: {
      title: `${symbol} Aftermarket Revenue - Parts & Support`,
      description,
      type: 'article',
      url: `${SITE_URL}/aftermarket-revenue/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Aftermarket Revenue`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/aftermarket-revenue/${ticker.toLowerCase()}`,
    },
  }
}

export default async function AftermarketRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const pageUrl = `${SITE_URL}/aftermarket-revenue/${ticker.toLowerCase()}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Aftermarket Revenue', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Aftermarket Revenue - Parts & Support ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) aftermarket revenue, parts sales, and support services.`,
    url: pageUrl,
    keywords: [
      `${symbol} aftermarket revenue`,
      `${symbol} parts revenue`,
      `${companyName} support revenue`,
    ],
  })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s aftermarket revenue?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s aftermarket revenue includes parts, maintenance, and support services for installed equipment.`
        }
      },
      {
        '@type': 'Question',
        name: `How important is aftermarket revenue for ${symbol}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Aftermarket revenue for ${companyName} provides recurring income and typically has higher margins than new equipment sales.`
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
          <h1 className="text-4xl font-bold mb-4">{symbol} Aftermarket Revenue</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Parts, maintenance, and support revenue for {companyName}
          </p>

          <div className="prose prose-invert max-w-none">
            <p>
              Track {companyName} ({symbol}) aftermarket revenue from parts, maintenance, and support services.
              Aftermarket revenue provides recurring income and typically carries higher profit margins.
            </p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </div>
    </>
  )
}
