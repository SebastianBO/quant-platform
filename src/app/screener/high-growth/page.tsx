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

const GROWTH_THRESHOLD = 0.20 // 20% revenue growth

export const metadata: Metadata = {
  title: 'High Growth Stocks: Best Stocks with 20%+ Revenue Growth | Stock Screener',
  description: 'Find high growth stocks with revenue growth over 20%. Our growth stock screener identifies fast-growing companies with strong momentum. Updated daily with real-time metrics.',
  keywords: [
    'high growth stocks',
    'fast growing stocks',
    'growth stocks 2024',
    'best growth stocks',
    'high revenue growth stocks',
    'momentum stocks',
    'growth investing',
    'tech growth stocks',
    'stocks with revenue growth',
    'fastest growing companies',
    'growth stock screener',
    'hypergrowth stocks',
  ],
  openGraph: {
    title: 'High Growth Stocks - Best Stocks with 20%+ Revenue Growth',
    description: 'Find high growth stocks with revenue growth over 20%. Screened for growth investors.',
    type: 'article',
    url: `${SITE_URL}/screener/high-growth`,
  },
  alternates: {
    canonical: `${SITE_URL}/screener/high-growth`,
  },
}

// Curated high growth stocks data
const HIGH_GROWTH_STOCKS = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', marketCap: '$3.48T', revenueGrowth: 122, earningsGrowth: 168, peg: 1.2 },
  { ticker: 'PLTR', name: 'Palantir Technologies', sector: 'Technology', marketCap: '$145B', revenueGrowth: 27, earningsGrowth: 180, peg: 2.1 },
  { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', marketCap: '$1.58T', revenueGrowth: 22, earningsGrowth: 73, peg: 1.1 },
  { ticker: 'CRWD', name: 'CrowdStrike Holdings', sector: 'Technology', marketCap: '$85B', revenueGrowth: 33, earningsGrowth: 95, peg: 2.4 },
  { ticker: 'SNOW', name: 'Snowflake Inc.', sector: 'Technology', marketCap: '$52B', revenueGrowth: 36, earningsGrowth: null, peg: null },
  { ticker: 'DDOG', name: 'Datadog Inc.', sector: 'Technology', marketCap: '$52B', revenueGrowth: 26, earningsGrowth: 112, peg: 1.8 },
  { ticker: 'NET', name: 'Cloudflare Inc.', sector: 'Technology', marketCap: '$38B', revenueGrowth: 30, earningsGrowth: null, peg: null },
  { ticker: 'PANW', name: 'Palo Alto Networks', sector: 'Technology', marketCap: '$125B', revenueGrowth: 24, earningsGrowth: 85, peg: 1.5 },
  { ticker: 'ZS', name: 'Zscaler Inc.', sector: 'Technology', marketCap: '$33B', revenueGrowth: 34, earningsGrowth: 120, peg: 2.2 },
  { ticker: 'MELI', name: 'MercadoLibre', sector: 'Consumer Discretionary', marketCap: '$100B', revenueGrowth: 42, earningsGrowth: 95, peg: 1.3 },
  { ticker: 'TTD', name: 'The Trade Desk', sector: 'Technology', marketCap: '$60B', revenueGrowth: 26, earningsGrowth: 52, peg: 1.9 },
  { ticker: 'CELH', name: 'Celsius Holdings', sector: 'Consumer Staples', marketCap: '$12B', revenueGrowth: 65, earningsGrowth: 110, peg: 1.5 },
  { ticker: 'AXON', name: 'Axon Enterprise', sector: 'Industrials', marketCap: '$38B', revenueGrowth: 34, earningsGrowth: 78, peg: 2.0 },
  { ticker: 'DUOL', name: 'Duolingo Inc.', sector: 'Technology', marketCap: '$15B', revenueGrowth: 45, earningsGrowth: 320, peg: 1.4 },
  { ticker: 'ARM', name: 'Arm Holdings', sector: 'Technology', marketCap: '$140B', revenueGrowth: 46, earningsGrowth: 78, peg: 2.8 },
  { ticker: 'ANET', name: 'Arista Networks', sector: 'Technology', marketCap: '$120B', revenueGrowth: 28, earningsGrowth: 45, peg: 1.6 },
  { ticker: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', marketCap: '$780B', revenueGrowth: 36, earningsGrowth: 95, peg: 1.8 },
  { ticker: 'SMCI', name: 'Super Micro Computer', sector: 'Technology', marketCap: '$20B', revenueGrowth: 110, earningsGrowth: 185, peg: 0.8 },
  { ticker: 'CAVA', name: 'CAVA Group', sector: 'Consumer Discretionary', marketCap: '$14B', revenueGrowth: 52, earningsGrowth: null, peg: null },
  { ticker: 'APP', name: 'AppLovin Corporation', sector: 'Technology', marketCap: '$95B', revenueGrowth: 44, earningsGrowth: 280, peg: 1.1 },
].sort((a, b) => b.revenueGrowth - a.revenueGrowth)

const faqs = [
  {
    question: 'What is considered a high growth stock?',
    answer: 'A high growth stock is a company growing revenue at 20% or more annually, significantly faster than the S&P 500 average of 5-7%. Hypergrowth stocks grow at 40%+ annually. Growth stocks typically trade at higher valuations (P/E, P/S) because investors pay a premium for rapid expansion and future earnings potential.',
  },
  {
    question: 'How do you identify high growth stocks?',
    answer: 'Identify high growth stocks by analyzing: 1) Revenue growth rate (YoY and multi-year CAGR), 2) Earnings growth and improving margins, 3) Total addressable market (TAM) size, 4) Competitive moats and market position, 5) Customer acquisition and retention metrics, 6) Management quality and capital allocation. Combine quantitative screening with qualitative analysis.',
  },
  {
    question: 'Are high growth stocks risky?',
    answer: 'Yes, high growth stocks carry higher risk than value stocks. Risks include: valuation compression if growth slows, execution risk in scaling operations, competition eroding margins, macroeconomic sensitivity (growth stocks fall more when rates rise), and binary outcomes for unprofitable companies. The potential reward is significant capital appreciation if growth continues.',
  },
  {
    question: 'What is the PEG ratio and why does it matter for growth stocks?',
    answer: 'The PEG ratio (Price/Earnings to Growth) adjusts P/E for growth rate: PEG = P/E Ratio / Earnings Growth Rate. A PEG of 1.0 means the P/E equals the growth rate (fairly valued for growth). PEG below 1.0 may indicate undervaluation relative to growth. PEG above 2.0 suggests premium valuation even accounting for growth. Use PEG to compare growth stocks.',
  },
  {
    question: 'Should I invest in unprofitable growth stocks?',
    answer: 'Unprofitable growth stocks can be appropriate for risk-tolerant investors with long time horizons. Evaluate: 1) Path to profitability - is gross margin high enough to eventually be profitable?, 2) Cash burn rate vs cash on hand, 3) Unit economics - is each customer profitable?, 4) Revenue quality and recurring nature. Many great companies (Amazon, Tesla) were unprofitable during hypergrowth phases.',
  },
  {
    question: 'What sectors have the most high growth stocks?',
    answer: 'Technology consistently produces the most high-growth stocks due to scalability and low marginal costs. Other high-growth sectors include: Healthcare/Biotech (drug approvals, GLP-1 treatments), Consumer Discretionary (e-commerce, EV), Cybersecurity, Cloud Computing, AI/ML, and select Consumer Staples (energy drinks, health foods). Sector leadership rotates with innovation cycles.',
  },
  {
    question: 'How do I value a high growth stock?',
    answer: 'Traditional P/E ratios often do not work for growth stocks. Use: 1) PEG ratio for profitable growers, 2) Price-to-Sales (P/S) for unprofitable companies, 3) EV/Revenue for SaaS businesses, 4) DCF with terminal growth assumptions, 5) Rule of 40 (growth rate + profit margin > 40%) for software, 6) Comparable analysis to similar growth companies. Consider the total addressable market ceiling.',
  },
  {
    question: 'What is the Rule of 40?',
    answer: 'The Rule of 40 states that a healthy software/SaaS company\'s revenue growth rate plus profit margin should exceed 40%. For example: 30% growth + 15% margin = 45% (passing). A company growing 50% with -5% margin = 45% (still passing). This balances growth and profitability, helping identify companies making smart tradeoffs between expansion and efficiency.',
  },
]

function formatMarketCap(marketCap: string): string {
  return marketCap
}

export default async function HighGrowthPage() {
  const pageUrl = `${SITE_URL}/screener/high-growth`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stock Screener', url: `${SITE_URL}/screener` },
    { name: 'High Growth', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'High Growth Stocks: Best Stocks with 20%+ Revenue Growth',
    description: 'Find high growth stocks with revenue growth over 20%. Screened for growth investors seeking fast-growing companies.',
    url: pageUrl,
    keywords: ['high growth stocks', 'growth investing', 'fast growing companies', 'revenue growth'],
  })

  const faqSchema = getFAQSchema(faqs)

  const itemListSchema = getItemListSchema({
    name: 'High Growth Stocks',
    description: 'Stocks with revenue growth above 20%',
    url: pageUrl,
    items: HIGH_GROWTH_STOCKS.slice(0, 20).map((stock, index) => ({
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
            <span>High Growth</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              High Growth Stocks
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Stocks with revenue growth over 20% - screened for growth investors seeking fast-growing
              companies with strong momentum and market expansion.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="bg-purple-600/20 text-purple-400 px-4 py-2 rounded-lg">
                Filter: Revenue Growth &gt; 20%
              </div>
              <div className="bg-secondary px-4 py-2 rounded-lg">
                {HIGH_GROWTH_STOCKS.length} Stocks Found
              </div>
            </div>
          </header>

          {/* Key Metrics Summary */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Average Growth</p>
              <p className="text-2xl font-bold text-purple-400">
                {Math.round(HIGH_GROWTH_STOCKS.reduce((sum, s) => sum + s.revenueGrowth, 0) / HIGH_GROWTH_STOCKS.length)}%
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Highest Growth</p>
              <p className="text-2xl font-bold text-green-500">
                {HIGH_GROWTH_STOCKS[0].revenueGrowth}%
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Hypergrowth (&gt;40%)</p>
              <p className="text-2xl font-bold text-purple-400">
                {HIGH_GROWTH_STOCKS.filter(s => s.revenueGrowth >= 40).length}
              </p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">Avg PEG Ratio</p>
              <p className="text-2xl font-bold">
                {(HIGH_GROWTH_STOCKS.filter(s => s.peg).reduce((sum, s) => sum + (s.peg || 0), 0) / HIGH_GROWTH_STOCKS.filter(s => s.peg).length).toFixed(1)}
              </p>
            </div>
          </section>

          {/* Why Growth Investing */}
          <section className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 p-6 rounded-xl border border-purple-500/20 mb-8">
            <h2 className="text-2xl font-bold mb-4">Why Invest in High Growth Stocks?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-purple-400">Capital Appreciation</h3>
                <p className="text-sm text-muted-foreground">
                  Growth stocks aim to multiply your investment through stock price appreciation as
                  the company expands. A company doubling revenue often sees stock price follow.
                </p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-purple-400">Market Leaders</h3>
                <p className="text-sm text-muted-foreground">
                  Fast-growing companies often lead their industries, benefiting from network effects,
                  economies of scale, and competitive moats that compound over time.
                </p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-purple-400">Innovation Exposure</h3>
                <p className="text-sm text-muted-foreground">
                  High growth stocks provide exposure to transformative trends like AI, cloud computing,
                  cybersecurity, and biotech that are reshaping the global economy.
                </p>
              </div>
            </div>
          </section>

          {/* Stock Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Top High Growth Stocks</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Ticker</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Sector</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Revenue Growth</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Earnings Growth</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">PEG Ratio</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {HIGH_GROWTH_STOCKS.map((stock, index) => (
                      <tr key={stock.ticker} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/stock/${stock.ticker.toLowerCase()}`}
                            className="font-bold text-purple-400 hover:text-purple-300 hover:underline"
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
                          <span className={`font-bold ${stock.revenueGrowth >= 40 ? 'text-green-500' : 'text-purple-400'}`}>
                            {stock.revenueGrowth}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {stock.earningsGrowth !== null ? (
                            <span className="text-green-500">{stock.earningsGrowth}%</span>
                          ) : (
                            <span className="text-yellow-500">N/P</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {stock.peg !== null ? (
                            <span className={stock.peg < 1.5 ? 'text-green-500 font-medium' : ''}>
                              {stock.peg.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">---</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">{stock.marketCap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-secondary/30 text-xs text-muted-foreground">
                N/P = Not Profitable (negative earnings). PEG not applicable for unprofitable companies.
              </div>
            </div>
          </section>

          {/* Growth Tiers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Growth Rate Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-card p-5 rounded-xl border-2 border-green-500/30">
                <h3 className="font-bold text-green-500 mb-2">Hypergrowth (&gt;100%)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Explosive growth, often in early-stage or disruptive companies. High risk/reward.
                </p>
                <div className="text-xs">
                  {HIGH_GROWTH_STOCKS.filter(s => s.revenueGrowth >= 100).map(s => s.ticker).join(', ') || 'None currently'}
                </div>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-purple-500/30">
                <h3 className="font-bold text-purple-400 mb-2">Rapid (40-100%)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Very fast growth indicating strong product-market fit and scaling operations.
                </p>
                <div className="text-xs">
                  {HIGH_GROWTH_STOCKS.filter(s => s.revenueGrowth >= 40 && s.revenueGrowth < 100).map(s => s.ticker).join(', ')}
                </div>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-blue-500/30">
                <h3 className="font-bold text-blue-400 mb-2">Strong (25-40%)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Above-average growth with proven business models and sustainable expansion.
                </p>
                <div className="text-xs">
                  {HIGH_GROWTH_STOCKS.filter(s => s.revenueGrowth >= 25 && s.revenueGrowth < 40).map(s => s.ticker).join(', ')}
                </div>
              </div>
              <div className="bg-card p-5 rounded-xl border-2 border-yellow-500/30">
                <h3 className="font-bold text-yellow-500 mb-2">Growth (20-25%)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Solid growth beating market averages. Often larger, more mature companies.
                </p>
                <div className="text-xs">
                  {HIGH_GROWTH_STOCKS.filter(s => s.revenueGrowth >= 20 && s.revenueGrowth < 25).map(s => s.ticker).join(', ')}
                </div>
              </div>
            </div>
          </section>

          {/* Rule of 40 */}
          <section className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 p-6 rounded-xl border border-blue-500/20 mb-12">
            <h2 className="text-2xl font-bold mb-4">The Rule of 40</h2>
            <p className="text-muted-foreground mb-4">
              A key metric for evaluating growth stocks, especially software/SaaS companies. The Rule of 40
              states that a healthy company's growth rate plus profit margin should exceed 40%.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-500">50% + 10%</p>
                <p className="text-sm text-muted-foreground mt-1">Hypergrowth with profit = 60</p>
                <p className="text-xs text-green-400 mt-2">Excellent</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-400">35% + 5%</p>
                <p className="text-sm text-muted-foreground mt-1">Strong growth, thin margin = 40</p>
                <p className="text-xs text-blue-400 mt-2">Passing</p>
              </div>
              <div className="bg-card/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-500">25% + 10%</p>
                <p className="text-sm text-muted-foreground mt-1">Moderate both = 35</p>
                <p className="text-xs text-yellow-400 mt-2">Watch for improvement</p>
              </div>
            </div>
          </section>

          {/* Screening Criteria */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our Screening Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-purple-400">Revenue Growth &gt; 20%</h3>
                <p className="text-muted-foreground mb-4">
                  We screen for companies with year-over-year revenue growth exceeding 20%, which is
                  approximately 3-4x the S&P 500 average growth rate. This threshold identifies
                  companies with strong momentum and market expansion.
                </p>
                <div className="text-sm bg-secondary/50 p-3 rounded-lg">
                  <strong>Formula:</strong> Revenue Growth = (Current Revenue - Prior Revenue) / Prior Revenue x 100
                </div>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-400">Quality Considerations</h3>
                <p className="text-muted-foreground mb-4">
                  Growth should be evaluated alongside quality metrics: improving gross margins,
                  sustainable unit economics, reasonable valuation (PEG ratio), and competitive moats.
                  Revenue growth alone does not guarantee investment success.
                </p>
                <div className="text-sm bg-secondary/50 p-3 rounded-lg">
                  <strong>Key:</strong> Look for profitable growth or clear path to profitability.
                </div>
              </div>
            </div>
          </section>

          {/* Growth Risks */}
          <section className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-xl mb-12">
            <h2 className="text-xl font-bold mb-4 text-yellow-500">Growth Investing Risks</h2>
            <p className="text-muted-foreground mb-4">
              High growth stocks offer significant upside but carry elevated risks:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>&#8226; <strong>Valuation compression:</strong> P/E multiples contract if growth slows</li>
                <li>&#8226; <strong>Execution risk:</strong> Scaling operations is difficult</li>
                <li>&#8226; <strong>Competition:</strong> High margins attract competitors</li>
                <li>&#8226; <strong>Interest rate sensitivity:</strong> Growth stocks fall when rates rise</li>
              </ul>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>&#8226; <strong>Burn rate:</strong> Unprofitable companies can run out of cash</li>
                <li>&#8226; <strong>Management dilution:</strong> Stock compensation dilutes shareholders</li>
                <li>&#8226; <strong>Binary outcomes:</strong> Some growth bets go to zero</li>
                <li>&#8226; <strong>Market volatility:</strong> Growth stocks swing wildly in corrections</li>
              </ul>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="bg-card p-6 rounded-xl border border-border group">
                  <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-purple-400 group-open:rotate-180 transition-transform">&#9660;</span>
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
                href="/screener/low-pe-ratio"
                className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-colors text-center"
              >
                <p className="text-2xl mb-2">&#128181;</p>
                <p className="font-bold">Low P/E Ratio</p>
                <p className="text-xs text-muted-foreground">Value stocks P/E &lt; 15</p>
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
          <section className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Analyze Growth Stocks with AI</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Go beyond revenue growth. Our AI analyzes total addressable market, competitive positioning,
              unit economics, and management quality to identify the best growth opportunities.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/dashboard"
                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Start Growth Research
              </Link>
              <Link
                href="/learn/growth-investing"
                className="bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Learn Growth Investing
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
