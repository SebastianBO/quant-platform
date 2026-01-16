import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema } from '@/lib/seo'

const SITE_URL = 'https://lician.com'

export const metadata: Metadata = {
  title: 'What is an ETF? A Beginner\'s Guide to Exchange-Traded Funds | Lician',
  description: 'Learn what ETFs are, how they work, and why they\'re popular with investors. Understand the difference between ETFs and mutual funds, index ETFs, and how to start investing in ETFs.',
  keywords: [
    'what is an ETF',
    'ETF meaning',
    'exchange traded fund explained',
    'how do ETFs work',
    'ETF vs mutual fund',
    'index ETF',
    'ETF investing for beginners',
    'best ETFs to buy',
    'SPY ETF',
    'VOO ETF',
    'passive investing'
  ],
  openGraph: {
    title: 'What is an ETF? A Beginner\'s Guide to Exchange-Traded Funds',
    description: 'Learn what ETFs are, how they work, and why millions of investors use them.',
    url: `${SITE_URL}/learn/what-is-an-etf`,
    type: 'article',
  },
  alternates: {
    canonical: `${SITE_URL}/learn/what-is-an-etf`,
  },
}

const faqItems = [
  {
    question: 'What is an ETF in simple terms?',
    answer: 'An ETF (Exchange-Traded Fund) is a basket of investments that trades on a stock exchange like a single stock. Instead of buying shares of one company, you buy shares of the ETF which holds dozens or thousands of investments. It\'s like buying a pre-made diversified portfolio with one purchase.'
  },
  {
    question: 'How is an ETF different from a stock?',
    answer: 'A stock is ownership in one company. An ETF is ownership in a fund that holds many investments (stocks, bonds, commodities, etc.). When you buy Apple stock, you only own Apple. When you buy an S&P 500 ETF like VOO, you own pieces of 500 companies in one purchase.'
  },
  {
    question: 'What is the difference between ETFs and mutual funds?',
    answer: 'ETFs trade throughout the day on exchanges like stocks and typically have lower fees (0.03-0.50%). Mutual funds only trade once daily after markets close and often have higher fees (0.50-2.00%). ETFs usually require no minimum investment, while mutual funds often require $1,000-$3,000 minimums.'
  },
  {
    question: 'Are ETFs good for beginners?',
    answer: 'Yes, ETFs are excellent for beginners. They provide instant diversification (less risk than individual stocks), have low fees, are easy to buy through any brokerage, and don\'t require picking individual stocks. Index ETFs like VOO or VTI are often recommended as a starting point.'
  },
  {
    question: 'What are the best ETFs for beginners?',
    answer: 'Popular starter ETFs include: VOO or SPY (S&P 500 index), VTI (total US stock market), QQQ (NASDAQ 100/tech heavy), and VT (total world stocks). For bonds, BND (total bond market) is common. These provide broad diversification with very low fees.'
  },
  {
    question: 'Do ETFs pay dividends?',
    answer: 'Many ETFs pay dividends by passing through dividends received from the underlying stocks or bonds. The frequency varies - some pay monthly, others quarterly. You can reinvest dividends automatically (DRIP) or take them as cash. The dividend yield depends on what the ETF holds.'
  },
  {
    question: 'What fees do ETFs charge?',
    answer: 'ETFs charge an expense ratio - an annual fee as a percentage of your investment. Index ETFs like VOO charge 0.03% ($3 per $10,000/year). Active ETFs charge 0.50-1.00% or more. You don\'t pay this fee directly - it\'s deducted from the fund\'s returns daily.'
  },
  {
    question: 'Can you lose money in ETFs?',
    answer: 'Yes. If the underlying investments decline in value, the ETF\'s price falls too. ETFs aren\'t guaranteed or risk-free. However, diversified ETFs are generally less risky than individual stocks because losses in some holdings can be offset by gains in others.'
  }
]

export default function WhatIsAnETFPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'What is an ETF?', url: `${SITE_URL}/learn/what-is-an-etf` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'What is an ETF? A Beginner\'s Guide to Exchange-Traded Funds',
    description: 'Learn what ETFs are, how they work, and why they\'re popular with investors.',
    url: `${SITE_URL}/learn/what-is-an-etf`,
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
            <li className="text-foreground">What is an ETF?</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            What is an ETF? A Beginner&apos;s Guide
          </h1>
          <p className="text-xl text-muted-foreground">
            Understand how Exchange-Traded Funds work, why they&apos;ve revolutionized
            investing, and how to use them to build a diversified portfolio.
          </p>
        </header>

        {/* Quick Answer Box */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mb-10">
          <h2 className="text-lg font-semibold mb-2">Quick Answer</h2>
          <p className="text-muted-foreground">
            <strong>An ETF (Exchange-Traded Fund) is a basket of investments that trades like a stock.</strong> Instead
            of buying individual stocks one by one, you can buy one ETF that contains hundreds or
            thousands of stocks. For example, buying the SPY ETF gives you ownership in all 500
            companies in the S&amp;P 500 with a single purchase.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-muted/50 rounded-lg p-6 mb-10">
          <h2 className="font-semibold mb-3">In This Guide</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#how-etfs-work" className="text-primary hover:underline">How ETFs Work</a></li>
            <li><a href="#types-of-etfs" className="text-primary hover:underline">Types of ETFs</a></li>
            <li><a href="#etf-vs-mutual-fund" className="text-primary hover:underline">ETF vs. Mutual Fund</a></li>
            <li><a href="#etf-vs-stocks" className="text-primary hover:underline">ETF vs. Individual Stocks</a></li>
            <li><a href="#popular-etfs" className="text-primary hover:underline">Popular ETFs for Beginners</a></li>
            <li><a href="#how-to-buy" className="text-primary hover:underline">How to Buy ETFs</a></li>
            <li><a href="#pros-cons" className="text-primary hover:underline">Pros and Cons of ETFs</a></li>
            <li><a href="#faqs" className="text-primary hover:underline">Frequently Asked Questions</a></li>
          </ul>
        </div>

        {/* How ETFs Work */}
        <section id="how-etfs-work" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How ETFs Work</h2>

          <p className="mb-4">
            Think of an ETF like a shopping basket at the grocery store. Instead of buying
            each fruit individually (apples, oranges, bananas), you buy a pre-filled fruit basket.
          </p>

          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">The ETF Structure</h3>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Fund Manager Creates Basket:</strong> A company like Vanguard or BlackRock creates a fund holding specific investments (e.g., all S&amp;P 500 stocks).
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>ETF Shares Issued:</strong> The fund is divided into shares that trade on stock exchanges (NYSE, NASDAQ) under a ticker symbol (SPY, VOO, QQQ).
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>You Buy Shares:</strong> You purchase ETF shares through your brokerage, just like buying a stock. Each share represents a tiny piece of all the holdings.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <strong>Price Tracks Holdings:</strong> The ETF price rises or falls based on the combined value of everything inside it.
                </div>
              </li>
            </ol>
          </div>

          <h3 className="text-xl font-semibold mb-3">Simple Example</h3>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6">
            <p className="mb-3">
              <strong>The VOO ETF (Vanguard S&amp;P 500):</strong>
            </p>
            <ul className="text-sm space-y-2">
              <li>Holds all 500 stocks in the S&amp;P 500 index</li>
              <li>Current price: ~$550 per share</li>
              <li>Expense ratio: 0.03% ($3 per $10,000/year)</li>
              <li>Top holdings: Apple, Microsoft, Amazon, NVIDIA, Google</li>
            </ul>
            <p className="text-sm mt-4">
              <strong>By buying one share of VOO (~$550), you instantly own pieces of 500 companies.</strong>
            </p>
          </div>
        </section>

        {/* Types of ETFs */}
        <section id="types-of-etfs" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Types of ETFs</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-blue-600">Index ETFs</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Track a specific index like S&amp;P 500, NASDAQ 100, or Total Stock Market.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> VOO, SPY, QQQ, VTI, IWM
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-green-600">Sector ETFs</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Focus on specific industries like technology, healthcare, or energy.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> XLK (tech), XLF (financials), XLE (energy)
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-purple-600">Bond ETFs</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Hold government or corporate bonds for income and stability.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> BND, AGG, TLT, LQD
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-orange-600">International ETFs</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Invest in stocks or bonds from outside the US.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> VXUS, VEU, EEM (emerging markets)
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-yellow-600">Commodity ETFs</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Track commodities like gold, silver, or oil.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> GLD (gold), SLV (silver), USO (oil)
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-red-600">Dividend ETFs</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Focus on stocks that pay high or growing dividends.
              </p>
              <p className="text-xs">
                <strong>Examples:</strong> VYM, SCHD, DVY, DGRO
              </p>
            </div>
          </div>
        </section>

        {/* ETF vs Mutual Fund */}
        <section id="etf-vs-mutual-fund" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">ETF vs. Mutual Fund</h2>

          <p className="mb-4">
            ETFs and mutual funds both hold baskets of investments, but they work differently.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Feature</th>
                  <th className="text-left py-3 px-4 font-semibold">ETFs</th>
                  <th className="text-left py-3 px-4 font-semibold">Mutual Funds</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Trading</td>
                  <td className="py-3 px-4">Throughout the day on exchanges</td>
                  <td className="py-3 px-4">Once daily after market close</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Typical Fees</td>
                  <td className="py-3 px-4 text-green-600">0.03% - 0.50%</td>
                  <td className="py-3 px-4 text-red-600">0.50% - 2.00%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Minimum Investment</td>
                  <td className="py-3 px-4">1 share (often $50-$500)</td>
                  <td className="py-3 px-4">$1,000 - $3,000 typically</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Tax Efficiency</td>
                  <td className="py-3 px-4 text-green-600">Generally more tax-efficient</td>
                  <td className="py-3 px-4">Can trigger capital gains</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Transparency</td>
                  <td className="py-3 px-4">Holdings visible daily</td>
                  <td className="py-3 px-4">Holdings disclosed quarterly</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Fractional Shares</td>
                  <td className="py-3 px-4">Available at most brokerages</td>
                  <td className="py-3 px-4">Naturally supports any dollar amount</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Which Should You Choose?</h4>
            <p className="text-sm">
              For most investors, ETFs are the better choice due to lower fees and flexibility.
              The only advantages of mutual funds are automatic investing features at some
              401(k) providers and the ability to invest exact dollar amounts without needing
              fractional shares.
            </p>
          </div>
        </section>

        {/* ETF vs Stocks */}
        <section id="etf-vs-stocks" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">ETF vs. Individual Stocks</h2>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-3 text-blue-600">ETF Advantages</h3>
              <ul className="text-sm space-y-2">
                <li><strong>Instant diversification</strong> - one purchase, many stocks</li>
                <li><strong>Lower risk</strong> - one company failing won&apos;t ruin you</li>
                <li><strong>No research required</strong> - just buy the index</li>
                <li><strong>Professional management</strong> - fund handles rebalancing</li>
                <li><strong>Time-saving</strong> - no need to analyze individual companies</li>
              </ul>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-3 text-green-600">Individual Stock Advantages</h3>
              <ul className="text-sm space-y-2">
                <li><strong>Higher potential returns</strong> - a winning stock beats the index</li>
                <li><strong>No management fees</strong> - you don&apos;t pay expense ratios</li>
                <li><strong>Full control</strong> - choose exactly what you own</li>
                <li><strong>Tax flexibility</strong> - harvest losses on specific positions</li>
                <li><strong>Voting rights</strong> - direct ownership means shareholder votes</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Best of Both Worlds Strategy</h3>
            <p className="text-sm mb-3">
              Many investors use both: a core of index ETFs for diversification plus
              individual stocks for companies they believe in.
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Example portfolio:</strong> 70% in VOO (S&amp;P 500 ETF), 20% in VXUS
              (international ETF), 10% in individual stocks you&apos;ve researched.
            </p>
          </div>
        </section>

        {/* Popular ETFs */}
        <section id="popular-etfs" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Popular ETFs for Beginners</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Ticker</th>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 font-semibold">What It Tracks</th>
                  <th className="text-left py-3 px-4 font-semibold">Expense Ratio</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-blue-50 dark:bg-blue-950/20">
                  <td className="py-3 px-4 font-mono font-bold">VOO</td>
                  <td className="py-3 px-4">Vanguard S&amp;P 500</td>
                  <td className="py-3 px-4">500 largest US companies</td>
                  <td className="py-3 px-4 text-green-600">0.03%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono font-bold">SPY</td>
                  <td className="py-3 px-4">SPDR S&amp;P 500</td>
                  <td className="py-3 px-4">500 largest US companies</td>
                  <td className="py-3 px-4">0.09%</td>
                </tr>
                <tr className="border-b bg-blue-50 dark:bg-blue-950/20">
                  <td className="py-3 px-4 font-mono font-bold">VTI</td>
                  <td className="py-3 px-4">Vanguard Total Market</td>
                  <td className="py-3 px-4">Entire US stock market (~4,000 stocks)</td>
                  <td className="py-3 px-4 text-green-600">0.03%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono font-bold">QQQ</td>
                  <td className="py-3 px-4">Invesco NASDAQ 100</td>
                  <td className="py-3 px-4">100 largest NASDAQ stocks (tech-heavy)</td>
                  <td className="py-3 px-4">0.20%</td>
                </tr>
                <tr className="border-b bg-blue-50 dark:bg-blue-950/20">
                  <td className="py-3 px-4 font-mono font-bold">VXUS</td>
                  <td className="py-3 px-4">Vanguard Total International</td>
                  <td className="py-3 px-4">Stocks outside the US</td>
                  <td className="py-3 px-4">0.08%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono font-bold">BND</td>
                  <td className="py-3 px-4">Vanguard Total Bond</td>
                  <td className="py-3 px-4">US investment-grade bonds</td>
                  <td className="py-3 px-4">0.03%</td>
                </tr>
                <tr className="border-b bg-blue-50 dark:bg-blue-950/20">
                  <td className="py-3 px-4 font-mono font-bold">VT</td>
                  <td className="py-3 px-4">Vanguard Total World</td>
                  <td className="py-3 px-4">Global stocks (US + international)</td>
                  <td className="py-3 px-4">0.07%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono font-bold">SCHD</td>
                  <td className="py-3 px-4">Schwab US Dividend</td>
                  <td className="py-3 px-4">High-quality dividend stocks</td>
                  <td className="py-3 px-4">0.06%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Beginner Recommendation</h4>
            <p className="text-sm">
              Start with VTI or VOO - they&apos;re the simplest way to own the entire US market
              or 500 largest companies with rock-bottom fees. As you learn more, you can
              add international (VXUS) and bonds (BND) for diversification.
            </p>
          </div>
        </section>

        {/* How to Buy */}
        <section id="how-to-buy" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How to Buy ETFs</h2>

          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">Step-by-Step Process</h3>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Open a Brokerage Account:</strong> Use Fidelity, Schwab, Vanguard, or any commission-free broker. Most take 10-15 minutes to set up.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>Fund Your Account:</strong> Transfer money from your bank. This usually takes 1-3 business days.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>Search for the ETF:</strong> Enter the ticker symbol (like VOO, SPY, or QQQ) in the search bar.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">4</span>
                <div>
                  <strong>Place a Buy Order:</strong> Enter the number of shares (or dollar amount for fractional shares) and click buy. Use a market order for immediate execution.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">5</span>
                <div>
                  <strong>Set Up Automatic Investing:</strong> Most brokerages let you automatically buy ETFs weekly or monthly to build your position over time.
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Commission-Free Brokers</h4>
            <p className="text-sm">
              Most major brokerages (Fidelity, Schwab, Vanguard, Robinhood, etc.) offer
              commission-free ETF trading. You won&apos;t pay anything to buy or sell ETF shares.
              The only cost is the ETF&apos;s expense ratio, which is automatically deducted.
            </p>
          </div>
        </section>

        {/* Pros and Cons */}
        <section id="pros-cons" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Pros and Cons of ETFs</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-2 border-green-200 dark:border-green-900 rounded-lg p-6">
              <h3 className="font-semibold text-green-600 mb-4 text-lg">Advantages</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-green-500">+</span>
                  <span><strong>Diversification:</strong> Own hundreds of stocks in one purchase</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">+</span>
                  <span><strong>Low Costs:</strong> Index ETFs charge 0.03-0.10% fees</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">+</span>
                  <span><strong>Tax Efficient:</strong> Structure minimizes capital gains</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">+</span>
                  <span><strong>Flexible:</strong> Trade anytime during market hours</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">+</span>
                  <span><strong>Transparent:</strong> Holdings disclosed daily</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-500">+</span>
                  <span><strong>Accessible:</strong> No minimums, fractional shares available</span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-red-200 dark:border-red-900 rounded-lg p-6">
              <h3 className="font-semibold text-red-600 mb-4 text-lg">Disadvantages</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-red-500">-</span>
                  <span><strong>Limited Upside:</strong> You get average returns, not home runs</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">-</span>
                  <span><strong>Expense Ratios:</strong> Small ongoing costs (even if low)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">-</span>
                  <span><strong>No Control:</strong> Can&apos;t exclude companies you don&apos;t like</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">-</span>
                  <span><strong>Tracking Error:</strong> May not perfectly match the index</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">-</span>
                  <span><strong>Trading Spreads:</strong> Bid-ask spread costs on each trade</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-500">-</span>
                  <span><strong>Temptation to Trade:</strong> Easy access can lead to overtrading</span>
                </li>
              </ul>
            </div>
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
              href="/learn/etf-investing"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">ETF Investing Guide</h3>
              <p className="text-sm text-muted-foreground">Advanced ETF strategies and portfolio building</p>
            </Link>
            <Link
              href="/etfs"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Browse ETFs</h3>
              <p className="text-sm text-muted-foreground">Explore popular ETFs and their holdings</p>
            </Link>
            <Link
              href="/learn/what-is-a-stock"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">What is a Stock?</h3>
              <p className="text-sm text-muted-foreground">Understand stocks before diving into ETFs</p>
            </Link>
            <Link
              href="/learn/dollar-cost-averaging"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Dollar Cost Averaging</h3>
              <p className="text-sm text-muted-foreground">The best way to invest in ETFs over time</p>
            </Link>
            <Link
              href="/calculators/portfolio-diversification"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Portfolio Diversification</h3>
              <p className="text-sm text-muted-foreground">Analyze your ETF allocation</p>
            </Link>
            <Link
              href="/learn/what-is-a-dividend"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">What is a Dividend?</h3>
              <p className="text-sm text-muted-foreground">Learn about dividend ETFs</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
