import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema } from '@/lib/seo'

const SITE_URL = 'https://lician.com'

export const metadata: Metadata = {
  title: 'What is Market Capitalization? A Beginner\'s Guide to Market Cap | Lician',
  description: 'Learn what market capitalization means, how it\'s calculated, and why it matters for investors. Understand large-cap, mid-cap, and small-cap stocks and their risk profiles.',
  keywords: [
    'what is market cap',
    'market capitalization explained',
    'how to calculate market cap',
    'large cap stocks',
    'mid cap stocks',
    'small cap stocks',
    'market cap formula',
    'market cap vs stock price',
    'company valuation',
    'stock market basics'
  ],
  openGraph: {
    title: 'What is Market Capitalization? A Beginner\'s Guide',
    description: 'Learn what market cap means and why it matters for your investment decisions.',
    url: `${SITE_URL}/learn/what-is-market-cap`,
    type: 'article',
  },
  alternates: {
    canonical: `${SITE_URL}/learn/what-is-market-cap`,
  },
}

const faqItems = [
  {
    question: 'What is market capitalization in simple terms?',
    answer: 'Market capitalization (market cap) is the total value of all a company\'s shares of stock. It\'s calculated by multiplying the stock price by the number of shares outstanding. If a company has 1 million shares trading at $50 each, its market cap is $50 million.'
  },
  {
    question: 'Why does market cap matter for investors?',
    answer: 'Market cap tells you the size of a company, which affects risk and return expectations. Large-cap stocks ($10B+) are typically more stable but slower growing. Small-cap stocks ($300M-$2B) offer higher growth potential but more volatility. Market cap helps you diversify your portfolio across different company sizes.'
  },
  {
    question: 'Is a higher market cap better?',
    answer: 'Not necessarily. Higher market cap means a larger, more established company - often more stable but with slower growth. Lower market cap companies may offer higher growth potential but carry more risk. The "best" market cap depends on your investment goals, risk tolerance, and time horizon.'
  },
  {
    question: 'What\'s the difference between market cap and stock price?',
    answer: 'Stock price is the cost of one share; market cap is the total value of all shares. A $100 stock isn\'t necessarily larger than a $10 stock - it depends on shares outstanding. Apple at $200/share with 15 billion shares ($3T market cap) is much larger than a $500 stock with 10 million shares ($5B market cap).'
  },
  {
    question: 'Can market cap change without the stock price changing?',
    answer: 'Yes. When a company issues new shares (dilution) or buys back shares, the number of shares outstanding changes, affecting market cap even if the stock price stays the same. Stock splits also change share count but typically don\'t change market cap because the price adjusts proportionally.'
  },
  {
    question: 'What is free float market cap?',
    answer: 'Free float market cap only counts shares that are publicly tradable, excluding shares held by insiders, governments, or through restricted stock. Index funds like the S&P 500 often use free float market cap for weighting because it better represents what investors can actually buy and sell.'
  },
  {
    question: 'What are mega-cap stocks?',
    answer: 'Mega-cap stocks have market caps over $200 billion. These are the largest companies in the world, like Apple, Microsoft, Amazon, and Google. They\'re typically the most stable investments but may have limited growth potential due to their already massive size.'
  },
  {
    question: 'Should beginners invest in large-cap or small-cap stocks?',
    answer: 'Most experts recommend beginners start with large-cap stocks or broad market index funds. Large caps are more stable, have more analyst coverage, and are less likely to face sudden financial distress. As you gain experience and can handle more volatility, you might add small-cap exposure for growth potential.'
  }
]

export default function WhatIsMarketCapPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'What is Market Cap?', url: `${SITE_URL}/learn/what-is-market-cap` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'What is Market Capitalization? A Beginner\'s Guide to Market Cap',
    description: 'Learn what market cap means, how it\'s calculated, and why it matters for investors.',
    url: `${SITE_URL}/learn/what-is-market-cap`,
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
            <li className="text-foreground">What is Market Cap?</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            What is Market Capitalization? A Beginner&apos;s Guide
          </h1>
          <p className="text-xl text-muted-foreground">
            Understand how market cap measures company size, why it matters for your portfolio,
            and how to use it to make smarter investment decisions.
          </p>
        </header>

        {/* Quick Answer Box */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mb-10">
          <h2 className="text-lg font-semibold mb-2">Quick Answer</h2>
          <p className="text-muted-foreground">
            <strong>Market capitalization is the total market value of a company&apos;s stock.</strong> Calculate
            it by multiplying the stock price by shares outstanding. A company with 100 million shares
            at $50 each has a $5 billion market cap. Market cap tells you how &quot;big&quot; a company is
            in the eyes of the market.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-muted/50 rounded-lg p-6 mb-10">
          <h2 className="font-semibold mb-3">In This Guide</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#how-its-calculated" className="text-primary hover:underline">How Market Cap is Calculated</a></li>
            <li><a href="#size-categories" className="text-primary hover:underline">Market Cap Size Categories</a></li>
            <li><a href="#why-it-matters" className="text-primary hover:underline">Why Market Cap Matters</a></li>
            <li><a href="#vs-stock-price" className="text-primary hover:underline">Market Cap vs. Stock Price</a></li>
            <li><a href="#investing-implications" className="text-primary hover:underline">Investment Implications</a></li>
            <li><a href="#limitations" className="text-primary hover:underline">Limitations of Market Cap</a></li>
            <li><a href="#faqs" className="text-primary hover:underline">Frequently Asked Questions</a></li>
          </ul>
        </div>

        {/* How It's Calculated */}
        <section id="how-its-calculated" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How Market Cap is Calculated</h2>

          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-2">The Formula</h3>
            <p className="font-mono text-lg mb-4 p-4 bg-background rounded">
              Market Cap = Stock Price &times; Shares Outstanding
            </p>
            <p className="text-sm text-muted-foreground">
              It&apos;s that simple. The market cap changes whenever the stock price moves because
              shares outstanding typically stays relatively stable.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-3">Real Examples</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Company</th>
                  <th className="text-left py-3 px-4 font-semibold">Stock Price</th>
                  <th className="text-left py-3 px-4 font-semibold">Shares Outstanding</th>
                  <th className="text-left py-3 px-4 font-semibold">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Apple (AAPL)</td>
                  <td className="py-3 px-4">~$230</td>
                  <td className="py-3 px-4">~15.3B shares</td>
                  <td className="py-3 px-4">~$3.5 trillion</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Tesla (TSLA)</td>
                  <td className="py-3 px-4">~$250</td>
                  <td className="py-3 px-4">~3.2B shares</td>
                  <td className="py-3 px-4">~$800 billion</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Coca-Cola (KO)</td>
                  <td className="py-3 px-4">~$60</td>
                  <td className="py-3 px-4">~4.3B shares</td>
                  <td className="py-3 px-4">~$260 billion</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Key Insight</h4>
            <p className="text-sm">
              Notice that Coca-Cola&apos;s stock price ($60) is much lower than Tesla&apos;s ($250), but
              the number of shares matters too. Stock price alone doesn&apos;t tell you how big a
              company is - market cap does.
            </p>
          </div>
        </section>

        {/* Size Categories */}
        <section id="size-categories" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Market Cap Size Categories</h2>

          <p className="mb-4">
            Investors categorize companies by market cap into five main groups. These aren&apos;t
            official definitions - different analysts may use slightly different thresholds.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Category</th>
                  <th className="text-left py-3 px-4 font-semibold">Market Cap Range</th>
                  <th className="text-left py-3 px-4 font-semibold">Characteristics</th>
                  <th className="text-left py-3 px-4 font-semibold">Examples</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-purple-50 dark:bg-purple-950/20">
                  <td className="py-3 px-4 font-medium">Mega-Cap</td>
                  <td className="py-3 px-4">$200B+</td>
                  <td className="py-3 px-4">Global leaders, extremely stable</td>
                  <td className="py-3 px-4">Apple, Microsoft, Amazon</td>
                </tr>
                <tr className="border-b bg-blue-50 dark:bg-blue-950/20">
                  <td className="py-3 px-4 font-medium">Large-Cap</td>
                  <td className="py-3 px-4">$10B - $200B</td>
                  <td className="py-3 px-4">Established, lower risk</td>
                  <td className="py-3 px-4">Netflix, FedEx, Target</td>
                </tr>
                <tr className="border-b bg-green-50 dark:bg-green-950/20">
                  <td className="py-3 px-4 font-medium">Mid-Cap</td>
                  <td className="py-3 px-4">$2B - $10B</td>
                  <td className="py-3 px-4">Growth potential, moderate risk</td>
                  <td className="py-3 px-4">Crocs, Five Below, Topgolf</td>
                </tr>
                <tr className="border-b bg-yellow-50 dark:bg-yellow-950/20">
                  <td className="py-3 px-4 font-medium">Small-Cap</td>
                  <td className="py-3 px-4">$300M - $2B</td>
                  <td className="py-3 px-4">Higher growth, higher volatility</td>
                  <td className="py-3 px-4">Regional banks, emerging tech</td>
                </tr>
                <tr className="border-b bg-red-50 dark:bg-red-950/20">
                  <td className="py-3 px-4 font-medium">Micro-Cap</td>
                  <td className="py-3 px-4">$50M - $300M</td>
                  <td className="py-3 px-4">Very high risk, speculative</td>
                  <td className="py-3 px-4">Penny stocks, startups</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-blue-600">Large-Cap Profile</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Well-established brands</li>
                <li>Consistent revenue streams</li>
                <li>Often pay dividends</li>
                <li>Lower volatility</li>
                <li>Extensive analyst coverage</li>
              </ul>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-green-600">Mid-Cap Profile</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Room for growth</li>
                <li>More agile than large-caps</li>
                <li>Often acquisition targets</li>
                <li>Moderate volatility</li>
                <li>Less analyst coverage</li>
              </ul>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-orange-600">Small-Cap Profile</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>High growth potential</li>
                <li>May be undiscovered gems</li>
                <li>Limited resources</li>
                <li>High volatility</li>
                <li>Less liquid trading</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section id="why-it-matters" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Why Market Cap Matters</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">1. Risk Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Larger companies are generally more stable. A $3 trillion company like Apple
                is unlikely to go bankrupt. A $500 million company faces much more risk.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">2. Growth Expectations</h3>
              <p className="text-sm text-muted-foreground">
                A small company can double in size more easily than a massive one. Apple
                would need $3.5 trillion in NEW value to double - that&apos;s almost impossible.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">3. Index Inclusion</h3>
              <p className="text-sm text-muted-foreground">
                Major indexes like S&amp;P 500 require minimum market caps. When stocks qualify,
                index funds must buy them, often boosting demand and price.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">4. Portfolio Diversification</h3>
              <p className="text-sm text-muted-foreground">
                A well-diversified portfolio often includes different market cap sizes
                to balance growth potential with stability.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">5. Institutional Interest</h3>
              <p className="text-sm text-muted-foreground">
                Large institutions often can&apos;t invest in small-cap stocks because buying
                would move the price too much. Market cap affects who can invest.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">6. Company Comparisons</h3>
              <p className="text-sm text-muted-foreground">
                Market cap lets you compare companies in the same industry. Is Pepsi
                bigger than Coca-Cola? Check their market caps.
              </p>
            </div>
          </div>
        </section>

        {/* Market Cap vs Stock Price */}
        <section id="vs-stock-price" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Market Cap vs. Stock Price</h2>

          <p className="mb-4">
            One of the most common beginner mistakes is thinking a &quot;high&quot; stock price
            means an expensive company. It doesn&apos;t.
          </p>

          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-3">The Stock Price Misconception</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Company</th>
                    <th className="text-left py-2 px-3">Stock Price</th>
                    <th className="text-left py-2 px-3">Shares</th>
                    <th className="text-left py-2 px-3">Market Cap</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3">Company A</td>
                    <td className="py-2 px-3">$500</td>
                    <td className="py-2 px-3">20M</td>
                    <td className="py-2 px-3"><strong>$10 billion</strong></td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3">Company B</td>
                    <td className="py-2 px-3">$25</td>
                    <td className="py-2 px-3">4B</td>
                    <td className="py-2 px-3"><strong>$100 billion</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm mt-4">
              Company B is <strong>10x larger</strong> than Company A, despite having a
              stock price that&apos;s 20x lower. The number of shares outstanding makes all the difference.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Why Stock Prices Vary So Much</h3>
            <ul className="text-sm space-y-2">
              <li>
                <strong>Stock splits:</strong> A 10-for-1 split makes a $1,000 stock become $100
                (10x more shares, same market cap)
              </li>
              <li>
                <strong>Initial shares:</strong> Companies choose how many shares to issue at IPO
              </li>
              <li>
                <strong>Philosophy:</strong> Some CEOs prefer high prices (Berkshire: $700,000+),
                others prefer accessible prices (Apple: ~$230)
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              Fractional shares have made stock price even less relevant - you can buy $10 of any stock.
            </p>
          </div>
        </section>

        {/* Investment Implications */}
        <section id="investing-implications" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Investment Implications by Market Cap</h2>

          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 text-blue-600">Large-Cap Investing</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-600">Pros:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Lower volatility and risk</li>
                    <li>Often pay dividends</li>
                    <li>Easier to research (more coverage)</li>
                    <li>Highly liquid (easy to buy/sell)</li>
                    <li>Suitable for conservative investors</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-red-600">Cons:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Limited growth potential</li>
                    <li>Already widely owned</li>
                    <li>Harder to find undervalued gems</li>
                    <li>May move slowly in bull markets</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                <strong>Best ETFs:</strong> SPY, VOO, IVV (S&amp;P 500), DIA (Dow 30)
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 text-green-600">Mid-Cap Investing</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-600">Pros:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Sweet spot of growth + stability</li>
                    <li>Often acquisition targets</li>
                    <li>Less followed = more opportunities</li>
                    <li>Proven business models</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-red-600">Cons:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>More volatility than large-caps</li>
                    <li>Less analyst coverage</li>
                    <li>May struggle in recessions</li>
                    <li>Less diversified businesses</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                <strong>Best ETFs:</strong> IJH, VO (mid-cap blend), MDY
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3 text-orange-600">Small-Cap Investing</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-600">Pros:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Highest growth potential</li>
                    <li>Less efficient market = opportunities</li>
                    <li>Next Apple/Amazon could be here</li>
                    <li>Historically outperform long-term</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-red-600">Cons:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>High volatility and risk</li>
                    <li>Many fail or never grow</li>
                    <li>Less liquid (harder to sell)</li>
                    <li>Limited analyst research</li>
                    <li>More susceptible to recessions</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                <strong>Best ETFs:</strong> IJR, VB (small-cap blend), IWM (Russell 2000)
              </p>
            </div>
          </div>
        </section>

        {/* Limitations */}
        <section id="limitations" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Limitations of Market Cap</h2>

          <p className="mb-4">
            Market cap is useful but not perfect. Here are its limitations:
          </p>

          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Ignores Debt</h3>
              <p className="text-sm">
                A company with $10B market cap and $5B in debt is very different from one
                with $10B market cap and no debt. Enterprise Value (EV) accounts for debt
                and is often more useful for valuations.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Market Sentiment vs. Reality</h3>
              <p className="text-sm">
                Market cap reflects what the market thinks, not necessarily the true value.
                In bubbles, market caps can become wildly disconnected from fundamentals.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Float vs. Total Shares</h3>
              <p className="text-sm">
                If insiders hold 50% of shares, only half are actually tradable. Free float
                market cap is often more relevant for understanding supply and demand.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Changes Constantly</h3>
              <p className="text-sm">
                Stock prices move every second, so market cap is always changing. The figures
                you see are point-in-time snapshots that may be outdated.
              </p>
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
              href="/insights/market-cap-statistics"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Market Cap Statistics</h3>
              <p className="text-sm text-muted-foreground">See largest companies by market cap</p>
            </Link>
            <Link
              href="/learn/what-is-a-stock"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">What is a Stock?</h3>
              <p className="text-sm text-muted-foreground">Stock basics for beginners</p>
            </Link>
            <Link
              href="/screener"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Stock Screener</h3>
              <p className="text-sm text-muted-foreground">Filter stocks by market cap</p>
            </Link>
            <Link
              href="/calculators/portfolio-diversification"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Portfolio Diversification</h3>
              <p className="text-sm text-muted-foreground">Analyze your portfolio allocation</p>
            </Link>
            <Link
              href="/learn/pe-ratio"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">P/E Ratio Explained</h3>
              <p className="text-sm text-muted-foreground">Another key valuation metric</p>
            </Link>
            <Link
              href="/learn/etf-investing"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">ETF Investing Guide</h3>
              <p className="text-sm text-muted-foreground">Easy market cap exposure through ETFs</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
