import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Learn Stock Investing & Analysis - Complete Guide | Lician',
  description: 'Master stock investing with comprehensive guides on stock analysis, DCF valuation, P/E ratios, dividend investing, and AI-powered stock analysis.',
  keywords: [
    'stock investing guide',
    'how to analyze stocks',
    'stock valuation',
    'fundamental analysis',
    'stock market education',
    'investing for beginners',
    'stock analysis tutorial',
    'DCF valuation guide',
  ],
  openGraph: {
    title: 'Learn Stock Investing - Complete Educational Guide',
    description: 'Master stock analysis and investing with our comprehensive guides.',
    type: 'website',
    url: `${SITE_URL}/learn`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn`,
  },
}

const learningTopics = [
  {
    title: 'How to Invest in Stocks',
    description: 'Complete beginner\'s guide to investing in the stock market',
    href: '/learn/how-to-invest',
    icon: '🎯',
    topics: ['Opening accounts', 'Picking stocks', 'Building portfolios'],
    difficulty: 'Beginner',
    badge: 'Start Here',
  },
  {
    title: 'Stock Analysis Fundamentals',
    description: 'Learn how to analyze stocks like a professional investor',
    href: '/learn/stock-analysis',
    icon: '📊',
    topics: ['Financial statements', 'Valuation metrics', 'Industry analysis'],
    difficulty: 'Beginner',
  },
  {
    title: 'DCF Valuation',
    description: 'Master discounted cash flow valuation to find intrinsic value',
    href: '/learn/dcf-valuation',
    icon: '🧮',
    topics: ['Cash flow projections', 'WACC', 'Terminal value'],
    difficulty: 'Intermediate',
  },
  {
    title: 'Understanding P/E Ratios',
    description: 'Learn how to use price-to-earnings ratios for stock valuation',
    href: '/learn/pe-ratio',
    icon: '📈',
    topics: ['Trailing vs forward P/E', 'Industry comparisons', 'Growth-adjusted P/E'],
    difficulty: 'Beginner',
  },
  {
    title: 'Dividend Investing',
    description: 'Build passive income through dividend-paying stocks',
    href: '/learn/dividend-investing',
    icon: '💰',
    topics: ['Dividend yield', 'Payout ratios', 'Dividend aristocrats'],
    difficulty: 'Beginner',
  },
  {
    title: 'AI Stock Analysis',
    description: 'How AI analyzes thousands of data points to find opportunities',
    href: '/learn/ai-stock-analysis',
    icon: '🤖',
    topics: ['Machine learning', 'Pattern recognition', 'Sentiment analysis'],
    difficulty: 'Advanced',
    badge: 'Exclusive',
  },
]

const faqs = [
  {
    question: 'What is the best way to learn stock investing?',
    answer: 'The best approach combines theoretical knowledge with practical application. Start with fundamentals (understanding financial statements, valuation metrics), then practice analyzing real companies. Use paper trading to test strategies before investing real money. Focus on long-term wealth building rather than quick profits.',
  },
  {
    question: 'How long does it take to learn stock analysis?',
    answer: 'Basic stock analysis can be learned in 2-4 weeks of focused study. However, mastering advanced techniques like DCF valuation, competitive analysis, and industry dynamics takes 6-12 months of practice. Continuous learning is essential as markets and companies evolve.',
  },
  {
    question: 'Do I need to be good at math to analyze stocks?',
    answer: 'Basic arithmetic and understanding percentages are sufficient for most stock analysis. While advanced techniques like DCF valuation involve more complex calculations, modern tools (like Lician) handle the math automatically. Focus on understanding the concepts and what the numbers mean.',
  },
  {
    question: 'What is fundamental analysis vs technical analysis?',
    answer: 'Fundamental analysis evaluates a company\'s intrinsic value by examining financial statements, competitive position, and growth prospects. Technical analysis studies price charts and patterns to predict future movements. For long-term investing, fundamental analysis is generally more important.',
  },
  {
    question: 'How can AI help with stock analysis?',
    answer: 'AI can process thousands of data points simultaneously, identify patterns humans might miss, analyze sentiment from news and social media, and backtest strategies across decades of data. AI excels at screening stocks and highlighting opportunities, but human judgment remains crucial for final investment decisions.',
  },
]

export default function LearnPage() {
  const pageUrl = `${SITE_URL}/learn`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Complete Guide to Stock Investing & Analysis',
    description: 'Comprehensive educational resources for learning stock analysis, valuation, and investing strategies.',
    url: pageUrl,
    keywords: ['stock investing', 'stock analysis', 'financial education', 'investing guide'],
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            {' / '}
            <span>Learn</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Master Stock Investing & Analysis
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Free, comprehensive guides to help you analyze stocks like a professional investor.
              Learn valuation techniques, fundamental analysis, and how AI is revolutionizing stock research.
            </p>
          </div>

          {/* Learning Topics Grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Learning Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningTopics.map((topic) => (
                <Link
                  key={topic.href}
                  href={topic.href}
                  className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{topic.icon}</div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {topic.difficulty}
                      </span>
                      {topic.badge && (
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded">
                          {topic.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {topic.description}
                  </p>
                  <ul className="space-y-1">
                    {topic.topics.map((item, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="text-green-500">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          </section>

          {/* Why Learn Stock Analysis */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Why Learn Stock Analysis?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">
                  Make Informed Decisions
                </h3>
                <p className="text-muted-foreground">
                  Understanding stock analysis helps you evaluate opportunities objectively,
                  avoiding emotional decisions and hype-driven mistakes that destroy wealth.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">
                  Find Undervalued Stocks
                </h3>
                <p className="text-muted-foreground">
                  Learn to identify stocks trading below their intrinsic value using
                  valuation techniques employed by successful investors like Warren Buffett.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">
                  Build Long-Term Wealth
                </h3>
                <p className="text-muted-foreground">
                  Quality stock analysis enables you to build a portfolio of great companies
                  at fair prices, compounding wealth over decades rather than gambling on trends.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3">
                  Avoid Costly Mistakes
                </h3>
                <p className="text-muted-foreground">
                  Understanding fundamentals helps you recognize red flags like deteriorating
                  margins, unsustainable debt, or accounting irregularities before they crater.
                </p>
              </div>
            </div>
          </section>

          {/* Learning Path */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Recommended Learning Path</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">
                      <Link href="/learn/how-to-invest" className="hover:text-green-500">
                        Start with How to Invest in Stocks
                      </Link>
                    </h3>
                    <p className="text-muted-foreground">
                      Learn the absolute basics: opening accounts, placing orders, building portfolios, and avoiding beginner mistakes.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Master Stock Analysis Fundamentals</h3>
                    <p className="text-muted-foreground">
                      Learn to read financial statements, understand key metrics, and evaluate business quality.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Understand P/E Ratios and Valuation Multiples</h3>
                    <p className="text-muted-foreground">
                      Master relative valuation and how to compare stocks within industries.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Learn DCF Valuation</h3>
                    <p className="text-muted-foreground">
                      Calculate intrinsic value using discounted cash flow analysis - the gold standard for valuation.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Explore Specialized Strategies</h3>
                    <p className="text-muted-foreground">
                      Deep dive into dividend investing, growth investing, or other strategies that match your goals.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Leverage AI for Enhanced Analysis</h3>
                    <p className="text-muted-foreground">
                      Understand how AI can process vast amounts of data to complement your analysis and find opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border"
                >
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Start Analyzing Stocks?
            </h2>
            <p className="text-muted-foreground mb-6">
              Apply what you learn with our AI-powered stock analysis platform.
              Get instant DCF valuations, financial analysis, and investment insights.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Start Free Analysis
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
