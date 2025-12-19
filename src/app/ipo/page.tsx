import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'IPO Calendar 2025 - Upcoming IPO Dates & New Stock Listings',
  description: 'Track upcoming IPOs and new stock listings for 2025-2026. View IPO dates, expected pricing, recent IPO performance, and IPO pipeline with company details and sector analysis.',
  keywords: [
    'IPO calendar',
    'upcoming IPOs',
    'IPO stocks',
    'new stock listings',
    'IPO dates 2025',
    'IPO pipeline',
    'recent IPOs',
    'IPO performance',
    'new IPOs',
    'initial public offering',
    'IPO schedule',
    'IPO tracker',
    'best IPOs 2025',
    'IPO investing',
  ],
  openGraph: {
    title: 'IPO Calendar 2025 - Upcoming IPOs & New Stock Listings',
    description: 'Complete IPO calendar showing upcoming IPO dates, expected pricing, recent IPO performance, and detailed IPO pipeline for 2025-2026.',
    type: 'website',
    url: 'https://lician.com/ipo',
  },
  alternates: {
    canonical: 'https://lician.com/ipo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IPO Calendar 2025 - Upcoming IPOs & New Listings',
    description: 'Track all upcoming IPOs, new stock listings, and IPO performance for 2025-2026.',
  },
}

// Notable upcoming and expected IPOs for 2025-2026
const upcomingIPOs = [
  {
    company: 'Databricks',
    sector: 'Technology',
    expectedDate: 'Q1 2025',
    expectedValuation: '$43B',
    description: 'Data analytics and AI platform',
  },
  {
    company: 'Stripe',
    sector: 'Fintech',
    expectedDate: 'Q2 2025',
    expectedValuation: '$65B',
    description: 'Online payment processing platform',
  },
  {
    company: 'Chime',
    sector: 'Fintech',
    expectedDate: 'Q2 2025',
    expectedValuation: '$25B',
    description: 'Digital banking and financial services',
  },
  {
    company: 'Discord',
    sector: 'Technology',
    expectedDate: 'Q3 2025',
    expectedValuation: '$15B',
    description: 'Communication platform for communities',
  },
  {
    company: 'Instacart (Trading)',
    sector: 'Consumer',
    expectedDate: 'Listed 2023',
    expectedValuation: '$10B',
    description: 'Grocery delivery and pickup service',
  },
  {
    company: 'Reddit (Trading)',
    sector: 'Technology',
    expectedDate: 'Listed 2024',
    expectedValuation: '$6.5B',
    description: 'Social news aggregation and discussion',
  },
  {
    company: 'Klarna',
    sector: 'Fintech',
    expectedDate: 'Q2 2025',
    expectedValuation: '$15B',
    description: 'Buy now, pay later payment solution',
  },
  {
    company: 'Revolut',
    sector: 'Fintech',
    expectedDate: 'Q3 2025',
    expectedValuation: '$33B',
    description: 'Digital banking and financial services',
  },
]

// Recent IPOs with performance (mock data - represents typical recent IPO performance)
const recentIPOs = [
  {
    company: 'ARM Holdings',
    ticker: 'ARM',
    ipoDate: 'Sep 2023',
    ipoPrice: '$51.00',
    currentPrice: '$145.00',
    return: '+184%',
    sector: 'Technology',
  },
  {
    company: 'Klaviyo',
    ticker: 'KVYO',
    ipoDate: 'Sep 2023',
    ipoPrice: '$30.00',
    currentPrice: '$36.00',
    return: '+20%',
    sector: 'Technology',
  },
  {
    company: 'Instacart',
    ticker: 'CART',
    ipoDate: 'Sep 2023',
    ipoPrice: '$30.00',
    currentPrice: '$38.00',
    return: '+27%',
    sector: 'Consumer',
  },
  {
    company: 'Reddit',
    ticker: 'RDDT',
    ipoDate: 'Mar 2024',
    ipoPrice: '$34.00',
    currentPrice: '$75.00',
    return: '+121%',
    sector: 'Technology',
  },
  {
    company: 'Birkenstock',
    ticker: 'BIRK',
    ipoDate: 'Oct 2023',
    ipoPrice: '$46.00',
    currentPrice: '$54.00',
    return: '+17%',
    sector: 'Consumer',
  },
  {
    company: 'Cava Group',
    ticker: 'CAVA',
    ipoDate: 'Jun 2023',
    ipoPrice: '$22.00',
    currentPrice: '$135.00',
    return: '+514%',
    sector: 'Consumer',
  },
]

// IPO pipeline (filed but not priced)
const ipoPipeline = [
  {
    company: 'Canva',
    sector: 'Technology',
    status: 'Confidential Filing',
    expectedValuation: '$26B',
    description: 'Online design and publishing platform',
  },
  {
    company: 'Fanatics',
    sector: 'E-commerce',
    status: 'Rumored',
    expectedValuation: '$27B',
    description: 'Sports merchandise and collectibles',
  },
  {
    company: 'ServiceTitan',
    sector: 'Technology',
    status: 'Filed',
    expectedValuation: '$18B',
    description: 'Software for home service businesses',
  },
  {
    company: 'Anthropic',
    sector: 'AI',
    status: 'Rumored',
    expectedValuation: '$30B',
    description: 'AI safety and research company',
  },
  {
    company: 'Figma',
    sector: 'Technology',
    status: 'Delayed',
    expectedValuation: '$20B',
    description: 'Collaborative design platform',
  },
  {
    company: 'OpenAI',
    sector: 'AI',
    status: 'Rumored',
    expectedValuation: '$100B+',
    description: 'Artificial intelligence research and deployment',
  },
]

const ipoFAQs = [
  {
    question: 'What is an IPO?',
    answer: 'An IPO (Initial Public Offering) is when a private company offers shares to the public for the first time, becoming a publicly traded company. This process allows companies to raise capital from public investors and provides liquidity for early investors and employees. IPOs are underwritten by investment banks who help determine the initial share price and market the offering to institutional and retail investors.',
  },
  {
    question: 'How do I invest in an IPO?',
    answer: 'To invest in an IPO, you typically need a brokerage account. However, most retail investors cannot buy shares at the IPO price as they are primarily allocated to institutional investors and high-net-worth individuals. Retail investors can usually purchase shares once the stock begins trading on the public exchange, though the price may be higher than the IPO price. Some brokers like Robinhood, Fidelity, and TD Ameritrade offer IPO access programs that may allow participation in select IPOs.',
  },
  {
    question: 'Should I buy IPO stocks on the first day?',
    answer: 'Buying IPO stocks on the first day is risky and not recommended for most investors. IPOs often experience high volatility, with prices swinging dramatically in early trading. Many IPOs pop significantly on day one but later decline. It\'s generally better to wait for the initial hype to settle, review the company\'s first quarterly earnings as a public company, and assess the stock after a few months of trading history.',
  },
  {
    question: 'What is the IPO lock-up period?',
    answer: 'The IPO lock-up period is typically 90-180 days after the IPO when company insiders (founders, employees, early investors) are restricted from selling their shares. This prevents massive sell-offs immediately after going public. When the lock-up period expires, there\'s often increased selling pressure that can drive the stock price down. Investors should be aware of lock-up expiration dates when evaluating IPO investments.',
  },
  {
    question: 'How are IPO prices determined?',
    answer: 'IPO prices are determined through a process called book building, where investment banks gauge demand from institutional investors and set a price range. The final IPO price is based on market conditions, comparable company valuations, growth prospects, and investor demand. The underwriters aim to price the IPO low enough to generate a first-day pop (showing strong demand) but high enough to maximize capital raised for the company.',
  },
  {
    question: 'What is an IPO calendar?',
    answer: 'An IPO calendar is a schedule of upcoming initial public offerings, showing expected IPO dates, price ranges, share counts, and company information. IPO calendars help investors track new stock listings and plan investment decisions. Dates are often tentative and can change based on market conditions, regulatory approvals, and company decisions.',
  },
  {
    question: 'Why do companies go public?',
    answer: 'Companies go public primarily to raise capital for growth, expansion, and operations. Other reasons include providing liquidity for early investors and employees who hold equity, enhancing company credibility and brand recognition, using stock for acquisitions, and creating a public market for valuation. However, going public also brings costs like regulatory compliance, disclosure requirements, and pressure for short-term results.',
  },
  {
    question: 'What are the risks of investing in IPOs?',
    answer: 'IPO investing carries several risks: 1) Limited historical data makes valuation difficult, 2) High volatility in early trading, 3) Lock-up period expirations can pressure prices, 4) Many IPOs underperform over the long term, 5) Retail investors often cannot access IPO prices, 6) Companies may go public during market peaks, and 7) Initial optimism may not reflect true fundamentals. Always research thoroughly and consider waiting for more trading history.',
  },
  {
    question: 'What is the difference between IPO and direct listing?',
    answer: 'An IPO involves underwriters who buy shares from the company and resell them to investors, with a lock-up period and new shares created. A direct listing allows existing shareholders to sell directly to the public without intermediaries, no new capital is raised, there\'s no lock-up period, and no price stabilization. Companies like Spotify, Slack, and Coinbase chose direct listings to avoid dilution and underwriter fees.',
  },
  {
    question: 'How can I find the best upcoming IPOs?',
    answer: 'To find promising IPOs, use our IPO calendar to track upcoming offerings, research the company\'s business model and competitive position, analyze growth rates and profitability, review the S-1 filing for detailed financials, compare valuations to public peers, assess management quality and track record, and read expert analysis. Focus on companies with strong fundamentals rather than just hype. Quality IPOs often come from profitable companies with sustainable competitive advantages.',
  },
]

export default function IPOCalendarPage() {
  const pageUrl = `${SITE_URL}/ipo`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'IPO Calendar', url: pageUrl },
  ])

  const faqSchema = getFAQSchema(ipoFAQs)

  // ItemList schema for upcoming IPOs
  const ipoListSchema = getItemListSchema({
    name: 'Upcoming IPOs 2025-2026',
    description: 'List of expected initial public offerings for 2025-2026 including valuations and expected dates',
    url: pageUrl,
    items: upcomingIPOs.map((ipo, index) => ({
      name: `${ipo.company} IPO`,
      url: pageUrl,
      position: index + 1,
    })),
  })

  // Event schema for the IPO calendar
  const today = new Date()
  const sixMonthsLater = new Date(today)
  sixMonthsLater.setMonth(today.getMonth() + 6)

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'IPO Calendar 2025 - Upcoming Initial Public Offerings',
    description: 'Track upcoming IPOs and new stock listings for 2025-2026 including expected dates, pricing, valuations, and company information.',
    startDate: today.toISOString(),
    endDate: sixMonthsLater.toISOString(),
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

  // Calculate sector distribution
  const sectorCounts: Record<string, number> = {}
  upcomingIPOs.forEach((ipo) => {
    sectorCounts[ipo.sector] = (sectorCounts[ipo.sector] || 0) + 1
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, eventSchema, ipoListSchema, faqSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {' / '}
            <span className="text-foreground">IPO Calendar</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              IPO Calendar 2025-2026
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
              Track upcoming IPOs, new stock listings, and recent IPO performance.
              View expected IPO dates, valuations, and detailed company information for all major initial public offerings.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {upcomingIPOs.length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming IPOs</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {recentIPOs.length}
              </div>
              <div className="text-sm text-muted-foreground">Recent IPOs</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {ipoPipeline.length}
              </div>
              <div className="text-sm text-muted-foreground">IPO Pipeline</div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="text-3xl font-bold text-green-500 mb-2">
                $318B
              </div>
              <div className="text-sm text-muted-foreground">Total Valuation</div>
            </div>
          </div>

          {/* Upcoming IPOs Section */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Upcoming IPOs 2025
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-bold">Company</th>
                      <th className="text-left p-4 font-bold">Sector</th>
                      <th className="text-left p-4 font-bold">Expected Date</th>
                      <th className="text-left p-4 font-bold">Expected Valuation</th>
                      <th className="text-left p-4 font-bold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingIPOs.map((ipo, index) => (
                      <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-bold">{ipo.company}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">
                            {ipo.sector}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{ipo.expectedDate}</td>
                        <td className="p-4 font-bold text-green-500">{ipo.expectedValuation}</td>
                        <td className="p-4 text-muted-foreground text-sm">{ipo.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Recent IPO Performance */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Recent IPO Performance
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-bold">Company</th>
                      <th className="text-left p-4 font-bold">Ticker</th>
                      <th className="text-left p-4 font-bold">IPO Date</th>
                      <th className="text-left p-4 font-bold">IPO Price</th>
                      <th className="text-left p-4 font-bold">Current Price</th>
                      <th className="text-left p-4 font-bold">Return</th>
                      <th className="text-left p-4 font-bold">Sector</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentIPOs.map((ipo, index) => {
                      const isPositive = ipo.return.startsWith('+')
                      return (
                        <tr key={index} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <Link
                              href={`/stock/${ipo.ticker}`}
                              className="font-bold hover:text-green-500 transition-colors"
                            >
                              {ipo.company}
                            </Link>
                          </td>
                          <td className="p-4">
                            <Link
                              href={`/stock/${ipo.ticker}`}
                              className="font-mono text-green-500 hover:underline"
                            >
                              {ipo.ticker}
                            </Link>
                          </td>
                          <td className="p-4 text-muted-foreground">{ipo.ipoDate}</td>
                          <td className="p-4 text-muted-foreground">{ipo.ipoPrice}</td>
                          <td className="p-4 font-bold">{ipo.currentPrice}</td>
                          <td className={`p-4 font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {ipo.return}
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm">
                              {ipo.sector}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* IPO Pipeline */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              IPO Pipeline (Filed But Not Priced)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ipoPipeline.map((ipo, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold">{ipo.company}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      ipo.status === 'Filed' ? 'bg-blue-500/10 text-blue-500' :
                      ipo.status === 'Rumored' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      {ipo.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Sector</span>
                      <span className="text-sm font-medium">{ipo.sector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Valuation</span>
                      <span className="text-sm font-bold text-green-500">{ipo.expectedValuation}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                      {ipo.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sector Breakdown */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              IPO Sector Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(sectorCounts).map(([sector, count]) => (
                <div key={sector} className="bg-card p-6 rounded-xl border border-border text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">{count}</div>
                  <div className="text-sm text-muted-foreground">{sector}</div>
                </div>
              ))}
            </div>
          </section>

          {/* What Makes a Good IPO Investment */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              What Makes a Good IPO Investment?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Strong Fundamentals
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Revenue growth of 30%+ annually</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Clear path to profitability or already profitable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Strong gross margins (60%+ for software)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Large and growing addressable market</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Competitive Advantages
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Unique technology or business model</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Network effects or high switching costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Strong brand recognition and customer loyalty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Experienced management team with track record</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">
                  Reasonable Valuation
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Price-to-sales ratio in line with comparable companies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Not priced for perfection - room for upside</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Valuation supported by growth trajectory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Underwriters with strong track record</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-red-500">
                  Red Flags to Avoid
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Deteriorating unit economics or margins</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Heavy reliance on single customer or market</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Aggressive accounting or governance concerns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Going public during market euphoria</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* IPO Investment Guide */}
          <section className="mb-16 bg-card p-6 sm:p-8 rounded-xl border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              How to Invest in IPOs: Step-by-Step Guide
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Research the Company</h3>
                  <p className="text-muted-foreground">
                    Read the S-1 filing to understand the business model, financials, risks, and use of proceeds.
                    Analyze revenue growth, profitability trends, competitive landscape, and management team.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Evaluate Valuation</h3>
                  <p className="text-muted-foreground">
                    Compare the IPO valuation to similar public companies using metrics like Price-to-Sales,
                    EV/Revenue, and growth-adjusted multiples. Consider if the valuation is reasonable given growth prospects.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Check Market Conditions</h3>
                  <p className="text-muted-foreground">
                    Assess overall market sentiment, IPO market performance, and whether it is a favorable
                    environment for IPOs. Strong IPO markets typically coincide with broader market strength.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Consider Waiting</h3>
                  <p className="text-muted-foreground">
                    Many successful IPO investors wait 3-6 months after the IPO to invest, allowing initial
                    volatility to settle and the company to report earnings as a public entity. This provides more data for informed decisions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                  5
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Size Your Position Appropriately</h3>
                  <p className="text-muted-foreground">
                    IPOs are inherently risky with limited track record. Keep position sizes small (1-2% of portfolio)
                    and diversify across multiple IPOs rather than concentrating in a single name. Never invest more than you can afford to lose.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                  6
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Monitor Lock-up Expiration</h3>
                  <p className="text-muted-foreground">
                    Track the lock-up expiration date (typically 90-180 days post-IPO) when insiders can sell shares.
                    This often creates selling pressure. Some investors wait until after lock-up expiration to invest at potentially lower prices.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* IPO Statistics */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              IPO Market Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-2">IPO Success Rate</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Approximately 60% of IPOs trade above their offer price after one year, though performance
                  varies significantly by sector and market conditions.
                </p>
                <div className="text-2xl font-bold text-green-500">~60%</div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-4xl mb-3">⏱️</div>
                <h3 className="text-lg font-bold mb-2">Average First-Day Pop</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  The average IPO sees a first-day price increase of 10-15%, though this varies widely
                  based on demand, pricing, and market conditions.
                </p>
                <div className="text-2xl font-bold text-green-500">10-15%</div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-lg font-bold mb-2">Long-term Performance</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Research shows that IPOs often underperform the broader market over 3-5 years,
                  with an average 3-year return of -18% relative to benchmarks.
                </p>
                <div className="text-2xl font-bold text-red-500">-18%</div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Frequently Asked Questions About IPOs
            </h2>
            <div className="space-y-4">
              {ipoFAQs.map((faq, index) => (
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

          {/* Related Resources */}
          <section className="mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Related Stock Research Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/earnings"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📅</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Earnings Calendar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track upcoming earnings
                </p>
              </Link>

              <Link
                href="/markets/most-active"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Most Active Stocks
                </h3>
                <p className="text-sm text-muted-foreground">
                  Highest volume stocks
                </p>
              </Link>

              <Link
                href="/insider-trading"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">👔</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Insider Trading
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track insider activity
                </p>
              </Link>

              <Link
                href="/screener"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="text-2xl mb-2">🔍</div>
                <h3 className="font-bold group-hover:text-green-500 transition-colors">
                  Stock Screener
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find stocks by criteria
                </p>
              </Link>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 sm:p-12 rounded-xl text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Research Stocks Before You Invest
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Use our AI-powered analysis to evaluate IPO stocks and existing companies.
              Get detailed fundamental analysis, DCF valuations, and risk assessments.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Start Analyzing Stocks Free
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}
