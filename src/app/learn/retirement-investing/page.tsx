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
  title: 'Retirement Investing Guide: 401k, IRA, and Roth Strategies (2026)',
  description: 'Learn retirement investing with 401k, IRA, and Roth accounts. Understand contribution limits, tax advantages, investment strategies by age, and how to build a retirement portfolio.',
  keywords: [
    'retirement investing',
    '401k investing',
    'ira investing',
    'roth ira',
    'retirement planning',
    'how to invest for retirement',
    'retirement account types',
    '401k vs ira',
  ],
  openGraph: {
    title: 'Retirement Investing Guide - 401k, IRA, and Roth Strategies',
    description: 'Complete guide to retirement investing. Learn about 401k, IRA, Roth accounts, contribution limits, and age-based investment strategies.',
    type: 'article',
    url: `${SITE_URL}/learn/retirement-investing`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/retirement-investing`,
  },
}

const howToSteps = [
  {
    name: 'Maximize Employer 401k Match',
    text: 'If your employer offers a 401k match, contribute at least enough to get the full match - it&apos;s free money. A typical match is 50% of contributions up to 6% of salary. That&apos;s an immediate 50% return on your investment.',
  },
  {
    name: 'Choose Between Traditional and Roth',
    text: 'Traditional accounts give you a tax deduction now but you pay taxes in retirement. Roth accounts use after-tax money but withdrawals are tax-free. Generally: use Roth if you expect higher taxes later, Traditional if you expect lower taxes in retirement.',
  },
  {
    name: 'Select Low-Cost Index Funds',
    text: 'Most 401k plans offer target-date funds or index funds. Choose funds with expense ratios under 0.20%. A target-date fund (like "2050 Fund") automatically adjusts your allocation as you age. For IRAs, use low-cost ETFs like VTI and BND.',
  },
  {
    name: 'Determine Your Asset Allocation',
    text: 'A common rule: subtract your age from 110 to get your stock percentage. At 30, hold 80% stocks, 20% bonds. At 60, hold 50% stocks, 50% bonds. Adjust based on your risk tolerance and other retirement income sources.',
  },
  {
    name: 'Contribute Consistently',
    text: 'Set up automatic contributions to invest regularly regardless of market conditions (dollar-cost averaging). Increase contributions by 1% each year or whenever you get a raise. The earlier and more consistently you invest, the more time compound growth works for you.',
  },
  {
    name: 'Review and Rebalance Annually',
    text: 'Check your portfolio once a year. If stocks outperform, you may need to sell some and buy bonds to maintain your target allocation. Most target-date funds do this automatically. Avoid checking daily - it leads to emotional decisions.',
  },
]

const faqs = [
  {
    question: 'What is the difference between a 401k and an IRA?',
    answer: 'A 401k is an employer-sponsored retirement plan with higher contribution limits ($23,500 in 2026) and often includes employer matching. An IRA (Individual Retirement Account) is opened on your own with lower limits ($7,000 in 2026) but more investment choices. You can have both. 401k contributions are deducted from your paycheck; IRA contributions you make yourself.',
  },
  {
    question: 'Should I choose Roth or Traditional?',
    answer: 'Choose Roth if: you expect higher income/tax rates in retirement, you&apos;re young (more time for tax-free growth), or you want tax-free withdrawals. Choose Traditional if: you need the tax deduction now, you expect lower taxes in retirement, or you&apos;re in a high tax bracket now. Many people use both for tax diversification.',
  },
  {
    question: 'How much should I save for retirement?',
    answer: 'Financial advisors commonly recommend saving 15% of your income for retirement, including employer matches. If you started late, you may need 20-25%. By age 30, aim to have 1x your salary saved. By 40, aim for 3x. By 50, aim for 6x. By 60, aim for 8x. These are guidelines - your specific needs depend on your lifestyle and retirement goals.',
  },
  {
    question: 'What are the 2026 retirement contribution limits?',
    answer: '401k: $23,500 (plus $7,500 catch-up if 50+). IRA: $7,000 (plus $1,000 catch-up if 50+). Roth IRA income limits: single filers can contribute fully if income is under $150,000, partially up to $165,000. Married filing jointly: fully under $236,000, partially up to $246,000. These limits increase most years with inflation.',
  },
  {
    question: 'When can I withdraw from retirement accounts?',
    answer: 'Generally, you can withdraw penalty-free at age 59½. Early withdrawals typically incur a 10% penalty plus income taxes (Traditional) or penalties on earnings (Roth). Exceptions include: first home purchase ($10,000 IRA), disability, qualified education expenses, and substantially equal periodic payments. Roth IRA contributions (not earnings) can always be withdrawn penalty-free.',
  },
  {
    question: 'What is a target-date fund?',
    answer: 'A target-date fund (like "Vanguard Target Retirement 2050") is an all-in-one retirement fund that automatically adjusts its stock/bond mix as you approach retirement. Pick the fund closest to your expected retirement year. It starts aggressive (more stocks) and becomes conservative (more bonds) over time. Great for hands-off investors - you just pick one fund.',
  },
]

export default function RetirementInvestingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'Retirement Investing', url: `${SITE_URL}/learn/retirement-investing` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Retirement Investing Guide: 401k, IRA, and Roth Strategies',
    datePublished: '2026-01-16',
    dateModified: '2026-01-16',
    description: 'Complete guide to retirement investing with 401k, IRA, and Roth accounts.',
    url: `${SITE_URL}/learn/retirement-investing`,
  })

  const faqSchema = getFAQSchema(faqs)

  const howToSchema = getHowToSchema({
    name: 'How to Start Retirement Investing',
    description: 'Step-by-step guide to begin your retirement investing journey',
    steps: howToSteps,
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema, howToSchema]),
          }}
        />

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6">
            <ol className="flex items-center gap-2 text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground">Home</Link></li>
              <li>/</li>
              <li><Link href="/learn/how-to-invest" className="hover:text-foreground">Learn</Link></li>
              <li>/</li>
              <li className="text-foreground">Retirement Investing</li>
            </ol>
          </nav>

          <article className="prose dark:prose-invert max-w-none">
            <h1>Retirement Investing Guide: 401k, IRA, and Roth Strategies</h1>

            <p className="lead text-xl text-muted-foreground">
              Investing for retirement is one of the most important financial decisions you&apos;ll make.
              This guide explains the different retirement account types, their tax advantages, and strategies
              for building wealth over your working career.
            </p>

            <div className="not-prose bg-card border rounded-lg p-6 my-8">
              <h2 className="text-lg font-semibold mb-4">2026 Contribution Limits</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold">401k / 403b</h3>
                  <p className="text-2xl font-bold text-primary">$23,500</p>
                  <p className="text-muted-foreground">+$7,500 catch-up if 50+</p>
                </div>
                <div>
                  <h3 className="font-semibold">IRA (Traditional & Roth)</h3>
                  <p className="text-2xl font-bold text-primary">$7,000</p>
                  <p className="text-muted-foreground">+$1,000 catch-up if 50+</p>
                </div>
              </div>
            </div>

            <h2>Types of Retirement Accounts</h2>

            <h3>401k (and 403b)</h3>
            <p>
              A 401k is an employer-sponsored retirement plan. The key benefits are higher contribution limits
              and often employer matching (free money). A 403b is similar but for non-profit and government employees.
            </p>
            <ul>
              <li><strong>Traditional 401k:</strong> Contributions reduce your taxable income now. You pay taxes when you withdraw in retirement.</li>
              <li><strong>Roth 401k:</strong> Contributions are after-tax. Withdrawals in retirement are completely tax-free.</li>
              <li><strong>Employer Match:</strong> Many employers match a percentage of your contributions - always contribute enough to get the full match.</li>
            </ul>

            <h3>Individual Retirement Account (IRA)</h3>
            <p>
              An IRA is a personal retirement account you open yourself at a brokerage. IRAs offer more investment
              choices than most 401k plans but have lower contribution limits.
            </p>
            <ul>
              <li><strong>Traditional IRA:</strong> Contributions may be tax-deductible. You pay taxes on withdrawals.</li>
              <li><strong>Roth IRA:</strong> Contributions are after-tax. All growth and withdrawals are tax-free. Income limits apply.</li>
              <li><strong>SEP IRA:</strong> For self-employed individuals. Much higher limits (up to $69,000 in 2026).</li>
            </ul>

            <h2>Retirement Account Comparison</h2>

            <div className="not-prose overflow-x-auto my-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Feature</th>
                    <th className="text-left py-2 px-4">Traditional 401k</th>
                    <th className="text-left py-2 px-4">Roth 401k</th>
                    <th className="text-left py-2 px-4">Traditional IRA</th>
                    <th className="text-left py-2 px-4">Roth IRA</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">2026 Limit</td>
                    <td className="py-2 px-4">$23,500</td>
                    <td className="py-2 px-4">$23,500</td>
                    <td className="py-2 px-4">$7,000</td>
                    <td className="py-2 px-4">$7,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Tax on Contributions</td>
                    <td className="py-2 px-4 text-green-600">Deductible</td>
                    <td className="py-2 px-4">After-tax</td>
                    <td className="py-2 px-4 text-green-600">Deductible*</td>
                    <td className="py-2 px-4">After-tax</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Tax on Withdrawals</td>
                    <td className="py-2 px-4">Taxed</td>
                    <td className="py-2 px-4 text-green-600">Tax-free</td>
                    <td className="py-2 px-4">Taxed</td>
                    <td className="py-2 px-4 text-green-600">Tax-free</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Employer Match</td>
                    <td className="py-2 px-4 text-green-600">Yes</td>
                    <td className="py-2 px-4 text-green-600">Yes</td>
                    <td className="py-2 px-4">No</td>
                    <td className="py-2 px-4">No</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Income Limits</td>
                    <td className="py-2 px-4">None</td>
                    <td className="py-2 px-4">None</td>
                    <td className="py-2 px-4">None*</td>
                    <td className="py-2 px-4">Yes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">RMDs</td>
                    <td className="py-2 px-4">Yes, at 73</td>
                    <td className="py-2 px-4">No*</td>
                    <td className="py-2 px-4">Yes, at 73</td>
                    <td className="py-2 px-4">None</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-2">
                * Traditional IRA deduction may be limited if covered by employer plan. Roth 401k RMDs eliminated starting 2024.
              </p>
            </div>

            <h2>How to Start Retirement Investing</h2>

            <div className="not-prose space-y-4 my-8">
              {howToSteps.map((step, index) => (
                <div key={index} className="bg-card border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm mr-2">
                      {index + 1}
                    </span>
                    {step.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{step.text}</p>
                </div>
              ))}
            </div>

            <h2>Investment Strategy by Age</h2>

            <h3>20s: Aggressive Growth</h3>
            <ul>
              <li>Allocation: 90% stocks, 10% bonds</li>
              <li>Focus on maximizing contributions and time in market</li>
              <li>Don&apos;t worry about market volatility - you have decades to recover</li>
              <li>Consider 100% in a target-date fund for simplicity</li>
            </ul>

            <h3>30s-40s: Balanced Growth</h3>
            <ul>
              <li>Allocation: 70-80% stocks, 20-30% bonds</li>
              <li>Increase contributions as income grows</li>
              <li>Consider adding international stocks for diversification</li>
              <li>Max out 401k and IRA if possible</li>
            </ul>

            <h3>50s: Preservation Focus</h3>
            <ul>
              <li>Allocation: 50-60% stocks, 40-50% bonds</li>
              <li>Take advantage of catch-up contributions</li>
              <li>Begin planning for healthcare costs</li>
              <li>Consider Roth conversions in lower-income years</li>
            </ul>

            <h3>60s: Income Transition</h3>
            <ul>
              <li>Allocation: 40-50% stocks, 50-60% bonds</li>
              <li>Create a withdrawal strategy before retiring</li>
              <li>Delay Social Security if possible for higher benefits</li>
              <li>Maintain some stock exposure for longevity protection</li>
            </ul>

            <h2>Common Retirement Investing Mistakes</h2>
            <ol>
              <li><strong>Not starting early enough:</strong> Every decade you delay costs significant wealth. Start now.</li>
              <li><strong>Missing employer match:</strong> This is literally free money - never leave it on the table.</li>
              <li><strong>Cashing out when changing jobs:</strong> Roll your 401k to an IRA or new employer&apos;s plan.</li>
              <li><strong>Taking early withdrawals:</strong> The 10% penalty plus taxes devastate your savings.</li>
              <li><strong>Being too conservative young:</strong> Low returns early won&apos;t compound enough over time.</li>
              <li><strong>Being too aggressive near retirement:</strong> A market crash right before retirement is devastating.</li>
              <li><strong>Ignoring fees:</strong> High expense ratios (1%+) reduce your retirement wealth by hundreds of thousands.</li>
            </ol>

            <h2>The Power of Starting Early</h2>
            <p>
              Compound growth makes early investing incredibly powerful. Here&apos;s how $500/month grows at 7% return:
            </p>

            <div className="not-prose overflow-x-auto my-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Start Age</th>
                    <th className="text-right py-2 px-4">Years Investing</th>
                    <th className="text-right py-2 px-4">Total Contributed</th>
                    <th className="text-right py-2 px-4">Value at 65</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">25</td>
                    <td className="text-right py-2 px-4">40 years</td>
                    <td className="text-right py-2 px-4">$240,000</td>
                    <td className="text-right py-2 px-4 text-green-600 font-bold">$1,320,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">35</td>
                    <td className="text-right py-2 px-4">30 years</td>
                    <td className="text-right py-2 px-4">$180,000</td>
                    <td className="text-right py-2 px-4 text-green-600">$610,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">45</td>
                    <td className="text-right py-2 px-4">20 years</td>
                    <td className="text-right py-2 px-4">$120,000</td>
                    <td className="text-right py-2 px-4">$260,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Starting 10 years earlier more than doubles your retirement wealth, even with the same monthly contribution.
            </p>
          </article>

          {/* FAQ Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/calculators/compound-interest" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Compound Interest Calculator</h3>
                <p className="text-sm text-muted-foreground">See how your retirement savings can grow</p>
              </Link>
              <Link href="/calculators/dividend-yield" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Dividend Yield Calculator</h3>
                <p className="text-sm text-muted-foreground">Plan your retirement income</p>
              </Link>
              <Link href="/learn/etf-investing" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">ETF Investing Guide</h3>
                <p className="text-sm text-muted-foreground">Low-cost investing for retirement</p>
              </Link>
              <Link href="/learn/dividend-investing" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Dividend Investing Guide</h3>
                <p className="text-sm text-muted-foreground">Build passive income for retirement</p>
              </Link>
              <Link href="/insights/sp500-historical-returns" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">S&P 500 Returns</h3>
                <p className="text-sm text-muted-foreground">Historical stock market performance</p>
              </Link>
              <Link href="/etfs" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Browse ETFs</h3>
                <p className="text-sm text-muted-foreground">Find low-cost index funds for retirement</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
