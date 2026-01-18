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
    if (polarity > 0.2) return 'text-[#4ebe96]'
    if (polarity < -0.2) return 'text-[#ff5c5c]'
    return 'text-[#868f97]'
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
    <article className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out group">
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
              <span className="text-sm font-medium text-[#4ebe96]">
                {article.source}
              </span>
            )}
            {article.relativeTime && (
              <span className="text-sm text-[#868f97]">
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
          <h2 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out line-clamp-2">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded"
            >
              {article.title}
            </a>
          </h2>

          {/* Description */}
          <p className="text-[#868f97] mb-3 line-clamp-2 text-sm sm:text-base">
            {article.content}
          </p>

          {/* Footer with symbols and link */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Related Stocks */}
            <div className="flex items-center gap-2 flex-wrap">
              {displaySymbols.length > 0 && (
                <>
                  <span className="text-sm text-[#868f97]">Stocks:</span>
                  <div className="flex gap-2 flex-wrap">
                    {displaySymbols.map((symbol) => (
                      <Link
                        key={symbol}
                        href={`/stock/${symbol}`}
                        className="px-2.5 py-1 bg-[#4ebe96]/10 hover:bg-[#4ebe96]/20 text-[#4ebe96] rounded-md text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
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
              className="flex items-center gap-1.5 text-sm text-[#479ffa] hover:text-[#479ffa]/80 motion-safe:transition-colors motion-safe:duration-150 ease-out whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded"
            >
              Read More
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Tags (if any) */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-[#868f97]">Tags:</span>
              {article.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/[0.03] text-[#868f97] border border-white/[0.08] rounded text-xs"
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
