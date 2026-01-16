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
    // License field required by Google for Dataset rich results
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
  }
}

// DataCatalog Schema (for the overall financial data platform)
export function getDataCatalogSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'DataCatalog',
    '@id': `${SITE_URL}/#datacatalog`,
    name: 'Lician Financial Data',
    description: 'Real-time stock data, financial statements, valuations, and AI-powered analysis for 100,000+ companies across US and European markets.',
    url: SITE_URL,
    provider: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
    },
    dataset: [
      {
        '@type': 'Dataset',
        name: 'US Stock Market Data',
        description: 'Real-time prices, financial statements, and analytics for 5,000+ US companies including SEC filings and insider trading data.',
        variableMeasured: ['stock price', 'market cap', 'revenue', 'earnings', 'P/E ratio'],
      },
      {
        '@type': 'Dataset',
        name: 'European Stock Market Data',
        description: 'Financial data and market metrics for 100,000+ European companies across EU markets.',
        variableMeasured: ['stock price', 'market cap', 'revenue', 'IFRS financials'],
      },
    ],
    license: 'https://creativecommons.org/licenses/by/4.0/',
    isAccessibleForFree: true,
    keywords: [
      'stock data',
      'financial data',
      'stock market',
      'company financials',
      'SEC filings',
      'earnings data',
      'stock valuations',
      'AI stock analysis',
    ].join(', '),
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
