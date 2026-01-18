import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'
import NewsArticleCard from './NewsArticleCard'
import NewsCategories from './NewsCategories'

export const revalidate = 3600
export const dynamic = 'force-dynamic' // Prevent build-time timeout

export const metadata: Metadata = {
  title: 'Stock Market News Today - Latest Financial & Investing News | Lician',
  description: 'Get the latest stock market news, financial headlines, and investing insights. Real-time market news covering stocks, earnings, analyst ratings, and economic updates.',
  keywords: [
    'stock market news',
    'market news today',
    'stock news',
    'financial news',
    'investing news',
    'stock market headlines',
    'market updates',
    'stock market today',
    'breaking market news',
    'real-time stock news',
    'stock market analysis',
    'wall street news',
  ],
  openGraph: {
    title: 'Stock Market News Today - Latest Headlines & Analysis',
    description: 'Real-time stock market news, financial headlines, and investing insights from top sources.',
    type: 'website',
    url: `${SITE_URL}/news`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Market News Today',
    description: 'Latest stock market news and financial headlines',
  },
  alternates: {
    canonical: `${SITE_URL}/news`,
  },
}

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

async function getMarketNews(): Promise<NewsArticle[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/market-news?limit=50`, {
      next: { revalidate: 3600 }, // Match page-level revalidation
    })

    if (!res.ok) {
      console.error('Failed to fetch news:', res.status)
      return []
    }

    const data = await res.json()
    return data.news || []
  } catch (error) {
    console.error('Error fetching market news:', error)
    return []
  }
}

const newsCategories = [
  { name: 'All News', filter: 'all', icon: '📰' },
  { name: 'Earnings', filter: 'earnings', icon: '💰' },
  { name: 'Analyst Ratings', filter: 'analyst', icon: '📊' },
  { name: 'M&A', filter: 'merger', icon: '🤝' },
  { name: 'Tech', filter: 'tech', icon: '💻' },
  { name: 'Healthcare', filter: 'health', icon: '🏥' },
]

const faqs = [
  {
    question: 'Where does Lician get stock market news?',
    answer: 'Lician aggregates real-time stock market news from multiple trusted financial sources including Yahoo Finance, Reuters, Bloomberg, Benzinga, CNBC, and other major financial news providers. Our news feed is updated continuously throughout the trading day.',
  },
  {
    question: 'How often is the market news updated?',
    answer: 'Our stock market news feed is updated in real-time, with new articles appearing as they are published. During market hours, you can expect fresh headlines every few minutes covering breaking news, earnings reports, analyst upgrades/downgrades, and major market events.',
  },
  {
    question: 'Can I filter news by specific stocks?',
    answer: 'Yes! Each news article shows related stock symbols (tickers). Click on any ticker to view stock-specific news and analysis. You can also search for a specific stock on our dashboard to see its dedicated news feed.',
  },
  {
    question: 'What is sentiment analysis on news articles?',
    answer: 'Sentiment analysis uses AI to determine whether a news article has positive, negative, or neutral tone regarding a stock or the market. This helps you quickly gauge the overall sentiment around a company or market event without reading every article in detail.',
  },
  {
    question: 'How can I use market news for investing?',
    answer: 'Market news helps you stay informed about events that may impact stock prices including earnings reports, product launches, regulatory changes, analyst ratings, and economic data. Use news as one input alongside fundamental analysis, technical analysis, and your investment strategy. Always verify important information and avoid making decisions based solely on headlines.',
  },
  {
    question: 'What types of market news are most important?',
    answer: 'Key market news categories include: earnings reports (actual results vs expectations), analyst upgrades/downgrades, FDA approvals for biotech stocks, merger & acquisition announcements, executive changes, major product launches, regulatory decisions, and macroeconomic data releases. News with high sentiment polarity or affecting large-cap stocks often has the biggest market impact.',
  },
]

const relatedResources = [
  {
    title: 'Earnings Calendar',
    description: 'Track upcoming earnings reports and historical surprises',
    href: '/earnings',
    icon: '📅',
  },
  {
    title: 'Analyst Ratings',
    description: 'Latest analyst upgrades, downgrades, and price targets',
    href: '/analyst-ratings',
    icon: '⭐',
  },
  {
    title: 'Market Movers',
    description: 'Top gainers, losers, and most active stocks today',
    href: '/markets',
    icon: '📈',
  },
  {
    title: 'Insider Trading',
    description: 'Track insider buying and selling activity',
    href: '/insider-trading',
    icon: '👤',
  },
  {
    title: 'SEC Filings',
    description: 'Recent 8-K, 10-K, 10-Q, and other SEC filings',
    href: '/stock/AAPL',
    icon: '📄',
  },
  {
    title: 'Economic Calendar',
    description: 'Important economic data releases and events',
    href: '/economic-calendar',
    icon: '🗓️',
  },
]

export default async function NewsPage() {
  const news = await getMarketNews()
  const pageUrl = `${SITE_URL}/news`

  // Schema.org structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'News', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stock Market News Today - Latest Headlines & Analysis',
    description: 'Real-time stock market news aggregated from top financial sources. Stay updated with the latest market events, earnings reports, and analyst ratings.',
    url: pageUrl,
    keywords: ['stock market news', 'market news today', 'financial news', 'investing news'],
  })

  const faqSchema = getFAQSchema(faqs)

  // Create NewsArticle schema for each article
  const newsArticleSchemas = news.slice(0, 10).map((article, index) => ({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${pageUrl}#article-${index}`,
    headline: article.title,
    description: article.content.substring(0, 200),
    datePublished: article.date,
    url: article.link,
    author: {
      '@type': 'Organization',
      name: article.source || 'Financial News Source',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lician',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    ...(article.image && { image: article.image }),
    articleSection: 'Stock Market News',
    keywords: [...article.displaySymbols || article.symbols, ...article.tags].join(', '),
  }))

  const combinedSchemas = [breadcrumbSchema, articleSchema, faqSchema, ...newsArticleSchemas]

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(combinedSchemas),
        }}
      />
      <main className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">
              Home
            </Link>
            {' / '}
            <span className="text-white">News</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Stock Market News Today
            </h1>
            <p className="text-lg sm:text-xl text-[#868f97] max-w-3xl">
              Real-time financial news aggregated from top sources. Stay informed with the latest market headlines, earnings reports, and analyst insights.
            </p>
          </div>

          {/* Categories */}
          <NewsCategories categories={newsCategories} />

          {/* News Grid */}
          <section className="mb-16">
            {news.length > 0 ? (
              <div className="space-y-4">
                {news.map((article, index) => (
                  <NewsArticleCard key={index} article={article} />
                ))}
              </div>
            ) : (
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-12 rounded-2xl border border-white/[0.08] text-center">
                <p className="text-[#868f97] text-lg">
                  No news articles available at the moment. Please check back soon.
                </p>
              </div>
            )}
          </section>

          {/* Why Follow Market News */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Why Follow Stock Market News?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">
                  Stay Informed
                </h3>
                <p className="text-[#868f97]">
                  Market-moving events happen quickly. Real-time news helps you understand why stocks are moving and make informed decisions based on current events.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">
                  Earnings & Events
                </h3>
                <p className="text-[#868f97]">
                  Track earnings reports, FDA approvals, product launches, and other catalysts that can significantly impact stock prices in the short and long term.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">
                  Analyst Insights
                </h3>
                <p className="text-[#868f97]">
                  Get instant updates on analyst upgrades, downgrades, and price target changes from Wall Street firms covering your portfolio stocks.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">
                  Market Sentiment
                </h3>
                <p className="text-[#868f97]">
                  Understand overall market sentiment through news aggregation and AI-powered sentiment analysis on individual stocks and sectors.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">
                  Risk Management
                </h3>
                <p className="text-[#868f97]">
                  Early warnings about regulatory issues, lawsuits, executive departures, or competitive threats help you manage risk in your portfolio.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg font-bold mb-3">
                  Opportunity Discovery
                </h3>
                <p className="text-[#868f97]">
                  Identify new investment opportunities through news about emerging trends, industry shifts, and companies making strategic moves.
                </p>
              </div>
            </div>
          </section>

          {/* Related Resources */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Related Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedResources.map((resource) => (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] group"
                >
                  <div className="text-4xl mb-4">{resource.icon}</div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out">
                    {resource.title}
                  </h3>
                  <p className="text-[#868f97]">
                    {resource.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]"
                >
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-[#868f97] leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] p-8 rounded-2xl border border-white/[0.08] text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Get AI-Powered Stock Analysis
            </h2>
            <p className="text-[#868f97] mb-6 max-w-2xl mx-auto">
              Combine news insights with fundamental analysis, DCF valuations, and AI-powered research for any stock in the market.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white px-8 py-3 rounded-full font-medium motion-safe:transition-colors motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
            >
              Start Analyzing Stocks
            </Link>
          </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
