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
  title: 'How to Analyze Stocks: Complete Guide to Stock Analysis (2025)',
  description: 'Learn how to analyze stocks like a professional investor. Master financial statements, valuation metrics, competitive analysis, and fundamental analysis techniques.',
  keywords: [
    'how to analyze stocks',
    'stock analysis guide',
    'fundamental analysis',
    'how to read financial statements',
    'stock valuation methods',
    'how to evaluate stocks',
    'stock analysis for beginners',
  ],
  openGraph: {
    title: 'Complete Guide to Stock Analysis - Learn How to Analyze Stocks',
    description: 'Master stock analysis with this comprehensive guide covering financial statements, valuation, and competitive analysis.',
    type: 'article',
    url: `${SITE_URL}/learn/stock-analysis`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/stock-analysis`,
  },
}

const howToSteps = [
  {
    name: 'Understand the Business Model',
    text: 'Research what the company does, how it makes money, who its customers are, and what makes it different from competitors. A great business model has clear value propositions and sustainable competitive advantages.',
  },
  {
    name: 'Analyze Financial Statements',
    text: 'Review the income statement (profitability), balance sheet (financial health), and cash flow statement (cash generation). Look for consistent revenue growth, improving margins, and strong cash flow.',
  },
  {
    name: 'Calculate Key Valuation Metrics',
    text: 'Calculate P/E ratio, price-to-book, EV/EBITDA, and other multiples. Compare these to industry peers and historical averages to determine if the stock is fairly valued.',
  },
  {
    name: 'Evaluate Growth Prospects',
    text: 'Assess revenue growth rates, market expansion opportunities, new products or services, and total addressable market size. Strong growth prospects justify higher valuations.',
  },
  {
    name: 'Assess Management Quality',
    text: 'Research the management team\'s track record, capital allocation decisions, and alignment with shareholders. Great management compounds value over time.',
  },
  {
    name: 'Identify Risks and Red Flags',
    text: 'Look for competitive threats, regulatory risks, debt levels, declining margins, or accounting irregularities. Understanding risks is as important as recognizing opportunities.',
  },
]

const faqs = [
  {
    question: 'What is stock analysis and why is it important?',
    answer: 'Stock analysis is the process of evaluating a company to determine if its stock is a good investment. It involves examining financial statements, competitive position, growth prospects, and valuation. Stock analysis is crucial because it helps you make informed decisions based on facts rather than emotions or hype, reducing the risk of losses and increasing the probability of long-term gains.',
  },
  {
    question: 'What are the three main financial statements to analyze?',
    answer: 'The three main financial statements are: (1) Income Statement - shows revenue, expenses, and profitability over a period, (2) Balance Sheet - displays assets, liabilities, and equity at a point in time, showing financial health, and (3) Cash Flow Statement - tracks cash inflows and outflows, revealing the company\'s ability to generate cash. Together, these statements provide a complete picture of financial performance.',
  },
  {
    question: 'What is the difference between fundamental and technical analysis?',
    answer: 'Fundamental analysis evaluates a company\'s intrinsic value by examining financial statements, competitive advantages, management quality, and growth prospects. It focuses on long-term value. Technical analysis studies price charts, trading volume, and patterns to predict short-term price movements. For long-term investors, fundamental analysis is more important, while traders often use technical analysis for timing entry and exit points.',
  },
  {
    question: 'What are the most important metrics for stock analysis?',
    answer: 'Key metrics include: P/E ratio (valuation), revenue growth (business momentum), profit margin (efficiency), return on equity (profitability), debt-to-equity ratio (financial risk), free cash flow (cash generation), and dividend yield (income). The importance of each metric varies by industry and investment strategy.',
  },
  {
    question: 'How do I know if a stock is overvalued or undervalued?',
    answer: 'Compare the stock\'s valuation metrics (P/E, P/B, EV/EBITDA) to industry peers and historical averages. Use DCF analysis to calculate intrinsic value based on future cash flows. Consider growth rates, competitive position, and market conditions. A stock trading significantly below its intrinsic value may be undervalued, while one trading at a premium to peers and historical norms may be overvalued.',
  },
  {
    question: 'How long does it take to properly analyze a stock?',
    answer: 'A thorough stock analysis takes 2-4 hours for experienced investors, potentially longer for beginners. This includes reading the latest 10-K and 10-Q filings, analyzing financial statements, researching competitors, calculating valuations, and assessing risks. Tools like Lician can accelerate this process by automating data gathering and calculations, letting you focus on interpretation and decision-making.',
  },
  {
    question: 'Should I analyze stocks myself or rely on analyst ratings?',
    answer: 'Both have value. Analyst ratings provide professional perspectives and price targets, but can be biased or lag behind market developments. Learning to analyze stocks yourself builds investing skills, deepens understanding, and helps you make independent decisions. The ideal approach combines your own analysis with consideration of analyst views and other expert opinions.',
  },
  {
    question: 'What tools do I need for stock analysis?',
    answer: 'Essential tools include: access to financial statements (SEC EDGAR or company investor relations), screening tools to find candidates, valuation calculators for DCF and other models, charting platforms for visualization, and news sources for current events. AI-powered platforms like Lician combine these tools, providing comprehensive analysis, automated calculations, and real-time data in one place.',
  },
]

const exampleStocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', why: 'Strong brand, ecosystem, and cash flow' },
  { ticker: 'MSFT', name: 'Microsoft', why: 'Cloud growth and software dominance' },
  { ticker: 'GOOGL', name: 'Alphabet', why: 'Advertising moat and AI capabilities' },
  { ticker: 'JPM', name: 'JPMorgan Chase', why: 'Banking leader with diverse revenue' },
]

export default function StockAnalysisPage() {
  const pageUrl = `${SITE_URL}/learn/stock-analysis`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'Stock Analysis', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'How to Analyze Stocks: Complete Guide to Stock Analysis',
    description: 'Comprehensive guide to stock analysis covering financial statements, valuation metrics, competitive analysis, and risk assessment.',
    url: pageUrl,
    keywords: ['stock analysis', 'fundamental analysis', 'how to analyze stocks', 'financial statement analysis'],
  })

  const howToSchema = getHowToSchema({
    name: 'How to Analyze Stocks',
    description: 'Step-by-step guide to analyzing stocks using fundamental analysis techniques.',
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
            <span>Stock Analysis</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              How to Analyze Stocks: Complete Guide
            </h1>
            <p className="text-xl text-muted-foreground">
              Master the art of stock analysis and learn to evaluate companies like a professional investor.
              This comprehensive guide covers everything from reading financial statements to assessing competitive advantages.
            </p>
          </div>

          {/* What is Stock Analysis */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What is Stock Analysis?</h2>
            <p className="text-muted-foreground mb-4">
              Stock analysis is the systematic evaluation of a company and its stock to determine its investment potential.
              It involves examining financial statements, competitive position, management quality, growth prospects, and valuation
              to make informed investment decisions.
            </p>
            <p className="text-muted-foreground">
              The goal of stock analysis is to determine a company's intrinsic value and compare it to the current market price.
              If the intrinsic value exceeds the market price, the stock may be undervalued and worth buying. If the market price
              exceeds intrinsic value, the stock may be overvalued and should be avoided or sold.
            </p>
          </section>

          {/* How to Analyze Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Analyze Stocks: Step-by-Step</h2>
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

          {/* Key Financial Metrics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Essential Financial Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Revenue & Growth</h3>
                <p className="text-muted-foreground">
                  Top-line growth indicates increasing demand. Look for consistent revenue growth (10%+ annually is strong).
                  Declining revenue is a red flag unless part of a strategic shift.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Profit Margins</h3>
                <p className="text-muted-foreground">
                  Net margin shows profitability efficiency. Expanding margins indicate operational improvement or pricing power.
                  Compare margins to industry peers to assess competitive position.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Return on Equity (ROE)</h3>
                <p className="text-muted-foreground">
                  ROE measures how efficiently a company uses shareholder equity to generate profits. 15%+ ROE is generally
                  considered strong. Consistently high ROE suggests a competitive advantage.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Debt-to-Equity Ratio</h3>
                <p className="text-muted-foreground">
                  Measures financial leverage and risk. Lower is generally safer. Compare to industry norms - capital-intensive
                  businesses naturally have higher debt levels.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Free Cash Flow</h3>
                <p className="text-muted-foreground">
                  Cash left after capital expenditures. Positive, growing FCF enables dividends, buybacks, and acquisitions.
                  Companies with strong FCF have more financial flexibility.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Price-to-Earnings (P/E)</h3>
                <p className="text-muted-foreground">
                  Shows how much investors pay per dollar of earnings. Compare to industry peers and historical averages.
                  Higher P/E can be justified by faster growth. <Link href="/learn/pe-ratio" className="text-green-500 hover:underline">Learn more about P/E ratios</Link>.
                </p>
              </div>
            </div>
          </section>

          {/* Competitive Analysis */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Competitive Analysis Framework</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">
                Understanding a company's competitive position is crucial. Use Porter's Five Forces framework:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">1.</span>
                  <div>
                    <span className="font-bold">Competitive Rivalry:</span>
                    <span className="text-muted-foreground"> How intense is competition? Fragmented markets are more competitive.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">2.</span>
                  <div>
                    <span className="font-bold">Threat of New Entrants:</span>
                    <span className="text-muted-foreground"> High barriers to entry (capital, regulation, network effects) protect incumbents.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">3.</span>
                  <div>
                    <span className="font-bold">Bargaining Power of Suppliers:</span>
                    <span className="text-muted-foreground"> Can suppliers demand higher prices? Diversified supply chains reduce risk.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">4.</span>
                  <div>
                    <span className="font-bold">Bargaining Power of Buyers:</span>
                    <span className="text-muted-foreground"> Can customers easily switch? Strong brands and switching costs increase pricing power.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">5.</span>
                  <div>
                    <span className="font-bold">Threat of Substitutes:</span>
                    <span className="text-muted-foreground"> Are there alternative products? Companies with unique offerings face less threat.</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Example Analysis */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Example Stock Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Apply what you've learned by analyzing these stocks with our AI-powered platform:
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
                    <span className="text-xs text-green-500">View Analysis →</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stock.name}</p>
                  <p className="text-xs text-muted-foreground">{stock.why}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Common Stock Analysis Mistakes to Avoid</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Focusing Only on Price</h3>
                <p className="text-muted-foreground">
                  A low stock price doesn't mean it's cheap, and a high price doesn't mean it's expensive. Focus on valuation
                  metrics like P/E ratio relative to growth and industry peers.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Ignoring Cash Flow</h3>
                <p className="text-muted-foreground">
                  Profit on the income statement can be misleading due to non-cash items. Free cash flow is harder to manipulate
                  and better reflects real economic performance.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Not Comparing to Peers</h3>
                <p className="text-muted-foreground">
                  A P/E of 30 might be cheap in software (high growth) but expensive in utilities (slow growth). Always compare
                  metrics to industry peers and historical ranges.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Overlooking Risk Factors</h3>
                <p className="text-muted-foreground">
                  High debt, customer concentration, regulatory threats, or competitive disruption can destroy value quickly.
                  Always read the risk factors section in the 10-K filing.
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

          {/* Next Steps */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/learn/pe-ratio"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Understanding P/E Ratios
                </h3>
                <p className="text-muted-foreground">
                  Master one of the most important valuation metrics in stock analysis.
                </p>
              </Link>
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
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Start Analyzing Stocks with AI
            </h2>
            <p className="text-muted-foreground mb-6">
              Skip the manual calculations and get instant comprehensive analysis for any stock.
              Our AI analyzes financial statements, calculates valuations, and highlights opportunities.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Try Free Analysis
            </Link>
          </section>
        </div>
      </main>
    </>
  )
}
