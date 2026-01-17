"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface NewsArticle {
  title: string
  date: string
  content: string
  link: string
  sentiment?: number
  symbols: string[]
}

interface NewsSentimentProps {
  ticker: string
}

export default function NewsSentiment({ ticker }: NewsSentimentProps) {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [overallSentiment, setOverallSentiment] = useState(0)

  useEffect(() => {
    fetchNews()
  }, [ticker])

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/news?ticker=${ticker}`)
      const data = await response.json()

      // Analyze sentiment for each article (simple keyword-based)
      const analyzedNews = (data.news || []).map((article: NewsArticle) => ({
        ...article,
        sentiment: analyzeSentiment(article.title + ' ' + (article.content || ''))
      }))

      setNews(analyzedNews.slice(0, 10))

      // Calculate overall sentiment
      if (analyzedNews.length > 0) {
        const avgSentiment = analyzedNews.reduce((sum: number, a: NewsArticle) => sum + (a.sentiment || 0), 0) / analyzedNews.length
        setOverallSentiment(avgSentiment)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    }
    setLoading(false)
  }

  // Simple keyword-based sentiment analysis
  const analyzeSentiment = (text: string): number => {
    const lowerText = text.toLowerCase()

    const positiveWords = [
      'beat', 'exceeds', 'strong', 'growth', 'surge', 'rally', 'gain', 'profit',
      'upgrade', 'buy', 'bullish', 'record', 'outperform', 'positive', 'higher',
      'success', 'innovation', 'breakthrough', 'acquisition', 'expansion'
    ]

    const negativeWords = [
      'miss', 'decline', 'fall', 'drop', 'loss', 'cut', 'downgrade', 'sell',
      'bearish', 'weak', 'concern', 'risk', 'warning', 'lower', 'lawsuit',
      'investigation', 'layoff', 'recall', 'scandal', 'debt'
    ]

    let score = 0
    positiveWords.forEach(word => {
      if (lowerText.includes(word)) score += 1
    })
    negativeWords.forEach(word => {
      if (lowerText.includes(word)) score -= 1
    })

    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, score / 3))
  }

  const getSentimentLabel = (sentiment: number): { label: string; color: string; emoji: string } => {
    if (sentiment >= 0.3) return { label: 'Bullish', color: 'text-[#4ebe96]', emoji: '🐂' }
    if (sentiment >= 0.1) return { label: 'Slightly Positive', color: 'text-[#4ebe96]', emoji: '📈' }
    if (sentiment > -0.1) return { label: 'Neutral', color: 'text-[#868f97]', emoji: '➖' }
    if (sentiment > -0.3) return { label: 'Slightly Negative', color: 'text-[#ffa16c]', emoji: '📉' }
    return { label: 'Bearish', color: 'text-[#ff5c5c]', emoji: '🐻' }
  }

  const sentimentInfo = getSentimentLabel(overallSentiment)

  // Prepare chart data
  const chartData = news.map((article, i) => ({
    name: `Article ${i + 1}`,
    sentiment: article.sentiment || 0,
    title: article.title.slice(0, 50) + '...'
  }))

  const getSentimentColor = (sentiment: number): string => {
    if (sentiment >= 0.2) return '#4ebe96'
    if (sentiment >= 0) return '#4ebe96'
    if (sentiment >= -0.2) return '#ffa16c'
    return '#ff5c5c'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📰</span>
          News Sentiment - {ticker}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4ebe96]"></div>
          </div>
        ) : (
          <>
            {/* Overall Sentiment */}
            <div className="p-4 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#868f97] text-sm">Overall News Sentiment</p>
                  <p className={`text-3xl font-bold ${sentimentInfo.color}`}>
                    {sentimentInfo.emoji} {sentimentInfo.label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[#868f97] text-sm">Sentiment Score</p>
                  <p className={`text-2xl font-bold ${overallSentiment >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                    {overallSentiment >= 0 ? '+' : ''}{(overallSentiment * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Sentiment Chart */}
            {chartData.length > 0 && (
              <div className="h-48 mb-6">
                <p className="text-sm text-[#868f97] mb-2">Sentiment by Article</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <XAxis type="number" domain={[-1, 1]} stroke="#868f97" />
                    <YAxis type="category" dataKey="name" stroke="#868f97" width={70} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#000000', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                      formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Sentiment']}
                      labelFormatter={(label: string) => chartData.find(d => d.name === label)?.title || label}
                    />
                    <Bar dataKey="sentiment">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getSentimentColor(entry.sentiment)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* News List */}
            <div className="space-y-3">
              <p className="text-sm text-[#868f97]">Recent News</p>
              {news.length > 0 ? (
                news.map((article, i) => {
                  const articleSentiment = getSentimentLabel(article.sentiment || 0)
                  return (
                    <a
                      key={i}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl hover:bg-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                          <p className="text-[#868f97] text-xs mt-1">{article.date}</p>
                        </div>
                        <span className={`text-lg ${articleSentiment.color}`}>{articleSentiment.emoji}</span>
                      </div>
                    </a>
                  )
                })
              ) : (
                <p className="text-[#868f97] text-center py-4">No recent news available</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
