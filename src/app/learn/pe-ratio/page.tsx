import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getHowToSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'What is P/E Ratio? Price-to-Earnings Ratio Explained (2025 Guide)',
  description: 'Learn what P/E ratio is, how to calculate it, and how to use price-to-earnings ratios for stock valuation. Master trailing vs forward P/E and PEG ratios.',
  keywords: [
    'what is P/E ratio',
    'price to earnings ratio',
    'how to calculate P/E ratio',
    'trailing P/E vs forward P/E',
    'PEG ratio',
    'P/E ratio explained',
    'good P/E ratio',
  ],
  openGraph: {
    title: 'P/E Ratio Explained - Complete Guide to Price-to-Earnings Ratio',
    description: 'Master P/E ratios with examples, calculations, and interpretation for stock valuation.',
    type: 'article',
    url: `${SITE_URL}/learn/pe-ratio`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/pe-ratio`,
  },
}

const howToSteps = [
  {
    name: 'Calculate Basic P/E Ratio',
    text: 'Divide the current stock price by earnings per share (EPS): P/E = Stock Price / EPS. For example, if a stock trades at $100 and EPS is $5, the P/E is 20. This means investors pay $20 for every $1 of earnings.',
  },
  {
    name: 'Compare to Industry Peers',
    text: 'Compare the P/E to similar companies in the same industry. Tech companies often have higher P/E ratios (20-40) than utilities (10-15) due to growth differences. A stock with P/E of 15 might be expensive in utilities but cheap in tech.',
  },
  {
    name: 'Evaluate Historical P/E',
    text: 'Compare current P/E to the stock\'s 5-year average. If it\'s significantly above average, the stock may be overvalued. Below average might indicate undervaluation or deteriorating fundamentals requiring investigation.',
  },
  {
    name: 'Consider Growth (PEG Ratio)',
    text: 'Calculate PEG ratio = P/E / Growth Rate. A PEG below 1.0 suggests the stock may be undervalued relative to growth. A company with P/E of 30 and 30% growth (PEG = 1.0) may be fairly valued despite high P/E.',
  },
  {
    name: 'Assess Earnings Quality',
    text: 'Check if earnings are sustainable. One-time gains inflate EPS temporarily, making P/E artificially low. Review operating earnings, cash flow, and earnings consistency over multiple years.',
  },
]

const faqs = [
  {
    question: 'What is P/E ratio in simple terms?',
    answer: 'P/E ratio (Price-to-Earnings) measures how much investors pay for each dollar of a company\'s earnings. If a stock has a P/E of 20, you\'re paying $20 for every $1 of annual profit. Higher P/E means investors expect faster growth or are willing to pay more. Lower P/E might indicate value or slower growth.',
  },
  {
    question: 'How do you calculate P/E ratio?',
    answer: 'P/E ratio = Stock Price / Earnings Per Share (EPS). For example: If stock price is $150 and EPS is $10, then P/E = 150 / 10 = 15. You can also calculate it as Market Cap / Net Income. Use trailing P/E (last 12 months earnings) or forward P/E (estimated next 12 months).',
  },
  {
    question: 'What is a good P/E ratio?',
    answer: 'There\'s no universal "good" P/E - it depends on industry, growth rate, and market conditions. Generally: P/E below 15 suggests value (or problems), 15-25 is moderate, above 25 is expensive (or high growth). Compare to industry peers and historical averages. Fast-growing tech companies often justify P/E of 30-50, while mature utilities trade at 10-15.',
  },
  {
    question: 'What is the difference between trailing P/E and forward P/E?',
    answer: 'Trailing P/E uses actual earnings from the last 12 months (historical data). Forward P/E uses estimated earnings for the next 12 months (analyst projections). Forward P/E is helpful for growth companies where past earnings don\'t reflect future potential, but relies on estimates that may be wrong. Most investors use both for a complete picture.',
  },
  {
    question: 'Is a high P/E ratio good or bad?',
    answer: 'High P/E isn\'t inherently good or bad - context matters. High P/E (30+) can be justified by strong growth, competitive advantages, or expanding markets. It can also signal overvaluation if growth doesn\'t materialize. Low P/E might indicate value or problems like declining business, industry headwinds, or accounting issues. Always investigate the reason behind the P/E level.',
  },
  {
    question: 'What is PEG ratio and how does it differ from P/E?',
    answer: 'PEG ratio (Price/Earnings to Growth) = P/E Ratio / Expected Earnings Growth Rate. It adjusts P/E for growth, making it better for comparing companies with different growth rates. A P/E of 40 seems expensive, but if earnings grow at 40%, PEG = 1.0 (fair value). PEG below 1.0 may indicate undervaluation, above 2.0 suggests overvaluation. PEG works best for growth companies with consistent earnings.',
  },
  {
    question: 'Can P/E ratio be negative?',
    answer: 'Yes, when a company has negative earnings (losses), the P/E is negative or undefined. Negative P/E isn\'t useful for valuation - use other metrics like Price-to-Sales, EV/Revenue, or projected future P/E when profitable. Many growth companies have negative P/E initially as they invest heavily for future growth.',
  },
  {
    question: 'What are the limitations of P/E ratio?',
    answer: 'P/E limitations include: (1) Doesn\'t work for unprofitable companies, (2) One-time items distort earnings, (3) Ignores debt levels and capital structure, (4) Doesn\'t account for cash flow vs earnings differences, (5) Varies dramatically by industry making cross-sector comparisons difficult, (6) Can be manipulated through accounting choices. Always use P/E alongside other valuation metrics and fundamental analysis.',
  },
]

const industryPE = [
  { industry: 'Technology', avgPE: '25-35', reason: 'High growth and scalability' },
  { industry: 'Healthcare', avgPE: '20-30', reason: 'Innovation and demographic trends' },
  { industry: 'Consumer Discretionary', avgPE: '15-25', reason: 'Cyclical with moderate growth' },
  { industry: 'Financials', avgPE: '10-15', reason: 'Mature, capital intensive, cyclical' },
  { industry: 'Utilities', avgPE: '12-18', reason: 'Stable, regulated, low growth' },
  { industry: 'Energy', avgPE: '10-20', reason: 'Commodity exposure, cyclical' },
]

const exampleStocks = [
  { ticker: 'AAPL', name: 'Apple', pe: '~28', interpretation: 'Premium for brand and ecosystem' },
  { ticker: 'GOOGL', name: 'Alphabet', pe: '~24', interpretation: 'Reasonable for stable growth and moat' },
  { ticker: 'KO', name: 'Coca-Cola', pe: '~23', interpretation: 'Mature brand, dividend focus' },
  { ticker: 'JPM', name: 'JPMorgan', pe: '~11', interpretation: 'Bank sector typically trades lower' },
]

export default function PERatioPage() {
  const pageUrl = `${SITE_URL}/learn/pe-ratio`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'P/E Ratio', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'What is P/E Ratio? Complete Guide to Price-to-Earnings Ratio',
    description: 'Learn everything about P/E ratios including calculations, interpretation, and how to use them for stock valuation.',
    url: pageUrl,
    keywords: ['P/E ratio', 'price to earnings', 'PEG ratio', 'stock valuation', 'trailing P/E', 'forward P/E'],
  })

  const howToSchema = getHowToSchema({
    name: 'How to Use P/E Ratio for Stock Valuation',
    description: 'Step-by-step guide to calculating and interpreting P/E ratios for investment decisions.',
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
      <Header />
      <main className="min-h-dvh bg-black text-white pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-[#479ffa] motion-safe:motion-safe:transition-all motion-safe:duration-150 ease-out motion-safe:duration-150 ease-out">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-[#479ffa] motion-safe:motion-safe:transition-all motion-safe:duration-150 ease-out motion-safe:duration-150 ease-out">Learn</Link>
            {' / '}
            <span>P/E Ratio</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              What is P/E Ratio? Complete Guide
            </h1>
            <p className="text-xl text-[#868f97]">
              Master the price-to-earnings ratio - one of the most important and widely used metrics
              for stock valuation. Learn how to calculate, interpret, and use P/E ratios effectively.
            </p>
          </div>

          {/* What is P/E */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What is P/E Ratio?</h2>
            <p className="text-[#868f97] mb-4">
              The Price-to-Earnings (P/E) ratio measures the relationship between a company's stock price and its
              earnings per share. It tells you how much investors are willing to pay for each dollar of earnings
              the company generates.
            </p>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-center">P/E Ratio Formula</h3>
              <div className="bg-black/50 p-4 rounded-2xl font-mono text-lg text-center mb-4">
                P/E Ratio = Stock Price / Earnings Per Share (EPS)
              </div>
              <div className="text-center text-sm text-[#868f97]">
                Alternative: P/E Ratio = Market Capitalization / Net Income
              </div>
            </div>
            <p className="text-[#868f97]">
              For example, if a stock trades at $100 and the company earned $5 per share in the last year,
              the P/E ratio is 20. This means you're paying $20 for every $1 of annual earnings.
            </p>
          </section>

          {/* How to Calculate */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Calculate and Use P/E Ratio</h2>
            <div className="space-y-6">
              {howToSteps.map((step, index) => (
                <div key={index} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#4ebe96] text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.name}</h3>
                      <p className="text-[#868f97]">{step.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Trailing vs Forward */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Trailing P/E vs Forward P/E</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-3 text-[#4ebe96]">Trailing P/E (TTM)</h3>
                <p className="text-sm text-[#868f97] mb-4">
                  Based on actual earnings from the trailing twelve months (TTM).
                </p>
                <div className="mb-4">
                  <div className="text-sm font-bold mb-1">Formula:</div>
                  <div className="bg-black/50 p-2 rounded text-xs font-mono">
                    Current Price / EPS (Last 12 Months)
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[#4ebe96]">✓</span>
                    <span className="text-[#868f97]">Based on real, reported data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#4ebe96]">✓</span>
                    <span className="text-[#868f97]">No estimation bias</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#ff5c5c]">✗</span>
                    <span className="text-[#868f97]">Backward-looking, may not reflect future</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-3 text-[#479ffa]">Forward P/E</h3>
                <p className="text-sm text-[#868f97] mb-4">
                  Based on estimated earnings for the next twelve months.
                </p>
                <div className="mb-4">
                  <div className="text-sm font-bold mb-1">Formula:</div>
                  <div className="bg-black/50 p-2 rounded text-xs font-mono">
                    Current Price / Estimated EPS (Next 12 Months)
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[#4ebe96]">✓</span>
                    <span className="text-[#868f97]">Forward-looking, captures growth</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#4ebe96]">✓</span>
                    <span className="text-[#868f97]">Better for fast-growing companies</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#ff5c5c]">✗</span>
                    <span className="text-[#868f97]">Relies on estimates that may be wrong</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PEG Ratio */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Understanding PEG Ratio</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
              <p className="text-[#868f97] mb-4">
                The PEG ratio improves upon P/E by incorporating growth, making it better for comparing
                companies with different growth rates.
              </p>
              <div className="bg-black/50 p-4 rounded-2xl font-mono text-center mb-6">
                PEG Ratio = P/E Ratio / Annual EPS Growth Rate
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#4ebe96]/10 p-4 rounded-2xl border border-#4ebe96]/20">
                  <div className="text-2xl font-bold text-[#4ebe96] mb-1">PEG &lt; 1.0</div>
                  <div className="text-sm text-[#868f97]">Potentially undervalued</div>
                </div>
                <div className="bg-[#479ffa]/10 p-4 rounded-2xl border border-[#479ffa]/20">
                  <div className="text-2xl font-bold text-[#479ffa] mb-1">PEG ≈ 1.0</div>
                  <div className="text-sm text-[#868f97]">Fairly valued</div>
                </div>
                <div className="bg-[#ff5c5c]/10 p-4 rounded-2xl border border-[#ff5c5c]/20">
                  <div className="text-2xl font-bold text-[#ff5c5c] mb-1">PEG &gt; 2.0</div>
                  <div className="text-sm text-[#868f97]">Potentially overvalued</div>
                </div>
              </div>
              <div className="bg-[#479ffa]/10 border border-[#479ffa]/20 rounded p-4">
                <p className="text-sm font-bold mb-2">Example:</p>
                <p className="text-sm text-[#868f97]">
                  Company A: P/E = 40, Growth = 40% → PEG = 1.0 (Fairly valued despite high P/E)
                  <br />
                  Company B: P/E = 20, Growth = 5% → PEG = 4.0 (Overvalued despite moderate P/E)
                </p>
              </div>
            </div>
          </section>

          {/* Industry Comparison */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">P/E Ratios by Industry</h2>
            <p className="text-[#868f97] mb-6">
              Different industries have different normal P/E ranges due to growth rates, capital requirements,
              and business models:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {industryPE.map((item) => (
                <div key={item.industry} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">{item.industry}</h3>
                    <span className="text-[#4ebe96] font-mono text-sm">{item.avgPE}</span>
                  </div>
                  <p className="text-xs text-[#868f97]">{item.reason}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Example Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Real P/E Ratio Examples</h2>
            <p className="text-[#868f97] mb-6">
              See how P/E ratios vary across different types of companies:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleStocks.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg group-hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out">
                      {stock.ticker}
                    </span>
                    <span className="text-sm font-mono text-[#4ebe96]">{stock.pe}</span>
                  </div>
                  <p className="text-sm text-[#868f97] mb-1">{stock.name}</p>
                  <p className="text-xs text-[#868f97]">{stock.interpretation}</p>
                  <div className="mt-2 text-xs text-[#4ebe96]">View full analysis →</div>
                </Link>
              ))}
            </div>
          </section>

          {/* When to Use */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">When to Use (and Not Use) P/E Ratio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-#4ebe96]/20">
                <h3 className="text-lg font-bold mb-4 text-[#4ebe96]">P/E Ratio Works Well For:</h3>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>Mature, profitable companies with stable earnings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>Comparing companies within the same industry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>Quick valuation screening</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>Identifying potential value opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4ebe96] mt-1">✓</span>
                    <span>Historical valuation comparisons</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="text-lg font-bold mb-4 text-[#ff5c5c]">Avoid P/E Ratio For:</h3>
                <ul className="space-y-2 text-sm text-[#868f97]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <span>Unprofitable companies (negative earnings)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <span>Companies with highly cyclical earnings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <span>Companies with one-time earnings spikes/drops</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <span>Comparing companies across different industries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff5c5c] mt-1">✗</span>
                    <span>As the only valuation metric (use multiple methods)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
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
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  Complete Stock Analysis Guide
                </h3>
                <p className="text-[#868f97]">
                  Learn all aspects of stock analysis beyond just P/E ratios.
                </p>
              </Link>
              <Link
                href="/learn/dcf-valuation"
                className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  DCF Valuation
                </h3>
                <p className="text-[#868f97]">
                  Learn intrinsic value calculation using discounted cash flow analysis.
                </p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-[#4ebe96]/10 to-[#479ffa]/10 p-8 rounded-xl border border-#4ebe96]/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Analyze P/E Ratios Instantly
            </h2>
            <p className="text-[#868f97] mb-6">
              Get instant P/E ratios, PEG ratios, and comprehensive valuation analysis for any stock.
              Compare to industry peers and historical averages automatically.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-black px-8 py-3 rounded-full font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
            >
              Start Free Analysis
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
