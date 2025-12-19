import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Penny Stocks Guide: Best Penny Stocks to Buy, OTC Stocks & Risks (2025)',
  description: 'Complete guide to penny stocks including cheap stocks under $5, OTC stocks, how to find penny stocks, red flags to avoid pump and dump schemes, and why most investors lose money.',
  keywords: [
    'penny stocks',
    'penny stocks to buy',
    'best penny stocks',
    'cheap stocks',
    'stocks under $5',
    'OTC stocks',
    'penny stocks to watch',
    'how to find penny stocks',
    'penny stock trading',
    'pump and dump stocks',
    'penny stock screener',
    'best cheap stocks',
  ],
  openGraph: {
    title: 'Penny Stocks Guide - How to Find and Trade Cheap Stocks Under $5',
    description: 'Learn about penny stocks, OTC trading, risks, pump and dump schemes, and how to find legitimate opportunities in cheap stocks.',
    type: 'article',
    url: `${SITE_URL}/penny-stocks`,
  },
  alternates: {
    canonical: `${SITE_URL}/penny-stocks`,
  },
}

const faqs = [
  {
    question: 'What are penny stocks?',
    answer: 'Penny stocks are low-priced stocks, typically trading below $5 per share, though the SEC defines them as stocks under $5 regardless of exchange. Many trade on over-the-counter (OTC) markets rather than major exchanges like NYSE or NASDAQ. They usually represent small, speculative companies with limited operating history, low market capitalization, and minimal public information. The low price doesn\'t mean good value - many penny stocks have tiny share floats or inflated share counts making total company value still substantial.',
  },
  {
    question: 'Why do most people lose money on penny stocks?',
    answer: 'Studies show 90%+ of penny stock traders lose money due to: (1) Extreme volatility - prices can swing 50-100% in days, (2) Lack of liquidity making it hard to sell, (3) Pump and dump schemes manipulating prices, (4) Limited financial information and disclosure, (5) Wide bid-ask spreads eating profits, (6) Many companies have weak fundamentals or are pre-revenue, (7) Emotional trading and chasing momentum, (8) High failure rate - most penny stock companies eventually go bankrupt. The few success stories get publicity while thousands of failures go unnoticed.',
  },
  {
    question: 'What are the risks of penny stocks?',
    answer: 'Penny stocks carry extreme risks: Market manipulation through pump and dump schemes, lack of liquidity making shares hard to sell, limited public information and minimal SEC reporting requirements, high volatility with 20-50% daily swings common, many companies have no revenue or path to profitability, delisting risk if stocks fall below exchange requirements, dilution through constant share issuance, insider selling after pumps, bankruptcy risk is very high, and no institutional coverage or analyst research. Many penny stocks are essentially lottery tickets, not investments.',
  },
  {
    question: 'How do I find good penny stocks?',
    answer: 'Finding legitimate penny stocks requires extensive research: Look for companies on major exchanges (NASDAQ/NYSE) rather than OTC Pink Sheets, verify the company has real revenue and business operations, check SEC filings (10-K, 10-Q) for financial health, analyze insider ownership (high is good) vs dilution, look for positive cash flow or clear path to profitability, verify management isn\'t just promoting the stock, check for institutional ownership (even small amounts validate legitimacy), avoid stocks with constant reverse splits or dilution, and use stock screeners to filter by fundamentals not just price. Most importantly, if a stock is heavily promoted on social media or penny stock newsletters, it\'s likely a pump and dump.',
  },
  {
    question: 'What is a pump and dump scheme?',
    answer: 'Pump and dump is illegal market manipulation common in penny stocks. Fraudsters accumulate shares of a low-volume stock, then "pump" it through social media, newsletters, emails, or message boards with false claims about contracts, partnerships, or breakthrough technology. As new investors buy (the "pump"), the price rises rapidly. Original holders then "dump" their shares at inflated prices, causing the stock to crash. Victims are left holding worthless shares. Warning signs: Unsolicited stock tips, guaranteed returns, urgent language ("act now!"), celebrity endorsements, vague business descriptions, and stocks jumping 100%+ on no real news. SEC prosecutes pump and dumps but enforcement is limited.',
  },
  {
    question: 'What are OTC stocks?',
    answer: 'OTC (Over-The-Counter) stocks trade on dealer networks rather than centralized exchanges. There are tiers: OTCQX (highest standards, some legitimate companies), OTCQB (venture stage, must file reports), and OTC Pink (minimal requirements, highest risk). OTC Pink stocks have almost no disclosure requirements, making fraud easy. Benefits: Lower listing costs for small companies. Risks: Extremely low liquidity, wide bid-ask spreads (you might pay $1.00 but can only sell at $0.80), minimal regulation, no market makers ensuring fair prices, easy manipulation, and many are shell companies or scams. Legitimate companies usually graduate to NASDAQ or NYSE as they grow.',
  },
  {
    question: 'Are stocks under $5 good investments?',
    answer: 'Price alone doesn\'t determine investment quality. A stock under $5 could be: (1) A legitimate small company with growth potential trading on NASDAQ, (2) A former blue-chip that fell on hard times, (3) A penny stock scam, or (4) A company with billions of shares making market cap high despite low price. Evaluate stocks under $5 like any other: analyze fundamentals, revenue growth, profitability, competitive position, and valuation. Many quality small-cap stocks trade under $5. However, stocks under $1 (especially OTC) are generally speculative and risky. Focus on the business quality and total market cap, not just share price.',
  },
  {
    question: 'What\'s the difference between cheap stocks and penny stocks?',
    answer: 'Cheap stocks (value stocks) trade below intrinsic value based on fundamentals - strong businesses at low valuations. Penny stocks are simply low-priced, usually under $5, regardless of value. A $3 stock with solid revenue, profits, and growth could be a cheap stock and good value. A $0.50 OTC stock with no revenue and constant dilution is a penny stock and likely worthless. Cheap stocks have: Real business operations, financial disclosures, institutional ownership, analyst coverage, and trade on major exchanges. Penny stocks often have: Little to no revenue, trade OTC, heavy retail ownership, promotional campaigns, and high failure rates. Low price ≠ good value.',
  },
  {
    question: 'Can you make money with penny stocks?',
    answer: 'While possible, it\'s extremely difficult and unlikely. Most penny stock traders lose money. Success requires: (1) Extensive research to find the rare legitimate companies, (2) Strict risk management (never more than 1-2% of portfolio), (3) Quick exits when gains appear (penny stocks rarely sustain rallies), (4) Avoiding promoted stocks and pump and dumps, (5) Understanding you\'re essentially gambling not investing. The few who profit are usually: Early investors in companies that graduate to major exchanges, traders exploiting short-term volatility (risky), or ironically, the scammers running pump and dumps. For most investors, penny stocks are a distraction from building real wealth through quality stocks.',
  },
  {
    question: 'What are red flags in penny stocks?',
    answer: 'Major red flags include: Heavy promotion through email, social media, or "stock newsletters", promises of guaranteed returns or "next big thing" claims, vague or constantly changing business descriptions, management with history of failed penny stocks or fraud, no audited financial statements or SEC filings, constant reverse stock splits to maintain price, continuous dilution issuing billions of new shares, insiders selling while promoting, price spikes on no real news, claims of revolutionary technology with no proof, celebrity endorsements or influencer pumps, and stocks trading on OTC Pink with no reporting. If you see multiple red flags, avoid completely.',
  },
  {
    question: 'How do I screen for penny stocks?',
    answer: 'Use stock screeners to filter: Price under $5 (or your threshold), exchange: NASDAQ/NYSE preferred (avoid OTC Pink), minimum average volume (100K+ shares for liquidity), market cap range (micro-cap $50M-$300M), positive revenue (avoid pre-revenue companies), positive or improving cash flow, low debt-to-equity ratio, insider ownership above 10% (aligned interests), no reverse splits in past year, and filing status: SEC reporting current. Additional filters: Price above $1 (sub-dollar stocks are riskier), positive earnings or clear path to profitability, and revenue growth above 15% annually. Screen out: Stocks down 90%+ from highs (usually distressed), companies with "Corp", "Holdings", or "Ventures" in name (often shells).',
  },
  {
    question: 'Should I invest in penny stocks?',
    answer: 'For most investors, penny stocks should be avoided or represent only a tiny portion (1-5%) of a diversified portfolio as "speculation money" you can afford to lose completely. Penny stocks are appropriate only if you: Accept high risk of total loss, have time for extensive research, understand financial statements, can identify scams, have emergency fund and retirement savings established, and treat it as gambling not investing. Better alternatives: Quality small-cap stocks ($300M-$2B market cap) on major exchanges, growth ETFs, or index funds. If you insist on penny stocks: Start extremely small, never chase pumped stocks, set strict stop losses, take profits quickly, and assume every dollar could go to zero.',
  },
  {
    question: 'What\'s the best strategy for trading penny stocks?',
    answer: 'If you trade penny stocks despite the risks: (1) Only use 1-5% of portfolio as "speculation money", (2) Buy stocks on major exchanges, avoid OTC Pink, (3) Research extensively - verify real business, revenue, and filings, (4) Set strict stop losses (15-20%) to limit downside, (5) Take profits quickly - don\'t get greedy (20-30% gains are excellent), (6) Avoid stocks being heavily promoted anywhere, (7) Never average down on losing positions, (8) Look for catalysts: earnings, FDA approvals, contracts (verify legitimacy), (9) Check insider transactions - buying is good, selling is bad, (10) Accept most trades will lose - focus on risk management. Better strategy: Avoid penny stocks and build wealth in quality companies.',
  },
]

const redFlags = [
  {
    flag: 'Heavy Promotion & Spam',
    description: 'Unsolicited emails, social media pumps, or "hot stock" newsletters pushing the stock',
    severity: 'CRITICAL',
  },
  {
    flag: 'Guaranteed Returns',
    description: 'Claims like "guaranteed to double" or "can\'t lose money" - these are always scams',
    severity: 'CRITICAL',
  },
  {
    flag: 'No SEC Filings',
    description: 'No 10-K, 10-Q reports or OTC Pink status with minimal disclosure requirements',
    severity: 'CRITICAL',
  },
  {
    flag: 'Constant Dilution',
    description: 'Continuously issuing new shares, often billions, destroying shareholder value',
    severity: 'HIGH',
  },
  {
    flag: 'Reverse Splits',
    description: 'Multiple reverse stock splits to maintain price (10:1, 100:1) - sign of desperation',
    severity: 'HIGH',
  },
  {
    flag: 'Insider Selling',
    description: 'Management and insiders selling shares while promoting the stock to retail investors',
    severity: 'HIGH',
  },
  {
    flag: 'Vague Business Model',
    description: 'Can\'t clearly explain what the company does or business keeps changing',
    severity: 'MEDIUM',
  },
  {
    flag: 'No Revenue',
    description: 'Pre-revenue companies with no clear path to sales or profitability',
    severity: 'MEDIUM',
  },
  {
    flag: 'Celebrity Endorsements',
    description: 'Famous people promoting the stock (often paid) - illegal in many cases',
    severity: 'MEDIUM',
  },
]

const tipsForSuccess = [
  {
    tip: 'Stick to Major Exchanges',
    description: 'Focus on NASDAQ and NYSE-listed stocks under $5. These have real disclosure requirements, liquidity, and oversight. Avoid OTC Pink Sheets where fraud is rampant.',
  },
  {
    tip: 'Verify Real Business',
    description: 'Ensure the company has actual products, services, revenue, and customers. Read SEC filings. Many penny stocks are shell companies with no real operations.',
  },
  {
    tip: 'Check Insider Ownership',
    description: 'High insider ownership (20%+) aligns management interests with shareholders. Be wary if insiders are selling while promoting growth.',
  },
  {
    tip: 'Look for Institutional Interest',
    description: 'Even small institutional ownership validates legitimacy. If no institutions own shares, it\'s a red flag - professionals avoid scams.',
  },
  {
    tip: 'Use Strict Stop Losses',
    description: 'Set 15-20% stop losses and stick to them. Penny stocks can collapse 50%+ in days. Protect capital by cutting losses quickly.',
  },
  {
    tip: 'Take Profits Fast',
    description: 'If a penny stock gains 20-30%, consider selling. These rallies rarely sustain. Greed destroys penny stock traders - take profits and move on.',
  },
  {
    tip: 'Avoid Promoted Stocks',
    description: 'If a stock is heavily promoted on social media, newsletters, or forums, it\'s likely a pump and dump. Real opportunities aren\'t advertised to strangers.',
  },
  {
    tip: 'Position Size Tiny',
    description: 'Never put more than 1-2% of portfolio in any penny stock. Most will go to zero. Size positions assuming total loss.',
  },
]

const legitimateScreeningCriteria = [
  { criterion: 'Exchange', value: 'NASDAQ or NYSE (not OTC Pink)', why: 'Real oversight and disclosure' },
  { criterion: 'Price Range', value: '$1 - $5 per share', why: 'Sub-dollar stocks extremely risky' },
  { criterion: 'Market Cap', value: '$50M - $300M', why: 'Large enough to be real business' },
  { criterion: 'Revenue', value: 'Positive and growing 15%+', why: 'Actual business operations' },
  { criterion: 'Volume', value: '100K+ shares daily', why: 'Enough liquidity to exit' },
  { criterion: 'Insider Ownership', value: '10-50%', why: 'Management has skin in the game' },
  { criterion: 'Debt/Equity', value: 'Below 1.0', why: 'Not overleveraged' },
  { criterion: 'SEC Filings', value: 'Current and audited', why: 'Transparency and legitimacy' },
]

export default function PennyStocksPage() {
  const pageUrl = `${SITE_URL}/penny-stocks`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Penny Stocks', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Penny Stocks Guide: How to Find and Trade Cheap Stocks Under $5',
    description: 'Complete educational guide to penny stocks including risks, pump and dump schemes, OTC markets, and how to find legitimate opportunities.',
    url: pageUrl,
    keywords: ['penny stocks', 'OTC stocks', 'cheap stocks', 'stocks under $5', 'penny stock trading', 'pump and dump'],
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema]),
        }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <span>Penny Stocks</span>
          </nav>

          {/* Hero with Warning */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Penny Stocks Guide: Cheap Stocks Under $5
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Complete guide to penny stocks, OTC trading, and low-priced stocks. Learn the risks,
              red flags, and why most investors lose money before considering penny stock trading.
            </p>
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6">
              <div className="flex gap-3 items-start">
                <div className="text-3xl">⚠️</div>
                <div>
                  <h3 className="text-xl font-bold text-red-500 mb-2">High Risk Warning</h3>
                  <p className="text-sm text-muted-foreground">
                    Studies show <strong>90%+ of penny stock traders lose money</strong>. Most penny stocks are
                    heavily manipulated through pump and dump schemes, have no real business operations, and
                    eventually go to zero. This page is educational - penny stocks should only represent 1-5% of
                    a portfolio at most, treated as "speculation money" you can afford to lose completely.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What are Penny Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What Are Penny Stocks?</h2>
            <p className="text-muted-foreground mb-4">
              Penny stocks are low-priced stocks, typically trading below $5 per share. The SEC officially defines
              penny stocks as securities trading under $5, regardless of where they trade. These stocks usually
              represent small, speculative companies with:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-card p-4 rounded-xl border border-border">
                <h3 className="font-bold mb-2 text-sm">Characteristics</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Low market capitalization (often under $300M)</li>
                  <li>• Limited operating history</li>
                  <li>• Minimal public information</li>
                  <li>• High volatility (20-50% daily swings)</li>
                  <li>• Low liquidity and wide bid-ask spreads</li>
                </ul>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border">
                <h3 className="font-bold mb-2 text-sm">Where They Trade</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>NASDAQ/NYSE:</strong> Better quality, some legitimacy</li>
                  <li>• <strong>OTC Markets:</strong> Less regulation, higher risk</li>
                  <li>• <strong>Pink Sheets:</strong> Minimal disclosure, fraud common</li>
                  <li>• Most scams occur on OTC Pink tier</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm">
                <strong>Important:</strong> Low price doesn't mean good value. A $0.50 stock with 10 billion shares has a $5 billion
                market cap - larger than many established companies. Always evaluate total market capitalization, not just share price.
              </p>
            </div>
          </section>

          {/* Why Most People Lose Money */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Most People Lose Money on Penny Stocks</h2>
            <p className="text-muted-foreground mb-6">
              Studies consistently show that 90%+ of penny stock traders lose money. Understanding why is crucial:
            </p>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">1. Pump and Dump Manipulation</h3>
                <p className="text-sm text-muted-foreground">
                  Fraudsters accumulate shares, hype the stock through social media/newsletters, causing price to spike.
                  They dump shares at inflated prices while new buyers are left holding worthless stock. SEC prosecutes
                  these but enforcement is limited due to sheer volume of scams.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">2. Extreme Volatility</h3>
                <p className="text-sm text-muted-foreground">
                  Penny stocks can swing 50-100% in a single day on minimal news or no news at all. Low liquidity means
                  small orders move prices dramatically. Most traders can't handle the psychological stress and sell at losses.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">3. Lack of Liquidity</h3>
                <p className="text-sm text-muted-foreground">
                  Many penny stocks have minimal daily volume. You might buy at $1.00 but can only sell at $0.80 due to
                  wide bid-ask spreads. During selloffs, there may be no buyers at any price, trapping you in positions.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">4. Weak Fundamentals</h3>
                <p className="text-sm text-muted-foreground">
                  Most penny stock companies have no revenue, burn cash rapidly, and have no path to profitability.
                  Many are shell companies existing only to issue shares. The vast majority eventually go bankrupt or
                  delist, leaving shareholders with worthless certificates.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">5. Information Asymmetry</h3>
                <p className="text-sm text-muted-foreground">
                  Limited SEC disclosure requirements (especially OTC Pink) mean insiders and promoters have information
                  advantages. Retail investors make decisions based on promotional material while insiders dump shares.
                </p>
              </div>
            </div>
          </section>

          {/* Red Flags - Pump and Dump */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Red Flags: Avoid These Pump and Dump Warning Signs</h2>
            <div className="grid grid-cols-1 gap-4">
              {redFlags.map((item) => (
                <div
                  key={item.flag}
                  className={`bg-card p-5 rounded-xl border-2 ${
                    item.severity === 'CRITICAL'
                      ? 'border-red-500/50'
                      : item.severity === 'HIGH'
                      ? 'border-orange-500/50'
                      : 'border-yellow-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{item.flag}</h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        item.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-500'
                          : item.severity === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm font-bold mb-2">Golden Rule:</p>
              <p className="text-sm text-muted-foreground">
                If a penny stock is being heavily promoted through emails, social media, or newsletters - it's almost
                certainly a pump and dump. Real investment opportunities aren't advertised to strangers for free.
              </p>
            </div>
          </section>

          {/* OTC Stocks Explained */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Understanding OTC Stocks</h2>
            <p className="text-muted-foreground mb-6">
              Over-The-Counter (OTC) stocks trade on dealer networks rather than centralized exchanges. There are three tiers
              with dramatically different risk profiles:
            </p>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">OTCQX (Best Market)</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-500 font-bold">LOWEST RISK</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Highest tier with financial standards and reporting requirements. Some legitimate international companies and
                  quality small-caps trade here. Still risky but better than other OTC tiers.
                </p>
                <div className="text-xs bg-background p-3 rounded">
                  <strong>Requirements:</strong> Audited financials, $2M+ net tangible assets, no bankruptcy history
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-yellow-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">OTCQB (Venture Market)</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-bold">HIGH RISK</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Middle tier for early-stage and developing companies. Must report to SEC and meet minimum bid price.
                  Speculative but some legitimate small businesses.
                </p>
                <div className="text-xs bg-background p-3 rounded">
                  <strong>Requirements:</strong> SEC reporting current, annual verification, $0.01 minimum bid
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">OTC Pink (Pink Sheets)</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-500 font-bold">EXTREME RISK</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Lowest tier with almost no requirements. Most penny stock fraud occurs here. No audited financials or regular
                  reporting required. Many are shell companies or pump and dump vehicles.
                </p>
                <div className="text-xs bg-background p-3 rounded">
                  <strong>Requirements:</strong> Almost none - any company can trade here. Avoid unless you enjoy losing money.
                </div>
              </div>
            </div>
          </section>

          {/* How to Find Legitimate Penny Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Find Penny Stocks (Legitimate Ones)</h2>
            <p className="text-muted-foreground mb-6">
              While most penny stocks are scams, some legitimate small companies do trade under $5 on major exchanges.
              Here's how to screen for quality:
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mb-6">
              <h3 className="text-lg font-bold mb-4">Screening Criteria for Legitimate Penny Stocks</h3>
              <div className="space-y-3">
                {legitimateScreeningCriteria.map((item) => (
                  <div key={item.criterion} className="flex items-start gap-4 pb-3 border-b border-border last:border-0">
                    <div className="min-w-[140px]">
                      <div className="text-sm font-bold">{item.criterion}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-green-500 font-mono mb-1">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.why}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link
              href="/screener?price_min=1&price_max=5&exchange=NASDAQ,NYSE&volume_min=100000"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Use Stock Screener to Find Penny Stocks
            </Link>
          </section>

          {/* Tips for Success */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Tips for Penny Stock Trading (If You Must)</h2>
            <p className="text-muted-foreground mb-6">
              If you insist on trading penny stocks despite the risks, follow these rules to minimize losses:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipsForSuccess.map((item, index) => (
                <div key={index} className="bg-card p-5 rounded-xl border border-border">
                  <div className="flex gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="font-bold text-sm pt-1">{item.tip}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground ml-11">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Risks and Rewards */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Penny Stocks: Risks vs Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="text-xl font-bold mb-4 text-red-500">Risks (Why Most Lose)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>90%+ of traders lose money</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Heavy manipulation and fraud</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Extreme volatility (50%+ daily swings)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Low liquidity, wide bid-ask spreads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Most companies go bankrupt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Limited information and disclosure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>Constant dilution destroying value</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">✗</span>
                    <span>No institutional support or research</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-green-500/20">
                <h3 className="text-xl font-bold mb-4 text-green-500">Potential Rewards (Rare)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Large % gains possible (if you find rare winners)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Low entry cost allows many positions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Some legitimate small companies are undervalued</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Companies that graduate to major exchanges can 10x+</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Short-term trading opportunities from volatility</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Reality Check:</strong> These rewards are extremely rare. For every penny stock that goes 10x,
                    thousands go to zero. The publicity of winners creates survivorship bias - you only hear success stories.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Better Alternatives */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Better Alternatives to Penny Stocks</h2>
            <p className="text-muted-foreground mb-6">
              Instead of gambling on penny stocks, consider these strategies that actually build wealth:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/screener?market_cap_min=300000000&market_cap_max=2000000000"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Quality Small-Cap Stocks
                </h3>
                <p className="text-muted-foreground mb-3">
                  Focus on small-cap stocks ($300M-$2B market cap) on major exchanges with real revenue and growth.
                  Better fundamentals, lower fraud risk.
                </p>
                <div className="text-xs text-green-500">Screen for small-caps →</div>
              </Link>
              <Link
                href="/learn/dividend-investing"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Dividend Investing
                </h3>
                <p className="text-muted-foreground mb-3">
                  Build passive income with quality dividend-paying stocks. Lower volatility, proven business models,
                  and compound growth over time.
                </p>
                <div className="text-xs text-green-500">Learn dividend investing →</div>
              </Link>
              <Link
                href="/learn/stock-analysis"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Fundamental Analysis
                </h3>
                <p className="text-muted-foreground mb-3">
                  Learn to analyze financial statements and find undervalued quality companies. Sustainable wealth
                  comes from investing, not gambling.
                </p>
                <div className="text-xs text-green-500">Learn stock analysis →</div>
              </Link>
              <Link
                href="/dashboard"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Index Fund Investing
                </h3>
                <p className="text-muted-foreground mb-3">
                  S&P 500 index funds have historically returned 10% annually. No stock picking, minimal fees,
                  and you outperform most active traders.
                </p>
                <div className="text-xs text-green-500">Start investing →</div>
              </Link>
            </div>
          </section>

          {/* Final Warning CTA */}
          <section className="bg-gradient-to-br from-red-500/10 to-orange-500/10 p-8 rounded-xl border border-red-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Think Twice Before Trading Penny Stocks
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              90%+ of penny stock traders lose money. Most penny stocks are pump and dump schemes or failing companies.
              If you must trade them, use only 1-5% of your portfolio as "speculation money" you can afford to lose completely.
              <strong className="block mt-3">Better strategy: Build wealth with quality stocks using our AI-powered analysis.</strong>
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/screener"
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Screen for Quality Stocks
              </Link>
              <Link
                href="/learn"
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Learn Real Investing
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
