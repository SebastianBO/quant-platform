'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Calculator, TrendingUp, DollarSign, Calendar, ArrowRight, Info } from 'lucide-react'

export default function ROICalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000)
  const [finalValue, setFinalValue] = useState<number>(15000)
  const [years, setYears] = useState<number>(3)
  const [additionalInvestments, setAdditionalInvestments] = useState<number>(0)
  const [dividendsReceived, setDividendsReceived] = useState<number>(0)

  const calculations = useMemo(() => {
    const totalInvested = initialInvestment + additionalInvestments
    const totalReturns = finalValue + dividendsReceived

    // Simple ROI
    const simpleROI = ((totalReturns - totalInvested) / totalInvested) * 100

    // Annualized ROI (CAGR)
    const annualizedROI = years > 0
      ? (Math.pow(totalReturns / totalInvested, 1 / years) - 1) * 100
      : 0

    // Net gain/loss
    const netGain = totalReturns - totalInvested

    // Gain multiple
    const gainMultiple = totalReturns / totalInvested

    return {
      simpleROI,
      annualizedROI,
      netGain,
      gainMultiple,
      totalInvested,
      totalReturns,
    }
  }, [initialInvestment, finalValue, years, additionalInvestments, dividendsReceived])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  const faqs = [
    {
      question: "What is ROI (Return on Investment)?",
      answer: "ROI is a performance measure used to evaluate the efficiency of an investment. It calculates the percentage return relative to the investment's cost. A positive ROI means the investment gained value, while a negative ROI indicates a loss."
    },
    {
      question: "How do you calculate ROI?",
      answer: "The basic ROI formula is: ROI = ((Final Value - Initial Investment) / Initial Investment) × 100. For example, if you invested $10,000 and it grew to $15,000, your ROI would be ((15,000 - 10,000) / 10,000) × 100 = 50%."
    },
    {
      question: "What is the difference between ROI and annualized ROI?",
      answer: "Simple ROI shows total return over the entire period, while annualized ROI (also called CAGR) shows the average yearly return. Annualized ROI is better for comparing investments held for different time periods."
    },
    {
      question: "What is a good ROI for stocks?",
      answer: "The S&P 500 has historically returned about 10% annually on average. An ROI above this benchmark could be considered good for stock investments. However, higher returns usually come with higher risk."
    },
    {
      question: "Does ROI include dividends?",
      answer: "Total ROI should include all returns from an investment, including dividends, interest, and capital appreciation. Our calculator allows you to add dividends received to get your true total return."
    },
    {
      question: "How can I improve my investment ROI?",
      answer: "You can potentially improve ROI by: investing for the long term to benefit from compound growth, minimizing fees and taxes, diversifying your portfolio, dollar-cost averaging, and reinvesting dividends."
    }
  ]

  // Example scenarios for comparison
  const scenarios = [
    { name: 'Conservative Bond Fund', initial: 10000, final: 12500, years: 5 },
    { name: 'S&P 500 Index Fund', initial: 10000, final: 16100, years: 5 },
    { name: 'Growth Stock Portfolio', initial: 10000, final: 21000, years: 5 },
    { name: 'Real Estate Investment', initial: 10000, final: 18000, years: 5 },
  ]

  const calculateScenarioROI = (initial: number, final: number, yrs: number) => {
    const simpleROI = ((final - initial) / initial) * 100
    const annualized = (Math.pow(final / initial, 1 / yrs) - 1) * 100
    return { simpleROI, annualized }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li><Link href="/calculators/compound-interest" className="hover:text-foreground">Calculators</Link></li>
            <li>/</li>
            <li className="text-foreground">ROI Calculator</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">ROI Calculator</h1>
              <p className="text-muted-foreground">Calculate Return on Investment</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Calculate your investment returns with our free ROI calculator. Measure simple ROI,
            annualized returns (CAGR), and compare different investment opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Calculator Inputs */}
          <div className="bg-card border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Investment Details
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Initial Investment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Investments (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={additionalInvestments}
                    onChange={(e) => setAdditionalInvestments(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    step="100"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total additional money invested over the period
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Final Value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={finalValue}
                    onChange={(e) => setFinalValue(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dividends/Distributions Received (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={dividendsReceived}
                    onChange={(e) => setDividendsReceived(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    step="100"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Cash dividends or distributions not reinvested
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Investment Period (Years)
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0.1"
                  step="0.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used to calculate annualized ROI (CAGR)
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Main ROI Display */}
            <div className="bg-card border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Your ROI Results
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/5 rounded-lg p-4 text-center">
                  <div className={`text-3xl font-bold ${calculations.simpleROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(calculations.simpleROI)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total ROI</div>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 text-center">
                  <div className={`text-3xl font-bold ${calculations.annualizedROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(calculations.annualizedROI)}
                  </div>
                  <div className="text-sm text-muted-foreground">Annualized ROI</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-medium">{formatCurrency(calculations.totalInvested)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total Returns</span>
                  <span className="font-medium">{formatCurrency(calculations.totalReturns)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Net Gain/Loss</span>
                  <span className={`font-medium ${calculations.netGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.netGain >= 0 ? '+' : ''}{formatCurrency(calculations.netGain)}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Gain Multiple</span>
                  <span className="font-medium">{calculations.gainMultiple.toFixed(2)}x</span>
                </div>
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                How Does Your ROI Compare?
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>S&P 500 Average (10%/year)</span>
                  <span className={calculations.annualizedROI >= 10 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                    {calculations.annualizedROI >= 10 ? 'Beating' : 'Below'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Savings Account (~4%/year)</span>
                  <span className={calculations.annualizedROI >= 4 ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                    {calculations.annualizedROI >= 4 ? 'Beating' : 'Below'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Inflation (~3%/year)</span>
                  <span className={calculations.annualizedROI >= 3 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {calculations.annualizedROI >= 3 ? 'Beating' : 'Losing to'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Comparison Table */}
        <div className="bg-card border rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            5-Year ROI Comparison by Investment Type
          </h2>
          <p className="text-muted-foreground mb-6">
            Compare typical ROI ranges across different investment types over a 5-year period.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Investment Type</th>
                  <th className="text-right py-3 px-4">Initial ($10K)</th>
                  <th className="text-right py-3 px-4">Final Value</th>
                  <th className="text-right py-3 px-4">Total ROI</th>
                  <th className="text-right py-3 px-4">Annualized</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => {
                  const { simpleROI, annualized } = calculateScenarioROI(scenario.initial, scenario.final, scenario.years)
                  return (
                    <tr key={scenario.name} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{scenario.name}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(scenario.initial)}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(scenario.final)}</td>
                      <td className="text-right py-3 px-4 text-green-600">{formatPercent(simpleROI)}</td>
                      <td className="text-right py-3 px-4 text-green-600">{formatPercent(annualized)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            *These are illustrative examples only. Actual returns vary significantly based on market conditions, specific investments, and timing.
          </p>
        </div>

        {/* ROI Formula Explanation */}
        <div className="bg-card border rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-6">Understanding ROI Calculations</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Simple ROI Formula</h3>
              <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm mb-4">
                ROI = ((Final Value - Initial Investment) / Initial Investment) × 100
              </div>
              <p className="text-sm text-muted-foreground">
                Simple ROI tells you the total percentage gain or loss over the entire investment period.
                It&apos;s straightforward but doesn&apos;t account for the time your money was invested.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Annualized ROI (CAGR) Formula</h3>
              <div className="bg-muted/50 p-4 rounded-lg font-mono text-sm mb-4">
                CAGR = ((Final Value / Initial Investment)^(1/Years) - 1) × 100
              </div>
              <p className="text-sm text-muted-foreground">
                Annualized ROI (also called CAGR - Compound Annual Growth Rate) shows your average yearly return.
                This is better for comparing investments held for different time periods.
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <h3 className="font-semibold mb-2">Example Calculation</h3>
            <p className="text-sm text-muted-foreground">
              If you invest <strong>$10,000</strong> and after <strong>3 years</strong> it&apos;s worth <strong>$15,000</strong>:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• <strong>Simple ROI:</strong> ((15,000 - 10,000) / 10,000) × 100 = <strong>50%</strong></li>
              <li>• <strong>Annualized ROI:</strong> ((15,000 / 10,000)^(1/3) - 1) × 100 = <strong>14.47%</strong> per year</li>
            </ul>
          </div>
        </div>

        {/* When to Use ROI */}
        <div className="bg-card border rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-6">When to Use ROI Analysis</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 text-green-600">Best Uses</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Comparing similar investments</li>
                <li>• Evaluating past performance</li>
                <li>• Quick profitability assessment</li>
                <li>• Business investment decisions</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 text-yellow-600">Limitations</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Doesn&apos;t account for risk</li>
                <li>• Ignores time value of money</li>
                <li>• Simple ROI ignores holding period</li>
                <li>• Doesn&apos;t consider opportunity cost</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-600">Better Alternatives</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Risk-adjusted returns (Sharpe ratio)</li>
                <li>• Internal rate of return (IRR)</li>
                <li>• Net present value (NPV)</li>
                <li>• Time-weighted return (TWR)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-card border rounded-xl p-6 mb-12">
          <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Resources */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6">Related Calculators & Resources</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/calculators/compound-interest"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                Compound Interest Calculator
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Project future investment growth with compound returns
              </p>
            </Link>

            <Link
              href="/calculators/stock-profit"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                Stock Profit Calculator
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Calculate gains from buying and selling stocks
              </p>
            </Link>

            <Link
              href="/calculators/dividend-yield"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                Dividend Yield Calculator
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Calculate dividend income and yield on cost
              </p>
            </Link>

            <Link
              href="/insights/sp500-historical-returns"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                S&P 500 Historical Returns
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                See historical stock market ROI by year
              </p>
            </Link>

            <Link
              href="/learn/dollar-cost-averaging"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                Dollar Cost Averaging Guide
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Improve returns by investing consistently
              </p>
            </Link>

            <Link
              href="/screener"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                Stock Screener
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Find stocks with high return potential
              </p>
            </Link>
          </div>
        </div>

        {/* Schema.org markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://lician.com',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Calculators',
                  item: 'https://lician.com/calculators/compound-interest',
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'ROI Calculator',
                  item: 'https://lician.com/calculators/roi',
                },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      </main>

      <Footer />
    </div>
  )
}
