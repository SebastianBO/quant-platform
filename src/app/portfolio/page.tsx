import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getBreadcrumbSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import PortfolioClient from './PortfolioClient'

export const metadata: Metadata = {
  title: 'Portfolio Tracker - Free Stock Portfolio Management | Lician',
  description: 'Track your stock portfolio for free with real-time prices, performance analytics, and AI insights. Monitor gains, losses, and get alerts on price movements.',
  keywords: [
    'portfolio tracker',
    'stock portfolio',
    'portfolio management',
    'investment tracker',
    'stock tracker',
    'free portfolio tracker',
    'track stocks',
    'portfolio performance',
    'investment portfolio',
    'stock watchlist'
  ],
  openGraph: {
    title: 'Portfolio Tracker - Free Stock Portfolio Management',
    description: 'Track your investments with real-time prices and AI insights.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/portfolio',
  },
}

const features = [
  {
    title: 'Real-Time Prices',
    description: 'Live stock quotes update automatically so you always know your portfolio value',
    icon: '📈',
  },
  {
    title: 'Performance Analytics',
    description: 'Track gains, losses, and returns over any time period',
    icon: '📊',
  },
  {
    title: 'Multiple Portfolios',
    description: 'Create separate portfolios for different strategies or accounts',
    icon: '📁',
  },
  {
    title: 'Price Alerts',
    description: 'Get notified when stocks hit your target prices',
    icon: '🔔',
  },
  {
    title: 'AI Insights',
    description: 'Get AI-powered analysis and recommendations for your holdings',
    icon: '🤖',
  },
  {
    title: '100% Free',
    description: 'No hidden fees, no premium tiers. Full features for everyone',
    icon: '💚',
  },
]

const faqs = [
  {
    question: 'Is the portfolio tracker really free?',
    answer: 'Yes, completely free with no hidden costs. We believe everyone should have access to professional-grade portfolio tracking tools.',
  },
  {
    question: 'How do I add stocks to my portfolio?',
    answer: 'Simply enter the stock ticker and the number of shares you own. You can also add your cost basis to track gains and losses accurately.',
  },
  {
    question: 'Is my portfolio data secure?',
    answer: 'Your data is stored securely and encrypted. We never share your portfolio information with third parties. You can also use the tool without creating an account - data is stored locally in your browser.',
  },
  {
    question: 'Can I track multiple portfolios?',
    answer: 'Yes! Create as many portfolios as you need - one for your IRA, one for taxable accounts, one for paper trading, etc.',
  },
  {
    question: 'How often are prices updated?',
    answer: 'Stock prices update in real-time during market hours. After-hours and pre-market prices are also shown when available.',
  },
]

export default function PortfolioPage() {
  const pageUrl = `${SITE_URL}/portfolio`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Portfolio', url: pageUrl },
  ])

  const faqSchema = getFAQSchema(faqs)

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Lician Portfolio Tracker',
    description: 'Free stock portfolio tracking with real-time prices and AI insights',
    url: pageUrl,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, faqSchema, appSchema]) }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Portfolio Tracker
            </h1>
            <p className="text-lg text-[#868f97]">
              Track your investments with real-time prices. Free forever.
            </p>
          </div>

          {/* Portfolio Tracker App */}
          <section className="mb-16">
            <PortfolioClient />
          </section>

          {/* Features */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Why Use Lician Portfolio Tracker?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08]">
                  <span className="text-3xl mb-4 block">{feature.icon}</span>
                  <h3 className="font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#868f97]">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08] group">
                  <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-[#4ebe96] group-open:rotate-180 transition-transform duration-100">▼</span>
                  </summary>
                  <p className="text-[#868f97] mt-4">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="border-t border-white/[0.08] pt-8">
            <h3 className="text-lg font-bold mb-4 text-center">Explore More Tools</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/markets" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-sm">
                Live Markets
              </Link>
              <Link href="/screener" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-sm">
                Stock Screener
              </Link>
              <Link href="/newsletter" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-sm">
                Newsletter
              </Link>
              <Link href="/battle" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-sm">
                Stock Battle
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
