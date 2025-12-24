import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SITE_URL, getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'
import FoundryRevenueContent from './FoundryRevenueContent'

interface Props {
  params: Promise<{ ticker: string }>
}

// Allow dynamic rendering
export const dynamic = 'force-dynamic'

// Fetch stock data
async function getStockData(ticker: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const [fundamentalsRes, metricsRes, incomeStatementsRes] = await Promise.all([
      fetch(`${baseUrl}/api/fundamentals?ticker=${ticker}`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${baseUrl}/api/v1/financial-metrics?ticker=${ticker}&period=annual&limit=5`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${baseUrl}/api/v1/financials/income-statements?ticker=${ticker}&period=annual&limit=5`, {
        next: { revalidate: 3600 }
      }),
    ])

    const fundamentals = fundamentalsRes.ok ? await fundamentalsRes.json() : null
    const metrics = metricsRes.ok ? await metricsRes.json() : { financial_metrics: [] }
    const incomeStatements = incomeStatementsRes.ok ? await incomeStatementsRes.json() : { income_statements: [] }

    return {
      fundamentals,
      metrics: metrics.financial_metrics || [],
      incomeStatements: incomeStatements.income_statements || [],
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

  const title = `${symbol} Foundry Revenue - Semiconductor Foundry Sales ${currentYear}`
  const description = `Analyze ${symbol} foundry revenue and chip manufacturing sales for ${companyName}. Track ${currentYear} foundry market share and semiconductor revenue growth.`

  return {
    title,
    description,
    keywords: [
      `${symbol} foundry revenue`,
      `${symbol} foundry sales`,
      `${symbol} chip manufacturing revenue`,
      `${companyName} foundry revenue`,
      `${symbol} foundry market share`,
      `${symbol} semiconductor revenue`,
      `${symbol} fab revenue`,
      `${symbol} manufacturing revenue`,
      `${symbol} foundry business`,
      `${symbol} chip production revenue`,
    ],
    openGraph: {
      title: `${symbol} Foundry Revenue - Semiconductor Foundry Sales`,
      description,
      type: 'article',
      url: `${SITE_URL}/foundry-revenue/${ticker.toLowerCase()}`,
      images: [
        {
          url: `${SITE_URL}/api/og/foundry-revenue/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Foundry Revenue`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Foundry Revenue`,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/foundry-revenue/${ticker.toLowerCase()}`,
    },
  }
}

export default async function FoundryRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const data = await getStockData(symbol)

  if (!data || !data.fundamentals) {
    notFound()
  }

  const companyName = data.fundamentals?.company?.name || symbol
  const sector = data.fundamentals?.company?.sector || 'Technology'
  const pageUrl = `${SITE_URL}/foundry-revenue/${ticker.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Foundry Revenue', url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${symbol} Foundry Revenue - Semiconductor Foundry Sales ${currentYear}`,
    description: `Comprehensive analysis of ${companyName} (${symbol}) foundry revenue and chip manufacturing business performance.`,
    url: pageUrl,
    keywords: [
      `${symbol} foundry revenue`,
      `${symbol} foundry sales`,
      `${symbol} chip manufacturing revenue`,
      `${companyName} foundry revenue`,
    ],
  })

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is ${symbol}'s foundry revenue?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Foundry revenue represents income ${companyName} generates from semiconductor manufacturing services for other companies. This business model separates chip design from manufacturing, serving fabless semiconductor companies.`
        }
      },
      {
        '@type': 'Question',
        name: `Is ${symbol} foundry revenue growing?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${companyName}'s foundry revenue growth indicates market share gains and industry demand trends. Strong foundry revenue reflects competitive technology, customer diversification, and fab capacity expansion.`
        }
      },
      {
        '@type': 'Question',
        name: `What is ${symbol}'s foundry market share?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Monitor ${companyName}'s foundry market share to understand competitive positioning against other semiconductor manufacturers. Market share trends reflect technology leadership and customer preference in the foundry industry.`
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

      <FoundryRevenueContent
        ticker={symbol}
        companyName={companyName}
        sector={sector}
        fundamentals={data.fundamentals}
        metrics={data.metrics}
        incomeStatements={data.incomeStatements}
      />
    </>
  )
}
