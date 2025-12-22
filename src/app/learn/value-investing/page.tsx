import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FAQSchema, BreadcrumbSchema, ArticleSchema, HowToSchema } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: 'Value Investing Guide: How to Find Undervalued Stocks Like Warren Buffett (2025)',
  description: 'Master value investing strategies, learn to find undervalued stocks, calculate intrinsic value, and avoid value traps. Complete guide to Warren Buffett\'s investing approach.',
  keywords: [
    'value investing',
    'value stocks',
    'Warren Buffett investing',
    'undervalued stocks',
    'intrinsic value',
    'value investing strategy',
    'margin of safety',
    'value vs growth investing',
    'Benjamin Graham',
    'value traps',
    'P/E ratio',
    'P/B ratio',
    'PEG ratio',
  ],
  openGraph: {
    title: 'Value Investing Guide - Find Undervalued Stocks Like Warren Buffett',
    description: 'Learn Warren Buffett\'s value investing strategy. Master intrinsic value calculation, margin of safety, and finding undervalued stocks.',
    type: 'article',
    url: `${SITE_URL}/learn/value-investing`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/value-investing`,
  },
}

const howToSteps = [
  {
    name: 'Understand Intrinsic Value',
    text: 'Intrinsic value is what a business is truly worth based on its future cash flows, assets, and earnings power. Unlike market price (what others will pay), intrinsic value represents fundamental worth. Learn to estimate intrinsic value using DCF models, P/E ratios, or asset-based valuation. Warren Buffett says "Price is what you pay, value is what you get."',
  },
  {
    name: 'Learn the Margin of Safety Principle',
    text: 'Never pay full price for intrinsic value. Require a 30-50% discount to protect against estimation errors, bad luck, or market downturns. If you estimate intrinsic value at $100, only buy below $70. This cushion is your margin of safety - Benjamin Graham\'s most important investing concept.',
  },
  {
    name: 'Screen for Value Candidates',
    text: 'Look for stocks trading below intrinsic value: Low P/E (below 15), low P/B (below 2), high dividend yield (3%+), strong cash flow, and low debt. Screen for companies with temporary problems, not permanent decline. Value is often found in boring, overlooked, or temporarily out-of-favor stocks.',
  },
  {
    name: 'Analyze Business Quality',
    text: 'Warren Buffett evolved from "cheap stocks" to "wonderful companies at fair prices." Look for durable competitive advantages (moats): brand power, network effects, high switching costs, or cost advantages. Quality businesses can compound value for decades. Avoid "cheap for a reason" situations.',
  },
  {
    name: 'Calculate Fair Value Multiple Ways',
    text: 'Use multiple valuation methods: DCF analysis (discount future cash flows), comparable company P/E multiples, P/B relative to ROE, dividend discount model, and asset-based valuation. Triangulate to build conviction. If all methods say $80-100, you have a range. Buy well below the low end.',
  },
  {
    name: 'Be Patient and Disciplined',
    text: 'Value investing requires patience. Stocks can stay undervalued for years before the market recognizes their worth. Don\'t chase momentum or overpay. Keep a watchlist, wait for your price, and act decisively when opportunities appear. As Buffett says, "The stock market is a device for transferring money from the impatient to the patient."',
  },
]

const faqs = [
  {
    question: 'What is value investing?',
    answer: 'Value investing is a strategy of buying stocks trading below their intrinsic value - what they\'re truly worth based on fundamentals. Pioneered by Benjamin Graham and popularized by Warren Buffett, value investors seek stocks trading at a discount due to temporary problems, market overreactions, or being overlooked. The goal is to buy $1 of value for 50-70 cents, providing both upside potential and downside protection (margin of safety).',
  },
  {
    question: 'How do you calculate intrinsic value?',
    answer: 'Intrinsic value can be calculated several ways: (1) DCF - discount projected free cash flows to present value using required return rate, (2) P/E multiple - earnings × fair P/E based on growth and quality, (3) P/B ratio - book value adjusted for asset quality and ROE, (4) Dividend discount model - future dividends discounted to present, (5) Sum-of-parts - value each business segment separately. Use multiple methods and compare. Conservative estimates reduce error risk.',
  },
  {
    question: 'What is margin of safety in value investing?',
    answer: 'Margin of safety is the difference between a stock\'s intrinsic value and its purchase price. If intrinsic value is $100, buying at $60 provides a 40% margin of safety. This cushion protects against: valuation errors, unforeseen problems, economic downturns, or bad luck. Benjamin Graham considered it the "cornerstone of investment success." Most value investors require 30-50% margins. The larger the uncertainty, the wider margin needed.',
  },
  {
    question: 'What are the key value investing metrics?',
    answer: 'P/E Ratio (Price/Earnings): Below 15 is value territory. P/B Ratio (Price/Book): Below 1.5-2 suggests undervaluation. PEG Ratio (P/E/Growth): Below 1 indicates value considering growth. Dividend Yield: 3%+ often signals value. Free Cash Flow Yield: Above 7-8% is attractive. Debt-to-Equity: Low debt (below 0.5) is safer. ROE (Return on Equity): Above 15% shows quality. Compare all metrics to industry peers and historical averages.',
  },
  {
    question: 'How does Warren Buffett approach value investing?',
    answer: 'Buffett evolved from Graham\'s "cigar butt" cheap stocks to "wonderful businesses at fair prices." His approach: (1) Invest in businesses you understand, (2) Look for durable competitive advantages (moats), (3) Buy companies with honest, capable management, (4) Require margin of safety, (5) Think like a business owner, not a trader, (6) Hold for very long term (10+ years), (7) Focus on few great ideas versus many mediocre ones. He combines value principles with quality focus.',
  },
  {
    question: 'What are value traps and how do you avoid them?',
    answer: 'Value traps are stocks that look cheap but deserve to be. They\'re permanently impaired businesses facing secular decline, disruption, or fatal problems. Warning signs: Declining revenues for 3+ years, shrinking margins, rising competition, technological disruption, heavy debt, management turnover, or industry obsolescence. Examples: newspapers, legacy retailers, dying tech. Avoid by assessing long-term competitive position, industry trends, and whether problems are temporary or permanent.',
  },
  {
    question: 'Value investing vs growth investing - which is better?',
    answer: 'Value: Buy undervalued stocks with low P/E, P/B ratios. Lower risk, steadier returns, dividend income. Works well in high-rate environments. Growth: Buy fast-growing companies regardless of valuation. Higher potential returns but more volatility. Works well when rates are low. Historically, value outperforms growth over long periods (10+ years) but growth has dominated 2010-2021. Best approach: Combine both. "Growth at a reasonable price" (GARP) merges value discipline with growth potential.',
  },
  {
    question: 'What P/E ratio indicates a value stock?',
    answer: 'Generally, P/E below 15 signals potential value, below 10 is deep value. But context matters: Compare to industry (tech averages 25+, utilities 15), historical P/E for the company (is it cheap relative to itself?), growth rate (high growth justifies higher P/E), and market average (S&P 500 ~18-20). A P/E of 8 might be fair for a slow-growing bank but cheap for a tech company. Also consider PEG ratio: P/E of 15 with 15% growth (PEG=1) is reasonable.',
  },
  {
    question: 'How important is dividend yield in value investing?',
    answer: 'Dividends are important but not essential. Benefits: Provides income while waiting for value recognition, signals financial strength, reduces downside risk, and compounds returns. Many classic value stocks yield 3-5%. However, don\'t chase high yields - 8%+ often signals distress. Some best value investments (Berkshire Hathaway) pay no dividend, preferring to reinvest. Focus on total value creation: low P/E, strong cash flow, and either dividends or smart capital allocation.',
  },
  {
    question: 'Can you do value investing with small amounts of money?',
    answer: 'Absolutely. Value investing works at any capital level and may work better with smaller amounts due to flexibility. With $1,000-10,000, you can: Buy individual value stocks (start with 5-10 positions), invest in value ETFs (VTV, IVE, VBR), use dividend reinvestment to compound, or focus on small-cap value (historically outperforms large-cap). Small investors have advantages: access to smaller opportunities, no reporting requirements, and ability to act quickly. Start small, learn the process, and scale up.',
  },
  {
    question: 'How long does it take for value stocks to perform?',
    answer: 'Value investing requires patience - often 2-5 years for the market to recognize intrinsic value. Some positions work within months; others take a decade. Studies show value outperforms over 5-10 year periods but can underperform for 3-5 years during growth cycles (like 2017-2020). Don\'t expect quick results. The longer timeframe allows compounding and reduces timing risk. As Graham said, "In the short run, the market is a voting machine. In the long run, it\'s a weighing machine."',
  },
  {
    question: 'What books should I read to learn value investing?',
    answer: 'Essential reading: "The Intelligent Investor" by Benjamin Graham (value investing bible, read defensive investor chapters first), "Security Analysis" by Graham & Dodd (academic foundation), "Common Stocks and Uncommon Profits" by Philip Fisher (quality assessment), Warren Buffett\'s annual letters (free on Berkshire website, 40+ years of wisdom), "The Little Book of Value Investing" by Christopher Browne (accessible intro), and "You Can Be a Stock Market Genius" by Joel Greenblatt (special situations). Start with Intelligent Investor.',
  },
]

const keyMetrics = [
  {
    name: 'P/E Ratio (Price-to-Earnings)',
    formula: 'Stock Price / Earnings Per Share',
    valueRange: 'Below 15 is value; below 10 is deep value',
    description: 'Most common valuation metric. Shows how much you pay for $1 of earnings. Lower is cheaper. Compare to industry peers, company history, and market average (S&P 500 ~18-20). Adjust for growth: high-growth companies deserve higher P/E. Watch for earnings manipulation - use normalized earnings over 5-10 years.',
    example: 'Stock at $50, earnings $5/share = P/E of 10. You pay $10 for every $1 of profit.',
  },
  {
    name: 'P/B Ratio (Price-to-Book)',
    formula: 'Stock Price / Book Value Per Share',
    valueRange: 'Below 1.5 is value; below 1.0 is deep value',
    description: 'Compares price to net asset value (assets - liabilities). Especially useful for banks, insurers, and asset-heavy businesses. Below 1.0 means trading below liquidation value. Consider asset quality - old factories worth less than balance sheet. ROE matters: high-ROE companies deserve higher P/B.',
    example: 'Stock at $30, book value $25 = P/B of 1.2. Trading 20% above net assets.',
  },
  {
    name: 'PEG Ratio (P/E-to-Growth)',
    formula: 'P/E Ratio / Annual EPS Growth Rate',
    valueRange: 'Below 1.0 is value; below 0.5 is deep value',
    description: 'Adjusts P/E for growth rate. A P/E of 20 with 20% growth (PEG=1) is fair; same P/E with 10% growth (PEG=2) is expensive. Helps identify value in growing companies. Use sustainable growth rate, not one-year spike. Most useful for comparing companies in same industry.',
    example: 'P/E of 15, 10% growth = PEG of 1.5 (pricey). P/E of 15, 20% growth = PEG of 0.75 (value).',
  },
  {
    name: 'Dividend Yield',
    formula: 'Annual Dividend / Stock Price',
    valueRange: '3-6% is attractive value territory',
    description: 'Shows annual income return. Value stocks often pay higher dividends than growth stocks. Provides downside support and income while waiting for appreciation. Verify sustainability: check payout ratio (below 60%), cash flow coverage, and dividend history. Yields above 8% often signal danger.',
    example: 'Stock at $100 paying $4 annual dividend = 4% yield. $10,000 investment = $400/year income.',
  },
  {
    name: 'Free Cash Flow Yield',
    formula: 'Free Cash Flow Per Share / Stock Price',
    valueRange: 'Above 7-8% is attractive',
    description: 'Cash flow is harder to manipulate than earnings. Shows what percentage of your investment the company generates in cash annually. Higher yields indicate better value. More reliable than P/E for capital-intensive businesses. Compare to 10-year Treasury rate - should be significantly higher for equity risk.',
    example: '$10B market cap, $800M free cash flow = 8% FCF yield. Strong value signal.',
  },
  {
    name: 'Enterprise Value / EBITDA',
    formula: '(Market Cap + Debt - Cash) / EBITDA',
    valueRange: 'Below 8-10 is value territory',
    description: 'Accounts for debt and cash in valuation. Better than P/E for comparing companies with different capital structures. Useful for cyclical businesses and M&A analysis. Lower multiples indicate cheaper valuation. Compare to historical average and industry peers.',
    example: 'EV/EBITDA of 6 vs industry average of 12 suggests significant undervaluation.',
  },
]

const buffettPrinciples = [
  {
    principle: 'Circle of Competence',
    description: 'Only invest in businesses you truly understand',
    explanation: 'Buffett avoids tech he doesn\'t understand, focusing on simple businesses: insurance, banks, consumer brands. If you can\'t explain how a company makes money in simple terms, don\'t invest. Understanding reduces risk and improves decision quality. Know the industry, competitive dynamics, and key drivers.',
  },
  {
    principle: 'Economic Moat',
    description: 'Look for durable competitive advantages',
    explanation: 'Moats protect profits from competition: Brand power (Coca-Cola), network effects (credit cards), high switching costs (enterprise software), cost advantages (Costco), or regulatory barriers (utilities). Wide moats enable pricing power and sustained high returns. Without a moat, competition erodes profits.',
  },
  {
    principle: 'Management Quality',
    description: 'Invest with honest, capable managers',
    explanation: 'Look for managers who: Allocate capital wisely, communicate honestly (admit mistakes), think long-term, align with shareholders (own significant stock), and have track records of creating value. Avoid promotional management or empire builders. As Buffett says, "Buy wonderful businesses so that even a fool can run them, because someday one will."',
  },
  {
    principle: 'Margin of Safety',
    description: 'Buy at a significant discount to intrinsic value',
    explanation: 'Even wonderful companies become bad investments at wrong prices. Calculate intrinsic value conservatively, then demand a 25-40% discount. This protects against errors, bad luck, or economic downturns. The greater the uncertainty, the larger margin required. Price discipline is essential.',
  },
  {
    principle: 'Long-Term Holding',
    description: 'Our favorite holding period is forever',
    explanation: 'Buffett holds Coca-Cola since 1988, American Express since 1960s. Long holding periods: Minimize taxes and trading costs, allow compounding to work, reduce timing risk, and simplify life. Only sell if fundamentals deteriorate or you find significantly better opportunities. Ignore short-term market noise.',
  },
  {
    principle: 'Concentrated Conviction',
    description: 'Put big money in best ideas',
    explanation: 'Buffett holds 70%+ of portfolio in top 5 positions. Diversification is protection against ignorance. If you know what you\'re doing, concentration builds wealth faster. Most investors should own 10-20 stocks; professionals maybe 5-10. Don\'t dilute great ideas with mediocre ones.',
  },
]

const valueTraps = [
  {
    trap: 'Secular Decline Industries',
    warning: 'Cheap for a reason - permanent headwinds',
    examples: 'Print newspapers, legacy cable TV, mall retailers, tobacco companies',
    howToAvoid: 'Assess 10-year industry outlook. Is the problem temporary (cyclical) or permanent (structural)? Avoid "melting ice cubes" regardless of how cheap. Buffett: "Wonderful business at fair price beats fair business at wonderful price."',
  },
  {
    trap: 'High Debt Loads',
    warning: 'Leverage magnifies problems',
    examples: 'Overleveraged retailers, airlines, commodity companies',
    howToAvoid: 'Check debt-to-equity (below 0.5 is safe, above 2.0 is risky). Calculate interest coverage (EBIT / interest expense - should be above 5x). Review debt maturity schedule. A downturn can bankrupt leveraged companies before value is realized.',
  },
  {
    trap: 'Accounting Manipulation',
    warning: 'Reported earnings don\'t reflect reality',
    examples: 'Companies with aggressive revenue recognition, pension assumptions, or acquisition accounting',
    howToAvoid: 'Read footnotes, not just headlines. Compare cash flow to earnings (should be close). Watch for: frequent "one-time" charges, rising DSO (receivables growing faster than sales), or complex business models. Trust but verify.',
  },
  {
    trap: 'Technological Disruption',
    warning: 'New technology makes business obsolete',
    examples: 'Blockbuster (streaming), Kodak (digital), traditional taxis (Uber)',
    howToAvoid: 'Consider how technology could disrupt the business model in 5-10 years. Does the company have switching costs or network effects? Are younger customers abandoning it? Cheap valuations in disrupted industries rarely recover.',
  },
  {
    trap: 'Cyclical Peak Earnings',
    warning: 'Low P/E at cycle top is deceptive',
    examples: 'Commodity companies, homebuilders, cyclical industrials',
    howToAvoid: 'Use normalized earnings (10-year average) instead of current earnings. Low P/E during boom often becomes high P/E in bust when earnings collapse. Look at P/B, EV/Sales, or through-cycle earnings. Value cyclicals when P/E looks high (depressed earnings).',
  },
  {
    trap: 'Hidden Liabilities',
    warning: 'Off-balance-sheet risks aren\'t priced in',
    examples: 'Pension underfunding, environmental liabilities, litigation risks, warranty claims',
    howToAvoid: 'Read 10-K footnotes carefully. Calculate unfunded pension liabilities. Research pending lawsuits. Review contingent liabilities section. Some "value" stocks are expensive when hidden liabilities are added to debt.',
  },
]

const valueVsGrowth = [
  {
    aspect: 'Valuation Focus',
    value: 'Low P/E, P/B, PEG ratios',
    growth: 'High P/E acceptable if growth justifies it',
  },
  {
    aspect: 'Business Stage',
    value: 'Mature, established companies',
    growth: 'Young, rapidly expanding companies',
  },
  {
    aspect: 'Revenue Growth',
    value: '0-10% annually (slow but steady)',
    growth: '20-50%+ annually (fast expansion)',
  },
  {
    aspect: 'Dividends',
    value: 'Usually pay dividends (3-5% yields)',
    growth: 'Rarely pay - reinvest everything',
  },
  {
    aspect: 'Risk Profile',
    value: 'Lower volatility, downside protection',
    growth: 'Higher volatility, big swings',
  },
  {
    aspect: 'Best Environment',
    value: 'High interest rates, recessions, value cycles',
    growth: 'Low interest rates, bull markets, innovation waves',
  },
  {
    aspect: 'Time to Results',
    value: '2-5 years for recognition',
    growth: 'Can be quick (months) or never (failure)',
  },
  {
    aspect: 'Margin of Safety',
    value: 'High - buying below intrinsic value',
    growth: 'Low - paying for future that may not arrive',
  },
  {
    aspect: 'Historical Returns',
    value: '~12-14% annually (long-term)',
    growth: '~10-12% annually (long-term)',
  },
  {
    aspect: 'Famous Practitioners',
    value: 'Warren Buffett, Benjamin Graham, Seth Klarman',
    growth: 'Peter Lynch, Cathie Wood, Philip Fisher',
  },
]

export default function ValueInvestingPage() {
  const pageUrl = `${SITE_URL}/learn/value-investing`

  return (
    <>
      <Header />

      {/* Structured Data for SEO */}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_URL },
          { name: 'Learn', url: `${SITE_URL}/learn` },
          { name: 'Value Investing', url: pageUrl },
        ]}
      />
      <ArticleSchema
        headline="Value Investing Guide: How to Find Undervalued Stocks Like Warren Buffett"
        description="Complete guide to value investing including Warren Buffett's approach, intrinsic value calculation, margin of safety, key metrics, and avoiding value traps."
        url={pageUrl}
        keywords={['value investing', 'Warren Buffett', 'undervalued stocks', 'intrinsic value', 'margin of safety', 'value stocks']}
      />
      <HowToSchema
        name="How to Start Value Investing"
        description="Step-by-step guide to value investing including finding undervalued stocks, calculating intrinsic value, and applying Warren Buffett's principles."
        steps={howToSteps}
      />
      <FAQSchema faqs={faqs} />

      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>Value Investing</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Value Investing: Find Undervalued Stocks Like Warren Buffett
            </h1>
            <p className="text-xl text-muted-foreground">
              Master the time-tested strategy of buying stocks trading below intrinsic value. Learn Warren Buffett&apos;s
              approach to finding wonderful businesses at fair prices, calculating margin of safety, and building
              long-term wealth through disciplined value investing.
            </p>
          </div>

          {/* What is Value Investing */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What is Value Investing?</h2>
            <p className="text-muted-foreground mb-4">
              Value investing is a strategy pioneered by Benjamin Graham and perfected by Warren Buffett. The core
              principle is simple: buy stocks trading for less than they&apos;re truly worth. When market price is below
              intrinsic value, you have both upside potential (value recognition) and downside protection (margin of safety).
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mb-6">
              <h3 className="text-lg font-bold mb-3">The Warren Buffett Philosophy</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-green-500 text-2xl">📊</div>
                  <div>
                    <div className="font-bold mb-1">Price vs Value</div>
                    <div className="text-sm text-muted-foreground">
                      "Price is what you pay, value is what you get." Market prices fluctuate based on emotion,
                      news, and sentiment. Intrinsic value is based on business fundamentals: cash flow, assets,
                      and competitive position. Value investors exploit the gap.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 text-2xl">🛡️</div>
                  <div>
                    <div className="font-bold mb-1">Margin of Safety</div>
                    <div className="text-sm text-muted-foreground">
                      Benjamin Graham&apos;s cornerstone concept. If intrinsic value is $100, only buy at $60-70. This
                      30-40% discount protects against errors, bad luck, or market downturns. The larger the uncertainty,
                      the wider margin you need.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 text-2xl">⏳</div>
                  <div>
                    <div className="font-bold mb-1">Long-Term Perspective</div>
                    <div className="text-sm text-muted-foreground">
                      "In the short run, the market is a voting machine. In the long run, it&apos;s a weighing machine."
                      Value recognition takes time - often 2-5 years. But patient investors are rewarded as the market
                      eventually reflects true value.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Start */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Start Value Investing</h2>
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
            <h2 className="text-3xl font-bold mb-6">Key Value Investing Metrics</h2>
            <p className="text-muted-foreground mb-6">
              Value investors use these metrics to identify undervalued stocks and calculate intrinsic value:
            </p>
            <div className="space-y-6">
              {keyMetrics.map((metric) => (
                <div key={metric.name} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-green-500">{metric.name}</h3>
                    <div className="text-xs bg-green-500/10 text-green-500 px-3 py-1 rounded-full">
                      {metric.valueRange}
                    </div>
                  </div>
                  <div className="bg-background p-3 rounded font-mono text-sm mb-3">
                    {metric.formula}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{metric.description}</p>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded text-sm">
                    <span className="font-bold text-blue-500">Example: </span>
                    <span className="text-muted-foreground">{metric.example}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Warren Buffett's Approach */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Warren Buffett&apos;s Value Investing Principles</h2>
            <p className="text-muted-foreground mb-6">
              Warren Buffett evolved value investing from buying &quot;cigar butts&quot; (cheap, low-quality stocks) to
              acquiring &quot;wonderful businesses at fair prices.&quot; His principles combine Graham&apos;s value discipline
              with focus on business quality:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {buffettPrinciples.map((item) => (
                <div key={item.principle} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-xl font-bold mb-2">{item.principle}</h3>
                  <p className="text-sm text-green-500 mb-3">{item.description}</p>
                  <p className="text-sm text-muted-foreground">{item.explanation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How to Find Undervalued Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Find Undervalued Stocks</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold mb-4">Stock Screening Criteria</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">P/E Ratio Below 15</div>
                    <div className="text-sm text-muted-foreground">
                      Compare to S&P 500 average (~18-20) and industry peers. Below 10 is deep value territory.
                      Use normalized earnings (5-10 year average) for cyclical companies.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">P/B Ratio Below 1.5-2.0</div>
                    <div className="text-sm text-muted-foreground">
                      Trading near or below book value suggests undervaluation. Especially meaningful for banks,
                      insurers, and asset-heavy businesses. Adjust for asset quality and ROE.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">PEG Ratio Below 1.0</div>
                    <div className="text-sm text-muted-foreground">
                      Finds value in growing companies. P/E of 12 with 15% growth (PEG 0.8) beats P/E of 8
                      with 5% growth (PEG 1.6). Use sustainable growth, not one-year spikes.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Dividend Yield 3-6%</div>
                    <div className="text-sm text-muted-foreground">
                      Provides income and downside support. Verify payout ratio below 60% and consistent dividend
                      history. Yields above 8% often signal danger.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Strong Free Cash Flow</div>
                    <div className="text-sm text-muted-foreground">
                      FCF yield above 7-8% is attractive. Cash flow harder to manipulate than earnings.
                      Ensures company generates real cash, not just accounting profits.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Low Debt Levels</div>
                    <div className="text-sm text-muted-foreground">
                      Debt-to-equity below 0.5 is safe. High debt magnifies problems and increases risk.
                      Check interest coverage (EBIT / interest) above 5x.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">✓</div>
                  <div>
                    <div className="font-bold mb-1">Quality Business with Moat</div>
                    <div className="text-sm text-muted-foreground">
                      Look for competitive advantages: brand power, network effects, switching costs, or
                      scale advantages. ROE above 15% indicates quality.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 rounded-xl border border-green-500/20">
              <h3 className="font-bold mb-3">Where to Find Value</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• <strong>Out of favor sectors:</strong> Industries temporarily unloved (energy in 2020, banks in 2023)</p>
                <p>• <strong>Spin-offs:</strong> Parent company shareholders sell without analysis, creating opportunity</p>
                <p>• <strong>Small caps:</strong> Less analyst coverage = more pricing inefficiencies</p>
                <p>• <strong>International markets:</strong> Emerging markets often cheaper than US</p>
                <p>• <strong>Market corrections:</strong> 10-20% pullbacks create value opportunities</p>
                <p>• <strong>Company-specific problems:</strong> Temporary issues (recall, lawsuit) vs permanent decline</p>
              </div>
            </div>
          </section>

          {/* Value Traps */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Value Traps to Avoid</h2>
            <p className="text-muted-foreground mb-6">
              Not all cheap stocks are good value. Value traps are stocks that look cheap but deserve to be because
              of permanent problems. Learn to distinguish temporary setbacks from terminal decline:
            </p>
            <div className="space-y-4">
              {valueTraps.map((trap) => (
                <div key={trap.trap} className="bg-card p-6 rounded-xl border border-red-500/20">
                  <div className="flex items-start gap-4">
                    <div className="text-red-500 text-2xl">⚠️</div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1 text-red-500">{trap.trap}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{trap.warning}</p>
                      <div className="bg-background p-3 rounded mb-3">
                        <div className="text-xs font-bold text-muted-foreground mb-1">Examples:</div>
                        <div className="text-sm">{trap.examples}</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-green-500">How to avoid: </span>
                        <span className="text-muted-foreground">{trap.howToAvoid}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Value vs Growth */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Value vs Growth Investing</h2>
            <p className="text-muted-foreground mb-6">
              Understanding the difference helps you choose the right strategy for your goals and market environment.
              Many successful investors combine both approaches (&quot;Growth at a Reasonable Price&quot; or GARP):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-bold">Aspect</th>
                    <th className="text-left p-4 font-bold text-green-500">Value Investing</th>
                    <th className="text-left p-4 font-bold text-blue-500">Growth Investing</th>
                  </tr>
                </thead>
                <tbody>
                  {valueVsGrowth.map((row, index) => (
                    <tr key={row.aspect} className={index % 2 === 0 ? 'bg-card' : ''}>
                      <td className="p-4 font-bold text-sm">{row.aspect}</td>
                      <td className="p-4 text-sm text-muted-foreground">{row.value}</td>
                      <td className="p-4 text-sm text-muted-foreground">{row.growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-card p-6 rounded-xl border border-border">
              <h3 className="font-bold mb-3">Which is Better?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Historically, value outperforms growth over long periods (10+ years), but growth dominated 2010-2021
                due to low interest rates and tech disruption. Value tends to outperform when:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 mb-3">
                <li>• Interest rates are rising or high</li>
                <li>• Economy is recovering from recession</li>
                <li>• Inflation is elevated</li>
                <li>• Market volatility increases</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Growth outperforms when rates are low, innovation accelerates, and liquidity is abundant. Best approach:
                Combine both. Even Buffett owns growth stocks (Apple is his largest holding).
              </p>
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
                href="/learn/dcf-valuation"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  DCF Valuation Guide
                </h3>
                <p className="text-muted-foreground">
                  Learn to calculate intrinsic value using discounted cash flow analysis.
                </p>
              </Link>
              <Link
                href="/learn/pe-ratio"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  P/E Ratio Deep Dive
                </h3>
                <p className="text-muted-foreground">
                  Master P/E ratio analysis and learn when high or low P/E matters.
                </p>
              </Link>
              <Link
                href="/learn/dividend-investing"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Dividend Investing
                </h3>
                <p className="text-muted-foreground">
                  Build passive income with dividend stocks - common in value portfolios.
                </p>
              </Link>
              <Link
                href="/learn/stock-analysis"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Stock Analysis Fundamentals
                </h3>
                <p className="text-muted-foreground">
                  Learn to analyze financial statements and assess business quality.
                </p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Find Undervalued Stocks with AI-Powered Screening
            </h2>
            <p className="text-muted-foreground mb-6">
              Screen for value stocks with low P/E, P/B, and PEG ratios. Get instant intrinsic value calculations,
              margin of safety analysis, and Warren Buffett-style quality scores. Find wonderful businesses at fair prices.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Screen for Value Stocks
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
