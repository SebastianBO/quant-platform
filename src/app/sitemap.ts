import { MetadataRoute } from 'next'

// Top stocks by market cap - these get highest priority
const TOP_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'UNH', 'JNJ',
  'V', 'XOM', 'WMT', 'JPM', 'MA', 'PG', 'HD', 'CVX', 'MRK', 'ABBV',
  'LLY', 'PEP', 'KO', 'COST', 'AVGO', 'TMO', 'MCD', 'CSCO', 'ACN', 'ABT',
  'DHR', 'NKE', 'ADBE', 'CRM', 'TXN', 'CMCSA', 'VZ', 'NEE', 'PM', 'INTC',
  'AMD', 'QCOM', 'HON', 'UNP', 'RTX', 'LOW', 'AMGN', 'IBM', 'CAT', 'BA',
  'GE', 'SBUX', 'INTU', 'DE', 'SPGI', 'GS', 'BLK', 'GILD', 'AXP', 'MDLZ',
  'ISRG', 'ADI', 'BKNG', 'SYK', 'REGN', 'VRTX', 'MMC', 'PLD', 'LRCX', 'ZTS',
  'PANW', 'C', 'ETN', 'SCHW', 'CI', 'CB', 'SO', 'MO', 'DUK', 'CME',
  'BDX', 'BSX', 'NOW', 'EQIX', 'AON', 'ITW', 'NOC', 'PNC', 'SHW', 'ICE',
  'SNOW', 'PLTR', 'CRWD', 'DDOG', 'NET', 'ZS', 'MDB', 'COIN', 'HOOD', 'SOFI'
]

// Popular comparison pairs
const COMPARISON_PAIRS = [
  ['AAPL', 'MSFT'], ['GOOGL', 'META'], ['NVDA', 'AMD'], ['TSLA', 'F'],
  ['AMZN', 'WMT'], ['JPM', 'BAC'], ['V', 'MA'], ['DIS', 'NFLX'],
  ['KO', 'PEP'], ['NKE', 'LULU'], ['COST', 'TGT'], ['HD', 'LOW']
]

// Filter categories for programmatic pages
const FILTER_CATEGORIES = [
  'dividend', 'growth', 'value', 'tech', 'healthcare', 'energy', 'ai'
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lician.com'
  const currentDate = new Date().toISOString()

  const routes: MetadataRoute.Sitemap = [
    // Core pages
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/premium`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Stock pages - highest priority for top stocks
  TOP_STOCKS.forEach((ticker, index) => {
    const priority = index < 20 ? 0.9 : index < 50 ? 0.8 : 0.7

    // Main stock page
    routes.push({
      url: `${baseUrl}/stock/${ticker}`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority,
    })

    // Should I buy page
    routes.push({
      url: `${baseUrl}/should-i-buy/${ticker.toLowerCase()}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: priority - 0.1,
    })

    // Stock prediction page
    routes.push({
      url: `${baseUrl}/prediction/${ticker.toLowerCase()}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: priority - 0.1,
    })
  })

  // Comparison pages
  COMPARISON_PAIRS.forEach(([ticker1, ticker2]) => {
    routes.push({
      url: `${baseUrl}/compare/${ticker1.toLowerCase()}-vs-${ticker2.toLowerCase()}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    })
  })

  // Filter/category pages
  FILTER_CATEGORIES.forEach((category) => {
    routes.push({
      url: `${baseUrl}/best-stocks/${category}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  return routes
}
