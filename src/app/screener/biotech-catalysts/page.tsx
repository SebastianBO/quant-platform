import { Metadata } from 'next'

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'
import BiotechScreenerClient from './BiotechScreenerClient'

export const metadata: Metadata = {
  title: 'Biotech Stock Screener - Find Stocks with FDA Catalysts 2025 | Lician',
  description: 'Screen biotech and pharmaceutical stocks by upcoming FDA catalysts, PDUFA dates, clinical trial readouts, and Phase 3 trials. Find high-impact biotech investment opportunities.',
  keywords: [
    'biotech stock screener',
    'biotech screener',
    'FDA catalyst screener',
    'pharmaceutical stock scanner',
    'clinical trial stock screener',
    'Phase 3 trial stocks',
    'PDUFA date screener',
    'biotech catalyst finder',
    'drug approval stocks',
    'biotech stock scanner',
    'pharma stock screener',
    'biotech investment screener',
    'FDA approval screener',
    'biotech stocks with catalysts',
    'clinical trial investing'
  ],
  openGraph: {
    title: 'Biotech Stock Screener - FDA Catalysts & Clinical Trials',
    description: 'Screen biotech stocks by upcoming FDA catalysts, PDUFA dates, and Phase 3 trials. Find high-impact investment opportunities.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://lician.com/screener/biotech-catalysts',
  },
}

const screeningStrategies = [
  {
    name: 'High-Impact Imminent',
    description: 'Stocks with high-impact catalysts within 90 days',
    filters: 'High Impact + Within 90 Days',
    risk: 'Very High',
    reward: '50-200%+',
    strategy: 'Binary event trading with defined risk position sizing',
  },
  {
    name: 'Phase 3 Pipeline',
    description: 'Companies with Phase 3 trials - highest probability of FDA approval',
    filters: 'Phase 3 Only',
    risk: 'High',
    reward: '30-100%',
    strategy: 'Focus on late-stage assets with strong Phase 2 data',
  },
  {
    name: 'Catalyst Density',
    description: 'Companies with multiple catalysts - more chances to win',
    filters: 'Min Catalysts: 3+',
    risk: 'Medium-High',
    reward: '20-50%',
    strategy: 'Diversified pipeline plays with multiple shots on goal',
  },
  {
    name: 'Near-Term Movers',
    description: 'Stocks with events in the next 30 days',
    filters: 'Sort by Next Event (ascending)',
    risk: 'Very High',
    reward: 'Variable',
    strategy: 'Short-term catalyst plays with tight risk management',
  },
]

const keyMetrics = [
  {
    metric: 'Catalyst Count',
    description: 'Total number of upcoming FDA events, trial readouts, and milestones for the company',
    importance: 'More catalysts = more chances for positive surprises',
  },
  {
    metric: 'Imminent Events',
    description: 'Catalysts expected within the next 90 days',
    importance: 'Near-term events drive immediate stock movement',
  },
  {
    metric: 'Phase 3 Trials',
    description: 'Late-stage trials with highest FDA approval probability (25-30%)',
    importance: 'Phase 3 success often leads to FDA approval within 12-18 months',
  },
  {
    metric: 'Days Until',
    description: 'Time until the nearest catalyst event',
    importance: 'Stocks often run up 2-4 weeks before major catalysts',
  },
  {
    metric: 'Impact Level',
    description: 'Expected stock price impact based on catalyst type and phase',
    importance: 'High-impact events can move stocks 50-200%',
  },
]

const faqs = [
  {
    question: 'How do I use the biotech stock screener?',
    answer: 'The biotech screener helps you find pharmaceutical and biotechnology stocks with upcoming FDA catalysts. Use filters to narrow by: imminent events (within 90 days), high-impact catalysts, Phase 3 trials, or minimum catalyst count. Click on any stock row to see its detailed catalyst timeline. Sort by different columns to find stocks matching your investment strategy.',
  },
  {
    question: 'What catalysts does this screener track?',
    answer: 'The screener tracks FDA approval decisions (PDUFA dates), clinical trial readouts (Phase 1/2/3), interim data analyses, regulatory designations (Breakthrough, Fast Track), and other pipeline milestones. Data is sourced from ClinicalTrials.gov, FDA filings, and company announcements. Each catalyst is rated by importance (HIGH/MEDIUM/LOW) based on its potential stock price impact.',
  },
  {
    question: 'Should I invest in stocks with imminent catalysts?',
    answer: 'Imminent catalysts (within 90 days) offer high reward potential but also high risk. Positive Phase 3 results can double a stock, while failures can cause 50-70% crashes. Consider: 1) Position size appropriately (max 5% per binary bet), 2) Use options for defined risk, 3) Diversify across multiple biotech names, 4) Research the trial design and competitive landscape before investing.',
  },
  {
    question: 'What makes a biotech catalyst "high impact"?',
    answer: 'High-impact catalysts typically include: Phase 3 pivotal trial readouts, FDA approval decisions (PDUFA dates), major label expansions, and Breakthrough Therapy designations. Impact is determined by: trial phase (Phase 3 > Phase 2 > Phase 1), market size of the indication, competitive landscape, and historical stock volatility around similar events.',
  },
  {
    question: 'How do I reduce risk when trading biotech catalysts?',
    answer: 'Risk management strategies include: 1) Limit position size to 3-5% of portfolio per binary event, 2) Use options instead of stock for defined maximum loss, 3) Spread risk across 5-10 biotech names, 4) Focus on companies with multiple catalysts (more shots on goal), 5) Consider selling partial positions before binary events to lock in gains, 6) Set stop losses at predetermined levels.',
  },
  {
    question: 'What is the best biotech screening strategy?',
    answer: 'The optimal strategy depends on your risk tolerance. Conservative: Screen for Phase 3 stocks with multiple catalysts and proven management. Moderate: Filter for high-impact events 60-90 days out, buying the anticipation. Aggressive: Trade imminent catalysts (30 days or less) with tight position sizing. Most successful biotech investors combine strategies and diversify across multiple names and therapeutic areas.',
  },
  {
    question: 'How often is the catalyst data updated?',
    answer: 'Catalyst data is refreshed from ClinicalTrials.gov and FDA sources regularly. Trial completion dates may shift based on enrollment and protocol amendments. Always verify critical dates with company investor relations or SEC filings before making investment decisions. Setting calendar alerts for key dates helps you stay informed.',
  },
  {
    question: 'What does "Phase 3" mean for biotech stocks?',
    answer: 'Phase 3 is the final stage of clinical trials before FDA submission. It involves 300-3,000+ patients and tests whether the drug is effective and safe for the intended population. Phase 3 trials have a 25-30% success rate - higher than earlier phases. Positive Phase 3 results often lead to FDA approval within 12-18 months and can cause 50-200% stock appreciation.',
  },
]

export default function BiotechScreenerPage() {
  const pageUrl = `${SITE_URL}/screener/biotech-catalysts`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Screener', url: `${SITE_URL}/screener` },
    { name: 'Biotech Catalysts', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Biotech Stock Screener - Find Stocks with FDA Catalysts',
    description: 'Screen biotech and pharmaceutical stocks by upcoming FDA catalysts, PDUFA dates, and clinical trial readouts.',
    url: pageUrl,
    keywords: ['biotech screener', 'FDA catalysts', 'clinical trials', 'biotech stocks'],
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]) }}
      />
      <main className="min-h-screen bg-black text-foreground pt-20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <nav className="text-sm text-[#868f97] mb-6">
                <Link href="/" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">Home</Link>
                {' / '}
                <Link href="/screener" className="hover:text-white motion-safe:transition-colors motion-safe:duration-150 ease-out">Screener</Link>
                {' / '}
                <span>Biotech Catalysts</span>
              </nav>

              {/* Header */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
                Biotech Stock Screener
              </h1>
              <p className="text-xl text-[#868f97] mb-8">
                Screen biotech and pharmaceutical stocks by FDA catalysts, PDUFA dates, and clinical trial readouts.
                Find high-impact investment opportunities in biotechnology.
              </p>

              {/* Interactive Screener */}
              <section className="mb-12">
                <BiotechScreenerClient />
              </section>

              {/* Screening Strategies */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-balance">Biotech Screening Strategies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {screeningStrategies.map((strategy, i) => (
                    <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                      <h3 className="text-lg font-bold mb-2">{strategy.name}</h3>
                      <p className="text-sm text-[#868f97] mb-3">{strategy.description}</p>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-[#868f97]">Filters:</span>
                          <span className="font-medium text-[#4ebe96]">{strategy.filters}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#868f97]">Risk:</span>
                          <span className={`font-medium ${
                            strategy.risk === 'Very High' ? 'text-[#ff5c5c]' :
                            strategy.risk === 'High' ? 'text-[#ffa16c]' :
                            'text-[#ffa16c]'
                          }`}>{strategy.risk}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#868f97]">Potential Reward:</span>
                          <span className="font-medium text-[#4ebe96] tabular-nums">{strategy.reward}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#868f97] border-t border-white/[0.08] pt-3">
                        <span className="font-medium">Strategy: </span>{strategy.strategy}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Key Metrics */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-balance">Understanding Screener Metrics</h2>
                <div className="space-y-4">
                  {keyMetrics.map((item, i) => (
                    <div key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-5 motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                      <h3 className="text-lg font-bold text-[#4ebe96] mb-2">{item.metric}</h3>
                      <p className="text-sm text-[#868f97] mb-2">{item.description}</p>
                      <p className="text-sm">
                        <span className="font-medium">Why it matters: </span>
                        <span className="text-[#868f97]">{item.importance}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Risk Warning */}
              <section className="mb-12">
                <div className="bg-gradient-to-br from-[#ff5c5c]/10 to-[#ff5c5c]/5 p-6 rounded-2xl border border-[#ff5c5c]/20">
                  <h3 className="text-lg font-bold text-[#ff5c5c] mb-3">Biotech Investment Risk Warning</h3>
                  <p className="text-sm text-[#868f97] mb-4">
                    Biotech stocks are among the most volatile investments. Clinical trials have high failure rates
                    (only <span className="tabular-nums">10%</span> of drugs in Phase 1 reach FDA approval), and binary events can cause <span className="tabular-nums">50-70%</span> losses
                    overnight. This screener is for educational purposes only and does not constitute investment advice.
                  </p>
                  <ul className="text-sm text-[#868f97] space-y-1">
                    <li>• Never invest more than you can afford to lose in any single biotech position</li>
                    <li>• Diversify across multiple stocks, therapeutic areas, and development stages</li>
                    <li>• Consider using options for defined-risk binary event exposure</li>
                    <li>• Conduct thorough due diligence beyond this screener data</li>
                  </ul>
                </div>
              </section>

              {/* FAQs */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-balance">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <details key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 group motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-white/[0.05] hover:border-white/[0.15]">
                      <summary className="font-bold cursor-pointer list-none flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] rounded">
                        <span>{faq.question}</span>
                        <span className="text-[#4ebe96] group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-150 ease-out">▼</span>
                      </summary>
                      <p className="text-[#868f97] mt-4 leading-relaxed">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-[#4ebe96]/20 to-[#4ebe96]/5 p-8 rounded-2xl border border-[#4ebe96]/20 text-center mb-12">
                <h2 className="text-2xl font-bold mb-4 text-balance">Track More Biotech Catalysts</h2>
                <p className="text-[#868f97] mb-6">
                  View the full FDA calendar and get detailed stock analysis for any biotech company
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/biotech/fda-calendar"
                    className="bg-[#4ebe96] hover:bg-[#4ebe96]/90 text-white px-6 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                  >
                    FDA Calendar
                  </Link>
                  <Link
                    href="/biotech"
                    className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] px-6 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                  >
                    Biotech Overview
                  </Link>
                  <Link
                    href="/screener"
                    className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] px-6 py-3 rounded-lg font-medium motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96]"
                  >
                    General Screener
                  </Link>
                </div>
              </section>

              {/* Related Links */}
              <section className="border-t border-white/[0.08] pt-8">
                <h3 className="text-lg font-bold mb-4">Related Screeners & Tools</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href="/screener" className="px-4 py-2 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center text-sm focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                    Stock Screener
                  </Link>
                  <Link href="/biotech/fda-calendar" className="px-4 py-2 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center text-sm focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                    FDA Calendar
                  </Link>
                  <Link href="/biotech" className="px-4 py-2 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center text-sm focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                    Biotech Catalysts
                  </Link>
                  <Link href="/earnings" className="px-4 py-2 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-lg hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out text-center text-sm focus-visible:ring-2 focus-visible:ring-[#4ebe96]">
                    Earnings Calendar
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
