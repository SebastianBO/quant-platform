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
  title: 'ETF Investing Guide: How to Invest in ETFs for Beginners (2026)',
  description: 'Learn ETF investing basics, how to choose ETFs, types of ETFs, ETF vs mutual funds, and best ETFs for beginners. Complete guide to building a diversified portfolio with exchange-traded funds.',
  keywords: [
    'etf investing',
    'how to invest in etfs',
    'best etfs for beginners',
    'etf vs mutual fund',
    'index fund investing',
    'passive investing',
    'what is an etf',
    'etf guide',
  ],
  openGraph: {
    title: 'ETF Investing Guide - How to Invest in ETFs for Beginners',
    description: 'Master ETF investing with our complete guide. Learn how to choose ETFs, build a portfolio, and compare ETFs vs mutual funds.',
    type: 'article',
    url: `${SITE_URL}/learn/etf-investing`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/etf-investing`,
  },
}

const howToSteps = [
  {
    name: 'Understand What ETFs Are',
    text: 'ETFs (Exchange-Traded Funds) are investment funds that trade on stock exchanges like regular stocks. They hold a basket of securities (stocks, bonds, commodities) and track an index or sector. Unlike mutual funds, ETFs trade throughout the day at market prices.',
  },
  {
    name: 'Learn the Different Types of ETFs',
    text: 'Broad market ETFs (SPY, VTI) track entire markets. Sector ETFs focus on industries like technology (XLK) or healthcare (XLV). Bond ETFs (BND, AGG) provide fixed income. International ETFs cover non-US markets. Thematic ETFs target trends like AI or clean energy.',
  },
  {
    name: 'Compare Expense Ratios',
    text: 'Expense ratio is the annual fee charged by the ETF, expressed as a percentage. Lower is better. Index ETFs charge 0.03-0.20%, while active or thematic ETFs charge 0.50-0.75%. A 0.03% vs 0.50% difference saves $470 per $10,000 invested over 10 years.',
  },
  {
    name: 'Check Liquidity and Tracking Error',
    text: 'Choose ETFs with high trading volume (millions of shares daily) for tight bid-ask spreads. Tracking error measures how closely the ETF follows its index - lower is better. Larger, established ETFs typically have better liquidity and tracking.',
  },
  {
    name: 'Open a Brokerage Account',
    text: 'Most major brokers (Fidelity, Schwab, Vanguard, Robinhood) offer commission-free ETF trading. Compare platforms for research tools, fractional shares, and account minimums. You can start with as little as $1 using fractional shares.',
  },
  {
    name: 'Build Your ETF Portfolio',
    text: 'Start with a simple 2-3 ETF portfolio: US total market (VTI), international (VXUS), and bonds (BND). Adjust allocation based on age and risk tolerance. Younger investors can hold 90% stocks, while those near retirement may prefer 60% stocks, 40% bonds.',
  },
]

const faqs = [
  {
    question: 'What is an ETF?',
    answer: 'An ETF (Exchange-Traded Fund) is an investment fund that trades on stock exchanges, just like individual stocks. ETFs hold a collection of securities - stocks, bonds, commodities, or other assets - and typically track an index like the S&P 500. You can buy and sell ETF shares throughout the trading day at market prices, unlike mutual funds which only trade once daily after market close.',
  },
  {
    question: 'What is the difference between ETFs and mutual funds?',
    answer: 'Key differences: 1) Trading - ETFs trade throughout the day like stocks; mutual funds only trade at end-of-day NAV. 2) Minimum investment - ETFs have no minimum (one share or fractional); mutual funds often require $1,000-3,000. 3) Fees - ETFs typically have lower expense ratios. 4) Tax efficiency - ETFs are generally more tax-efficient due to their structure. 5) Flexibility - ETFs can be limit ordered, shorted, or bought on margin.',
  },
  {
    question: 'What are the best ETFs for beginners?',
    answer: 'For beginners, consider low-cost, broadly diversified ETFs: VTI or VOO (US stocks), VXUS (international stocks), BND (US bonds). These provide instant diversification at rock-bottom costs (0.03-0.07% expense ratio). A simple "three-fund portfolio" of US stocks, international stocks, and bonds covers all major asset classes. Avoid complex, leveraged, or inverse ETFs until you have more experience.',
  },
  {
    question: 'How much money do I need to start investing in ETFs?',
    answer: 'You can start with any amount, thanks to fractional shares offered by most brokers. With $50-100, you can buy fractional shares of diversified ETFs like VTI (total US market). Some brokers require no minimum at all. The key is starting early and investing consistently, even small amounts. Regular contributions matter more than initial investment size.',
  },
  {
    question: 'Are ETFs good for long-term investing?',
    answer: 'Yes, ETFs are excellent for long-term investing. Index ETFs like VOO (S&P 500) provide broad market exposure at minimal cost. Historically, the S&P 500 has returned about 10% annually over long periods. ETFs are tax-efficient, making them ideal for taxable accounts. For retirement accounts (401k, IRA), low-cost index ETFs are often the best choice.',
  },
  {
    question: 'What are expense ratios and why do they matter?',
    answer: 'Expense ratio is the annual fee an ETF charges, expressed as a percentage of your investment. If you invest $10,000 in an ETF with a 0.03% expense ratio, you pay $3/year. With 0.50%, you pay $50/year. Over 30 years, this difference compounds significantly. A 0.50% higher expense ratio can reduce your final portfolio by 10-15%. Always compare expense ratios when choosing similar ETFs.',
  },
]

export default function ETFInvestingPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'ETF Investing', url: `${SITE_URL}/learn/etf-investing` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'ETF Investing Guide: How to Invest in ETFs for Beginners',
    datePublished: '2026-01-16',
    dateModified: '2026-01-16',
    description: 'Complete guide to ETF investing. Learn what ETFs are, how to choose them, and build a diversified portfolio.',
    url: `${SITE_URL}/learn/etf-investing`,
  })

  const faqSchema = getFAQSchema(faqs)

  const howToSchema = getHowToSchema({
    name: 'How to Start Investing in ETFs',
    description: 'Step-by-step guide to begin your ETF investing journey',
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
              <li className="text-foreground">ETF Investing</li>
            </ol>
          </nav>

          <article className="prose dark:prose-invert max-w-none">
            <h1>ETF Investing Guide: How to Invest in ETFs for Beginners</h1>

            <p className="lead text-xl text-muted-foreground">
              Exchange-Traded Funds (ETFs) have revolutionized investing by making it easy and affordable for anyone
              to build a diversified portfolio. This guide covers everything you need to know to start investing in ETFs.
            </p>

            <div className="not-prose bg-card border rounded-lg p-6 my-8">
              <h2 className="text-lg font-semibold mb-4">Key Takeaways</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>ETFs trade like stocks but provide instant diversification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Start with broad market ETFs like VTI or VOO for core holdings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Low expense ratios (under 0.20%) save thousands over time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>You can start investing with any amount using fractional shares</span>
                </li>
              </ul>
            </div>

            <h2>What is an ETF?</h2>
            <p>
              An ETF (Exchange-Traded Fund) is an investment fund that trades on stock exchanges throughout the day,
              just like individual stocks. Unlike buying a single company&apos;s stock, when you buy an ETF share,
              you&apos;re buying a small piece of many companies at once.
            </p>
            <p>
              For example, the popular SPY ETF tracks the S&P 500 index. When you buy one share of SPY (around $500),
              you effectively own a tiny fraction of 500 of America&apos;s largest companies including Apple, Microsoft,
              Amazon, and Google.
            </p>

            <h2>Why Invest in ETFs?</h2>

            <h3>1. Instant Diversification</h3>
            <p>
              With a single purchase, you can own hundreds or thousands of securities. A total market ETF like VTI
              gives you exposure to over 4,000 US stocks. This diversification reduces risk - if one company fails,
              it barely affects your portfolio.
            </p>

            <h3>2. Low Costs</h3>
            <p>
              Index ETFs charge incredibly low fees. Vanguard&apos;s VOO charges just 0.03% annually - that&apos;s
              $3 per year on a $10,000 investment. Compare this to actively managed mutual funds that often
              charge 1-2%, and you save hundreds to thousands of dollars over time.
            </p>

            <h3>3. Flexibility</h3>
            <p>
              ETFs trade throughout the day, so you can buy or sell at any time during market hours. You can use
              limit orders, set stop losses, and even buy fractional shares at most brokers.
            </p>

            <h3>4. Tax Efficiency</h3>
            <p>
              ETFs are generally more tax-efficient than mutual funds due to their unique creation/redemption
              mechanism. This means fewer capital gains distributions, keeping more money in your pocket.
            </p>

            <h2>Types of ETFs</h2>

            <div className="not-prose overflow-x-auto my-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Description</th>
                    <th className="text-left py-2 px-4">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Broad Market</td>
                    <td className="py-2 px-4">Track entire stock markets</td>
                    <td className="py-2 px-4">VTI, SPY, VOO, IVV</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">International</td>
                    <td className="py-2 px-4">Non-US developed and emerging markets</td>
                    <td className="py-2 px-4">VXUS, VEA, VWO, EEM</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Sector</td>
                    <td className="py-2 px-4">Focus on specific industries</td>
                    <td className="py-2 px-4">XLK (Tech), XLV (Healthcare), XLF (Financials)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Bond</td>
                    <td className="py-2 px-4">Fixed income exposure</td>
                    <td className="py-2 px-4">BND, AGG, TLT, VCIT</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Dividend</td>
                    <td className="py-2 px-4">High dividend-paying stocks</td>
                    <td className="py-2 px-4">VYM, SCHD, DVY, HDV</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Thematic</td>
                    <td className="py-2 px-4">Specific trends or themes</td>
                    <td className="py-2 px-4">ARKK (Innovation), ICLN (Clean Energy)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>How to Start Investing in ETFs</h2>

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

            <h2>ETF vs Mutual Fund Comparison</h2>

            <div className="not-prose overflow-x-auto my-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Feature</th>
                    <th className="text-left py-2 px-4">ETFs</th>
                    <th className="text-left py-2 px-4">Mutual Funds</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Trading</td>
                    <td className="py-2 px-4 text-green-600">Throughout the day</td>
                    <td className="py-2 px-4">End of day only</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Minimum Investment</td>
                    <td className="py-2 px-4 text-green-600">$1 (fractional shares)</td>
                    <td className="py-2 px-4">Often $1,000-3,000</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Expense Ratio</td>
                    <td className="py-2 px-4 text-green-600">0.03% - 0.75%</td>
                    <td className="py-2 px-4">0.50% - 2.00%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Tax Efficiency</td>
                    <td className="py-2 px-4 text-green-600">More efficient</td>
                    <td className="py-2 px-4">Less efficient</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">Price Transparency</td>
                    <td className="py-2 px-4 text-green-600">Real-time</td>
                    <td className="py-2 px-4">End of day NAV</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Best ETFs for Beginners</h2>
            <p>
              If you&apos;re just starting out, consider building a simple portfolio with these core ETFs:
            </p>

            <h3>US Stock Market</h3>
            <ul>
              <li><strong>VTI</strong> - Vanguard Total Stock Market ETF (0.03% expense ratio)</li>
              <li><strong>VOO</strong> - Vanguard S&P 500 ETF (0.03% expense ratio)</li>
              <li><strong>SPY</strong> - SPDR S&P 500 ETF (0.09% expense ratio, highest liquidity)</li>
            </ul>

            <h3>International Stocks</h3>
            <ul>
              <li><strong>VXUS</strong> - Vanguard Total International Stock ETF (0.07%)</li>
              <li><strong>VEA</strong> - Vanguard Developed Markets ETF (0.05%)</li>
            </ul>

            <h3>Bonds</h3>
            <ul>
              <li><strong>BND</strong> - Vanguard Total Bond Market ETF (0.03%)</li>
              <li><strong>AGG</strong> - iShares Core US Aggregate Bond ETF (0.03%)</li>
            </ul>

            <h2>Sample ETF Portfolios</h2>

            <h3>Simple Two-Fund Portfolio</h3>
            <ul>
              <li>80% VTI (US stocks)</li>
              <li>20% VXUS (International stocks)</li>
            </ul>

            <h3>Classic Three-Fund Portfolio</h3>
            <ul>
              <li>60% VTI (US stocks)</li>
              <li>20% VXUS (International stocks)</li>
              <li>20% BND (US bonds)</li>
            </ul>

            <h3>Conservative Retirement Portfolio</h3>
            <ul>
              <li>40% VTI (US stocks)</li>
              <li>20% VXUS (International stocks)</li>
              <li>40% BND (US bonds)</li>
            </ul>

            <h2>Common ETF Investing Mistakes to Avoid</h2>
            <ol>
              <li><strong>Chasing past performance</strong> - Last year&apos;s hot sector often underperforms next year</li>
              <li><strong>Over-trading</strong> - Frequent buying and selling erodes returns</li>
              <li><strong>Ignoring expense ratios</strong> - Small differences compound significantly over time</li>
              <li><strong>Lack of diversification</strong> - Don&apos;t put everything in one sector or theme</li>
              <li><strong>Market timing</strong> - Time in the market beats timing the market</li>
            </ol>
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
              <Link href="/etfs" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Browse ETFs</h3>
                <p className="text-sm text-muted-foreground">Explore ETFs by category and compare options</p>
              </Link>
              <Link href="/calculators/compound-interest" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Investment Calculator</h3>
                <p className="text-sm text-muted-foreground">Calculate your potential investment growth</p>
              </Link>
              <Link href="/learn/how-to-invest" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">How to Invest</h3>
                <p className="text-sm text-muted-foreground">Complete beginner&apos;s guide to investing</p>
              </Link>
              <Link href="/learn/dividend-investing" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Dividend Investing</h3>
                <p className="text-sm text-muted-foreground">Build passive income with dividend ETFs</p>
              </Link>
              <Link href="/insights/sp500-historical-returns" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">S&P 500 Returns</h3>
                <p className="text-sm text-muted-foreground">Historical stock market performance data</p>
              </Link>
              <Link href="/screener" className="block bg-card border rounded-lg p-4 hover:border-primary transition-colors">
                <h3 className="font-semibold mb-1">Stock Screener</h3>
                <p className="text-sm text-muted-foreground">Find stocks that match your criteria</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
