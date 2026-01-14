import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import GrowthContent from './GrowthContent'

interface Props {
  params: Promise<{ ticker: string }>
}

// Allow dynamic rendering
export const revalidate = 3600
export const maxDuration = 60

// Fetch growth data
async function getGrowthData(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const [incomeStatementsRes, metricsRes, fundamentalsRes] = await Promise.all([
      fetch(`${baseUrl}/api/v1/financials/income-statements?ticker=${ticker}&period=annual&limit=5`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${baseUrl}/api/v1/financial-metrics?ticker=${ticker}&period=annual&limit=5`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${baseUrl}/api/fundamentals?ticker=${ticker}`, {
        next: { revalidate: 3600 }
      }),
    ])

    const incomeStatements = incomeStatementsRes.ok ? await incomeStatementsRes.json() : { income_statements: [] }
    const metrics = metricsRes.ok ? await metricsRes.json() : { financial_metrics: [] }
    const fundamentals = fundamentalsRes.ok ? await fundamentalsRes.json() : null

    return {
      incomeStatements: incomeStatements.income_statements || [],
      metrics: metrics.financial_metrics || [],
      fundamentals,
    }
  } catch (error) {
    console.error('Error fetching growth data:', error)
    return null
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getGrowthData(symbol)
  const companyName = data?.fundamentals?.company?.name || symbol

  const title = `${symbol} Growth Rates - Revenue & Earnings Growth ${currentYear}`
  const description = `Analyze ${symbol} growth rates: revenue growth, earnings growth, and EPS growth for ${companyName}. See ${currentYear} growth metrics and historical trends.`

  return {
    title,
    description,
    keywords: [
      `${symbol} growth`,
      `${symbol} revenue growth`,
      `${symbol} earnings growth`,
      `${symbol} EPS growth`,
      `${companyName} growth`,
      `${symbol} growth rate`,
      `${symbol} sales growth`,
      `${symbol} profit growth`,
      `${symbol} growth analysis`,
      `${symbol} growth metrics`,
    ],
    openGraph: {
      title: `${symbol} Growth Rates - Revenue & Earnings Growth`,
      description,
      type: 'article',
      url: `${SITE_URL}/growth/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/growth/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Growth Rates`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Growth Rates`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/growth/${ticker.toLowerCase()}`,
    },
  }
}

export default async function GrowthPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getGrowthData(symbol)

  if (!data || data.incomeStatements.length === 0) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const pageUrl = `${SITE_URL}/growth/${ticker.toLowerCase()}`

  // Key metrics
  const latestMetrics = data.metrics[0]
  const revenueGrowth = latestMetrics?.revenue_growth
  const earningsGrowth = latestMetrics?.earnings_growth

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Growth Rates', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Growth Rates - Revenue & Earnings Growth ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) growth rates including revenue, earnings, and EPS growth metrics.`,
    url: pageUrl,
    keywords: [
      `${symbol} growth`,
      `${symbol} revenue growth`,
      `${symbol} earnings growth`,
      `${companyName} growth rates`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s revenue growth rate?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: revenueGrowth
            ? `${companyName}'s revenue growth rate is ${(revenueGrowth * 100).toFixed(1)}% year-over-year.`
            : `Revenue growth data is available for ${companyName}.`
        }
      },
      {
        '@type': 'Question',
        name: `What is ${symbol}'s earnings growth rate?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: earningsGrowth
            ? `${companyName}'s earnings growth rate is ${(earningsGrowth * 100).toFixed(1)}% year-over-year.`
            : `Earnings growth data is available for ${companyName}.`
        }
      },
      {
        '@type': 'Question',
        name: `How fast is ${symbol} growing?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: revenueGrowth && revenueGrowth > 0
            ? `${companyName} is growing with ${(revenueGrowth * 100).toFixed(1)}% revenue growth year-over-year.`
            : `${companyName} growth metrics are available for detailed analysis.`
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

      <GrowthContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        incomeStatements={data.incomeStatements}
        metrics={data.metrics}
        fundamentals={data.fundamentals}
      />
    </>
  )
}
