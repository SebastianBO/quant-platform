import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { getBreadcrumbSchema, getFAQSchema, SITE_URL } from "@/lib/seo"
import { Calendar, TrendingUp, DollarSign, Users, Building2, AlertCircle, ChevronRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Economic Calendar 2025 - FOMC Meeting Dates, CPI, Jobs Report & Major Events",
  description: "Track major economic events including FOMC meeting dates, Federal Reserve decisions, CPI releases, jobs reports, GDP data, and earnings calendars. Never miss critical market-moving economic indicators.",
  keywords: [
    "economic calendar",
    "fomc meeting dates",
    "fed meeting schedule",
    "federal reserve calendar",
    "jobs report date",
    "cpi release date",
    "unemployment report",
    "gdp release date",
    "earnings calendar",
    "economic events",
    "ppi release",
    "retail sales",
    "inflation data",
    "economic indicators",
    "market moving events",
    "central bank meetings",
    "monetary policy calendar",
    "economic data releases",
    "fed interest rate decision",
    "non farm payrolls"
  ],
  openGraph: {
    title: "Economic Calendar 2025 - FOMC, CPI, Jobs Report & Major Events",
    description: "Track major economic events including FOMC meetings, Federal Reserve decisions, CPI releases, jobs reports, and GDP data.",
    url: `${SITE_URL}/economic-calendar`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Economic Calendar 2025 - Track Major Economic Events",
    description: "Never miss FOMC meetings, CPI releases, jobs reports, and other market-moving economic events.",
  },
  alternates: {
    canonical: `${SITE_URL}/economic-calendar`,
  },
}

// Economic events data with Previous/Expected/Actual
const upcomingEvents = [
  {
    date: "2025-01-10",
    time: "08:30 AM EST",
    event: "Non-Farm Payrolls (NFP)",
    importance: "High",
    country: "US",
    previous: "227K",
    forecast: "150K",
    actual: null,
    category: "Employment",
    description: "Monthly jobs report showing the change in the number of employed people in the US, excluding farm workers.",
    impact: "Major market mover that influences Fed policy decisions and currency markets."
  },
  {
    date: "2025-01-11",
    time: "08:30 AM EST",
    event: "Consumer Price Index (CPI)",
    importance: "High",
    country: "US",
    previous: "2.7%",
    forecast: "2.8%",
    actual: null,
    category: "Inflation",
    description: "Measures the change in prices of goods and services purchased by consumers.",
    impact: "Critical inflation indicator that directly influences Federal Reserve monetary policy decisions."
  },
  {
    date: "2025-01-29",
    time: "02:00 PM EST",
    event: "FOMC Meeting Decision",
    importance: "High",
    country: "US",
    previous: "4.50%",
    forecast: "4.50%",
    actual: null,
    category: "Central Bank",
    description: "Federal Reserve's Federal Open Market Committee announces interest rate decisions and monetary policy stance.",
    impact: "Highest impact event - directly affects borrowing costs, stock valuations, and dollar strength."
  },
  {
    date: "2025-01-30",
    time: "08:30 AM EST",
    event: "GDP Growth Rate (Q4 2024 Advance)",
    importance: "High",
    country: "US",
    previous: "3.1%",
    forecast: "2.6%",
    actual: null,
    category: "Growth",
    description: "Measures the annualized change in the inflation-adjusted value of all goods and services produced.",
    impact: "Primary gauge of economic health and growth momentum."
  },
  {
    date: "2025-02-07",
    time: "08:30 AM EST",
    event: "Unemployment Rate",
    importance: "High",
    country: "US",
    previous: "4.2%",
    forecast: "4.2%",
    actual: null,
    category: "Employment",
    description: "Percentage of total workforce that is unemployed and actively seeking employment.",
    impact: "Key labor market indicator watched closely by the Federal Reserve."
  },
  {
    date: "2025-02-13",
    time: "08:30 AM EST",
    event: "Producer Price Index (PPI)",
    importance: "Medium",
    country: "US",
    previous: "3.0%",
    forecast: "2.8%",
    actual: null,
    category: "Inflation",
    description: "Measures average change in selling prices received by domestic producers.",
    impact: "Leading indicator for consumer inflation - price changes often pass through to consumers."
  },
  {
    date: "2025-02-14",
    time: "08:30 AM EST",
    event: "Retail Sales",
    importance: "Medium",
    country: "US",
    previous: "0.7%",
    forecast: "0.5%",
    actual: null,
    category: "Consumer",
    description: "Measures change in the total value of sales at the retail level.",
    impact: "Key indicator of consumer spending, which drives 70% of US GDP."
  },
  {
    date: "2025-03-19",
    time: "02:00 PM EST",
    event: "FOMC Meeting Decision",
    importance: "High",
    country: "US",
    previous: "4.50%",
    forecast: "4.25%",
    actual: null,
    category: "Central Bank",
    description: "Federal Reserve interest rate decision with updated economic projections and dot plot.",
    impact: "Critical for markets - includes press conference with forward guidance on policy."
  },
  {
    date: "2025-03-28",
    time: "08:30 AM EST",
    event: "Personal Consumption Expenditures (PCE)",
    importance: "High",
    country: "US",
    previous: "2.4%",
    forecast: "2.5%",
    actual: null,
    category: "Inflation",
    description: "Federal Reserve's preferred inflation gauge measuring price changes in consumer goods and services.",
    impact: "Most important inflation metric for the Fed - directly influences rate decisions."
  },
  {
    date: "2025-04-01",
    time: "10:00 AM EST",
    event: "ISM Manufacturing PMI",
    importance: "Medium",
    country: "US",
    previous: "48.4",
    forecast: "49.0",
    actual: null,
    category: "Manufacturing",
    description: "Survey of purchasing managers in the manufacturing sector. Above 50 indicates expansion.",
    impact: "Leading indicator of manufacturing health and overall economic conditions."
  },
]

// FOMC Meeting Schedule for 2025
const fomcMeetings = [
  { date: "January 28-29, 2025", pressConference: true },
  { date: "March 18-19, 2025", pressConference: true },
  { date: "May 6-7, 2025", pressConference: true },
  { date: "June 17-18, 2025", pressConference: true },
  { date: "July 29-30, 2025", pressConference: true },
  { date: "September 16-17, 2025", pressConference: true },
  { date: "November 4-5, 2025", pressConference: true },
  { date: "December 16-17, 2025", pressConference: true },
]

// FAQs about economic indicators
const faqs = [
  {
    question: "What is the economic calendar and why is it important?",
    answer: "An economic calendar is a schedule of key economic data releases, central bank meetings, and major financial events. It's important because these events can significantly impact stock prices, currency values, and bond yields. Traders and investors use economic calendars to anticipate market volatility and make informed decisions."
  },
  {
    question: "When are FOMC meeting dates in 2025?",
    answer: "The Federal Open Market Committee (FOMC) meets eight times per year in 2025: January 28-29, March 18-19, May 6-7, June 17-18, July 29-30, September 16-17, November 4-5, and December 16-17. All meetings include a press conference where the Fed Chair explains policy decisions."
  },
  {
    question: "What is the FOMC and why do FOMC meetings matter?",
    answer: "The Federal Open Market Committee (FOMC) is the monetary policymaking body of the Federal Reserve. FOMC meetings determine interest rates, which affect borrowing costs, stock valuations, currency strength, and economic growth. Rate decisions can trigger significant market movements across all asset classes."
  },
  {
    question: "When is the next jobs report and CPI release?",
    answer: "The Non-Farm Payrolls (jobs report) is typically released on the first Friday of each month at 8:30 AM EST. The Consumer Price Index (CPI) is usually released mid-month around the 10th-15th at 8:30 AM EST. Check our calendar for exact dates as they can vary due to holidays."
  },
  {
    question: "What is CPI and how does it affect the stock market?",
    answer: "The Consumer Price Index (CPI) measures inflation by tracking price changes for consumer goods and services. Higher than expected CPI often leads to stock market declines because it suggests the Federal Reserve may raise interest rates to combat inflation. Lower CPI can boost stocks by reducing rate hike expectations."
  },
  {
    question: "What is the difference between CPI and PCE inflation?",
    answer: "CPI (Consumer Price Index) measures out-of-pocket consumer spending, while PCE (Personal Consumption Expenditures) includes all consumption including employer-paid healthcare. The Federal Reserve prefers PCE as it captures substitution effects and covers broader spending. PCE tends to run slightly lower than CPI."
  },
  {
    question: "How do employment reports impact markets?",
    answer: "Strong job growth typically boosts stocks by signaling economic health but can also increase rate hike expectations. Weak employment data may hurt stocks due to recession fears but could support them by reducing pressure on the Fed to raise rates. The market reaction depends on whether jobs growth is 'too hot' or 'too cold' relative to Fed targets."
  },
  {
    question: "What is Non-Farm Payrolls (NFP) and why is it important?",
    answer: "Non-Farm Payrolls measures the monthly change in US employment excluding farm workers, government employees, and non-profit workers. It's one of the most market-moving indicators because it shows labor market strength, influences Fed policy, and affects consumer spending which drives 70% of GDP."
  },
  {
    question: "When is the GDP report released?",
    answer: "GDP (Gross Domestic Product) is released quarterly in three versions: Advance (one month after quarter ends), Preliminary (two months after), and Final (three months after). For example, Q4 2024 GDP is released in late January 2025 (Advance), late February (Preliminary), and late March (Final)."
  },
  {
    question: "What is GDP and what does it measure?",
    answer: "Gross Domestic Product (GDP) measures the total value of all goods and services produced in an economy. It's the primary indicator of economic health and growth. GDP includes consumer spending, business investment, government spending, and net exports. Strong GDP growth typically supports stock prices."
  },
  {
    question: "How does the Fed use economic data to set interest rates?",
    answer: "The Federal Reserve uses a dual mandate: maximum employment and price stability (2% inflation target). They analyze employment data (jobs reports, unemployment), inflation metrics (CPI, PCE), GDP growth, and other indicators. Strong employment + high inflation typically leads to rate hikes, while weak growth + low inflation leads to rate cuts."
  },
  {
    question: "What is the Producer Price Index (PPI)?",
    answer: "The Producer Price Index (PPI) measures average price changes from the perspective of domestic producers/sellers. It's a leading indicator for consumer inflation because producer cost increases often get passed to consumers. Rising PPI can signal future CPI increases and influence Fed policy expectations."
  },
  {
    question: "What are retail sales and why do they matter?",
    answer: "Retail sales measure the total receipts of retail stores, tracking consumer spending patterns. Since consumer spending accounts for about 70% of US GDP, retail sales are a critical indicator of economic health. Strong retail sales suggest consumer confidence and economic growth."
  },
  {
    question: "What is the ISM Manufacturing PMI?",
    answer: "The Institute for Supply Management (ISM) Manufacturing Purchasing Managers' Index surveys purchasing managers in the manufacturing sector. A reading above 50 indicates expansion, below 50 indicates contraction. It's a leading economic indicator that often predicts turning points in the business cycle."
  },
  {
    question: "How can I use the economic calendar for trading?",
    answer: "Use the economic calendar to anticipate volatility and plan trades accordingly. High-impact events like FOMC decisions and jobs reports can cause significant price swings. Many traders avoid opening positions before major releases or use the calendar to identify trading opportunities based on expectations vs. actual data."
  },
  {
    question: "What time are major economic reports released?",
    answer: "Most US economic reports are released at 8:30 AM EST (employment data, CPI, GDP, retail sales). FOMC decisions are announced at 2:00 PM EST. ISM reports come out at 10:00 AM EST. These release times create concentrated periods of market volatility as traders react to the data."
  },
  {
    question: "What is the unemployment rate and how is it calculated?",
    answer: "The unemployment rate is the percentage of the labor force that is jobless and actively seeking employment. It's calculated by dividing unemployed persons by the total labor force. The Fed targets around 4% unemployment as consistent with maximum employment. Very low unemployment can signal inflation risks."
  },
  {
    question: "How do central bank meetings affect currency markets?",
    answer: "Central bank meetings affect currencies through interest rate differentials. Higher rates typically strengthen a currency by attracting foreign investment seeking higher yields. FOMC hawkish statements (suggesting rate hikes) usually boost the US dollar, while dovish signals (suggesting cuts) weaken it."
  }
]

// Breadcrumb schema
const breadcrumbSchema = getBreadcrumbSchema([
  { name: "Home", url: SITE_URL },
  { name: "Economic Calendar", url: `${SITE_URL}/economic-calendar` }
])

// FAQ schema
const faqSchema = getFAQSchema(faqs)

// Event schema for upcoming economic events
const eventSchemas = upcomingEvents.slice(0, 5).map(event => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: event.event,
  description: event.description,
  startDate: `${event.date}T${event.time.includes('AM') ? event.time.replace(' AM EST', '') : event.time.replace(' PM EST', '')}`,
  location: {
    "@type": "Place",
    name: event.country === "US" ? "United States" : event.country
  },
  organizer: {
    "@type": "Organization",
    name: event.category === "Central Bank" ? "Federal Reserve" : "US Department of Commerce"
  },
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled"
}))

export default function EconomicCalendarPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, faqSchema, ...eventSchemas])
        }}
      />

      <main className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-[1800px] mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center">
                  <span className="text-background font-bold text-lg">L</span>
                </div>
                <span className="font-semibold text-lg">Lician</span>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto px-6 py-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Economic Calendar</span>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
              <h1 className="text-4xl font-bold">Economic Calendar 2025</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Track major economic events including FOMC meeting dates, Federal Reserve decisions, CPI releases,
              jobs reports, GDP data, and other market-moving indicators. Never miss critical economic events.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">FOMC Meetings</p>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-xs text-muted-foreground mt-1">in 2025</p>
                  </div>
                  <Building2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Next FOMC</p>
                    <p className="text-lg font-bold">Jan 28-29</p>
                    <p className="text-xs text-muted-foreground mt-1">Press Conference</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Reports</p>
                    <p className="text-2xl font-bold">12+</p>
                    <p className="text-xs text-muted-foreground mt-1">Key Indicators</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">High Impact</p>
                    <p className="text-2xl font-bold">25+</p>
                    <p className="text-xs text-muted-foreground mt-1">Events/Quarter</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events Table */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Upcoming Economic Events
              </CardTitle>
              <CardDescription>
                Major market-moving economic releases and central bank meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Event</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Impact</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Previous</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Forecast</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingEvents.map((event, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          <div className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{event.time}</td>
                        <td className="py-4 px-4">
                          <div className="text-sm font-medium">{event.event}</div>
                          <div className="text-xs text-muted-foreground">{event.country}</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            event.importance === 'High'
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                          }`}>
                            {event.importance}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-sm tabular-nums">{event.previous}</td>
                        <td className="py-4 px-4 text-right text-sm font-medium tabular-nums">{event.forecast}</td>
                        <td className="py-4 px-4 text-right text-sm tabular-nums text-muted-foreground">
                          {event.actual || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* FOMC Meeting Schedule */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-500" />
                FOMC Meeting Schedule 2025
              </CardTitle>
              <CardDescription>
                Federal Reserve Federal Open Market Committee meeting dates - All meetings include press conferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {fomcMeetings.map((meeting, index) => (
                  <div
                    key={index}
                    className="p-4 bg-secondary/30 rounded-lg border border-border hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Calendar className="w-5 h-5 text-green-500" />
                      {meeting.pressConference && (
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                          Press Conf.
                        </span>
                      )}
                    </div>
                    <p className="font-medium">{meeting.date}</p>
                    <p className="text-xs text-muted-foreground mt-1">2:00 PM EST Decision</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Understanding FOMC */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green-500" />
                  What is FOMC and Why It Matters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">The Federal Open Market Committee (FOMC)</h4>
                  <p className="text-sm text-muted-foreground">
                    The FOMC is the monetary policymaking body of the Federal Reserve System. It consists of 12 members:
                    the seven members of the Board of Governors and five Reserve Bank presidents.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Why FOMC Meetings Matter</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Interest Rates:</strong> Sets the federal funds rate, affecting all borrowing costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Stock Valuations:</strong> Rate changes impact how stocks are valued</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Dollar Strength:</strong> Higher rates typically strengthen the US dollar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Economic Growth:</strong> Monetary policy affects business investment and consumer spending</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">What to Watch For</h4>
                  <p className="text-sm text-muted-foreground">
                    Markets react to both the rate decision and the accompanying statement. Pay attention to the "dot plot"
                    (FOMC members' rate projections), economic projections, and the Chair's press conference for forward guidance.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Understanding CPI */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Understanding CPI and Inflation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Consumer Price Index (CPI)</h4>
                  <p className="text-sm text-muted-foreground">
                    CPI measures the average change over time in prices paid by consumers for a basket of goods and services.
                    It's the most widely watched inflation indicator.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Components of CPI</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Food and Beverages:</strong> Grocery items, dining out (~14% of CPI)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Housing:</strong> Rent, owner's equivalent rent (~42% of CPI)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Energy:</strong> Gasoline, electricity, natural gas (~7% of CPI)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Medical Care:</strong> Healthcare services and insurance (~9% of CPI)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Core CPI vs Headline CPI</h4>
                  <p className="text-sm text-muted-foreground">
                    Core CPI excludes volatile food and energy prices, providing a better view of underlying inflation trends.
                    The Fed focuses more on Core CPI for policy decisions as it's less affected by temporary shocks.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Employment Data */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Employment Data Interpretation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Non-Farm Payrolls (NFP)</h4>
                  <p className="text-sm text-muted-foreground">
                    The monthly jobs report shows how many jobs were added or lost in the US economy, excluding farm workers,
                    government employees, and non-profit organizations. It's released the first Friday of each month.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Key Employment Metrics</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Unemployment Rate:</strong> Percentage of labor force actively seeking work</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Labor Force Participation:</strong> Percentage of working-age population in labor force</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Average Hourly Earnings:</strong> Wage growth indicator affecting consumer spending</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Average Weekly Hours:</strong> Total hours worked affects productivity</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">How Markets React</h4>
                  <p className="text-sm text-muted-foreground">
                    Strong job growth can be positive (economic strength) or negative (inflation concerns). The market's reaction
                    depends on where we are in the economic cycle and the Fed's policy stance.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* GDP and Economic Health */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  GDP and Economic Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Gross Domestic Product (GDP)</h4>
                  <p className="text-sm text-muted-foreground">
                    GDP measures the total value of all goods and services produced in the economy. It's the broadest measure
                    of economic activity and health, reported quarterly in annualized percentage terms.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Components of GDP</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Consumer Spending (C):</strong> ~70% of GDP - retail sales, services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Business Investment (I):</strong> ~18% - equipment, structures, software</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Government Spending (G):</strong> ~17% - federal, state, local expenditures</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span><strong>Net Exports (NX):</strong> Exports minus imports</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">GDP Growth Benchmarks</h4>
                  <p className="text-sm text-muted-foreground">
                    Healthy GDP growth is typically 2-3% annually. Above 3% suggests strong expansion, while negative GDP
                    growth for two consecutive quarters technically indicates a recession.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Economic Indicators Glossary */}
          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>Key Economic Indicators Glossary</CardTitle>
              <CardDescription>
                Essential metrics that move markets and influence Fed policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    PCE Price Index
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Personal Consumption Expenditures - The Fed's preferred inflation gauge. Tracks price changes
                    for all consumer spending including healthcare paid by employers.
                  </p>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Producer Price Index (PPI)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Measures wholesale/producer prices. Leading indicator for consumer inflation as producer
                    cost increases often pass through to consumers.
                  </p>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Retail Sales
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Total receipts at retail stores. Key indicator of consumer spending strength, which drives
                    70% of GDP. Excludes services spending.
                  </p>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    ISM Manufacturing PMI
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Survey of purchasing managers. Above 50 = expansion, below 50 = contraction. Leading
                    indicator that often predicts economic turning points.
                  </p>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Initial Jobless Claims
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Weekly report of new unemployment benefit applications. Real-time indicator of labor
                    market health. Rising claims suggest weakening employment.
                  </p>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Consumer Confidence
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Survey measuring consumer optimism about economy and personal finances. Strong confidence
                    often leads to increased spending and economic growth.
                  </p>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Housing Starts
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Number of new residential construction projects. Leading economic indicator as housing
                    drives jobs, consumer spending, and business investment.
                  </p>
                </div>

                <div className="p-4 bg-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span className="text-green-500">•</span>
                    Durable Goods Orders
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Orders for goods lasting 3+ years (cars, appliances, machinery). Indicator of business
                    investment and manufacturing strength.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQs Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Common questions about economic calendars and indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="pb-6 border-b border-border last:border-0 last:pb-0">
                    <h3 className="font-medium mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-3">Stay Ahead of Market-Moving Events</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Use our AI-powered analysis to understand how economic data impacts your investments.
                  Get instant alerts for major releases and FOMC decisions.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/stock/SPY"
                    className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-medium transition-colors"
                  >
                    Analyze SPY
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
