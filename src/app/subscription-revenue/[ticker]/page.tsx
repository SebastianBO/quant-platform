import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Subscription Revenue - Recurring Revenue Analysis`,
    description: `${symbol} subscription revenue analysis with recurring revenue trends, subscriber growth, and ARPU metrics. Understand ${symbol}'s subscription business model.`,
    keywords: [
      `${symbol} subscription revenue`,
      `${symbol} recurring revenue`,
      `${symbol} subscribers`,
      `${symbol} ARPU`,
      `${symbol} subscription growth`,
      `${symbol} membership revenue`,
    ],
    openGraph: {
      title: `${symbol} Subscription Revenue | Recurring Revenue & Subscribers`,
      description: `Comprehensive subscription revenue analysis for ${symbol} with recurring revenue and subscriber growth trends.`,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/subscription-revenue/${ticker.toLowerCase()}`,
    },
  }
}

async function getStockData(ticker: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${ticker}`,
      { next: { revalidate: 300 } }
    )
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export default async function SubscriptionRevenuePage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/subscription-revenue/${ticker.toLowerCase()}`
  const price = snapshot.price || 0

  const subscriptionFaqs = [
    {
      question: `What is ${symbol} subscription revenue?`,
      answer: `${symbol} subscription revenue represents recurring income from customers who pay periodic fees (monthly or annual) for access to premium features, services, or memberships. This includes programs like Amazon Prime, streaming subscriptions, or premium seller accounts.`
    },
    {
      question: `Why is subscription revenue important for ${symbol}?`,
      answer: `Subscription revenue is highly valuable for ${companyName} because it's predictable, recurring, and often has high margins. Subscribers typically have higher engagement and lifetime value. Growing subscription revenue indicates a sticky, loyal customer base and provides revenue visibility.`
    },
    {
      question: `How does ${symbol} generate subscription revenue?`,
      answer: `${companyName} generates subscription revenue through various programs: consumer memberships (like Prime), premium seller subscriptions, streaming or content services, storage or cloud services, and value-added subscription features that enhance the core platform experience.`
    },
    {
      question: `What metrics matter for ${symbol} subscription business?`,
      answer: `Key metrics for ${symbol} subscriptions include: total subscribers, subscriber growth rate, ARPU (Average Revenue Per User), churn rate, LTV (Lifetime Value), CAC (Customer Acquisition Cost), and subscription revenue as a percentage of total revenue.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace Metrics', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Subscription Revenue`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Subscription Revenue - Recurring Revenue Analysis`,
      description: `Comprehensive subscription revenue analysis for ${symbol} (${companyName}) with recurring revenue and subscriber growth trends.`,
      url: pageUrl,
      keywords: [`${symbol} subscription revenue`, `${symbol} recurring revenue`, `${symbol} subscribers`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(subscriptionFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Marketplace Metrics</Link>
            {' / '}
            <span>{symbol} Subscription Revenue</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">{symbol} Subscription Revenue</h1>
          <p className="text-xl text-muted-foreground mb-8">{companyName} - Recurring revenue, subscribers & membership growth</p>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-cyan-600/20 to-teal-600/20 p-8 rounded-xl border border-cyan-500/30 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Today's Change</p>
                <p className={`text-3xl font-bold ${snapshot.day_change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {snapshot.day_change_percent >= 0 ? '+' : ''}{snapshot.day_change_percent?.toFixed(2)}%
                </p>
              </div>
              {snapshot.yearHigh && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W High</p>
                  <p className="text-2xl font-bold">${snapshot.yearHigh.toFixed(2)}</p>
                </div>
              )}
              {snapshot.yearLow && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">52W Low</p>
                  <p className="text-2xl font-bold">${snapshot.yearLow.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Overview */}
          <section className="mb-12">
            <div className="bg-card p-8 rounded-lg border border-border">
              <div className="text-6xl mb-4">🔄</div>
              <h2 className="text-2xl font-bold mb-2">Subscription Revenue Analysis</h2>
              <p className="text-muted-foreground mb-6">Track {symbol}'s subscription revenue, recurring income, and subscriber growth metrics</p>
              <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium">
                View Full Subscription Metrics
              </Link>
            </div>
          </section>

          {/* Subscription Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Key Subscription Revenue Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Total Subscription Revenue', desc: 'Recurring membership income' },
                { name: 'Total Subscribers', desc: 'Active subscription count' },
                { name: 'Subscriber Growth Rate', desc: 'YoY subscriber change' },
                { name: 'ARPU', desc: 'Average revenue per user' },
                { name: 'Churn Rate', desc: 'Monthly subscriber cancellations' },
                { name: 'LTV/CAC Ratio', desc: 'Unit economics efficiency' },
              ].map((metric, i) => (
                <div key={i} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold">{metric.name}</p>
                  <p className="text-sm text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What Subscription Revenue Tells You */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What Subscription Revenue Tells You</h2>
            <div className="space-y-3">
              {[
                'Growing subscription revenue provides predictable, high-margin recurring income',
                'Subscribers typically have higher engagement and spend more than non-subscribers',
                'Low churn rates indicate strong product-market fit and customer satisfaction',
                'Subscription models create competitive moats through switching costs and habit formation',
              ].map((point, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-cyan-500 text-lg">✓</span>
                  <p className="text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-r from-cyan-600/20 to-teal-600/20 p-8 rounded-xl border border-cyan-500/30 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Complete Subscription Analysis</h2>
            <p className="text-muted-foreground mb-6">Get AI-powered analysis of {symbol} subscription revenue and recurring income trends</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=financials`} className="inline-block bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium">
              Analyze {symbol} Subscriptions
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {subscriptionFaqs.map((faq, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="subscription-revenue" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
