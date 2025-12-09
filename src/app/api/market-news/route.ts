import { NextRequest, NextResponse } from 'next/server'

const EODHD_API_KEY = process.env.EODHD_API_KEY || ""

// Major tickers to aggregate news from
const MAJOR_TICKERS = [
  'AAPL.US', 'MSFT.US', 'GOOGL.US', 'AMZN.US', 'NVDA.US',
  'META.US', 'TSLA.US', 'JPM.US', 'V.US', 'WMT.US',
  'HD.US', 'DIS.US', 'NFLX.US', 'BA.US', 'GS.US'
]

export interface NewsArticle {
  title: string
  date: string
  content: string
  link: string
  symbols: string[]
  tags: string[]
  sentiment: {
    polarity: number
    neg: number
    neu: number
    pos: number
  }
  source?: string
  image?: string
}

// Extract source from URL
function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname
    if (hostname.includes('yahoo')) return 'Yahoo Finance'
    if (hostname.includes('benzinga')) return 'Benzinga'
    if (hostname.includes('reuters')) return 'Reuters'
    if (hostname.includes('bloomberg')) return 'Bloomberg'
    if (hostname.includes('cnbc')) return 'CNBC'
    if (hostname.includes('wsj')) return 'WSJ'
    if (hostname.includes('marketwatch')) return 'MarketWatch'
    if (hostname.includes('seekingalpha')) return 'Seeking Alpha'
    if (hostname.includes('fool')) return 'Motley Fool'
    if (hostname.includes('investorplace')) return 'InvestorPlace'
    if (hostname.includes('barrons')) return "Barron's"
    if (hostname.includes('ft.com')) return 'Financial Times'
    if (hostname.includes('techcrunch')) return 'TechCrunch'
    return hostname.replace('www.', '').split('.')[0]
  } catch {
    return 'News'
  }
}

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20')

  try {
    // Fetch news for multiple tickers in parallel
    const tickersToFetch = MAJOR_TICKERS.slice(0, 5)
    const newsPromises = tickersToFetch.map(ticker =>
      fetch(
        `https://eodhd.com/api/news?s=${ticker}&api_token=${EODHD_API_KEY}&fmt=json&limit=5`,
        { next: { revalidate: 300 } }
      ).then(res => res.ok ? res.json() : [])
        .catch(() => [])
    )

    const newsArrays = await Promise.all(newsPromises)
    const rawNews: NewsArticle[] = newsArrays.flat()

    // Process and deduplicate news
    const seenTitles = new Set<string>()
    const processedNews = rawNews
      .filter(article => {
        // Skip duplicates
        if (seenTitles.has(article.title)) return false
        seenTitles.add(article.title)

        // Skip non-English or irrelevant
        if (!article.title || article.title.length < 20) return false

        return true
      })
      .map(article => ({
        ...article,
        source: extractSource(article.link),
        relativeTime: formatRelativeTime(article.date),
        // Clean up symbols (remove .US suffix for display)
        displaySymbols: article.symbols
          .map(s => s.replace('.US', ''))
          .filter(s => s.length <= 5) // Filter out weird symbols
          .slice(0, 4), // Max 4 symbols per article
      }))
      .slice(0, limit)

    return NextResponse.json({
      news: processedNews,
      count: processedNews.length,
      cached: false
    })
  } catch (error) {
    console.error('Market news API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch market news',
      news: []
    }, { status: 500 })
  }
}
