import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Stock Market Trading Hours 2026 | NYSE, NASDAQ, Forex, Crypto',
  description: 'Complete guide to trading hours for all markets: US stocks (NYSE, NASDAQ), pre-market, after-hours, bond market, forex, futures, and cryptocurrency. Updated for 2026.',
  keywords: [
    'stock market hours',
    'NYSE trading hours',
    'NASDAQ hours',
    'pre-market trading hours',
    'after hours trading',
    'forex market hours',
    'crypto trading hours',
    'futures trading hours',
    'when does stock market open',
    'market hours today'
  ],
  alternates: {
    canonical: `${SITE_URL}/trading-hours`
  },
  openGraph: {
    title: 'Stock Market Trading Hours 2026 | Complete Guide',
    description: 'Complete guide to trading hours for US stocks, forex, futures, and cryptocurrency markets.',
    url: `${SITE_URL}/trading-hours`,
    type: 'article'
  }
}

const usStockHours = [
  { session: 'Pre-Market', hours: '4:00 AM - 9:30 AM ET', notes: 'Limited liquidity, wider spreads' },
  { session: 'Regular Session', hours: '9:30 AM - 4:00 PM ET', notes: 'Full liquidity, standard spreads' },
  { session: 'After-Hours', hours: '4:00 PM - 8:00 PM ET', notes: 'Limited liquidity, earnings reactions' }
]

const globalMarketHours = [
  { market: 'Tokyo Stock Exchange', timezone: 'JST', local: '9:00 AM - 3:00 PM', etTime: '7:00 PM - 1:00 AM ET*', lunch: '11:30 AM - 12:30 PM JST' },
  { market: 'Shanghai Stock Exchange', timezone: 'CST', local: '9:30 AM - 3:00 PM', etTime: '9:30 PM - 3:00 AM ET*', lunch: '11:30 AM - 1:00 PM CST' },
  { market: 'Hong Kong Stock Exchange', timezone: 'HKT', local: '9:30 AM - 4:00 PM', etTime: '9:30 PM - 4:00 AM ET*', lunch: '12:00 PM - 1:00 PM HKT' },
  { market: 'London Stock Exchange', timezone: 'GMT/BST', local: '8:00 AM - 4:30 PM', etTime: '3:00 AM - 11:30 AM ET', lunch: 'None' },
  { market: 'Euronext (Paris)', timezone: 'CET', local: '9:00 AM - 5:30 PM', etTime: '3:00 AM - 11:30 AM ET', lunch: 'None' },
  { market: 'Frankfurt Stock Exchange', timezone: 'CET', local: '9:00 AM - 5:30 PM', etTime: '3:00 AM - 11:30 AM ET', lunch: 'None' }
]

const forexSessions = [
  { session: 'Sydney', hours: '5:00 PM - 2:00 AM ET', major: 'AUD, NZD' },
  { session: 'Tokyo', hours: '7:00 PM - 4:00 AM ET', major: 'JPY, AUD' },
  { session: 'London', hours: '3:00 AM - 12:00 PM ET', major: 'EUR, GBP, CHF' },
  { session: 'New York', hours: '8:00 AM - 5:00 PM ET', major: 'USD, CAD' }
]

const futuresHours = [
  { market: 'E-mini S&P 500 (ES)', exchange: 'CME', hours: 'Sunday 6:00 PM - Friday 5:00 PM ET', break: 'Daily 5:00 PM - 6:00 PM ET' },
  { market: 'Crude Oil (CL)', exchange: 'NYMEX', hours: 'Sunday 6:00 PM - Friday 5:00 PM ET', break: 'Daily 5:00 PM - 6:00 PM ET' },
  { market: 'Gold (GC)', exchange: 'COMEX', hours: 'Sunday 6:00 PM - Friday 5:00 PM ET', break: 'Daily 5:00 PM - 6:00 PM ET' },
  { market: 'Treasury Bonds (ZB)', exchange: 'CBOT', hours: 'Sunday 6:00 PM - Friday 5:00 PM ET', break: 'Daily 5:00 PM - 6:00 PM ET' },
  { market: 'Corn (ZC)', exchange: 'CBOT', hours: 'Sunday 7:00 PM - Friday 2:20 PM CT', break: 'Daily 7:45 AM - 8:30 AM CT' }
]

const faqs = [
  {
    question: 'What time does the stock market open and close?',
    answer: 'The US stock market (NYSE and NASDAQ) opens at 9:30 AM Eastern Time and closes at 4:00 PM Eastern Time, Monday through Friday. Pre-market trading begins at 4:00 AM ET and after-hours trading continues until 8:00 PM ET.'
  },
  {
    question: 'Can I trade stocks 24 hours a day?',
    answer: 'While US stock markets have set trading hours, you can trade during extended hours (pre-market and after-hours). However, extended hours have lower liquidity and wider bid-ask spreads. For 24/7 trading, consider cryptocurrency markets which never close.'
  },
  {
    question: 'What is pre-market trading?',
    answer: 'Pre-market trading occurs before the regular market session, from 4:00 AM to 9:30 AM ET. It allows investors to react to overnight news and earnings announcements. However, pre-market has lower volume and higher volatility than regular hours.'
  },
  {
    question: 'When is the forex market open?',
    answer: 'The forex market operates 24 hours a day, 5 days a week, from Sunday 5:00 PM ET to Friday 5:00 PM ET. Trading moves through four major sessions: Sydney, Tokyo, London, and New York. The most liquid periods are when sessions overlap, especially London-New York (8:00 AM - 12:00 PM ET).'
  },
  {
    question: 'Is the stock market open on weekends?',
    answer: 'No, the US stock market is closed on weekends (Saturday and Sunday). However, futures markets open Sunday evening at 6:00 PM ET, and cryptocurrency markets trade 24/7 including weekends.'
  },
  {
    question: 'What are the most volatile trading hours?',
    answer: 'The most volatile trading hours are typically the first hour after market open (9:30-10:30 AM ET) and the last hour before close (3:00-4:00 PM ET). For forex, the London-New York overlap (8:00 AM - 12:00 PM ET) sees the highest volume and volatility in major pairs.'
  }
]

export default function TradingHoursPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Trading Hours', url: `${SITE_URL}/trading-hours` }
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stock Market Trading Hours 2026: Complete Guide',
    datePublished: '2026-01-01',
    dateModified: '2026-01-16',
    description: 'Complete guide to trading hours for US stocks, forex, futures, and cryptocurrency markets.',
    url: `${SITE_URL}/trading-hours`
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema])
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Trading Hours</span>
            </nav>
            <h1 className="text-4xl font-bold mb-4">
              Stock Market Trading Hours 2026
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Complete guide to trading hours for US stocks, international markets, forex, futures, and cryptocurrency. Know when each market opens and closes worldwide.
            </p>
          </div>
        </section>

        {/* US Stock Market Hours */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">US Stock Market Hours (NYSE & NASDAQ)</h2>
            <p className="text-muted-foreground mb-6">
              The New York Stock Exchange (NYSE) and NASDAQ operate on the same schedule. Both exchanges are closed on <Link href="/market-holidays" className="text-primary hover:underline">federal holidays</Link>.
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Trading Session</th>
                    <th className="text-left p-4 font-semibold">Hours (Eastern Time)</th>
                    <th className="text-left p-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {usStockHours.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-medium">{row.session}</td>
                      <td className="p-4">{row.hours}</td>
                      <td className="p-4 text-muted-foreground">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h3 className="font-semibold text-blue-400 mb-2">Time Zone Conversions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Pacific Time (PT)</p>
                  <p className="font-medium">6:30 AM - 1:00 PM</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mountain Time (MT)</p>
                  <p className="font-medium">7:30 AM - 2:00 PM</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Central Time (CT)</p>
                  <p className="font-medium">8:30 AM - 3:00 PM</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Eastern Time (ET)</p>
                  <p className="font-medium">9:30 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Extended Hours Trading */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Extended Hours Trading Explained</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Pre-Market Trading</h3>
                <p className="text-muted-foreground mb-4">
                  Pre-market trading occurs from <strong>4:00 AM to 9:30 AM ET</strong>. It allows traders to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>React to overnight earnings announcements</li>
                  <li>Trade on international market news</li>
                  <li>Adjust positions before regular hours</li>
                </ul>
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded">
                  <p className="text-sm text-yellow-400"><strong>Warning:</strong> Lower liquidity leads to wider spreads and higher volatility.</p>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">After-Hours Trading</h3>
                <p className="text-muted-foreground mb-4">
                  After-hours trading runs from <strong>4:00 PM to 8:00 PM ET</strong>. Key considerations:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Most earnings are released after 4:00 PM</li>
                  <li>Prices can gap significantly by next morning</li>
                  <li>Not all brokers offer after-hours trading</li>
                </ul>
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
                  <p className="text-sm text-blue-400"><strong>Tip:</strong> Use limit orders only during extended hours to avoid poor fills.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bond Market Hours */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">US Bond Market Hours</h2>
            <p className="text-muted-foreground mb-6">
              The bond market follows SIFMA (Securities Industry and Financial Markets Association) recommendations.
            </p>

            <div className="bg-card border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Regular Hours</h3>
                  <p className="text-2xl font-bold text-primary">8:00 AM - 5:00 PM ET</p>
                  <p className="text-sm text-muted-foreground mt-2">Monday through Friday</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Early Close Days</h3>
                  <p className="text-2xl font-bold text-yellow-400">2:00 PM ET</p>
                  <p className="text-sm text-muted-foreground mt-2">Day before certain holidays</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Learn More</h3>
                  <Link href="/bonds" className="text-primary hover:underline">
                    View US Treasury yields →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Forex Market Hours */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Forex Market Hours (24/5)</h2>
            <p className="text-muted-foreground mb-6">
              The foreign exchange market operates 24 hours a day, 5 days a week, moving through four major trading sessions around the globe.
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Session</th>
                    <th className="text-left p-4 font-semibold">Hours (ET)</th>
                    <th className="text-left p-4 font-semibold">Major Currencies</th>
                  </tr>
                </thead>
                <tbody>
                  {forexSessions.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-medium">{row.session}</td>
                      <td className="p-4">{row.hours}</td>
                      <td className="p-4 text-muted-foreground">{row.major}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
              <h3 className="font-semibold text-green-400 mb-2">Best Trading Windows</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">London-New York Overlap</p>
                  <p className="text-muted-foreground">8:00 AM - 12:00 PM ET — Highest volume for EUR/USD, GBP/USD</p>
                </div>
                <div>
                  <p className="font-medium">Tokyo-London Overlap</p>
                  <p className="text-muted-foreground">3:00 AM - 4:00 AM ET — Good for EUR/JPY, GBP/JPY</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              <Link href="/forex" className="text-primary hover:underline">View live forex rates →</Link>
            </p>
          </div>
        </section>

        {/* Futures Market Hours */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Futures Market Hours</h2>
            <p className="text-muted-foreground mb-6">
              Futures markets trade nearly 24 hours, 5 days a week, with a daily maintenance break. Trading opens Sunday evening and closes Friday afternoon.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Contract</th>
                    <th className="text-left p-4 font-semibold">Exchange</th>
                    <th className="text-left p-4 font-semibold">Trading Hours</th>
                    <th className="text-left p-4 font-semibold">Daily Break</th>
                  </tr>
                </thead>
                <tbody>
                  {futuresHours.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-medium">{row.market}</td>
                      <td className="p-4">{row.exchange}</td>
                      <td className="p-4">{row.hours}</td>
                      <td className="p-4 text-muted-foreground">{row.break}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              <Link href="/commodities" className="text-primary hover:underline">View commodity prices →</Link>
            </p>
          </div>
        </section>

        {/* Cryptocurrency Market Hours */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Cryptocurrency Market Hours (24/7)</h2>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">₿</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Always Open</h3>
                  <p className="text-muted-foreground">Cryptocurrency markets never close — trade 24 hours a day, 7 days a week, 365 days a year.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Advantages</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>React to news instantly, any time</li>
                    <li>No overnight gap risk</li>
                    <li>Suits traders in any timezone</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Considerations</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                    <li>Weekend liquidity can be lower</li>
                    <li>Requires 24/7 risk management</li>
                    <li>Higher volatility during off-hours</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              <Link href="/crypto" className="text-primary hover:underline">View cryptocurrency prices →</Link>
            </p>
          </div>
        </section>

        {/* International Markets */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">International Stock Market Hours</h2>
            <p className="text-muted-foreground mb-6">
              Major global exchanges operate in their local time zones. Times shown in ET are approximate and may vary due to daylight saving time differences.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Exchange</th>
                    <th className="text-left p-4 font-semibold">Local Hours</th>
                    <th className="text-left p-4 font-semibold">Eastern Time</th>
                    <th className="text-left p-4 font-semibold">Lunch Break</th>
                  </tr>
                </thead>
                <tbody>
                  {globalMarketHours.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-medium">{row.market}</td>
                      <td className="p-4">{row.local}</td>
                      <td className="p-4">{row.etTime}</td>
                      <td className="p-4 text-muted-foreground">{row.lunch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              * Times shown are previous day ET for Asian markets (e.g., Tokyo opens 7:00 PM ET Sunday for Monday local time).
            </p>
          </div>
        </section>

        {/* Trading Hours by Day */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Weekly Trading Schedule</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Day</th>
                    <th className="text-left p-4 font-semibold">US Stocks</th>
                    <th className="text-left p-4 font-semibold">Forex</th>
                    <th className="text-left p-4 font-semibold">Futures</th>
                    <th className="text-left p-4 font-semibold">Crypto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Sunday</td>
                    <td className="p-4 text-red-400">Closed</td>
                    <td className="p-4 text-green-400">Opens 5 PM ET</td>
                    <td className="p-4 text-green-400">Opens 6 PM ET</td>
                    <td className="p-4 text-green-400">Open 24/7</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Monday</td>
                    <td className="p-4 text-green-400">9:30 AM - 4 PM</td>
                    <td className="p-4 text-green-400">Open 24 hours</td>
                    <td className="p-4 text-green-400">Open (with break)</td>
                    <td className="p-4 text-green-400">Open 24/7</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Tuesday</td>
                    <td className="p-4 text-green-400">9:30 AM - 4 PM</td>
                    <td className="p-4 text-green-400">Open 24 hours</td>
                    <td className="p-4 text-green-400">Open (with break)</td>
                    <td className="p-4 text-green-400">Open 24/7</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Wednesday</td>
                    <td className="p-4 text-green-400">9:30 AM - 4 PM</td>
                    <td className="p-4 text-green-400">Open 24 hours</td>
                    <td className="p-4 text-green-400">Open (with break)</td>
                    <td className="p-4 text-green-400">Open 24/7</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Thursday</td>
                    <td className="p-4 text-green-400">9:30 AM - 4 PM</td>
                    <td className="p-4 text-green-400">Open 24 hours</td>
                    <td className="p-4 text-green-400">Open (with break)</td>
                    <td className="p-4 text-green-400">Open 24/7</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Friday</td>
                    <td className="p-4 text-green-400">9:30 AM - 4 PM</td>
                    <td className="p-4 text-yellow-400">Closes 5 PM ET</td>
                    <td className="p-4 text-yellow-400">Closes 5 PM ET</td>
                    <td className="p-4 text-green-400">Open 24/7</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Saturday</td>
                    <td className="p-4 text-red-400">Closed</td>
                    <td className="p-4 text-red-400">Closed</td>
                    <td className="p-4 text-red-400">Closed</td>
                    <td className="p-4 text-green-400">Open 24/7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/market-holidays" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">Market Holidays 2026</h3>
                <p className="text-sm text-muted-foreground">NYSE & NASDAQ holiday schedule</p>
              </Link>
              <Link href="/markets/premarket" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">Pre-Market Movers</h3>
                <p className="text-sm text-muted-foreground">Top gainers before market open</p>
              </Link>
              <Link href="/markets/after-hours" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">After-Hours Movers</h3>
                <p className="text-sm text-muted-foreground">Extended hours trading activity</p>
              </Link>
              <Link href="/economic-calendar" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">Economic Calendar</h3>
                <p className="text-sm text-muted-foreground">FOMC meetings, jobs reports</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
