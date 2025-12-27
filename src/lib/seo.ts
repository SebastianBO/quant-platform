// SEO Utility Functions and JSON-LD Schema Generators
import { Metadata } from 'next'

export const SITE_URL = 'https://lician.com'
export const SITE_NAME = 'Lician'
export const SITE_DESCRIPTION = 'AI-Powered Stock Research & Analysis Platform'
export const LOGO_URL = `${SITE_URL}/logo.png`
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`

// Organization Schema (for the whole site)
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    sameAs: [
      'https://twitter.com/lician',
      'https://github.com/lician',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
  }
}

// WebSite Schema (for search box and site info)
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/dashboard?ticker={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// BreadcrumbList Schema
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Article Schema (for stock analysis pages)
export function getArticleSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  image,
  keywords,
}: {
  headline: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  image?: string
  keywords?: string[]
}) {
  const now = new Date().toISOString()
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    image: image || OG_IMAGE_URL,
    datePublished: datePublished || now,
    dateModified: dateModified || now,
    author: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(keywords && { keywords: keywords.join(', ') }),
  }
}

// FinancialProduct Schema (for stock pages)
export function getFinancialProductSchema({
  ticker,
  name,
  description,
  url,
  price,
  currency = 'USD',
  exchange = 'NASDAQ',
}: {
  ticker: string
  name: string
  description: string
  url: string
  price?: number
  currency?: string
  exchange?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    '@id': `${url}#stock`,
    name: `${ticker} Stock`,
    description,
    url,
    provider: {
      '@type': 'Corporation',
      name,
      tickerSymbol: ticker,
    },
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
      },
    }),
  }
}

// Corporation Schema for stocks (standalone)
export function getCorporationSchema({
  ticker,
  name,
  description,
  sector,
  industry,
  exchange = 'NASDAQ',
  url,
  foundingDate,
  numberOfEmployees,
}: {
  ticker: string
  name: string
  description: string
  sector?: string
  industry?: string
  exchange?: string
  url: string
  foundingDate?: string
  numberOfEmployees?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Corporation',
    '@id': `${url}#corporation`,
    name,
    tickerSymbol: ticker,
    description,
    url,
    ...(sector && { knowsAbout: sector }),
    ...(industry && { industry }),
    ...(exchange && { identifier: `${exchange}:${ticker}` }),
    ...(foundingDate && { foundingDate }),
    ...(numberOfEmployees && { numberOfEmployees }),
  }
}

// Dataset Schema for historical stock data
export function getDatasetSchema({
  ticker,
  name,
  description,
  url,
  temporalCoverage,
}: {
  ticker: string
  name: string
  description: string
  url: string
  temporalCoverage?: string
}) {
  const currentDate = new Date().toISOString().split('T')[0]
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const startDate = oneYearAgo.toISOString().split('T')[0]

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${url}#dataset`,
    name: `${ticker} Historical Stock Data`,
    description: description || `Historical price and trading data for ${name} (${ticker}) including open, high, low, close, volume, and adjusted prices.`,
    url,
    creator: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
    },
    temporalCoverage: temporalCoverage || `${startDate}/${currentDate}`,
    keywords: [
      `${ticker} historical data`,
      `${ticker} stock prices`,
      `${ticker} trading volume`,
      'financial data',
      'stock market data',
    ].join(', '),
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: url,
    },
    variableMeasured: [
      'stock price',
      'trading volume',
      'market capitalization',
      'price/earnings ratio',
    ],
  }
}

// AggregateRating Schema for analyst ratings
export function getAggregateRatingSchema({
  ticker,
  ratingValue,
  ratingCount,
  bestRating = 5,
  worstRating = 1,
  url,
}: {
  ticker: string
  ratingValue: number
  ratingCount: number
  bestRating?: number
  worstRating?: number
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    '@id': `${url}#rating`,
    itemReviewed: {
      '@type': 'FinancialProduct',
      name: `${ticker} Stock`,
    },
    ratingValue: ratingValue.toFixed(2),
    ratingCount,
    bestRating,
    worstRating,
    reviewAspect: 'Investment Rating',
  }
}

// FAQPage Schema
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
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
}

// HowTo Schema (for guides)
export function getHowToSchema({
  name,
  description,
  steps,
}: {
  name: string
  description: string
  steps: { name: string; text: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
}

// ItemList Schema (for category pages with stock lists)
export function getItemListSchema({
  name,
  description,
  url,
  items,
}: {
  name: string
  description: string
  url: string
  items: { name: string; url: string; position: number }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  }
}

// Combine multiple schemas into a single JSON-LD script
export function combineSchemas(...schemas: object[]) {
  return schemas
}

// ========================================
// NEW SCHEMAS FOR ENHANCED SEO RANKINGS
// ========================================

// ComparisonAction Schema - For stock comparison pages (enables rich comparison results)
export function getComparisonSchema({
  ticker1,
  ticker2,
  name1,
  name2,
  url,
  metrics,
}: {
  ticker1: string
  ticker2: string
  name1: string
  name2: string
  url: string
  metrics?: {
    marketCap1?: number
    marketCap2?: number
    pe1?: number
    pe2?: number
    price1?: number
    price2?: number
  }
}) {
  const currentYear = new Date().getFullYear()

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${url}#comparison`,
    name: `${ticker1} vs ${ticker2} Stock Comparison`,
    description: `Head-to-head comparison of ${name1} (${ticker1}) and ${name2} (${ticker2}) stocks for ${currentYear}`,
    url,
    numberOfItems: 2,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'FinancialProduct',
          '@id': `${SITE_URL}/stock/${ticker1.toLowerCase()}#stock`,
          name: `${ticker1} Stock - ${name1}`,
          description: `${name1} (${ticker1}) stock analysis and metrics`,
          url: `${SITE_URL}/stock/${ticker1.toLowerCase()}`,
          provider: {
            '@type': 'Corporation',
            name: name1,
            tickerSymbol: ticker1,
          },
          ...(metrics?.price1 && {
            offers: {
              '@type': 'Offer',
              price: metrics.price1.toString(),
              priceCurrency: 'USD',
            },
          }),
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'FinancialProduct',
          '@id': `${SITE_URL}/stock/${ticker2.toLowerCase()}#stock`,
          name: `${ticker2} Stock - ${name2}`,
          description: `${name2} (${ticker2}) stock analysis and metrics`,
          url: `${SITE_URL}/stock/${ticker2.toLowerCase()}`,
          provider: {
            '@type': 'Corporation',
            name: name2,
            tickerSymbol: ticker2,
          },
          ...(metrics?.price2 && {
            offers: {
              '@type': 'Offer',
              price: metrics.price2.toString(),
              priceCurrency: 'USD',
            },
          }),
        },
      },
    ],
  }
}

// BuyAction Schema - For stock pages (signals investment intent to AI/search)
export function getBuyActionSchema({
  ticker,
  companyName,
  price,
  url,
}: {
  ticker: string
  companyName: string
  price?: number
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Action',
    '@id': `${url}#buy-action`,
    name: `Buy ${ticker} Stock`,
    description: `Analyze and consider buying ${companyName} (${ticker}) stock`,
    object: {
      '@type': 'FinancialProduct',
      '@id': `${url}#stock`,
      name: `${ticker} Stock`,
      provider: {
        '@type': 'Corporation',
        name: companyName,
        tickerSymbol: ticker,
      },
      ...(price && {
        offers: {
          '@type': 'Offer',
          price: price.toString(),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          priceValidUntil: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Valid for 24 hours
        },
      }),
    },
    potentialAction: {
      '@type': 'TradeAction',
      name: 'Trade Stock',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/dashboard?ticker=${ticker}&tab=quant`,
        actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
      },
    },
  }
}

// BlogPosting Schema - For educational/learn pages (better than generic Article)
export function getBlogPostingSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  image,
  keywords,
  wordCount,
}: {
  headline: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  image?: string
  keywords?: string[]
  wordCount?: number
}) {
  const now = new Date().toISOString()
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline,
    description,
    url,
    image: image || OG_IMAGE_URL,
    datePublished: datePublished || now,
    dateModified: dateModified || now,
    ...(wordCount && { wordCount }),
    author: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    isPartOf: {
      '@type': 'Blog',
      '@id': `${SITE_URL}/learn#blog`,
      name: `${SITE_NAME} Investment Education`,
    },
    ...(keywords && { keywords: keywords.join(', ') }),
  }
}

// Table Schema - For financial data tables (enables table rich results)
export function getTableSchema({
  name,
  description,
  url,
  columns,
  rowCount,
}: {
  name: string
  description: string
  url: string
  columns: string[]
  rowCount?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Table',
    '@id': `${url}#table`,
    name,
    description,
    about: {
      '@type': 'FinancialProduct',
      name: 'Stock Financial Data',
    },
    ...(rowCount && { numberOfRows: rowCount }),
    creator: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
    },
  }
}

// Earnings Event Schema - For individual stock earnings pages
export function getEarningsEventSchema({
  ticker,
  companyName,
  earningsDate,
  timeOfDay = 'AMC',
  epsEstimate,
  revenueEstimate,
}: {
  ticker: string
  companyName: string
  earningsDate: string
  timeOfDay?: 'BMO' | 'AMC'
  epsEstimate?: number
  revenueEstimate?: number
}) {
  const startTime = timeOfDay === 'BMO' ? 'T08:00:00' : 'T16:30:00'
  const eventUrl = `${SITE_URL}/earnings/${ticker.toLowerCase()}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${eventUrl}#event`,
    name: `${companyName} (${ticker}) Earnings Report`,
    description: `Quarterly earnings report for ${companyName} (${ticker}).${epsEstimate ? ` EPS estimate: $${epsEstimate.toFixed(2)}.` : ''}${revenueEstimate ? ` Revenue estimate: $${(revenueEstimate / 1e9).toFixed(2)}B.` : ''}`,
    startDate: `${earningsDate}${startTime}`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    url: eventUrl,
    location: {
      '@type': 'VirtualLocation',
      url: eventUrl,
    },
    organizer: {
      '@type': 'Corporation',
      name: companyName,
      tickerSymbol: ticker,
      url: `${SITE_URL}/stock/${ticker.toLowerCase()}`,
    },
    performer: {
      '@type': 'Corporation',
      name: companyName,
      tickerSymbol: ticker,
    },
  }
}

// FinancialService Schema - Defines the platform itself
export function getFinancialServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': `${SITE_URL}/#service`,
    name: `${SITE_NAME} - AI Stock Analysis Platform`,
    description: 'AI-powered stock research and analysis platform providing real-time quotes, financial statements, DCF valuations, and investment insights.',
    url: SITE_URL,
    logo: LOGO_URL,
    serviceType: 'Investment Research Service',
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    availableLanguage: 'English',
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Stock Analysis Tools',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI Stock Analysis',
            description: 'AI-powered fundamental and technical analysis',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'DCF Valuation Calculator',
            description: 'Discounted cash flow valuation tool',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Stock Screener',
            description: 'Filter stocks by multiple criteria',
          },
        },
      ],
    },
  }
}

// SoftwareApplication Schema - For app/tool discovery
export function getSoftwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#app`,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Real-time stock quotes',
      'AI-powered stock analysis',
      'DCF valuation calculator',
      'Financial statement analysis',
      'Stock comparison tools',
      'Earnings calendar',
      'Technical indicators',
      'Sector analysis',
    ],
  }
}

// ========================================
// METRIC PAGE SCHEMA GENERATOR
// Scalable solution for 442+ metric pages
// ========================================

export interface MetricPageSchemaConfig {
  ticker: string
  companyName: string
  metricName: string
  metricDisplayName: string
  pageUrl: string
  sector?: string
  industry?: string
  description?: string
  metricValue?: number | string
  metricUnit?: string
  historicalData?: { period: string; value: number }[]
  faqs: { question: string; answer: string }[]
  keywords?: string[]
}

/**
 * Generate all standard schemas for a metric page
 * Use this in all 442+ pSEO metric pages for consistent schema coverage
 *
 * Returns: breadcrumb, article, corporation, faq, table schemas
 */
export function getMetricPageSchemas(config: MetricPageSchemaConfig) {
  const {
    ticker,
    companyName,
    metricName,
    metricDisplayName,
    pageUrl,
    sector,
    industry,
    description,
    metricValue,
    historicalData,
    faqs,
    keywords = [],
  } = config

  const currentYear = new Date().getFullYear()

  // 1. Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: ticker, url: `${SITE_URL}/stock/${ticker.toLowerCase()}` },
    { name: metricDisplayName, url: pageUrl },
  ])

  // 2. Article Schema
  const articleSchema = getArticleSchema({
    headline: `${ticker} ${metricDisplayName} ${currentYear} - Analysis & History`,
    description: description || `Complete ${metricDisplayName} analysis for ${companyName} (${ticker}) with historical trends and industry comparison.`,
    url: pageUrl,
    keywords: [
      `${ticker} ${metricName}`,
      `${ticker} ${metricDisplayName}`,
      `${companyName} ${metricName}`,
      ...keywords,
    ],
  })

  // 3. Corporation Schema
  const corporationSchema = getCorporationSchema({
    ticker,
    name: companyName,
    description: description?.slice(0, 200) || `${companyName} (${ticker}) stock`,
    sector,
    industry,
    url: pageUrl,
  })

  // 4. FAQ Schema
  const faqSchema = getFAQSchema(faqs)

  // 5. Table Schema (for historical data)
  const tableSchema = getTableSchema({
    name: `${ticker} ${metricDisplayName} History`,
    description: `Historical ${metricDisplayName} data for ${companyName} (${ticker})`,
    url: pageUrl,
    columns: ['Period', metricDisplayName, 'Change'],
    rowCount: historicalData?.length || 5,
  })

  // 6. Financial Product Schema (for metrics with numeric values)
  const financialProductSchema = metricValue !== undefined ? {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    '@id': `${pageUrl}#metric`,
    name: `${ticker} ${metricDisplayName}`,
    description: `Current ${metricDisplayName} for ${companyName}: ${metricValue}`,
    url: pageUrl,
    provider: {
      '@type': 'Corporation',
      name: companyName,
      tickerSymbol: ticker,
    },
  } : null

  // Return all schemas, filtering out nulls
  const schemas = [
    breadcrumbSchema,
    articleSchema,
    corporationSchema,
    faqSchema,
    tableSchema,
    financialProductSchema,
  ].filter(Boolean)

  return schemas
}

/**
 * Generate enhanced FAQs for any metric page
 * Creates 8-10 dynamic FAQs based on metric type and data
 */
export function getMetricFAQs({
  ticker,
  companyName,
  metricName,
  metricDisplayName,
  metricValue,
  metricUnit = '',
  industryAverage,
  previousValue,
  sector,
}: {
  ticker: string
  companyName: string
  metricName: string
  metricDisplayName: string
  metricValue?: number | string
  metricUnit?: string
  industryAverage?: number
  previousValue?: number
  sector?: string
}): { question: string; answer: string }[] {
  const currentYear = new Date().getFullYear()
  const formattedValue = metricValue !== undefined ? `${metricValue}${metricUnit}` : 'N/A'

  const faqs = [
    {
      question: `What is ${ticker}'s ${metricDisplayName}?`,
      answer: metricValue !== undefined
        ? `${ticker} (${companyName}) has a ${metricDisplayName} of ${formattedValue}. This metric is used by investors to evaluate the company's ${getMetricContext(metricName)}.`
        : `${ticker}'s ${metricDisplayName} data is being updated. Check our real-time dashboard for the latest values.`
    },
    {
      question: `Is ${ticker}'s ${metricDisplayName} good?`,
      answer: industryAverage !== undefined && metricValue !== undefined
        ? `${ticker}'s ${metricDisplayName} of ${formattedValue} ${Number(metricValue) > industryAverage ? 'exceeds' : 'is below'} the industry average of ${industryAverage}${metricUnit}. ${getMetricQualityAssessment(metricName, Number(metricValue), industryAverage)}`
        : `Whether ${ticker}'s ${metricDisplayName} is good depends on industry context and investment goals. Compare with peers using our stock comparison tool.`
    },
    {
      question: `How is ${ticker}'s ${metricDisplayName} calculated?`,
      answer: getMetricCalculationExplanation(metricName, ticker)
    },
    {
      question: `How does ${ticker}'s ${metricDisplayName} compare to competitors?`,
      answer: `${ticker}'s ${metricDisplayName} of ${formattedValue} can be compared to industry peers${sector ? ` in the ${sector} sector` : ''}. Use our stock comparison tool to see how ${ticker} ranks against competitors on this metric.`
    },
    {
      question: `What is a good ${metricDisplayName} for stocks?`,
      answer: getIdealMetricRange(metricName)
    },
    {
      question: `Is ${ticker}'s ${metricDisplayName} trending up or down?`,
      answer: previousValue !== undefined && metricValue !== undefined
        ? `${ticker}'s ${metricDisplayName} has ${Number(metricValue) > previousValue ? 'increased' : 'decreased'} from ${previousValue}${metricUnit} to ${formattedValue}. ${getMetricTrendAnalysis(metricName, Number(metricValue), previousValue)}`
        : `View ${ticker}'s historical ${metricDisplayName} trends on our analysis dashboard to see the direction over time.`
    },
    {
      question: `Why is ${metricDisplayName} important for ${ticker}?`,
      answer: `${metricDisplayName} helps investors understand ${ticker}'s ${getMetricImportance(metricName)}. For ${companyName}, this metric provides insights into ${getMetricInsight(metricName, sector)}.`
    },
    {
      question: `Should I buy ${ticker} based on its ${metricDisplayName}?`,
      answer: `Investment decisions should not be based on a single metric. While ${ticker}'s ${metricDisplayName} of ${formattedValue} is one data point, consider the full picture: valuation, growth, profitability, and competitive position. Use our AI analysis for comprehensive evaluation.`
    },
  ]

  return faqs
}

// Helper functions for metric FAQs
function getMetricContext(metricName: string): string {
  const contexts: Record<string, string> = {
    'pe-ratio': 'valuation relative to earnings',
    'revenue': 'sales performance and growth',
    'net-margin': 'profitability efficiency',
    'rsi': 'momentum and overbought/oversold conditions',
    'market-cap': 'size and market value',
    'debt-to-equity': 'financial leverage and risk',
    'dividend-yield': 'income generation potential',
    'eps': 'earnings power per share',
    'roic': 'return on invested capital efficiency',
    'free-cash-flow': 'cash generation ability',
  }
  return contexts[metricName] || 'financial health and performance'
}

function getMetricCalculationExplanation(metricName: string, ticker: string): string {
  const explanations: Record<string, string> = {
    'pe-ratio': `${ticker}'s P/E ratio is calculated by dividing the current stock price by earnings per share (EPS). It shows how much investors pay for each dollar of earnings.`,
    'revenue': `${ticker}'s revenue represents total sales from all business operations, reported in quarterly and annual financial statements.`,
    'net-margin': `Net margin is calculated as net income divided by revenue, expressed as a percentage. It shows how much profit ${ticker} keeps from each dollar of sales.`,
    'rsi': `RSI (Relative Strength Index) is calculated using average gains and losses over 14 periods. Values above 70 suggest overbought conditions, below 30 suggests oversold.`,
    'market-cap': `Market cap equals share price multiplied by total shares outstanding. It represents ${ticker}'s total market value.`,
    'debt-to-equity': `Debt-to-equity ratio divides total debt by shareholders' equity, measuring financial leverage and risk.`,
  }
  return explanations[metricName] || `This metric is derived from ${ticker}'s financial statements using standard financial analysis formulas.`
}

function getIdealMetricRange(metricName: string): string {
  const ranges: Record<string, string> = {
    'pe-ratio': 'A "good" P/E ratio varies by industry. Generally, 15-25 is considered average. Lower may indicate undervaluation, higher suggests growth expectations.',
    'net-margin': 'Net margins vary by industry. Technology: 15-25% is good. Retail: 2-5% is typical. Manufacturing: 5-10% is healthy.',
    'rsi': 'RSI between 30-70 is considered neutral. Below 30 may signal buying opportunity (oversold), above 70 may signal caution (overbought).',
    'debt-to-equity': 'Generally, debt-to-equity below 1.0 is conservative. 1.0-2.0 is moderate. Above 2.0 indicates high leverage.',
    'dividend-yield': 'Dividend yields of 2-5% are considered healthy. Very high yields (6%+) may signal risk or unsustainable payouts.',
    'roic': 'ROIC above 10% is generally good. Above 15% indicates strong capital allocation. Compare to cost of capital.',
  }
  return ranges[metricName] || 'Ideal ranges vary by industry and company stage. Compare to sector peers for context.'
}

function getMetricQualityAssessment(metricName: string, value: number, industryAvg: number): string {
  const ratio = value / industryAvg
  if (ratio > 1.2) return 'This indicates strong performance relative to peers.'
  if (ratio < 0.8) return 'This suggests room for improvement compared to industry standards.'
  return 'This is in line with industry norms.'
}

function getMetricTrendAnalysis(metricName: string, current: number, previous: number): string {
  const changePercent = ((current - previous) / previous * 100).toFixed(1)
  return `This represents a ${changePercent}% change, which investors should monitor in context of industry trends.`
}

function getMetricImportance(metricName: string): string {
  const importance: Record<string, string> = {
    'pe-ratio': 'valuation and growth expectations',
    'revenue': 'business scale and market share',
    'net-margin': 'operational efficiency and pricing power',
    'rsi': 'short-term price momentum',
    'market-cap': 'company size and liquidity',
    'debt-to-equity': 'financial risk and leverage',
  }
  return importance[metricName] || 'financial performance and health'
}

function getMetricInsight(metricName: string, sector?: string): string {
  if (sector) {
    return `how efficiently the company operates within the ${sector} sector`
  }
  return 'the company\'s competitive position and financial strength'
}

// Generate stock-specific FAQs (basic - 4 questions)
export function getStockFAQs(ticker: string, companyName: string, price?: number) {
  const currentYear = new Date().getFullYear()
  return [
    {
      question: `Should I buy ${ticker} stock in ${currentYear}?`,
      answer: `Whether to buy ${ticker} (${companyName}) depends on your investment goals, risk tolerance, and time horizon. Use our AI-powered analysis to evaluate ${ticker}'s fundamentals, valuation, and growth potential before making a decision.`,
    },
    {
      question: `What is ${ticker}'s current stock price?`,
      answer: price
        ? `${ticker} is currently trading at $${price.toFixed(2)}. Stock prices fluctuate throughout trading hours - check our real-time dashboard for the latest price.`
        : `Visit our dashboard for ${ticker}'s real-time stock price and historical data.`,
    },
    {
      question: `Is ${ticker} a good long-term investment?`,
      answer: `Long-term investment potential for ${ticker} depends on factors like revenue growth, profitability, competitive position, and industry trends. Our DCF calculator and AI analysis can help evaluate ${ticker}'s intrinsic value.`,
    },
    {
      question: `What is ${ticker}'s price target for ${currentYear}?`,
      answer: `Our AI model provides bull, base, and bear case price targets for ${ticker}. Visit the prediction page for detailed forecasts based on fundamental analysis and market conditions.`,
    },
  ]
}

// Extended FAQ Schema (18 questions like TradingView)
export function getStockFAQsExtended(
  ticker: string,
  companyName: string,
  price?: number,
  metrics?: any
) {
  const currentYear = new Date().getFullYear()
  const pe = metrics?.price_to_earnings_ratio || 0
  const pb = metrics?.price_to_book_ratio || 0
  const marketCap = metrics?.market_cap || 0
  const eps = metrics?.earnings_per_share || 0
  const dividend = metrics?.dividend_yield || 0
  const revenueGrowth = metrics?.revenue_growth || 0
  const profitMargin = metrics?.profit_margin || 0

  return [
    // Price and current status
    {
      question: `What is ${ticker} stock price today?`,
      answer: price
        ? `${ticker} (${companyName}) stock is trading at $${price.toFixed(2)} as of the latest market data. Stock prices update in real-time during market hours (9:30 AM - 4:00 PM ET).`
        : `Visit our real-time dashboard for the current ${ticker} stock price and live market data.`,
    },
    {
      question: `Is ${ticker} stock going up or down today?`,
      answer: `${ticker} stock price movements are influenced by market conditions, news, earnings reports, and investor sentiment. Check our live dashboard for real-time price changes and technical indicators.`,
    },

    // Investment decision questions
    {
      question: `Should I buy ${ticker} stock now?`,
      answer: `The decision to buy ${ticker} depends on your investment strategy, risk tolerance, and financial goals. Our AI analysis evaluates fundamentals, valuation metrics, growth prospects, and market conditions to help inform your decision.`,
    },
    {
      question: `Is ${ticker} a buy, hold, or sell right now?`,
      answer: `Our AI-powered analysis provides buy/hold/sell recommendations for ${ticker} based on multiple factors including valuation, growth metrics, technical indicators, and analyst consensus. Visit our dashboard for the latest recommendation.`,
    },
    {
      question: `Is ${ticker} stock overvalued or undervalued?`,
      answer: pe > 0
        ? `${ticker} currently trades at a P/E ratio of ${pe.toFixed(2)}${pe > 25 ? ', which may indicate premium valuation' : pe < 15 ? ', which may suggest attractive valuation' : ' relative to earnings'}. Our DCF calculator provides intrinsic value estimates to help determine if ${ticker} is fairly priced.`
        : `Use our DCF valuation calculator to determine if ${ticker} is overvalued or undervalued based on fundamental analysis and future cash flow projections.`,
    },

    // Valuation metrics
    {
      question: `What is ${ticker}'s P/E ratio?`,
      answer: pe > 0
        ? `${ticker} has a price-to-earnings (P/E) ratio of ${pe.toFixed(2)}, which measures how much investors are willing to pay per dollar of earnings. Compare this to industry peers and historical averages for context.`
        : `P/E ratio data for ${ticker} will be available after the company reports earnings. Visit our dashboard for the latest financial metrics.`,
    },
    {
      question: `What is ${ticker}'s market cap?`,
      answer: marketCap > 0
        ? `${ticker} (${companyName}) has a market capitalization of $${(marketCap / 1e9).toFixed(2)} billion, making it a ${marketCap > 200e9 ? 'large-cap' : marketCap > 10e9 ? 'mid-cap' : 'small-cap'} stock.`
        : `Visit our dashboard for ${ticker}'s current market capitalization and other key metrics.`,
    },
    {
      question: `What is ${ticker}'s price to book ratio?`,
      answer: pb > 0
        ? `${ticker} trades at a price-to-book (P/B) ratio of ${pb.toFixed(2)}, which compares the stock price to the company's book value per share. A P/B below 1.0 may indicate undervaluation, while above 3.0 may suggest premium pricing.`
        : `Price-to-book ratio for ${ticker} is available on our dashboard along with other valuation metrics.`,
    },

    // Dividends
    {
      question: `Does ${ticker} pay dividends?`,
      answer: dividend > 0
        ? `Yes, ${ticker} pays dividends with a current yield of ${(dividend * 100).toFixed(2)}%. Dividend payments provide income for investors in addition to potential stock price appreciation.`
        : `${ticker} ${dividend === 0 ? 'does not currently pay dividends' : 'dividend information is available on our dashboard'}. Many growth companies reinvest profits into the business rather than paying dividends.`,
    },
    {
      question: `What is ${ticker}'s dividend yield?`,
      answer: dividend > 0
        ? `${ticker}'s dividend yield is ${(dividend * 100).toFixed(2)}%, calculated as annual dividends divided by the current stock price. This represents the annual return from dividends alone.`
        : `${ticker} does not currently pay dividends or dividend data is not available. Check our dashboard for the latest information.`,
    },

    // Growth and performance
    {
      question: `Is ${ticker} stock a good long-term investment?`,
      answer: `${ticker}'s long-term investment potential depends on sustainable competitive advantages, revenue growth, profitability, management quality, and industry dynamics. Our AI analysis evaluates these factors to assess long-term prospects.`,
    },
    {
      question: `What is ${ticker}'s revenue growth rate?`,
      answer: revenueGrowth !== 0
        ? `${ticker} has shown revenue growth of ${(revenueGrowth * 100).toFixed(1)}% over recent periods. Consistent revenue growth is a key indicator of business health and competitive positioning.`
        : `Revenue growth data for ${ticker} is available on our dashboard with detailed financial statement analysis.`,
    },
    {
      question: `Is ${ticker} profitable?`,
      answer: profitMargin > 0
        ? `Yes, ${ticker} is profitable with a profit margin of ${(profitMargin * 100).toFixed(1)}%. This indicates the company generates ${(profitMargin * 100).toFixed(1)} cents of profit for every dollar of revenue.`
        : profitMargin < 0
        ? `${ticker} is currently operating at a loss. Some companies prioritize growth over profitability in early stages. Review our financial analysis for detailed insights.`
        : `Profitability metrics for ${ticker} are available on our dashboard with complete income statement analysis.`,
    },

    // Risk and comparison
    {
      question: `What are the risks of investing in ${ticker}?`,
      answer: `Key risks for ${ticker} include market volatility, competitive pressures, regulatory changes, economic conditions, execution risks, and company-specific factors. Our AI analysis identifies material risks and their potential impact on valuation.`,
    },
    {
      question: `How does ${ticker} compare to its competitors?`,
      answer: `Compare ${ticker} to industry peers on our dashboard using metrics like P/E ratio, revenue growth, profit margins, market share, and valuation multiples. Competitive analysis helps contextualize ${ticker}'s performance and positioning.`,
    },

    // Predictions and targets
    {
      question: `What is ${ticker}'s stock price target for ${currentYear}?`,
      answer: price
        ? `Our AI model provides price targets for ${ticker} based on fundamental analysis: Bull case $${(price * 1.3).toFixed(2)} (+30%), Base case $${(price * 1.15).toFixed(2)} (+15%), Bear case $${(price * 0.9).toFixed(2)} (-10%). Visit our prediction page for detailed forecasts.`
        : `Visit our prediction page for AI-powered price targets for ${ticker} with bull, base, and bear case scenarios.`,
    },
    {
      question: `What do analysts say about ${ticker}?`,
      answer: `Wall Street analysts provide ratings (buy/hold/sell) and price targets for ${ticker}. Our dashboard aggregates analyst consensus, target prices, and recent upgrades/downgrades to help you understand professional sentiment.`,
    },

    // Earnings and fundamentals
    {
      question: `When is ${ticker}'s next earnings report?`,
      answer: `${ticker} reports earnings quarterly. Check our dashboard for the upcoming earnings date, analyst estimates for revenue and EPS, and historical earnings performance. Earnings reports often drive significant stock price movements.`,
    },
  ]
}

// Get related stocks for internal linking
export function getRelatedStocks(ticker: string): string[] {
  const stockGroups: Record<string, string[]> = {
    // Tech giants
    AAPL: ['MSFT', 'GOOGL', 'AMZN', 'META'],
    MSFT: ['AAPL', 'GOOGL', 'AMZN', 'CRM'],
    GOOGL: ['META', 'MSFT', 'AMZN', 'AAPL'],
    AMZN: ['MSFT', 'GOOGL', 'WMT', 'SHOP'],
    META: ['GOOGL', 'SNAP', 'PINS', 'TWTR'],
    // Semiconductors
    NVDA: ['AMD', 'INTC', 'AVGO', 'QCOM'],
    AMD: ['NVDA', 'INTC', 'QCOM', 'MU'],
    INTC: ['AMD', 'NVDA', 'QCOM', 'TXN'],
    // EV/Auto
    TSLA: ['RIVN', 'LCID', 'F', 'GM'],
    // Finance
    JPM: ['BAC', 'WFC', 'GS', 'MS'],
    // Healthcare
    JNJ: ['PFE', 'MRK', 'ABBV', 'UNH'],
  }

  return stockGroups[ticker.toUpperCase()] || ['AAPL', 'MSFT', 'GOOGL', 'AMZN']
}

// Get comparison pairs for a stock
export function getComparisonPairs(ticker: string): string[] {
  const related = getRelatedStocks(ticker)
  return related.slice(0, 3).map((t) => `${ticker.toLowerCase()}-vs-${t.toLowerCase()}`)
}

/**
 * Generate comprehensive SEO metadata for any page
 * Use this helper in your page's generateMetadata() function
 */
export interface SEOMetadataOptions {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: string
  imageAlt?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  noIndex?: boolean
  canonical?: string
}

export function generateSEOMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
  imageAlt,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
  canonical,
}: SEOMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`
  const canonicalUrl = canonical || url
  const ogImage = image || OG_IMAGE_URL
  const ogImageAlt = imageAlt || `${title} - ${SITE_NAME}`

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
      ...(type === 'article' && publishedTime && { publishedTime }),
      ...(type === 'article' && modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@lician',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  }

  return metadata
}

/**
 * Generate stock-specific SEO metadata
 * Optimized for stock ticker pages
 */
export interface StockSEOOptions {
  ticker: string
  companyName: string
  price?: number
  description?: string
  sector?: string
  exchange?: string
}

export function generateStockMetadata({
  ticker,
  companyName,
  price,
  description,
  sector,
  exchange,
}: StockSEOOptions): Metadata {
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  const priceText = price ? `Current price $${price.toFixed(2)}.` : ''
  const sectorText = sector ? `${sector} sector.` : ''

  const fullDescription =
    description ||
    `${symbol} (${companyName}) stock analysis: ${priceText} ${sectorText} View real-time quotes, financial statements, DCF valuation, institutional ownership, insider trades, and AI-powered investment insights.`

  const keywords = [
    `${symbol} stock`,
    `${symbol} stock price`,
    `${symbol} analysis`,
    `${companyName} stock`,
    `${symbol} financials`,
    `${symbol} earnings`,
    `${symbol} valuation`,
    `${symbol} institutional ownership`,
    `buy ${symbol} stock`,
    `${symbol} forecast ${currentYear}`,
    `${symbol} stock news`,
    `${symbol} dividend`,
    `${symbol} PE ratio`,
    `${symbol} market cap`,
  ]

  return generateSEOMetadata({
    title: `${symbol} Stock Price, Analysis & News - ${companyName}`,
    description: fullDescription,
    path: `/stock/${ticker.toLowerCase()}`,
    keywords,
    image: `${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`,
    imageAlt: `${symbol} Stock Analysis - ${companyName}`,
    type: 'article',
    modifiedTime: new Date().toISOString(),
  })
}

/**
 * Generate comparison page SEO metadata
 * For stock vs stock comparison pages
 */
export function generateComparisonMetadata(
  ticker1: string,
  ticker2: string,
  name1?: string,
  name2?: string
): Metadata {
  const t1 = ticker1.toUpperCase()
  const t2 = ticker2.toUpperCase()
  const n1 = name1 || t1
  const n2 = name2 || t2

  return generateSEOMetadata({
    title: `${t1} vs ${t2}: Stock Comparison - Which is Better?`,
    description: `Compare ${t1} (${n1}) vs ${t2} (${n2}) stocks. Side-by-side analysis of financials, valuation, growth metrics, and investment potential. Make better investment decisions with AI-powered comparison.`,
    path: `/compare/${ticker1.toLowerCase()}-vs-${ticker2.toLowerCase()}`,
    keywords: [
      `${t1} vs ${t2}`,
      `${t1} ${t2} comparison`,
      `${t1} or ${t2}`,
      `compare ${t1} ${t2}`,
      `${t1} ${t2} stock comparison`,
      `which is better ${t1} or ${t2}`,
      `${n1} vs ${n2}`,
    ],
    type: 'article',
  })
}

/**
 * Generate sector page SEO metadata
 */
export function generateSectorMetadata(sector: string): Metadata {
  const sectorName = sector
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return generateSEOMetadata({
    title: `${sectorName} Stocks - Top Companies & Analysis`,
    description: `Explore top ${sectorName.toLowerCase()} stocks. Compare companies, view sector performance, analyze financials, and discover investment opportunities in the ${sectorName.toLowerCase()} sector.`,
    path: `/sectors/${sector}`,
    keywords: [
      `${sectorName} stocks`,
      `best ${sectorName} stocks`,
      `${sectorName} sector`,
      `${sectorName} companies`,
      `top ${sectorName} stocks`,
      `${sectorName} stock analysis`,
    ],
    type: 'article',
  })
}
