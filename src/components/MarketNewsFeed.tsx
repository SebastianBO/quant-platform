"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface NewsArticle {
  title: string
  date: string
  content: string
  link: string
  symbols: string[]
  displaySymbols: string[]
  tags: string[]
  source: string
  relativeTime: string
  sentiment: {
    polarity: number
    neg: number
    neu: number
    pos: number
  }
  image?: string | null
}

interface MarketNewsFeedProps {
  limit?: number
  showHeader?: boolean
  compact?: boolean
  className?: string
}

export default function MarketNewsFeed({
  limit = 15,
  showHeader = true,
  compact = false,
  className
}: MarketNewsFeedProps) {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<Record<string, string | null>>({})

  useEffect(() => {
    fetchNews()
  }, [limit])

  // Fetch og:image for articles in background
  const fetchImage = async (url: string) => {
    if (images[url] !== undefined) return // Already fetched

    try {
      const response = await fetch(`/api/og-image?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      setImages(prev => ({ ...prev, [url]: data.image }))
    } catch {
      setImages(prev => ({ ...prev, [url]: null }))
    }
  }

  // Fetch images for first few articles
  useEffect(() => {
    if (news.length > 0) {
      // Fetch images for featured and main articles (first 6)
      news.slice(0, 6).forEach(article => {
        fetchImage(article.link)
      })
    }
  }, [news])

  const fetchNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/market-news?limit=${limit}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setNews(data.news || [])
    } catch (err) {
      console.error('Error fetching market news:', err)
      setError('Failed to load news')
    }
    setLoading(false)
  }

  // Get image for article (og:image or stock logo fallback)
  const getArticleImage = (article: NewsArticle): string | null => {
    const ogImage = images[article.link]
    if (ogImage) return ogImage

    // Use first stock symbol logo as fallback
    if (article.displaySymbols.length > 0) {
      return `https://assets.parqet.com/logos/symbol/${article.displaySymbols[0]}?format=png`
    }

    return null
  }

  const getSentimentColor = (polarity: number): string => {
    if (polarity >= 0.3) return 'text-emerald-500'
    if (polarity >= 0) return 'text-[#4ebe96]'
    if (polarity >= -0.3) return 'text-orange-500'
    return 'text-[#e15241]'
  }

  const getTickerColor = (change?: number): string => {
    if (change === undefined) return 'bg-white/[0.05] text-[#868f97]'
    if (change > 0) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    if (change < 0) return 'bg-[#e15241]/10 text-[#e15241] border-[#e15241]/20'
    return 'bg-white/[0.05] text-[#868f97]'
  }

  // Separate featured (first) and sidebar news
  const featuredNews = news[0]
  const mainNews = news.slice(1, 6)
  const sidebarNews = news.slice(6)

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold">Market News</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="py-8">
          <p className="text-center text-[#868f97]">{error}</p>
          <button
            onClick={fetchNews}
            className="mt-4 mx-auto block text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={cn("w-full", className)}>
        {showHeader && (
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              Latest News
              <span className="text-xs font-normal text-[#868f97]">
                Updated just now
              </span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-2">
          {news.slice(0, 8).map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 -mx-2 rounded-lg hover:bg-white/[0.04] transition-colors duration-100"
            >
              <p className="text-sm font-medium line-clamp-2 leading-tight">
                {article.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'")}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-[#868f97]">
                <span>{article.source}</span>
                <span>•</span>
                <span>{article.relativeTime}</span>
                {article.displaySymbols.length > 0 && (
                  <>
                    <span>•</span>
                    <span className={getSentimentColor(article.sentiment.polarity)}>
                      {article.displaySymbols[0]}
                    </span>
                  </>
                )}
              </div>
            </a>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {showHeader && (
        <h2 className="text-2xl font-bold mb-4">Market News</h2>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column - Featured + Main news */}
        <div className="lg:col-span-2 space-y-4">
          {/* Featured article */}
          {featuredNews && (
            <a
              href={featuredNews.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Featured image */}
                {getArticleImage(featuredNews) && (
                  <div className="relative h-64 bg-white/[0.05] overflow-hidden">
                    <img
                      src={getArticleImage(featuredNews)!}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Hide image on error
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold leading-tight text-white line-clamp-2">
                        {featuredNews.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'")}
                      </h3>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  {!getArticleImage(featuredNews) && (
                    <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-100 line-clamp-3 mb-3">
                      {featuredNews.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'")}
                    </h3>
                  )}
                  <p className="text-[#868f97] text-sm line-clamp-2">
                    {featuredNews.content?.slice(0, 150)}...
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-[#868f97]">
                      {featuredNews.source} • {featuredNews.relativeTime}
                    </span>
                    <div className="flex gap-1.5">
                      {featuredNews.displaySymbols.map((symbol, i) => (
                        <span
                          key={i}
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded border border-white/[0.08]",
                            getSentimentColor(featuredNews.sentiment.polarity)
                          )}
                        >
                          {symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </a>
          )}

          {/* Main news grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainNews.map((article, i) => {
              const articleImage = getArticleImage(article)
              return (
                <a
                  key={i}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card className="h-full hover:shadow-md transition-shadow overflow-hidden">
                    {articleImage && (
                      <div className="relative h-32 bg-white/[0.05] overflow-hidden">
                        <img
                          src={articleImage}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors duration-100 line-clamp-2">
                        {article.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'")}
                      </h4>
                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <span className="text-xs text-[#868f97]">
                          {article.source} • {article.relativeTime}
                        </span>
                        {article.displaySymbols.slice(0, 2).map((symbol, j) => (
                          <Link
                            key={j}
                            href={`/stock/${symbol}`}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded border",
                              getSentimentColor(article.sentiment.polarity),
                              "hover:bg-white/[0.04]"
                            )}
                          >
                            {symbol}
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </a>
              )
            })}
          </div>
        </div>

        {/* Sidebar - Latest news */}
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-[#868f97] uppercase tracking-wide mb-3">
            Latest
          </h3>
          {sidebarNews.map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 border-b border-white/[0.08] last:border-0 hover:bg-white/[0.024] -mx-2 px-2 rounded transition-colors duration-100"
            >
              <p className="text-sm font-medium leading-tight line-clamp-2">
                {article.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'")}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-[#868f97]">
                <span>{article.source}</span>
                <span>•</span>
                <span>{article.relativeTime}</span>
              </div>
              {article.displaySymbols.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {article.displaySymbols.slice(0, 3).map((symbol, j) => (
                    <span
                      key={j}
                      className={cn(
                        "text-xs px-2 py-0.5 rounded border border-white/[0.08]",
                        getSentimentColor(article.sentiment.polarity)
                      )}
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
