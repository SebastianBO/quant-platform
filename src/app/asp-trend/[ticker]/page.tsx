import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import AspTrendContent from './AspTrendContent'

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

  const title = `${symbol} ASP Trends - Average Selling Price Trends ${currentYear}`
  const description = `Analyze ${symbol} ASP trends and semiconductor pricing for ${companyName}. Track ${currentYear} average selling price changes and chip pricing power.`

  return {
    title,
    description,
    keywords: [
      `${symbol} ASP`,
      `${symbol} average selling price`,
      `${symbol} pricing trends`,
      `${companyName} ASP`,
      `${symbol} chip pricing`,
      `${symbol} pricing power`,
      `${symbol} price trends`,
      `${symbol} semiconductor pricing`,
      `${symbol} ASP trends`,
      `${symbol} unit pricing`,
    ],
    openGraph: {
      title: `${symbol} ASP Trends - Average Selling Price Trends`,
      description,
      type: 'article',
      url: `${SITE_URL}/asp-trend/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/asp-trend/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} ASP Trends`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} ASP Trends`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/asp-trend/${ticker.toLowerCase()}`,
    },
  }
}

export default async function AspTrendPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const pageUrl = `${SITE_URL}/asp-trend/${ticker.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'ASP Trends', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} ASP Trends - Average Selling Price Trends ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) average selling price trends and semiconductor pricing power.`,
    url: pageUrl,
    keywords: [
      `${symbol} ASP`,
      `${symbol} average selling price`,
      `${symbol} pricing trends`,
      `${companyName} ASP`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s ASP trend?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `ASP (Average Selling Price) represents the average price ${companyName} receives per semiconductor unit sold. ASP trends indicate pricing power, product mix shifts, and competitive dynamics in the chip market.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${symbol} ASP increasing or decreasing?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `ASP trends for ${companyName} reflect market conditions and product strategy. Rising ASPs typically indicate strong demand, product upgrades, or favorable mix, while declining ASPs may suggest commoditization or competition.`
        }
      },
      {
        '@type': 'Question',
        name: `How does ASP affect ${symbol} revenue?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `ASP directly impacts ${companyName}'s revenue as total sales equal unit volume multiplied by ASP. ASP expansion can drive revenue growth even with flat unit shipments, improving margins and profitability.`
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

      <AspTrendContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={data.fundamentals}
        metrics={data.metrics}
      />
    </>
  )
}
