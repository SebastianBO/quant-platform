import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema } from '@/lib/seo'

const SITE_URL = 'https://lician.com'

export const metadata: Metadata = {
  title: 'What is a Bond? A Complete Beginner\'s Guide to Bond Investing | Lician',
  description: 'Learn what bonds are, how they work, and why investors use them. Understand bond basics including coupon rates, yields, maturity dates, and different types of bonds.',
  keywords: [
    'what is a bond',
    'bond investing for beginners',
    'how do bonds work',
    'bond basics',
    'types of bonds',
    'government bonds',
    'corporate bonds',
    'bond yield',
    'coupon rate',
    'bond maturity',
    'fixed income investing',
    'bonds vs stocks'
  ],
  openGraph: {
    title: 'What is a Bond? A Complete Beginner\'s Guide',
    description: 'Learn what bonds are, how they work, and why investors include them in their portfolios.',
    url: `${SITE_URL}/learn/what-is-a-bond`,
    type: 'article',
  },
  alternates: {
    canonical: `${SITE_URL}/learn/what-is-a-bond`,
  },
}

const faqItems = [
  {
    question: 'What is a bond in simple terms?',
    answer: 'A bond is essentially a loan you give to a government or company. In return, they promise to pay you regular interest (called the coupon) and return your original investment (principal) when the bond matures. Bonds are considered safer than stocks but typically offer lower returns.'
  },
  {
    question: 'How do bonds make money?',
    answer: 'Bonds make money in two ways: (1) Interest payments - bonds pay regular interest, usually semi-annually, based on the coupon rate. (2) Capital gains - if you sell a bond for more than you paid, you profit from the price difference. Most bondholders hold to maturity and collect the interest payments.'
  },
  {
    question: 'Are bonds safer than stocks?',
    answer: 'Generally yes. Bonds are considered less risky than stocks because bondholders get paid before stockholders if a company fails, and government bonds are backed by the government\'s taxing power. However, bonds aren\'t risk-free - they face interest rate risk, inflation risk, and credit risk.'
  },
  {
    question: 'What happens when a bond matures?',
    answer: 'When a bond matures, the issuer returns your original investment (face value/principal) to you, and interest payments stop. For example, if you bought a $1,000 bond, you\'d receive $1,000 back at maturity regardless of what you paid for the bond.'
  },
  {
    question: 'What is the difference between coupon rate and yield?',
    answer: 'The coupon rate is the fixed annual interest payment as a percentage of the bond\'s face value. The yield is your actual return based on what you paid for the bond. If you buy a bond at a discount (below face value), your yield is higher than the coupon rate. If you pay a premium (above face value), your yield is lower.'
  },
  {
    question: 'Should beginners invest in bonds?',
    answer: 'Bonds can be excellent for beginners, especially for portfolio diversification and reducing overall risk. Bond index funds and ETFs provide easy, low-cost access to diversified bond portfolios. Young investors may want more stocks for growth, while those near retirement typically increase bond allocations.'
  },
  {
    question: 'What are the best bonds for beginners?',
    answer: 'For beginners, bond index funds and ETFs are the easiest starting point. Treasury bonds (I-Bonds, T-Bills) are the safest option. Investment-grade corporate bond funds offer higher yields with moderate risk. Avoid high-yield (junk) bonds until you understand the risks involved.'
  },
  {
    question: 'How do interest rates affect bond prices?',
    answer: 'Bond prices and interest rates move in opposite directions. When interest rates rise, existing bonds become less attractive (their fixed payments are lower than new bonds), so their prices fall. When rates fall, existing bonds with higher payments become more valuable, so their prices rise.'
  }
]

export default function WhatIsABondPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'What is a Bond?', url: `${SITE_URL}/learn/what-is-a-bond` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'What is a Bond? A Complete Beginner\'s Guide to Bond Investing',
    description: 'Learn what bonds are, how they work, and why investors use them for portfolio diversification and income.',
    url: `${SITE_URL}/learn/what-is-a-bond`,
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
            <li className="text-foreground">What is a Bond?</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            What is a Bond? A Complete Beginner&apos;s Guide
          </h1>
          <p className="text-xl text-muted-foreground">
            Understand how bonds work, why investors use them, and how they can help
            balance your investment portfolio with stable, predictable income.
          </p>
        </header>

        {/* Quick Answer Box */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-6 mb-10">
          <h2 className="text-lg font-semibold mb-2">Quick Answer</h2>
          <p className="text-muted-foreground">
            <strong>A bond is a loan you give to a government or corporation.</strong> In exchange,
            they pay you regular interest and return your money when the bond matures. Bonds are
            considered &quot;fixed income&quot; investments because they provide predictable payments,
            making them generally safer but lower-returning than stocks.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-muted/50 rounded-lg p-6 mb-10">
          <h2 className="font-semibold mb-3">In This Guide</h2>
          <ul className="space-y-2 text-sm">
            <li><a href="#how-bonds-work" className="text-primary hover:underline">How Bonds Work</a></li>
            <li><a href="#key-terms" className="text-primary hover:underline">Key Bond Terms You Need to Know</a></li>
            <li><a href="#types-of-bonds" className="text-primary hover:underline">Types of Bonds</a></li>
            <li><a href="#bonds-vs-stocks" className="text-primary hover:underline">Bonds vs. Stocks: Key Differences</a></li>
            <li><a href="#why-invest" className="text-primary hover:underline">Why Investors Buy Bonds</a></li>
            <li><a href="#bond-risks" className="text-primary hover:underline">Bond Risks to Understand</a></li>
            <li><a href="#how-to-invest" className="text-primary hover:underline">How to Invest in Bonds</a></li>
            <li><a href="#faqs" className="text-primary hover:underline">Frequently Asked Questions</a></li>
          </ul>
        </div>

        {/* How Bonds Work */}
        <section id="how-bonds-work" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How Bonds Work</h2>

          <p className="mb-4">
            When you buy a bond, you&apos;re essentially lending money. Here&apos;s what happens:
          </p>

          <div className="bg-muted/30 rounded-lg p-6 mb-6">
            <h3 className="font-semibold mb-4">The Bond Lifecycle</h3>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</span>
                <div>
                  <strong>Purchase:</strong> You buy a bond (lend money to the issuer). You might pay $1,000 for a bond with a $1,000 face value.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</span>
                <div>
                  <strong>Coupon Payments:</strong> The issuer pays you interest regularly (usually every 6 months). A 5% coupon on $1,000 = $50/year.
                </div>
              </li>
              <li className="flex gap-4">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</span>
                <div>
                  <strong>Maturity:</strong> At maturity (e.g., 10 years), the issuer returns your principal ($1,000) and payments stop.
                </div>
              </li>
            </ol>
          </div>

          <h3 className="text-xl font-semibold mb-3">A Simple Example</h3>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6">
            <p className="mb-3">
              <strong>You buy:</strong> A 10-year corporate bond with a $1,000 face value and 5% coupon
            </p>
            <p className="mb-3">
              <strong>Each year:</strong> You receive $50 in interest ($25 every 6 months)
            </p>
            <p className="mb-3">
              <strong>After 10 years:</strong> You&apos;ve received $500 in interest + your $1,000 back
            </p>
            <p className="font-semibold">
              <strong>Total return:</strong> $1,500 on a $1,000 investment (50% total return over 10 years)
            </p>
          </div>
        </section>

        {/* Key Terms */}
        <section id="key-terms" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Key Bond Terms You Need to Know</h2>

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
                  <td className="py-3 px-4 font-medium">Face Value (Par)</td>
                  <td className="py-3 px-4">The amount paid back at maturity</td>
                  <td className="py-3 px-4">$1,000 (most common)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Coupon Rate</td>
                  <td className="py-3 px-4">Annual interest rate (fixed at issuance)</td>
                  <td className="py-3 px-4">5% = $50/year on $1,000</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Maturity Date</td>
                  <td className="py-3 px-4">When the bond expires and principal is returned</td>
                  <td className="py-3 px-4">January 15, 2036</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Yield</td>
                  <td className="py-3 px-4">Your actual return based on price paid</td>
                  <td className="py-3 px-4">5.5% if bought at discount</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Yield to Maturity (YTM)</td>
                  <td className="py-3 px-4">Total return if held to maturity</td>
                  <td className="py-3 px-4">Includes all coupons + price gain/loss</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Credit Rating</td>
                  <td className="py-3 px-4">Assessment of issuer&apos;s ability to pay</td>
                  <td className="py-3 px-4">AAA (best) to D (default)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Duration</td>
                  <td className="py-3 px-4">Measure of interest rate sensitivity</td>
                  <td className="py-3 px-4">Higher = more price volatility</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Price vs. Yield: The Seesaw Effect</h4>
            <p className="text-sm">
              When interest rates rise, bond prices fall. When rates fall, bond prices rise.
              This is because existing bonds with lower rates become less attractive when new
              bonds offer higher rates, and vice versa.
            </p>
          </div>
        </section>

        {/* Types of Bonds */}
        <section id="types-of-bonds" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Types of Bonds</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-lg">Government Bonds</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Issued by national governments. Considered the safest bonds.
              </p>
              <ul className="text-sm space-y-1">
                <li><strong>Treasury Bills (T-Bills):</strong> Short-term (4 weeks to 1 year)</li>
                <li><strong>Treasury Notes:</strong> Medium-term (2-10 years)</li>
                <li><strong>Treasury Bonds:</strong> Long-term (20-30 years)</li>
                <li><strong>I-Bonds:</strong> Inflation-protected savings bonds</li>
                <li><strong>TIPS:</strong> Treasury Inflation-Protected Securities</li>
              </ul>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-lg">Corporate Bonds</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Issued by companies to fund operations or expansion.
              </p>
              <ul className="text-sm space-y-1">
                <li><strong>Investment Grade:</strong> BBB/Baa or higher (lower risk)</li>
                <li><strong>High-Yield (Junk):</strong> Below BBB (higher risk/return)</li>
                <li><strong>Convertible:</strong> Can convert to company stock</li>
                <li><strong>Callable:</strong> Company can repay early</li>
              </ul>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-lg">Municipal Bonds</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Issued by state/local governments for public projects.
              </p>
              <ul className="text-sm space-y-1">
                <li><strong>General Obligation:</strong> Backed by taxing authority</li>
                <li><strong>Revenue Bonds:</strong> Backed by specific project income</li>
                <li><strong>Tax Benefit:</strong> Often exempt from federal taxes</li>
                <li><strong>Best For:</strong> High-income investors in high-tax states</li>
              </ul>
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-2 text-lg">Other Bond Types</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Specialized bonds for specific purposes.
              </p>
              <ul className="text-sm space-y-1">
                <li><strong>Agency Bonds:</strong> From government agencies (Fannie Mae)</li>
                <li><strong>Zero-Coupon:</strong> No interest payments, sold at discount</li>
                <li><strong>International:</strong> Foreign government/corporate bonds</li>
                <li><strong>Green Bonds:</strong> Fund environmental projects</li>
              </ul>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mt-6">
            <h4 className="font-semibold mb-3">Credit Rating Scale</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Rating</th>
                    <th className="text-left py-2 px-3">Grade</th>
                    <th className="text-left py-2 px-3">Risk Level</th>
                    <th className="text-left py-2 px-3">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">AAA/Aaa</td>
                    <td className="py-2 px-3">Prime</td>
                    <td className="py-2 px-3 text-green-600">Lowest</td>
                    <td className="py-2 px-3">Microsoft, Johnson &amp; Johnson</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">AA/Aa</td>
                    <td className="py-2 px-3">High Grade</td>
                    <td className="py-2 px-3 text-green-600">Very Low</td>
                    <td className="py-2 px-3">Apple, most US agencies</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">A</td>
                    <td className="py-2 px-3">Upper Medium</td>
                    <td className="py-2 px-3 text-blue-600">Low</td>
                    <td className="py-2 px-3">Most blue-chip companies</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">BBB/Baa</td>
                    <td className="py-2 px-3">Lower Medium</td>
                    <td className="py-2 px-3 text-yellow-600">Moderate</td>
                    <td className="py-2 px-3">Many stable companies</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">BB/Ba &amp; below</td>
                    <td className="py-2 px-3">High-Yield (Junk)</td>
                    <td className="py-2 px-3 text-red-600">Higher</td>
                    <td className="py-2 px-3">Speculative investments</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Bonds vs Stocks */}
        <section id="bonds-vs-stocks" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Bonds vs. Stocks: Key Differences</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Characteristic</th>
                  <th className="text-left py-3 px-4 font-semibold">Bonds</th>
                  <th className="text-left py-3 px-4 font-semibold">Stocks</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">What You Own</td>
                  <td className="py-3 px-4">Debt (you&apos;re a lender)</td>
                  <td className="py-3 px-4">Equity (you&apos;re an owner)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Income</td>
                  <td className="py-3 px-4">Fixed interest payments</td>
                  <td className="py-3 px-4">Variable dividends (optional)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Potential Return</td>
                  <td className="py-3 px-4">Lower (3-6% typical)</td>
                  <td className="py-3 px-4">Higher (7-10% long-term average)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Risk Level</td>
                  <td className="py-3 px-4">Generally lower</td>
                  <td className="py-3 px-4">Generally higher</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Price Volatility</td>
                  <td className="py-3 px-4">Lower (except long-term bonds)</td>
                  <td className="py-3 px-4">Higher</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Priority in Bankruptcy</td>
                  <td className="py-3 px-4">Paid first (senior claim)</td>
                  <td className="py-3 px-4">Paid last (if anything left)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Maturity</td>
                  <td className="py-3 px-4">Has a defined end date</td>
                  <td className="py-3 px-4">No expiration</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Best For</td>
                  <td className="py-3 px-4">Income, stability, diversification</td>
                  <td className="py-3 px-4">Growth, long-term wealth building</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-6">
            <h4 className="font-semibold mb-2">Why Hold Both?</h4>
            <p className="text-sm">
              Stocks and bonds often move in opposite directions. When stocks crash, investors often
              flee to bonds (pushing bond prices up). This negative correlation makes a stock/bond
              portfolio less volatile than either alone. See our{' '}
              <Link href="/calculators/portfolio-diversification" className="text-primary hover:underline">
                portfolio diversification analyzer
              </Link> to explore allocation strategies.
            </p>
          </div>
        </section>

        {/* Why Invest in Bonds */}
        <section id="why-invest" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Why Investors Buy Bonds</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">1. Predictable Income</h3>
              <p className="text-sm text-muted-foreground">
                Bonds pay fixed interest on a set schedule. Retirees and those seeking
                income can rely on these payments for living expenses.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">2. Capital Preservation</h3>
              <p className="text-sm text-muted-foreground">
                If held to maturity, you get your principal back (assuming no default).
                This makes bonds suitable for goals with fixed timeframes.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">3. Portfolio Diversification</h3>
              <p className="text-sm text-muted-foreground">
                Bonds often rise when stocks fall, smoothing out portfolio volatility.
                The classic &quot;60/40 portfolio&quot; uses 40% bonds for this reason.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">4. Lower Volatility</h3>
              <p className="text-sm text-muted-foreground">
                Bond prices fluctuate less than stocks. Investors uncomfortable with
                stock market swings may prefer bonds&apos; stability.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">5. Tax Benefits</h3>
              <p className="text-sm text-muted-foreground">
                Municipal bonds are often federal tax-free. Treasury bonds are state tax-free.
                High earners can benefit from tax-advantaged bonds.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">6. Deflation Hedge</h3>
              <p className="text-sm text-muted-foreground">
                During deflation, fixed bond payments become more valuable in real terms,
                while stock earnings often decline.
              </p>
            </div>
          </div>
        </section>

        {/* Bond Risks */}
        <section id="bond-risks" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Bond Risks to Understand</h2>

          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Interest Rate Risk</h3>
              <p className="text-sm mb-2">
                When interest rates rise, existing bond prices fall. Long-term bonds are more
                sensitive to rate changes than short-term bonds.
              </p>
              <p className="text-xs text-muted-foreground">
                Example: A 2% rate rise could cause a 10-year bond to lose ~9% of its value.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Credit Risk (Default Risk)</h3>
              <p className="text-sm mb-2">
                The issuer may fail to make payments or go bankrupt. Government bonds have
                minimal credit risk; corporate bonds vary by rating.
              </p>
              <p className="text-xs text-muted-foreground">
                Example: High-yield bonds have default rates of 3-5% in normal years, higher in recessions.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Inflation Risk</h3>
              <p className="text-sm mb-2">
                Bond payments are fixed, so inflation erodes their real purchasing power.
                A 5% bond loses value in real terms if inflation is 6%.
              </p>
              <p className="text-xs text-muted-foreground">
                Mitigation: TIPS and I-Bonds adjust for inflation automatically.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Call Risk</h3>
              <p className="text-sm mb-2">
                Callable bonds can be repaid early by the issuer, usually when rates fall.
                You get your money back but lose the higher-yielding bond.
              </p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg p-5">
              <h3 className="font-semibold mb-2">Liquidity Risk</h3>
              <p className="text-sm mb-2">
                Some bonds are hard to sell quickly without accepting a lower price.
                Treasury bonds are highly liquid; corporate bonds vary.
              </p>
            </div>
          </div>
        </section>

        {/* How to Invest */}
        <section id="how-to-invest" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How to Invest in Bonds</h2>

          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Option 1: Individual Bonds</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Buy specific bonds directly through a brokerage or TreasuryDirect.gov.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-600">Pros:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>Know exactly what you own</li>
                    <li>No ongoing management fees</li>
                    <li>Guaranteed return if held to maturity</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-red-600">Cons:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>Requires more research</li>
                    <li>Less diversification</li>
                    <li>Higher minimum investment ($1,000+)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Option 2: Bond Funds (ETFs &amp; Mutual Funds)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Invest in a diversified portfolio of bonds through one purchase.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong className="text-green-600">Pros:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>Instant diversification</li>
                    <li>Professional management</li>
                    <li>Low minimums ($1-$100)</li>
                    <li>Easy to buy/sell</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-red-600">Cons:</strong>
                  <ul className="list-disc list-inside mt-1">
                    <li>Ongoing expense ratios</li>
                    <li>No fixed maturity date</li>
                    <li>Less control over holdings</li>
                  </ul>
                </div>
              </div>
              <div className="bg-muted/50 rounded p-3 mt-4">
                <strong className="text-sm">Popular Bond ETFs:</strong>
                <ul className="text-sm mt-1 space-y-1">
                  <li><strong>BND</strong> - Vanguard Total Bond Market (broad US bonds)</li>
                  <li><strong>AGG</strong> - iShares Core US Aggregate Bond</li>
                  <li><strong>TLT</strong> - iShares 20+ Year Treasury Bonds</li>
                  <li><strong>LQD</strong> - iShares Investment Grade Corporate</li>
                  <li><strong>HYG</strong> - iShares High Yield Corporate</li>
                </ul>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Option 3: Bond Ladders</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Buy bonds with staggered maturity dates to balance income and reinvestment.
              </p>
              <div className="bg-muted/50 rounded p-4">
                <strong className="text-sm">Example Ladder ($10,000):</strong>
                <ul className="text-sm mt-2 space-y-1">
                  <li>$2,000 in 1-year bond</li>
                  <li>$2,000 in 2-year bond</li>
                  <li>$2,000 in 3-year bond</li>
                  <li>$2,000 in 4-year bond</li>
                  <li>$2,000 in 5-year bond</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  When the 1-year matures, reinvest in a new 5-year bond to maintain the ladder.
                </p>
              </div>
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
              href="/learn/what-is-a-stock"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">What is a Stock?</h3>
              <p className="text-sm text-muted-foreground">Learn stock basics and how they differ from bonds</p>
            </Link>
            <Link
              href="/learn/retirement-investing"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Retirement Investing</h3>
              <p className="text-sm text-muted-foreground">401(k), IRA, and bond allocation for retirement</p>
            </Link>
            <Link
              href="/calculators/portfolio-diversification"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Portfolio Diversification</h3>
              <p className="text-sm text-muted-foreground">Analyze your stock/bond allocation</p>
            </Link>
            <Link
              href="/learn/dollar-cost-averaging"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Dollar Cost Averaging</h3>
              <p className="text-sm text-muted-foreground">Strategy for consistent investing in bonds or stocks</p>
            </Link>
            <Link
              href="/calculators/compound-interest"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Compound Interest Calculator</h3>
              <p className="text-sm text-muted-foreground">See how bond interest compounds over time</p>
            </Link>
            <Link
              href="/learn/etf-investing"
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">ETF Investing Guide</h3>
              <p className="text-sm text-muted-foreground">Easy access to bond markets through ETFs</p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
