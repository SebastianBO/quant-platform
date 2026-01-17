import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getItemListSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import SEOSidebar from '@/components/SEOSidebar'

export const metadata: Metadata = {
  title: 'Biotech Catalysts 2025 - FDA Approvals, Clinical Trials & Pharma Stocks | Lician',
  description: 'Track biotech catalysts including FDA approvals, clinical trial results, and drug pipeline updates. Expert analysis of biotech stocks like MRNA, REGN, VRTX, BIIB, and GILD with AI-powered insights.',
  keywords: [
    'biotech stocks',
    'biotech catalysts',
    'FDA approvals',
    'clinical trials',
    'pharma stocks',
    'drug approvals',
    'biotechnology investing',
    'pharmaceutical stocks',
    'Phase 1 trials',
    'Phase 2 trials',
    'Phase 3 trials',
    'biotech pipeline',
    'drug development',
    'biotech investments',
    'healthcare stocks'
  ],
  openGraph: {
    title: 'Biotech Catalysts 2025 - FDA Approvals & Clinical Trials',
    description: 'Track biotech catalysts, FDA approvals, and clinical trial results. Expert analysis of top biotech and pharma stocks.',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lician.com/biotech',
  },
}

const biotechStocks = [
  {
    ticker: 'MRNA',
    name: 'Moderna',
    rank: 1,
    focus: 'mRNA therapeutics and vaccines',
    pipeline: ['Cancer vaccines', 'Flu vaccines', 'RSV vaccines', 'Personalized cancer therapy'],
    catalysts: 'Expanding mRNA platform beyond COVID-19',
  },
  {
    ticker: 'REGN',
    name: 'Regeneron',
    rank: 2,
    focus: 'Monoclonal antibodies and biologics',
    pipeline: ['Eye diseases', 'Cancer immunotherapy', 'Inflammatory diseases', 'Dupixent expansion'],
    catalysts: 'Strong drug pipeline and FDA approvals',
  },
  {
    ticker: 'VRTX',
    name: 'Vertex Pharmaceuticals',
    rank: 3,
    focus: 'Cystic fibrosis and rare diseases',
    pipeline: ['CF therapies', 'Gene editing', 'Type 1 diabetes', 'Pain therapies'],
    catalysts: 'Dominant CF franchise and gene therapy expansion',
  },
  {
    ticker: 'BIIB',
    name: 'Biogen',
    rank: 4,
    focus: 'Neurology and neurodegenerative diseases',
    pipeline: ['Alzheimer\'s disease', 'Multiple sclerosis', 'ALS', 'Depression'],
    catalysts: 'Leqembi Alzheimer\'s drug commercialization',
  },
  {
    ticker: 'GILD',
    name: 'Gilead Sciences',
    rank: 5,
    focus: 'Antivirals and oncology',
    pipeline: ['HIV treatments', 'Cancer therapies', 'Liver diseases', 'Cell therapy'],
    catalysts: 'HIV dominance and oncology expansion',
  },
  {
    ticker: 'AMGN',
    name: 'Amgen',
    rank: 6,
    focus: 'Biologics and biosimilars',
    pipeline: ['Oncology', 'Cardiovascular', 'Inflammation', 'Biosimilars'],
    catalysts: 'Stable biologics franchise and biosimilar growth',
  },
  {
    ticker: 'BNTX',
    name: 'BioNTech',
    rank: 7,
    focus: 'mRNA oncology and infectious diseases',
    pipeline: ['Cancer vaccines', 'Malaria vaccine', 'TB vaccine', 'Flu vaccines'],
    catalysts: 'Oncology pipeline and mRNA platform expansion',
  },
  {
    ticker: 'SGEN',
    name: 'Seagen (Pfizer)',
    rank: 8,
    focus: 'Antibody-drug conjugates',
    pipeline: ['Cancer ADCs', 'Solid tumors', 'Hematology', 'Novel targets'],
    catalysts: 'Pfizer acquisition and ADC technology',
  },
]

const catalystTypes = [
  {
    type: 'FDA Approvals',
    icon: '✅',
    description: 'New drug approvals can lead to significant revenue and stock appreciation',
    examples: ['New Drug Application (NDA)', 'Biologics License Application (BLA)', 'Priority Review', 'Breakthrough Therapy'],
    impact: 'High - Can double or triple stock price',
  },
  {
    type: 'Clinical Trial Results',
    icon: '🔬',
    description: 'Positive Phase 2/3 data drives investor confidence and validates drug potential',
    examples: ['Phase 3 success', 'Interim analysis', 'Trial expansion', 'Endpoint achievement'],
    impact: 'High - 20-100%+ stock movement',
  },
  {
    type: 'Pipeline Updates',
    icon: '💊',
    description: 'New indications, partnerships, and acquisitions expand market opportunity',
    examples: ['Label expansion', 'New indication', 'Combination therapy', 'IND filing'],
    impact: 'Medium - 10-30% stock movement',
  },
  {
    type: 'Regulatory Milestones',
    icon: '📋',
    description: 'Fast Track, Orphan Drug, and Breakthrough designations accelerate development',
    examples: ['Fast Track', 'Orphan Drug', 'Breakthrough Therapy', 'Accelerated Approval'],
    impact: 'Medium - 15-40% stock movement',
  },
  {
    type: 'Commercial Performance',
    icon: '📈',
    description: 'Drug sales exceeding expectations validates market demand and pricing',
    examples: ['Blockbuster status', 'Market share gains', 'International expansion', 'Reimbursement wins'],
    impact: 'Medium - Sustained growth',
  },
  {
    type: 'M&A Activity',
    icon: '🤝',
    description: 'Acquisitions, partnerships, and licensing deals validate technology and expand reach',
    examples: ['Buyout offers', 'Strategic partnerships', 'Licensing deals', 'Collaboration agreements'],
    impact: 'Very High - 30-100%+ premium',
  },
]

const clinicalTrialPhases = [
  {
    phase: 'Phase 1',
    focus: 'Safety & Dosage',
    participants: '20-100 healthy volunteers',
    duration: 'Several months',
    successRate: '~70%',
    description: 'Tests drug safety, dosage range, side effects, and how the body processes the drug. First human testing.',
  },
  {
    phase: 'Phase 2',
    focus: 'Efficacy & Side Effects',
    participants: '100-300 patients with disease',
    duration: '6 months - 2 years',
    successRate: '~33%',
    description: 'Evaluates if the drug works for its intended purpose, optimal dosing, and short-term side effects in patients.',
  },
  {
    phase: 'Phase 3',
    focus: 'Confirmation & Comparison',
    participants: '300-3,000 patients',
    duration: '1-4 years',
    successRate: '~25-30%',
    description: 'Large-scale testing to confirm effectiveness, monitor side effects, compare to standard treatments, and collect data for safe use.',
  },
  {
    phase: 'Phase 4',
    focus: 'Post-Market Surveillance',
    participants: 'Thousands of patients',
    duration: 'Ongoing',
    successRate: 'N/A',
    description: 'Monitors long-term effectiveness and safety after FDA approval and commercial launch. Identifies rare side effects.',
  },
]

const fdaApprovalProcess = [
  {
    step: 'Preclinical Research',
    duration: '3-6 years',
    description: 'Laboratory and animal testing to assess safety and biological activity',
  },
  {
    step: 'IND Application',
    duration: '30 days',
    description: 'Investigational New Drug application filed with FDA to begin human trials',
  },
  {
    step: 'Phase 1-3 Trials',
    duration: '6-7 years',
    description: 'Clinical trials in humans to test safety, efficacy, and optimal dosing',
  },
  {
    step: 'NDA/BLA Filing',
    duration: '6-10 months',
    description: 'New Drug Application or Biologics License Application submitted to FDA',
  },
  {
    step: 'FDA Review',
    duration: '6-12 months',
    description: 'FDA reviews all data, may request additional information or advisory committee review',
  },
  {
    step: 'Approval & Launch',
    duration: 'Ongoing',
    description: 'FDA approves drug for marketing, Phase 4 studies monitor long-term safety',
  },
]

const investmentRisks = [
  {
    risk: 'Clinical Trial Failure',
    severity: 'Very High',
    description: 'Most drugs fail in trials - only 10% make it from Phase 1 to approval. Failed trials can crash stock prices 50-90%.',
    mitigation: 'Diversify across multiple biotech stocks, focus on later-stage assets, avoid binary bets',
  },
  {
    risk: 'Regulatory Rejection',
    severity: 'High',
    description: 'FDA can reject drug applications due to safety concerns, efficacy issues, or manufacturing problems.',
    mitigation: 'Look for Fast Track/Breakthrough designations, strong Phase 3 data, and experienced management',
  },
  {
    risk: 'Commercial Failure',
    severity: 'High',
    description: 'Approved drugs may not achieve blockbuster sales due to competition, pricing, or physician adoption.',
    mitigation: 'Analyze market size, competitive landscape, pricing power, and reimbursement environment',
  },
  {
    risk: 'Patent Expiration',
    severity: 'Medium',
    description: 'Loss of patent protection enables generic/biosimilar competition, eroding sales and margins.',
    mitigation: 'Invest in companies with robust pipelines, lifecycle management strategies, and patent protection',
  },
  {
    risk: 'Valuation Risk',
    severity: 'Medium',
    description: 'Biotech stocks trade at high multiples based on future expectations. Disappointments lead to sharp selloffs.',
    mitigation: 'Avoid overpaying for potential, use DCF analysis, maintain position sizing discipline',
  },
  {
    risk: 'Binary Events',
    severity: 'Very High',
    description: 'Single trial results or FDA decisions can make or break a company, creating extreme volatility.',
    mitigation: 'Size positions appropriately, use stop losses, consider options strategies for defined risk',
  },
]

const faqs = [
  {
    question: 'What are biotech catalysts?',
    answer: 'Biotech catalysts are events that can significantly impact a biotech stock\'s price, including FDA approvals, clinical trial results, pipeline updates, regulatory milestones, M&A activity, and commercial performance. These events create binary outcomes where stocks can move 20-100%+ based on positive or negative results. Key catalysts include Phase 3 trial data readouts, FDA approval decisions, label expansions, and partnership announcements.',
  },
  {
    question: 'How does the FDA drug approval process work?',
    answer: 'The FDA drug approval process takes 10-15 years on average. It starts with preclinical research (3-6 years), followed by an IND application to begin human trials. Phase 1 tests safety in healthy volunteers, Phase 2 evaluates efficacy in patients, and Phase 3 confirms effectiveness in large trials. After successful trials, companies file an NDA or BLA, which the FDA reviews for 6-12 months before approving or rejecting. Post-approval Phase 4 studies monitor long-term safety.',
  },
  {
    question: 'What are the different clinical trial phases?',
    answer: 'Clinical trials have 4 phases. Phase 1 (20-100 people, 70% success rate) tests safety and dosing in healthy volunteers. Phase 2 (100-300 patients, 33% success rate) evaluates if the drug works and identifies side effects. Phase 3 (300-3,000 patients, 25-30% success rate) confirms effectiveness versus standard treatments in large-scale studies. Phase 4 is post-approval monitoring of long-term safety in thousands of patients. Each phase failure can result in 50-90% stock declines.',
  },
  {
    question: 'What are the best biotech stocks to buy?',
    answer: 'Top biotech stocks include Moderna (MRNA) for mRNA platform expansion, Regeneron (REGN) for antibody therapeutics, Vertex (VRTX) for cystic fibrosis dominance, Biogen (BIIB) for Alzheimer\'s treatment, and Gilead (GILD) for HIV and oncology. Best stocks have robust pipelines, multiple revenue-generating drugs, late-stage assets, strong balance sheets, and proven R&D capabilities. Avoid single-product companies with near-term patent expirations.',
  },
  {
    question: 'How risky is biotech investing?',
    answer: 'Biotech investing is very high risk due to binary clinical trial outcomes, regulatory uncertainty, and high failure rates. Only 10% of drugs that enter Phase 1 trials reach FDA approval. Failed trials can result in 50-90% stock crashes, while successful approvals can double or triple stock prices. Key risks include clinical failure, FDA rejection, commercial underperformance, patent expiration, and valuation compression. Mitigate risk through diversification, position sizing, and focus on later-stage assets.',
  },
  {
    question: 'What is a blockbuster drug in biotech?',
    answer: 'A blockbuster drug generates $1 billion+ in annual sales. Examples include Humira ($20B+ at peak), Keytruda (Merck cancer drug, $25B+), and Ozempic/Wegovy (Novo Nordisk diabetes/obesity, $20B+). Blockbusters drive major stock appreciation and justify high biotech valuations. Companies with multiple blockbusters (Regeneron, Vertex, Gilead) command premium multiples. Investors focus on drugs with large addressable markets, competitive advantages, and strong clinical data.',
  },
  {
    question: 'Should I invest in biotech stocks in 2025?',
    answer: 'Biotech stocks offer significant upside potential in 2025 driven by AI-accelerated drug discovery, obesity drug expansion, Alzheimer\'s treatments, gene therapy advances, and oncology innovations. However, they carry high risk from clinical failures and FDA setbacks. Best approach: allocate 5-15% of portfolio to biotech, diversify across 5-10 companies, focus on late-stage pipelines and commercial-stage companies, and avoid speculative pre-revenue biotechs unless risk-tolerant.',
  },
  {
    question: 'What is the difference between biotech and pharma stocks?',
    answer: 'Biotech companies focus on drug discovery using cutting-edge technology (gene therapy, immunotherapy, biologics) and typically have smaller, concentrated pipelines. Pharma companies (Pfizer, Merck, J&J) are larger, with diversified drug portfolios, stable cash flows, and dividends. Biotechs offer higher growth potential but more volatility and binary risk. Pharmas provide stability and income but slower growth. Investors often combine both for balanced healthcare exposure.',
  },
  {
    question: 'How do I track biotech catalysts?',
    answer: 'Track biotech catalysts using clinical trial databases (ClinicalTrials.gov), FDA calendar (PDUFA dates), company investor relations pages, biotech news sites (FierceBiotech, Endpoints News), analyst reports, and conference presentations (JP Morgan Healthcare, ASH, ASCO). Key dates include trial data readouts, FDA decision dates (PDUFA), advisory committee meetings, and earnings calls. Use catalyst calendars to plan entries/exits around high-impact events.',
  },
  {
    question: 'What are FDA breakthrough therapy and fast track designations?',
    answer: 'Breakthrough Therapy designation is granted for drugs treating serious conditions with preliminary evidence of substantial improvement over existing therapies. It provides intensive FDA guidance and expedited development/review. Fast Track designation speeds development and review for drugs addressing unmet medical needs. Both increase approval probability and reduce time to market by 1-2 years. Stocks often rally 15-40% on these designations as they signal FDA support and commercial potential.',
  },
  {
    question: 'Should I buy biotech stocks before or after clinical trial results?',
    answer: 'Buying before results offers higher upside (50-100%+) but risks 50-90% losses on failure. Buying after positive results offers lower upside (10-30%) but confirmation of drug efficacy. Best strategy: for late-stage trials with high conviction, buy 50% before results and 50% after, or use options for defined risk. For early-stage trials, wait for data unless deeply undervalued. Never bet more than 5% of portfolio on single binary event.',
  },
  {
    question: 'What biotech subsectors have the most potential?',
    answer: 'High-potential biotech subsectors include obesity drugs (GLP-1 agonists driving $100B+ market), Alzheimer\'s treatments (Leqembi, donanemab), oncology (CAR-T, antibody-drug conjugates), gene therapy (CRISPR, sickle cell cures), and rare diseases (orphan drugs with premium pricing). AI drug discovery is accelerating development timelines. Focus on large addressable markets, novel mechanisms, and areas with high unmet need for best risk/reward.',
  },
  {
    question: 'How do I value biotech stocks?',
    answer: 'Value biotech stocks using probability-weighted DCF models (risk-adjust future cash flows by approval probability), peak sales estimates (market size × penetration × pricing), comparable company analysis (EV/sales, P/E vs peers), and sum-of-the-parts for pipeline assets. For pre-revenue biotechs, use risk-adjusted NPV of pipeline. Commercial-stage companies trade on P/E (15-30x) and EV/Sales (5-15x). Account for cash burn, runway, and financing needs.',
  },
  {
    question: 'What are the red flags in biotech investing?',
    answer: 'Major red flags include: single-product dependency with no pipeline, failed Phase 2/3 trials without pivot plan, management with poor execution history, frequent share dilution destroying value, cash runway under 12 months without financing, competitive drugs showing superior data, weak intellectual property protection, and FDA warnings or clinical holds. Also avoid biotechs trading on hype without data, excessive promotion, and opaque management teams.',
  },
]

export default function BiotechCatalystsPage() {
  const pageUrl = `${SITE_URL}/biotech`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Biotech Catalysts', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Biotech Catalysts 2025 - FDA Approvals, Clinical Trials & Pharma Stocks',
    description: 'Comprehensive guide to biotech catalysts, FDA approval process, clinical trials, and top biotech stocks for investors.',
    url: pageUrl,
    keywords: ['biotech catalysts', 'FDA approvals', 'clinical trials', 'biotech stocks', 'pharma stocks'],
  })

  const faqSchema = getFAQSchema(faqs)

  const itemListSchema = getItemListSchema({
    name: 'Top Biotech Stocks 2025',
    description: 'Best biotech and pharmaceutical stocks ranked by pipeline strength and market opportunity',
    url: pageUrl,
    items: biotechStocks.map((stock) => ({
      name: stock.ticker,
      url: `${SITE_URL}/stock/${stock.ticker.toLowerCase()}`,
      position: stock.rank,
    })),
  })

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema, itemListSchema]) }}
      />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex gap-8">
            <SEOSidebar />
            <div className="flex-1 min-w-0">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            {' / '}
            <Link href="/sectors" className="hover:text-white">Sectors</Link>
            {' / '}
            <span>Biotech Catalysts</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Biotech Catalysts 2025
          </h1>
          <p className="text-xl text-[#868f97] mb-8">
            Track FDA approvals, clinical trial results, and pipeline updates. Expert analysis of biotech and pharma stocks
            including MRNA, REGN, VRTX, BIIB, and GILD with AI-powered insights.
          </p>

          {/* What Are Biotech Catalysts */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">What Are Biotech Catalysts?</h2>
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08] mb-6">
              <p className="text-[#868f97] mb-4 leading-relaxed">
                Biotech catalysts are specific events that can dramatically impact a biotechnology company&apos;s stock price.
                Unlike traditional stocks driven by quarterly earnings, biotech stocks move on binary events like clinical
                trial results, FDA approvals, and pipeline updates. A single positive Phase 3 readout can double a stock,
                while a trial failure can result in 50-90% declines.
              </p>
              <p className="text-[#868f97] leading-relaxed">
                Understanding and tracking catalysts is essential for biotech investing. The most impactful catalysts include
                FDA approval decisions (PDUFA dates), Phase 2/3 clinical trial data releases, regulatory designations
                (Breakthrough Therapy, Fast Track), M&A activity, and commercial performance of approved drugs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalystTypes.map((catalyst, i) => (
                <div key={i} className="bg-[#1a1a1a] p-5 rounded-xl border border-white/[0.08]">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{catalyst.icon}</span>
                    <h3 className="text-lg font-bold">{catalyst.type}</h3>
                  </div>
                  <p className="text-sm text-[#868f97] mb-3">{catalyst.description}</p>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-[#4ebe96] mb-1">Examples:</p>
                    <div className="flex flex-wrap gap-1">
                      {catalyst.examples.map((ex, j) => (
                        <span key={j} className="text-xs bg-white/[0.05] px-2 py-1 rounded">
                          {ex}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-medium">
                    <span className="text-[#868f97]">Impact: </span>
                    <span className="text-[#4ebe96]">{catalyst.impact}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* FDA Approval Process */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">FDA Approval Process Explained</h2>
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08] mb-6">
              <p className="text-[#868f97] mb-4 leading-relaxed">
                The FDA drug approval process takes an average of 10-15 years from discovery to market. Understanding this
                timeline helps investors assess risk and potential catalysts. Each stage has specific success rates and
                regulatory requirements.
              </p>
              <p className="text-[#868f97] leading-relaxed">
                Only about 10% of drugs that enter clinical trials ultimately receive FDA approval. The highest attrition
                occurs in Phase 2 and Phase 3 trials where efficacy and safety are rigorously tested in larger patient populations.
              </p>
            </div>
            <div className="space-y-3">
              {fdaApprovalProcess.map((stage, i) => (
                <div key={i} className="bg-[#1a1a1a] p-5 rounded-xl border border-white/[0.08] flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#4ebe96]/20 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-[#4ebe96]">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <h3 className="text-lg font-bold">{stage.step}</h3>
                      <span className="text-sm text-[#4ebe96] font-medium">{stage.duration}</span>
                    </div>
                    <p className="text-sm text-[#868f97]">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Clinical Trial Phases */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Clinical Trial Phases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clinicalTrialPhases.map((phase, i) => (
                <div key={i} className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{phase.phase}</h3>
                    <span className="text-xs px-3 py-1 bg-[#4ebe96]/20 text-[#4ebe96] rounded-full font-medium">
                      {phase.successRate} success
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#868f97]">Focus:</span>
                      <span className="font-medium">{phase.focus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#868f97]">Participants:</span>
                      <span className="font-medium">{phase.participants}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#868f97]">Duration:</span>
                      <span className="font-medium">{phase.duration}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#868f97] leading-relaxed">
                    {phase.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Top Biotech Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Top Biotech Stocks to Watch</h2>
            <div className="space-y-4">
              {biotechStocks.map((stock) => (
                <div key={stock.ticker} className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08] hover:border-[#4ebe96]/50 transition-colors duration-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#4ebe96]/20 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-[#4ebe96]">#{stock.rank}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold">{stock.ticker}</h3>
                          <span className="text-sm text-[#868f97]">•</span>
                          <span className="text-lg text-[#868f97]">{stock.name}</span>
                        </div>
                        <p className="text-sm text-[#868f97] mb-3">{stock.focus}</p>
                        <div className="mb-3">
                          <p className="text-xs font-medium text-[#4ebe96] mb-2">Pipeline Focus:</p>
                          <div className="flex flex-wrap gap-2">
                            {stock.pipeline.map((item, i) => (
                              <span key={i} className="text-xs px-3 py-1 bg-white/[0.05] rounded-full">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium text-[#4ebe96]">Key Catalyst: </span>
                          <span className="text-[#868f97]">{stock.catalysts}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/stock/${stock.ticker.toLowerCase()}`}
                      className="text-sm px-4 py-2 bg-[#4ebe96]/20 text-[#4ebe96] rounded-lg hover:bg-[#4ebe96]/30 transition-colors duration-100 font-medium"
                    >
                      View Analysis
                    </Link>
                    <Link
                      href={`/should-i-buy/${stock.ticker.toLowerCase()}`}
                      className="text-sm px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100"
                    >
                      Should I Buy?
                    </Link>
                    <Link
                      href={`/prediction/${stock.ticker.toLowerCase()}`}
                      className="text-sm px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100"
                    >
                      Price Target
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Investment Risks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Risks of Biotech Investing</h2>
            <div className="bg-gradient-to-br from-[#e15241]/10 to-[#e15241]/5 p-6 rounded-xl border border-[#e15241]/20 mb-6">
              <p className="text-[#868f97] leading-relaxed">
                Biotech investing carries significantly higher risk than traditional stocks due to binary clinical outcomes,
                regulatory uncertainty, and high cash burn rates. Understanding these risks is essential for proper position
                sizing and portfolio management.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentRisks.map((risk, i) => (
                <div key={i} className="bg-[#1a1a1a] p-5 rounded-xl border border-white/[0.08]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold">{risk.risk}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      risk.severity === 'Very High' ? 'bg-[#e15241]/20 text-[#e15241]' :
                      risk.severity === 'High' ? 'bg-[#f4a623]/20 text-[#f4a623]' :
                      'bg-[#f4a623]/20 text-[#f4a623]'
                    }`}>
                      {risk.severity}
                    </span>
                  </div>
                  <p className="text-sm text-[#868f97] mb-3">{risk.description}</p>
                  <div className="text-sm">
                    <span className="font-medium text-[#4ebe96]">Mitigation: </span>
                    <span className="text-[#868f97]">{risk.mitigation}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Investment Strategies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Biotech Investment Strategies</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08]">
                <h3 className="text-xl font-bold mb-3 text-[#4ebe96]">Diversified Approach</h3>
                <p className="text-sm text-[#868f97] mb-4">
                  Lower risk through portfolio diversification
                </p>
                <div className="space-y-2 text-sm">
                  <p>• Invest in 8-12 biotech stocks</p>
                  <p>• Mix of large-cap and mid-cap</p>
                  <p>• Multiple therapeutic areas</p>
                  <p>• Both commercial & pipeline plays</p>
                  <p>• Limit single position to 5-10%</p>
                </div>
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08]">
                <h3 className="text-xl font-bold mb-3 text-[#479ffa]">Catalyst-Driven</h3>
                <p className="text-sm text-[#868f97] mb-4">
                  Time entries around specific events
                </p>
                <div className="space-y-2 text-sm">
                  <p>• Track PDUFA dates</p>
                  <p>• Monitor trial readouts</p>
                  <p>• Focus on late-stage assets</p>
                  <p>• Buy before positive catalysts</p>
                  <p>• Use options for defined risk</p>
                </div>
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08]">
                <h3 className="text-xl font-bold mb-3 text-purple-500">Quality Growth</h3>
                <p className="text-sm text-[#868f97] mb-4">
                  Long-term holdings in proven winners
                </p>
                <div className="space-y-2 text-sm">
                  <p>• Commercial-stage companies</p>
                  <p>• Multiple revenue-generating drugs</p>
                  <p>• Strong balance sheets</p>
                  <p>• Proven R&D capabilities</p>
                  <p>• Hold through volatility</p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-[#1a1a1a] p-6 rounded-xl border border-white/[0.08] group">
                  <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-[#4ebe96] group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-[#868f97] mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-[#4ebe96]/20 to-[#4ebe96]/5 p-8 rounded-xl border border-[#4ebe96]/20 text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Analyze Biotech Stocks with AI</h2>
            <p className="text-[#868f97] mb-6">
              Get comprehensive analysis, DCF valuations, and pipeline insights for biotech and pharma stocks
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-100"
            >
              Start Your Analysis
            </Link>
          </section>

          {/* Related Links */}
          <section className="border-t border-white/[0.08] pt-8">
            <h3 className="text-lg font-bold mb-4">Related Pages</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/sectors" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-center text-sm">
                All Sectors
              </Link>
              <Link href="/sectors/healthcare" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-center text-sm">
                Healthcare Sector
              </Link>
              <Link href="/best-stocks/healthcare" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-center text-sm">
                Best Healthcare Stocks
              </Link>
              <Link href="/ipo" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-center text-sm">
                Biotech IPOs
              </Link>
              <Link href="/analyst-ratings" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-center text-sm">
                Analyst Ratings
              </Link>
              <Link href="/earnings" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-center text-sm">
                Earnings Calendar
              </Link>
              <Link href="/institutional" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-center text-sm">
                Institutional Holdings
              </Link>
              <Link href="/insights" className="px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.08] transition-colors duration-100 text-center text-sm">
                Market Insights
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
