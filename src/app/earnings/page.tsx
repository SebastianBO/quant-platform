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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar - hidden on mobile, shown on lg+ */}
            <div className="hidden lg:block">
              <SEOSidebar />
            </div>
            <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav className="text-sm text-[#868f97] mb-4 sm:mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150">
              Home
            </Link>
            {' / '}
            <span className="text-white">Earnings Calendar</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              Earnings Calendar 2025
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#868f97] max-w-3xl">
              Track upcoming earnings reports for the next 2 weeks. View earnings dates,
              EPS estimates, actual results, and earnings surprises for all publicly traded companies.
            </p>
          </div>

          {/* Main Calendar Component */}
          <EarningsCalendarClient />

          {/* What is Earnings Season Section */}
          <section className="mt-12 sm:mt-16 mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Understanding Earnings Season
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-4 sm:p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#4ebe96]">
                  What Happens During Earnings
                </h3>
                <p className="text-sm sm:text-base text-[#868f97] mb-4">
                  Companies report their financial results quarterly, revealing revenue, net income,
                  earnings per share (EPS), and future guidance. These reports drive major stock
                  price movements as investors react to whether results beat, meet, or miss expectations.
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-[#868f97] space-y-2">
                  <li>Revenue and earnings performance</li>
                  <li>Comparison to analyst estimates</li>
                  <li>Forward guidance and outlook</li>
                  <li>CEO commentary on business trends</li>
                </ul>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] p-4 sm:p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#4ebe96]">
                  Earnings Calendar Features
                </h3>
                <p className="text-sm sm:text-base text-[#868f97] mb-4">
                  Our earnings calendar provides comprehensive data to help you track and analyze
                  earnings reports effectively:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-[#868f97] space-y-2">
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
          <section className="mb-8 sm:mb-12 bg-white/[0.03] backdrop-blur-[10px] p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/[0.08]">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              How to Use This Earnings Calendar
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4ebe96] text-white flex items-center justify-center font-bold text-sm sm:text-base">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-2">Browse by Date</h3>
                  <p className="text-sm sm:text-base text-[#868f97]">
                    Earnings are organized by date for the next 2 weeks. Each day shows companies
                    reporting before market open (BMO) and after market close (AMC).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4ebe96] text-white flex items-center justify-center font-bold text-sm sm:text-base">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-2">Filter by Your Interests</h3>
                  <p className="text-sm sm:text-base text-[#868f97]">
                    Use filters to focus on specific market caps (large, mid, small cap) or sectors
                    (technology, healthcare, finance, etc.) to find relevant earnings reports.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4ebe96] text-white flex items-center justify-center font-bold text-sm sm:text-base">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-2">Review Estimates and Results</h3>
                  <p className="text-sm sm:text-base text-[#868f97]">
                    Check analyst EPS estimates before earnings are released. After the report,
                    see actual results and the earnings surprise percentage (beat or miss).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4ebe96] text-white flex items-center justify-center font-bold text-sm sm:text-base">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-2">Click for Detailed Analysis</h3>
                  <p className="text-sm sm:text-base text-[#868f97]">
                    Each company ticker is clickable and leads to our comprehensive stock analysis page
                    with AI-powered insights, fundamentals, valuation metrics, and more.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Trading Around Earnings */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Trading Strategies Around Earnings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-4 sm:p-6 rounded-2xl border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl mb-3">📊</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Hold Through Earnings</h3>
                <p className="text-sm sm:text-base text-[#868f97]">
                  Long-term investors often hold positions through earnings if they believe in the
                  company&apos;s fundamentals, accepting short-term volatility for long-term gains.
                </p>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] p-4 sm:p-6 rounded-2xl border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl mb-3">⚡</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Play the Momentum</h3>
                <p className="text-sm sm:text-base text-[#868f97]">
                  Active traders may buy stocks with positive momentum leading into earnings,
                  expecting continued strength if the company beats estimates.
                </p>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] p-4 sm:p-6 rounded-2xl border border-white/[0.08]">
                <div className="text-2xl sm:text-3xl mb-3">🎯</div>
                <h3 className="text-base sm:text-lg font-bold mb-2">Wait and React</h3>
                <p className="text-sm sm:text-base text-[#868f97]">
                  Conservative investors wait for earnings results before making decisions,
                  using actual data to enter positions with more certainty.
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics Explained */}
          <section className="mb-8 sm:mb-12 bg-white/[0.03] backdrop-blur-[10px] p-4 sm:p-6 lg:p-8 rounded-2xl border border-white/[0.08]">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Key Earnings Metrics Explained
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">Earnings Per Share (EPS)</h3>
                <p className="text-sm sm:text-base text-[#868f97] mb-4">
                  EPS is a company&apos;s net profit divided by outstanding shares. It&apos;s the most
                  watched earnings metric. Higher EPS generally indicates better profitability.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">EPS Estimate</h3>
                <p className="text-sm sm:text-base text-[#868f97] mb-4">
                  The consensus analyst prediction for what a company will report. It&apos;s averaged
                  from multiple Wall Street analysts who cover the stock.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">Earnings Surprise</h3>
                <p className="text-sm sm:text-base text-[#868f97] mb-4">
                  The percentage difference between actual EPS and estimated EPS. A +10% surprise
                  means the company beat estimates by 10%.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">Revenue</h3>
                <p className="text-sm sm:text-base text-[#868f97] mb-4">
                  Total sales the company generated. Revenue growth is crucial even if a company
                  isn&apos;t profitable yet, especially for growth stocks.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">Guidance</h3>
                <p className="text-sm sm:text-base text-[#868f97] mb-4">
                  The company&apos;s forecast for future quarters or the full year. Raised guidance
                  is bullish; lowered guidance is bearish.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#4ebe96] mb-2 text-sm sm:text-base">Beat Rate</h3>
                <p className="text-sm sm:text-base text-[#868f97] mb-4">
                  The percentage of companies that beat analyst estimates. During strong earnings
                  seasons, beat rates exceed 70%.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {earningsFAQs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-white/[0.03] backdrop-blur-[10px] p-4 sm:p-6 rounded-2xl border border-white/[0.08] group"
                >
                  <summary className="text-base sm:text-lg font-bold cursor-pointer list-none flex items-center justify-between gap-4">
                    <span className="flex-1">{faq.question}</span>
                    <span className="text-[#4ebe96] group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-150 ease-out flex-shrink-0">
                      ▼
                    </span>
                  </summary>
                  <p className="text-sm sm:text-base text-[#868f97] mt-3 sm:mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Links */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              Related Stock Research Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Link
                href="/markets/top-gainers"
                className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:border-[#4ebe96]/50 motion-safe:transition-all motion-safe:duration-150 ease-out group"
              >
                <div className="text-xl sm:text-2xl mb-2">📈</div>
                <h3 className="font-bold group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out text-sm sm:text-base">
                  Top Gainers
                </h3>
                <p className="text-xs sm:text-sm text-[#868f97]">
                  Biggest price movers up
                </p>
              </Link>

              <Link
                href="/markets/most-active"
                className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:border-[#4ebe96]/50 motion-safe:transition-all motion-safe:duration-150 ease-out group"
              >
                <div className="text-xl sm:text-2xl mb-2">📊</div>
                <h3 className="font-bold group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out text-sm sm:text-base">
                  Most Active
                </h3>
                <p className="text-xs sm:text-sm text-[#868f97]">
                  Highest volume stocks
                </p>
              </Link>

              <Link
                href="/sectors"
                className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:border-[#4ebe96]/50 motion-safe:transition-all motion-safe:duration-150 ease-out group"
              >
                <div className="text-xl sm:text-2xl mb-2">🏢</div>
                <h3 className="font-bold group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out text-sm sm:text-base">
                  Sectors
                </h3>
                <p className="text-xs sm:text-sm text-[#868f97]">
                  Browse by industry
                </p>
              </Link>

              <Link
                href="/dashboard"
                className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:border-[#4ebe96]/50 motion-safe:transition-all motion-safe:duration-150 ease-out group"
              >
                <div className="text-xl sm:text-2xl mb-2">🔍</div>
                <h3 className="font-bold group-hover:text-[#4ebe96] motion-safe:transition-colors motion-safe:duration-150 ease-out text-sm sm:text-base">
                  Stock Analysis
                </h3>
                <p className="text-xs sm:text-sm text-[#868f97]">
                  AI-powered research
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-[#4ebe96] to-[#4ebe96] p-6 sm:p-8 lg:p-12 rounded-2xl text-white text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
              Get AI-Powered Stock Analysis
            </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 opacity-90 max-w-2xl mx-auto">
              Access detailed fundamental analysis, DCF valuations, earnings analysis,
              and AI insights for any stock in the market.
            </p>
            <Link
              href="/dashboard"
              className="inline-block w-full sm:w-auto bg-white text-[#4ebe96] hover:bg-gray-100 px-6 sm:px-8 py-3 rounded-2xl font-bold motion-safe:transition-colors motion-safe:duration-150 ease-out"
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
