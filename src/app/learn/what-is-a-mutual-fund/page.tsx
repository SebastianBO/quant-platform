import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema } from '@/lib/seo'

const SITE_URL = 'https://lician.com'

export const metadata: Metadata = {
  title: 'What is a Mutual Fund? A Beginner\'s Guide | Lician',
  description: 'Learn what mutual funds are, how they work, and whether they\'re right for you. Understand index funds vs actively managed funds, fees, and how mutual funds compare to ETFs.',
  keywords: [
    'what is a mutual fund',
    'mutual fund explained',
    'how do mutual funds work',
    'mutual fund vs ETF',
    'index fund',
    'actively managed fund',
    'mutual fund fees',
    'expense ratio',
    'mutual fund investing',
    'VTSAX',
    'FXAIX'
  ],
  openGraph: {
    title: 'What is a Mutual Fund? A Beginner\'s Guide',
    description: 'Learn what mutual funds are, how they work, and when to use them.',
    url: `${SITE_URL}/learn/what-is-a-mutual-fund`,
    type: 'article',
  },
  alternates: {
    canonical: `${SITE_URL}/learn/what-is-a-mutual-fund`,
  },
}

const faqItems = [
  {
    question: 'What is a mutual fund in simple terms?',
    answer: 'A mutual fund pools money from many investors to buy a portfolio of stocks, bonds, or other securities. A professional fund manager makes the investment decisions. When you buy shares of a mutual fund, you own a small piece of all the investments in that fund.'
  },
  {
    question: 'How is a mutual fund different from an ETF?',
    answer: 'The main differences: (1) Mutual funds trade once daily after market close; ETFs trade throughout the day. (2) Mutual funds often have minimums ($1,000-$3,000); ETFs have no minimums. (3) Mutual funds can have sales loads; ETFs rarely do. (4) Both can be index funds or actively managed.'
  },
  {
    question: 'What is an index fund?',
    answer: 'An index fund is a type of mutual fund that tracks a market index like the S&P 500 without trying to beat it. Index funds have very low fees (0.03-0.20%) because they don\'t need expensive research teams. Popular examples include VTSAX, FXAIX, and SWPPX.'
  },
  {
    question: 'What is an actively managed fund?',
    answer: 'An actively managed fund has a portfolio manager who picks investments trying to outperform the market. These funds have higher fees (0.50-2.00%+) to pay for research and management. Research shows most active funds underperform index funds over time after fees.'
  },
  {
    question: 'What fees do mutual funds charge?',
    answer: 'Mutual funds charge an expense ratio (annual fee as % of assets) ranging from 0.03% for index funds to 2%+ for active funds. Some charge sales loads (front-end or back-end commissions of 3-6%). Always check the fee structure before investing - fees significantly impact long-term returns.'
  },
  {
    question: 'What is the minimum to invest in mutual funds?',
    answer: 'Minimums vary by fund: Vanguard index funds typically require $3,000 for investor shares ($0 for ETF versions). Fidelity and Schwab index funds often have $0 minimums. 401(k) plans usually waive minimums. Check the fund prospectus for specific requirements.'
  },
  {
    question: 'Are mutual funds good for beginners?',
    answer: 'Yes, especially low-cost index mutual funds. They provide instant diversification, professional management, and are easy to set up for automatic investing. Many 401(k) plans only offer mutual funds, not ETFs. Index mutual funds are excellent for long-term buy-and-hold investors.'
  },
  {
    question: 'Can you lose money in mutual funds?',
    answer: 'Yes. Mutual funds aren\'t guaranteed - if the underlying investments decline, the fund\'s value drops too. However, diversified funds are less risky than individual stocks because losses in some holdings may be offset by gains in others. Stock funds can lose 30-50% in bear markets.'
  }
]

export default function WhatIsAMutualFundPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'What is a Mutual Fund?', url: `${SITE_URL}/learn/what-is-a-mutual-fund` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'What is a Mutual Fund? A Beginner\'s Guide',
    description: 'Learn what mutual funds are, how they work, and when to use them vs ETFs.',
    url: `${SITE_URL}/learn/what-is-a-mutual-fund`,
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
            <li className="text-foreground">What is a Mutual Fund?</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            What is a Mutual Fund? A Beginner&apos;s Guide
          </h1>
          <p className="text-xl text-muted-foreground">
            Understand how mutual funds work, when they make sense vs ETFs,
            and how to use them to build wealth through diversified investing.
          </p>
        </header>

        {/* Quick Answer Box */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mb-10">
          <h2 className="text-lg font-semibold mb-2">Quick Answer</h2>
          <p className="text-muted-foreground">
            <strong>A mutual fund pools money from many investors to buy a diversified portfolio.</strong> When
            you invest $1,000, it&apos;s combined with money from thousands of other investors to buy
            stocks, bonds, or other securities. You own shares of the fund, which represents your
            portion of all the underlying investments.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-muted/50 rounded-lg p-6 mb-10">
          <h2 className="font-semibold mb-3">In This Guide</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#how-they-work" className="text-primary hover:underline">How Mutual Funds Work</a></li>
            <li><a href="#types" className="text-primary hover:underline">Types of Mutual Funds</a></li>
            <li><a href="#index-vs-active" className="text-primary hover:underline">Index Funds vs. Actively Managed</a></li>
            <li><a href="#fees" className="text-primary hover:underline">Understanding Mutual Fund Fees</a></li>
            <li><a href="#vs-etf" className="text-primary hover:underline">Mutual Fund vs. ETF</a></li>
            <li><a href="#popular-funds" className="text-primary hover:underline">Popular Mutual Funds</a></li>
            <li><a href="#how-to-invest" className="text-primary hover:underline">How to Invest in Mutual Funds</a></li>
            <li><a href="#faqs" className="text-primary hover:underline">Frequently Asked Questions</a></li>
          </ul>
        </div>

        {/* How They Work */}
        <section id="how-they-work" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How Mutual Funds Work</h2>

          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">The Mutual Fund Structure</h3>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Money Pooled:</strong> Thousands of investors contribute money to the fund. Your $5,000 joins millions from others.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>Manager Invests:</strong> A fund manager (or index-tracking system) uses the pool to buy securities - stocks, bonds, or both.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>You Own Shares:</strong> Your investment is converted into fund shares. The share price (NAV) is calculated once daily after market close.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <strong>Returns Distributed:</strong> Dividends and capital gains are distributed to shareholders (or reinvested automatically).
                </div>
              </li>
            </ol>
          </div>

          <h3 className="text-xl font-semibold mb-3">NAV: Net Asset Value</h3>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6">
            <p className="mb-3">
              A mutual fund&apos;s price is called NAV (Net Asset Value), calculated daily:
            </p>
            <p className="font-mono text-center mb-3 p-3 bg-background rounded">
              NAV = (Total Assets - Liabilities) / Shares Outstanding
            </p>
            <p className="text-sm text-muted-foreground">
              Unlike stocks and ETFs, you can&apos;t see a real-time price. When you place an order
              during the day, you get whatever NAV is calculated at 4 PM Eastern.
            </p>
          </div>
        </section>

        {/* Types of Mutual Funds */}
        <section id="types" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Types of Mutual Funds</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-blue-600">Stock Funds (Equity)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Invest primarily in stocks. Can focus on growth, value, size (large/mid/small-cap), or sectors.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> VTSAX, FXAIX, VFIAX
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-green-600">Bond Funds (Fixed Income)</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Invest in government or corporate bonds. Lower risk/return than stock funds.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> VBTLX, FXNAX
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-purple-600">Balanced/Hybrid Funds</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Mix of stocks and bonds in one fund. Often 60/40 or 70/30 allocations.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> VBIAX, FBALX
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-orange-600">Target-Date Funds</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically adjust stock/bond mix as you approach retirement. Set it and forget it.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> VFFVX (2055), FFFFX (2055)
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-red-600">International Funds</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Invest in stocks or bonds outside the US. Can be developed or emerging markets.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> VTIAX, FSPSX
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-yellow-600">Money Market Funds</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Ultra-safe, hold short-term debt. Used for cash savings. Very low returns.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> VMFXX, SPAXX
              </p>
            </div>
          </div>
        </section>

        {/* Index vs Active */}
        <section id="index-vs-active" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Index Funds vs. Actively Managed Funds</h2>

          <p className="mb-4">
            This is the most important distinction in mutual fund investing.
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="border-2 border-green-200 dark:border-green-900 rounded-lg p-6">
              <h3 className="font-semibold text-green-600 mb-3 text-lg">Index Funds</h3>
              <p className="text-sm mb-4">
                Track a market index (S&amp;P 500, Total Market) without trying to beat it.
              </p>
              <ul className="text-sm space-y-2">
                <li><strong>Fees:</strong> Very low (0.03-0.20%)</li>
                <li><strong>Strategy:</strong> Buy and hold all index stocks</li>
                <li><strong>Manager:</strong> Minimal human involvement</li>
                <li><strong>Goal:</strong> Match the market return</li>
                <li><strong>Tax Efficiency:</strong> High (low turnover)</li>
              </ul>
              <div className="mt-4 p-3 bg-green-100 dark:bg-green-950 rounded text-xs">
                <strong>Why many experts prefer index funds:</strong> After fees, 80-90% of actively managed
                funds underperform index funds over 15+ years.
              </div>
            </div>

            <div className="border-2 border-purple-200 dark:border-purple-900 rounded-lg p-6">
              <h3 className="font-semibold text-purple-600 mb-3 text-lg">Actively Managed Funds</h3>
              <p className="text-sm mb-4">
                A manager picks stocks trying to outperform the market index.
              </p>
              <ul className="text-sm space-y-2">
                <li><strong>Fees:</strong> Higher (0.50-2.00%+)</li>
                <li><strong>Strategy:</strong> Research and stock picking</li>
                <li><strong>Manager:</strong> Team of analysts</li>
                <li><strong>Goal:</strong> Beat the market return</li>
                <li><strong>Tax Efficiency:</strong> Lower (more trading)</li>
              </ul>
              <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-950 rounded text-xs">
                <strong>The challenge:</strong> Fees eat into returns. A 1% fee on a 7% return means
                you keep 6% while index funds keep 6.9%.
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
            <h4 className="font-semibold mb-2">The Evidence</h4>
            <p className="text-sm">
              According to SPIVA research, over 15-year periods, approximately 90% of actively
              managed US stock funds underperform the S&amp;P 500 index. The higher fees of active
              funds make it mathematically difficult to beat the market consistently.
            </p>
          </div>
        </section>

        {/* Fees */}
        <section id="fees" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Understanding Mutual Fund Fees</h2>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Fee Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Description</th>
                  <th className="text-left py-3 px-4 font-semibold">Typical Range</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Expense Ratio</td>
                  <td className="py-3 px-4">Annual management fee (% of assets)</td>
                  <td className="py-3 px-4">0.03% - 2.00%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Front-End Load</td>
                  <td className="py-3 px-4">Sales commission when you buy</td>
                  <td className="py-3 px-4">0% - 5.75%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Back-End Load (CDSC)</td>
                  <td className="py-3 px-4">Commission when you sell (decreases over time)</td>
                  <td className="py-3 px-4">0% - 5%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">12b-1 Fee</td>
                  <td className="py-3 px-4">Marketing/distribution fee (part of expense ratio)</td>
                  <td className="py-3 px-4">0% - 1%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6">
            <h3 className="font-semibold mb-3">The Cost of High Fees: An Example</h3>
            <p className="text-sm mb-4">
              $10,000 invested for 30 years at 7% annual return:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Fee Level</th>
                    <th className="text-left py-2 px-3">After 30 Years</th>
                    <th className="text-left py-2 px-3">Lost to Fees</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b text-green-600">
                    <td className="py-2 px-3">0.03% (Index)</td>
                    <td className="py-2 px-3">$75,607</td>
                    <td className="py-2 px-3">$499</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">0.50% (Low Active)</td>
                    <td className="py-2 px-3">$66,439</td>
                    <td className="py-2 px-3">$9,667</td>
                  </tr>
                  <tr className="border-b text-red-600">
                    <td className="py-2 px-3">1.50% (High Active)</td>
                    <td className="py-2 px-3">$47,575</td>
                    <td className="py-2 px-3">$28,531</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              The 1.5% fee fund costs you almost <strong>$28,000 more</strong> than the 0.03% index fund
              over 30 years. That&apos;s why fees matter so much.
            </p>
          </div>
        </section>

        {/* vs ETF */}
        <section id="vs-etf" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Mutual Fund vs. ETF</h2>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="text-left py-3 px-4 font-semibold">Mutual Fund</th>
                  <th className="text-left py-3 px-4 font-semibold">ETF</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Trading</td>
                  <td className="py-3 px-4">Once daily at NAV</td>
                  <td className="py-3 px-4">Throughout the day</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Minimum Investment</td>
                  <td className="py-3 px-4">Often $1,000-$3,000</td>
                  <td className="py-3 px-4">1 share (or fractional)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Automatic Investing</td>
                  <td className="py-3 px-4 text-green-600">Easy to set up</td>
                  <td className="py-3 px-4">Available at most brokers</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Dollar Amounts</td>
                  <td className="py-3 px-4 text-green-600">Invest exact amounts</td>
                  <td className="py-3 px-4">Need fractional shares</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">401(k) Availability</td>
                  <td className="py-3 px-4 text-green-600">Common</td>
                  <td className="py-3 px-4">Less common</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Tax Efficiency</td>
                  <td className="py-3 px-4">Less efficient</td>
                  <td className="py-3 px-4 text-green-600">More efficient</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
            <h4 className="font-semibold mb-2">When to Choose Mutual Funds</h4>
            <ul className="text-sm space-y-1">
              <li>Your 401(k) only offers mutual funds</li>
              <li>You want automatic investments in exact dollar amounts</li>
              <li>You prefer not dealing with intraday trading</li>
              <li>Access to specific funds only available as mutual funds</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              For most investors, especially in taxable accounts, ETFs are usually the better choice
              due to tax efficiency and flexibility. See our{' '}
              <Link href="/learn/what-is-an-etf" className="text-primary hover:underline">ETF guide</Link>.
            </p>
          </div>
        </section>

        {/* Popular Funds */}
        <section id="popular-funds" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Popular Mutual Funds for Beginners</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Ticker</th>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Expense</th>
                  <th className="text-left py-3 px-4 font-semibold">Minimum</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-green-50 dark:bg-green-950/20">
                  <td className="py-3 px-4 font-mono font-bold">VTSAX</td>
                  <td className="py-3 px-4">Vanguard Total Stock Market</td>
                  <td className="py-3 px-4">US Stock Index</td>
                  <td className="py-3 px-4 text-green-600">0.04%</td>
                  <td className="py-3 px-4">$3,000</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono font-bold">FXAIX</td>
                  <td className="py-3 px-4">Fidelity 500 Index</td>
                  <td className="py-3 px-4">S&amp;P 500 Index</td>
                  <td className="py-3 px-4 text-green-600">0.015%</td>
                  <td className="py-3 px-4">$0</td>
                </tr>
                <tr className="border-b bg-green-50 dark:bg-green-950/20">
                  <td className="py-3 px-4 font-mono font-bold">SWTSX</td>
                  <td className="py-3 px-4">Schwab Total Stock Market</td>
                  <td className="py-3 px-4">US Stock Index</td>
                  <td className="py-3 px-4 text-green-600">0.03%</td>
                  <td className="py-3 px-4">$0</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono font-bold">VBTLX</td>
                  <td className="py-3 px-4">Vanguard Total Bond Market</td>
                  <td className="py-3 px-4">Bond Index</td>
                  <td className="py-3 px-4 text-green-600">0.05%</td>
                  <td className="py-3 px-4">$3,000</td>
                </tr>
                <tr className="border-b bg-green-50 dark:bg-green-950/20">
                  <td className="py-3 px-4 font-mono font-bold">VTIAX</td>
                  <td className="py-3 px-4">Vanguard Total International</td>
                  <td className="py-3 px-4">International Index</td>
                  <td className="py-3 px-4 text-green-600">0.12%</td>
                  <td className="py-3 px-4">$3,000</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono font-bold">VFFVX</td>
                  <td className="py-3 px-4">Vanguard Target 2055</td>
                  <td className="py-3 px-4">Target-Date</td>
                  <td className="py-3 px-4 text-green-600">0.08%</td>
                  <td className="py-3 px-4">$1,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Simple 3-Fund Portfolio</h4>
            <p className="text-sm mb-2">
              Many investors use just three index funds for complete diversification:
            </p>
            <ul className="text-sm space-y-1">
              <li><strong>US Stocks:</strong> VTSAX or FXAIX (~60-70%)</li>
              <li><strong>International:</strong> VTIAX (~20-30%)</li>
              <li><strong>Bonds:</strong> VBTLX (~10-20%, more as you age)</li>
            </ul>
          </div>
        </section>

        {/* How to Invest */}
        <section id="how-to-invest" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How to Invest in Mutual Funds</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-3">Through Your 401(k)</h3>
              <ol className="text-sm space-y-2">
                <li>1. Log into your employer&apos;s retirement portal</li>
                <li>2. Choose funds from available options</li>
                <li>3. Set contribution percentage from paycheck</li>
                <li>4. Select automatic rebalancing if offered</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-3">
                Look for low-cost index funds. Avoid funds with expense ratios over 0.50%.
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-3">Direct with Fund Company</h3>
              <ol className="text-sm space-y-2">
                <li>1. Open account at Vanguard, Fidelity, or Schwab</li>
                <li>2. Link bank account and fund your account</li>
                <li>3. Search for fund by ticker (VTSAX, FXAIX)</li>
                <li>4. Enter dollar amount to invest</li>
                <li>5. Set up automatic monthly investments</li>
              </ol>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Automatic Investing</h4>
            <p className="text-sm">
              The biggest advantage of mutual funds is easy automatic investing. Set up a monthly
              transfer of $500 (or any amount) into your chosen fund. The fund buys fractional
              shares automatically - no need to worry about share prices.
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
              href="/learn/what-is-an-etf"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">What is an ETF?</h3>
              <p className="text-sm text-muted-foreground">Compare ETFs to mutual funds</p>
            </Link>
            <Link
              href="/learn/retirement-investing"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Retirement Investing</h3>
              <p className="text-sm text-muted-foreground">Using mutual funds in 401(k)s and IRAs</p>
            </Link>
            <Link
              href="/learn/dollar-cost-averaging"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Dollar Cost Averaging</h3>
              <p className="text-sm text-muted-foreground">The best way to invest in funds</p>
            </Link>
            <Link
              href="/learn/what-is-a-bond"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">What is a Bond?</h3>
              <p className="text-sm text-muted-foreground">Understanding bond funds</p>
            </Link>
            <Link
              href="/calculators/compound-interest"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Compound Interest Calculator</h3>
              <p className="text-sm text-muted-foreground">See how fees impact returns</p>
            </Link>
            <Link
              href="/calculators/portfolio-diversification"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Portfolio Diversification</h3>
              <p className="text-sm text-muted-foreground">Analyze your fund allocation</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
