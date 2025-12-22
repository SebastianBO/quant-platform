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
  title: 'DCF Valuation Explained: How to Value a Stock with DCF Analysis (2025)',
  description: 'Learn discounted cash flow (DCF) valuation step-by-step. Master WACC, terminal value, and intrinsic value calculations to value stocks like Warren Buffett.',
  keywords: [
    'DCF valuation',
    'discounted cash flow',
    'how to calculate DCF',
    'intrinsic value',
    'WACC calculation',
    'terminal value',
    'stock valuation DCF',
    'DCF model explained',
  ],
  openGraph: {
    title: 'DCF Valuation Explained - Complete Guide to Discounted Cash Flow',
    description: 'Master DCF valuation with step-by-step instructions, examples, and calculations.',
    type: 'article',
    url: `${SITE_URL}/learn/dcf-valuation`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/dcf-valuation`,
  },
}

const howToSteps = [
  {
    name: 'Project Future Free Cash Flows',
    text: 'Estimate the company\'s free cash flow for the next 5-10 years. Start with current FCF and apply realistic growth rates based on historical performance, industry trends, and competitive position. Be conservative - overly optimistic projections destroy DCF accuracy.',
  },
  {
    name: 'Calculate the Discount Rate (WACC)',
    text: 'Determine the Weighted Average Cost of Capital (WACC) which reflects the risk and opportunity cost of investing in this stock. WACC considers the cost of equity (using CAPM) and cost of debt, weighted by capital structure. Higher risk = higher WACC = lower value.',
  },
  {
    name: 'Calculate Terminal Value',
    text: 'Estimate the company\'s value beyond the projection period using the perpetuity growth method (FCF × (1+g) / (WACC-g)) or exit multiple method. Terminal value often represents 60-80% of total value, so be conservative with the growth rate.',
  },
  {
    name: 'Discount Cash Flows to Present Value',
    text: 'Discount each future cash flow and the terminal value back to present value using the formula: PV = FV / (1 + WACC)^n. This accounts for the time value of money - a dollar today is worth more than a dollar tomorrow.',
  },
  {
    name: 'Calculate Intrinsic Value Per Share',
    text: 'Sum all discounted cash flows and terminal value to get enterprise value. Subtract net debt and divide by shares outstanding to get intrinsic value per share. Compare this to the current stock price to determine if it\'s undervalued.',
  },
]

const faqs = [
  {
    question: 'What is DCF valuation and why is it important?',
    answer: 'DCF (Discounted Cash Flow) valuation is a method to estimate a stock\'s intrinsic value based on projected future cash flows discounted to present value. It\'s considered the gold standard of valuation because it focuses on the fundamental economic value a business generates, rather than market sentiment or comparable multiples. Warren Buffett and other value investors rely heavily on DCF analysis.',
  },
  {
    question: 'How do you calculate DCF valuation?',
    answer: 'Calculate DCF in five steps: (1) Project free cash flows for 5-10 years, (2) Calculate the discount rate (WACC) reflecting the investment\'s risk, (3) Calculate terminal value representing cash flows beyond the projection period, (4) Discount all cash flows to present value using WACC, (5) Sum the present values and divide by shares outstanding to get intrinsic value per share.',
  },
  {
    question: 'What is WACC and how do you calculate it?',
    answer: 'WACC (Weighted Average Cost of Capital) is the blended cost of a company\'s debt and equity financing. Calculate it as: WACC = (E/V × Cost of Equity) + (D/V × Cost of Debt × (1-Tax Rate)), where E is equity value, D is debt value, and V is total value (E+D). Cost of equity is typically calculated using CAPM. WACC represents the minimum return the company must generate to satisfy investors.',
  },
  {
    question: 'What is terminal value in DCF?',
    answer: 'Terminal value estimates a company\'s value beyond the explicit forecast period (typically after year 5-10). It\'s calculated using either: (1) Perpetuity Growth Method: Terminal Value = Final Year FCF × (1+g) / (WACC - g), where g is the perpetual growth rate (typically 2-3%), or (2) Exit Multiple Method: Terminal Value = Final Year EBITDA × Exit Multiple. Terminal value often represents 60-80% of total DCF value.',
  },
  {
    question: 'What is a good DCF value for a stock?',
    answer: 'A stock is potentially undervalued if its DCF intrinsic value significantly exceeds the current market price. Value investors typically look for a "margin of safety" of 20-30% or more - meaning they want to buy at $70 or less if intrinsic value is $100. This buffer protects against errors in assumptions and provides upside potential. If intrinsic value is below market price, the stock may be overvalued.',
  },
  {
    question: 'What are the limitations of DCF valuation?',
    answer: 'DCF limitations include: (1) Garbage in, garbage out - accuracy depends entirely on assumptions about growth, margins, and WACC, (2) Long projection periods compound errors, (3) Terminal value assumptions can dramatically change results, (4) Doesn\'t work well for unprofitable companies or those with negative FCF, (5) Doesn\'t capture qualitative factors like brand value or management quality. Always use DCF alongside other valuation methods.',
  },
  {
    question: 'How do you project free cash flow for DCF?',
    answer: 'Start with historical FCF and apply realistic growth rates: (1) Analyze 5-10 years of historical revenue growth and margins, (2) Consider industry trends, competitive position, and market size, (3) Project revenue growth (typically declining over time toward GDP growth), (4) Estimate operating margins based on historical performance, (5) Calculate taxes, working capital changes, and capex, (6) Derive FCF = Operating Cash Flow - Capital Expenditures. Be conservative - optimism destroys DCF accuracy.',
  },
  {
    question: 'What is a reasonable growth rate for terminal value?',
    answer: 'The terminal growth rate should be conservative, typically 2-3% (around long-term GDP growth). Using rates above 4-5% implies the company will eventually exceed the size of the entire economy, which is unrealistic. Even the best companies eventually mature and grow at GDP rates. Higher terminal growth rates can dramatically inflate valuation, so be conservative and run sensitivity analyses.',
  },
]

const exampleStocks = [
  { ticker: 'AAPL', name: 'Apple', why: 'Strong FCF and predictable cash flows' },
  { ticker: 'MSFT', name: 'Microsoft', why: 'Recurring revenue from cloud and software' },
  { ticker: 'V', name: 'Visa', why: 'Capital-light model with high FCF margins' },
  { ticker: 'JPM', name: 'JPMorgan', why: 'Stable earnings in mature industry' },
]

export default function DCFValuationPage() {
  const pageUrl = `${SITE_URL}/learn/dcf-valuation`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'DCF Valuation', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'DCF Valuation Explained: Complete Guide to Discounted Cash Flow Analysis',
    description: 'Learn how to value stocks using DCF valuation, including WACC, terminal value, and intrinsic value calculations.',
    url: pageUrl,
    keywords: ['DCF valuation', 'discounted cash flow', 'WACC', 'terminal value', 'intrinsic value'],
  })

  const howToSchema = getHowToSchema({
    name: 'How to Calculate DCF Valuation',
    description: 'Step-by-step guide to valuing a stock using discounted cash flow analysis.',
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
            <span>DCF Valuation</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              DCF Valuation Explained: Complete Guide
            </h1>
            <p className="text-xl text-muted-foreground">
              Learn how to calculate a stock's intrinsic value using discounted cash flow (DCF) analysis -
              the valuation method used by Warren Buffett and professional investors.
            </p>
          </div>

          {/* What is DCF */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What is DCF Valuation?</h2>
            <p className="text-muted-foreground mb-4">
              Discounted Cash Flow (DCF) valuation is a method to estimate the intrinsic value of an investment based on
              its projected future cash flows. The core principle is simple: a company is worth the present value of all
              the cash it will generate in the future.
            </p>
            <p className="text-muted-foreground mb-4">
              DCF analysis answers the fundamental question: "How much is this business worth based on the cash it will
              generate?" Unlike relative valuation methods (P/E ratios, comparables), DCF focuses on absolute value derived
              from fundamental economics.
            </p>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <p className="text-sm text-muted-foreground italic">
                "Price is what you pay. Value is what you get." - Warren Buffett
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                DCF helps you determine value, so you don't overpay for a stock.
              </p>
            </div>
          </section>

          {/* How to Calculate DCF */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Calculate DCF Valuation: Step-by-Step</h2>
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

          {/* DCF Formula */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">DCF Formula Breakdown</h2>
            <div className="bg-card p-6 rounded-xl border border-border mb-6">
              <h3 className="text-xl font-bold mb-4 text-center">Enterprise Value Formula</h3>
              <div className="bg-background p-4 rounded-lg font-mono text-sm text-center overflow-x-auto">
                <div className="mb-4">
                  EV = Σ [FCF<sub>t</sub> / (1 + WACC)<sup>t</sup>] + [TV / (1 + WACC)<sup>n</sup>]
                </div>
                <div className="text-xs text-muted-foreground">
                  Where: FCF<sub>t</sub> = Free Cash Flow in year t, WACC = Weighted Average Cost of Capital,
                  TV = Terminal Value, n = number of projection years
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">WACC Formula</h3>
                <div className="bg-background p-3 rounded font-mono text-xs mb-3 overflow-x-auto">
                  WACC = (E/V) × Re + (D/V) × Rd × (1-Tc)
                </div>
                <p className="text-sm text-muted-foreground">
                  E = Equity value, D = Debt value, V = E + D, Re = Cost of equity (CAPM),
                  Rd = Cost of debt, Tc = Tax rate
                </p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Terminal Value Formula</h3>
                <div className="bg-background p-3 rounded font-mono text-xs mb-3 overflow-x-auto">
                  TV = FCF<sub>n+1</sub> / (WACC - g)
                </div>
                <p className="text-sm text-muted-foreground">
                  FCF<sub>n+1</sub> = Free cash flow in year after projection period,
                  g = Perpetual growth rate (typically 2-3%)
                </p>
              </div>
            </div>
          </section>

          {/* Example Calculation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">DCF Valuation Example</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-xl font-bold mb-4">Example: Valuing a Tech Company</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">Assumptions:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Current FCF: $100M</li>
                    <li>• Growth: 20% (Y1), 18% (Y2), 15% (Y3), 12% (Y4), 10% (Y5)</li>
                    <li>• WACC: 10%</li>
                    <li>• Terminal growth rate: 3%</li>
                    <li>• Shares outstanding: 50M</li>
                    <li>• Net debt: $200M</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Projected Cash Flows:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left py-2">Year</th>
                          <th className="text-right py-2">FCF ($M)</th>
                          <th className="text-right py-2">Discount Factor</th>
                          <th className="text-right py-2">PV ($M)</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr><td>1</td><td className="text-right">$120</td><td className="text-right">0.909</td><td className="text-right">$109</td></tr>
                        <tr><td>2</td><td className="text-right">$142</td><td className="text-right">0.826</td><td className="text-right">$117</td></tr>
                        <tr><td>3</td><td className="text-right">$163</td><td className="text-right">0.751</td><td className="text-right">$122</td></tr>
                        <tr><td>4</td><td className="text-right">$183</td><td className="text-right">0.683</td><td className="text-right">$125</td></tr>
                        <tr><td>5</td><td className="text-right">$201</td><td className="text-right">0.621</td><td className="text-right">$125</td></tr>
                        <tr className="border-t border-border font-bold">
                          <td colSpan={3} className="pt-2">Sum of PV (Years 1-5)</td>
                          <td className="text-right pt-2">$598M</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Terminal Value Calculation:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Year 6 FCF = $201M × 1.03 = $207M</p>
                    <p>Terminal Value = $207M / (0.10 - 0.03) = $2,957M</p>
                    <p>PV of Terminal Value = $2,957M × 0.621 = $1,836M</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-bold mb-2">Final Valuation:</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">Enterprise Value = $598M + $1,836M = $2,434M</p>
                    <p className="text-muted-foreground">Less: Net Debt = -$200M</p>
                    <p className="text-muted-foreground">Equity Value = $2,234M</p>
                    <p className="text-green-500 font-bold text-lg mt-2">
                      Intrinsic Value per Share = $2,234M / 50M = $44.68
                    </p>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded p-4 mt-4">
                  <p className="text-sm">
                    <span className="font-bold">Investment Decision:</span> If the stock trades at $35, it's undervalued by 28%,
                    offering a margin of safety. If it trades at $50, it's overvalued by 12% and should be avoided.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Considerations */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Key DCF Considerations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Growth Rate Assumptions</h3>
                <p className="text-muted-foreground text-sm">
                  Be conservative. High growth rates rarely sustain beyond 5-7 years. Use historical growth,
                  industry benchmarks, and competitive analysis. Err on the side of caution - it's better to
                  be pleasantly surprised than disappointed.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">WACC Selection</h3>
                <p className="text-muted-foreground text-sm">
                  WACC significantly impacts valuation. Small changes (8% vs 10%) can swing value by 20-30%.
                  Use risk-free rate + equity risk premium × beta for cost of equity. Higher risk companies
                  require higher WACC, reducing value.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Terminal Value Sensitivity</h3>
                <p className="text-muted-foreground text-sm">
                  Terminal value often represents 60-80% of total value. Use conservative perpetual growth
                  rates (2-3%). Run sensitivity analysis - if small changes drastically alter value, your
                  assumptions need refinement.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">Margin of Safety</h3>
                <p className="text-muted-foreground text-sm">
                  Never pay full intrinsic value. Require a 20-40% discount (margin of safety) to account for
                  assumption errors, unexpected events, and market volatility. The greater the uncertainty,
                  the larger the margin required.
                </p>
              </div>
            </div>
          </section>

          {/* Example Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Practice DCF with These Stocks</h2>
            <p className="text-muted-foreground mb-6">
              Apply DCF valuation to these companies with predictable cash flows:
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
                    <span className="text-xs text-green-500">View DCF →</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stock.name}</p>
                  <p className="text-xs text-muted-foreground">{stock.why}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Common DCF Mistakes to Avoid</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Overly Optimistic Growth Projections</h3>
                <p className="text-muted-foreground">
                  Using 20%+ growth for 10 years implies the company will be massive. Most companies' growth
                  slows significantly after 5-7 years. Be realistic and conservative.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Using Too Low a Discount Rate</h3>
                <p className="text-muted-foreground">
                  Low WACC inflates valuations artificially. Risk must be properly reflected in the discount rate.
                  Small-cap, cyclical, or leveraged companies need higher WACC than large-cap stable businesses.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Ignoring Capital Requirements</h3>
                <p className="text-muted-foreground">
                  Growth requires capital. Don't forget to account for working capital increases and capital
                  expenditures when projecting free cash flow. High-growth companies often burn cash initially.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">False Precision</h3>
                <p className="text-muted-foreground">
                  DCF is not precise to the penny. If your model says intrinsic value is $47.83, understand
                  there's significant uncertainty. Focus on whether it's roughly $40, $50, or $60, not exact decimals.
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

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Instant DCF Calculations with AI
            </h2>
            <p className="text-muted-foreground mb-6">
              Skip the complex Excel models. Our AI-powered DCF calculator instantly values any stock
              with customizable assumptions, sensitivity analysis, and professional-grade accuracy.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Try Free DCF Calculator
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
