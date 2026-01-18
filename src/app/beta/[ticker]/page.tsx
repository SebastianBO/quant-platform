import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RelatedLinks } from '@/components/seo/RelatedLinks'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getCorporationSchema, SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

export const revalidate = 3600
// Increase timeout to prevent 5xx errors
export const maxDuration = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  return {
    title: `${symbol} Stock Beta - Volatility & Risk Analysis`,
    description: `${symbol} stock beta analysis. View beta coefficient, systematic risk, market correlation, and volatility metrics to assess ${symbol} risk profile.`,
    keywords: [
      `${symbol} beta`,
      `${symbol} stock beta`,
      `${symbol} volatility`,
      `${symbol} risk analysis`,
      `${symbol} market correlation`,
      `${symbol} systematic risk`,
    ],
    openGraph: {
      title: `${symbol} Stock Beta | Risk & Volatility Analysis`,
      description: `Comprehensive ${symbol} beta analysis with systematic risk and market correlation metrics.`,
      type: 'article',
      url: `https://lician.com/beta/${ticker.toLowerCase()}`,
      images: [{
        url: `https://lician.com/api/og/stock/${ticker.toLowerCase()}`,
        width: 1200,
        height: 630,
        alt: `${symbol} Beta Analysis`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Stock Beta`,
      description: `Comprehensive ${symbol} beta analysis with systematic risk and market correlation metrics.`,
      images: [`https://lician.com/api/og/stock/${ticker.toLowerCase()}`],
    },
    alternates: {
      canonical: `https://lician.com/beta/${ticker.toLowerCase()}`,
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

export default async function BetaPage({ params }: Props) {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()

  const stockData = await getStockData(symbol)
  if (!stockData?.snapshot) notFound()

  const { snapshot, companyFacts } = stockData
  const companyName = companyFacts?.name || symbol
  const pageUrl = `${SITE_URL}/beta/${ticker.toLowerCase()}`
  const price = snapshot.price || 0
  const beta = snapshot.beta || 1.0

  const betaFaqs = [
    {
      question: `What is ${symbol} stock beta?`,
      answer: `${symbol} has a beta of ${beta.toFixed(2)}. ${beta > 1 ? `This indicates ${symbol} is more volatile than the market and tends to amplify market movements.` : beta < 1 ? `This indicates ${symbol} is less volatile than the market and moves less than the overall market.` : `This indicates ${symbol} moves in line with the market.`}`
    },
    {
      question: `Is ${symbol} a high-risk stock?`,
      answer: `With a beta of ${beta.toFixed(2)}, ${symbol} is considered ${beta > 1.5 ? 'high-risk with significant volatility' : beta > 1 ? 'moderately risky with above-average volatility' : beta < 0.5 ? 'low-risk with below-average volatility' : 'moderate-risk with average market volatility'}. Beta measures systematic risk relative to the broader market.`
    },
    {
      question: `How does ${symbol} correlate with the market?`,
      answer: `${symbol}'s beta of ${beta.toFixed(2)} suggests ${beta > 1 ? 'strong positive correlation, moving more than the market' : beta > 0 ? 'positive correlation with the market' : 'negative correlation, moving opposite to the market'}. This helps investors understand how ${symbol} fits in a diversified portfolio.`
    },
    {
      question: `Should I invest in ${symbol} based on its beta?`,
      answer: `${symbol}'s beta of ${beta.toFixed(2)} indicates ${beta > 1 ? 'higher potential returns but also higher risk during market downturns' : 'more stability but potentially lower returns during bull markets'}. Consider your risk tolerance and investment timeline when evaluating ${symbol}.`
    },
  ]

  const schemas = [
    getBreadcrumbSchema([
      { name: 'Home', url: SITE_URL },
      { name: 'Stock Analysis', url: `${SITE_URL}/dashboard` },
      { name: `${symbol} Beta`, url: pageUrl },
    ]),
    getArticleSchema({
      headline: `${symbol} Stock Beta - Volatility & Risk Analysis`,
      description: `Comprehensive beta analysis for ${symbol} (${companyName}) including systematic risk and market correlation.`,
      url: pageUrl,
      keywords: [`${symbol} beta`, `${symbol} volatility`, `${symbol} risk analysis`],
    }),
    getCorporationSchema({
      ticker: symbol,
      name: companyName,
      description: companyFacts?.description?.slice(0, 200) || `${companyName} common stock`,
      sector: companyFacts?.sector,
      industry: companyFacts?.industry,
      url: pageUrl,
    }),
    getFAQSchema(betaFaqs),
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }} />
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-white motion-safe:transition-all motion-safe:duration-150 ease-out">Analysis</Link>
            {' / '}
            <span>{symbol} Beta</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4 text-balance">{symbol} Stock Beta</h1>
          <p className="text-xl text-[#868f97] mb-8">{companyName} - Volatility & systematic risk analysis</p>

          {/* Beta Card */}
          <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 mb-8 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[#868f97] text-sm mb-1">Current Price</p>
                <p className="text-4xl font-bold tabular-nums">${price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Beta Coefficient</p>
                <p className={`text-4xl font-bold tabular-nums ${beta > 1 ? 'text-[#ffa16c]' : beta < 0 ? 'text-[#ff5c5c]' : 'text-[#479ffa]'}`}>
                  {beta.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Risk Level</p>
                <p className="text-2xl font-bold">
                  {beta > 1.5 ? 'High' : beta > 1 ? 'Above Average' : beta > 0.5 ? 'Average' : 'Low'}
                </p>
              </div>
              <div>
                <p className="text-[#868f97] text-sm mb-1">Volatility</p>
                <p className="text-2xl font-bold">
                  {beta > 1 ? 'More than Market' : beta < 1 ? 'Less than Market' : 'Same as Market'}
                </p>
              </div>
            </div>
          </div>

          {/* Understanding Beta */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Understanding {symbol} Beta</h2>
            <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 space-y-4 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
              <div>
                <h3 className="font-bold text-lg mb-2">What Beta Measures</h3>
                <p className="text-[#868f97]">
                  Beta measures {symbol}'s volatility relative to the overall market. A beta of <span className="tabular-nums">{beta.toFixed(2)}</span> means
                  {beta > 1 ? ` ${symbol} tends to move ${((beta - 1) * 100).toFixed(0)}% more than the market.` :
                   beta < 1 ? ` ${symbol} tends to move ${((1 - beta) * 100).toFixed(0)}% less than the market.` :
                   ` ${symbol} tends to move in line with the market.`}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Investment Implications</h3>
                <p className="text-[#868f97]">
                  {beta > 1 ?
                    `High beta stocks like ${symbol} offer greater upside potential during bull markets but also carry higher downside risk during market corrections.` :
                    `Low beta stocks like ${symbol} provide more stability and are often preferred by conservative investors seeking lower volatility.`}
                </p>
              </div>
            </div>
          </section>

          {/* Beta Interpretation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-balance">Beta Interpretation Guide</h2>
            <div className="grid gap-4">
              {[
                { range: '> 1.5', meaning: 'High Risk', desc: 'Significantly more volatile than market' },
                { range: '1.0 - 1.5', meaning: 'Above Average Risk', desc: 'More volatile than market' },
                { range: '0.5 - 1.0', meaning: 'Average Risk', desc: 'Moderately volatile' },
                { range: '< 0.5', meaning: 'Low Risk', desc: 'Less volatile than market' },
                { range: '< 0', meaning: 'Negative Correlation', desc: 'Moves opposite to market' },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-4 flex justify-between items-center hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <div>
                    <p className="font-bold tabular-nums">{item.range}</p>
                    <p className="text-sm text-[#868f97]">{item.desc}</p>
                  </div>
                  <p className="text-sm font-medium">{item.meaning}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 text-center mb-12 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
            <h2 className="text-2xl font-bold mb-4 text-balance">Complete Risk Analysis</h2>
            <p className="text-[#868f97] mb-6">View full volatility metrics and technical analysis for {symbol}</p>
            <Link href={`/dashboard?ticker=${symbol}&tab=technical`} className="inline-block bg-[#479ffa] hover:bg-[#479ffa]/80 text-white px-8 py-3 rounded-2xl font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
              View Full Analysis
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {betaFaqs.map((faq, i) => (
                <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-[#868f97]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <RelatedLinks ticker={symbol} currentPage="beta" companyName={companyName} />
        </div>
      </main>
    </>
  )
}
