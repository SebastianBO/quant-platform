import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
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
    console.error('Error fetching backlog growth data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Backlog Growth - Order Backlog Analysis ${currentYear}`
  const description = `Analyze ${symbol} backlog growth trends and order backlog metrics for ${companyName}. Track backlog trends, growth rates, and forward revenue indicators.`

  return {
    title,
    description,
    keywords: [
      `${symbol} backlog`,
      `${symbol} backlog growth`,
      `${symbol} order backlog`,
      `${companyName} backlog`,
      `${symbol} backlog analysis`,
      `${symbol} backlog trends`,
      `${symbol} deferred revenue`,
      `${symbol} future orders`,
    ],
    openGraph: {
      title: `${symbol} Backlog Growth - Order Backlog Analysis`,
      description,
      type: 'article',
      url: `${SITE_URL}/backlog-growth/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Backlog Growth`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/backlog-growth/${ticker.toLowerCase()}`,
    },
  }
}

export default async function BacklogGrowthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const pageUrl = `${SITE_URL}/backlog-growth/${ticker.toLowerCase()}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Backlog Growth', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Backlog Growth - Order Backlog Analysis ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) backlog growth, order trends, and forward revenue indicators.`,
    url: pageUrl,
    keywords: [
      `${symbol} backlog growth`,
      `${symbol} order backlog`,
      `${companyName} backlog trends`,
    ],
  })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s current order backlog?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s order backlog represents future contracted revenue that has not yet been recognized.`
        }
      },
      {
        '@type': 'Question',
        name: `How fast is ${symbol}'s backlog growing?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Backlog growth for ${companyName} indicates strong demand and future revenue visibility.`
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
          <h1 className="text-4xl font-bold mb-4">{symbol} Backlog Growth</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Order backlog analysis and growth trends for {companyName}
          </p>

          <div className="prose prose-invert max-w-none">
            <p>
              Track {companyName} ({symbol}) order backlog growth and deferred revenue trends.
              Backlog growth is a leading indicator of future revenue performance.
            </p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </div>
    </>
  )
}
