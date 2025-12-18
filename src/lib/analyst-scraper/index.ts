// Analyst Ratings Scraper - Extracts analyst ratings from news and press releases
// Our own TipRanks-style data collection

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// RSS feed sources for analyst ratings news - comprehensive coverage
export const NEWS_SOURCES = [
  // Press Release Wires (Primary Sources)
  {
    name: 'PR Newswire - Business',
    url: 'https://www.prnewswire.com/rss/financial-services-news.rss',
    type: 'press_release'
  },
  {
    name: 'PR Newswire - All News',
    url: 'https://www.prnewswire.com/rss/news-releases-list.rss',
    type: 'press_release'
  },
  {
    name: 'GlobeNewswire - Analyst',
    url: 'https://www.globenewswire.com/RssFeed/subjectcode/14-Analyst%20Comment%2FRating/feedTitle/GlobeNewswire%20-%20Analyst%20Comment%2FRating',
    type: 'press_release'
  },
  {
    name: 'GlobeNewswire - All',
    url: 'https://www.globenewswire.com/RssFeed/orgclass/1-All%20Sources/feedTitle/GlobeNewswire%20-%20All%20News',
    type: 'press_release'
  },
  {
    name: 'Business Wire',
    url: 'https://feed.businesswire.com/rss/home/?rss=G1QFDERJXkJeEFpRWw==',
    type: 'press_release'
  },
  {
    name: 'AccessWire',
    url: 'https://www.accesswire.com/rss/news.xml',
    type: 'press_release'
  },
  // Major Financial News
  {
    name: 'MarketWatch - Market Pulse',
    url: 'https://feeds.marketwatch.com/marketwatch/marketpulse/',
    type: 'news_article'
  },
  {
    name: 'MarketWatch - Top Stories',
    url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
    type: 'news_article'
  },
  {
    name: 'MarketWatch - Stocks',
    url: 'https://feeds.marketwatch.com/marketwatch/StockstoWatch/',
    type: 'news_article'
  },
  {
    name: 'Seeking Alpha - Market Currents',
    url: 'https://seekingalpha.com/market_currents.xml',
    type: 'news_article'
  },
  {
    name: 'Seeking Alpha - Stock Ideas',
    url: 'https://seekingalpha.com/feed.xml',
    type: 'news_article'
  },
  {
    name: 'Yahoo Finance - Top',
    url: 'https://finance.yahoo.com/news/rssindex',
    type: 'news_article'
  },
  {
    name: 'Benzinga - General',
    url: 'https://www.benzinga.com/feeds/benzinga.xml',
    type: 'news_article'
  },
  {
    name: 'Benzinga - Analyst Ratings',
    url: 'https://www.benzinga.com/feeds/analyst-ratings.xml',
    type: 'news_article'
  },
  {
    name: 'TheStreet',
    url: 'https://www.thestreet.com/feeds/rss/all-stories.rss',
    type: 'news_article'
  },
  {
    name: 'Investor Place',
    url: 'https://investorplace.com/feed/',
    type: 'news_article'
  },
  {
    name: 'Motley Fool',
    url: 'https://www.fool.com/feeds/index.aspx',
    type: 'news_article'
  },
  // Reuters & Bloomberg alternatives
  {
    name: 'Reuters - Business',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance',
    type: 'news_article'
  },
  {
    name: 'CNBC - Top News',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    type: 'news_article'
  },
  {
    name: 'CNBC - Stock Blog',
    url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
    type: 'news_article'
  },
  // Specialty Financial
  {
    name: 'Zacks - Commentary',
    url: 'https://www.zacks.com/commentary/rss/',
    type: 'news_article'
  },
  {
    name: 'Barrons',
    url: 'https://www.barrons.com/xml/rss/3_7510.xml',
    type: 'news_article'
  },
  {
    name: 'Financial Times - Markets',
    url: 'https://www.ft.com/markets?format=rss',
    type: 'news_article'
  },
  {
    name: 'WSJ - Markets',
    url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    type: 'news_article'
  },
  // Sector Specific
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    type: 'news_article'
  },
  {
    name: 'BioPharma Dive',
    url: 'https://www.biopharmadive.com/feeds/news/',
    type: 'news_article'
  }
]

// Known analyst firms for matching - comprehensive list
const ANALYST_FIRMS = [
  // Tier 1 - Bulge Bracket
  'Goldman Sachs', 'Morgan Stanley', 'JPMorgan', 'JP Morgan', 'J.P. Morgan',
  'Bank of America', 'BofA', 'BofA Securities', 'Merrill Lynch',
  'Citigroup', 'Citi', 'Citibank',
  'Wells Fargo', 'Barclays', 'UBS', 'Credit Suisse', 'Deutsche Bank',
  'HSBC', 'BNP Paribas', 'Societe Generale',
  // Tier 1 - Regional Leaders
  'RBC Capital', 'RBC', 'Royal Bank of Canada',
  'TD Securities', 'TD Cowen', 'Scotiabank',
  'Nomura', 'Daiwa', 'SMBC Nikko',
  // Tier 2 - Major Independent
  'Jefferies', 'Piper Sandler', 'Piper Jaffray',
  'Stifel', 'Stifel Nicolaus', 'Raymond James',
  'Wedbush', 'Wedbush Securities',
  'Needham', 'Needham & Company',
  'Oppenheimer', 'Cowen', 'Cowen and Company',
  'Canaccord', 'Canaccord Genuity',
  'BMO Capital', 'BMO', 'KeyBanc', 'KeyBanc Capital Markets',
  'Wolfe Research', 'Bernstein', 'Sanford Bernstein', 'AllianceBernstein',
  'Evercore', 'Evercore ISI',
  'William Blair', 'Baird', 'Robert W. Baird',
  // Boutique
  'Loop Capital', 'DA Davidson', 'D.A. Davidson',
  'Rosenblatt', 'Rosenblatt Securities',
  'Mizuho', 'Mizuho Securities',
  'Susquehanna', 'Susquehanna International', 'SIG',
  'Truist', 'Truist Securities', 'SunTrust',
  'Ladenburg Thalmann', 'Ladenburg',
  'B. Riley', 'B Riley', 'Craig-Hallum',
  'Lake Street', 'Lake Street Capital',
  'HC Wainwright', 'H.C. Wainwright',
  'Roth Capital', 'Roth MKM',
  'Benchmark', 'Benchmark Company',
  'Maxim Group', 'Northland Securities', 'Northland Capital',
  // Research Firms
  'Argus', 'Argus Research',
  'CFRA', 'CFRA Research',
  'Morningstar', 'Zacks', 'Zacks Investment Research',
  'S&P Global', 'S&P Capital IQ',
  'New Street Research', 'New Street',
  'Redburn', 'Atlantic Equities',
  // Tech Focused
  'Wedbush Securities', 'D.A. Davidson',
  'Monness Crespi', 'Monness Crespi Hardt',
  'Guggenheim', 'Guggenheim Securities',
  'JMP Securities', 'JMP',
  'Citic Securities', 'CLSA',
  // European
  'Berenberg', 'Exane BNP', 'Kepler Cheuvreux',
  'Liberum', 'Numis', 'Peel Hunt', 'Shore Capital',
  // Asian
  'Macquarie', 'CLSA', 'Haitong',
  'China Renaissance', 'CICC'
]

// Rating action keywords
const RATING_ACTIONS = {
  upgrade: ['upgraded', 'upgrades', 'raised', 'raises', 'boosted', 'boosts'],
  downgrade: ['downgraded', 'downgrades', 'lowered', 'lowers', 'cut', 'cuts'],
  initiate: ['initiated', 'initiates', 'started', 'starts', 'began', 'begins', 'launched'],
  maintain: ['maintained', 'maintains', 'reiterated', 'reiterates', 'reaffirmed', 'reaffirms'],
}

// Rating names
const RATINGS = [
  'Buy', 'Strong Buy', 'Outperform', 'Overweight', 'Accumulate', 'Positive',
  'Hold', 'Neutral', 'Equal Weight', 'Equal-Weight', 'Market Perform', 'Sector Perform', 'In-Line',
  'Sell', 'Underperform', 'Underweight', 'Reduce', 'Negative'
]

export interface ExtractedRating {
  ticker: string
  firmName: string
  analystName?: string
  rating: string
  ratingPrior?: string
  action: string
  priceTarget?: number
  priceTargetPrior?: number
  confidence: number
  rawText: string
}

export interface NewsItem {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  sourceType: string
}

// Parse RSS XML to extract items
export function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = []

  // Simple regex-based XML parsing (avoiding external dependencies)
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || []

  for (const itemXml of itemMatches) {
    const title = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || ''
    const description = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() || ''
    const link = itemXml.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() || ''
    const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() || ''

    if (title || description) {
      items.push({
        title: cleanHtml(title),
        description: cleanHtml(description),
        link,
        pubDate,
        source: '',
        sourceType: ''
      })
    }
  }

  return items
}

// Clean HTML tags and entities
function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Common stock tickers to match directly
const KNOWN_TICKERS = new Set([
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK', 'TSM',
  'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'NFLX', 'AVGO', 'QCOM', 'TXN', 'CSCO',
  'IBM', 'INTU', 'AMAT', 'ADI', 'LRCX', 'MU', 'KLAC', 'SNPS', 'CDNS', 'NOW',
  'PANW', 'SNOW', 'CRWD', 'DDOG', 'ZS', 'NET', 'FTNT', 'TEAM', 'WDAY', 'SPLK',
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'BLK', 'C', 'USB', 'AXP', 'SCHW',
  'UNH', 'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN',
  'GILD', 'VRTX', 'REGN', 'ISRG', 'SYK', 'MDT', 'ELV', 'CI', 'CVS', 'HCA',
  'WMT', 'PG', 'KO', 'PEP', 'COST', 'HD', 'MCD', 'NKE', 'LOW', 'TGT', 'SBUX',
  'CAT', 'DE', 'BA', 'RTX', 'HON', 'UPS', 'FDX', 'GE', 'LMT', 'NOC', 'MMM',
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'VLO', 'PSX', 'OXY', 'DVN',
  'DIS', 'CMCSA', 'VZ', 'T', 'TMUS', 'CHTR', 'NXPI', 'ATVI', 'EA', 'TTWO',
  'GME', 'AMC', 'PLTR', 'SOFI', 'RIVN', 'LCID', 'HOOD', 'COIN', 'RBLX', 'U',
  'UBER', 'LYFT', 'ABNB', 'DASH', 'SNAP', 'PINS', 'ZM', 'PTON', 'DOCU', 'OKTA',
  'BABA', 'PDD', 'JD', 'NIO', 'BIDU', 'NTES', 'LI', 'XPEV', 'BILI', 'TME',
  'MRNA', 'BNTX', 'SGEN', 'ALNY', 'IONS', 'SRPT', 'BMRN', 'EXEL', 'NBIX',
  'SPY', 'QQQ', 'IWM', 'DIA', 'VOO', 'VTI', 'ARKK', 'XLF', 'XLE', 'XLK',
  'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'WELL', 'DLR', 'AVB',
  'NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE', 'XEL', 'ED', 'PEG',
  'LIN', 'APD', 'SHW', 'FCX', 'NEM', 'ECL', 'DD', 'NUE', 'VMC', 'MLM'
])

// Common false positives to exclude
const EXCLUDED_WORDS = new Set([
  'THE', 'FOR', 'AND', 'WITH', 'FROM', 'INC', 'LLC', 'CEO', 'CFO', 'IPO', 'ETF',
  'NYSE', 'SEC', 'FDA', 'USA', 'COO', 'CTO', 'CIO', 'CMO',
  'BUY', 'SELL', 'HOLD', 'NEW', 'OLD', 'TOP', 'ALL', 'ARE', 'HAS', 'WAS',
  'EST', 'PST', 'UTC', 'GMT', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD',
  'AI', 'ML', 'IT', 'PR', 'HR', 'QA', 'API', 'AWS', 'GCP'
])

// Extract ticker symbols from text
function extractTickers(text: string): string[] {
  const tickers = new Set<string>()
  let match

  // Pattern 1: Exchange format (NASDAQ: AAPL), (NYSE: MSFT)
  const exchangePattern = /\((?:NASDAQ|NYSE|AMEX|NYSEARCA|OTC|OTCQX|OTCQB):\s*([A-Z]{1,5})\)/gi
  while ((match = exchangePattern.exec(text)) !== null) {
    tickers.add(match[1].toUpperCase())
  }

  // Pattern 2: Cashtag format $AAPL
  const cashtagPattern = /\$([A-Z]{1,5})\b/g
  while ((match = cashtagPattern.exec(text)) !== null) {
    const ticker = match[1].toUpperCase()
    if (!EXCLUDED_WORDS.has(ticker)) {
      tickers.add(ticker)
    }
  }

  // Pattern 3: Stock/shares/price context "AAPL stock" "TSLA shares" "NVDA price target"
  const stockPattern = /\b([A-Z]{2,5})\b(?=\s+(?:stock|shares|common\s+stock|price|target|rating))/gi
  while ((match = stockPattern.exec(text)) !== null) {
    const ticker = match[1].toUpperCase()
    if (!EXCLUDED_WORDS.has(ticker)) {
      tickers.add(ticker)
    }
  }

  // Pattern 4: Known tickers mentioned standalone (most important!)
  for (const knownTicker of KNOWN_TICKERS) {
    const regex = new RegExp(`\\b${knownTicker}\\b`, 'g')
    if (regex.test(text.toUpperCase())) {
      tickers.add(knownTicker)
    }
  }

  // Pattern 5: Ticker in parentheses after company name "Apple (AAPL)"
  const parenPattern = /\(([A-Z]{2,5})\)/g
  while ((match = parenPattern.exec(text)) !== null) {
    const ticker = match[1].toUpperCase()
    if (!EXCLUDED_WORDS.has(ticker)) {
      if (KNOWN_TICKERS.has(ticker) || ticker.length >= 3) {
        tickers.add(ticker)
      }
    }
  }

  return Array.from(tickers)
}

// Extract analyst firm from text
function extractFirm(text: string): string | null {
  const lowerText = text.toLowerCase()

  for (const firm of ANALYST_FIRMS) {
    if (lowerText.includes(firm.toLowerCase())) {
      return firm
    }
  }

  // Try to match "X analyst" pattern
  const analystMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+analyst/i)
  if (analystMatch) {
    return analystMatch[1]
  }

  return null
}

// Extract analyst name from text
function extractAnalystName(text: string): string | null {
  // Match patterns like "analyst John Smith" or "John Smith, analyst"
  const patterns = [
    /analyst\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+),?\s+(?:analyst|equity analyst|research analyst)/i,
    /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:at|of|from)\s+(?:Goldman|Morgan|JPMorgan|Citi|Barclays)/i
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

// Extract rating and action
function extractRating(text: string): { rating: string; action: string; ratingPrior?: string } | null {
  const lowerText = text.toLowerCase()

  // Determine action
  let action = 'unknown'
  for (const [actionType, keywords] of Object.entries(RATING_ACTIONS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      action = actionType
      break
    }
  }

  // Find ratings mentioned
  const foundRatings: string[] = []
  for (const rating of RATINGS) {
    if (lowerText.includes(rating.toLowerCase())) {
      foundRatings.push(rating)
    }
  }

  if (foundRatings.length === 0) return null

  // If upgrade/downgrade, try to find "from X to Y" pattern
  const fromToMatch = text.match(/from\s+(\w+(?:\s+\w+)?)\s+to\s+(\w+(?:\s+\w+)?)/i)
  if (fromToMatch && (action === 'upgrade' || action === 'downgrade')) {
    return {
      rating: normalizeRating(fromToMatch[2]),
      ratingPrior: normalizeRating(fromToMatch[1]),
      action
    }
  }

  return {
    rating: normalizeRating(foundRatings[0]),
    ratingPrior: foundRatings.length > 1 ? normalizeRating(foundRatings[1]) : undefined,
    action
  }
}

function normalizeRating(rating: string): string {
  const lower = rating.toLowerCase().trim()
  const map: Record<string, string> = {
    'buy': 'Buy',
    'strong buy': 'Strong Buy',
    'outperform': 'Outperform',
    'overweight': 'Overweight',
    'hold': 'Hold',
    'neutral': 'Hold',
    'equal weight': 'Hold',
    'sell': 'Sell',
    'underperform': 'Underperform',
    'underweight': 'Underweight'
  }
  return map[lower] || rating.charAt(0).toUpperCase() + rating.slice(1).toLowerCase()
}

// Extract price target
function extractPriceTarget(text: string): { target?: number; prior?: number } {
  const result: { target?: number; prior?: number } = {}

  // Match patterns like "price target of $150" or "$150 price target" or "PT $150"
  const targetPatterns = [
    /price\s+target\s+(?:of\s+)?\$?([\d,.]+)/i,
    /\$?([\d,.]+)\s+price\s+target/i,
    /PT\s+\$?([\d,.]+)/i,
    /target\s+(?:price\s+)?(?:of\s+)?\$?([\d,.]+)/i,
    /target\s+to\s+\$?([\d,.]+)/i
  ]

  for (const pattern of targetPatterns) {
    const match = text.match(pattern)
    if (match) {
      result.target = parseFloat(match[1].replace(/,/g, ''))
      break
    }
  }

  // Try to find prior target "from $X to $Y" or "from $X"
  const priorMatch = text.match(/from\s+\$?([\d,.]+)\s+to\s+\$?([\d,.]+)/i)
  if (priorMatch) {
    result.prior = parseFloat(priorMatch[1].replace(/,/g, ''))
    result.target = parseFloat(priorMatch[2].replace(/,/g, ''))
  }

  return result
}

// Main extraction function
export function extractAnalystRatings(newsItem: NewsItem): ExtractedRating[] {
  const text = `${newsItem.title} ${newsItem.description}`
  const ratings: ExtractedRating[] = []

  // Check if this looks like an analyst rating article
  const hasRatingKeywords = /upgrade|downgrade|initiate|reiterate|price\s+target|analyst|rating/i.test(text)
  if (!hasRatingKeywords) return ratings

  const tickers = extractTickers(text)
  if (tickers.length === 0) return ratings

  const firm = extractFirm(text)
  if (!firm) return ratings

  const ratingInfo = extractRating(text)
  if (!ratingInfo) return ratings

  const analystName = extractAnalystName(text)
  const priceTargets = extractPriceTarget(text)

  // Calculate confidence based on how much we extracted
  let confidence = 0.5
  if (tickers.length === 1) confidence += 0.1 // Single ticker is more reliable
  if (analystName) confidence += 0.1
  if (priceTargets.target) confidence += 0.1
  if (ratingInfo.action !== 'unknown') confidence += 0.1
  if (firm && ANALYST_FIRMS.some(f => f.toLowerCase() === firm.toLowerCase())) confidence += 0.1

  // Create rating for each ticker (usually just one)
  for (const ticker of tickers.slice(0, 3)) { // Max 3 tickers per article
    ratings.push({
      ticker,
      firmName: firm,
      analystName: analystName || undefined,
      rating: ratingInfo.rating,
      ratingPrior: ratingInfo.ratingPrior,
      action: ratingInfo.action,
      priceTarget: priceTargets.target,
      priceTargetPrior: priceTargets.prior,
      confidence: Math.min(confidence, 1.0),
      rawText: text.slice(0, 500) // Store first 500 chars for verification
    })
  }

  return ratings
}

// Fetch and parse RSS feed
export async function fetchRSSFeed(source: typeof NEWS_SOURCES[0]): Promise<NewsItem[]> {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QuantPlatform/1.0; +https://lician.com)'
      }
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`)
      return []
    }

    const xml = await response.text()
    const items = parseRSS(xml)

    return items.map(item => ({
      ...item,
      source: source.name,
      sourceType: source.type
    }))
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error)
    return []
  }
}

// Store rating in database
export async function storeRating(
  supabase: SupabaseClient,
  rating: ExtractedRating,
  newsItem: NewsItem
): Promise<boolean> {
  try {
    // Get or create firm
    const { data: firmData } = await supabase
      .from('analyst_firms')
      .select('id')
      .or(`name.ilike.%${rating.firmName}%,aliases.cs.{${rating.firmName}}`)
      .single()

    let firmId = firmData?.id

    if (!firmId) {
      const { data: newFirm } = await supabase
        .from('analyst_firms')
        .insert({ name: rating.firmName, tier: 'unknown' })
        .select('id')
        .single()
      firmId = newFirm?.id
    }

    // Get or create analyst (if we have a name)
    let analystId: number | null = null
    if (rating.analystName && firmId) {
      const { data: analystData } = await supabase
        .from('analysts')
        .select('id')
        .eq('name', rating.analystName)
        .eq('firm_id', firmId)
        .single()

      analystId = analystData?.id

      if (!analystId) {
        const { data: newAnalyst } = await supabase
          .from('analysts')
          .insert({ name: rating.analystName, firm_id: firmId })
          .select('id')
          .single()
        analystId = newAnalyst?.id || null
      }
    }

    // Insert the rating
    const { error } = await supabase
      .from('analyst_ratings')
      .upsert({
        ticker: rating.ticker,
        analyst_id: analystId,
        firm_id: firmId,
        rating: rating.rating,
        rating_prior: rating.ratingPrior,
        action: rating.action,
        price_target: rating.priceTarget,
        price_target_prior: rating.priceTargetPrior,
        rating_date: new Date(newsItem.pubDate || Date.now()).toISOString().split('T')[0],
        source_url: newsItem.link,
        source_type: newsItem.sourceType,
        source_name: newsItem.source,
        raw_text: rating.rawText,
        confidence: rating.confidence
      }, {
        onConflict: 'ticker,analyst_id,rating_date,rating'
      })

    if (error) {
      console.error('Error storing rating:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in storeRating:', error)
    return false
  }
}

// Mark news source as processed
export async function markSourceProcessed(
  supabase: SupabaseClient,
  newsItem: NewsItem,
  ratingsExtracted: number
): Promise<void> {
  await supabase
    .from('analyst_news_sources')
    .upsert({
      url: newsItem.link,
      title: newsItem.title,
      source_name: newsItem.source,
      published_at: newsItem.pubDate ? new Date(newsItem.pubDate).toISOString() : null,
      processed: true,
      ratings_extracted: ratingsExtracted
    }, {
      onConflict: 'url'
    })
}

// Check if source already processed
export async function isSourceProcessed(supabase: SupabaseClient, url: string): Promise<boolean> {
  const { data } = await supabase
    .from('analyst_news_sources')
    .select('processed')
    .eq('url', url)
    .single()

  return data?.processed || false
}

// Main scraping function
export async function scrapeAnalystRatings(supabase: SupabaseClient): Promise<{
  sourcesProcessed: number
  ratingsExtracted: number
  errors: string[]
}> {
  const results = {
    sourcesProcessed: 0,
    ratingsExtracted: 0,
    errors: [] as string[]
  }

  for (const source of NEWS_SOURCES) {
    try {
      const items = await fetchRSSFeed(source)

      for (const item of items) {
        // Skip if already processed
        if (await isSourceProcessed(supabase, item.link)) {
          continue
        }

        const ratings = extractAnalystRatings(item)
        let ratingsStored = 0

        for (const rating of ratings) {
          if (await storeRating(supabase, rating, item)) {
            ratingsStored++
            results.ratingsExtracted++
          }
        }

        await markSourceProcessed(supabase, item, ratingsStored)
        results.sourcesProcessed++
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      results.errors.push(`${source.name}: ${errorMsg}`)
    }
  }

  return results
}
