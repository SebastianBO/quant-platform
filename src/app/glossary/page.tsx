import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Investment Glossary: 100+ Stock Market Terms Explained | Lician',
  description: 'Comprehensive investment glossary with 100+ financial terms explained. Learn stock market terminology including P/E ratio, EPS, market cap, dividends, options, and more.',
  keywords: [
    'investment glossary',
    'stock market terms',
    'financial terms',
    'investing terminology',
    'stock glossary',
    'what is P/E ratio',
    'what is market cap',
    'finance definitions',
    'stock market vocabulary',
  ],
  openGraph: {
    title: 'Investment Glossary - 100+ Stock Market Terms',
    description: 'Learn stock market terminology with our comprehensive investment glossary. Clear definitions for beginners and experienced investors.',
    type: 'article',
    url: `${SITE_URL}/glossary`,
  },
  alternates: {
    canonical: `${SITE_URL}/glossary`,
  },
}

// Glossary terms organized alphabetically
const glossaryTerms = [
  // A
  {
    term: 'Alpha',
    definition: 'A measure of an investment\'s performance compared to a benchmark index. Positive alpha indicates outperformance; negative alpha indicates underperformance.',
    category: 'Performance',
    related: ['Beta', 'Benchmark'],
  },
  {
    term: 'Annual Report',
    definition: 'A comprehensive report published yearly by public companies describing their operations and financial condition. Includes audited financial statements.',
    category: 'Filings',
    related: ['10-K', 'SEC Filings'],
  },
  {
    term: 'Ask Price',
    definition: 'The lowest price a seller is willing to accept for a security. The difference between bid and ask is called the spread.',
    category: 'Trading',
    related: ['Bid Price', 'Spread'],
  },
  // B
  {
    term: 'Bear Market',
    definition: 'A market condition where prices fall 20% or more from recent highs, typically accompanied by pessimism and negative investor sentiment.',
    category: 'Market',
    related: ['Bull Market', 'Correction'],
  },
  {
    term: 'Beta',
    definition: 'A measure of a stock\'s volatility relative to the overall market. Beta of 1 means the stock moves with the market; >1 is more volatile, <1 is less volatile.',
    category: 'Risk',
    related: ['Alpha', 'Volatility'],
  },
  {
    term: 'Bid Price',
    definition: 'The highest price a buyer is willing to pay for a security. The bid-ask spread represents the difference between bid and ask prices.',
    category: 'Trading',
    related: ['Ask Price', 'Spread'],
  },
  {
    term: 'Blue Chip Stocks',
    definition: 'Shares of large, well-established, financially stable companies with a history of reliable performance and dividend payments.',
    category: 'Stocks',
    related: ['Large Cap', 'Dividend'],
  },
  {
    term: 'Book Value',
    definition: 'A company\'s total assets minus its total liabilities. Book value per share divides this by the number of outstanding shares.',
    category: 'Valuation',
    related: ['P/B Ratio', 'Net Asset Value'],
  },
  {
    term: 'Bull Market',
    definition: 'A market condition characterized by rising prices, typically 20% or more from recent lows, accompanied by optimism and investor confidence.',
    category: 'Market',
    related: ['Bear Market', 'Rally'],
  },
  // C
  {
    term: 'Call Option',
    definition: 'A contract giving the holder the right, but not obligation, to buy a stock at a specified price (strike) before a certain date (expiration).',
    category: 'Options',
    related: ['Put Option', 'Strike Price', 'Expiration'],
  },
  {
    term: 'Capital Gain',
    definition: 'The profit earned when selling an asset for more than its purchase price. Short-term (<1 year) and long-term (>1 year) gains are taxed differently.',
    category: 'Tax',
    related: ['Capital Loss', 'Cost Basis'],
  },
  {
    term: 'Compound Interest',
    definition: 'Interest earned on both the initial principal and the accumulated interest from previous periods, leading to exponential growth over time.',
    category: 'Investing',
    related: ['Simple Interest', 'APY'],
  },
  {
    term: 'Correction',
    definition: 'A decline of 10% or more in a stock or market index from its recent peak. Corrections are normal and typically short-lived.',
    category: 'Market',
    related: ['Bear Market', 'Pullback'],
  },
  // D
  {
    term: 'Dividend',
    definition: 'A portion of a company\'s earnings distributed to shareholders, typically quarterly. Dividend yield is the annual dividend divided by share price.',
    category: 'Income',
    related: ['Dividend Yield', 'Payout Ratio', 'Ex-Dividend Date'],
  },
  {
    term: 'Dividend Yield',
    definition: 'Annual dividends per share divided by the stock price, expressed as a percentage. A 4% yield means $4 annual dividend on a $100 stock.',
    category: 'Income',
    related: ['Dividend', 'Yield on Cost'],
  },
  {
    term: 'Dollar-Cost Averaging (DCA)',
    definition: 'Investing a fixed amount at regular intervals regardless of price. This strategy reduces the impact of volatility and avoids market timing.',
    category: 'Strategy',
    related: ['Lump Sum', 'Market Timing'],
  },
  {
    term: 'DRIP',
    definition: 'Dividend Reinvestment Plan - automatically reinvests dividends to purchase additional shares, enabling compound growth without transaction fees.',
    category: 'Income',
    related: ['Dividend', 'Compound Interest'],
  },
  // E
  {
    term: 'Earnings Per Share (EPS)',
    definition: 'Net income divided by the number of outstanding shares. EPS indicates how much profit a company generates per share of stock.',
    category: 'Fundamentals',
    related: ['P/E Ratio', 'Net Income'],
  },
  {
    term: 'EBITDA',
    definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. A measure of operating performance that strips out financing and accounting effects.',
    category: 'Fundamentals',
    related: ['Operating Income', 'Free Cash Flow'],
  },
  {
    term: 'ETF (Exchange-Traded Fund)',
    definition: 'An investment fund that trades on stock exchanges like individual stocks. ETFs hold a basket of securities and typically track an index.',
    category: 'Funds',
    related: ['Mutual Fund', 'Index Fund', 'Expense Ratio'],
  },
  {
    term: 'Ex-Dividend Date',
    definition: 'The date on which new buyers of a stock are no longer entitled to the most recently declared dividend. Stock price typically drops by the dividend amount.',
    category: 'Income',
    related: ['Dividend', 'Record Date'],
  },
  {
    term: 'Expense Ratio',
    definition: 'The annual fee charged by mutual funds and ETFs, expressed as a percentage of assets. A 0.10% expense ratio means $1 per $1,000 invested annually.',
    category: 'Funds',
    related: ['ETF', 'Mutual Fund'],
  },
  // F
  {
    term: 'Free Cash Flow (FCF)',
    definition: 'Cash generated by operations minus capital expenditures. Represents money available for dividends, debt repayment, or reinvestment.',
    category: 'Fundamentals',
    related: ['Operating Cash Flow', 'CapEx'],
  },
  {
    term: 'Fundamental Analysis',
    definition: 'Evaluating a security by analyzing financial statements, industry conditions, and economic factors to determine intrinsic value.',
    category: 'Analysis',
    related: ['Technical Analysis', 'Intrinsic Value'],
  },
  // G
  {
    term: 'Gross Margin',
    definition: 'Revenue minus cost of goods sold, divided by revenue. Indicates how efficiently a company produces its products or services.',
    category: 'Fundamentals',
    related: ['Net Margin', 'Operating Margin'],
  },
  {
    term: 'Growth Stock',
    definition: 'Stock of a company expected to grow earnings faster than the market average. Often trade at higher valuations with lower or no dividends.',
    category: 'Stocks',
    related: ['Value Stock', 'P/E Ratio'],
  },
  // I
  {
    term: 'Index Fund',
    definition: 'A mutual fund or ETF designed to track a specific market index like the S&P 500. Offers broad diversification at low cost.',
    category: 'Funds',
    related: ['ETF', 'Passive Investing'],
  },
  {
    term: 'Initial Public Offering (IPO)',
    definition: 'The first sale of stock by a private company to the public. Companies go public to raise capital and provide liquidity for early investors.',
    category: 'Market',
    related: ['Secondary Offering', 'Lock-Up Period'],
  },
  {
    term: 'Intrinsic Value',
    definition: 'The perceived true value of a security based on fundamental analysis. Compare to market price to find undervalued or overvalued stocks.',
    category: 'Valuation',
    related: ['Book Value', 'DCF'],
  },
  // L
  {
    term: 'Limit Order',
    definition: 'An order to buy or sell a security at a specified price or better. Provides price control but may not execute if the price isn\'t reached.',
    category: 'Trading',
    related: ['Market Order', 'Stop Loss'],
  },
  {
    term: 'Liquidity',
    definition: 'How easily an asset can be bought or sold without significantly affecting its price. High-volume stocks are more liquid than thinly-traded ones.',
    category: 'Trading',
    related: ['Volume', 'Spread'],
  },
  // M
  {
    term: 'Market Cap (Market Capitalization)',
    definition: 'Total value of a company\'s outstanding shares. Calculated as share price × shares outstanding. Used to classify companies as large, mid, or small cap.',
    category: 'Valuation',
    related: ['Large Cap', 'Small Cap', 'Enterprise Value'],
  },
  {
    term: 'Market Order',
    definition: 'An order to buy or sell immediately at the current market price. Guarantees execution but not price, especially in volatile markets.',
    category: 'Trading',
    related: ['Limit Order', 'Stop Order'],
  },
  {
    term: 'Moving Average',
    definition: 'A technical indicator that smooths price data by calculating the average price over a specified period (e.g., 50-day or 200-day moving average).',
    category: 'Technical',
    related: ['Support', 'Resistance', 'Golden Cross'],
  },
  {
    term: 'Mutual Fund',
    definition: 'A pooled investment vehicle managed by professionals that invests in stocks, bonds, or other securities. Priced once daily after market close.',
    category: 'Funds',
    related: ['ETF', 'Index Fund', 'Expense Ratio'],
  },
  // N
  {
    term: 'Net Income',
    definition: 'A company\'s total profit after all expenses, taxes, and costs are deducted from revenue. Also called the "bottom line."',
    category: 'Fundamentals',
    related: ['EPS', 'Revenue', 'Operating Income'],
  },
  // O
  {
    term: 'Operating Margin',
    definition: 'Operating income divided by revenue. Shows what percentage of revenue remains after covering operating costs, before interest and taxes.',
    category: 'Fundamentals',
    related: ['Gross Margin', 'Net Margin'],
  },
  {
    term: 'Options',
    definition: 'Contracts that give the right (not obligation) to buy (call) or sell (put) a security at a specified price before a certain date.',
    category: 'Options',
    related: ['Call Option', 'Put Option', 'Strike Price'],
  },
  // P
  {
    term: 'P/E Ratio (Price-to-Earnings)',
    definition: 'Stock price divided by earnings per share. Indicates how much investors are willing to pay per dollar of earnings. Higher P/E suggests higher growth expectations.',
    category: 'Valuation',
    related: ['EPS', 'PEG Ratio', 'Forward P/E'],
  },
  {
    term: 'P/B Ratio (Price-to-Book)',
    definition: 'Stock price divided by book value per share. A P/B below 1 may indicate undervaluation; above 1 suggests market sees intangible value.',
    category: 'Valuation',
    related: ['Book Value', 'P/E Ratio'],
  },
  {
    term: 'Portfolio',
    definition: 'A collection of investments held by an individual or institution. Diversification across asset classes reduces overall portfolio risk.',
    category: 'Investing',
    related: ['Diversification', 'Asset Allocation'],
  },
  {
    term: 'Put Option',
    definition: 'A contract giving the holder the right, but not obligation, to sell a stock at a specified price (strike) before a certain date.',
    category: 'Options',
    related: ['Call Option', 'Strike Price', 'Hedging'],
  },
  // Q
  {
    term: 'Quarterly Report (10-Q)',
    definition: 'An unaudited financial report filed by public companies with the SEC every quarter, containing financial statements and updates.',
    category: 'Filings',
    related: ['10-K', 'SEC Filings', 'Earnings'],
  },
  // R
  {
    term: 'Return on Equity (ROE)',
    definition: 'Net income divided by shareholders\' equity. Measures how efficiently a company generates profit from shareholders\' investments.',
    category: 'Fundamentals',
    related: ['ROA', 'Net Income', 'Equity'],
  },
  {
    term: 'Revenue',
    definition: 'Total income generated from sales before any expenses are deducted. Also called "top line" or gross sales.',
    category: 'Fundamentals',
    related: ['Net Income', 'Gross Margin'],
  },
  {
    term: 'Risk Tolerance',
    definition: 'An investor\'s ability and willingness to withstand investment losses. Influences asset allocation and investment strategy.',
    category: 'Investing',
    related: ['Asset Allocation', 'Volatility'],
  },
  // S
  {
    term: 'SEC (Securities and Exchange Commission)',
    definition: 'U.S. federal agency responsible for regulating securities markets, protecting investors, and enforcing securities laws.',
    category: 'Regulation',
    related: ['10-K', '10-Q', 'EDGAR'],
  },
  {
    term: 'Short Selling',
    definition: 'Borrowing shares to sell immediately, hoping to buy them back later at a lower price. Profits when stock price falls; losses are theoretically unlimited.',
    category: 'Trading',
    related: ['Short Squeeze', 'Margin'],
  },
  {
    term: 'Spread',
    definition: 'The difference between the bid and ask price. Tighter spreads indicate more liquidity; wider spreads mean higher trading costs.',
    category: 'Trading',
    related: ['Bid Price', 'Ask Price', 'Liquidity'],
  },
  {
    term: 'Stock Split',
    definition: 'A corporate action that divides existing shares into multiple shares, reducing the price proportionally. A 2-for-1 split doubles shares and halves price.',
    category: 'Corporate Actions',
    related: ['Reverse Split', 'Market Cap'],
  },
  {
    term: 'Stop Loss Order',
    definition: 'An order to sell a security when it reaches a specified price, limiting potential losses. Becomes a market order when triggered.',
    category: 'Trading',
    related: ['Limit Order', 'Risk Management'],
  },
  {
    term: 'Strike Price',
    definition: 'The predetermined price at which an option contract can be exercised to buy (call) or sell (put) the underlying security.',
    category: 'Options',
    related: ['Call Option', 'Put Option', 'In-the-Money'],
  },
  // T
  {
    term: 'Technical Analysis',
    definition: 'Evaluating securities by analyzing price movements, charts, and trading patterns to predict future price direction.',
    category: 'Analysis',
    related: ['Fundamental Analysis', 'Moving Average', 'Support'],
  },
  {
    term: 'Theta',
    definition: 'In options, the rate at which an option\'s value decays as expiration approaches. Also called "time decay."',
    category: 'Options',
    related: ['Delta', 'Gamma', 'Vega', 'Greeks'],
  },
  // V
  {
    term: 'Value Stock',
    definition: 'A stock trading at a lower price relative to fundamentals (earnings, book value). Often mature companies with steady dividends.',
    category: 'Stocks',
    related: ['Growth Stock', 'P/E Ratio'],
  },
  {
    term: 'Volatility',
    definition: 'A measure of how much a security\'s price fluctuates over time. High volatility means larger price swings and higher risk.',
    category: 'Risk',
    related: ['Beta', 'Standard Deviation', 'VIX'],
  },
  {
    term: 'Volume',
    definition: 'The number of shares traded during a specific period. High volume indicates strong interest; low volume suggests less liquidity.',
    category: 'Trading',
    related: ['Liquidity', 'Average Volume'],
  },
  // Y
  {
    term: 'Yield',
    definition: 'The income return on an investment, expressed as a percentage. Common types include dividend yield, bond yield, and yield to maturity.',
    category: 'Income',
    related: ['Dividend Yield', 'APY'],
  },
  {
    term: 'YTD (Year-to-Date)',
    definition: 'Performance or changes measured from the beginning of the current calendar year to the present date.',
    category: 'Performance',
    related: ['Annual Return', 'TTM'],
  },
]

// Group terms by first letter
const groupedTerms = glossaryTerms.reduce((acc, term) => {
  const letter = term.term[0].toUpperCase()
  if (!acc[letter]) acc[letter] = []
  acc[letter].push(term)
  return acc
}, {} as Record<string, typeof glossaryTerms>)

const alphabet = Object.keys(groupedTerms).sort()

export default function GlossaryPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Investment Glossary', url: `${SITE_URL}/glossary` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <nav className="mb-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span>Investment Glossary</span>
            </nav>
            <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Investment Glossary
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl">
              Comprehensive guide to stock market terminology with {glossaryTerms.length}+ terms explained.
              Perfect for beginners learning to invest and experienced traders brushing up on concepts.
            </p>
          </div>
        </section>

        {/* Alphabet Navigation */}
        <section className="sticky top-0 z-10 border-b bg-background/95 py-4 backdrop-blur">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {alphabet.map((letter) => (
                <a
                  key={letter}
                  href={`#${letter}`}
                  className="rounded-lg border bg-card px-3 py-1 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Glossary Content */}
        <article className="container mx-auto max-w-4xl px-4 py-12">
          {alphabet.map((letter) => (
            <section key={letter} id={letter} className="mb-12 scroll-mt-24">
              <h2 className="mb-6 border-b pb-2 text-2xl font-bold text-primary">
                {letter}
              </h2>
              <div className="space-y-6">
                {groupedTerms[letter].map((item) => (
                  <div
                    key={item.term}
                    id={item.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                    className="scroll-mt-24 rounded-lg border bg-card p-6"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="text-lg font-semibold">{item.term}</h3>
                      <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {item.category}
                      </span>
                    </div>
                    <p className="mb-4 text-muted-foreground">{item.definition}</p>
                    {item.related.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">Related:</span>
                        {item.related.map((rel) => (
                          <a
                            key={rel}
                            href={`#${rel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                            className="text-xs text-primary hover:underline"
                          >
                            {rel}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Educational Resources */}
          <section className="mt-16 rounded-lg border bg-muted/30 p-8">
            <h2 className="mb-6 text-xl font-bold">Learn More</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/learn/how-to-invest"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">How to Start Investing</h3>
                <p className="text-sm text-muted-foreground">
                  Complete beginner's guide to stocks
                </p>
              </Link>
              <Link
                href="/learn/reading-financial-statements"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Reading Financial Statements</h3>
                <p className="text-sm text-muted-foreground">
                  Understand income statements, balance sheets
                </p>
              </Link>
              <Link
                href="/learn/options-basics"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Options Trading Basics</h3>
                <p className="text-sm text-muted-foreground">
                  Learn calls, puts, and the Greeks
                </p>
              </Link>
              <Link
                href="/learn/technical-analysis"
                className="rounded-lg border bg-background p-4 transition-colors hover:border-primary"
              >
                <h3 className="mb-1 font-semibold">Technical Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Chart patterns and indicators
                </p>
              </Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
