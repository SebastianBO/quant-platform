/**
 * Reusable Structured Data Components for SEO
 *
 * These components render JSON-LD structured data for Google rich snippets.
 * Use them to add FAQ, Breadcrumb, Article, HowTo, and other schema.org markup to pages.
 *
 * FEATURED SNIPPET OPTIMIZATION:
 * - FAQs should have the answer in the FIRST sentence
 * - Keep answers between 40-60 words for optimal snippet display
 * - Use question format that matches user search intent
 */

import Script from 'next/script'

interface StructuredDataProps {
  data: object | object[]
}

/**
 * Base component that renders JSON-LD structured data
 * Can accept single schema or array of schemas
 */
export function StructuredData({ data }: StructuredDataProps) {
  const schemaData = Array.isArray(data) ? data : [data]

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData),
      }}
      strategy="beforeInteractive"
    />
  )
}

interface FAQ {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs: FAQ[]
}

/**
 * FAQ Schema Component
 * Generates FAQPage structured data for rich snippets in search results
 *
 * @example
 * <FAQSchema faqs={[
 *   { question: "How much money do I need?", answer: "You can start with as little as $1..." }
 * ]} />
 */
export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="beforeInteractive"
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb Schema Component
 * Generates BreadcrumbList structured data for breadcrumb navigation in search results
 *
 * @example
 * <BreadcrumbSchema items={[
 *   { name: "Home", url: "https://example.com" },
 *   { name: "Learn", url: "https://example.com/learn" },
 *   { name: "How to Invest", url: "https://example.com/learn/how-to-invest" }
 * ]} />
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="beforeInteractive"
    />
  )
}

interface ArticleSchemaProps {
  headline: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  image?: string
  keywords?: string[]
  authorName?: string
}

/**
 * Article Schema Component
 * Generates Article structured data for blog posts and educational content
 *
 * @example
 * <ArticleSchema
 *   headline="How to Invest in Stocks"
 *   description="Complete guide to stock investing"
 *   url="https://example.com/learn/how-to-invest"
 *   keywords={["investing", "stocks", "beginner guide"]}
 * />
 */
export function ArticleSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  image,
  keywords,
  authorName = 'Lician',
}: ArticleSchemaProps) {
  const now = new Date().toISOString()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    image: image || 'https://lician.com/og-image.png',
    datePublished: datePublished || now,
    dateModified: dateModified || now,
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lician',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lician.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(keywords && { keywords: keywords.join(', ') }),
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="beforeInteractive"
    />
  )
}

interface HowToStep {
  name: string
  text: string
}

interface HowToSchemaProps {
  name: string
  description: string
  steps: HowToStep[]
  totalTime?: string
  estimatedCost?: {
    value: number
    currency: string
  }
}

/**
 * HowTo Schema Component
 * Generates HowTo structured data for step-by-step guides
 *
 * @example
 * <HowToSchema
 *   name="How to Analyze Stocks"
 *   description="Step-by-step guide to stock analysis"
 *   steps={[
 *     { name: "Check P/E Ratio", text: "Compare the P/E ratio to industry average..." },
 *     { name: "Analyze Revenue Growth", text: "Look for consistent revenue growth..." }
 *   ]}
 * />
 */
export function HowToSchema({
  name,
  description,
  steps,
  totalTime,
  estimatedCost,
}: HowToSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(totalTime && { totalTime }),
    ...(estimatedCost && {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: estimatedCost.currency,
        value: estimatedCost.value,
      },
    }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }

  return (
    <Script
      id="howto-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="beforeInteractive"
    />
  )
}

/**
 * Combined Schema Component
 * Allows multiple schemas to be combined in a single script tag
 * This is often more efficient than multiple separate script tags
 *
 * @example
 * <CombinedSchema schemas={[
 *   breadcrumbSchema,
 *   articleSchema,
 *   faqSchema
 * ]} />
 */
interface CombinedSchemaProps {
  schemas: object[]
}

export function CombinedSchema({ schemas }: CombinedSchemaProps) {
  return (
    <Script
      id="combined-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas),
      }}
      strategy="beforeInteractive"
    />
  )
}

// ============================================================================
// FEATURED SNIPPET OPTIMIZED FAQ GENERATORS
// ============================================================================

/**
 * Stock metrics for generating FAQs
 */
export interface StockMetricsForFAQ {
  price?: number
  priceTarget?: number
  peRatio?: number
  marketCap?: number
  revenueGrowth?: number
  profitMargin?: number
  dividendYield?: number
  analystRating?: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
  analystCount?: number
}

/**
 * Generate snippet-optimized FAQs for "Is X a good stock to buy?" queries
 *
 * KEY OPTIMIZATION: Answer appears in the FIRST sentence
 *
 * @example
 * const faqs = generateBuyStockFAQs('AAPL', 'Apple Inc.', {
 *   price: 189.50,
 *   priceTarget: 210,
 *   peRatio: 28.5,
 *   analystRating: 'Buy',
 * })
 */
export function generateBuyStockFAQs(
  ticker: string,
  companyName: string,
  metrics: StockMetricsForFAQ = {}
): FAQ[] {
  const currentYear = new Date().getFullYear()
  const {
    price,
    priceTarget,
    peRatio,
    marketCap,
    revenueGrowth,
    profitMargin,
    dividendYield,
    analystRating,
    analystCount,
  } = metrics

  // Generate verdict based on metrics
  const getVerdict = (): string => {
    if (analystRating === 'Strong Buy' || analystRating === 'Buy') return 'rated as a BUY'
    if (analystRating === 'Hold') return 'rated as a HOLD'
    if (analystRating === 'Sell' || analystRating === 'Strong Sell') return 'rated as CAUTION'
    if (peRatio && peRatio < 20 && profitMargin && profitMargin > 0.10) return 'shows value potential'
    if (revenueGrowth && revenueGrowth > 0.15) return 'shows strong growth'
    return 'requires careful analysis'
  }

  const faqs: FAQ[] = []

  // 1. Main "Should I buy" question - CRITICAL for featured snippets
  // Answer starts with direct verdict
  faqs.push({
    question: `Is ${ticker} a good stock to buy?`,
    answer: `${ticker} (${companyName}) is ${getVerdict()} based on current fundamentals.${
      price ? ` The stock trades at $${price.toFixed(2)}` : ''
    }${peRatio && peRatio > 0 ? ` with a P/E ratio of ${peRatio.toFixed(1)}` : ''}.${
      priceTarget && price
        ? ` Analyst consensus target of $${priceTarget.toFixed(2)} suggests ${((priceTarget - price) / price * 100).toFixed(0)}% ${priceTarget > price ? 'upside' : 'downside'} potential.`
        : ''
    } Always consider your risk tolerance and investment goals.`,
  })

  // 2. Price target question
  if (priceTarget && price) {
    const upside = ((priceTarget - price) / price) * 100
    faqs.push({
      question: `What is ${ticker} stock price target?`,
      answer: `The ${currentYear} price target for ${ticker} is $${priceTarget.toFixed(2)}, representing ${upside >= 0 ? '+' : ''}${upside.toFixed(1)}% from the current price of $${price.toFixed(2)}.${
        analystCount ? ` This target is based on ${analystCount} analyst ratings.` : ''
      } Price targets reflect analyst expectations over a 12-month period.`,
    })
  }

  // 3. Current price question
  if (price) {
    faqs.push({
      question: `What is ${ticker} stock price today?`,
      answer: `${ticker} stock is currently trading at $${price.toFixed(2)}.${
        marketCap ? ` ${companyName} has a market capitalization of $${(marketCap / 1e9).toFixed(1)} billion.` : ''
      } Stock prices fluctuate during market hours (9:30 AM - 4:00 PM ET). Visit our dashboard for real-time quotes.`,
    })
  }

  // 4. Valuation question
  if (peRatio && peRatio > 0) {
    faqs.push({
      question: `Is ${ticker} overvalued or undervalued?`,
      answer: `${ticker} trades at a P/E ratio of ${peRatio.toFixed(1)}${
        peRatio < 15 ? ', which suggests the stock may be undervalued compared to market averages' :
        peRatio < 25 ? ', which is in line with market averages' :
        peRatio < 40 ? ', indicating a growth premium in the valuation' :
        ', suggesting high growth expectations are priced in'
      }.${profitMargin && profitMargin > 0 ? ` The company maintains ${(profitMargin * 100).toFixed(1)}% profit margins.` : ''} Use our DCF calculator for detailed valuation analysis.`,
    })
  }

  // 5. Dividend question
  faqs.push({
    question: `Does ${ticker} pay a dividend?`,
    answer: dividendYield && dividendYield > 0
      ? `Yes, ${ticker} pays a dividend with a current yield of ${(dividendYield * 100).toFixed(2)}%. This provides shareholders with regular income in addition to potential capital appreciation. Check our dividend calendar for upcoming payment dates.`
      : `${ticker} does not currently pay a dividend. The company reinvests profits into growth initiatives rather than distributing them to shareholders. Consider dividend-paying alternatives if income is your priority.`,
  })

  // 6. Long-term investment question
  faqs.push({
    question: `Is ${ticker} a good long-term investment?`,
    answer: `${ticker}'s long-term potential depends on several factors.${
      revenueGrowth && revenueGrowth > 0.10 ? ` The company shows ${(revenueGrowth * 100).toFixed(0)}% revenue growth.` : ''
    }${profitMargin && profitMargin > 0.15 ? ` Strong ${(profitMargin * 100).toFixed(0)}% profit margins indicate pricing power.` : ''
    }${marketCap && marketCap > 100e9 ? ' Large-cap status provides stability.' : ''
    } Evaluate competitive position, management quality, and industry trends before making a long-term commitment.`,
  })

  return faqs
}

/**
 * Generate snippet-optimized FAQs for stock comparison queries
 * "X vs Y which is better?"
 *
 * @example
 * const faqs = generateComparisonFAQs(
 *   { ticker: 'TSLA', name: 'Tesla', peRatio: 65 },
 *   { ticker: 'F', name: 'Ford', peRatio: 12 }
 * )
 */
export interface StockForComparison {
  ticker: string
  name: string
  price?: number
  peRatio?: number
  marketCap?: number
  revenueGrowth?: number
  profitMargin?: number
  dividendYield?: number
}

export function generateComparisonFAQs(
  stock1: StockForComparison,
  stock2: StockForComparison
): FAQ[] {
  const { ticker: t1, name: n1 } = stock1
  const { ticker: t2, name: n2 } = stock2

  // Determine winner based on different criteria
  const getValueWinner = () => {
    if (!stock1.peRatio || !stock2.peRatio) return null
    if (stock1.peRatio < stock2.peRatio) return t1
    if (stock2.peRatio < stock1.peRatio) return t2
    return null
  }

  const getGrowthWinner = () => {
    if (!stock1.revenueGrowth || !stock2.revenueGrowth) return null
    if (stock1.revenueGrowth > stock2.revenueGrowth) return t1
    if (stock2.revenueGrowth > stock1.revenueGrowth) return t2
    return null
  }

  const valueWinner = getValueWinner()
  const growthWinner = getGrowthWinner()

  const faqs: FAQ[] = []

  // 1. Main comparison question - answer starts with verdict
  faqs.push({
    question: `Is ${t1} or ${t2} a better stock?`,
    answer: `${t1} and ${t2} serve different investment strategies.${
      valueWinner ? ` ${valueWinner} offers better value with a lower P/E ratio.` : ''
    }${growthWinner ? ` ${growthWinner} shows stronger growth.` : ''
    } ${t1} (${n1}) and ${t2} (${n2}) should be evaluated based on your investment goals - growth investors may prefer higher revenue growth, while value investors seek lower valuations.`,
  })

  // 2. Valuation comparison
  if (stock1.peRatio && stock2.peRatio) {
    faqs.push({
      question: `Which is cheaper: ${t1} or ${t2}?`,
      answer: `${valueWinner || t1} has the lower valuation. ${t1} trades at ${stock1.peRatio.toFixed(1)}x earnings while ${t2} trades at ${stock2.peRatio.toFixed(1)}x earnings. A lower P/E ratio may indicate better value, but also consider growth rates and profit margins when comparing valuations.`,
    })
  }

  // 3. Growth comparison
  if (stock1.revenueGrowth && stock2.revenueGrowth) {
    faqs.push({
      question: `${t1} vs ${t2}: which has better growth?`,
      answer: `${growthWinner || t1} shows stronger revenue growth. ${t1} has ${(stock1.revenueGrowth * 100).toFixed(0)}% revenue growth compared to ${t2}'s ${(stock2.revenueGrowth * 100).toFixed(0)}%. Growth investors typically favor companies with higher revenue expansion, though this should be balanced against valuation.`,
    })
  }

  // 4. Market cap comparison
  if (stock1.marketCap && stock2.marketCap) {
    const bigger = stock1.marketCap > stock2.marketCap ? t1 : t2
    faqs.push({
      question: `Which is bigger: ${t1} or ${t2}?`,
      answer: `${bigger} is the larger company by market capitalization. ${t1} has a market cap of $${(stock1.marketCap / 1e9).toFixed(1)}B while ${t2} is valued at $${(stock2.marketCap / 1e9).toFixed(1)}B. Larger companies often offer more stability, while smaller ones may have more growth potential.`,
    })
  }

  // 5. Dividend comparison
  if (stock1.dividendYield !== undefined || stock2.dividendYield !== undefined) {
    const div1 = stock1.dividendYield || 0
    const div2 = stock2.dividendYield || 0
    const divWinner = div1 > div2 ? t1 : div2 > div1 ? t2 : null
    faqs.push({
      question: `${t1} vs ${t2}: which pays better dividends?`,
      answer: divWinner
        ? `${divWinner} offers the higher dividend yield. ${t1} yields ${(div1 * 100).toFixed(2)}% while ${t2} yields ${(div2 * 100).toFixed(2)}%. Income-focused investors should consider dividend consistency and payout ratios alongside yield.`
        : `${t1} yields ${(div1 * 100).toFixed(2)}% and ${t2} yields ${(div2 * 100).toFixed(2)}% - similar dividend returns. Consider other factors like dividend growth history and payout sustainability.`,
    })
  }

  return faqs
}

/**
 * Generate "What is" definition FAQs for financial terms
 * Optimized for featured snippet definitions (40-60 words)
 */
export function generateDefinitionFAQs(): FAQ[] {
  return [
    {
      question: 'What is P/E ratio?',
      answer: 'P/E ratio (price-to-earnings ratio) measures how much investors pay for each dollar of earnings. It is calculated by dividing stock price by earnings per share. A P/E of 20 means investors pay $20 for $1 of earnings. Lower ratios may indicate undervaluation; higher ratios suggest growth expectations.',
    },
    {
      question: 'What is market capitalization?',
      answer: 'Market capitalization (market cap) is a company\'s total stock market value, calculated by multiplying share price by shares outstanding. Large-cap stocks exceed $10 billion, mid-cap range $2-10 billion, and small-cap are under $2 billion. Market cap indicates company size and risk level.',
    },
    {
      question: 'What is dividend yield?',
      answer: 'Dividend yield is the annual dividend payment divided by stock price, expressed as a percentage. A $100 stock paying $3 annual dividends has a 3% yield. Higher yields provide more income but may indicate slower growth or elevated risk. Compare yields within the same sector.',
    },
    {
      question: 'What is EPS?',
      answer: 'EPS (earnings per share) measures a company\'s profit per outstanding share. It is calculated by dividing net income by shares outstanding. Higher EPS indicates greater profitability. Analysts track EPS growth and compare actual results to estimates during earnings season.',
    },
    {
      question: 'What is a stock split?',
      answer: 'A stock split increases the number of shares while proportionally decreasing price per share. In a 2-for-1 split, a $100 stock becomes two $50 shares. Total investment value stays the same. Splits make shares more accessible to retail investors and increase liquidity.',
    },
    {
      question: 'What is DCF valuation?',
      answer: 'DCF (discounted cash flow) valuation estimates a stock\'s intrinsic value by projecting future cash flows and discounting them to present value. If DCF value exceeds current price, the stock may be undervalued. It requires assumptions about growth rates, margins, and discount rate.',
    },
  ]
}

/**
 * ComparisonTable Schema - Generates Table structured data
 * Helps Google understand tabular comparison data
 */
export interface ComparisonTableSchemaProps {
  name: string
  description: string
  url: string
  items: Array<{
    name: string
    [key: string]: string | number
  }>
}

export function ComparisonTableSchema({
  name,
  description,
  url,
  items,
}: ComparisonTableSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Table',
    name,
    description,
    url,
    about: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
      })),
    },
  }

  return (
    <Script
      id="comparison-table-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="beforeInteractive"
    />
  )
}
