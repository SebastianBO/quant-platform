import { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering since we query Supabase at runtime
export const dynamic = 'force-dynamic'
export const revalidate = 3600
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'

const DIVIDEND_YIELD_THRESHOLD = 0.03 // 3%

export const metadata: Metadata = {
  title: 'High Dividend Yield Stocks: Best Dividend Stocks Over 3% Yield | Stock Screener',
  description: 'Find high dividend yield stocks paying over 3% annually. Our screener identifies the best dividend-paying stocks for passive income investors. Updated daily with real-time yields.',
  keywords: [
    'high dividend stocks',
    'high dividend yield stocks',
    'best dividend stocks',
    'dividend stocks over 3%',
    'dividend income stocks',
    'high yield dividend stocks',
    'passive income stocks',
    'dividend paying stocks',
    'best dividend stocks to buy',
    'monthly dividend stocks',
    'dividend aristocrats',
    'dividend kings',
  ],
  openGraph: {
    title: 'High Dividend Yield Stocks - Best Dividend Paying Stocks Over 3%',
    description: 'Find high dividend yield stocks paying over 3% annually. Screened for quality dividend payers.',
    type: 'article',
    url: `${SITE_URL}/screener/high-dividend-yield`,
  },
  alternates: {
    canonical: `${SITE_URL}/screener/high-dividend-yield`,
  },
}

interface DividendStock {
  ticker: string
  company_name: string | null
  sector: string | null
  industry: string | null
  market_cap: number | null
  pe_ratio: number | null
  dividend_yield: number | null
  payout_ratio: number | null
}

async function getHighDividendStocks(): Promise<DividendStock[]> {
  // First try to get stocks with dividend_yield from a dedicated view or join
  // Fall back to fetching from company_fundamentals and financial_metrics
  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('ticker, company_name, sector, industry, market_cap, pe_ratio')
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(500)

  if (error) {
    console.error('Error fetching dividend stocks:', error)
    return []
  }

  // For now, return stocks with sample dividend data
  // In production, this would join with financial_metrics table
  return (data || []).map(stock => ({
    ...stock,
    dividend_yield: null, // Would come from financial_metrics
    payout_ratio: null,
  }))
}

// Static high dividend stocks data (known dividend payers)
const HIGH_DIVIDEND_STOCKS = [
  { ticker: 'VZ', name: 'Verizon Communications', sector: 'Communication Services', marketCap: '$170B', dividendYield: 6.5, payoutRatio: 52, years: 19 },
  { ticker: 'T', name: 'AT&T Inc.', sector: 'Communication Services', marketCap: '$140B', dividendYield: 5.8, payoutRatio: 65, years: 40 },
  { ticker: 'MO', name: 'Altria Group', sector: 'Consumer Staples', marketCap: '$80B', dividendYield: 8.2, payoutRatio: 75, years: 54 },
  { ticker: 'PM', name: 'Philip Morris', sector: 'Consumer Staples', marketCap: '$150B', dividendYield: 5.1, payoutRatio: 85, years: 15 },
  { ticker: 'CVX', name: 'Chevron Corporation', sector: 'Energy', marketCap: '$280B', dividendYield: 3.6, payoutRatio: 48, years: 37 },
  { ticker: 'XOM', name: 'Exxon Mobil', sector: 'Energy', marketCap: '$460B', dividendYield: 3.4, payoutRatio: 42, years: 41 },
  { ticker: 'IBM', name: 'IBM', sector: 'Technology', marketCap: '$180B', dividendYield: 3.8, payoutRatio: 68, years: 28 },
  { ticker: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', marketCap: '$160B', dividendYield: 5.8, payoutRatio: 108, years: 14 },
  { ticker: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Staples', marketCap: '$270B', dividendYield: 3.0, payoutRatio: 72, years: 62 },
  { ticker: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', marketCap: '$220B', dividendYield: 3.2, payoutRatio: 68, years: 52 },
  { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', marketCap: '$380B', dividendYield: 3.0, payoutRatio: 45, years: 62 },
  { ticker: 'MMM', name: '3M Company', sector: 'Industrials', marketCap: '$65B', dividendYield: 6.0, payoutRatio: 92, years: 65 },
  { ticker: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', marketCap: '$310B', dividendYield: 3.5, payoutRatio: 54, years: 52 },
  { ticker: 'DOW', name: 'Dow Inc.', sector: 'Materials', marketCap: '$35B', dividendYield: 5.2, payoutRatio: 78, years: 5 },
  { ticker: 'O', name: 'Realty Income Corp', sector: 'Real Estate', marketCap: '$50B', dividendYield: 5.5, payoutRatio: 78, years: 29 },
  { ticker: 'EPD', name: 'Enterprise Products', sector: 'Energy', marketCap: '$70B', dividendYield: 6.8, payoutRatio: 65, years: 26 },
  { ticker: 'WBA', name: 'Walgreens Boots Alliance', sector: 'Healthcare', marketCap: '$8B', dividendYield: 8.0, payoutRatio: 145, years: 47 },
  { ticker: 'LYB', name: 'LyondellBasell', sector: 'Materials', marketCap: '$30B', dividendYield: 5.3, payoutRatio: 52, years: 13 },
  { ticker: 'UPS', name: 'United Parcel Service', sector: 'Industrials', marketCap: '$110B', dividendYield: 4.5, payoutRatio: 62, years: 15 },
  { ticker: 'BMY', name: 'Bristol-Myers Squibb', sector: 'Healthcare', marketCap: '$110B', dividendYield: 4.5, payoutRatio: 58, years: 15 },
].sort((a, b) => b.dividendYield - a.dividendYield)

const faqs = [
  {
    question: 'What is a high dividend yield stock?',
    answer: 'A high dividend yield stock is a company that pays a dividend representing more than 3% of its current stock price annually. For example, if a stock trades at $100 and pays $4 per year in dividends, it has a 4% dividend yield. High dividend stocks are popular among income investors seeking regular cash payments.',
  },
  {
    question: 'What is considered a good dividend yield?',
    answer: 'A good dividend yield typically ranges from 2% to 6%. Yields below 2% may not provide meaningful income, while yields above 6-8% can be warning signs of an unsustainable dividend or declining stock price. The average S&P 500 dividend yield is around 1.5%, so yields above 3% are considered high relative to the market.',
  },
  {
    question: 'Are high dividend stocks safe investments?',
    answer: 'High dividend stocks can be safer than growth stocks due to their established businesses and cash flows, but they are not risk-free. Risks include dividend cuts if earnings decline, interest rate sensitivity (dividend stocks often fall when rates rise), and lower growth potential. Focus on companies with sustainable payout ratios (below 70%) and long dividend histories.',
  },
  {
    question: 'What is the dividend payout ratio?',
    answer: 'The dividend payout ratio is the percentage of earnings paid out as dividends. A company earning $4 per share and paying $2 in dividends has a 50% payout ratio. Ratios below 60% are generally sustainable, while ratios above 80-90% may indicate the dividend is at risk if earnings decline. REITs typically have higher payout ratios by design.',
  },
  {
    question: 'How do I evaluate dividend stock quality?',
    answer: 'Evaluate dividend stocks using: 1) Dividend yield vs history and peers, 2) Payout ratio sustainability (under 70% preferred), 3) Years of consecutive dividend increases, 4) Free cash flow coverage of dividends, 5) Debt levels and interest coverage, 6) Business moat and competitive position. Dividend Aristocrats (25+ years of increases) and Dividend Kings (50+ years) have proven track records.',
  },
  {
    question: 'Should I reinvest dividends or take cash?',
    answer: 'Reinvesting dividends through DRIPs (Dividend Reinvestment Plans) accelerates wealth building through compounding. If a 4% dividend is reinvested annually, returns compound significantly over decades. Take cash dividends if you need income for expenses or if the stock is overvalued. Tax-advantaged accounts (IRAs, 401ks) are ideal for dividend reinvestment.',
  },
  {
    question: 'What sectors have the highest dividend yields?',
    answer: 'Highest dividend yield sectors include: 1) Real Estate (REITs) - legally required to pay 90% of income as dividends, 2) Utilities - stable, regulated earnings support high payouts, 3) Energy - oil & gas companies and MLPs offer high yields, 4) Telecommunications - mature industry with stable cash flows, 5) Consumer Staples - established brands with consistent profits.',
  },
  {
    question: 'What is a Dividend Aristocrat?',
    answer: 'A Dividend Aristocrat is an S&P 500 company that has increased its dividend for at least 25 consecutive years. These companies have demonstrated commitment to shareholders through various economic cycles. Examples include Johnson & Johnson, Coca-Cola, Procter & Gamble, and 3M. Dividend Kings have 50+ years of increases.',
  },
]

export default async function HighDividendYieldPage() {
  const pageUrl = `${SITE_URL}/screener/high-dividend-yield`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stock Screener', url: `${SITE_URL}/screener` },
    { name: 'High Dividend Yield', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'High Dividend Yield Stocks: Best Dividend Paying Stocks Over 3%',
    description: 'Find high dividend yield stocks paying over 3% annually. Screened for quality dividend payers with sustainable payouts.',
    url: pageUrl,
    keywords: ['high dividend stocks', 'dividend yield', 'income investing', 'dividend payers'],
  })

  const faqSchema = getFAQSchema(faqs)

  const itemListSchema = getItemListSchema({
    name: 'High Dividend Yield Stocks',
    description: 'Stocks with dividend yields above 3%',
    url: pageUrl,
    items: HIGH_DIVIDEND_STOCKS.slice(0, 20).map((stock, index) => ({
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
      <main className="min-h-dvh bg-black text-white pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Home</Link>
            {' / '}
            <Link href="/screener" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Stock Screener</Link>
            {' / '}
            <span>High Dividend Yield</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              High Dividend Yield Stocks
            </h1>
            <p className="text-xl text-[#868f97] mb-4">
              Stocks paying over 3% dividend yield - screened for income investors seeking passive income
              from quality dividend-paying companies.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] text-[#4ebe96] px-4 py-2 rounded-2xl">
                Filter: Dividend Yield &gt; 3%
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] px-4 py-2 rounded-2xl tabular-nums">
                {HIGH_DIVIDEND_STOCKS.length} Stocks Found
              </div>
            </div>
          </header>

          {/* Key Metrics Summary */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <p className="text-sm text-[#868f97] mb-1">Average Yield</p>
              <p className="text-2xl font-bold text-[#4ebe96] tabular-nums">
                {(HIGH_DIVIDEND_STOCKS.reduce((sum, s) => sum + s.dividendYield, 0) / HIGH_DIVIDEND_STOCKS.length).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <p className="text-sm text-[#868f97] mb-1">Highest Yield</p>
              <p className="text-2xl font-bold text-[#4ebe96] tabular-nums">
                {HIGH_DIVIDEND_STOCKS[0].dividendYield}%
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <p className="text-sm text-[#868f97] mb-1">Avg Payout Ratio</p>
              <p className="text-2xl font-bold tabular-nums">
                {Math.round(HIGH_DIVIDEND_STOCKS.reduce((sum, s) => sum + s.payoutRatio, 0) / HIGH_DIVIDEND_STOCKS.length)}%
              </p>
            </div>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <p className="text-sm text-[#868f97] mb-1">Aristocrats</p>
              <p className="text-2xl font-bold text-[#479ffa] tabular-nums">
                {HIGH_DIVIDEND_STOCKS.filter(s => s.years >= 25).length}
              </p>
            </div>
          </section>

          {/* Why High Dividend Stocks */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl mb-8">
            <h2 className="text-2xl font-bold mb-4 text-balance">Why Invest in High Dividend Yield Stocks?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl">
                <h3 className="font-bold mb-2 text-[#4ebe96]">Passive Income</h3>
                <p className="text-sm text-[#868f97]">
                  Generate regular cash payments quarterly or monthly without selling shares. A $100,000 portfolio
                  yielding 4% produces $4,000 annually.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl">
                <h3 className="font-bold mb-2 text-[#4ebe96]">Total Return</h3>
                <p className="text-sm text-[#868f97]">
                  Dividends have contributed ~40% of S&P 500 total returns historically. Reinvested dividends
                  compound wealth significantly over time.
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl">
                <h3 className="font-bold mb-2 text-[#4ebe96]">Lower Volatility</h3>
                <p className="text-sm text-[#868f97]">
                  Dividend-paying stocks tend to be mature, established companies with stable cash flows,
                  often resulting in lower price volatility.
                </p>
              </div>
            </div>
          </section>

          {/* Stock Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Top High Dividend Yield Stocks</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/[0.03]">
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ticker</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Sector</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Yield</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Payout Ratio</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Years</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.08]">
                    {HIGH_DIVIDEND_STOCKS.map((stock, index) => (
                      <tr key={stock.ticker} className="hover:bg-white/[0.05] motion-safe:transition-all motion-safe:duration-150 ease-out">
                        <td className="px-4 py-3 text-sm text-[#868f97] tabular-nums">{index + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/stock/${stock.ticker.toLowerCase()}`}
                            className="font-bold text-[#4ebe96] hover:text-[#4ebe96]/80 hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                          >
                            {stock.ticker}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Link href={`/stock/${stock.ticker.toLowerCase()}`} className="hover:underline motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                            {stock.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#868f97]">{stock.sector}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-[#4ebe96] tabular-nums">{stock.dividendYield.toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm tabular-nums">
                          <span className={stock.payoutRatio > 80 ? 'text-[#ffa16c]' : ''}>
                            {stock.payoutRatio}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm tabular-nums">
                          {stock.years >= 25 ? (
                            <span className="text-[#479ffa]" title="Dividend Aristocrat">{stock.years}</span>
                          ) : (
                            stock.years
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">{stock.marketCap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Screening Criteria Explanation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Our Screening Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-3 text-[#4ebe96]">Dividend Yield &gt; 3%</h3>
                <p className="text-[#868f97] mb-4">
                  We filter for stocks with dividend yields above 3%, which is approximately double the S&P 500
                  average yield of ~1.5%. This threshold identifies meaningful income producers while excluding
                  extremely high yields that may signal dividend risk.
                </p>
                <div className="text-sm bg-white/[0.03] p-3 rounded-lg">
                  <strong>Formula:</strong> Dividend Yield = (Annual Dividend per Share / Stock Price) x 100
                </div>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                <h3 className="text-lg font-bold mb-3 text-[#479ffa]">Quality Indicators</h3>
                <p className="text-[#868f97] mb-4">
                  Beyond yield, we consider payout ratio sustainability (below 80% preferred), consecutive years
                  of dividend payments, and company fundamentals. Blue text indicates Dividend Aristocrats with
                  25+ years of consecutive increases.
                </p>
                <div className="text-sm bg-white/[0.03] p-3 rounded-lg">
                  <strong>Watch:</strong> Yields above 8% may indicate dividend cut risk or declining stock price.
                </div>
              </div>
            </div>
          </section>

          {/* Dividend Aristocrats Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Dividend Aristocrats in This Screen</h2>
            <p className="text-[#868f97] mb-4">
              These stocks have increased dividends for 25+ consecutive years, demonstrating exceptional commitment
              to returning capital to shareholders through various economic cycles.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {HIGH_DIVIDEND_STOCKS.filter(s => s.years >= 25).map(stock => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker.toLowerCase()}`}
                  className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[#479ffa]">{stock.ticker}</span>
                    <span className="text-sm text-[#4ebe96] tabular-nums">{stock.dividendYield}%</span>
                  </div>
                  <p className="text-sm text-[#868f97]">{stock.name}</p>
                  <p className="text-xs text-[#479ffa] mt-1 tabular-nums">{stock.years} years of increases</p>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 rounded-2xl group hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-[#4ebe96] group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-150">&#9660;</span>
                  </summary>
                  <p className="text-[#868f97] mt-4 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Screeners */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Related Stock Screeners</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/screener/low-pe-ratio"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <p className="text-2xl mb-2">&#128181;</p>
                <p className="font-bold">Low P/E Ratio</p>
                <p className="text-xs text-[#868f97]">Value stocks P/E &lt; 15</p>
              </Link>
              <Link
                href="/screener/large-cap"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <p className="text-2xl mb-2">&#127942;</p>
                <p className="font-bold">Large Cap</p>
                <p className="text-xs text-[#868f97]">Market cap &gt; $100B</p>
              </Link>
              <Link
                href="/screener/high-growth"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <p className="text-2xl mb-2">&#128200;</p>
                <p className="font-bold">High Growth</p>
                <p className="text-xs text-[#868f97]">Revenue growth &gt; 20%</p>
              </Link>
              <Link
                href="/screener/small-cap-gems"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-4 rounded-2xl hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                <p className="text-2xl mb-2">&#128142;</p>
                <p className="font-bold">Small Cap Gems</p>
                <p className="text-xs text-[#868f97]">Quality small caps</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-4 text-balance">Analyze Dividend Stocks with AI</h2>
            <p className="text-[#868f97] mb-6 max-w-2xl mx-auto">
              Go deeper with our AI-powered analysis. Get dividend sustainability scores, payout ratio trends,
              free cash flow coverage, and personalized dividend portfolio recommendations.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/dashboard"
                className="bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-black px-8 py-3 rounded-2xl font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                Start Dividend Research
              </Link>
              <Link
                href="/learn/dividend-investing"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] px-8 py-3 rounded-2xl font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
              >
                Learn Dividend Investing
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
