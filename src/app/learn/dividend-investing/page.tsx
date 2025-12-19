import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getHowToSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Dividend Investing Guide: How to Build Passive Income with Dividends (2025)',
  description: 'Learn dividend investing strategies, how to find high-yield dividend stocks, dividend aristocrats, and build passive income. Complete guide to dividend stocks.',
  keywords: [
    'dividend investing',
    'dividend stocks',
    'high dividend yield stocks',
    'dividend aristocrats',
    'passive income investing',
    'how to invest in dividends',
    'best dividend stocks',
  ],
  openGraph: {
    title: 'Dividend Investing Guide - Build Passive Income with Dividend Stocks',
    description: 'Master dividend investing with strategies, screening criteria, and best practices for building passive income.',
    type: 'article',
    url: `${SITE_URL}/learn/dividend-investing`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/dividend-investing`,
  },
}

const howToSteps = [
  {
    name: 'Understand Dividend Basics',
    text: 'Learn key concepts: dividend yield (annual dividend / stock price), payout ratio (dividends / earnings), ex-dividend date (when you must own shares), and payment frequency. Most US companies pay quarterly, some monthly or annually.',
  },
  {
    name: 'Set Your Investment Goals',
    text: 'Determine if you want high current income (5%+ yields) or dividend growth (3-4% yields growing 10%+ annually). High yield may mean lower growth or higher risk. Younger investors often prefer growth; retirees prefer income.',
  },
  {
    name: 'Screen for Quality Dividend Stocks',
    text: 'Look for sustainable dividends: payout ratio below 60%, consistent dividend history (5+ years), strong cash flow, moderate debt, and competitive business. Avoid chasing the highest yields - they often signal problems.',
  },
  {
    name: 'Analyze Dividend Safety',
    text: 'Check if earnings and cash flow support the dividend. Calculate free cash flow payout ratio. Review dividend growth history. Read management commentary on capital allocation. A cut dividend often triggers sharp price drops.',
  },
  {
    name: 'Build a Diversified Portfolio',
    text: 'Spread investments across sectors (utilities, consumer staples, healthcare, REITs). Don\'t concentrate in one industry or high-yield stocks. Include some dividend growers for long-term wealth building. Aim for 20-30 positions.',
  },
  {
    name: 'Reinvest Dividends for Compounding',
    text: 'Reinvest dividends through DRIP (Dividend Reinvestment Plans) to buy more shares automatically. Compounding accelerates wealth building dramatically over 10+ years. $10,000 at 6% yield reinvested grows to $32,000 in 20 years.',
  },
]

const faqs = [
  {
    question: 'What is dividend investing?',
    answer: 'Dividend investing is a strategy focused on buying stocks that pay regular cash dividends to shareholders. Instead of relying solely on stock price appreciation, dividend investors generate passive income from their investments. Quality dividend stocks provide both income and potential capital appreciation, making them popular for retirement portfolios and long-term wealth building.',
  },
  {
    question: 'How do dividends work?',
    answer: 'Companies distribute a portion of profits to shareholders as dividends, typically quarterly. If you own 100 shares paying $2 annual dividend per share, you receive $200/year. Key dates: Declaration date (company announces dividend), Ex-dividend date (you must own shares before this), Record date (company checks who owns shares), and Payment date (cash deposited). Dividends can be taken as cash or reinvested to buy more shares.',
  },
  {
    question: 'What is a good dividend yield?',
    answer: 'A "good" yield depends on risk tolerance and goals. Generally: 2-3% is average for S&P 500, 3-5% is moderate/attractive, 5-7% is high (verify sustainability), 7%+ is very high (often risky - investigate why). Compare to industry peers and 10-year Treasury rate (~4% as of 2024). Higher yields aren\'t always better - they may signal financial distress or unsustainable payouts.',
  },
  {
    question: 'What are dividend aristocrats?',
    answer: 'Dividend Aristocrats are S&P 500 companies that have increased dividends for 25+ consecutive years. They demonstrate stable businesses, strong cash flow, and shareholder-friendly management. Examples include Coca-Cola, Johnson & Johnson, and Procter & Gamble. Dividend Kings have 50+ years of increases. These stocks offer reliability but may have lower yields due to premium valuations.',
  },
  {
    question: 'What is dividend payout ratio and why does it matter?',
    answer: 'Payout ratio = Dividends / Earnings (or Free Cash Flow). It shows what percentage of profits are paid as dividends. Under 60% is generally safe (room for growth and sustainability). 60-80% is moderate (less cushion if earnings decline). Over 80% is risky (little buffer, may force dividend cuts). Over 100% means paying more than earned - unsustainable. Lower payout ratios enable faster dividend growth.',
  },
  {
    question: 'Are dividend stocks good for retirement?',
    answer: 'Yes, dividend stocks are excellent for retirement because they provide regular income without selling shares, reduce sequence of returns risk, and historically have lower volatility than growth stocks. A portfolio yielding 4% on $1M generates $40,000 annual income. Many retirees combine dividend stocks with bonds for stable income. Start building a dividend portfolio 5-10 years before retirement.',
  },
  {
    question: 'How are dividends taxed?',
    answer: 'In the US, qualified dividends (held 60+ days) are taxed at favorable capital gains rates: 0%, 15%, or 20% depending on income. Non-qualified dividends are taxed as ordinary income (higher rates). Dividends in tax-advantaged accounts (IRA, 401k) grow tax-deferred. REITs and MLPs have special tax treatment. Consult a tax professional for your situation. Tax efficiency matters for taxable accounts.',
  },
  {
    question: 'What is the difference between dividend yield and dividend growth?',
    answer: 'Dividend yield = Annual dividend / Stock price (current income rate). Dividend growth = Percentage increase in dividend payment over time (future income growth). High-yield stocks (5-7%) often have slow growth. Dividend growth stocks (2-3% yield) often increase dividends 10-15% annually. Over 10+ years, dividend growth stocks often produce higher total returns through compounding. Choose based on whether you need income now (yield) or later (growth).',
  },
]

const dividendStrategies = [
  {
    name: 'Dividend Growth Investing',
    description: 'Focus on companies increasing dividends annually',
    yield: '2-4%',
    growth: '8-12%',
    bestFor: 'Long-term wealth building, younger investors',
  },
  {
    name: 'High Yield Investing',
    description: 'Target stocks with above-average current yields',
    yield: '5-8%',
    growth: '0-5%',
    bestFor: 'Current income needs, retirees',
  },
  {
    name: 'Dividend Aristocrats',
    description: 'Buy companies with 25+ years of dividend increases',
    yield: '2-3%',
    growth: '5-8%',
    bestFor: 'Conservative investors, reliability focus',
  },
  {
    name: 'REIT Investing',
    description: 'Real estate investment trusts with high payouts',
    yield: '4-7%',
    growth: '3-6%',
    bestFor: 'Income and real estate exposure',
  },
]

const exampleStocks = [
  { ticker: 'JNJ', name: 'Johnson & Johnson', yield: '~3.0%', why: 'Dividend King, 60+ years of increases' },
  { ticker: 'KO', name: 'Coca-Cola', yield: '~3.2%', why: 'Dividend Aristocrat, global brand' },
  { ticker: 'PG', name: 'Procter & Gamble', yield: '~2.5%', why: 'Consumer staples, steady growth' },
  { ticker: 'O', name: 'Realty Income', yield: '~5.5%', why: 'Monthly dividend REIT' },
]

export default function DividendInvestingPage() {
  const pageUrl = `${SITE_URL}/learn/dividend-investing`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'Dividend Investing', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Dividend Investing Guide: How to Build Passive Income with Dividend Stocks',
    description: 'Complete guide to dividend investing including strategies, screening criteria, and building a dividend portfolio for passive income.',
    url: pageUrl,
    keywords: ['dividend investing', 'dividend stocks', 'passive income', 'dividend yield', 'dividend aristocrats'],
  })

  const howToSchema = getHowToSchema({
    name: 'How to Start Dividend Investing',
    description: 'Step-by-step guide to building a dividend stock portfolio for passive income.',
    steps: howToSteps,
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, howToSchema, faqSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>Dividend Investing</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Dividend Investing: Build Passive Income
            </h1>
            <p className="text-xl text-muted-foreground">
              Learn how to build a portfolio of dividend-paying stocks that generates reliable passive income
              while growing your wealth over time. Master dividend screening, safety analysis, and portfolio construction.
            </p>
          </div>

          {/* What is Dividend Investing */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What is Dividend Investing?</h2>
            <p className="text-muted-foreground mb-4">
              Dividend investing is a strategy focused on building a portfolio of stocks that pay regular cash dividends.
              Instead of relying solely on stock price appreciation, dividend investors receive quarterly (or monthly) cash
              payments, creating a stream of passive income.
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mb-6">
              <h3 className="text-lg font-bold mb-3">The Power of Dividends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-bold text-green-500 mb-1">$10,000 Investment Example:</div>
                  <div className="text-muted-foreground">Stock at $100/share, 4% annual dividend</div>
                  <div className="text-muted-foreground mt-2">
                    • Year 1: 100 shares × $4 = $400 dividend<br />
                    • Reinvest to buy 4 more shares<br />
                    • Year 2: 104 shares × $4.16 = $433<br />
                    • After 20 years: ~$32,000 (with DRIP)
                  </div>
                </div>
                <div>
                  <div className="font-bold text-green-500 mb-1">Historical Performance:</div>
                  <div className="text-muted-foreground">
                    • Dividend stocks have outperformed non-dividend stocks historically<br />
                    • Dividends contribute ~40% of S&P 500 total returns since 1930<br />
                    • Lower volatility than growth stocks<br />
                    • Dividend cuts often precede price declines
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Start */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Start Dividend Investing</h2>
            <div className="space-y-6">
              {howToSteps.map((step, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.name}</h3>
                      <p className="text-muted-foreground">{step.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Metrics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Key Dividend Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Dividend Yield</h3>
                <div className="bg-background p-3 rounded font-mono text-sm mb-3">
                  Yield = Annual Dividend / Stock Price
                </div>
                <p className="text-sm text-muted-foreground">
                  Shows annual income rate. $100 stock paying $4/year = 4% yield. Higher yields aren't always better -
                  verify sustainability. Compare to 10-year Treasury and industry peers.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Payout Ratio</h3>
                <div className="bg-background p-3 rounded font-mono text-sm mb-3">
                  Payout = Dividends / Earnings
                </div>
                <p className="text-sm text-muted-foreground">
                  Percentage of earnings paid as dividends. Below 60% is safe, 60-80% moderate, above 80% risky.
                  Lower ratios leave room for dividend growth and protect against earnings volatility.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Dividend Growth Rate</h3>
                <div className="bg-background p-3 rounded font-mono text-sm mb-3">
                  Growth = (New Dividend / Old Dividend) - 1
                </div>
                <p className="text-sm text-muted-foreground">
                  Annual percentage increase in dividend payment. 10%+ growth is strong. Consistent growth indicates
                  business health and management commitment to shareholders.
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Free Cash Flow Payout</h3>
                <div className="bg-background p-3 rounded font-mono text-sm mb-3">
                  FCF Payout = Dividends / Free Cash Flow
                </div>
                <p className="text-sm text-muted-foreground">
                  More reliable than earnings payout. Cash is harder to manipulate. Below 70% is comfortable.
                  Important for capital-intensive businesses with high depreciation.
                </p>
              </div>
            </div>
          </section>

          {/* Strategies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Dividend Investing Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dividendStrategies.map((strategy) => (
                <div key={strategy.name} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-xl font-bold mb-2">{strategy.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Typical Yield</div>
                      <div className="font-bold text-green-500">{strategy.yield}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Annual Growth</div>
                      <div className="font-bold text-blue-500">{strategy.growth}</div>
                    </div>
                  </div>
                  <div className="text-xs bg-background p-3 rounded">
                    <span className="font-bold">Best for:</span> {strategy.bestFor}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Screening Criteria */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Screen for Quality Dividend Stocks</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Dividend Yield: 3-6%</div>
                    <div className="text-sm text-muted-foreground">
                      High enough for income, not so high it signals distress. Very high yields (8%+) often precede cuts.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Payout Ratio: Below 60%</div>
                    <div className="text-sm text-muted-foreground">
                      Sustainable dividends with room for growth. REITs typically higher (75-90%) due to structure.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Dividend History: 5+ Years</div>
                    <div className="text-sm text-muted-foreground">
                      Consistent payments through economic cycles. Look for stable or growing dividends, never cut.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Strong Balance Sheet</div>
                    <div className="text-sm text-muted-foreground">
                      Debt-to-equity below industry average. Strong cash reserves. Interest coverage ratio above 5x.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Competitive Moat</div>
                    <div className="text-sm text-muted-foreground">
                      Brand power, network effects, or scale advantages protect earnings and enable dividend growth.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Diversification</div>
                    <div className="text-sm text-muted-foreground">
                      Spread across sectors: consumer staples, utilities, healthcare, REITs, financials, industrials.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Example Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Quality Dividend Stock Examples</h2>
            <p className="text-muted-foreground mb-6">
              Explore these dividend stocks with strong track records:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleStocks.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg group-hover:text-green-500 transition-colors">
                      {stock.ticker}
                    </span>
                    <span className="text-sm font-mono text-green-500">{stock.yield}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stock.name}</p>
                  <p className="text-xs text-muted-foreground">{stock.why}</p>
                  <div className="mt-2 text-xs text-green-500">View dividend analysis →</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Common Dividend Investing Mistakes</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Chasing High Yields</h3>
                <p className="text-muted-foreground">
                  Yields above 8-10% often signal distress, not opportunity. High yields may result from falling stock
                  prices due to fundamental problems. Verify sustainability before investing.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Ignoring Payout Ratio</h3>
                <p className="text-muted-foreground">
                  A company paying out 95% of earnings as dividends has no room for error. An earnings decline forces
                  a dividend cut, triggering sharp price drops. Always check payout sustainability.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Lack of Diversification</h3>
                <p className="text-muted-foreground">
                  Concentrating in one sector (all REITs or all utilities) exposes you to sector-specific risks.
                  Interest rate changes can crush dividend-heavy sectors simultaneously.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Forgetting Total Return</h3>
                <p className="text-muted-foreground">
                  A 7% dividend doesn't help if the stock price drops 15%. Focus on total return (dividends + price
                  appreciation). Quality companies often provide better total returns than high-yield traps.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Continue Learning */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/learn/stock-analysis"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Stock Analysis Fundamentals
                </h3>
                <p className="text-muted-foreground">
                  Learn to analyze financial statements and evaluate business quality.
                </p>
              </Link>
              <Link
                href="/learn/pe-ratio"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  P/E Ratio Guide
                </h3>
                <p className="text-muted-foreground">
                  Understand valuation to avoid overpaying for dividend stocks.
                </p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Find Quality Dividend Stocks with AI
            </h2>
            <p className="text-muted-foreground mb-6">
              Screen for dividend stocks with sustainable payouts, strong cash flow, and growth potential.
              Get instant dividend analysis, safety ratings, and growth projections.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Find Dividend Stocks
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}
