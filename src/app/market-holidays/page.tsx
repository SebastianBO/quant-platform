import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Stock Market Holidays 2026: NYSE & NASDAQ Closed Dates | Lician',
  description: 'Complete list of 2026 stock market holidays when NYSE and NASDAQ are closed. Includes early close days, bond market holidays, and options expiration dates.',
  keywords: [
    'stock market holidays 2026',
    'NYSE holidays',
    'NASDAQ holidays',
    'stock market closed',
    'market holiday calendar',
    'trading holidays',
    'when is the stock market closed',
    'wall street holidays',
    'stock exchange holidays',
  ],
  openGraph: {
    title: 'Stock Market Holidays 2026 - NYSE & NASDAQ Calendar',
    description: 'Complete list of 2026 stock market holidays. Know when NYSE and NASDAQ are closed.',
    type: 'article',
    url: `${SITE_URL}/market-holidays`,
  },
  alternates: {
    canonical: `${SITE_URL}/market-holidays`,
  },
}

// 2026 Stock Market Holidays (NYSE & NASDAQ)
const stockMarketHolidays2026 = [
  {
    date: 'January 1',
    day: 'Thursday',
    holiday: "New Year's Day",
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: '',
  },
  {
    date: 'January 20',
    day: 'Monday',
    holiday: 'Martin Luther King Jr. Day',
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: '',
  },
  {
    date: 'February 16',
    day: 'Monday',
    holiday: "Presidents' Day",
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: '',
  },
  {
    date: 'April 3',
    day: 'Friday',
    holiday: 'Good Friday',
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: '',
  },
  {
    date: 'May 25',
    day: 'Monday',
    holiday: 'Memorial Day',
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: '',
  },
  {
    date: 'June 19',
    day: 'Friday',
    holiday: 'Juneteenth',
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: '',
  },
  {
    date: 'July 3',
    day: 'Friday',
    holiday: 'Independence Day (Observed)',
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: 'July 4 falls on Saturday',
  },
  {
    date: 'September 7',
    day: 'Monday',
    holiday: 'Labor Day',
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: '',
  },
  {
    date: 'November 26',
    day: 'Thursday',
    holiday: 'Thanksgiving Day',
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: '',
  },
  {
    date: 'November 27',
    day: 'Friday',
    holiday: 'Day After Thanksgiving',
    stockMarket: 'Early Close (1 PM ET)',
    bondMarket: 'Early Close (2 PM ET)',
    note: 'Half day',
  },
  {
    date: 'December 24',
    day: 'Thursday',
    holiday: 'Christmas Eve',
    stockMarket: 'Early Close (1 PM ET)',
    bondMarket: 'Early Close (2 PM ET)',
    note: 'Half day',
  },
  {
    date: 'December 25',
    day: 'Friday',
    holiday: 'Christmas Day',
    stockMarket: 'Closed',
    bondMarket: 'Closed',
    note: '',
  },
]

// Early close days
const earlyCloseDays2026 = [
  { date: 'November 27', holiday: 'Day After Thanksgiving', closeTime: '1:00 PM ET' },
  { date: 'December 24', holiday: 'Christmas Eve', closeTime: '1:00 PM ET' },
]

// 2027 Preview
const preview2027 = [
  { date: 'January 1', holiday: "New Year's Day", day: 'Friday' },
  { date: 'January 18', holiday: 'Martin Luther King Jr. Day', day: 'Monday' },
  { date: 'February 15', holiday: "Presidents' Day", day: 'Monday' },
]

// Options expiration dates 2026
const optionsExpiration2026 = [
  { month: 'January', date: 'January 16', type: 'Monthly' },
  { month: 'February', date: 'February 20', type: 'Monthly' },
  { month: 'March', date: 'March 20', type: 'Quarterly (Triple Witching)' },
  { month: 'April', date: 'April 17', type: 'Monthly' },
  { month: 'May', date: 'May 15', type: 'Monthly' },
  { month: 'June', date: 'June 19', type: 'Quarterly (Triple Witching)' },
  { month: 'July', date: 'July 17', type: 'Monthly' },
  { month: 'August', date: 'August 21', type: 'Monthly' },
  { month: 'September', date: 'September 18', type: 'Quarterly (Triple Witching)' },
  { month: 'October', date: 'October 16', type: 'Monthly' },
  { month: 'November', date: 'November 20', type: 'Monthly' },
  { month: 'December', date: 'December 18', type: 'Quarterly (Triple Witching)' },
]

const faqs = [
  {
    question: 'How many stock market holidays are there in 2026?',
    answer: 'The NYSE and NASDAQ observe 9 full market holidays in 2026: New Year\'s Day, MLK Day, Presidents\' Day, Good Friday, Memorial Day, Juneteenth, Independence Day (observed), Labor Day, Thanksgiving, and Christmas. There are also 2 early close days (Black Friday and Christmas Eve).',
  },
  {
    question: 'What time does the stock market close on early close days?',
    answer: 'On early close days (day after Thanksgiving and Christmas Eve), the NYSE and NASDAQ close at 1:00 PM Eastern Time instead of the normal 4:00 PM. The bond market closes at 2:00 PM ET on these days.',
  },
  {
    question: 'Is the stock market open on Good Friday?',
    answer: 'No, the NYSE and NASDAQ are closed on Good Friday. In 2026, Good Friday falls on April 3. This is one of the few non-federal holidays that closes the stock market.',
  },
  {
    question: 'Is the stock market open the day after Thanksgiving?',
    answer: 'Yes, but with reduced hours. The stock market is open on Black Friday but closes early at 1:00 PM Eastern Time. Many traders take this day off, resulting in lower trading volume.',
  },
  {
    question: 'What are the regular stock market hours?',
    answer: 'Regular trading hours for NYSE and NASDAQ are Monday through Friday, 9:30 AM to 4:00 PM Eastern Time. Pre-market trading begins at 4:00 AM ET and after-hours trading runs until 8:00 PM ET.',
  },
  {
    question: 'When is the next stock market holiday?',
    answer: 'Check our holiday calendar above for the next upcoming market closure. The calendar shows all NYSE and NASDAQ holidays for 2026, including early close days.',
  },
]

export default function MarketHolidaysPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stock Market Holidays 2026', url: `${SITE_URL}/market-holidays` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stock Market Holidays 2026: NYSE & NASDAQ Closed Dates',
    datePublished: '2026-01-16',
    dateModified: '2026-01-16',
    description: 'Complete list of 2026 stock market holidays when NYSE and NASDAQ are closed.',
    url: `${SITE_URL}/market-holidays`,
  })

  const faqSchema = getFAQSchema(faqs)

  // Find next holiday
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentDate = today.getDate()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <nav className="mb-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span>Market Holidays</span>
            </nav>
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Stock Market Holidays 2026
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Complete calendar of NYSE and NASDAQ market closures, early close days,
              and bond market holidays for 2026.
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="border-b py-8">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">9</p>
                <p className="text-sm text-muted-foreground">Full Market Holidays</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">2</p>
                <p className="text-sm text-muted-foreground">Early Close Days</p>
              </div>
              <div className="rounded-lg border bg-card p-4 text-center">
                <p className="text-3xl font-bold text-primary">252</p>
                <p className="text-sm text-muted-foreground">Trading Days in 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="container mx-auto max-w-4xl px-4 py-12">
          {/* Full Holiday Calendar */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              2026 Stock Market Holiday Calendar
            </h2>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Day</th>
                      <th className="px-4 py-3 text-left font-semibold">Holiday</th>
                      <th className="px-4 py-3 text-center font-semibold">Stock Market</th>
                      <th className="px-4 py-3 text-center font-semibold">Bond Market</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {stockMarketHolidays2026.map((holiday) => (
                      <tr key={holiday.date}>
                        <td className="px-4 py-3 font-medium">{holiday.date}</td>
                        <td className="px-4 py-3 text-muted-foreground">{holiday.day}</td>
                        <td className="px-4 py-3">
                          {holiday.holiday}
                          {holiday.note && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({holiday.note})
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded px-2 py-1 text-xs font-medium ${
                            holiday.stockMarket === 'Closed'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {holiday.stockMarket}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded px-2 py-1 text-xs font-medium ${
                            holiday.bondMarket === 'Closed'
                              ? 'bg-red-500/10 text-red-600'
                              : 'bg-yellow-500/10 text-yellow-600'
                          }`}>
                            {holiday.bondMarket}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Early Close Days */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Early Close Days 2026
            </h2>
            <div className="rounded-lg border bg-yellow-500/5 p-6">
              <p className="mb-4 text-muted-foreground">
                On these days, the stock market closes at <strong>1:00 PM ET</strong> instead
                of the normal 4:00 PM closing time:
              </p>
              <div className="space-y-3">
                {earlyCloseDays2026.map((day) => (
                  <div key={day.date} className="flex items-center justify-between rounded bg-background p-3">
                    <div>
                      <p className="font-medium">{day.holiday}</p>
                      <p className="text-sm text-muted-foreground">{day.date}, 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">Closes {day.closeTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trading Hours Reference */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Regular Trading Hours
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-lg font-semibold">NYSE & NASDAQ</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pre-Market</span>
                    <span className="font-mono">4:00 AM - 9:30 AM ET</span>
                  </div>
                  <div className="flex justify-between border-t border-b py-2">
                    <span className="font-medium">Regular Hours</span>
                    <span className="font-mono font-medium">9:30 AM - 4:00 PM ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">After-Hours</span>
                    <span className="font-mono">4:00 PM - 8:00 PM ET</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="mb-4 text-lg font-semibold">Bond Market (SIFMA)</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Regular Hours</span>
                    <span className="font-mono font-medium">8:00 AM - 5:00 PM ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Early Close</span>
                    <span className="font-mono">2:00 PM ET</span>
                  </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  Bond markets may have additional early closes not observed by stock exchanges.
                </p>
              </div>
            </div>
          </section>

          {/* Options Expiration */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              2026 Options Expiration Dates
            </h2>
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Month</th>
                      <th className="px-4 py-3 text-left font-semibold">Expiration Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {optionsExpiration2026.map((exp) => (
                      <tr key={exp.month}>
                        <td className="px-4 py-3 font-medium">{exp.month}</td>
                        <td className="px-4 py-3">{exp.date}</td>
                        <td className="px-4 py-3">
                          {exp.type.includes('Triple') ? (
                            <span className="rounded bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-600">
                              {exp.type}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{exp.type}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>Triple Witching</strong> occurs quarterly (March, June, September, December)
              when stock options, stock index futures, and stock index options all expire on the
              same day, often causing increased volatility and trading volume.
            </p>
          </section>

          {/* 2027 Preview */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              2027 Market Holidays Preview
            </h2>
            <div className="rounded-lg border bg-muted/30 p-6">
              <p className="mb-4 text-sm text-muted-foreground">
                Looking ahead to early 2027 market closures:
              </p>
              <div className="space-y-2">
                {preview2027.map((holiday) => (
                  <div key={holiday.date} className="flex items-center justify-between rounded bg-background p-3 text-sm">
                    <span className="font-medium">{holiday.holiday}</span>
                    <span className="text-muted-foreground">{holiday.date} ({holiday.day})</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold md:text-3xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-lg border p-6">
                  <h3 className="mb-3 text-lg font-semibold">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Resources */}
          <section className="rounded-lg border bg-muted/30 p-8">
            <h2 className="mb-6 text-xl font-bold">Related Resources</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/economic-calendar"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Economic Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Fed meetings, CPI releases, jobs reports
                </p>
              </Link>
              <Link
                href="/earnings"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Earnings Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Upcoming company earnings announcements
                </p>
              </Link>
              <Link
                href="/markets/premarket"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Premarket Movers</h3>
                <p className="text-sm text-muted-foreground">
                  See what's moving before market open
                </p>
              </Link>
              <Link
                href="/markets/after-hours"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">After Hours Movers</h3>
                <p className="text-sm text-muted-foreground">
                  Track extended hours trading activity
                </p>
              </Link>
            </div>
          </section>
        </article>

        {/* Source Note */}
        <section className="border-t bg-muted/20 py-6">
          <div className="container mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
            <p>
              Holiday schedule based on official NYSE and NASDAQ announcements.
              Bond market holidays follow SIFMA recommendations.
              Always verify with your broker for the most current information.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
