import { Metadata } from 'next'
import { Suspense } from 'react'
import DividendAnalysisContent from '@/components/analysis/DividendAnalysisContent'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFinancialProductSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'


interface Props {
  params: Promise<{ ticker: string }>
}

// Pre-render top 500+ stocks at build time

// Allow dynamic rendering for stocks not in the pre-rendered list
export const revalidate = 3600
export const maxDuration = 60

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  // Fetch stock data for rich metadata
  let companyName = symbol
  let dividendYield: number | undefined
  let description = `${symbol} dividend analysis`

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${symbol}`,
      { next: { revalidate: 3600 } }
    )
    if (response.ok) {
      const data = await response.json()
      companyName = data.companyFacts?.name || symbol
      dividendYield = data.snapshot?.dividendYield

      const yieldText = dividendYield ? `Current dividend yield: ${(dividendYield * 100).toFixed(2)}%.` : ''
      description = `${companyName} (${symbol}) dividend analysis ${currentYear}: ${yieldText} Dividend history, payout ratio, growth rate, ex-dividend dates, and reliability assessment.`
    }
  } catch {
    // Use fallback metadata if fetch fails
  }

  const title = `${symbol} Dividend Analysis ${currentYear} - ${companyName} Dividend History & Yield`
  const fullDescription = description.slice(0, 160)

  return {
    title,
    description: fullDescription,
    keywords: [
      `${symbol} dividend`,
      `${symbol} dividend yield`,
      `${symbol} dividend history`,
      `does ${companyName.toLowerCase()} pay dividends`,
      `${symbol} ex dividend date`,
      `${symbol} dividend payout`,
      `${symbol} dividend growth`,
      `${symbol} dividend sustainability`,
      `${companyName} dividend ${currentYear}`,
      `${symbol} dividend schedule`,
      `${symbol} dividend payment`,
      `${symbol} dividend per share`,
      `${symbol} payout ratio`,
      `${symbol} dividend forecast`,
    ],
    openGraph: {
      title: `${symbol} Dividend Analysis | ${companyName}`,
      description: fullDescription,
      type: 'article',
      url: `${SITE_URL}/analysis/${ticker.toLowerCase()}/dividend`,
      images: [
        {
          url: `${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Dividend Analysis`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Dividend Analysis`,
      description: fullDescription,
      images: [`${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `${SITE_URL}/analysis/${ticker.toLowerCase()}/dividend`,
    },
  }
}

// Fetch stock data for structured data and dividend info
async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

// Fetch fundamentals for additional dividend data
async function getFundamentalsData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/fundamentals?ticker=${ticker}`,
      { next: { revalidate: 3600 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
    </div>
  )
}

// Generate dividend-specific FAQs
function getDividendFAQs(ticker: string, companyName: string, dividendYield?: number, dividendShare?: number) {
  const currentYear = new Date().getFullYear()

  return [
    {
      question: `Does ${ticker} pay dividends?`,
      answer: dividendYield && dividendYield > 0
        ? `Yes, ${companyName} (${ticker}) pays dividends to shareholders. The current dividend yield is ${(dividendYield * 100).toFixed(2)}%${dividendShare ? ` with an annual dividend of $${dividendShare.toFixed(2)} per share` : ''}.`
        : `${companyName} (${ticker}) does not currently pay dividends. Many growth-oriented companies choose to reinvest profits into business expansion rather than distribute them as dividends.`,
    },
    {
      question: `What is ${ticker}'s dividend yield?`,
      answer: dividendYield && dividendYield > 0
        ? `${ticker}'s current dividend yield is ${(dividendYield * 100).toFixed(2)}%. This represents the annual dividend income as a percentage of the stock price. A higher yield may indicate better income potential, though investors should also consider dividend sustainability.`
        : `${ticker} does not currently pay dividends, so the dividend yield is 0%. Check our analysis for information on the company's capital allocation strategy and growth initiatives.`,
    },
    {
      question: `When is ${ticker}'s ex-dividend date?`,
      answer: `The ex-dividend date is when a stock begins trading without the value of its next dividend payment. Visit our dividend analysis page for ${ticker}'s upcoming ex-dividend dates and payment schedule.`,
    },
    {
      question: `Is ${ticker}'s dividend sustainable?`,
      answer: `Dividend sustainability depends on the payout ratio, free cash flow coverage, earnings stability, and debt levels. Our analysis evaluates ${ticker}'s payout ratio and financial health to assess dividend reliability and future growth potential.`,
    },
    {
      question: `What is ${ticker}'s dividend history?`,
      answer: `${ticker}'s dividend history shows the company's track record of dividend payments over time. Our analysis includes ${ticker}'s dividend growth rate over the past 5-10 years, payment consistency, and any dividend cuts or suspensions.`,
    },
    {
      question: `How often does ${ticker} pay dividends?`,
      answer: `Most U.S. companies pay dividends quarterly. Visit our dividend analysis page for ${ticker}'s payment frequency and upcoming payment dates. Some companies may pay monthly, semi-annually, or annually.`,
    },
    {
      question: `What is ${ticker}'s payout ratio?`,
      answer: `The payout ratio measures what percentage of earnings ${ticker} distributes as dividends. A sustainable payout ratio is typically between 30-60% for most companies, leaving room for dividend growth and business reinvestment.`,
    },
    {
      question: `Has ${ticker} increased its dividend?`,
      answer: `Our dividend analysis tracks ${ticker}'s dividend growth rate over multiple years. Consistent dividend increases can indicate strong financial health and management confidence in future earnings.`,
    },
    {
      question: `How does ${ticker}'s dividend compare to competitors?`,
      answer: `We compare ${ticker}'s dividend yield, payout ratio, and growth rate against industry peers to help you understand relative dividend attractiveness. Higher yields aren't always better - sustainability and growth matter too.`,
    },
    {
      question: `Should I buy ${ticker} for dividends in ${currentYear}?`,
      answer: `Whether ${ticker} is a good dividend investment depends on your income needs, risk tolerance, and investment timeline. Consider the dividend yield, sustainability, growth potential, and how it fits your portfolio strategy.`,
    },
  ]
}

export default async function DividendAnalysisPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  // Fetch data for structured schema and content
  const [stockData, fundamentalsData] = await Promise.all([
    getStockData(symbol),
    getFundamentalsData(symbol),
  ])

  const companyName = stockData?.companyFacts?.name || symbol
  const dividendYield = stockData?.snapshot?.dividendYield
  const dividendShare = stockData?.snapshot?.dividendShare
  const pageUrl = `${SITE_URL}/analysis/${ticker.toLowerCase()}/dividend`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: `${symbol} Stock`, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: 'Dividend Analysis', url: pageUrl },
  ])

  // Article Schema for the dividend analysis
  const articleSchema = getArticleSchema({
    headline: `${symbol} Dividend Analysis - ${companyName} Dividend History & Yield`,
    description: `Comprehensive dividend analysis for ${companyName} (${symbol}) including dividend yield, payout ratio, growth history, and sustainability assessment.`,
    url: pageUrl,
    keywords: [
      `${symbol} dividend`,
      `${symbol} dividend yield`,
      `${symbol} dividend history`,
      `${companyName} dividend`,
      `${symbol} payout ratio`,
    ],
  })

  // Financial Product Schema
  const financialProductSchema = getFinancialProductSchema({
    ticker: symbol,
    name: companyName,
    description: `${companyName} (${symbol}) dividend investment analysis and income potential`,
    url: pageUrl,
    price: stockData?.snapshot?.price,
    currency: 'USD',
    exchange: stockData?.snapshot?.exchange || 'NYSE',
  })

  // FAQ Schema for dividend questions
  const dividendFAQs = getDividendFAQs(symbol, companyName, dividendYield, dividendShare)
  const faqSchema = getFAQSchema(dividendFAQs)

  // Combine all schemas
  const schemas = [
    breadcrumbSchema,
    articleSchema,
    financialProductSchema,
    faqSchema,
  ]

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />
      <Suspense fallback={<LoadingState />}>
        <DividendAnalysisContent
          ticker={symbol}
          stockData={stockData}
          fundamentalsData={fundamentalsData}
        />
      </Suspense>
    </>
  )
}
