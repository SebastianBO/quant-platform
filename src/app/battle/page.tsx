import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getBreadcrumbSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import StockBattleClient from './StockBattleClient'

export const metadata: Metadata = {
  title: 'Stock Battle - Which Stock Would You Buy? | Lician',
  description: 'Vote on which stock you would buy! Compare stocks head-to-head and see what other investors think. Fun, fast, and shareable stock comparison game.',
  keywords: [
    'stock battle',
    'stock comparison',
    'which stock to buy',
    'stock vs stock',
    'compare stocks',
    'stock game',
    'investing game',
    'stock picker',
    'best stocks',
    'stock voting'
  ],
  openGraph: {
    title: 'Stock Battle - Which Stock Would You Buy?',
    description: 'Vote on which stock you would buy and see what other investors think!',
    type: 'website',
    images: [{
      url: `${SITE_URL}/api/og/battle`,
      width: 1200,
      height: 630,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stock Battle - Which Stock Would You Buy?',
    description: 'I just voted in Stock Battle! Which stock would YOU buy?',
  },
  alternates: {
    canonical: 'https://lician.com/battle',
  },
}

const faqs = [
  {
    question: 'What is Stock Battle?',
    answer: 'Stock Battle is a fun, interactive game where you choose between two stocks. Vote for the one you would buy, see how other investors voted, and share your picks with friends. It\'s a quick way to discover popular stocks and compare investment ideas.',
  },
  {
    question: 'How does Stock Battle work?',
    answer: 'Two stocks appear on screen. Click the one you would rather buy. After voting, you\'ll see the percentage of voters who chose each stock. Then a new battle begins! Challenge friends by sharing your streak on social media.',
  },
  {
    question: 'Are the votes real?',
    answer: 'Yes! Every vote is from a real visitor. The percentages update in real-time as more people vote. You\'re seeing actual investor sentiment, not simulated data.',
  },
  {
    question: 'Can I share my Stock Battle results?',
    answer: 'Absolutely! After each vote, you can share your pick on Twitter/X, copy a link, or challenge friends directly. Sharing helps you compete for the longest voting streak!',
  },
]

export default function StockBattlePage() {
  const pageUrl = `${SITE_URL}/battle`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stock Battle', url: pageUrl },
  ])

  const faqSchema = getFAQSchema(faqs)

  const gameSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Stock Battle',
    description: 'Interactive stock comparison voting game',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, faqSchema, gameSchema]) }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Stock Battle
            </h1>
            <p className="text-xl text-muted-foreground">
              Which stock would you buy? Vote and see what others think!
            </p>
          </div>

          {/* Game */}
          <StockBattleClient />

          {/* How it works */}
          <section className="mt-16 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border text-center">
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-500">1</span>
                </div>
                <h3 className="font-bold mb-2">Pick a Stock</h3>
                <p className="text-sm text-muted-foreground">
                  Two stocks appear. Click the one you would rather buy right now.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border text-center">
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-500">2</span>
                </div>
                <h3 className="font-bold mb-2">See Results</h3>
                <p className="text-sm text-muted-foreground">
                  Instantly see how other investors voted. Are you with the crowd or against it?
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border text-center">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-500">3</span>
                </div>
                <h3 className="font-bold mb-2">Share & Compete</h3>
                <p className="text-sm text-muted-foreground">
                  Share your picks on social media and challenge friends to beat your streak!
                </p>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-card p-5 rounded-xl border border-border group">
                  <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-muted-foreground mt-3 text-sm">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-600/20 to-blue-600/10 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Want Deeper Analysis?</h2>
            <p className="text-muted-foreground mb-6">
              Get AI-powered stock analysis, price predictions, and portfolio insights
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/screener"
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Stock Screener
              </Link>
              <Link
                href="/compare"
                className="bg-secondary hover:bg-secondary/80 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Compare Stocks
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
