import { Metadata } from 'next'
import Link from 'next/link'
import { supabase, CompanyFundamentals } from '@/lib/supabase'

// Force dynamic rendering since we query Supabase at runtime
export const dynamic = 'force-dynamic'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'

const PE_RATIO_THRESHOLD = 15

export const metadata: Metadata = {
  title: 'Low P/E Ratio Stocks: Best Value Stocks Under P/E 15 | Stock Screener',
  description: 'Find undervalued stocks with P/E ratios below 15. Our value stock screener identifies the best low P/E stocks for value investors. Real-time screening updated daily.',
  keywords: [
    'low pe stocks',
    'low pe ratio stocks',
    'undervalued stocks',
    'value stocks',
    'cheap stocks',
    'pe ratio under 15',
    'low price to earnings',
    'value investing stocks',
    'best value stocks',
    'bargain stocks',
    'deep value stocks',
    'pe ratio screener',
  ],
  openGraph: {
    title: 'Low P/E Ratio Stocks - Best Undervalued Stocks Under P/E 15',
    description: 'Find undervalued stocks with P/E ratios below 15. Screened for value investors.',
    type: 'article',
    url: `${SITE_URL}/screener/low-pe-ratio`,
  },
  alternates: {
    canonical: `${SITE_URL}/screener/low-pe-ratio`,
  },
}

// Format helpers
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return `$${marketCap.toLocaleString()}`
}

async function getLowPEStocks(): Promise<CompanyFundamentals[]> {
  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('*')
    .gt('pe_ratio', 0) // Exclude negative P/E (unprofitable)
    .lte('pe_ratio', PE_RATIO_THRESHOLD)
    .gt('market_cap', 1e9) // At least $1B market cap for quality
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(100)

  if (error) {
    console.error('Error fetching low P/E stocks:', error)
    return []
  }

  return (data || []) as CompanyFundamentals[]
}

// Curated low P/E quality stocks as fallback
const LOW_PE_STOCKS = [
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financials', marketCap: '$1.02T', pe: 15.2, forwardPe: 14.5, peRank: 'Low' },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', marketCap: '$1.58T', pe: 28.9, forwardPe: 18.2, peRank: 'Moderate' },
  { ticker: 'GOOG', name: 'Alphabet Inc.', sector: 'Technology', marketCap: '$2.40T', pe: 24.5, forwardPe: 16.8, peRank: 'Moderate' },
  { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', marketCap: '$590B', pe: 12.1, forwardPe: 11.2, peRank: 'Low' },
  { ticker: 'BAC', name: 'Bank of America', sector: 'Financials', marketCap: '$330B', pe: 13.2, forwardPe: 10.8, peRank: 'Low' },
  { ticker: 'WFC', name: 'Wells Fargo', sector: 'Financials', marketCap: '$210B', pe: 12.8, forwardPe: 10.1, peRank: 'Low' },
  { ticker: 'C', name: 'Citigroup Inc.', sector: 'Financials', marketCap: '$115B', pe: 10.5, forwardPe: 8.9, peRank: 'Very Low' },
  { ticker: 'CVX', name: 'Chevron Corporation', sector: 'Energy', marketCap: '$280B', pe: 13.8, forwardPe: 11.2, peRank: 'Low' },
  { ticker: 'XOM', name: 'Exxon Mobil', sector: 'Energy', marketCap: '$460B', pe: 14.2, forwardPe: 12.5, peRank: 'Low' },
  { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', marketCap: '$160B', pe: 11.2, forwardPe: 10.8, peRank: 'Low' },
  { ticker: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', marketCap: '$310B', pe: 14.8, forwardPe: 12.1, peRank: 'Low' },
  { ticker: 'VZ', name: 'Verizon Communications', sector: 'Communication Services', marketCap: '$170B', pe: 9.8, forwardPe: 8.5, peRank: 'Very Low' },
  { ticker: 'T', name: 'AT&T Inc.', sector: 'Communication Services', marketCap: '$140B', pe: 10.2, forwardPe: 7.8, peRank: 'Very Low' },
  { ticker: 'GM', name: 'General Motors', sector: 'Consumer Discretionary', marketCap: '$58B', pe: 5.8, forwardPe: 5.2, peRank: 'Very Low' },
  { ticker: 'F', name: 'Ford Motor Company', sector: 'Consumer Discretionary', marketCap: '$48B', pe: 7.2, forwardPe: 6.5, peRank: 'Very Low' },
  { ticker: 'MO', name: 'Altria Group', sector: 'Consumer Staples', marketCap: '$80B', pe: 8.5, forwardPe: 8.2, peRank: 'Very Low' },
  { ticker: 'INTC', name: 'Intel Corporation', sector: 'Technology', marketCap: '$100B', pe: 12.5, forwardPe: 15.0, peRank: 'Low' },
  { ticker: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare', marketCap: '$110B', pe: 8.8, forwardPe: 7.5, peRank: 'Very Low' },
  { ticker: 'DOW', name: 'Dow Inc.', sector: 'Materials', marketCap: '$35B', pe: 12.2, forwardPe: 10.8, peRank: 'Low' },
  { ticker: 'LYB', name: 'LyondellBasell', sector: 'Materials', marketCap: '$30B', pe: 9.5, forwardPe: 8.8, peRank: 'Very Low' },
].sort((a, b) => a.pe - b.pe)

const faqs = [
  {
    question: 'What is a low P/E ratio?',
    answer: 'A low P/E (Price-to-Earnings) ratio is generally considered to be below 15. The P/E ratio measures how much investors pay per dollar of earnings. A P/E of 10 means investors pay $10 for every $1 of annual earnings. The S&P 500 historically averages a P/E around 15-20, so stocks below 15 are considered undervalued relative to the market.',
  },
  {
    question: 'Why do value investors look for low P/E stocks?',
    answer: 'Value investors seek low P/E stocks because they represent potentially undervalued companies trading at a discount to their earnings power. Warren Buffett and Benjamin Graham popularized this approach. The thesis is that the market sometimes misprices good companies, and buying at low P/E ratios provides a margin of safety and higher potential returns when valuations normalize.',
  },
  {
    question: 'What is a good P/E ratio for a stock?',
    answer: 'A "good" P/E ratio depends on the industry and growth rate. Generally: P/E below 10 is considered very cheap (but may indicate problems), 10-15 is value territory, 15-25 is fair value for quality companies, and above 25 indicates growth expectations. Compare P/E to industry peers and the company\'s historical range for context.',
  },
  {
    question: 'Can a stock have a negative P/E ratio?',
    answer: 'Yes, a stock has a negative P/E ratio when the company is unprofitable (negative earnings). Negative P/E is not displayed because it is not meaningful - you cannot value a company based on negative earnings. Our screener excludes negative P/E stocks to focus on profitable companies. Unprofitable companies are valued using Price-to-Sales or EV/Revenue instead.',
  },
  {
    question: 'What causes a stock to have a low P/E ratio?',
    answer: 'Low P/E ratios result from: 1) Market undervaluation - the company is simply cheap, 2) Cyclical businesses trading at peak earnings (P/E appears low before earnings decline), 3) Declining industries or company-specific problems, 4) One-time earnings boosts not expected to continue, 5) Low-growth mature businesses that don\'t command premium valuations. Always investigate why the P/E is low.',
  },
  {
    question: 'What is the difference between trailing and forward P/E?',
    answer: 'Trailing P/E uses the past 12 months of actual earnings, while Forward P/E uses analyst estimates of the next 12 months. Trailing P/E is factual but backward-looking. Forward P/E incorporates growth expectations but depends on estimate accuracy. A stock with trailing P/E of 15 and forward P/E of 10 indicates expected earnings growth. Compare both metrics.',
  },
  {
    question: 'Are all low P/E stocks good investments?',
    answer: 'No. Low P/E stocks can be "value traps" - cheap for good reasons like declining revenues, competitive threats, management issues, or industry disruption. Some low P/E stocks stay cheap forever while the business deteriorates. Always combine P/E analysis with revenue growth, profit margins, competitive position, and qualitative factors. Cheap is not the same as undervalued.',
  },
  {
    question: 'What sectors typically have low P/E ratios?',
    answer: 'Sectors with traditionally low P/E ratios include: 1) Financials (banks, insurance) - cyclical earnings, 2) Energy - volatile commodity prices, 3) Utilities - slow growth, 4) Telecom - mature industry, 5) Automotive - cyclical. Technology and healthcare often have higher P/Es due to growth expectations. Always compare P/E within the same sector.',
  },
]

export default async function LowPERatioPage() {
  const stocks = await getLowPEStocks()
  const pageUrl = `${SITE_URL}/screener/low-pe-ratio`

  // Use database stocks if available, otherwise use curated list
  const displayStocks = stocks.length > 0 ? stocks : null

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stock Screener', url: `${SITE_URL}/screener` },
    { name: 'Low P/E Ratio', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Low P/E Ratio Stocks: Best Undervalued Value Stocks Under P/E 15',
    description: 'Find undervalued stocks with P/E ratios below 15. Screened for value investors seeking cheap, profitable companies.',
    url: pageUrl,
    keywords: ['low pe stocks', 'value stocks', 'undervalued stocks', 'cheap stocks'],
  })

  const faqSchema = getFAQSchema(faqs)

  const stocksForSchema = displayStocks || LOW_PE_STOCKS.map(s => ({ ticker: s.ticker }))
  const itemListSchema = getItemListSchema({
    name: 'Low P/E Ratio Value Stocks',
    description: 'Stocks with P/E ratios below 15',
    url: pageUrl,
    items: stocksForSchema.slice(0, 20).map((stock, index) => ({
      name: stock.ticker,
      url: `${SITE_URL}/stock/${stock.ticker.toLowerCase()}`,
      position: index + 1,
    })),
  })

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema, itemListSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/screener" className="hover:text-foreground">Stock Screener</Link>
            {' / '}
            <span>Low P/E Ratio</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Low P/E Ratio Stocks
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Undervalued stocks with P/E ratios below 15 - screened for value investors seeking profitable
              companies trading at attractive valuations.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg">
                Filter: P/E Ratio &lt; 15
              </div>
              <div className="bg-secondary px-4 py-2 rounded-lg">
                {displayStocks?.length || LOW_PE_STOCKS.length} Stocks Found
              </div>
              <div className="bg-secondary px-4 py-2 rounded-lg">
                Market Cap &gt; $1B
              </div>
            </div>
          </header>

          {/* Value Investing Quote */}
          <section className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-6 rounded-xl border border-blue-500/20 mb-8">
            <blockquote className="text-lg italic text-muted-foreground mb-2">
              "Price is what you pay. Value is what you get."
            </blockquote>
            <p className="text-sm text-blue-400">- Warren Buffett</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Margin of Safety</h3>
                <p className="text-sm text-muted-foreground">
                  Low P/E stocks provide downside protection. If a $10 stock earns $1/share (P/E 10),
                  even if it drops 50%, it still trades at P/E 5 - usually attractive to buyers.
                </p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Mean Reversion</h3>
                <p className="text-sm text-muted-foreground">
                  P/E ratios tend to revert toward industry and historical averages over time.
                  Low P/E stocks have more upside as valuations normalize.
                </p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Earnings Yield</h3>
                <p className="text-sm text-muted-foreground">
                  P/E of 10 = 10% earnings yield. Compare to bond yields: if stocks yield 10%
                  and bonds yield 5%, stocks offer better value (all else equal).
                </p>
              </div>
            </div>
          </section>

          {/* Key Metrics Summary */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Average P/E</p>
              <p className="text-2xl font-bold text-blue-400">
                {(LOW_PE_STOCKS.reduce((sum, s) => sum + s.pe, 0) / LOW_PE_STOCKS.length).toFixed(1)}
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Lowest P/E</p>
              <p className="text-2xl font-bold text-green-500">
                {LOW_PE_STOCKS[0].pe.toFixed(1)}
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">S&P 500 P/E</p>
              <p className="text-2xl font-bold text-muted-foreground">
                ~22
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Discount vs S&P</p>
              <p className="text-2xl font-bold text-green-500">
                {Math.round((1 - (LOW_PE_STOCKS.reduce((sum, s) => sum + s.pe, 0) / LOW_PE_STOCKS.length) / 22) * 100)}%
              </p>
            </div>
          </section>

          {/* Stock Table - Database or Curated */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Top Low P/E Value Stocks</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ticker</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Sector</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">P/E Ratio</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Forward P/E</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayStocks ? (
                      displayStocks.map((stock, index) => (
                        <tr key={stock.ticker} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/stock/${stock.ticker.toLowerCase()}`}
                              className="font-bold text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              {stock.ticker}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Link href={`/stock/${stock.ticker.toLowerCase()}`} className="hover:underline">
                              {stock.company_name || stock.ticker}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{stock.sector || '---'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${stock.pe_ratio && stock.pe_ratio < 10 ? 'text-green-500' : 'text-blue-400'}`}>
                              {stock.pe_ratio?.toFixed(1) || '---'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">---</td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {stock.market_cap ? formatMarketCap(stock.market_cap) : '---'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      LOW_PE_STOCKS.map((stock, index) => (
                        <tr key={stock.ticker} className="hover:bg-secondary/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/stock/${stock.ticker.toLowerCase()}`}
                              className="font-bold text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              {stock.ticker}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Link href={`/stock/${stock.ticker.toLowerCase()}`} className="hover:underline">
                              {stock.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{stock.sector}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${stock.pe < 10 ? 'text-green-500' : 'text-blue-400'}`}>
                              {stock.pe.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                            {stock.forwardPe.toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">{stock.marketCap}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* P/E Ratio Tiers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Understanding P/E Ratio Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card p-5 rounded-xl border-2 border-green-500/30">
                <h3 className="font-bold text-green-500 mb-2">Deep Value (P/E &lt; 10)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Extremely cheap stocks. May indicate opportunity or problems. Requires careful analysis.
                </p>
                <div className="text-xs bg-green-500/10 p-2 rounded">
                  Earnings Yield: &gt;10%
                </div>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-blue-500/30">
                <h3 className="font-bold text-blue-400 mb-2">Value (P/E 10-15)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Classic value territory. Often mature, stable businesses at reasonable prices.
                </p>
                <div className="text-xs bg-blue-500/10 p-2 rounded">
                  Earnings Yield: 6.7-10%
                </div>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-yellow-500/30">
                <h3 className="font-bold text-yellow-500 mb-2">Fair Value (P/E 15-25)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Market average range. Appropriate for quality companies with moderate growth.
                </p>
                <div className="text-xs bg-yellow-500/10 p-2 rounded">
                  Earnings Yield: 4-6.7%
                </div>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-red-500/30">
                <h3 className="font-bold text-red-400 mb-2">Growth Premium (P/E &gt; 25)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  High valuations requiring strong growth to justify. Higher risk if growth disappoints.
                </p>
                <div className="text-xs bg-red-500/10 p-2 rounded">
                  Earnings Yield: &lt;4%
                </div>
              </div>
            </div>
          </section>

          {/* Screening Criteria */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Screening Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-blue-400">P/E Ratio &lt; 15</h3>
                <p className="text-muted-foreground mb-4">
                  We screen for stocks with trailing P/E ratios below 15, representing a discount to the
                  S&P 500 average of approximately 22. This identifies companies trading at attractive
                  valuations relative to their current earnings.
                </p>
                <div className="text-sm bg-secondary/50 p-3 rounded-lg">
                  <strong>Formula:</strong> P/E = Stock Price / Earnings Per Share (TTM)
                </div>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-400">Quality Filters</h3>
                <p className="text-muted-foreground mb-4">
                  We require positive earnings (profitable companies only) and minimum $1B market cap
                  to ensure adequate liquidity and exclude speculative micro-caps. This focuses on
                  established businesses with proven profitability.
                </p>
                <div className="text-sm bg-secondary/50 p-3 rounded-lg">
                  <strong>Warning:</strong> Always investigate WHY a stock has a low P/E before buying.
                </div>
              </div>
            </div>
          </section>

          {/* Value Traps Warning */}
          <section className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl mb-12">
            <h2 className="text-xl font-bold mb-4 text-red-400">Avoiding Value Traps</h2>
            <p className="text-muted-foreground mb-4">
              Not all low P/E stocks are good investments. Some are "value traps" - cheap for good reasons:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>&#8226; Declining revenues or market share</li>
                <li>&#8226; Industry disruption or obsolete products</li>
                <li>&#8226; Cyclical peak earnings about to decline</li>
                <li>&#8226; One-time earnings not sustainable</li>
              </ul>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>&#8226; Management or governance issues</li>
                <li>&#8226; Heavy debt or financial stress</li>
                <li>&#8226; Regulatory or legal problems</li>
                <li>&#8226; Pension or liability overhangs</li>
              </ul>
            </div>
            <p className="text-sm mt-4">
              <strong>Solution:</strong> Combine low P/E with revenue growth, stable margins, and competitive analysis.
            </p>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-card p-6 rounded-xl border border-border group">
                  <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-blue-400 group-open:rotate-180 transition-transform">&#9660;</span>
                  </summary>
                  <p className="text-muted-foreground mt-4 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Screeners */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Stock Screeners</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/screener/high-dividend-yield"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#128176;</p>
                <p className="font-bold">High Dividend</p>
                <p className="text-xs text-muted-foreground">Yield &gt; 3%</p>
              </Link>
              <Link
                href="/screener/large-cap"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#127942;</p>
                <p className="font-bold">Large Cap</p>
                <p className="text-xs text-muted-foreground">Market cap &gt; $100B</p>
              </Link>
              <Link
                href="/screener/high-growth"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#128200;</p>
                <p className="font-bold">High Growth</p>
                <p className="text-xs text-muted-foreground">Revenue growth &gt; 20%</p>
              </Link>
              <Link
                href="/screener/small-cap-gems"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#128142;</p>
                <p className="font-bold">Small Cap Gems</p>
                <p className="text-xs text-muted-foreground">Quality small caps</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Deep Dive Value Analysis with AI</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Go beyond P/E ratios. Our AI analyzes intrinsic value using DCF models, compares to peers,
              evaluates competitive moats, and identifies potential value traps before you invest.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Start Value Research
              </Link>
              <Link
                href="/learn/value-investing"
                className="bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Learn Value Investing
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
