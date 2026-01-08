"use client"

import { cn } from "@/lib/utils"
import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { SourceBadge, SourceType } from "./source-badge"

interface NewsItem {
  id: string
  title: string
  summary?: string
  source: string
  sourceType: SourceType
  url?: string
  publishedAt: string
  sentiment?: "bullish" | "bearish" | "neutral"
  tickers?: string[]
}

interface NewsCardProps {
  news: NewsItem
  compact?: boolean
  className?: string
}

export function NewsCard({ news, compact, className }: NewsCardProps) {
  const SentimentIcon = news.sentiment === "bullish"
    ? TrendingUp
    : news.sentiment === "bearish"
    ? TrendingDown
    : Minus

  const sentimentColor = news.sentiment === "bullish"
    ? "text-green-500"
    : news.sentiment === "bearish"
    ? "text-red-500"
    : "text-muted-foreground"

  const timeAgo = formatTimeAgo(news.publishedAt)

  if (compact) {
    return (
      <a
        href={news.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors",
          className
        )}
      >
        <div className="flex items-start gap-2">
          <SentimentIcon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", sentimentColor)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2">{news.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <SourceBadge type={news.sourceType} label={news.source} />
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>
          </div>
        </div>
      </a>
    )
  }

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border bg-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <SentimentIcon className={cn("w-4 h-4", sentimentColor)} />
            <SourceBadge type={news.sourceType} label={news.source} />
            {news.tickers?.map(ticker => (
              <span key={ticker} className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded">
                ${ticker}
              </span>
            ))}
          </div>

          <h3 className="font-medium mb-1">{news.title}</h3>

          {news.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {news.summary}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
            {news.url && (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Read more
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface NewsListProps {
  news: NewsItem[]
  title?: string
  compact?: boolean
  className?: string
}

export function NewsList({ news, title, compact, className }: NewsListProps) {
  if (!news.length) return null

  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      )}
      <div className={cn("space-y-2", compact && "space-y-1")}>
        {news.map(item => (
          <NewsCard key={item.id} news={item} compact={compact} />
        ))}
      </div>
    </div>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}
