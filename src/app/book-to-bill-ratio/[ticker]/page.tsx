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
    console.error('Error fetching book-to-bill data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Book-to-Bill Ratio - Orders vs Revenue ${currentYear}`
  const description = `Analyze ${symbol} book-to-bill ratio for ${companyName}. Track the relationship between new orders and revenue to assess business momentum and demand trends.`

  return {
    title,
    description,
    keywords: [
      `${symbol} book to bill`,
      `${symbol} book-to-bill ratio`,
      `${symbol} orders vs revenue`,
      `${companyName} book to bill`,
      `${symbol} bookings ratio`,
      `${symbol} order intake`,
      `${symbol} demand indicator`,
    ],
    openGraph: {
      title: `${symbol} Book-to-Bill Ratio - Orders vs Revenue`,
      description,
      type: 'article',
      url: `${SITE_URL}/book-to-bill-ratio/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Book-to-Bill Ratio`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/book-to-bill-ratio/${ticker.toLowerCase()}`,
    },
  }
}

export default async function BookToBillPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const pageUrl = `${SITE_URL}/book-to-bill-ratio/${ticker.toLowerCase()}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Book-to-Bill Ratio', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Book-to-Bill Ratio - Orders vs Revenue ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) book-to-bill ratio and order momentum.`,
    url: pageUrl,
    keywords: [
      `${symbol} book to bill`,
      `${symbol} book-to-bill ratio`,
      `${companyName} orders`,
    ],
  })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s book-to-bill ratio?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s book-to-bill ratio measures new orders received compared to revenue recognized, indicating business momentum.`
        }
      },
      {
        '@type': 'Question',
        name: `What does a book-to-bill ratio above 1 mean for ${symbol}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `A book-to-bill ratio above 1.0 for ${companyName} indicates new orders are growing faster than revenue, suggesting strong demand.`
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
          <h1 className="text-4xl font-bold mb-4">{symbol} Book-to-Bill Ratio</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Orders vs revenue analysis for {companyName}
          </p>

          <div className="prose prose-invert max-w-none">
            <p>
              Analyze {companyName} ({symbol}) book-to-bill ratio to understand business momentum.
              A ratio above 1.0 indicates orders are growing faster than revenue.
            </p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </div>
    </>
  )
}
