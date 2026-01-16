import Link from 'next/link'
import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import { BookOpen, TrendingUp, Building2, DollarSign, Users, ShieldCheck, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'What is a Stock? A Complete Beginner\'s Guide to Stocks | Lician',
  description: 'Learn what stocks are and how they work. Understand shares, ownership, dividends, and why companies issue stock. Perfect for investing beginners.',
  keywords: ['what is a stock', 'stocks explained', 'what are shares', 'how stocks work', 'stock market basics', 'buying stocks for beginners', 'equity explained'],
  openGraph: {
    title: 'What is a Stock? A Complete Beginner\'s Guide',
    description: 'Learn what stocks are and how they work. Understand shares, ownership, dividends, and why companies issue stock.',
    url: `${SITE_URL}/learn/what-is-a-stock`,
    type: 'article',
  },
  alternates: {
    canonical: `${SITE_URL}/learn/what-is-a-stock`,
  },
}

const faqs = [
  {
    question: "What is a stock in simple terms?",
    answer: "A stock represents ownership in a company. When you buy a stock (also called a share), you become a part-owner of that company. If the company has 1,000 shares and you own 10, you own 1% of the company."
  },
  {
    question: "How do stocks make money?",
    answer: "Stocks can make money in two ways: (1) Capital appreciation - when the stock price increases and you sell for more than you paid, and (2) Dividends - regular cash payments some companies distribute to shareholders from their profits."
  },
  {
    question: "What's the difference between stocks and shares?",
    answer: "The terms are often used interchangeably. Technically, 'stock' refers to ownership in one or more companies generally, while 'share' refers to a single unit of ownership in a specific company. For example, you might own 'stocks' in your portfolio and '100 shares' of Apple."
  },
  {
    question: "Why do companies issue stock?",
    answer: "Companies issue stock to raise money (capital) without taking on debt. This money can be used to expand the business, develop new products, hire employees, or pay off existing debt. In exchange, investors receive partial ownership and potential returns."
  },
  {
    question: "Can you lose money in stocks?",
    answer: "Yes, stocks can lose value. If you sell a stock for less than you paid, you realize a loss. In extreme cases (bankruptcy), a stock can become worthless. However, you cannot lose more than your initial investment when buying stocks (unlike some other investments)."
  },
  {
    question: "How much money do I need to start buying stocks?",
    answer: "You can start with very little money. Many brokers have no minimum deposit and offer fractional shares, allowing you to invest as little as $1. However, it's wise to start with money you can afford to have invested for at least 3-5 years."
  },
  {
    question: "What's the difference between stocks and bonds?",
    answer: "Stocks represent ownership in a company, while bonds are loans you make to a company or government. Bonds typically pay fixed interest and return your principal at maturity. Stocks have higher potential returns but also higher risk. Bonds are generally safer but offer lower returns."
  },
  {
    question: "Are stocks a good investment for beginners?",
    answer: "Stocks can be excellent for beginners with a long time horizon (5+ years). Index funds and ETFs that hold many stocks are often recommended for beginners because they provide diversification with a single purchase. Starting with well-established companies or broad market funds reduces risk."
  }
]

export default function WhatIsAStockPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li><Link href="/learn" className="hover:text-foreground">Learn</Link></li>
            <li>/</li>
            <li className="text-foreground">What is a Stock?</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">What is a Stock?</h1>
              <p className="text-muted-foreground">A Complete Beginner&apos;s Guide</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl">
            If you&apos;ve ever wondered what stocks are or how the stock market works, you&apos;re in the right place.
            This guide explains everything you need to know about stocks in plain, simple language.
          </p>
        </div>

        {/* Key Takeaways */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl p-6 mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Key Takeaways
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>A <strong>stock</strong> represents partial ownership in a company</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You can make money through <strong>price appreciation</strong> (stock goes up) and <strong>dividends</strong> (cash payments)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Stocks are <strong>riskier than bonds</strong> but have historically provided higher returns</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You can start investing with <strong>very little money</strong> through fractional shares</span>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <article className="prose prose-slate dark:prose-invert max-w-none">
          {/* Definition Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary" />
              The Simple Definition
            </h2>

            <div className="bg-card border rounded-xl p-6 mb-6">
              <p className="text-lg mb-4">
                <strong>A stock is a piece of ownership in a company.</strong>
              </p>
              <p className="text-muted-foreground">
                When you buy a stock (also called a &quot;share&quot;), you become a part-owner of that company.
                If Apple has issued 15 billion shares and you own 15 shares, you own one-billionth of Apple.
                That might sound tiny, but it still entitles you to a portion of Apple&apos;s profits and a say in company decisions.
              </p>
            </div>

            <p>
              Think of it like a pizza. A company is the whole pizza, and stocks are individual slices.
              When you buy stock, you&apos;re buying a slice of that company pizza. The more slices you own,
              the bigger your portion of the company.
            </p>
          </section>

          {/* Why Companies Issue Stock */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <DollarSign className="h-6 w-6 text-primary" />
              Why Do Companies Issue Stock?
            </h2>

            <p className="mb-6">
              Companies issue stock to <strong>raise money without taking on debt</strong>. This money is called &quot;capital&quot;
              and can be used to:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Expand the Business</h3>
                <p className="text-sm text-muted-foreground">Open new locations, enter new markets, or scale operations</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Develop Products</h3>
                <p className="text-sm text-muted-foreground">Fund research and development for new products or services</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Hire Talent</h3>
                <p className="text-sm text-muted-foreground">Bring on employees to grow the team and capabilities</p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Pay Off Debt</h3>
                <p className="text-sm text-muted-foreground">Reduce existing loans and improve financial health</p>
              </div>
            </div>

            <p>
              In exchange for your money, you get partial ownership and the potential for returns if the company succeeds.
              This is different from lending money (bonds), where you get fixed interest payments but no ownership.
            </p>
          </section>

          {/* How Stocks Make Money */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              How Do Stocks Make Money?
            </h2>

            <p className="mb-6">
              There are two main ways to make money from stocks:
            </p>

            <div className="space-y-6 mb-8">
              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-green-600">1. Capital Appreciation (Price Goes Up)</h3>
                <p className="mb-4">
                  If you buy a stock at $50 and sell it later at $75, you&apos;ve made $25 per share. This is called a <strong>capital gain</strong>.
                </p>
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Example:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Buy 10 shares at $50 each = $500 invested</li>
                    <li>• Stock price rises to $75</li>
                    <li>• Sell 10 shares at $75 each = $750</li>
                    <li>• <strong>Profit: $250 (50% return)</strong></li>
                  </ul>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">2. Dividends (Cash Payments)</h3>
                <p className="mb-4">
                  Some companies share their profits with shareholders through regular cash payments called <strong>dividends</strong>.
                  Not all companies pay dividends—many growing companies reinvest profits instead.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Example:</p>
                  <ul className="text-sm space-y-1">
                    <li>• You own 100 shares of a company</li>
                    <li>• The company pays $1 per share annually</li>
                    <li>• <strong>You receive $100 per year in dividends</strong></li>
                    <li>• You keep the shares and can also benefit from price appreciation</li>
                  </ul>
                </div>
              </div>
            </div>

            <p>
              Many investors aim for both—buying stocks that grow in value while also paying dividends.
              This combination of growth and income is a powerful wealth-building strategy.
            </p>
          </section>

          {/* Types of Stock */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              Types of Stock
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">What It Means</th>
                    <th className="text-left py-3 px-4 font-semibold">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Common Stock</td>
                    <td className="py-3 px-4">Most typical type. You get voting rights and may receive dividends.</td>
                    <td className="py-3 px-4">Most investors</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Preferred Stock</td>
                    <td className="py-3 px-4">Higher dividend priority but usually no voting rights. More bond-like.</td>
                    <td className="py-3 px-4">Income-focused investors</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Growth Stocks</td>
                    <td className="py-3 px-4">Companies expected to grow faster than average. Usually don&apos;t pay dividends.</td>
                    <td className="py-3 px-4">Long-term growth seekers</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Value Stocks</td>
                    <td className="py-3 px-4">Undervalued companies trading below their intrinsic worth.</td>
                    <td className="py-3 px-4">Bargain hunters</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Dividend Stocks</td>
                    <td className="py-3 px-4">Companies that regularly pay dividends to shareholders.</td>
                    <td className="py-3 px-4">Income investors</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Blue Chip Stocks</td>
                    <td className="py-3 px-4">Large, well-established companies with stable earnings (e.g., Apple, Microsoft).</td>
                    <td className="py-3 px-4">Conservative investors</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Risks Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              Understanding the Risks
            </h2>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-xl p-6 mb-6">
              <p className="text-sm mb-4">
                <strong>Important:</strong> Stocks can and do lose value. Understanding the risks is essential before investing.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="bg-yellow-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5">1</span>
                  <div>
                    <strong>Market Risk:</strong> The overall market can decline, taking most stocks down with it (like in 2008 or 2020).
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-yellow-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5">2</span>
                  <div>
                    <strong>Company Risk:</strong> A specific company can struggle or go bankrupt, making its stock worthless.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-yellow-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5">3</span>
                  <div>
                    <strong>Volatility:</strong> Stock prices can swing dramatically in short periods, which can be stressful.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-yellow-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5">4</span>
                  <div>
                    <strong>No Guarantees:</strong> Unlike savings accounts, stocks are not FDIC insured and past performance doesn&apos;t guarantee future results.
                  </div>
                </li>
              </ul>
            </div>

            <p>
              The good news: historically, the stock market has trended upward over long periods. The S&P 500 has returned
              about 10% annually on average since 1926. But there have been many years with negative returns, and recovery
              can take time.
            </p>
          </section>

          {/* Stocks vs Bonds */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Stocks vs. Bonds: What&apos;s the Difference?
            </h2>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Feature</th>
                    <th className="text-left py-3 px-4 font-semibold">Stocks</th>
                    <th className="text-left py-3 px-4 font-semibold">Bonds</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">What You Own</td>
                    <td className="py-3 px-4">Partial ownership of a company</td>
                    <td className="py-3 px-4">A loan you made to a company/government</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Returns</td>
                    <td className="py-3 px-4">Variable (price changes + possible dividends)</td>
                    <td className="py-3 px-4">Fixed interest payments</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Risk Level</td>
                    <td className="py-3 px-4">Higher risk</td>
                    <td className="py-3 px-4">Generally lower risk</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Potential Returns</td>
                    <td className="py-3 px-4">Higher (~10% historical average)</td>
                    <td className="py-3 px-4">Lower (~3-5% typical)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Best For</td>
                    <td className="py-3 px-4">Long-term growth</td>
                    <td className="py-3 px-4">Stability and income</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              Most financial advisors recommend owning both stocks and bonds. The classic rule of thumb is to subtract your age from 110
              to get your stock percentage (e.g., a 30-year-old might have 80% stocks, 20% bonds).
            </p>
          </section>

          {/* How to Buy Stocks */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">How to Buy Your First Stock</h2>

            <ol className="space-y-4 mb-6">
              <li className="flex items-start gap-4">
                <span className="bg-primary text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</span>
                <div>
                  <strong>Open a Brokerage Account</strong>
                  <p className="text-muted-foreground text-sm">
                    Choose a broker like Fidelity, Charles Schwab, Robinhood, or E*TRADE. Most have no minimum deposit and no trading fees.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-primary text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  <strong>Fund Your Account</strong>
                  <p className="text-muted-foreground text-sm">
                    Transfer money from your bank account. With fractional shares, you can start with as little as $1.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-primary text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  <strong>Research Stocks</strong>
                  <p className="text-muted-foreground text-sm">
                    Look into companies you know and understand. Check their financials, growth prospects, and valuation.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-primary text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</span>
                <div>
                  <strong>Place Your Order</strong>
                  <p className="text-muted-foreground text-sm">
                    Search for the stock by name or ticker symbol, decide how many shares (or dollar amount), and click buy.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-primary text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">5</span>
                <div>
                  <strong>Monitor and Hold</strong>
                  <p className="text-muted-foreground text-sm">
                    Check on your investments periodically, but avoid the temptation to trade frequently. Long-term investing usually wins.
                  </p>
                </div>
              </li>
            </ol>

            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
              <p className="text-sm">
                <strong>Beginner Tip:</strong> Consider starting with an index fund or ETF like SPY or VTI. These give you instant diversification
                across hundreds of companies with a single purchase, reducing your risk compared to picking individual stocks.
              </p>
            </div>
          </section>
        </article>

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
          <h2 className="text-xl font-semibold mb-6">Continue Your Learning Journey</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/learn/how-to-invest"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                How to Invest in Stocks
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Step-by-step guide to building your first portfolio
              </p>
            </Link>

            <Link
              href="/learn/etf-investing"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                ETF Investing Guide
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Diversify instantly with exchange-traded funds
              </p>
            </Link>

            <Link
              href="/learn/stock-indices"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                Stock Market Indices
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Understand S&P 500, Dow Jones, and more
              </p>
            </Link>

            <Link
              href="/glossary"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                Investment Glossary
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                100+ financial terms explained simply
              </p>
            </Link>

            <Link
              href="/learn/dividend-investing"
              className="p-4 border rounded-lg hover:border-primary transition-colors group"
            >
              <h3 className="font-medium group-hover:text-primary flex items-center gap-2">
                Dividend Investing
                <ArrowRight className="h-4 w-4" />
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Build passive income through dividend stocks
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
                Find stocks that match your criteria
              </p>
            </Link>
          </div>
        </div>

        {/* Schema.org markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getBreadcrumbSchema([
              { name: 'Home', url: SITE_URL },
              { name: 'Learn', url: `${SITE_URL}/learn` },
              { name: 'What is a Stock?', url: `${SITE_URL}/learn/what-is-a-stock` },
            ])),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getArticleSchema({
              headline: 'What is a Stock? A Complete Beginner\'s Guide',
              description: 'Learn what stocks are and how they work. Understand shares, ownership, dividends, and why companies issue stock.',
              url: `${SITE_URL}/learn/what-is-a-stock`,
              datePublished: '2026-01-16',
              dateModified: '2026-01-16',
            })),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getFAQSchema(faqs)),
          }}
        />
      </main>

      <Footer />
    </div>
  )
}
