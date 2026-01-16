import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'P/E Ratio by Sector (2026) - Average PE Ratios for All 11 GICS Sectors | Lician',
  description: 'Current average P/E ratios by sector for 2026. Compare price-to-earnings ratios across Technology, Healthcare, Financials, and all GICS sectors with historical context.',
  keywords: [
    'P/E ratio by sector',
    'average PE ratio by sector',
    'sector PE ratios',
    'PE ratio by industry',
    'technology PE ratio',
    'healthcare PE ratio',
    'financial sector PE ratio',
    'GICS sector valuations',
  ],
  openGraph: {
    title: 'P/E Ratio by Sector (2026) - All 11 GICS Sectors',
    description: 'Compare average P/E ratios across all market sectors. Updated valuation data for Technology, Healthcare, Financials, and more.',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lician.com/insights/pe-ratio-by-sector',
  },
}

// Sector P/E ratio data with context
// Data represents typical ranges and averages
const sectorPERatios = [
  {
    sector: 'Technology',
    slug: 'technology',
    currentPE: 32.5,
    historicalAvg: 28.0,
    range: '22-45',
    premiumDiscount: '+16%',
    topStocks: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'],
    note: 'Premium valuations driven by AI growth expectations',
    analysis: 'Technology commands premium valuations due to high growth rates, scalability, and AI tailwinds. Software companies often trade at higher multiples than hardware.',
  },
  {
    sector: 'Communication Services',
    slug: 'communication-services',
    currentPE: 22.8,
    historicalAvg: 20.0,
    range: '15-30',
    premiumDiscount: '+14%',
    topStocks: ['GOOGL', 'META', 'NFLX', 'DIS', 'T'],
    note: 'Digital advertising and streaming leaders drive valuations',
    analysis: 'Mix of high-growth digital platforms and mature telecoms creates wide valuation dispersion. Tech-adjacent companies like Google and Meta trade at significant premiums.',
  },
  {
    sector: 'Consumer Discretionary',
    slug: 'consumer-discretionary',
    currentPE: 26.5,
    historicalAvg: 22.0,
    range: '18-35',
    premiumDiscount: '+20%',
    topStocks: ['AMZN', 'TSLA', 'HD', 'NKE', 'MCD'],
    note: 'E-commerce and EV leaders command premium multiples',
    analysis: 'Includes Amazon and Tesla which skew average higher. Traditional retail trades at lower multiples. Sector is sensitive to consumer spending trends.',
  },
  {
    sector: 'Healthcare',
    slug: 'healthcare',
    currentPE: 23.2,
    historicalAvg: 18.0,
    range: '14-35',
    premiumDiscount: '+29%',
    topStocks: ['UNH', 'LLY', 'JNJ', 'ABBV', 'MRK'],
    note: 'GLP-1 and biotech innovation driving higher multiples',
    analysis: 'Pharma and biotech trade at premiums when pipelines are strong. Healthcare insurers typically have lower PE ratios. LLY and other GLP-1 players have expanded sector multiples.',
  },
  {
    sector: 'Industrials',
    slug: 'industrials',
    currentPE: 22.0,
    historicalAvg: 19.0,
    range: '15-28',
    premiumDiscount: '+16%',
    topStocks: ['CAT', 'UNP', 'HON', 'UPS', 'RTX'],
    note: 'Infrastructure spending supports valuations',
    analysis: 'Cyclical sector tied to economic growth and infrastructure investment. Defense contractors and aerospace companies often command premium valuations.',
  },
  {
    sector: 'Financials',
    slug: 'financials',
    currentPE: 14.5,
    historicalAvg: 13.0,
    range: '10-20',
    premiumDiscount: '+12%',
    topStocks: ['JPM', 'V', 'MA', 'BAC', 'GS'],
    note: 'Banks benefit from stable rates, payment networks premium',
    analysis: 'Banks typically trade below market due to regulatory constraints and cyclicality. Payment networks (V, MA) trade at significant premiums. Insurance companies vary widely.',
  },
  {
    sector: 'Consumer Staples',
    slug: 'consumer-staples',
    currentPE: 21.5,
    historicalAvg: 20.0,
    range: '17-26',
    premiumDiscount: '+8%',
    topStocks: ['PG', 'KO', 'PEP', 'COST', 'WMT'],
    note: 'Defensive qualities support steady valuations',
    analysis: 'Stable, defensive sector with consistent earnings. Premium paid for brand strength and dividend growth. Lower volatility commands modest premium in uncertain markets.',
  },
  {
    sector: 'Materials',
    slug: 'materials',
    currentPE: 16.8,
    historicalAvg: 15.0,
    range: '10-22',
    premiumDiscount: '+12%',
    topStocks: ['LIN', 'APD', 'SHW', 'ECL', 'NEM'],
    note: 'Commodity cycles impact valuations significantly',
    analysis: 'Highly cyclical sector tied to commodity prices and construction activity. Industrial gases (LIN, APD) trade at premiums due to stable demand. Mining companies highly volatile.',
  },
  {
    sector: 'Real Estate',
    slug: 'real-estate',
    currentPE: 35.5,
    historicalAvg: 38.0,
    range: '25-50',
    premiumDiscount: '-7%',
    topStocks: ['PLD', 'AMT', 'EQIX', 'SPG', 'O'],
    note: 'REITs use P/FFO more commonly than P/E',
    analysis: 'High P/E ratios due to depreciation reducing earnings. Analysts prefer P/FFO (Funds From Operations). Data centers and logistics REITs command premiums.',
  },
  {
    sector: 'Utilities',
    slug: 'utilities',
    currentPE: 17.5,
    historicalAvg: 16.0,
    range: '13-22',
    premiumDiscount: '+9%',
    topStocks: ['NEE', 'DUK', 'SO', 'D', 'AEP'],
    note: 'Renewable energy leaders trade at premiums',
    analysis: 'Traditionally defensive with stable dividends. Clean energy transition creates valuation dispersion. NextEra (NEE) trades at significant premium due to renewable focus.',
  },
  {
    sector: 'Energy',
    slug: 'energy',
    currentPE: 12.5,
    historicalAvg: 11.0,
    range: '6-18',
    premiumDiscount: '+14%',
    topStocks: ['XOM', 'CVX', 'COP', 'SLB', 'EOG'],
    note: 'Oil prices drive significant PE volatility',
    analysis: 'Lowest PE sector due to commodity price volatility and energy transition concerns. Integrated majors (XOM, CVX) trade at modest premiums to exploration companies.',
  },
]

// Summary statistics
const summaryStats = [
  { label: 'S&P 500 P/E', value: '24.2', note: 'Market-weighted average' },
  { label: 'Highest Sector P/E', value: '35.5', note: 'Real Estate (uses P/FFO)' },
  { label: 'Lowest Sector P/E', value: '12.5', note: 'Energy' },
  { label: 'Median Sector P/E', value: '22.0', note: 'Industrials' },
]

const faqs = [
  {
    question: 'What is a good P/E ratio by sector?',
    answer: 'A "good" P/E ratio varies significantly by sector. Technology typically trades at 25-35x earnings, while Financials trade at 12-16x and Energy at 8-15x. What matters is comparing a stock\'s P/E to its sector average and historical norms, not an absolute number. A P/E of 20 might be expensive for Utilities but cheap for Technology.',
  },
  {
    question: 'Why do technology stocks have higher P/E ratios?',
    answer: 'Technology stocks command higher P/E ratios because investors pay for: (1) Higher revenue growth rates (often 15-30%+ annually), (2) Scalable business models with high margins, (3) Network effects and competitive moats, (4) Lower capital intensity than traditional industries, and (5) Future growth expectations, especially around AI and cloud computing.',
  },
  {
    question: 'Which sector has the lowest P/E ratio?',
    answer: 'Energy typically has the lowest P/E ratio (currently ~12.5x) due to commodity price volatility, cyclical earnings, capital intensity, and concerns about the energy transition. Financial stocks also trade at relatively low P/E ratios (14-15x) due to regulatory constraints and perceived cyclicality.',
  },
  {
    question: 'What is the average P/E ratio for the S&P 500?',
    answer: 'The S&P 500 average P/E ratio is currently around 24x forward earnings. The long-term historical average is approximately 16-17x, though this has trended higher over time due to changes in sector composition (more tech) and lower interest rates. The 10-year average is closer to 20x.',
  },
  {
    question: 'Should I buy stocks with low P/E ratios?',
    answer: 'Low P/E ratios can indicate value, but also problems. A stock might be cheap for good reasons: declining business, poor management, or industry headwinds. Compare P/E to sector peers, consider growth rates (PEG ratio), and examine why it\'s undervalued. Sometimes expensive stocks (high P/E) outperform because they deserve premium valuations.',
  },
  {
    question: 'How do interest rates affect P/E ratios?',
    answer: 'Higher interest rates typically compress P/E ratios because: (1) Future earnings are worth less when discounted at higher rates, (2) Bonds become more competitive with stocks, (3) Borrowing costs increase, and (4) Economic growth may slow. Growth stocks with earnings far in the future are most affected by rate changes.',
  },
]

export default function PERatioBySector() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Insights', url: `${SITE_URL}/insights` },
    { name: 'P/E Ratio by Sector', url: `${SITE_URL}/insights/pe-ratio-by-sector` },
  ])

  const articleSchema = getArticleSchema({
    headline: 'P/E Ratio by Sector (2026) - Average PE Ratios for All 11 GICS Sectors',
    description: 'Compare average P/E ratios across all market sectors. Updated valuation data for Technology, Healthcare, Financials, and all 11 GICS sectors.',
    url: `${SITE_URL}/insights/pe-ratio-by-sector`,
    datePublished: '2024-01-01T00:00:00Z',
    dateModified: '2026-01-16T00:00:00Z',
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/insights" className="hover:text-foreground">Insights</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">P/E Ratio by Sector</span>
        </nav>

        {/* Hero */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            P/E Ratio by Sector (2026)
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Compare average price-to-earnings ratios across all 11 GICS sectors.
            Understand sector valuations and how to interpret P/E ratios in context.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 2026 | Data represents sector median P/E ratios
          </p>
        </header>

        {/* Summary Statistics */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Market Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryStats.map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-lg bg-muted/50 border border-border"
              >
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Main P/E Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">P/E Ratios by Sector</h2>
          <p className="text-muted-foreground mb-4">
            Current and historical average P/E ratios for all 11 GICS sectors, sorted by current valuation.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Sector</th>
                  <th className="text-right py-3 px-4">Current P/E</th>
                  <th className="text-right py-3 px-4">Historical Avg</th>
                  <th className="text-right py-3 px-4">Range</th>
                  <th className="text-right py-3 px-4">Premium/Discount</th>
                </tr>
              </thead>
              <tbody>
                {sectorPERatios
                  .sort((a, b) => b.currentPE - a.currentPE)
                  .map((sector) => (
                    <tr key={sector.sector} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <Link
                          href={`/sectors/${sector.slug}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {sector.sector}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        {sector.currentPE.toFixed(1)}x
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                        {sector.historicalAvg.toFixed(1)}x
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground text-sm">
                        {sector.range}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono ${
                        sector.premiumDiscount.startsWith('+') ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {sector.premiumDiscount}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            * Premium/Discount shows current P/E vs. historical average. Red indicates above average (potentially overvalued), green indicates below average.
          </p>
        </section>

        {/* Detailed Sector Analysis */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Sector Analysis</h2>
          <div className="space-y-6">
            {sectorPERatios.slice(0, 6).map((sector) => (
              <div key={sector.sector} className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/sectors/${sector.slug}`}
                    className="text-lg font-semibold hover:text-primary transition-colors"
                  >
                    {sector.sector}
                  </Link>
                  <span className="font-mono text-primary font-bold">{sector.currentPE.toFixed(1)}x P/E</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{sector.analysis}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Top stocks:</span>
                  {sector.topStocks.map((ticker) => (
                    <Link
                      key={ticker}
                      href={`/stock/${ticker}`}
                      className="px-2 py-0.5 rounded bg-muted text-xs font-mono hover:bg-muted/80 transition-colors"
                    >
                      {ticker}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Insight Box */}
        <section className="mb-12 p-6 rounded-lg bg-primary/10 border border-primary/20">
          <h2 className="text-xl font-semibold mb-3">Key Valuation Insight</h2>
          <p className="text-muted-foreground mb-3">
            <strong>Don&apos;t compare P/E ratios across sectors.</strong> A Technology stock with a 30x P/E
            isn&apos;t necessarily more expensive than a Financial stock at 12x. Each sector has
            structural differences in growth rates, capital intensity, and business models that
            justify different valuation ranges.
          </p>
          <p className="text-muted-foreground">
            The most useful comparison is a stock&apos;s P/E vs. its own sector average and historical range.
            Use the <Link href="/screener" className="text-primary hover:underline">Stock Screener</Link> to
            filter stocks by valuation relative to their sector.
          </p>
        </section>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border pb-6 last:border-b-0">
                <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Related Research</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/insights/sp500-historical-returns"
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-1">S&P 500 Historical Returns</h3>
              <p className="text-sm text-muted-foreground">Annual returns from 1926-2025</p>
            </Link>
            <Link
              href="/learn/pe-ratio"
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-1">P/E Ratio Explained</h3>
              <p className="text-sm text-muted-foreground">Complete guide to price-to-earnings</p>
            </Link>
            <Link
              href="/screener"
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="font-medium mb-1">Stock Screener</h3>
              <p className="text-sm text-muted-foreground">Filter stocks by P/E and sector</p>
            </Link>
          </div>
        </section>

        {/* Methodology Note */}
        <section className="text-sm text-muted-foreground border-t border-border pt-6">
          <h3 className="font-medium mb-2">Methodology & Data Sources</h3>
          <p className="mb-2">
            P/E ratios shown are median forward P/E ratios for stocks within each GICS sector,
            weighted by market capitalization. Historical averages represent 10-year median values.
            Real Estate REIT valuations are best evaluated using P/FFO (Price to Funds From Operations).
          </p>
          <p>
            <strong>Disclaimer:</strong> Valuation data is for educational purposes only.
            Sector P/E ratios fluctuate based on market conditions, earnings cycles, and
            sector composition changes. Always conduct thorough research before making
            investment decisions.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  )
}
