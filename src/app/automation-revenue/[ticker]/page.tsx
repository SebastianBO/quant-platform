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
    console.error('Error fetching automation revenue data:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Automation Revenue - Robotics & AI Revenue ${currentYear}`
  const description = `Analyze ${symbol} automation revenue streams for ${companyName}. Track robotics, AI, and industrial automation revenue growth and market share.`

  return {
    title,
    description,
    keywords: [
      `${symbol} automation revenue`,
      `${symbol} robotics revenue`,
      `${symbol} AI revenue`,
      `${companyName} automation`,
      `${symbol} industrial automation`,
      `${symbol} automation growth`,
      `${symbol} robotics market`,
    ],
    openGraph: {
      title: `${symbol} Automation Revenue - Robotics & AI Revenue`,
      description,
      type: 'article',
      url: `${SITE_URL}/automation-revenue/${ticker.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Automation Revenue`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/automation-revenue/${ticker.toLowerCase()}`,
    },
  }
}

export default async function AutomationRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const pageUrl = `${SITE_URL}/automation-revenue/${ticker.toLowerCase()}`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Automation Revenue', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: `${symbol} Automation Revenue - Robotics & AI Revenue ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) automation revenue from robotics, AI, and industrial automation.`,
    url: pageUrl,
    keywords: [
      `${symbol} automation revenue`,
      `${symbol} robotics revenue`,
      `${companyName} AI revenue`,
    ],
  })

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s automation revenue?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s automation revenue includes robotics, AI systems, and industrial automation solutions.`
        }
      },
      {
        '@type': 'Question',
        name: `How fast is ${symbol}'s automation revenue growing?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Automation revenue growth for ${companyName} reflects adoption of robotics and AI technologies in manufacturing and industry.`
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
          <h1 className="text-4xl font-bold mb-4">{symbol} Automation Revenue</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Robotics, AI, and industrial automation revenue for {companyName}
          </p>

          <div className="prose prose-invert max-w-none">
            <p>
              Track {companyName} ({symbol}) automation revenue from robotics, AI systems, and industrial automation.
              Automation represents a high-growth segment driven by Industry 4.0 and digital transformation trends.
            </p>
          </div>

          <RelatedLinks ticker={symbol} currentPage="stock" companyName={companyName} />
        </div>
      </div>
    </>
  )
}
