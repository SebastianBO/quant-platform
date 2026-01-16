'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

// Metadata must be exported from a separate file for client components
// SEO metadata is in metadata.ts

interface YearlyData {
  year: number
  startBalance: number
  contributions: number
  interest: number
  endBalance: number
}

export default function CompoundInterestCalculator() {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500)
  const [annualRate, setAnnualRate] = useState<number>(8)
  const [years, setYears] = useState<number>(30)
  const [compoundFrequency, setCompoundFrequency] = useState<number>(12) // Monthly

  const results = useMemo(() => {
    const rate = annualRate / 100
    const periodsPerYear = compoundFrequency
    const totalPeriods = years * periodsPerYear
    const periodicRate = rate / periodsPerYear
    const contributionPerPeriod = monthlyContribution * (12 / periodsPerYear)

    // Calculate future value with regular contributions
    // FV = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
    const compoundFactor = Math.pow(1 + periodicRate, totalPeriods)
    const futureValuePrincipal = initialInvestment * compoundFactor
    const futureValueContributions = contributionPerPeriod * ((compoundFactor - 1) / periodicRate)
    const futureValue = futureValuePrincipal + futureValueContributions

    const totalContributions = initialInvestment + (monthlyContribution * 12 * years)
    const totalInterest = futureValue - totalContributions

    // Generate yearly breakdown
    const yearlyData: YearlyData[] = []
    let balance = initialInvestment

    for (let y = 1; y <= years; y++) {
      const startBalance = balance
      const yearlyContributions = monthlyContribution * 12

      // Calculate compound growth for this year
      for (let p = 0; p < periodsPerYear; p++) {
        balance += contributionPerPeriod
        balance *= (1 + periodicRate)
      }

      const yearInterest = balance - startBalance - yearlyContributions

      yearlyData.push({
        year: y,
        startBalance,
        contributions: yearlyContributions,
        interest: yearInterest,
        endBalance: balance,
      })
    }

    return {
      futureValue,
      totalContributions,
      totalInterest,
      yearlyData,
    }
  }, [initialInvestment, monthlyContribution, annualRate, years, compoundFrequency])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/learn/how-to-invest" className="hover:text-foreground">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Compound Interest Calculator</span>
        </nav>

        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Compound Interest Calculator
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Calculate how your investments can grow over time with compound interest.
            See the power of consistent contributions and long-term investing.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Calculator Inputs */}
          <div className="space-y-6 p-6 rounded-lg border border-border bg-card">
            <h2 className="text-xl font-semibold">Investment Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Initial Investment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Monthly Contribution
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Annual Interest Rate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value) || 0)}
                    className="w-full pr-8 pl-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    max="30"
                    step="0.5"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  S&P 500 average: ~10% | Conservative bonds: ~4-5%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Time Period (Years)
                </label>
                <input
                  type="range"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted"
                  min="1"
                  max="50"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>1 year</span>
                  <span className="font-medium text-foreground">{years} years</span>
                  <span>50 years</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Compound Frequency
                </label>
                <select
                  value={compoundFrequency}
                  onChange={(e) => setCompoundFrequency(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>Annually</option>
                  <option value={4}>Quarterly</option>
                  <option value={12}>Monthly</option>
                  <option value={365}>Daily</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-primary bg-primary/10">
              <h2 className="text-lg font-medium mb-4">Future Value</h2>
              <div className="text-4xl font-bold text-primary mb-2">
                {formatCurrency(results.futureValue)}
              </div>
              <p className="text-sm text-muted-foreground">
                After {years} years of investing
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground mb-1">Total Contributions</div>
                <div className="text-xl font-semibold">{formatCurrency(results.totalContributions)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatPercent((results.totalContributions / results.futureValue) * 100)} of total
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground mb-1">Interest Earned</div>
                <div className="text-xl font-semibold text-green-500">{formatCurrency(results.totalInterest)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatPercent((results.totalInterest / results.futureValue) * 100)} of total
                </div>
              </div>
            </div>

            {/* Visual Breakdown */}
            <div className="p-4 rounded-lg border border-border">
              <h3 className="text-sm font-medium mb-3">Breakdown</h3>
              <div className="w-full h-6 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${(initialInvestment / results.futureValue) * 100}%` }}
                  title="Initial Investment"
                />
                <div
                  className="bg-blue-300 h-full"
                  style={{ width: `${((results.totalContributions - initialInvestment) / results.futureValue) * 100}%` }}
                  title="Monthly Contributions"
                />
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${(results.totalInterest / results.futureValue) * 100}%` }}
                  title="Interest Earned"
                />
              </div>
              <div className="flex gap-4 mt-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>Initial</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-300" />
                  <span>Contributions</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Interest</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Breakdown Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Year-by-Year Growth</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Year</th>
                  <th className="text-right py-3 px-4">Start Balance</th>
                  <th className="text-right py-3 px-4">Contributions</th>
                  <th className="text-right py-3 px-4">Interest</th>
                  <th className="text-right py-3 px-4">End Balance</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyData.slice(0, 10).map((year) => (
                  <tr key={year.year} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-4 font-medium">{year.year}</td>
                    <td className="py-2 px-4 text-right font-mono">{formatCurrency(year.startBalance)}</td>
                    <td className="py-2 px-4 text-right font-mono">{formatCurrency(year.contributions)}</td>
                    <td className="py-2 px-4 text-right font-mono text-green-500">{formatCurrency(year.interest)}</td>
                    <td className="py-2 px-4 text-right font-mono font-medium">{formatCurrency(year.endBalance)}</td>
                  </tr>
                ))}
                {years > 10 && (
                  <>
                    <tr className="border-b border-border/50">
                      <td className="py-2 px-4 text-muted-foreground" colSpan={5}>...</td>
                    </tr>
                    {results.yearlyData.slice(-3).map((year) => (
                      <tr key={year.year} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-4 font-medium">{year.year}</td>
                        <td className="py-2 px-4 text-right font-mono">{formatCurrency(year.startBalance)}</td>
                        <td className="py-2 px-4 text-right font-mono">{formatCurrency(year.contributions)}</td>
                        <td className="py-2 px-4 text-right font-mono text-green-500">{formatCurrency(year.interest)}</td>
                        <td className="py-2 px-4 text-right font-mono font-medium">{formatCurrency(year.endBalance)}</td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Insight */}
        <section className="mb-12 p-6 rounded-lg bg-primary/10 border border-primary/20">
          <h2 className="text-xl font-semibold mb-3">The Power of Compound Interest</h2>
          <p className="text-muted-foreground mb-3">
            Albert Einstein reportedly called compound interest &quot;the eighth wonder of the world.&quot;
            With an initial investment of {formatCurrency(initialInvestment)} and {formatCurrency(monthlyContribution)}/month
            contributions at {annualRate}% annual return:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>After 10 years: {formatCurrency(results.yearlyData[Math.min(9, results.yearlyData.length - 1)]?.endBalance || 0)}</li>
            <li>After 20 years: {formatCurrency(results.yearlyData[Math.min(19, results.yearlyData.length - 1)]?.endBalance || 0)}</li>
            <li>After 30 years: {formatCurrency(results.yearlyData[Math.min(29, results.yearlyData.length - 1)]?.endBalance || 0)}</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            <strong>Time is your greatest ally.</strong> Starting early matters more than the amount you invest.
          </p>
        </section>

        {/* Educational Content for SEO */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Understanding Compound Interest</h2>

          <div className="space-y-6 text-muted-foreground">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">What is Compound Interest?</h3>
              <p>
                Compound interest is interest calculated on both the initial principal and the accumulated
                interest from previous periods. Unlike simple interest (which only earns on the original
                amount), compound interest allows your money to grow exponentially over time. This
                &quot;interest on interest&quot; effect is why long-term investors can build significant wealth
                even with modest contributions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">The Compound Interest Formula</h3>
              <p className="mb-2">
                The formula for compound interest with regular contributions is:
              </p>
              <code className="block p-4 rounded bg-muted text-sm overflow-x-auto">
                FV = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) - 1) / (r/n)]
              </code>
              <p className="mt-2 text-sm">
                Where: P = Principal, r = Annual rate, n = Compounds per year, t = Years, PMT = Regular payment
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Why Start Early?</h3>
              <p>
                The Rule of 72 states that you can estimate how long it takes to double your money by
                dividing 72 by the interest rate. At 8% returns, your money doubles every 9 years.
                Someone who starts investing at 25 will have significantly more than someone who starts
                at 35, even if the late starter contributes more money.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Historical Stock Market Returns</h3>
              <p>
                The S&P 500 has historically returned approximately 10% annually (including dividends)
                over the long term. However, returns vary significantly year to year. A diversified
                portfolio of stocks provides good exposure to compound growth potential while managing
                risk through broad market exposure.
              </p>
              <div className="mt-2">
                <Link href="/insights/sp500-historical-returns" className="text-primary hover:underline">
                  View S&P 500 Historical Returns &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-medium mb-2">What is a good compound interest rate?</h3>
              <p className="text-muted-foreground">
                A &quot;good&quot; compound interest rate depends on the investment type. High-yield savings accounts
                offer 4-5% (2024), while the stock market has historically returned ~10% annually over the
                long term. For retirement planning, many advisors use 6-8% as a conservative estimate that
                accounts for inflation.
              </p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-medium mb-2">How does compound frequency affect returns?</h3>
              <p className="text-muted-foreground">
                More frequent compounding produces slightly higher returns. Daily compounding earns marginally
                more than monthly, which earns more than annually. However, the difference is usually small
                (typically less than 0.5% per year). The interest rate and time invested matter far more than
                compounding frequency.
              </p>
            </div>
            <div className="border-b border-border pb-6">
              <h3 className="text-lg font-medium mb-2">How much should I invest monthly?</h3>
              <p className="text-muted-foreground">
                A common guideline is to save 15-20% of your income for retirement. The key is consistency -
                even small amounts compound significantly over decades. Start with what you can afford and
                increase contributions as your income grows. Automating contributions helps ensure consistency.
              </p>
            </div>
            <div className="border-b border-border pb-6 last:border-b-0">
              <h3 className="text-lg font-medium mb-2">Does compound interest work with stocks?</h3>
              <p className="text-muted-foreground">
                Yes! While stocks don&apos;t technically earn &quot;interest,&quot; the same compounding principle applies
                through capital appreciation and reinvested dividends. A stock portfolio that grows 10%
                annually works exactly like 10% compound interest - your gains generate more gains over time.
              </p>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Related Tools & Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/insights/sp500-historical-returns"
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-1">S&P 500 Historical Returns</h3>
              <p className="text-sm text-muted-foreground">Annual returns from 1926-2025</p>
            </Link>
            <Link
              href="/learn/how-to-invest"
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-1">How to Start Investing</h3>
              <p className="text-sm text-muted-foreground">Beginner&apos;s guide to investing</p>
            </Link>
            <Link
              href="/etfs"
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-1">S&P 500 ETFs</h3>
              <p className="text-sm text-muted-foreground">Compare SPY, VOO, IVV</p>
            </Link>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="text-sm text-muted-foreground border-t border-border pt-6">
          <h3 className="font-medium mb-2">Disclaimer</h3>
          <p>
            This calculator is for educational and illustrative purposes only. Actual investment returns
            will vary and may be lower or higher than the rate used in calculations. Past performance
            does not guarantee future results. Stock market investments carry risk of loss. Consult
            a qualified financial advisor before making investment decisions.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
