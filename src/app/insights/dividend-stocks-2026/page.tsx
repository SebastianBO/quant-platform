import { Metadata } from 'next'
import Link from 'next/link'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, getItemListSchema, SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Best Dividend Stocks for 2026 - High Yield Income Investments | Lician',
  description: 'Top dividend stocks for 2026. Expert analysis of high-yield dividend stocks with consistent payouts, dividend growth, and income potential. Best dividend aristocrats and income stocks.',
  keywords: ['dividend stocks 2026', 'best dividend stocks', 'high yield stocks', 'dividend aristocrats', 'income stocks 2026', 'monthly dividend stocks'],
  openGraph: {
    title: 'Best Dividend Stocks for 2026 - High Yield Income Picks',
    description: 'Comprehensive analysis of the best dividend-paying stocks for income investors in 2026.',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lician.com/insights/dividend-stocks-2026',
  },
}

const dividendStocks = [
  {
    ticker: 'JNJ',
    rank: 1,
    yield: '3.2%',
    yearsOfGrowth: '62+',
    category: 'Dividend Aristocrat',
    why: 'Healthcare giant with 62+ years of consecutive dividend increases, diversified across pharma, medical devices, and consumer health',
    safety: 'AAA-rated balance sheet, stable cash flows, defensive business model',
    catalysts: ['New drug launches', 'MedTech innovation', 'Annual dividend increases'],
  },
  {
    ticker: 'PG',
    rank: 2,
    yield: '2.5%',
    yearsOfGrowth: '68+',
    category: 'Dividend King',
    why: 'Consumer staples leader with iconic brands and pricing power, 68+ years of dividend growth',
    safety: 'Recession-resistant products, strong free cash flow, premium valuations justified',
    catalysts: ['Price increases', 'Emerging markets', 'Productivity improvements'],
  },
  {
    ticker: 'XOM',
    rank: 3,
    yield: '3.5%',
    yearsOfGrowth: '42+',
    category: 'Energy Dividend',
    why: 'Largest US oil company with industry-leading returns, strong dividend coverage from operations',
    safety: 'Low breakeven costs, disciplined capital allocation, $30B+ annual free cash flow',
    catalysts: ['Oil price stability', 'LNG expansion', 'Share buybacks'],
  },
  {
    ticker: 'CVX',
    rank: 4,
    yield: '3.8%',
    yearsOfGrowth: '37+',
    category: 'Energy Dividend',
    why: 'Integrated energy company with consistent dividend growth through cycles',
    safety: 'Fortress balance sheet, diversified operations, sustainable payout ratio',
    catalysts: ['Permian production', 'International LNG', 'Capital discipline'],
  },
  {
    ticker: 'ABBV',
    rank: 5,
    yield: '3.6%',
    yearsOfGrowth: '11+',
    category: 'Healthcare Dividend',
    why: 'Biopharmaceutical company with blockbuster drugs and strong pipeline, committed to dividend growth',
    safety: 'Rinvoq/Skyrizi replacing Humira, robust pipeline, high cash generation',
    catalysts: ['Immunology growth', 'Pipeline approvals', '10%+ dividend increases'],
  },
  {
    ticker: 'VZ',
    rank: 6,
    yield: '6.2%',
    yearsOfGrowth: '18+',
    category: 'High Yield Telecom',
    why: 'Telecom leader with ultra-high yield, essential wireless services, stable cash flows',
    safety: 'Network quality advantage, recurring revenue, deleveraging balance sheet',
    catalysts: ['5G monetization', 'Fixed wireless', 'Debt reduction'],
  },
  {
    ticker: 'KO',
    rank: 7,
    yield: '3.0%',
    yearsOfGrowth: '62+',
    category: 'Dividend Aristocrat',
    why: 'Global beverage leader with 62+ years of dividend increases and worldwide brand power',
    safety: 'Asset-light model, pricing power, recession-resistant demand',
    catalysts: ['Price increases', 'Innovation', 'Emerging markets'],
  },
  {
    ticker: 'PEP',
    rank: 8,
    yield: '2.8%',
    yearsOfGrowth: '51+',
    category: 'Dividend Aristocrat',
    why: 'Diversified food and beverage company with snacks and beverages, 51+ years of dividend growth',
    safety: 'Frito-Lay dominance, diverse portfolio, strong cash generation',
    catalysts: ['Portfolio optimization', 'International growth', 'Productivity'],
  },
  {
    ticker: 'JPM',
    rank: 9,
    yield: '2.3%',
    yearsOfGrowth: '14+',
    category: 'Financial Dividend',
    why: 'Largest US bank with diversified revenue, strong capital position, and growing dividend',
    safety: 'Fortress balance sheet, stress-tested capital, multiple revenue streams',
    catalysts: ['Net interest income', 'Investment banking', 'Capital returns'],
  },
  {
    ticker: 'UNH',
    rank: 10,
    yield: '1.4%',
    yearsOfGrowth: '14+',
    category: 'Dividend Growth',
    why: 'Healthcare services leader with low yield but exceptional dividend growth (15%+ annually)',
    safety: 'Optum growth engine, managed care stability, high returns on equity',
    catalysts: ['Optum expansion', 'Medicare Advantage', 'Technology integration'],
  },
  {
    ticker: 'O',
    rank: 11,
    yield: '5.8%',
    yearsOfGrowth: '29+',
    category: 'REIT Monthly Dividend',
    why: 'Realty Income pays monthly dividends with 29+ years of increases, diversified retail properties',
    safety: 'Investment-grade tenants, long-term leases, diversification across 1,300+ tenants',
    catalysts: ['Acquisitions', 'Rent escalations', 'International expansion'],
  },
  {
    ticker: 'NEE',
    rank: 12,
    yield: '2.6%',
    yearsOfGrowth: '29+',
    category: 'Utility Growth',
    why: 'Renewable energy leader with utility stability and 10% annual dividend growth target',
    safety: 'Regulated utility base, renewable energy growth, rate base expansion',
    catalysts: ['Renewable projects', 'Rate base growth', 'Clean energy transition'],
  },
  {
    ticker: 'MO',
    rank: 13,
    yield: '8.2%',
    yearsOfGrowth: '55+',
    category: 'High Yield Sin Stock',
    why: 'Altria offers ultra-high yield from tobacco with 55+ years of increases, transitioning to smoke-free',
    safety: 'Pricing power, cash generation, but declining volumes',
    catalysts: ['Smoke-free products', 'Price increases', 'Cannabis potential'],
  },
  {
    ticker: 'PM',
    rank: 14,
    yield: '5.2%',
    yearsOfGrowth: '15+',
    category: 'High Yield International',
    why: 'Philip Morris International with smoke-free product success (IQOS) and high international yield',
    safety: 'IQOS adoption accelerating, international pricing power, strong cash flows',
    catalysts: ['IQOS growth', 'International expansion', 'Smoke-free transition'],
  },
  {
    ticker: 'T',
    rank: 15,
    yield: '5.8%',
    yearsOfGrowth: '2+',
    category: 'High Yield Turnaround',
    why: 'AT&T post-WarnerMedia with reduced but sustainable dividend, focus on wireless and fiber',
    safety: 'Deleveraged balance sheet, stable wireless business, fiber expansion',
    catalysts: ['Fiber growth', 'Wireless pricing', 'Debt reduction'],
  },
  {
    ticker: 'MMM',
    rank: 16,
    yield: '6.0%',
    yearsOfGrowth: '65+',
    category: 'Dividend Aristocrat',
    why: '3M with high yield and 65+ years of increases, undergoing portfolio transformation',
    safety: 'Litigation risks managed, healthcare spinoff completed, diversified industrial',
    catalysts: ['Portfolio optimization', 'Cost reduction', 'End markets recovery'],
  },
  {
    ticker: 'PFE',
    rank: 17,
    yield: '6.5%',
    yearsOfGrowth: '14+',
    category: 'Pharma High Yield',
    why: 'Pfizer with elevated yield post-COVID, strong pipeline and M&A strategy',
    safety: 'Seagen acquisition, cancer portfolio, cost reduction program',
    catalysts: ['Oncology growth', 'Pipeline execution', 'Cost cuts'],
  },
  {
    ticker: 'BMY',
    rank: 18,
    yield: '5.0%',
    yearsOfGrowth: '15+',
    category: 'Pharma Dividend',
    why: 'Bristol Myers Squibb with oncology and immunology focus, high yield with growth potential',
    safety: 'Strong drug portfolio, pipeline depth, improving growth outlook',
    catalysts: ['New drug launches', 'Pipeline progress', 'Margin expansion'],
  },
  {
    ticker: 'SCHD',
    rank: 19,
    yield: '3.5%',
    yearsOfGrowth: 'N/A',
    category: 'Dividend ETF',
    why: 'Schwab US Dividend Equity ETF providing diversified dividend exposure with low fees',
    safety: 'Dividend growth focus, quality screens, diversification across 100+ stocks',
    catalysts: ['Constituent performance', 'Dividend increases', 'Low expense ratio'],
  },
  {
    ticker: 'VYM',
    rank: 20,
    yield: '2.8%',
    yearsOfGrowth: 'N/A',
    category: 'Dividend ETF',
    why: 'Vanguard High Dividend Yield ETF for broad dividend exposure with Vanguard quality',
    safety: '400+ holdings, diversification, ultra-low fees, market-cap weighted',
    catalysts: ['Market performance', 'Dividend growth', 'Rebalancing'],
  },
]

const dividendCategories = [
  {
    name: 'Dividend Aristocrats & Kings',
    description: '25+ years of consecutive dividend increases',
    stocks: ['JNJ', 'PG', 'KO', 'PEP', 'MMM'],
    avgYield: '2.5% - 3.5%',
  },
  {
    name: 'High Yield (5%+)',
    description: 'Stocks yielding 5%+ for income focus',
    stocks: ['VZ', 'MO', 'PM', 'T', 'O', 'MMM', 'PFE'],
    avgYield: '5% - 8%',
  },
  {
    name: 'Dividend Growth',
    description: 'Lower yield but high dividend growth rates',
    stocks: ['UNH', 'NEE', 'ABBV', 'JPM'],
    avgYield: '1.5% - 3.5%',
  },
]

const allDividendStocks = dividendStocks.filter(s => s.ticker !== 'SCHD' && s.ticker !== 'VYM').map(s => s.ticker)

const faqs = [
  {
    question: 'What are the best dividend stocks for 2026?',
    answer: 'The best dividend stocks for 2026 include JNJ (3.2% yield, 62+ years of increases), PG (2.5% yield, Dividend King), XOM and CVX (3.5-3.8% yields with energy upside), ABBV (3.6% yield with 10%+ growth), and O (5.8% monthly dividends). For high yield, consider VZ (6.2%), MO (8.2%), and PFE (6.5%). Best choice depends on goals: aristocrats for safety, high-yielders for income, growth for rising income.',
  },
  {
    question: 'What dividend stocks pay monthly dividends?',
    answer: 'Top monthly dividend stocks include O (Realty Income, 5.8% yield), GLAD (Gladstone Capital), STAG (STAG Industrial), and LTC (LTC Properties). O is the highest quality monthly payer with 29+ years of consecutive increases. Monthly dividends help with cash flow planning and budgeting. Most monthly payers are REITs or BDCs due to their distribution requirements.',
  },
  {
    question: 'Are dividend stocks a good investment in 2026?',
    answer: 'Yes, dividend stocks remain valuable in 2026 with interest rates stabilizing. They provide income (2-8% yields), downside protection in volatility, and total return potential. Dividend aristocrats like JNJ and PG offer safety and growth. High-yielders like XOM and VZ provide income. With 10-year Treasury around 4%, quality dividend stocks yielding 3-6% with growth are attractive. Diversification across dividend categories recommended.',
  },
  {
    question: 'What is a dividend aristocrat?',
    answer: 'Dividend Aristocrats are S&P 500 companies with 25+ consecutive years of dividend increases. Examples include JNJ (62+ years), PG (68+ years), KO (62+ years), and PEP (51+ years). They demonstrate business quality, financial strength, and shareholder commitment. Aristocrats typically have lower yields (2-4%) but safer, growing dividends. Dividend Kings have 50+ years of increases - even more elite.',
  },
  {
    question: 'Should I buy high dividend yield stocks?',
    answer: 'High dividend yields (5%+) can be attractive but require careful analysis. Sustainable high yields like XOM (3.5%) and CVX (3.8%) backed by strong cash flows are good. VZ (6.2%) and T (5.8%) offer telecom stability. However, avoid dividend traps where high yields signal business problems. Check payout ratios (<75% ideal), cash flow coverage, and dividend history. Balance high-yielders with aristocrats for safety.',
  },
  {
    question: 'How much money do I need to invest to live off dividends?',
    answer: 'To generate $50,000 annual income from dividends: Need $1,000,000 at 5% average yield, or $1,430,000 at 3.5% yield. Start with dividend aristocrats (JNJ, PG, XOM, ABBV) for safety, add high-yielders (VZ, O, MO) for income boost. Diversify across 15-20 stocks or use SCHD/VYM ETFs. Build portfolio gradually through dollar-cost averaging. Reinvest dividends early for compound growth, switch to income later.',
  },
  {
    question: 'What are the risks of dividend stocks?',
    answer: 'Key risks include: 1) Dividend cuts during recessions (though aristocrats rarely cut), 2) Interest rate sensitivity (dividends less attractive when rates rise), 3) Sector concentration (many dividend stocks in utilities, REITs), 4) Lower growth potential versus growth stocks, 5) Tax inefficiency in taxable accounts. Mitigate through diversification, focus on dividend growth not just yield, and combine with growth stocks for balance.',
  },
  {
    question: 'Are dividend ETFs better than individual stocks?',
    answer: 'Dividend ETFs like SCHD (3.5% yield) and VYM (2.8% yield) offer instant diversification, lower risk, and professional management. Good for beginners or hands-off investors. Individual dividend stocks allow customization, higher yields with selectivity, and tax-loss harvesting. Best approach: Core ETF position (50-60%) with individual dividend stocks (40-50%) for yield optimization and personal preferences.',
  },
  {
    question: 'How do I build a dividend portfolio for retirement?',
    answer: 'Retirement dividend portfolio strategy: 1) 40% Dividend Aristocrats (JNJ, PG, KO, PEP) for safety, 2) 30% High Yield (XOM, CVX, VZ, O) for income, 3) 20% Dividend Growth (UNH, ABBV, NEE, JPM) for rising income, 4) 10% Dividend ETFs (SCHD, VYM) for diversification. Target 3.5-4.5% average yield with growth potential. Rebalance annually. Consider dividend reinvestment pre-retirement, income-taking post-retirement.',
  },
  {
    question: 'Will dividend stocks outperform in 2026?',
    answer: 'Dividend stocks should perform well in 2026 with stabilizing rates and economic uncertainty. Energy dividends (XOM, CVX) benefit from oil stability. Healthcare dividends (JNJ, ABBV, UNH) offer defensive growth. Financial dividends (JPM) gain from normalized rates. Dividend stocks may underperform high-growth tech but provide superior risk-adjusted returns, income, and downside protection. Expect 8-12% total returns (dividends + appreciation) versus 10-20% for growth stocks.',
  },
]

export default function DividendStocks2026Page() {
  const pageUrl = `${SITE_URL}/insights/dividend-stocks-2026`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Insights', url: `${SITE_URL}/insights` },
    { name: 'Dividend Stocks 2026', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'Best Dividend Stocks for 2026 - High Yield Income Investments',
    description: 'Comprehensive analysis of the best dividend stocks for income investors in 2026.',
    url: pageUrl,
    keywords: ['dividend stocks 2026', 'best dividend stocks', 'high yield stocks'],
  })

  const faqSchema = getFAQSchema(faqs)

  const itemListSchema = getItemListSchema({
    name: 'Best Dividend Stocks for 2026',
    description: 'Top dividend-paying stocks ranked for income investors',
    url: pageUrl,
    items: dividendStocks.map((stock) => ({
      name: stock.ticker,
      url: `${SITE_URL}/dashboard?ticker=${stock.ticker}`,
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
      <main className="min-h-screen bg-black text-white pt-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <nav className="text-sm text-[#868f97] mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            {' / '}
            <Link href="/insights" className="hover:text-white">Insights</Link>
            {' / '}
            <span>Best Dividend Stocks 2026</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Best Dividend Stocks for 2026
          </h1>
          <p className="text-xl text-[#868f97] mb-8">
            Top 20 dividend stocks for income investors in 2026. High-yield stocks, dividend aristocrats,
            and dividend growth stocks with consistent payouts and income potential.
          </p>

          {/* Dividend Investing Overview */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-blue-600/20 to-green-600/20 p-8 rounded-2xl border border-blue-500/20 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">💰</span>
                <div>
                  <h2 className="text-2xl font-bold">Dividend Investing in 2026</h2>
                  <p className="text-[#868f97]">Attractive yields as rates stabilize and economy expands</p>
                </div>
              </div>
              <p className="text-lg">
                Dividend stocks offer compelling opportunities in 2026 with interest rates normalizing and quality companies
                providing 3-8% yields. Focus on dividend aristocrats for safety, high-yielders for income, and dividend growth
                stocks for rising income streams. Combine dividend stocks with growth stocks for balanced portfolio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="text-lg font-bold mb-2">Quality & Safety</h3>
                <p className="text-sm text-[#868f97]">
                  Dividend aristocrats with 25+ years of consecutive increases offer reliability and business quality
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-lg font-bold mb-2">Growing Income</h3>
                <p className="text-sm text-[#868f97]">
                  Dividend growth stocks provide rising income streams that outpace inflation over time
                </p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <div className="text-3xl mb-3">🛡️</div>
                <h3 className="text-lg font-bold mb-2">Downside Protection</h3>
                <p className="text-sm text-[#868f97]">
                  Dividend stocks historically provide better downside protection during market corrections
                </p>
              </div>
            </div>
          </section>

          {/* Dividend Categories */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Dividend Stock Categories</h2>
            <div className="space-y-4">
              {dividendCategories.map((category) => (
                <div key={category.name} className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <span className="text-lg font-bold text-[#4ebe96]">{category.avgYield}</span>
                  </div>
                  <p className="text-[#868f97] mb-4">{category.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {category.stocks.map((stock) => (
                      <Link
                        key={stock}
                        href={`/dashboard?ticker=${stock}`}
                        className="px-3 py-1.5 bg-white/[0.03] rounded-2xl text-sm font-medium hover:bg-green-600/20 hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out"
                      >
                        {stock}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top 20 Dividend Stocks Detailed */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Top 20 Dividend Stock Rankings</h2>
            <div className="space-y-4">
              {dividendStocks.map((stock) => (
                <div key={stock.ticker} className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#4ebe96]/20 rounded-2xl flex items-center justify-center">
                        <span className="text-xl font-bold text-[#4ebe96]">#{stock.rank}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="text-2xl font-bold">{stock.ticker}</h3>
                          <span className="text-lg font-bold text-[#4ebe96]">{stock.yield}</span>
                          <span className="text-xs px-2 py-1 bg-[#4ebe96]/20 text-[#4ebe96] rounded-full">{stock.category}</span>
                        </div>
                        <p className="text-sm text-[#868f97] mb-1">{stock.yearsOfGrowth !== 'N/A' ? `${stock.yearsOfGrowth} years of dividend growth` : 'Dividend ETF'}</p>
                        <p className="text-[#868f97] mb-2">{stock.why}</p>
                        <p className="text-sm text-[#4ebe96]">{stock.safety}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm font-medium text-[#868f97] mb-2 block">2026 Catalysts:</span>
                    <div className="flex flex-wrap gap-2">
                      {stock.catalysts.map((catalyst, i) => (
                        <span key={i} className="text-xs px-3 py-1 bg-white/[0.03] rounded-full">
                          {catalyst}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard?ticker=${stock.ticker}`}
                      className="text-sm px-4 py-2 bg-[#4ebe96]/20 text-[#4ebe96] rounded-2xl hover:bg-blue-600/30 motion-safe:transition-all motion-safe:duration-150 ease-out font-medium"
                    >
                      Dividend Analysis
                    </Link>
                    {stock.ticker !== 'SCHD' && stock.ticker !== 'VYM' && (
                      <>
                        <Link
                          href={`/should-i-buy/${stock.ticker.toLowerCase()}`}
                          className="text-sm px-4 py-2 bg-white/[0.03] rounded-2xl hover:bg-white/[0.03]/80 motion-safe:transition-all motion-safe:duration-150 ease-out"
                        >
                          Should I Buy?
                        </Link>
                        <Link
                          href={`/prediction/${stock.ticker.toLowerCase()}`}
                          className="text-sm px-4 py-2 bg-white/[0.03] rounded-2xl hover:bg-white/[0.03]/80 motion-safe:transition-all motion-safe:duration-150 ease-out"
                        >
                          Price Target
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Reference */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Quick Reference - Individual Stocks</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allDividendStocks.map((stock, i) => (
                <Link
                  key={stock}
                  href={`/dashboard?ticker=${stock}`}
                  className="bg-white/[0.03] backdrop-blur-[10px] p-4 rounded-2xl border border-white/[0.08] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#868f97]">
                      {dividendStocks.find(s => s.ticker === stock)?.yield}
                    </span>
                    <span className="text-xs text-[#4ebe96] opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                  </div>
                  <p className="text-lg font-bold group-hover:text-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out">{stock}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Sample Portfolio Allocations */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Sample Dividend Portfolios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-xl font-bold mb-3">🛡️ Conservative Income</h3>
                <p className="text-sm text-[#868f97] mb-4">
                  Target 3.5% yield, maximum safety
                </p>
                <div className="space-y-1 text-sm">
                  <div>30% Aristocrats: JNJ, PG, KO</div>
                  <div>30% Healthcare: ABBV, UNH</div>
                  <div>20% Energy: XOM, CVX</div>
                  <div>20% ETFs: SCHD, VYM</div>
                </div>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-xl font-bold mb-3">⚖️ Balanced Income</h3>
                <p className="text-sm text-[#868f97] mb-4">
                  Target 4.5% yield, growth potential
                </p>
                <div className="space-y-1 text-sm">
                  <div>25% Aristocrats: JNJ, PG, PEP</div>
                  <div>25% High Yield: XOM, VZ, O</div>
                  <div>25% Growth: ABBV, UNH, NEE</div>
                  <div>25% Financials: JPM</div>
                </div>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08]">
                <h3 className="text-xl font-bold mb-3">💰 High Income</h3>
                <p className="text-sm text-[#868f97] mb-4">
                  Target 6%+ yield, accept higher risk
                </p>
                <div className="space-y-1 text-sm">
                  <div>40% High Yield: VZ, MO, O, PFE</div>
                  <div>30% Energy: XOM, CVX, PM</div>
                  <div>20% Telecom: T, VZ</div>
                  <div>10% Safety: JNJ, ABBV</div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-white/[0.03] backdrop-blur-[10px] p-6 rounded-2xl border border-white/[0.08] group">
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
          <section className="bg-gradient-to-br from-blue-600/20 to-green-600/20 p-8 rounded-2xl border border-blue-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Analyze Dividend Stocks</h2>
            <p className="text-[#868f97] mb-6">
              Research dividend stocks with our AI-powered platform. Get dividend analysis, yield metrics, and financial insights.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-white px-8 py-3 rounded-2xl font-medium"
            >
              Start Dividend Research
            </Link>
          </section>

          {/* Related Links */}
          <section className="mt-12 border-t border-white/[0.08] pt-8">
            <h3 className="text-lg font-bold mb-4">More Investment Insights</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/insights/2026-stock-predictions" className="px-4 py-2 bg-white/[0.03] rounded-2xl hover:bg-white/[0.03]/80 motion-safe:transition-all motion-safe:duration-150 ease-out">
                Market Predictions 2026
              </Link>
              <Link href="/insights/best-stocks-2026" className="px-4 py-2 bg-white/[0.03] rounded-2xl hover:bg-white/[0.03]/80 motion-safe:transition-all motion-safe:duration-150 ease-out">
                Best Stocks 2026
              </Link>
              <Link href="/insights/ai-stocks-2026" className="px-4 py-2 bg-white/[0.03] rounded-2xl hover:bg-white/[0.03]/80 motion-safe:transition-all motion-safe:duration-150 ease-out">
                AI Stocks 2026
              </Link>
              <Link href="/best-stocks/dividend" className="px-4 py-2 bg-white/[0.03] rounded-2xl hover:bg-white/[0.03]/80 motion-safe:transition-all motion-safe:duration-150 ease-out">
                All Dividend Stocks
              </Link>
              <Link href="/best-stocks/value" className="px-4 py-2 bg-white/[0.03] rounded-2xl hover:bg-white/[0.03]/80 motion-safe:transition-all motion-safe:duration-150 ease-out">
                Value Stocks
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
