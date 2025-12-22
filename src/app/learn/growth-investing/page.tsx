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
  title: 'Growth Investing Guide: How to Find and Invest in High Growth Stocks (2025)',
  description: 'Master growth investing strategies, learn to identify high-growth stocks, understand key metrics like revenue growth and TAM, and discover GARP investing. Complete guide to growth stocks.',
  keywords: [
    'growth investing',
    'growth stocks',
    'high growth stocks',
    'best growth stocks',
    'growth vs value',
    'how to find growth stocks',
    'GARP investing',
    'growth stock metrics',
  ],
  openGraph: {
    title: 'Growth Investing Guide - Find High Growth Stocks That Can 10x',
    description: 'Master growth investing with strategies for identifying high-growth companies, key metrics to track, and how to avoid growth traps.',
    type: 'article',
    url: `${SITE_URL}/learn/growth-investing`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/growth-investing`,
  },
}

const howToSteps = [
  {
    name: 'Understand Growth Stock Fundamentals',
    text: 'Growth stocks are companies expanding revenue and earnings faster than the market average (typically 15%+ annually). They reinvest profits into the business rather than pay dividends. Focus on disruptive technology, expanding markets, and scalable business models.',
  },
  {
    name: 'Identify High-Growth Markets',
    text: 'Look for companies in expanding industries with large Total Addressable Markets (TAM). Sectors like AI, cloud computing, electric vehicles, fintech, and biotech often produce growth winners. A company with 10% market share in a $100B TAM has massive runway.',
  },
  {
    name: 'Analyze Key Growth Metrics',
    text: 'Track revenue growth (15%+ annually), gross margins (60%+ for software), customer acquisition metrics, and path to profitability. Strong unit economics (LTV/CAC > 3x) indicate sustainable growth. Don\'t just chase revenue - quality matters.',
  },
  {
    name: 'Evaluate Competitive Moats',
    text: 'Growth stocks need defensible advantages: network effects (social platforms), switching costs (enterprise software), brand power, or technological lead. Without a moat, competitors will erode margins and slow growth.',
  },
  {
    name: 'Assess Management and Execution',
    text: 'Visionary founders often outperform professional managers in growth companies. Study management track record, capital allocation, product roadmap execution, and ability to scale operations. Great management turns opportunities into outcomes.',
  },
  {
    name: 'Consider Valuation and Risk',
    text: 'Growth stocks trade at premium valuations (high P/E ratios). Use PEG ratio (P/E / Growth Rate) under 2.0 for reasonableness. Diversify across 10-15 positions to manage risk - not all growth bets work out. Size positions based on conviction and volatility.',
  },
]

const faqs = [
  {
    question: 'What is growth investing?',
    answer: 'Growth investing is a strategy focused on companies expected to grow revenue and earnings significantly faster than the overall market. Growth investors prioritize future potential over current profitability, accepting higher valuations and volatility for the chance of substantial long-term returns. These companies typically reinvest all profits into expansion rather than paying dividends. Amazon, Tesla, and Nvidia are classic examples - they prioritized growth for years before achieving massive scale.',
  },
  {
    question: 'What are growth stocks?',
    answer: 'Growth stocks are shares of companies experiencing above-average revenue and earnings expansion, typically 15%+ annually compared to 5-7% market average. They trade at premium valuations (high P/E ratios) because investors expect future growth to justify current prices. Common characteristics: high revenue growth, reinvestment of profits, minimal or no dividends, disruptive technology or business models, large addressable markets, and higher volatility than value stocks.',
  },
  {
    question: 'What is the difference between growth and value investing?',
    answer: 'Growth investing targets fast-growing companies at premium valuations, while value investing seeks undervalued companies trading below intrinsic worth. Growth stocks: high P/E ratios (30-50+), rapid revenue expansion, no dividends, higher risk/reward, focus on future potential. Value stocks: low P/E ratios (8-15), stable cash flows, dividend payments, lower volatility, focus on current fundamentals. Growth outperforms in bull markets; value tends to be more defensive in downturns. Many investors blend both approaches.',
  },
  {
    question: 'How do I identify high-growth stocks?',
    answer: 'Screen for companies with: (1) Revenue growth over 20% annually for 3+ years, (2) Large and expanding Total Addressable Market (TAM), (3) Gross margins above 60% (indicates pricing power and scalability), (4) Positive unit economics showing sustainable growth, (5) Competitive moats like network effects or high switching costs, (6) Strong management with execution track record, (7) Customer retention rates above 90% (for subscription businesses). Look for companies disrupting large industries or creating new markets entirely.',
  },
  {
    question: 'What are the key metrics for evaluating growth stocks?',
    answer: 'Essential metrics: (1) Revenue Growth Rate - should be 15-50%+ annually, (2) Gross Margin - 60%+ for software, 30%+ for hardware, (3) TAM (Total Addressable Market) - ideally $50B+ with room to expand, (4) Customer Acquisition Cost (CAC) Payback Period - under 12 months, (5) LTV/CAC Ratio - above 3x shows profitable customer acquisition, (6) Net Revenue Retention - 120%+ means existing customers spend more over time, (7) Rule of 40 - revenue growth % + profit margin % should exceed 40, (8) Cash Burn Rate - quarters of runway remaining.',
  },
  {
    question: 'What is GARP (Growth at a Reasonable Price) investing?',
    answer: 'GARP combines growth and value investing by seeking high-growth companies at reasonable valuations. GARP investors use the PEG ratio (P/E / Earnings Growth Rate) - a PEG under 1.5-2.0 indicates reasonable pricing. Instead of paying any price for growth, GARP investors wait for pullbacks or find undiscovered growth stories. Peter Lynch popularized this approach. Example: A stock with 30% growth and P/E of 45 has a PEG of 1.5 (reasonable), while 15% growth at P/E 45 has PEG of 3.0 (expensive). GARP reduces downside risk while maintaining growth upside.',
  },
  {
    question: 'What are the risks of growth investing?',
    answer: 'Major risks include: (1) Valuation Risk - growth stocks trade at high multiples that collapse if growth slows, often dropping 50-80%, (2) Execution Risk - scaling operations, entering new markets, and maintaining culture are extremely difficult, (3) Competition Risk - success attracts well-funded competitors, (4) Interest Rate Sensitivity - rising rates reduce present value of future earnings, hurting growth stocks disproportionately, (5) Dilution Risk - many growth companies issue shares to fund expansion, (6) Profitability Risk - some never achieve sustainable profits. Manage risk through diversification, position sizing, and avoiding speculative unprofitable companies.',
  },
  {
    question: 'Should growth stocks be part of my portfolio?',
    answer: 'It depends on age, risk tolerance, and time horizon. Younger investors (20s-40s) can allocate 40-70% to growth stocks given decades to recover from volatility. Investors approaching retirement (50s-60s) might limit growth to 20-30% with more in dividend stocks and bonds. Growth stocks provide portfolio upside and inflation protection but require strong conviction to hold through 30-50% drawdowns. Diversify across 10-15 growth positions in different sectors. Don\'t invest money you\'ll need within 5 years.',
  },
  {
    question: 'What is Total Addressable Market (TAM) and why does it matter?',
    answer: 'TAM is the total revenue opportunity available if a company achieved 100% market share. It\'s crucial for growth investing because companies in small TAMs have limited upside. Example: A company with $2B revenue in a $200B TAM (1% share) has 100x potential. In a $10B TAM at 20% share, they\'re near peak. Calculate TAM by: customers × average revenue per customer × market penetration potential. Look for TAMs expanding due to technology adoption, demographic shifts, or regulatory changes. Cloud computing went from $50B to $500B+ TAM in a decade.',
  },
  {
    question: 'How long should I hold growth stocks?',
    answer: 'Growth investing requires patience - hold for 3-10+ years to allow compound growth. Amazon took 7 years to deliver 10x returns from IPO. However, trim or sell when: (1) Growth thesis breaks (slowing revenue, losing market share), (2) Valuation becomes extremely stretched (PEG > 3-4), (3) Management changes or execution falters, (4) Better opportunities emerge, (5) Position becomes too large (>10% of portfolio). Avoid trading around volatility - growth stocks can drop 20-40% on earnings misses but recover if fundamentals remain strong. Time horizon and conviction determine hold period.',
  },
  {
    question: 'What are the best sectors for growth stocks?',
    answer: 'Historically strong growth sectors: (1) Technology - AI, cloud computing, cybersecurity, SaaS (30-50% growth rates), (2) E-commerce - online retail, digital payments, logistics (20-40% growth), (3) Healthcare - biotech, medical devices, digital health (15-35% growth), (4) Electric Vehicles - EVs, batteries, charging infrastructure (40-60% growth), (5) Fintech - digital banking, payment processing, crypto (25-45% growth), (6) Clean Energy - solar, wind, energy storage (20-35% growth). Look for secular trends with 10+ year runways and multiple winners, not winner-take-all markets.',
  },
  {
    question: 'Who are famous growth investors I can learn from?',
    answer: 'Top growth investors: (1) Peter Lynch - Fidelity Magellan Fund, pioneered GARP, focused on "10-baggers", (2) Philip Fisher - "Common Stocks and Uncommon Profits", emphasized quality and scuttlebutt research, (3) Cathie Wood - ARK Invest, focuses on disruptive innovation and exponential growth, (4) Thomas Rowe Price Jr. - founder of T. Rowe Price, growth investing pioneer, (5) Terry Smith - Fundsmith, finds quality compounders, (6) Will Danoff - Fidelity Contrafund, blends growth and quality. Study their frameworks: Lynch\'s PEG ratio, Fisher\'s 15 points, Wood\'s 5 innovation platforms. Each emphasizes long-term holding of quality growers.',
  },
  {
    question: 'How do I avoid growth stock traps?',
    answer: 'Avoid these pitfalls: (1) Revenue Without Profitability Path - companies burning cash indefinitely with no margin improvement roadmap, (2) One-Product Wonders - overdependence on single product with no pipeline, (3) Accounting Tricks - aggressive revenue recognition, hiding expenses in stock-based comp, (4) Founder Conflicts - toxic leadership, excessive insider selling, related-party transactions, (5) Ignoring Valuation - paying any price for growth leads to permanent capital loss, (6) Hype Over Fundamentals - meme stocks with no business substance, (7) Small TAMs - limited room to grow, (8) Weak Unit Economics - acquiring customers unprofitably. Do deep fundamental research and demand sustainable, quality growth.',
  },
]

const growthMetrics = [
  {
    name: 'Revenue Growth Rate',
    formula: '(Current Revenue - Prior Revenue) / Prior Revenue',
    target: '15%+ annually',
    why: 'The foundation of growth investing. Consistent 20%+ revenue growth compounds into massive scale. Look for acceleration (growth rate increasing) rather than deceleration.',
  },
  {
    name: 'Gross Margin',
    formula: '(Revenue - COGS) / Revenue',
    target: '60%+ for software, 30%+ for hardware',
    why: 'High gross margins indicate pricing power, scalability, and ability to reach profitability. Software gross margins often exceed 80%, enabling rapid scaling without proportional cost increases.',
  },
  {
    name: 'PEG Ratio',
    formula: 'P/E Ratio / Earnings Growth Rate',
    target: 'Under 2.0 (GARP approach)',
    why: 'Measures valuation relative to growth. A PEG of 1.0 means fairly valued, under 1.0 is attractive, above 2.0 is expensive. Helps avoid overpaying for growth.',
  },
  {
    name: 'Total Addressable Market (TAM)',
    formula: 'Total Customers × ARPU × Penetration',
    target: '$50B+ with expansion potential',
    why: 'Large TAMs provide long growth runways. A company with 5% share in $100B TAM can 20x. Small TAMs limit upside regardless of execution.',
  },
]

const famousInvestors = [
  {
    name: 'Peter Lynch',
    fund: 'Fidelity Magellan Fund',
    approach: 'GARP - Growth at Reasonable Price',
    returns: '29% annually (1977-1990)',
    philosophy: 'Invest in what you know. Find "10-baggers" with PEG ratios under 1.0. Hold winners, sell losers quickly.',
  },
  {
    name: 'Philip Fisher',
    fund: 'Fisher & Co.',
    approach: 'Quality Growth Companies',
    returns: 'Multiple 100x+ winners',
    philosophy: 'Buy outstanding companies and hold forever. Emphasize management quality, competitive moats, and R&D leadership.',
  },
  {
    name: 'Cathie Wood',
    fund: 'ARK Invest',
    approach: 'Disruptive Innovation',
    returns: '40%+ annually (2015-2020)',
    philosophy: 'Focus on exponential growth through convergence of AI, genomics, robotics, energy storage, and blockchain.',
  },
  {
    name: 'Thomas Rowe Price Jr.',
    fund: 'T. Rowe Price',
    approach: 'Fertile Field Growth',
    returns: 'Founded growth investing discipline',
    philosophy: 'Invest in companies benefiting from long-term secular trends. Look for "fertile fields" - industries with tailwinds.',
  },
]

const growthVsValue = [
  {
    aspect: 'Growth Rate',
    growth: '15-50%+ annually',
    value: '5-10% annually',
  },
  {
    aspect: 'Valuation',
    growth: 'High P/E (30-50+)',
    value: 'Low P/E (8-15)',
  },
  {
    aspect: 'Dividends',
    growth: 'Rarely pays',
    value: 'Often 3-5% yield',
  },
  {
    aspect: 'Volatility',
    growth: 'High (50-80% drawdowns)',
    value: 'Lower (20-40% drawdowns)',
  },
  {
    aspect: 'Profitability',
    growth: 'Often unprofitable',
    value: 'Consistently profitable',
  },
  {
    aspect: 'Market Environment',
    growth: 'Outperforms in bull markets',
    value: 'Defensive in bear markets',
  },
  {
    aspect: 'Time Horizon',
    growth: '5-10+ years',
    value: '2-5 years',
  },
  {
    aspect: 'Risk/Reward',
    growth: 'Higher risk, higher potential',
    value: 'Lower risk, moderate returns',
  },
]

const exampleStocks = [
  { ticker: 'NVDA', name: 'Nvidia', why: 'AI chip leader with 80% margins and 50%+ revenue growth' },
  { ticker: 'TSLA', name: 'Tesla', why: 'EV market leader disrupting automotive and energy' },
  { ticker: 'AMD', name: 'AMD', why: 'Taking share from Intel with superior chip architecture' },
  { ticker: 'CRWD', name: 'CrowdStrike', why: 'Cybersecurity leader with 120%+ net retention' },
]

export default function GrowthInvestingPage() {
  const pageUrl = `${SITE_URL}/learn/growth-investing`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'Growth Investing', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Growth Investing Guide: How to Find and Invest in High Growth Stocks',
    description: 'Complete guide to growth investing including key metrics, how to identify growth stocks, GARP strategy, famous investors, and growth vs value comparison.',
    url: pageUrl,
    keywords: ['growth investing', 'growth stocks', 'high growth stocks', 'GARP investing', 'growth vs value'],
  })

  const howToSchema = getHowToSchema({
    name: 'How to Start Growth Investing',
    description: 'Step-by-step guide to investing in high-growth companies for long-term wealth building.',
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
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>Growth Investing</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Growth Investing: Find High-Growth Stocks That Can 10x
            </h1>
            <p className="text-xl text-muted-foreground">
              Master the art of identifying and investing in high-growth companies. Learn key metrics like revenue growth,
              TAM, and gross margins. Discover GARP investing, famous growth investors, and how to avoid growth traps.
            </p>
          </div>

          {/* What is Growth Investing */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What is Growth Investing?</h2>
            <p className="text-muted-foreground mb-4">
              Growth investing focuses on companies expanding revenue and earnings significantly faster than the overall market.
              Rather than seeking undervalued stocks, growth investors pay premium prices for companies with exceptional growth
              potential. These companies typically reinvest all profits into expansion rather than paying dividends.
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mb-6">
              <h3 className="text-lg font-bold mb-3">The Power of Compounding Growth</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-bold text-green-500 mb-1">Amazon Example:</div>
                  <div className="text-muted-foreground">
                    • 1997 IPO: $18 per share<br />
                    • 2000: $106 (+489%) in 3 years<br />
                    • 2010: $180 (+900% from IPO)<br />
                    • 2020: $3,100 (+17,122% from IPO)<br />
                    • 2024: Split-adjusted $180 (~100x from IPO)
                  </div>
                </div>
                <div>
                  <div className="font-bold text-green-500 mb-1">Growth Stock Characteristics:</div>
                  <div className="text-muted-foreground">
                    • Revenue growth 15-50%+ annually<br />
                    • Reinvest profits into expansion<br />
                    • Trade at premium valuations<br />
                    • High volatility (50%+ swings)<br />
                    • Focus on future potential over current profits
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Start */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Start Growth Investing</h2>
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
            <h2 className="text-3xl font-bold mb-6">Key Growth Stock Metrics</h2>
            <div className="space-y-6">
              {growthMetrics.map((metric) => (
                <div key={metric.name} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-bold mb-3 text-green-500">{metric.name}</h3>
                  <div className="bg-background p-3 rounded font-mono text-sm mb-3">
                    {metric.formula}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Target</div>
                      <div className="font-bold text-blue-500">{metric.target}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Why It Matters</div>
                      <div className="text-sm text-muted-foreground">{metric.why}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How to Identify Growth Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Identify High-Growth Stocks</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">1.</div>
                  <div>
                    <div className="font-bold mb-1">Find Expanding Markets with Large TAMs</div>
                    <div className="text-sm text-muted-foreground">
                      Look for $50B+ Total Addressable Markets growing 10%+ annually. AI, cloud, EVs, fintech, and biotech
                      offer multi-decade growth runways. A company with 5% share in a $100B TAM can 20x.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">2.</div>
                  <div>
                    <div className="font-bold mb-1">Track Revenue Growth Acceleration</div>
                    <div className="text-sm text-muted-foreground">
                      Seek 20%+ revenue growth for 3+ consecutive years. Even better: accelerating growth (15% → 20% → 25%).
                      Decelerating growth is a red flag unless temporary.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">3.</div>
                  <div>
                    <div className="font-bold mb-1">Verify Strong Unit Economics</div>
                    <div className="text-sm text-muted-foreground">
                      LTV/CAC ratio above 3x, CAC payback under 12 months, gross margins 60%+ (software) or 30%+ (hardware).
                      Growth without unit economics is unsustainable.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">4.</div>
                  <div>
                    <div className="font-bold mb-1">Assess Competitive Moats</div>
                    <div className="text-sm text-muted-foreground">
                      Network effects, high switching costs, brand power, or technological advantages protect growth. Without moats,
                      competitors erode margins and market share.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">5.</div>
                  <div>
                    <div className="font-bold mb-1">Evaluate Management Quality</div>
                    <div className="text-sm text-muted-foreground">
                      Visionary founders (Bezos, Musk, Huang) often outperform. Look for track record of execution, capital
                      allocation skill, and ability to scale operations.
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-green-500 font-bold">6.</div>
                  <div>
                    <div className="font-bold mb-1">Apply Reasonable Valuation Discipline</div>
                    <div className="text-sm text-muted-foreground">
                      Use PEG ratio under 2.0 to avoid extreme overvaluation. A stock growing 30% at P/E 60 (PEG 2.0) is
                      reasonable; 15% growth at P/E 60 (PEG 4.0) is expensive.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* GARP Strategy */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">GARP: Growth at Reasonable Price</h2>
            <p className="text-muted-foreground mb-6">
              GARP investing combines growth and value by seeking high-growth companies at reasonable valuations.
              Popularized by Peter Lynch, GARP uses the PEG ratio to avoid overpaying for growth.
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mb-6">
              <h3 className="text-lg font-bold mb-4">PEG Ratio Framework</h3>
              <div className="space-y-4">
                <div className="bg-background p-4 rounded">
                  <div className="font-mono text-sm mb-2">PEG Ratio = P/E Ratio ÷ Earnings Growth Rate</div>
                  <div className="text-xs text-muted-foreground">
                    Example: Stock trading at P/E 30 with 25% earnings growth has PEG of 1.2 (reasonable)
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-green-500/10 p-4 rounded border border-green-500/30">
                    <div className="font-bold text-green-500 mb-2">PEG under 1.0</div>
                    <div className="text-muted-foreground">Attractive - growth trading at discount to fundamentals</div>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded border border-blue-500/30">
                    <div className="font-bold text-blue-500 mb-2">PEG 1.0-2.0</div>
                    <div className="text-muted-foreground">Reasonable - fairly valued for growth rate</div>
                  </div>
                  <div className="bg-red-500/10 p-4 rounded border border-red-500/30">
                    <div className="font-bold text-red-500 mb-2">PEG above 2.0</div>
                    <div className="text-muted-foreground">Expensive - high risk of multiple compression</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-bold mb-3">Peter Lynch's GARP Principles</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Find "10-baggers" - stocks that can increase 10x in value over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Invest in what you know - understand the business and products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Buy growth at reasonable prices using PEG ratio under 1.0</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Hold winners long-term, sell losers quickly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Diversify across 10-15 growth positions to manage risk</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Famous Growth Investors */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Famous Growth Investors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {famousInvestors.map((investor) => (
                <div key={investor.name} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-xl font-bold mb-2">{investor.name}</h3>
                  <div className="text-sm space-y-2 mb-4">
                    <div>
                      <span className="text-muted-foreground">Fund:</span>{' '}
                      <span className="font-medium">{investor.fund}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Approach:</span>{' '}
                      <span className="font-medium">{investor.approach}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Track Record:</span>{' '}
                      <span className="font-medium text-green-500">{investor.returns}</span>
                    </div>
                  </div>
                  <div className="bg-background p-3 rounded text-xs text-muted-foreground">
                    <span className="font-bold">Philosophy:</span> {investor.philosophy}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Risks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Risks of Growth Investing</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Valuation Risk</h3>
                <p className="text-muted-foreground">
                  Growth stocks trade at high P/E multiples (30-100+) based on future expectations. If growth slows even slightly,
                  valuations can collapse 50-80%. A stock at 50x earnings growing 40% is reasonable; at 20% growth it's overvalued by 2.5x.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Execution Risk</h3>
                <p className="text-muted-foreground">
                  Scaling from $100M to $10B revenue requires different skills, systems, and culture. Many high-growth companies stumble
                  when entering new markets, managing larger teams, or maintaining product quality at scale.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Interest Rate Sensitivity</h3>
                <p className="text-muted-foreground">
                  Growth stocks are valued on discounted future cash flows. Rising interest rates reduce present value of future earnings,
                  hurting growth stocks disproportionately. 2022's rate hikes caused 50-80% drops in high-growth tech.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Competition Risk</h3>
                <p className="text-muted-foreground">
                  Success attracts well-funded competitors. Without defensible moats, competition erodes margins and slows growth.
                  Many high-flyers fail when incumbents respond or new entrants undercut pricing.
                </p>
              </div>
            </div>
          </section>

          {/* Growth vs Value */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Growth vs Value Investing</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-card rounded-xl border border-border">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left font-bold">Aspect</th>
                    <th className="p-4 text-left font-bold text-green-500">Growth Stocks</th>
                    <th className="p-4 text-left font-bold text-blue-500">Value Stocks</th>
                  </tr>
                </thead>
                <tbody>
                  {growthVsValue.map((row, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="p-4 font-medium">{row.aspect}</td>
                      <td className="p-4 text-muted-foreground">{row.growth}</td>
                      <td className="p-4 text-muted-foreground">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 bg-card p-6 rounded-xl border border-border">
              <h3 className="font-bold mb-3">Which Should You Choose?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Most successful investors blend both approaches. Younger investors can weight growth higher (60-70%) given longer time
                horizons to recover from volatility. Older investors might prefer 60-70% value/dividend stocks for stability and income.
              </p>
              <p className="text-sm text-muted-foreground">
                Growth outperforms in bull markets and low-rate environments. Value provides defense in bear markets and rising-rate
                environments. Diversification across both styles smooths returns and reduces portfolio volatility.
              </p>
            </div>
          </section>

          {/* Example Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">High-Growth Stock Examples</h2>
            <p className="text-muted-foreground mb-6">
              Explore these high-growth stocks to see the principles in action:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleStocks.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/dashboard?ticker=${stock.ticker}`}
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
            <div className="mt-6 text-center">
              <Link
                href="/best-stocks/growth"
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View All Best Growth Stocks →
              </Link>
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
                href="/learn/dividend-investing"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Dividend Investing Guide
                </h3>
                <p className="text-muted-foreground">
                  Compare growth investing with dividend strategies for passive income.
                </p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Find High-Growth Stocks with AI
            </h2>
            <p className="text-muted-foreground mb-6">
              Screen for growth stocks with strong revenue growth, expanding TAMs, and sustainable unit economics.
              Get instant analysis of growth metrics, valuation, and competitive moats.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Find Growth Stocks
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
