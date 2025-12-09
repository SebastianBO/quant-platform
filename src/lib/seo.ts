// SEO Utility Functions and JSON-LD Schema Generators

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

// Generate stock-specific FAQs
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
