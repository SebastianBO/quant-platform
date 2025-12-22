import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'
import EarningsCalendarClient from './EarningsCalendarClient'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Earnings Calendar 2025 - Upcoming Earnings Reports & Dates',
  description: 'View the upcoming earnings calendar with all company earnings reports for the next 2 weeks. Track earnings dates, EPS estimates, actual results, and earnings surprises for stocks.',
  keywords: [
    'earnings calendar',
    'upcoming earnings',
    'earnings today',
    'earnings this week',
    'earnings reports',
    'quarterly earnings',
    'earnings dates',
    'EPS estimates',
    'earnings season',
    'company earnings',
    'stock earnings',
    'earnings announcements',
  ],
  openGraph: {
    title: 'Earnings Calendar - Track Upcoming Earnings Reports',
    description: 'Complete earnings calendar showing all upcoming company earnings reports, dates, and EPS estimates.',
    type: 'website',
    url: 'https://lician.com/earnings',
  },
  alternates: {
    canonical: 'https://lician.com/earnings',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Earnings Calendar - Upcoming Earnings Reports',
    description: 'Track upcoming earnings reports, dates, and EPS estimates for all stocks.',
  },
}

const earningsFAQs = [
  {
    question: 'What is an earnings calendar?',
    answer: 'An earnings calendar is a schedule showing when publicly traded companies are expected to release their quarterly or annual earnings reports. It includes the earnings date, estimated earnings per share (EPS), and whether the report is released before market open (BMO) or after market close (AMC). Investors use earnings calendars to track upcoming reports and prepare for potential stock price volatility.',
  },
  {
    question: 'Why are earnings reports important for investors?',
    answer: 'Earnings reports are crucial because they reveal a company\'s actual financial performance, including revenue, net income, and earnings per share. These reports can significantly impact stock prices, especially if results differ from analyst estimates. Positive earnings surprises often drive stock prices higher, while earnings misses can lead to sharp declines. Earnings also provide insights into company guidance and future prospects.',
  },
  {
    question: 'What does "earnings today" mean?',
    answer: 'Earnings today refers to companies reporting their quarterly or annual financial results on the current trading day. Companies can report earnings before the market opens (pre-market or BMO) or after the market closes (after-hours or AMC). Knowing which companies report earnings today helps investors prepare for potential price movements and make informed trading decisions.',
  },
  {
    question: 'How do I use the earnings calendar?',
    answer: 'Use the earnings calendar to identify which companies are reporting earnings and when. Look for companies in your portfolio or watchlist, note their earnings dates, and review analyst EPS estimates. Pay attention to whether the report is before or after market hours. You can filter by market cap or sector to focus on specific types of companies. Check back regularly as companies report actual results.',
  },
  {
    question: 'What is earnings season?',
    answer: 'Earnings season is the period when most publicly traded companies report their quarterly results. It typically begins 1-2 weeks after the end of each fiscal quarter (January, April, July, October) and lasts about 4-6 weeks. During earnings season, hundreds of companies report each week, creating increased market volatility and trading opportunities.',
  },
  {
    question: 'What is an earnings surprise?',
    answer: 'An earnings surprise occurs when a company\'s reported earnings per share (EPS) differs from analyst consensus estimates. A positive surprise (beating estimates) typically drives the stock price up, while a negative surprise (missing estimates) usually causes the stock to fall. The surprise percentage shows how much actual earnings exceeded or fell short of expectations.',
  },
  {
    question: 'What does BMO and AMC mean in earnings reports?',
    answer: 'BMO stands for "Before Market Open" and AMC stands for "After Market Close." These indicate when a company releases its earnings report. BMO earnings are typically released between 6:00-9:00 AM ET before the market opens at 9:30 AM. AMC earnings are released after 4:00 PM ET when the market closes. The timing affects when investors can trade on the news.',
  },
  {
    question: 'Should I buy or sell stocks before earnings?',
    answer: 'Trading around earnings is risky due to high volatility. Many experienced investors avoid opening new positions right before earnings due to uncertainty. However, some strategies include: 1) Holding long-term positions through earnings if you believe in the company, 2) Reducing position size to manage risk, 3) Using options for defined-risk trades, or 4) Waiting until after the report to make decisions with more information.',
  },
  {
    question: 'How accurate are earnings estimates?',
    answer: 'Earnings estimates are analyst predictions and can vary in accuracy. Companies sometimes provide guidance, which helps analysts make more accurate predictions. However, unexpected events, market conditions, or operational changes can cause actual results to differ significantly. Consensus estimates (averaging multiple analysts) tend to be more reliable than individual predictions. Always check the estimate range and number of analysts.',
  },
  {
    question: 'Where can I see earnings this week?',
    answer: 'Our earnings calendar displays all upcoming earnings for the current week and next week. You can see earnings grouped by date, showing which companies report Monday through Friday. Filter by "This Week" to focus on the next 5 trading days. Each listing shows the company ticker, name, earnings date, timing (BMO/AMC), and EPS estimates.',
  },
]

export default function EarningsPage() {
  const pageUrl = `${SITE_URL}/earnings`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Earnings Calendar', url: pageUrl },
  ])

  const faqSchema = getFAQSchema(earningsFAQs)

  // Get current date for Event schema
  const today = new Date()
  const twoWeeksLater = new Date(today)
  twoWeeksLater.setDate(today.getDate() + 14)

  // Event schema for the earnings calendar as a whole
  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Earnings Calendar - Upcoming Company Earnings Reports',
    description: 'Track upcoming earnings reports for the next 2 weeks including earnings dates, EPS estimates, and actual results for all publicly traded companies.',
    startDate: today.toISOString(),
    endDate: twoWeeksLater.toISOString(),
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: pageUrl,
    },
    organizer: {
      '@type': 'Organization',
      name: 'Lician',
      url: SITE_URL,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, eventSchema, faqSchema]),
        }}
      />
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-foreground">Earnings Calendar</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Earnings Calendar 2025
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
              Track upcoming earnings reports for the next 2 weeks. View earnings dates,
              EPS estimates, actual results, and earnings surprises for all publicly traded companies.
            </p>
          </div>

          {/* Main Calendar Component */}
          <EarningsCalendarClient />

          {/* What is Earnings Season Section */}
          <section className="mt-16 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Understanding Earnings Season
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  What Happens During Earnings
                </h3>
                <p className="text-muted-foreground mb-4">
                  Companies report their financial results quarterly, revealing revenue, net income,
                  earnings per share (EPS), and future guidance. These reports drive major stock
                  price movements as investors react to whether results beat, meet, or miss expectations.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Revenue and earnings performance</li>
                  <li>Comparison to analyst estimates</li>
                  <li>Forward guidance and outlook</li>
                  <li>CEO commentary on business trends</li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Earnings Calendar Features
                </h3>
                <p className="text-muted-foreground mb-4">
                  Our earnings calendar provides comprehensive data to help you track and analyze
                  earnings reports effectively:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Next 2 weeks of earnings dates</li>
                  <li>Before market (BMO) and after market (AMC) timing</li>
                  <li>EPS estimates and actual results</li>
                  <li>Earnings surprises and beat/miss rates</li>
                  <li>Filter by market cap and sector</li>
                  <li>Direct links to detailed stock analysis</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Use the Earnings Calendar */}
          <section className="mb-12 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              How to Use This Earnings Calendar
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Browse by Date</h3>
                  <p className="text-muted-foreground">
                    Earnings are organized by date for the next 2 weeks. Each day shows companies
                    reporting before market open (BMO) and after market close (AMC).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Filter by Your Interests</h3>
                  <p className="text-muted-foreground">
                    Use filters to focus on specific market caps (large, mid, small cap) or sectors
                    (technology, healthcare, finance, etc.) to find relevant earnings reports.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Review Estimates and Results</h3>
                  <p className="text-muted-foreground">
                    Check analyst EPS estimates before earnings are released. After the report,
                    see actual results and the earnings surprise percentage (beat or miss).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Click for Detailed Analysis</h3>
                  <p className="text-muted-foreground">
                    Each company ticker is clickable and leads to our comprehensive stock analysis page
                    with AI-powered insights, fundamentals, valuation metrics, and more.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Trading Around Earnings */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Trading Strategies Around Earnings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-2">Hold Through Earnings</h3>
                <p className="text-muted-foreground text-sm">
                  Long-term investors often hold positions through earnings if they believe in the
                  company&apos;s fundamentals, accepting short-term volatility for long-term gains.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="text-lg font-bold mb-2">Play the Momentum</h3>
                <p className="text-muted-foreground text-sm">
                  Active traders may buy stocks with positive momentum leading into earnings,
                  expecting continued strength if the company beats estimates.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="text-lg font-bold mb-2">Wait and React</h3>
                <p className="text-muted-foreground text-sm">
                  Conservative investors wait for earnings results before making decisions,
                  using actual data to enter positions with more certainty.
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics Explained */}
          <section className="mb-12 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Key Earnings Metrics Explained
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-green-500 mb-2">Earnings Per Share (EPS)</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  EPS is a company&apos;s net profit divided by outstanding shares. It&apos;s the most
                  watched earnings metric. Higher EPS generally indicates better profitability.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-green-500 mb-2">EPS Estimate</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  The consensus analyst prediction for what a company will report. It&apos;s averaged
                  from multiple Wall Street analysts who cover the stock.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-green-500 mb-2">Earnings Surprise</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  The percentage difference between actual EPS and estimated EPS. A +10% surprise
                  means the company beat estimates by 10%.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-green-500 mb-2">Revenue</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Total sales the company generated. Revenue growth is crucial even if a company
                  isn&apos;t profitable yet, especially for growth stocks.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-green-500 mb-2">Guidance</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  The company&apos;s forecast for future quarters or the full year. Raised guidance
                  is bullish; lowered guidance is bearish.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-green-500 mb-2">Beat Rate</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  The percentage of companies that beat analyst estimates. During strong earnings
                  seasons, beat rates exceed 70%.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {earningsFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-card p-6 rounded-xl border border-border group"
                >
                  <summary className="text-lg font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-green-500 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Related Stock Research Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/markets/top-gainers"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Top Gainers
                </h3>
                <p className="text-sm text-muted-foreground">
                  Biggest price movers up
                </p>
              </Link>

              <Link
                href="/markets/most-active"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Most Active
                </h3>
                <p className="text-sm text-muted-foreground">
                  Highest volume stocks
                </p>
              </Link>

              <Link
                href="/sectors"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Sectors
                </h3>
                <p className="text-sm text-muted-foreground">
                  Browse by industry
                </p>
              </Link>

              <Link
                href="/dashboard"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Stock Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered research
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 sm:p-12 rounded-xl text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Get AI-Powered Stock Analysis
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Access detailed fundamental analysis, DCF valuations, earnings analysis,
              and AI insights for any stock in the market.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Start Analyzing Stocks Free
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
