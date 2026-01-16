import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dollar Cost Averaging (DCA) Explained | Investment Strategy Guide',
  description: 'Learn how dollar cost averaging works: invest fixed amounts at regular intervals to reduce timing risk. DCA vs lump sum investing comparison with examples and calculators.',
  keywords: [
    'dollar cost averaging',
    'DCA investing',
    'dollar cost averaging strategy',
    'DCA vs lump sum',
    'how to invest regularly',
    'investment strategy',
    'average down',
    'systematic investing',
    'recurring investment',
    'automatic investing'
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/dollar-cost-averaging`
  },
  openGraph: {
    title: 'Dollar Cost Averaging (DCA) Explained | Complete Guide',
    description: 'Learn how dollar cost averaging works and when to use it for your investment portfolio.',
    url: `${SITE_URL}/learn/dollar-cost-averaging`,
    type: 'article'
  }
}

const dcaExample = [
  { month: 'January', investment: 500, price: 100, shares: 5.00, totalShares: 5.00 },
  { month: 'February', investment: 500, price: 90, shares: 5.56, totalShares: 10.56 },
  { month: 'March', investment: 500, price: 80, shares: 6.25, totalShares: 16.81 },
  { month: 'April', investment: 500, price: 85, shares: 5.88, totalShares: 22.69 },
  { month: 'May', investment: 500, price: 95, shares: 5.26, totalShares: 27.95 },
  { month: 'June', investment: 500, price: 110, shares: 4.55, totalShares: 32.50 }
]

const faqs = [
  {
    question: 'What is dollar cost averaging?',
    answer: 'Dollar cost averaging (DCA) is an investment strategy where you invest a fixed amount of money at regular intervals (weekly, monthly, etc.) regardless of market conditions. This approach reduces the impact of volatility by spreading purchases over time, potentially lowering your average cost per share compared to investing a lump sum at a market peak.'
  },
  {
    question: 'Is dollar cost averaging better than lump sum investing?',
    answer: 'Historically, lump sum investing beats DCA about two-thirds of the time because markets tend to rise over the long term. However, DCA reduces timing risk and emotional stress, making it psychologically easier to stay invested. DCA is often better for regular income (like monthly paychecks) while lump sum may be better for windfalls.'
  },
  {
    question: 'How often should I invest using DCA?',
    answer: 'Most investors using DCA invest weekly, bi-weekly (with paychecks), or monthly. The frequency matters less than consistency. Monthly investing is most common as it aligns with budgeting and reduces transaction frequency. The key is picking a schedule you can maintain long-term.'
  },
  {
    question: 'Does dollar cost averaging work in a falling market?',
    answer: 'DCA can actually benefit you in falling markets because you buy more shares when prices are low. Your average cost per share decreases as prices drop. However, this only benefits you if the market eventually recovers. DCA works best with diversified investments like index funds that are likely to recover over time.'
  },
  {
    question: 'Should I use DCA for individual stocks or index funds?',
    answer: 'DCA is generally safer with diversified index funds or ETFs because they tend to recover from downturns over time. Using DCA with individual stocks is riskier because a single company might not recover. If you want to DCA into individual stocks, limit them to blue-chip companies with strong fundamentals.'
  },
  {
    question: 'What is the best investment for dollar cost averaging?',
    answer: 'The best investments for DCA are diversified index funds or ETFs like VOO (S&P 500), VTI (Total Stock Market), or VXUS (International). These provide broad market exposure and have historically recovered from all downturns. DCA works best with investments you plan to hold for years or decades.'
  }
]

export default function DollarCostAveragingPage() {
  const totalInvested = dcaExample.reduce((sum, row) => sum + row.investment, 0)
  const finalValue = dcaExample[dcaExample.length - 1].totalShares * dcaExample[dcaExample.length - 1].price
  const avgCostPerShare = totalInvested / dcaExample[dcaExample.length - 1].totalShares

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'Dollar Cost Averaging', url: `${SITE_URL}/learn/dollar-cost-averaging` }
  ])

  const articleSchema = getArticleSchema({
    headline: 'Dollar Cost Averaging (DCA) Explained: Investment Strategy Guide',
    datePublished: '2026-01-01',
    dateModified: '2026-01-16',
    description: 'Complete guide to dollar cost averaging: how DCA works, when to use it, and comparison with lump sum investing.',
    url: `${SITE_URL}/learn/dollar-cost-averaging`
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema])
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/learn" className="hover:text-primary">Learn</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Dollar Cost Averaging</span>
            </nav>
            <h1 className="text-4xl font-bold mb-4">
              Dollar Cost Averaging (DCA) Explained
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Dollar cost averaging is one of the simplest and most effective investment strategies. Learn how investing fixed amounts at regular intervals can help reduce risk and build long-term wealth.
            </p>
          </div>
        </section>

        {/* What is DCA */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">What is Dollar Cost Averaging?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground mb-4">
                  <strong>Dollar cost averaging (DCA)</strong> is an investment strategy where you invest a fixed amount of money at regular intervals, regardless of market conditions. Instead of trying to &quot;time the market,&quot; you buy consistently over time.
                </p>
                <p className="text-muted-foreground mb-4">
                  The key insight is simple: when prices are high, your fixed investment buys fewer shares. When prices are low, the same investment buys more shares. Over time, this can result in a lower average cost per share than a poorly-timed lump sum investment.
                </p>
                <p className="text-muted-foreground">
                  Many investors already practice DCA without realizing it—contributing to a 401(k) with each paycheck is a form of dollar cost averaging.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-4">DCA in 3 Steps</h3>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                    <div>
                      <strong>Choose a fixed amount</strong>
                      <p className="text-sm text-muted-foreground">Decide how much you can invest regularly (e.g., $500/month)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                    <div>
                      <strong>Set a regular schedule</strong>
                      <p className="text-sm text-muted-foreground">Pick a frequency (weekly, bi-weekly, or monthly)</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                    <div>
                      <strong>Invest consistently</strong>
                      <p className="text-sm text-muted-foreground">Stick to the plan regardless of market conditions</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* DCA Example */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Dollar Cost Averaging Example</h2>
            <p className="text-muted-foreground mb-6">
              Let&apos;s say you invest $500 per month into an S&P 500 index fund. Here&apos;s how DCA works during a volatile 6-month period:
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Month</th>
                    <th className="text-right p-4 font-semibold">Investment</th>
                    <th className="text-right p-4 font-semibold">Price/Share</th>
                    <th className="text-right p-4 font-semibold">Shares Bought</th>
                    <th className="text-right p-4 font-semibold">Total Shares</th>
                  </tr>
                </thead>
                <tbody>
                  {dcaExample.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-medium">{row.month}</td>
                      <td className="p-4 text-right">${row.investment}</td>
                      <td className="p-4 text-right">${row.price}</td>
                      <td className="p-4 text-right">{row.shares.toFixed(2)}</td>
                      <td className="p-4 text-right font-medium">{row.totalShares.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border rounded-lg p-6 text-center">
                <p className="text-muted-foreground mb-2">Total Invested</p>
                <p className="text-3xl font-bold">${totalInvested.toLocaleString()}</p>
              </div>
              <div className="bg-card border rounded-lg p-6 text-center">
                <p className="text-muted-foreground mb-2">Average Cost/Share</p>
                <p className="text-3xl font-bold">${avgCostPerShare.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground mt-2">vs. $100 if bought all in January</p>
              </div>
              <div className="bg-card border rounded-lg p-6 text-center">
                <p className="text-muted-foreground mb-2">Portfolio Value (June)</p>
                <p className="text-3xl font-bold text-green-400">${finalValue.toFixed(0)}</p>
                <p className="text-sm text-green-400 mt-2">+{(((finalValue / totalInvested) - 1) * 100).toFixed(1)}% return</p>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-2">Key Insight</h3>
              <p className="text-muted-foreground">
                Notice how you bought more shares when prices were low (March: 6.25 shares at $80) and fewer when prices were high (June: 4.55 shares at $110). Your average cost of ${avgCostPerShare.toFixed(2)} per share is lower than the average price of $93.33 over the period. This is the power of DCA.
              </p>
            </div>
          </div>
        </section>

        {/* DCA vs Lump Sum */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">DCA vs Lump Sum Investing</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Dollar Cost Averaging</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">Reduces timing risk</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">Psychologically easier (removes decision stress)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">Aligns with regular income</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">Can benefit from market dips</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    <span className="text-muted-foreground">Underperforms lump sum ~66% of the time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    <span className="text-muted-foreground">Cash sits uninvested during rising markets</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Lump Sum Investing</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">Money is invested immediately</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">Historically outperforms DCA ~66% of time</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">Maximizes time in market</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-muted-foreground">Simple execution</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    <span className="text-muted-foreground">Risk of buying at market peak</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400">✗</span>
                    <span className="text-muted-foreground">Psychologically difficult (fear of bad timing)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-400 mb-2">The Vanguard Study</h3>
              <p className="text-muted-foreground">
                A Vanguard study found that lump sum investing outperformed DCA approximately 66% of the time across various markets and time periods. This is because markets tend to rise over time, so money invested earlier captures more gains. However, DCA outperformed in the remaining 34% of scenarios—typically when investing before market declines.
              </p>
            </div>
          </div>
        </section>

        {/* When to Use DCA */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">When to Use Dollar Cost Averaging</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="font-semibold text-green-400 mb-4">DCA is Better When...</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• You&apos;re investing from regular income (paychecks)</li>
                  <li>• You&apos;re risk-averse and fear market timing</li>
                  <li>• Markets seem overvalued or uncertain</li>
                  <li>• You&apos;re new to investing and building discipline</li>
                  <li>• You want to remove emotion from investing</li>
                  <li>• You&apos;re investing in volatile assets</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="font-semibold text-blue-400 mb-4">Lump Sum is Better When...</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li>• You receive a windfall (inheritance, bonus)</li>
                  <li>• You have a long time horizon (10+ years)</li>
                  <li>• Markets appear undervalued</li>
                  <li>• You&apos;re comfortable with volatility</li>
                  <li>• You understand historically it outperforms</li>
                  <li>• You&apos;re investing in stable, diversified funds</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">DCA Best Practices</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">1. Automate It</h3>
                <p className="text-sm text-muted-foreground">
                  Set up automatic investments with your broker. Remove the temptation to skip months or try to time entries. Automation is the key to DCA success.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">2. Stay Consistent</h3>
                <p className="text-sm text-muted-foreground">
                  Don&apos;t pause investments during market downturns—that&apos;s exactly when DCA benefits you most. Stick to your schedule regardless of headlines.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">3. Use Diversified Funds</h3>
                <p className="text-sm text-muted-foreground">
                  DCA works best with index funds or ETFs that are likely to recover from downturns. Avoid DCA into individual stocks that might not recover.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">4. Match Your Budget</h3>
                <p className="text-sm text-muted-foreground">
                  Choose an amount you can sustain long-term. It&apos;s better to invest $200/month consistently than $500/month with gaps.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">5. Consider Tax Efficiency</h3>
                <p className="text-sm text-muted-foreground">
                  Use tax-advantaged accounts (401k, IRA) for DCA when possible. This maximizes compounding by sheltering gains from taxes.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-3">6. Increase Over Time</h3>
                <p className="text-sm text-muted-foreground">
                  As your income grows, increase your DCA amount. A 3-5% annual increase can significantly boost long-term results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/calculators/compound-interest" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">Compound Interest Calculator</h3>
                <p className="text-sm text-muted-foreground">See how DCA compounds over time</p>
              </Link>
              <Link href="/learn/etf-investing" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">ETF Investing Guide</h3>
                <p className="text-sm text-muted-foreground">Best ETFs for DCA strategy</p>
              </Link>
              <Link href="/learn/retirement-investing" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">Retirement Investing</h3>
                <p className="text-sm text-muted-foreground">DCA in 401k and IRAs</p>
              </Link>
              <Link href="/etfs" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">ETFs</h3>
                <p className="text-sm text-muted-foreground">Browse ETFs for your portfolio</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
