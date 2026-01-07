import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'
import FDACalendarClient from './FDACalendarClient'

export const metadata: Metadata = {
  title: 'FDA Calendar 2025 - PDUFA Dates, Drug Approvals & Biotech Catalysts | Lician',
  description: 'Track FDA approval dates, PDUFA deadlines, and biotech catalysts in 2025. Real-time calendar of clinical trial readouts, FDA decisions, and drug approval milestones for biotech investors.',
  keywords: [
    'FDA calendar',
    'PDUFA dates',
    'FDA approval dates',
    'biotech catalysts',
    'drug approvals 2025',
    'FDA drug calendar',
    'clinical trial dates',
    'biotech catalyst calendar',
    'FDA decision dates',
    'pharmaceutical approvals',
    'Phase 3 readouts',
    'biotech events',
    'drug approval tracker',
    'FDA review dates',
    'biotech stock catalysts'
  ],
  openGraph: {
    title: 'FDA Calendar 2025 - PDUFA Dates & Drug Approvals',
    description: 'Track FDA approval dates, PDUFA deadlines, and biotech catalysts. Real-time calendar of drug approval milestones for biotech investors.',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lician.com/biotech/fda-calendar',
  },
}

const pdufa = {
  title: 'What is a PDUFA Date?',
  content: `PDUFA (Prescription Drug User Fee Act) dates are FDA-mandated deadlines for drug application reviews. When a pharmaceutical company submits a New Drug Application (NDA) or Biologics License Application (BLA), the FDA assigns a PDUFA date - typically 10-12 months after submission for standard reviews, or 6 months for priority reviews.

The FDA must issue a decision by this date: approval, rejection (Complete Response Letter), or request for additional information. PDUFA dates are critical catalysts for biotech stocks, often causing 20-100%+ price movements depending on the outcome.`,
}

const fdaDesignations = [
  {
    name: 'Priority Review',
    timeline: '6 months',
    description: 'Granted for drugs treating serious conditions with significant improvement over existing treatments',
    impact: 'Accelerates review by 4+ months',
  },
  {
    name: 'Breakthrough Therapy',
    timeline: 'Expedited',
    description: 'For drugs showing substantial improvement over available therapy in preliminary clinical evidence',
    impact: 'Intensive FDA guidance, rolling review',
  },
  {
    name: 'Fast Track',
    timeline: 'Rolling Review',
    description: 'For drugs treating serious conditions and filling unmet medical needs',
    impact: 'Rolling review, earlier interactions with FDA',
  },
  {
    name: 'Accelerated Approval',
    timeline: 'Varies',
    description: 'Based on surrogate endpoints reasonably likely to predict clinical benefit',
    impact: 'Earlier approval with post-marketing studies',
  },
  {
    name: 'Orphan Drug',
    timeline: 'Standard',
    description: 'For drugs treating rare diseases affecting fewer than 200,000 patients in the US',
    impact: '7 years market exclusivity, tax credits, fee waivers',
  },
]

const catalystTypes = [
  {
    type: 'PDUFA Date',
    description: 'FDA deadline to make a decision on drug application',
    typicalMove: '30-100%+',
    timing: 'Set date, usually announced',
  },
  {
    type: 'AdCom Meeting',
    description: 'FDA Advisory Committee meeting to vote on drug approval',
    typicalMove: '20-50%',
    timing: '2-3 months before PDUFA',
  },
  {
    type: 'Phase 3 Readout',
    description: 'Results from pivotal Phase 3 clinical trial',
    typicalMove: '50-200%',
    timing: 'Variable, based on trial design',
  },
  {
    type: 'Interim Analysis',
    description: 'Early look at trial data, often for safety or futility',
    typicalMove: '20-50%',
    timing: 'Per protocol, often unannounced',
  },
  {
    type: 'Complete Response Letter',
    description: 'FDA rejection requiring additional data or changes',
    typicalMove: '-30-70%',
    timing: 'At PDUFA date if rejected',
  },
]

const investingTips = [
  {
    tip: 'Track the Calendar',
    description: 'Monitor PDUFA dates and trial readouts weeks in advance. Stocks often run up into catalysts.',
  },
  {
    tip: 'Assess AdCom Votes',
    description: 'FDA Advisory Committee votes often predict approval. Positive AdCom = 85%+ approval rate.',
  },
  {
    tip: 'Position Sizing',
    description: 'Binary events require disciplined sizing. Never bet more than you can afford to lose on a single catalyst.',
  },
  {
    tip: 'Watch for Delays',
    description: 'CRL (rejection) or delays are common. Have exit plans for both outcomes.',
  },
  {
    tip: 'Compare to Peers',
    description: 'Prior FDA decisions for similar drugs/indications inform likelihood of approval.',
  },
]

const faqs = [
  {
    question: 'What is a PDUFA date and why does it matter for biotech stocks?',
    answer: 'A PDUFA (Prescription Drug User Fee Act) date is the FDA\'s deadline to make a decision on a drug application. It matters because biotech stocks can move 30-100%+ on FDA decisions. PDUFA dates create binary events where approval can double a stock, while rejection (Complete Response Letter) can cause 50%+ declines. Investors closely track these dates for trading opportunities and risk management.',
  },
  {
    question: 'How do I find upcoming FDA approval dates?',
    answer: 'You can track FDA approval dates through FDA.gov\'s official calendar, company investor relations pages, clinical trial databases (ClinicalTrials.gov), biotech news sites (FierceBiotech, Endpoints News), and specialized services like our FDA Calendar above. Companies typically announce PDUFA dates in press releases when they file their NDA/BLA applications.',
  },
  {
    question: 'What happens after a PDUFA date passes?',
    answer: 'By the PDUFA date, the FDA must issue one of three responses: 1) Approval - the drug can be marketed, 2) Complete Response Letter (CRL) - rejection requiring additional data, clinical trials, or manufacturing changes, or 3) Extension - FDA requests more time for review (rare). The FDA typically announces decisions on or before the PDUFA date, often during trading hours.',
  },
  {
    question: 'What is a Complete Response Letter (CRL)?',
    answer: 'A Complete Response Letter (CRL) is an FDA rejection of a drug application. The letter outlines deficiencies that must be addressed before approval - this could include additional clinical trials, manufacturing changes, labeling updates, or safety concerns. CRLs typically cause 30-70% stock declines. Companies can resubmit after addressing FDA concerns, creating new PDUFA dates 6-12 months later.',
  },
  {
    question: 'Should I buy biotech stocks before or after PDUFA dates?',
    answer: 'This depends on your risk tolerance. Buying before offers higher upside (50-100%+) but risks major losses on rejection. Buying after positive decisions offers lower upside (10-30%) but confirms the drug works. Conservative investors buy post-approval, while aggressive traders position before catalysts. Consider using options for defined-risk binary bets, and never risk more than 5% of your portfolio on a single PDUFA event.',
  },
  {
    question: 'What FDA designations accelerate drug approval?',
    answer: 'Key FDA designations that accelerate approval include: Priority Review (6 months vs 10 months standard), Breakthrough Therapy (intensive FDA guidance, rolling review), Fast Track (rolling review, earlier FDA interactions), and Accelerated Approval (based on surrogate endpoints). These designations indicate FDA urgency and often increase approval probability. Stocks typically rally 15-40% on receiving these designations.',
  },
  {
    question: 'How accurate are FDA Advisory Committee (AdCom) votes?',
    answer: 'FDA Advisory Committee recommendations are highly predictive. Historically, drugs with positive AdCom votes (majority favor approval) receive FDA approval 85%+ of the time. However, the FDA is not bound by AdCom recommendations. Negative AdCom votes are strongly predictive of rejection. AdCom meetings typically occur 2-3 months before PDUFA dates and can cause 20-50% stock movements.',
  },
  {
    question: 'What is the difference between NDA and BLA?',
    answer: 'NDA (New Drug Application) is for small molecule drugs - traditional pills and tablets made through chemical synthesis. BLA (Biologics License Application) is for biologics - larger, complex molecules derived from living cells, including antibodies, vaccines, and cell therapies. The review process is similar, but biologics face additional manufacturing complexity. Both have PDUFA dates and similar approval timelines.',
  },
]

export default function FDACalendarPage() {
  const pageUrl = `${SITE_URL}/biotech/fda-calendar`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Biotech', url: `${SITE_URL}/biotech` },
    { name: 'FDA Calendar', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'FDA Calendar 2025 - PDUFA Dates, Drug Approvals & Biotech Catalysts',
    description: 'Track FDA approval dates, PDUFA deadlines, and biotech catalysts. Real-time calendar of drug approval milestones.',
    url: pageUrl,
    keywords: ['FDA calendar', 'PDUFA dates', 'drug approvals', 'biotech catalysts'],
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]) }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
              {/* Breadcrumb */}
              <nav className="text-sm text-muted-foreground mb-6">
                <Link href="/" className="hover:text-foreground">Home</Link>
                {' / '}
                <Link href="/biotech" className="hover:text-foreground">Biotech</Link>
                {' / '}
                <span>FDA Calendar</span>
              </nav>

              {/* Header */}
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                FDA Calendar 2025
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Track PDUFA dates, FDA drug approvals, and biotech catalysts. Real-time calendar of clinical trial
                readouts and approval milestones for pharmaceutical and biotech stocks.
              </p>

              {/* Interactive Calendar */}
              <section className="mb-12">
                <FDACalendarClient />
              </section>

              {/* What is PDUFA */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">What is a PDUFA Date?</h2>
                <div className="bg-card p-6 rounded-xl border border-border">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {pdufa.content}
                  </p>
                </div>
              </section>

              {/* FDA Designations */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">FDA Expedited Designations</h2>
                <p className="text-muted-foreground mb-6">
                  The FDA offers several programs to accelerate drug development and review for serious conditions:
                </p>
                <div className="space-y-4">
                  {fdaDesignations.map((designation, i) => (
                    <div key={i} className="bg-card p-5 rounded-xl border border-border">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <h3 className="text-lg font-bold">{designation.name}</h3>
                        <span className="text-sm text-green-500 font-medium">{designation.timeline}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{designation.description}</p>
                      <p className="text-sm">
                        <span className="font-medium text-green-500">Impact: </span>
                        <span className="text-muted-foreground">{designation.impact}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Catalyst Types */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Types of Biotech Catalysts</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Catalyst Type</th>
                        <th className="text-left py-3 px-4 font-medium">Description</th>
                        <th className="text-left py-3 px-4 font-medium">Typical Move</th>
                        <th className="text-left py-3 px-4 font-medium">Timing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catalystTypes.map((catalyst, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-3 px-4 font-medium">{catalyst.type}</td>
                          <td className="py-3 px-4 text-muted-foreground">{catalyst.description}</td>
                          <td className="py-3 px-4 text-green-500 font-medium">{catalyst.typicalMove}</td>
                          <td className="py-3 px-4 text-muted-foreground">{catalyst.timing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Investment Tips */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Trading FDA Catalysts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {investingTips.map((item, i) => (
                    <div key={i} className="bg-card p-5 rounded-xl border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-green-500">{i + 1}</span>
                        </div>
                        <h3 className="font-bold">{item.tip}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <details key={i} className="bg-card p-6 rounded-xl border border-border group">
                      <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                        <span>{faq.question}</span>
                        <span className="text-green-500 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="text-muted-foreground mt-4 leading-relaxed">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section className="bg-gradient-to-br from-green-600/20 to-green-600/5 p-8 rounded-xl border border-green-500/20 text-center mb-12">
                <h2 className="text-2xl font-bold mb-4">Track Biotech Catalysts with AI</h2>
                <p className="text-muted-foreground mb-6">
                  Get comprehensive analysis, catalyst tracking, and price predictions for biotech stocks
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/biotech"
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Biotech Analysis
                  </Link>
                  <Link
                    href="/screener"
                    className="bg-secondary hover:bg-secondary/80 px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Stock Screener
                  </Link>
                </div>
              </section>

              {/* Related Links */}
              <section className="border-t border-border pt-8">
                <h3 className="text-lg font-bold mb-4">Related Pages</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href="/biotech" className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-center text-sm">
                    Biotech Catalysts
                  </Link>
                  <Link href="/earnings" className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-center text-sm">
                    Earnings Calendar
                  </Link>
                  <Link href="/sectors/healthcare" className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-center text-sm">
                    Healthcare Sector
                  </Link>
                  <Link href="/screener" className="px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors text-center text-sm">
                    Stock Screener
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
