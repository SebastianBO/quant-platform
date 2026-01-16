import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'S&P 500 Historical Returns by Year (1926-2025) | Lician',
  description: 'Complete S&P 500 historical returns data from 1926 to 2025. Annual returns, decade averages, rolling returns, and key statistics for investment research.',
  keywords: [
    'S&P 500 historical returns',
    'S&P 500 annual returns',
    'stock market returns by year',
    'S&P 500 performance history',
    'average stock market return',
    'S&P 500 yearly returns',
    'historical stock returns',
  ],
  openGraph: {
    title: 'S&P 500 Historical Returns (1926-2025)',
    description: 'Complete historical returns data for the S&P 500 index, including annual returns, decade averages, and rolling return statistics.',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lician.com/insights/sp500-historical-returns',
  },
}

// S&P 500 Annual Returns Data (1926-2025)
// Source: Historical S&P 500 total returns including dividends
const annualReturns = [
  { year: 2025, return: 8.2, note: 'YTD through Jan' },
  { year: 2024, return: 25.0, note: '' },
  { year: 2023, return: 26.3, note: '' },
  { year: 2022, return: -18.1, note: 'Bear market' },
  { year: 2021, return: 28.7, note: '' },
  { year: 2020, return: 18.4, note: 'COVID recovery' },
  { year: 2019, return: 31.5, note: '' },
  { year: 2018, return: -4.4, note: '' },
  { year: 2017, return: 21.8, note: '' },
  { year: 2016, return: 12.0, note: '' },
  { year: 2015, return: 1.4, note: '' },
  { year: 2014, return: 13.7, note: '' },
  { year: 2013, return: 32.4, note: '' },
  { year: 2012, return: 16.0, note: '' },
  { year: 2011, return: 2.1, note: '' },
  { year: 2010, return: 15.1, note: '' },
  { year: 2009, return: 26.5, note: 'GFC recovery' },
  { year: 2008, return: -37.0, note: 'Financial crisis' },
  { year: 2007, return: 5.5, note: '' },
  { year: 2006, return: 15.8, note: '' },
  { year: 2005, return: 4.9, note: '' },
  { year: 2004, return: 10.9, note: '' },
  { year: 2003, return: 28.7, note: '' },
  { year: 2002, return: -22.1, note: 'Dot-com bust' },
  { year: 2001, return: -11.9, note: '' },
  { year: 2000, return: -9.1, note: '' },
  { year: 1999, return: 21.0, note: '' },
  { year: 1998, return: 28.6, note: '' },
  { year: 1997, return: 33.4, note: '' },
  { year: 1996, return: 23.0, note: '' },
  { year: 1995, return: 37.6, note: '' },
  { year: 1994, return: 1.3, note: '' },
  { year: 1993, return: 10.1, note: '' },
  { year: 1992, return: 7.6, note: '' },
  { year: 1991, return: 30.5, note: '' },
  { year: 1990, return: -3.1, note: '' },
  { year: 1989, return: 31.7, note: '' },
  { year: 1988, return: 16.6, note: '' },
  { year: 1987, return: 5.3, note: 'Black Monday' },
  { year: 1986, return: 18.7, note: '' },
  { year: 1985, return: 31.7, note: '' },
  { year: 1984, return: 6.3, note: '' },
  { year: 1983, return: 22.6, note: '' },
  { year: 1982, return: 21.6, note: '' },
  { year: 1981, return: -4.9, note: '' },
  { year: 1980, return: 32.5, note: '' },
  { year: 1979, return: 18.6, note: '' },
  { year: 1978, return: 6.6, note: '' },
  { year: 1977, return: -7.2, note: '' },
  { year: 1976, return: 23.9, note: '' },
  { year: 1975, return: 37.2, note: '' },
  { year: 1974, return: -26.5, note: 'Stagflation' },
  { year: 1973, return: -14.7, note: '' },
  { year: 1972, return: 19.0, note: '' },
  { year: 1971, return: 14.3, note: '' },
  { year: 1970, return: 4.0, note: '' },
]

// Decade averages
const decadeAverages = [
  { decade: '2020s', avg: 13.5, note: '(2020-2025 YTD)' },
  { decade: '2010s', avg: 13.6, note: '' },
  { decade: '2000s', avg: -0.9, note: 'Lost decade' },
  { decade: '1990s', avg: 18.2, note: '' },
  { decade: '1980s', avg: 17.6, note: '' },
  { decade: '1970s', avg: 5.9, note: '' },
  { decade: '1960s', avg: 7.8, note: '' },
  { decade: '1950s', avg: 19.4, note: '' },
  { decade: '1940s', avg: 9.2, note: '' },
  { decade: '1930s', avg: -0.1, note: 'Great Depression' },
]

// Key statistics
const keyStats = [
  { label: 'Average Annual Return', value: '10.5%', period: '1926-2024' },
  { label: 'Median Annual Return', value: '13.0%', period: '1926-2024' },
  { label: 'Best Year', value: '+52.6%', period: '1954' },
  { label: 'Worst Year', value: '-43.8%', period: '1931' },
  { label: 'Positive Years', value: '73%', period: 'of all years' },
  { label: 'Years Above 20%', value: '35%', period: 'of all years' },
  { label: 'Years Below -10%', value: '13%', period: 'of all years' },
  { label: 'Longest Bull Run', value: '11 years', period: '2009-2020' },
]

// Rolling returns
const rollingReturns = [
  { period: '1 Year', best: '+52.6%', worst: '-43.8%', avgPositive: '73%' },
  { period: '5 Years', best: '+28.6%', worst: '-12.5%', avgPositive: '88%' },
  { period: '10 Years', best: '+19.4%', worst: '-1.4%', avgPositive: '94%' },
  { period: '15 Years', best: '+18.9%', worst: '+0.6%', avgPositive: '100%' },
  { period: '20 Years', best: '+17.9%', worst: '+6.4%', avgPositive: '100%' },
]

const faqs = [
  {
    question: 'What is the average annual return of the S&P 500?',
    answer: 'The average annual return of the S&P 500 is approximately 10.5% when including dividends (total return), measured from 1926 to 2024. The nominal price return (excluding dividends) averages around 7.5%. These averages include periods of high inflation, making the inflation-adjusted (real) return closer to 7%.',
  },
  {
    question: 'How often does the S&P 500 have a positive year?',
    answer: 'The S&P 500 has delivered positive returns in approximately 73% of all calendar years since 1926. This means roughly 3 out of every 4 years are positive for stock market investors. Over longer holding periods (10+ years), the probability of positive returns approaches 94-100%.',
  },
  {
    question: 'What was the worst year for the S&P 500?',
    answer: 'The worst year for the S&P 500 was 1931 during the Great Depression, when the index lost 43.8%. More recently, 2008 saw a decline of 37% during the Global Financial Crisis, and 2022 experienced an 18.1% drop. These drawdowns highlight the importance of long-term investing horizons.',
  },
  {
    question: 'What was the best year for the S&P 500?',
    answer: 'The best year for the S&P 500 was 1954, with a total return of 52.6%. Other exceptional years include 1958 (+43.4%), 1995 (+37.6%), and 1975 (+37.2%). Years following significant market downturns often produce above-average returns as markets recover.',
  },
  {
    question: 'What is the S&P 500 return over 10 years?',
    answer: 'Over any rolling 10-year period in S&P 500 history, the average annualized return has been approximately 10%. The best 10-year period delivered 19.4% annualized returns, while the worst delivered -1.4% (which occurred during 1999-2008). Historically, 94% of all 10-year holding periods have been positive.',
  },
  {
    question: 'Should I invest in the S&P 500?',
    answer: 'The S&P 500 has been one of the most reliable long-term investments, delivering an average 10.5% annual return over nearly a century. For investors with a 10+ year time horizon, the index has historically provided positive returns in 94% of cases. However, past performance does not guarantee future results, and investors should consider their personal risk tolerance and financial goals.',
  },
]

export default function SP500HistoricalReturns() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Insights', url: `${SITE_URL}/insights` },
    { name: 'S&P 500 Historical Returns', url: `${SITE_URL}/insights/sp500-historical-returns` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'S&P 500 Historical Returns by Year (1926-2025)',
    description: 'Complete historical returns data for the S&P 500 index with annual returns, decade averages, and rolling return statistics.',
    url: `${SITE_URL}/insights/sp500-historical-returns`,
    datePublished: '2024-01-01T00:00:00Z',
    dateModified: '2026-01-16T00:00:00Z',
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/insights" className="hover:text-foreground">Insights</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">S&P 500 Historical Returns</span>
        </nav>

        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            S&P 500 Historical Returns by Year
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Complete historical returns data for the S&P 500 index from 1926 to 2025.
            Includes annual returns, decade averages, rolling return statistics, and key
            investment insights.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 2026 | Data includes total returns with dividends reinvested
          </p>
        </header>

        {/* Key Statistics */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Key Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {keyStats.map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.period}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Decade Averages */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Decade Averages</h2>
          <p className="text-muted-foreground mb-4">
            Average annualized returns by decade show significant variation based on
            economic conditions, inflation, and market cycles.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Decade</th>
                  <th className="text-right py-3 px-4">Avg. Annual Return</th>
                  <th className="text-left py-3 px-4">Note</th>
                </tr>
              </thead>
              <tbody>
                {decadeAverages.map((decade) => (
                  <tr key={decade.decade} className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">{decade.decade}</td>
                    <td className={`py-3 px-4 text-right font-mono ${decade.avg >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {decade.avg >= 0 ? '+' : ''}{decade.avg.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">{decade.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rolling Returns */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Rolling Return Statistics</h2>
          <p className="text-muted-foreground mb-4">
            Historical rolling returns demonstrate how longer holding periods significantly
            reduce volatility and increase the probability of positive returns.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Holding Period</th>
                  <th className="text-right py-3 px-4">Best Return</th>
                  <th className="text-right py-3 px-4">Worst Return</th>
                  <th className="text-right py-3 px-4">% Positive</th>
                </tr>
              </thead>
              <tbody>
                {rollingReturns.map((period) => (
                  <tr key={period.period} className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">{period.period}</td>
                    <td className="py-3 px-4 text-right font-mono text-green-500">{period.best}</td>
                    <td className="py-3 px-4 text-right font-mono text-red-500">{period.worst}</td>
                    <td className="py-3 px-4 text-right font-medium">{period.avgPositive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Annual Returns Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Annual Returns (1970-2025)</h2>
          <p className="text-muted-foreground mb-4">
            Year-by-year S&P 500 total returns including dividends reinvested. Green indicates
            positive returns, red indicates negative returns.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Year</th>
                  <th className="text-right py-3 px-4">Return</th>
                  <th className="text-left py-3 px-4">Note</th>
                </tr>
              </thead>
              <tbody>
                {annualReturns.map((item) => (
                  <tr key={item.year} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-4 font-medium">{item.year}</td>
                    <td className={`py-2 px-4 text-right font-mono ${item.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.return >= 0 ? '+' : ''}{item.return.toFixed(1)}%
                    </td>
                    <td className="py-2 px-4 text-muted-foreground text-sm">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Investment Insight */}
        <section className="mb-12 p-6 rounded-lg bg-primary/10 border border-primary/20">
          <h2 className="text-xl font-semibold mb-3">Key Investment Insight</h2>
          <p className="text-muted-foreground">
            The S&P 500 has delivered positive returns in <strong>73% of all calendar years</strong> since
            1926. For investors with a 15+ year time horizon, <strong>100% of historical rolling periods
            have been positive</strong>. This demonstrates the importance of long-term investing and
            staying invested through market volatility.
          </p>
          <div className="mt-4">
            <Link
              href="/etfs"
              className="text-primary hover:underline"
            >
              Compare S&P 500 ETFs (SPY, VOO, IVV) &rarr;
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border pb-6 last:border-b-0">
                <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Related Research</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/insights/2026-stock-predictions"
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-1">2026 Stock Market Predictions</h3>
              <p className="text-sm text-muted-foreground">Expert forecasts for the year ahead</p>
            </Link>
            <Link
              href="/etfs"
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-1">S&P 500 ETFs</h3>
              <p className="text-sm text-muted-foreground">Compare SPY, VOO, IVV and more</p>
            </Link>
            <Link
              href="/screener"
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-1">Stock Screener</h3>
              <p className="text-sm text-muted-foreground">Filter S&P 500 stocks by metrics</p>
            </Link>
          </div>
        </section>

        {/* Methodology Note */}
        <section className="text-sm text-muted-foreground border-t border-border pt-6">
          <h3 className="font-medium mb-2">Methodology & Data Sources</h3>
          <p className="mb-2">
            Returns shown are total returns including dividends reinvested. Historical data
            prior to 1957 uses the S&P 90 index (predecessor to S&P 500). Data sourced from
            Standard & Poor&apos;s, Federal Reserve, and academic research.
          </p>
          <p>
            <strong>Disclaimer:</strong> Past performance does not guarantee future results.
            This information is for educational purposes only and should not be considered
            investment advice. Always consult with a qualified financial advisor before
            making investment decisions.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
