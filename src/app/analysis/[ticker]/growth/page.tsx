import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  SITE_URL,
} from '@/lib/seo'
import GrowthAnalysisContent from './GrowthAnalysisContent'


interface Props {
  params: Promise<{ ticker: string }>
}

// Pre-render top 500+ stocks at build time

// Allow dynamic rendering for stocks not in the pre-rendered list
export const revalidate = 3600

// Fetch all necessary data
async function getGrowthData(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const [
      incomeStatementsRes,
      metricsRes,
      fundamentalsRes,
      segmentedRevenuesRes,
    ] = await Promise.all([
      // Annual income statements (last 5 years)
      fetch(`${baseUrl}/api/v1/financials/income-statements?ticker=${ticker}&period=annual&limit=5`, {
        next: { revalidate: 3600 }
      }),
      // Annual metrics (last 5 years)
      fetch(`${baseUrl}/api/v1/financial-metrics?ticker=${ticker}&period=annual&limit=5`, {
        next: { revalidate: 3600 }
      }),
      // Fundamentals for company info and analyst estimates
      fetch(`${baseUrl}/api/fundamentals?ticker=${ticker}`, {
        next: { revalidate: 3600 }
      }),
      // Segmented revenues for breakdown
      fetch(`${baseUrl}/api/v1/financials/segmented-revenues?ticker=${ticker}&period=annual&limit=1`, {
        next: { revalidate: 3600 }
      }),
    ])

    const incomeStatements = incomeStatementsRes.ok ? await incomeStatementsRes.json() : { income_statements: [] }
    const metrics = metricsRes.ok ? await metricsRes.json() : { financial_metrics: [] }
    const fundamentals = fundamentalsRes.ok ? await fundamentalsRes.json() : null
    const segmentedRevenues = segmentedRevenuesRes.ok ? await segmentedRevenuesRes.json() : { segmented_revenues: [] }

    return {
      incomeStatements: incomeStatements.income_statements || [],
      metrics: metrics.financial_metrics || [],
      fundamentals,
      segmentedRevenues: segmentedRevenues.segmented_revenues || [],
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

  const title = `${symbol} Revenue & Earnings Growth Analysis ${currentYear} - Is ${companyName} Growing?`
  const description = `${symbol} growth analysis: Revenue growth rate, earnings trends, profit margins, and analyst forecasts for ${companyName}. Detailed ${currentYear} growth metrics and future projections.`

  return {
    title,
    description,
    keywords: [
      `${symbol} revenue growth`,
      `${symbol} earnings growth`,
      `is ${companyName} growing`,
      `${symbol} growth rate`,
      `${symbol} revenue`,
      `${symbol} sales growth`,
      `${companyName} growth analysis`,
      `${symbol} profit margin`,
      `${symbol} earnings trend`,
      `${symbol} analyst forecast`,
      `${symbol} future growth`,
      `${symbol} revenue forecast ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Growth Analysis - Revenue & Earnings Trends`,
      description,
      type: 'article',
      url: `${SITE_URL}/analysis/${ticker.toLowerCase()}/growth`,
      images: [
        {
          url: `${SITE_URL}/api/og/analysis/${ticker.toLowerCase()}/growth`,
          width: 1200,
          height: 630,
          alt: `${symbol} Growth Analysis`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Growth Analysis`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/analysis/${ticker.toLowerCase()}/growth`,
    },
  }
}

export default async function GrowthAnalysisPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getGrowthData(symbol)

  if (!data || data.incomeStatements.length === 0) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const industry = data.fundamentals?.company?.industry || 'Software'
  const pageUrl = `${SITE_URL}/analysis/${ticker.toLowerCase()}/growth`

  // Calculate key metrics for description
  const latestRevenue = data.incomeStatements[0]?.revenue
  const latestMetrics = data.metrics[0]
  const revenueGrowth = latestMetrics?.revenue_growth
  const earningsGrowth = latestMetrics?.earnings_growth

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Analysis', url: `${SITE_URL}/analysis` },
    { name: `${symbol} Analysis`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Growth Analysis', url: pageUrl },
  ])

  // Article Schema for SEO
  const articleSchema = getArticleSchema({
    headline: `Is ${companyName} (${symbol}) Growing? ${currentYear} Revenue & Earnings Analysis`,
    description: `Comprehensive growth analysis of ${companyName} (${symbol}): revenue trends, earnings growth, profit margins, and future projections.`,
    url: pageUrl,
    keywords: [
      `${symbol} revenue growth`,
      `${symbol} earnings growth`,
      `${companyName} growth analysis`,
      `${symbol} growth rate`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is ${symbol} growing?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: revenueGrowth && revenueGrowth > 0
            ? `Yes, ${companyName} is currently growing with a revenue growth rate of ${(revenueGrowth * 100).toFixed(1)}% year-over-year.`
            : `${companyName} revenue growth has been ${revenueGrowth ? (revenueGrowth * 100).toFixed(1) + '%' : 'varied'} year-over-year.`
        }
      },
      {
        '@type': 'Question',
        name: `What is ${symbol}'s revenue growth rate?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: revenueGrowth
            ? `${companyName}'s revenue growth rate is ${(revenueGrowth * 100).toFixed(1)}% year-over-year.`
            : `Historical revenue data is available for ${companyName} to analyze growth trends.`
        }
      },
      {
        '@type': 'Question',
        name: `How fast is ${symbol} earnings growing?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: earningsGrowth
            ? `${companyName}'s earnings are growing at ${(earningsGrowth * 100).toFixed(1)}% year-over-year.`
            : `Earnings growth data is available for ${companyName} analysis.`
        }
      },
      {
        '@type': 'Question',
        name: `What is ${symbol}'s profit margin?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: latestMetrics?.net_margin
            ? `${companyName} currently has a net profit margin of ${(latestMetrics.net_margin * 100).toFixed(1)}%.`
            : `Profit margin data is available for ${companyName}.`
        }
      },
    ],
  }

  // Financial Data Schema
  const financialDataSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${companyName} (${symbol}) Financial Growth Data`,
    description: `Historical revenue, earnings, and growth metrics for ${companyName}`,
    url: pageUrl,
    keywords: `${symbol}, revenue, earnings, growth, financial data`,
    creator: {
      '@type': 'Organization',
      name: 'Lician',
      url: SITE_URL,
    },
    temporal: `${data.incomeStatements[data.incomeStatements.length - 1]?.report_period}/${data.incomeStatements[0]?.report_period}`,
  }

  const schemas = [breadcrumbSchema, articleSchema, faqSchema, financialDataSchema]

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />

      <GrowthAnalysisContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        industry={industry}
        incomeStatements={data.incomeStatements}
        metrics={data.metrics}
        fundamentals={data.fundamentals}
        segmentedRevenues={data.segmentedRevenues}
      />
    </>
  )
}
