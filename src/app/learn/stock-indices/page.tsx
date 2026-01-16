import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Stock Market Indices Explained | S&P 500, Dow Jones, NASDAQ Guide',
  description: 'Learn about major stock market indices: S&P 500, Dow Jones Industrial Average, NASDAQ Composite, Russell 2000, and more. Understand how indices work and why they matter.',
  keywords: [
    'stock market indices',
    'S&P 500',
    'Dow Jones Industrial Average',
    'NASDAQ Composite',
    'Russell 2000',
    'what is a stock index',
    'how stock indices work',
    'major stock indices',
    'index funds',
    'market benchmark'
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/stock-indices`
  },
  openGraph: {
    title: 'Stock Market Indices Explained | Complete Guide',
    description: 'Learn about major stock market indices including S&P 500, Dow Jones, NASDAQ, and Russell 2000.',
    url: `${SITE_URL}/learn/stock-indices`,
    type: 'article'
  }
}

const majorIndices = [
  {
    name: 'S&P 500',
    fullName: 'Standard & Poor\'s 500',
    components: 500,
    weighting: 'Market-cap weighted',
    description: 'The most widely followed benchmark for U.S. large-cap stocks. Represents approximately 80% of total U.S. stock market capitalization.',
    etfs: ['SPY', 'VOO', 'IVV'],
    criteria: 'US companies, $14.6B+ market cap, profitable, liquid',
    sectors: '11 GICS sectors represented'
  },
  {
    name: 'Dow Jones Industrial Average',
    fullName: 'DJIA (The Dow)',
    components: 30,
    weighting: 'Price weighted',
    description: 'The oldest and most recognized U.S. stock index. Tracks 30 large, publicly-owned blue-chip companies.',
    etfs: ['DIA'],
    criteria: 'Blue-chip companies, committee selection',
    sectors: 'Diversified across industries'
  },
  {
    name: 'NASDAQ Composite',
    fullName: 'NASDAQ Composite Index',
    components: '3,000+',
    weighting: 'Market-cap weighted',
    description: 'Includes all stocks listed on the NASDAQ exchange. Known for heavy technology sector representation.',
    etfs: ['ONEQ'],
    criteria: 'All NASDAQ-listed stocks',
    sectors: 'Technology-heavy (~50%)'
  },
  {
    name: 'NASDAQ-100',
    fullName: 'NASDAQ-100 Index',
    components: 100,
    weighting: 'Modified market-cap weighted',
    description: 'Top 100 non-financial companies on NASDAQ. Excludes financial companies. Popular for tech exposure.',
    etfs: ['QQQ', 'QQQM'],
    criteria: 'Largest 100 non-financial NASDAQ stocks',
    sectors: 'Technology-dominant'
  },
  {
    name: 'Russell 2000',
    fullName: 'Russell 2000 Index',
    components: 2000,
    weighting: 'Market-cap weighted',
    description: 'The benchmark for U.S. small-cap stocks. Represents the smallest 2,000 stocks in the Russell 3000.',
    etfs: ['IWM', 'VTWO'],
    criteria: 'Smallest 2,000 in Russell 3000',
    sectors: 'Broad small-cap exposure'
  },
  {
    name: 'Russell 3000',
    fullName: 'Russell 3000 Index',
    components: 3000,
    weighting: 'Market-cap weighted',
    description: 'Represents approximately 98% of the investable U.S. equity market. Combines Russell 1000 (large-cap) and Russell 2000 (small-cap).',
    etfs: ['IWV', 'VTHR'],
    criteria: 'Largest 3,000 U.S. stocks by market cap',
    sectors: 'Total market representation'
  }
]

const internationalIndices = [
  { name: 'FTSE 100', country: 'UK', description: '100 largest companies on London Stock Exchange' },
  { name: 'DAX', country: 'Germany', description: '40 largest German companies (was 30 until 2021)' },
  { name: 'CAC 40', country: 'France', description: '40 largest French companies on Euronext Paris' },
  { name: 'Nikkei 225', country: 'Japan', description: '225 top-rated companies on Tokyo Stock Exchange' },
  { name: 'Hang Seng', country: 'Hong Kong', description: 'Largest companies on Hong Kong Stock Exchange' },
  { name: 'Shanghai Composite', country: 'China', description: 'All stocks on Shanghai Stock Exchange' }
]

const faqs = [
  {
    question: 'What is a stock market index?',
    answer: 'A stock market index is a measurement of a section of the stock market. It tracks the performance of a group of stocks that represent a particular market, sector, or economy. Indices like the S&P 500 or Dow Jones serve as benchmarks to compare individual stock or portfolio performance.'
  },
  {
    question: 'How is the S&P 500 different from the Dow Jones?',
    answer: 'The S&P 500 includes 500 large-cap stocks weighted by market capitalization, making larger companies have more influence. The Dow Jones includes only 30 blue-chip stocks and is price-weighted, meaning higher-priced stocks have more influence regardless of company size. The S&P 500 is considered more representative of the overall U.S. stock market.'
  },
  {
    question: 'What is the difference between price-weighted and market-cap weighted indices?',
    answer: 'In a price-weighted index (like the Dow), stocks with higher share prices have more influence on the index value. In a market-cap weighted index (like the S&P 500), companies with larger total market values have more influence. Most modern indices use market-cap weighting as it better reflects the actual economic importance of companies.'
  },
  {
    question: 'Can I invest directly in a stock index?',
    answer: 'You cannot invest directly in an index, but you can invest in index funds (mutual funds) or ETFs that track indices. For example, SPY, VOO, and IVV track the S&P 500, while QQQ tracks the NASDAQ-100. These funds aim to replicate the index\'s performance.'
  },
  {
    question: 'What is the best stock market index to follow?',
    answer: 'The S&P 500 is the most widely used benchmark for the overall U.S. stock market because it includes 500 diverse large-cap companies across all sectors. For technology focus, watch the NASDAQ-100. For small-caps, follow the Russell 2000. For total market exposure, consider the Russell 3000.'
  },
  {
    question: 'Why do stock indices matter for investors?',
    answer: 'Stock indices matter because they: (1) provide benchmarks to measure portfolio performance, (2) reflect overall market sentiment and economic health, (3) serve as the basis for index funds and ETFs, and (4) help investors understand whether markets are bullish or bearish. Most professional investors compare their returns to relevant indices.'
  }
]

export default function StockIndicesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'Stock Indices', url: `${SITE_URL}/learn/stock-indices` }
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stock Market Indices Explained: S&P 500, Dow Jones, NASDAQ Guide',
    datePublished: '2026-01-01',
    dateModified: '2026-01-16',
    description: 'Complete guide to understanding major stock market indices including S&P 500, Dow Jones, NASDAQ, and Russell 2000.',
    url: `${SITE_URL}/learn/stock-indices`
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema])
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/learn" className="hover:text-primary">Learn</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Stock Indices</span>
            </nav>
            <h1 className="text-4xl font-bold mb-4">
              Stock Market Indices Explained
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              A complete guide to understanding major stock market indices: S&P 500, Dow Jones, NASDAQ, Russell 2000, and more. Learn how indices work and why they matter for investors.
            </p>
          </div>
        </section>

        {/* What is an Index */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">What is a Stock Market Index?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground mb-4">
                  A stock market index is a statistical measure that tracks the performance of a group of stocks. Think of it as a &quot;report card&quot; for a segment of the market—it shows whether that group of stocks is generally going up or down.
                </p>
                <p className="text-muted-foreground mb-4">
                  Indices serve as <strong>benchmarks</strong> for investors to compare their portfolio performance. If your portfolio returned 8% but the S&P 500 returned 12%, you underperformed the market.
                </p>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Key Index Concepts</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">1.</span>
                    <div>
                      <strong>Components</strong>
                      <p className="text-sm text-muted-foreground">The individual stocks included in the index</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">2.</span>
                    <div>
                      <strong>Weighting</strong>
                      <p className="text-sm text-muted-foreground">How much each stock affects the index value</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold">3.</span>
                    <div>
                      <strong>Rebalancing</strong>
                      <p className="text-sm text-muted-foreground">Periodic adjustments to maintain index criteria</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Weighting Methods */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Index Weighting Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">Market-Cap Weighted</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Larger companies have more influence on the index. Used by S&P 500, NASDAQ, Russell indices.
                </p>
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <strong>Example:</strong> Apple ($3T market cap) influences the S&P 500 more than a $15B company.
                </div>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">Price Weighted</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Higher-priced stocks have more influence. Used by Dow Jones Industrial Average.
                </p>
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <strong>Example:</strong> A $500 stock affects the Dow more than a $50 stock, regardless of company size.
                </div>
              </div>
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">Equal Weighted</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Every stock has the same influence. Less common, requires frequent rebalancing.
                </p>
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <strong>Example:</strong> In an equal-weighted S&P 500, each of the 500 stocks represents 0.2%.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Major US Indices */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Major U.S. Stock Indices</h2>

            <div className="space-y-8">
              {majorIndices.map((index, i) => (
                <div key={i} className="bg-card border rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{index.name}</h3>
                      <p className="text-muted-foreground">{index.fullName}</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="bg-primary/10 px-3 py-1 rounded">
                        <span className="font-semibold">{index.components}</span> stocks
                      </div>
                      <div className="bg-muted px-3 py-1 rounded">
                        {index.weighting}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{index.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-semibold mb-1">Selection Criteria</p>
                      <p className="text-muted-foreground">{index.criteria}</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Sector Focus</p>
                      <p className="text-muted-foreground">{index.sectors}</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Popular ETFs</p>
                      <div className="flex gap-2">
                        {index.etfs.map((etf, j) => (
                          <Link key={j} href={`/stock/${etf}`} className="text-primary hover:underline">
                            {etf}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* S&P 500 Deep Dive */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">S&P 500: The Most Important Index</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-muted-foreground mb-4">
                  The S&P 500 is considered the primary benchmark for the U.S. stock market. When people say &quot;the market was up today,&quot; they usually mean the S&P 500.
                </p>

                <h3 className="font-semibold mb-3 mt-6">Why S&P 500 Matters</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Represents ~80% of U.S. market capitalization</li>
                  <li>Over $15 trillion indexed to the S&P 500</li>
                  <li>Includes all 11 GICS sectors</li>
                  <li>Most commonly used benchmark by fund managers</li>
                </ul>

                <h3 className="font-semibold mb-3 mt-6">S&P 500 Inclusion Criteria</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>U.S. company (headquarters)</li>
                  <li>Market cap of at least $14.6 billion (2024)</li>
                  <li>Positive earnings in most recent quarter</li>
                  <li>Positive sum of trailing 4 quarters earnings</li>
                  <li>Adequate liquidity and public float</li>
                </ul>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold mb-4">S&P 500 by the Numbers</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Total Market Cap</span>
                    <span className="font-bold">~$45 trillion</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Average Annual Return</span>
                    <span className="font-bold text-green-500">~10.5%</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Largest Company</span>
                    <span className="font-bold">Apple (~7%)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Top 10 Concentration</span>
                    <span className="font-bold">~35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Dividend Yield</span>
                    <span className="font-bold">~1.3%</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Link href="/insights/sp500-historical-returns" className="text-primary hover:underline text-sm">
                    View S&P 500 Historical Returns →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* International Indices */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Major International Indices</h2>
            <p className="text-muted-foreground mb-6">
              Global investors also track indices from major economies around the world.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Index</th>
                    <th className="text-left p-4 font-semibold">Country</th>
                    <th className="text-left p-4 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {internationalIndices.map((idx, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-4 font-medium">{idx.name}</td>
                      <td className="p-4">{idx.country}</td>
                      <td className="p-4 text-muted-foreground">{idx.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How to Invest */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">How to Invest in Stock Indices</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Index Funds (Mutual Funds)</h3>
                <p className="text-muted-foreground mb-4">
                  Mutual funds that passively track an index. Typically have low expense ratios and are ideal for long-term retirement accounts.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Trade once per day at market close</li>
                  <li>Often have minimum investment requirements</li>
                  <li>Popular: VFIAX (Vanguard S&P 500)</li>
                  <li>Best for: 401k, IRA retirement accounts</li>
                </ul>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4">ETFs (Exchange-Traded Funds)</h3>
                <p className="text-muted-foreground mb-4">
                  Funds that trade like stocks throughout the day. Offer flexibility and typically lower expense ratios.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Trade anytime during market hours</li>
                  <li>No minimum investment (buy 1 share)</li>
                  <li>Popular: SPY, VOO, QQQ, IWM</li>
                  <li>Best for: Taxable accounts, active traders</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h3 className="font-semibold text-blue-400 mb-2">Popular Index ETFs</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <Link href="/stock/SPY" className="p-3 bg-card rounded border hover:border-primary transition-colors">
                  <p className="font-bold">SPY</p>
                  <p className="text-xs text-muted-foreground">S&P 500</p>
                </Link>
                <Link href="/stock/QQQ" className="p-3 bg-card rounded border hover:border-primary transition-colors">
                  <p className="font-bold">QQQ</p>
                  <p className="text-xs text-muted-foreground">NASDAQ-100</p>
                </Link>
                <Link href="/stock/IWM" className="p-3 bg-card rounded border hover:border-primary transition-colors">
                  <p className="font-bold">IWM</p>
                  <p className="text-xs text-muted-foreground">Russell 2000</p>
                </Link>
                <Link href="/stock/DIA" className="p-3 bg-card rounded border hover:border-primary transition-colors">
                  <p className="font-bold">DIA</p>
                  <p className="text-xs text-muted-foreground">Dow Jones</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/etfs" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">ETFs</h3>
                <p className="text-sm text-muted-foreground">Browse popular ETFs by category</p>
              </Link>
              <Link href="/insights/sp500-historical-returns" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">S&P 500 Returns</h3>
                <p className="text-sm text-muted-foreground">Historical performance by year</p>
              </Link>
              <Link href="/learn/etf-investing" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">ETF Investing Guide</h3>
                <p className="text-sm text-muted-foreground">How to invest in ETFs</p>
              </Link>
              <Link href="/screener" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">Stock Screener</h3>
                <p className="text-sm text-muted-foreground">Find stocks by criteria</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
