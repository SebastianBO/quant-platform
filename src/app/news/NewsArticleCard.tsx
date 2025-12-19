'use client'

import Link from 'next/link'
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface NewsArticle {
  title: string
  date: string
  content: string
  link: string
  symbols: string[]
  displaySymbols?: string[]
  tags: string[]
  sentiment: {
    polarity: number
    neg: number
    neu: number
    pos: number
  }
  source?: string
  image?: string
  relativeTime?: string
}

interface NewsArticleCardProps {
  article: NewsArticle
}

export default function NewsArticleCard({ article }: NewsArticleCardProps) {
  const getSentimentColor = (polarity: number) => {
    if (polarity > 0.2) return 'text-green-500'
    if (polarity < -0.2) return 'text-red-500'
    return 'text-gray-500'
  }

  const getSentimentIcon = (polarity: number) => {
    if (polarity > 0.2) return <TrendingUp className="w-4 h-4" />
    if (polarity < -0.2) return <TrendingDown className="w-4 h-4" />
    return <Minus className="w-4 h-4" />
  }

  const getSentimentLabel = (polarity: number) => {
    if (polarity > 0.2) return 'Positive'
    if (polarity < -0.2) return 'Negative'
    return 'Neutral'
  }

  const displaySymbols = article.displaySymbols || article.symbols.slice(0, 4)

  return (
    <article className="bg-card border border-border rounded-xl p-5 hover:border-green-500/30 transition-all group">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Article Image (if available) */}
        {article.image && (
          <div className="flex-shrink-0 sm:w-48 h-32 sm:h-auto">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <div className="flex-1 min-w-0">
          {/* Header with source and time */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {article.source && (
              <span className="text-sm font-medium text-green-500">
                {article.source}
              </span>
            )}
            {article.relativeTime && (
              <span className="text-sm text-muted-foreground">
                {article.relativeTime}
              </span>
            )}

            {/* Sentiment Indicator */}
            <div className={`flex items-center gap-1.5 text-sm ${getSentimentColor(article.sentiment.polarity)}`}>
              {getSentimentIcon(article.sentiment.polarity)}
              <span className="hidden sm:inline">{getSentimentLabel(article.sentiment.polarity)}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-green-500 transition-colors line-clamp-2">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {article.title}
            </a>
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-3 line-clamp-2 text-sm sm:text-base">
            {article.content}
          </p>

          {/* Footer with symbols and link */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Related Stocks */}
            <div className="flex items-center gap-2 flex-wrap">
              {displaySymbols.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">Stocks:</span>
                  <div className="flex gap-2 flex-wrap">
                    {displaySymbols.map((symbol) => (
                      <Link
                        key={symbol}
                        href={`/stock/${symbol}`}
                        className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-md text-sm font-medium transition-colors"
                      >
                        {symbol}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Read More Link */}
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-green-500 hover:text-green-400 transition-colors whitespace-nowrap"
            >
              Read More
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Tags (if any) */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-muted-foreground">Tags:</span>
              {article.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
