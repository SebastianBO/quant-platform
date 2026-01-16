import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema } from '@/lib/seo'

const SITE_URL = 'https://lician.com'

export const metadata: Metadata = {
  title: 'What is a Dividend? A Beginner\'s Guide to Dividend Payments | Lician',
  description: 'Learn what dividends are, how they work, and why companies pay them. Understand dividend yield, ex-dividend dates, payout ratios, and how to earn passive income from stocks.',
  keywords: [
    'what is a dividend',
    'dividend meaning',
    'how do dividends work',
    'dividend yield explained',
    'ex-dividend date',
    'dividend payout ratio',
    'dividend stocks for beginners',
    'how to get dividends',
    'quarterly dividends',
    'passive income stocks'
  ],
  openGraph: {
    title: 'What is a Dividend? A Beginner\'s Guide',
    description: 'Learn what dividends are, how they work, and why companies pay shareholders.',
    url: `${SITE_URL}/learn/what-is-a-dividend`,
    type: 'article',
  },
  alternates: {
    canonical: `${SITE_URL}/learn/what-is-a-dividend`,
  },
}

const faqItems = [
  {
    question: 'What is a dividend in simple terms?',
    answer: 'A dividend is a cash payment a company gives to shareholders, typically from its profits. Think of it as getting paid for owning a piece of the company. If you own 100 shares and the company pays $1 per share, you\'d receive $100.'
  },
  {
    question: 'How often are dividends paid?',
    answer: 'Most US companies pay dividends quarterly (four times a year). Some pay monthly (common for REITs), semi-annually, or annually. You\'ll receive payment about 2-4 weeks after the payment date. Check the company\'s dividend schedule for exact dates.'
  },
  {
    question: 'Do all stocks pay dividends?',
    answer: 'No. Many growth companies (like tech startups) reinvest all profits back into the business instead of paying dividends. Mature, profitable companies are more likely to pay dividends. Only about 40% of S&P 500 companies pay meaningful dividends.'
  },
  {
    question: 'What is dividend yield?',
    answer: 'Dividend yield is the annual dividend payment divided by the stock price, expressed as a percentage. For example, if a stock costs $100 and pays $4 annually in dividends, the yield is 4%. Higher yields mean more income per dollar invested, but very high yields can signal risk.'
  },
  {
    question: 'What is the ex-dividend date?',
    answer: 'The ex-dividend date is the cutoff for dividend eligibility. You must own the stock BEFORE this date to receive the dividend. If you buy on or after the ex-dividend date, the previous owner gets that dividend. Stock prices typically drop by the dividend amount on this date.'
  },
  {
    question: 'Are dividends taxed?',
    answer: 'Yes. Qualified dividends (from US companies held 60+ days) are taxed at favorable rates (0%, 15%, or 20% depending on income). Non-qualified dividends are taxed as ordinary income. Dividends in retirement accounts like IRAs grow tax-deferred or tax-free.'
  },
  {
    question: 'Can dividends be cut or eliminated?',
    answer: 'Yes. Companies can reduce or suspend dividends at any time, especially during financial trouble. This happened to many companies during the 2020 pandemic. Check the payout ratio (dividends / earnings) - ratios above 80% may indicate an unsustainable dividend.'
  },
  {
    question: 'What are Dividend Aristocrats?',
    answer: 'Dividend Aristocrats are S&P 500 companies that have increased their dividend every year for 25+ consecutive years. Examples include Coca-Cola, Johnson & Johnson, and Procter & Gamble. They\'re known for dividend reliability but may have lower yields than riskier stocks.'
  }
]

export default function WhatIsADividendPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'What is a Dividend?', url: `${SITE_URL}/learn/what-is-a-dividend` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'What is a Dividend? A Beginner\'s Guide to Dividend Payments',
    description: 'Learn what dividends are, how they work, and why companies pay shareholders.',
    url: `${SITE_URL}/learn/what-is-a-dividend`,
    datePublished: '2026-01-16',
    dateModified: '2026-01-16',
  })

  const faqSchema = getFAQSchema(faqItems)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li><Link href="/learn" className="hover:text-foreground">Learn</Link></li>
            <li>/</li>
            <li className="text-foreground">What is a Dividend?</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            What is a Dividend? A Beginner&apos;s Guide
          </h1>
          <p className="text-xl text-muted-foreground">
            Understand how companies share profits with shareholders and how you can
            build passive income through dividend-paying stocks.
          </p>
        </header>

        {/* Quick Answer Box */}
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6 mb-10">
          <h2 className="text-lg font-semibold mb-2">Quick Answer</h2>
          <p className="text-muted-foreground">
            <strong>A dividend is a cash payment a company makes to its shareholders.</strong> When
            a profitable company decides to share some of its earnings, it pays dividends - typically
            quarterly - to everyone who owns the stock. Dividends create &quot;passive income&quot; because
            you earn money just by holding the stock, without selling it.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-muted/50 rounded-lg p-6 mb-10">
          <h2 className="font-semibold mb-3">In This Guide</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#how-dividends-work" className="text-primary hover:underline">How Dividends Work</a></li>
            <li><a href="#key-terms" className="text-primary hover:underline">Key Dividend Terms</a></li>
            <li><a href="#why-companies-pay" className="text-primary hover:underline">Why Companies Pay Dividends</a></li>
            <li><a href="#important-dates" className="text-primary hover:underline">Important Dividend Dates</a></li>
            <li><a href="#dividend-yield" className="text-primary hover:underline">Understanding Dividend Yield</a></li>
            <li><a href="#reinvesting" className="text-primary hover:underline">Dividend Reinvestment (DRIP)</a></li>
            <li><a href="#taxes" className="text-primary hover:underline">How Dividends Are Taxed</a></li>
            <li><a href="#faqs" className="text-primary hover:underline">Frequently Asked Questions</a></li>
          </ul>
        </div>

        {/* How Dividends Work */}
        <section id="how-dividends-work" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How Dividends Work</h2>

          <p className="mb-4">
            Dividends are straightforward: companies share profits with shareholders in the form
            of cash payments. Here&apos;s the basic process:
          </p>

          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">The Dividend Payment Process</h3>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Company Earns Profits:</strong> The company generates revenue and earns net income after expenses.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>Board Declares Dividend:</strong> The board of directors votes to pay a dividend and announces the amount per share.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>Ex-Dividend Date:</strong> A cutoff date is set. You must own shares before this date to receive the dividend.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <strong>Payment Date:</strong> Cash is deposited directly into your brokerage account, typically 2-4 weeks later.
                </div>
              </li>
            </ol>
          </div>

          <h3 className="text-xl font-semibold mb-3">A Simple Example</h3>
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
            <p className="mb-3">
              <strong>You own:</strong> 100 shares of Coca-Cola (KO)
            </p>
            <p className="mb-3">
              <strong>Quarterly dividend:</strong> $0.485 per share
            </p>
            <p className="mb-3">
              <strong>Your payment:</strong> 100 shares &times; $0.485 = $48.50 per quarter
            </p>
            <p className="font-semibold">
              <strong>Annual income:</strong> $48.50 &times; 4 quarters = $194 per year
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              This $194 arrives in your account automatically - no action required on your part.
            </p>
          </div>
        </section>

        {/* Key Terms */}
        <section id="key-terms" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Key Dividend Terms</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Term</th>
                  <th className="text-left py-3 px-4 font-semibold">Definition</th>
                  <th className="text-left py-3 px-4 font-semibold">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Dividend</td>
                  <td className="py-3 px-4">Cash payment to shareholders from company profits</td>
                  <td className="py-3 px-4">$1.00 per share</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Dividend Yield</td>
                  <td className="py-3 px-4">Annual dividend divided by stock price (%)</td>
                  <td className="py-3 px-4">$4 dividend / $100 price = 4%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Payout Ratio</td>
                  <td className="py-3 px-4">Percentage of earnings paid as dividends</td>
                  <td className="py-3 px-4">$2 dividend / $4 EPS = 50%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Declaration Date</td>
                  <td className="py-3 px-4">When board announces the dividend</td>
                  <td className="py-3 px-4">March 1, 2026</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Ex-Dividend Date</td>
                  <td className="py-3 px-4">Cutoff date for dividend eligibility</td>
                  <td className="py-3 px-4">March 15, 2026</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Record Date</td>
                  <td className="py-3 px-4">Date company checks who owns shares</td>
                  <td className="py-3 px-4">March 17, 2026</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Payment Date</td>
                  <td className="py-3 px-4">When cash is deposited in your account</td>
                  <td className="py-3 px-4">April 1, 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Why Companies Pay Dividends */}
        <section id="why-companies-pay" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Why Companies Pay Dividends</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">1. Return Excess Cash</h3>
              <p className="text-sm text-muted-foreground">
                Mature companies often generate more cash than they need for growth.
                Instead of letting it sit idle, they return it to shareholders.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">2. Attract Investors</h3>
              <p className="text-sm text-muted-foreground">
                Many investors seek dividend stocks for income, especially retirees.
                Paying dividends attracts this investor base and supports demand.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">3. Signal Financial Health</h3>
              <p className="text-sm text-muted-foreground">
                Consistent dividends signal that management believes profits will
                continue. It takes confidence to commit to ongoing cash payments.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">4. Reduce Agency Problems</h3>
              <p className="text-sm text-muted-foreground">
                When cash is paid out, management can&apos;t waste it on empire-building
                or poor acquisitions. Dividends enforce discipline.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Why Some Companies Don&apos;t Pay Dividends</h4>
            <p className="text-sm">
              Growth companies (Amazon, Tesla, Netflix early on) typically reinvest all profits
              back into expansion. They believe $1 reinvested will generate more than $1 in future
              value. Many tech startups go decades without dividends. This isn&apos;t bad - it just
              means they have profitable uses for that cash.
            </p>
          </div>
        </section>

        {/* Important Dates */}
        <section id="important-dates" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Important Dividend Dates</h2>

          <div className="bg-muted/30 rounded-lg p-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded text-sm font-medium whitespace-nowrap">
                  Declaration Date
                </div>
                <div>
                  <p className="text-sm">
                    The board announces the dividend amount and payment schedule. At this point,
                    the company is legally obligated to pay.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm font-medium whitespace-nowrap">
                  Ex-Dividend Date
                </div>
                <div>
                  <p className="text-sm mb-2">
                    <strong>The most important date for investors.</strong> You must own the stock
                    BEFORE this date to receive the dividend. If you buy on or after this date,
                    you won&apos;t get the dividend.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Stock prices typically drop by approximately the dividend amount on this date.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm font-medium whitespace-nowrap">
                  Record Date
                </div>
                <div>
                  <p className="text-sm">
                    The company checks its records to see who officially owns shares. Usually
                    1-2 business days after the ex-dividend date (due to T+1 settlement).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 px-3 py-1 rounded text-sm font-medium whitespace-nowrap">
                  Payment Date
                </div>
                <div>
                  <p className="text-sm">
                    Cash lands in your brokerage account. Typically 2-4 weeks after the record date.
                    No action required - it&apos;s automatic.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Example Timeline</h4>
            <ul className="text-sm space-y-1">
              <li><strong>March 1:</strong> Declaration - &quot;We will pay $0.50 per share&quot;</li>
              <li><strong>March 14:</strong> Ex-Dividend - Last day to buy is March 13</li>
              <li><strong>March 15:</strong> Record Date - Company checks ownership</li>
              <li><strong>April 1:</strong> Payment Date - Cash deposited in your account</li>
            </ul>
          </div>
        </section>

        {/* Dividend Yield */}
        <section id="dividend-yield" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Understanding Dividend Yield</h2>

          <p className="mb-4">
            Dividend yield tells you how much income you earn relative to the stock price.
            It&apos;s the most common way to compare dividend stocks.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-2">The Formula</h3>
            <p className="font-mono text-lg mb-4">
              Dividend Yield = (Annual Dividend Per Share / Stock Price) &times; 100
            </p>
            <div className="text-sm space-y-2">
              <p><strong>Example 1:</strong> $2 annual dividend / $50 stock = 4% yield</p>
              <p><strong>Example 2:</strong> $5 annual dividend / $100 stock = 5% yield</p>
              <p><strong>Example 3:</strong> $1 annual dividend / $200 stock = 0.5% yield</p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3">Yield Ranges by Type</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Yield Range</th>
                  <th className="text-left py-3 px-4 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 font-semibold">Examples</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">0% - 1%</td>
                  <td className="py-3 px-4">Low/Growth</td>
                  <td className="py-3 px-4">Apple, Meta, many tech stocks</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">1% - 3%</td>
                  <td className="py-3 px-4">Average</td>
                  <td className="py-3 px-4">Microsoft, S&amp;P 500 average</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">3% - 5%</td>
                  <td className="py-3 px-4">Above Average</td>
                  <td className="py-3 px-4">Utilities, consumer staples</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">5% - 8%</td>
                  <td className="py-3 px-4">High Yield</td>
                  <td className="py-3 px-4">REITs, MLPs, telecoms</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">8%+</td>
                  <td className="py-3 px-4 text-red-600">Caution</td>
                  <td className="py-3 px-4">May signal dividend at risk</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Yield Trap Warning</h4>
            <p className="text-sm">
              Very high yields (8%+) often indicate a &quot;yield trap&quot; - the stock price has fallen
              because the market expects a dividend cut. If a $100 stock paying $4 drops to $50
              (maybe due to earnings problems), the yield jumps to 8%, but the dividend may be cut.
              Always check the payout ratio and company health, not just yield.
            </p>
          </div>
        </section>

        {/* DRIP */}
        <section id="reinvesting" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Dividend Reinvestment (DRIP)</h2>

          <p className="mb-4">
            A DRIP automatically uses your dividend payments to buy more shares of the same stock.
            Most brokerages offer this free feature.
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-green-600">DRIP Benefits</h3>
              <ul className="text-sm space-y-2">
                <li>Automatic compounding without effort</li>
                <li>No trading commissions</li>
                <li>Buy fractional shares (even 0.01 shares)</li>
                <li>Dollar-cost averaging into positions</li>
                <li>Accelerates wealth building over time</li>
              </ul>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-red-600">When to Skip DRIP</h3>
              <ul className="text-sm space-y-2">
                <li>You need the income for living expenses</li>
                <li>You want to rebalance to other investments</li>
                <li>Stock is overvalued (might reinvest elsewhere)</li>
                <li>Company fundamentals are deteriorating</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6">
            <h3 className="font-semibold mb-3">The Power of DRIP: Example</h3>
            <p className="text-sm mb-4">
              <strong>Starting:</strong> 100 shares at $100 each = $10,000 invested<br />
              <strong>Dividend yield:</strong> 3% ($300/year)<br />
              <strong>Dividend growth:</strong> 7% annually
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Year</th>
                    <th className="text-left py-2 px-3">Without DRIP</th>
                    <th className="text-left py-2 px-3">With DRIP</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">Year 1</td>
                    <td className="py-2 px-3">100 shares</td>
                    <td className="py-2 px-3">103 shares</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Year 10</td>
                    <td className="py-2 px-3">100 shares</td>
                    <td className="py-2 px-3">~145 shares</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Year 20</td>
                    <td className="py-2 px-3">100 shares</td>
                    <td className="py-2 px-3">~210 shares</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              With DRIP, you own 110% more shares after 20 years - and those extra shares pay
              dividends too, creating exponential growth.
            </p>
          </div>
        </section>

        {/* Taxes */}
        <section id="taxes" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How Dividends Are Taxed</h2>

          <p className="mb-4">
            Dividend tax treatment depends on the type of dividend and your income level.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Requirements</th>
                  <th className="text-left py-3 px-4 font-semibold">Tax Rate (2026)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Qualified Dividends</td>
                  <td className="py-3 px-4">US company, held 60+ days</td>
                  <td className="py-3 px-4">0%, 15%, or 20% (based on income)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Non-Qualified (Ordinary)</td>
                  <td className="py-3 px-4">REITs, short-term holdings, some foreign</td>
                  <td className="py-3 px-4">Your ordinary income rate (10-37%)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/50 rounded-lg p-5">
            <h3 className="font-semibold mb-3">Tax-Advantaged Accounts</h3>
            <p className="text-sm mb-3">
              Hold dividend stocks in tax-advantaged accounts to avoid annual taxes:
            </p>
            <ul className="text-sm space-y-2">
              <li><strong>Traditional IRA/401(k):</strong> No tax on dividends until withdrawal (tax-deferred)</li>
              <li><strong>Roth IRA/Roth 401(k):</strong> No tax on dividends ever (tax-free growth)</li>
              <li><strong>HSA:</strong> No tax if used for medical expenses</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              Note: High-yield dividend stocks often make more sense in tax-advantaged accounts
              to maximize compounding.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section id="faqs" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div key={index} className="border rounded-lg p-5">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Resources */}
        <section className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/learn/dividend-investing"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Dividend Investing Guide</h3>
              <p className="text-sm text-muted-foreground">Advanced strategies for building dividend income</p>
            </Link>
            <Link
              href="/calculators/dividend-yield"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Dividend Yield Calculator</h3>
              <p className="text-sm text-muted-foreground">Calculate dividend income from your investments</p>
            </Link>
            <Link
              href="/learn/what-is-a-stock"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">What is a Stock?</h3>
              <p className="text-sm text-muted-foreground">Learn stock basics before diving into dividends</p>
            </Link>
            <Link
              href="/learn/retirement-investing"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Retirement Investing</h3>
              <p className="text-sm text-muted-foreground">Using dividends for retirement income</p>
            </Link>
            <Link
              href="/calculators/compound-interest"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Compound Interest Calculator</h3>
              <p className="text-sm text-muted-foreground">See how reinvested dividends compound</p>
            </Link>
            <Link
              href="/screener"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Stock Screener</h3>
              <p className="text-sm text-muted-foreground">Find high-dividend stocks</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
