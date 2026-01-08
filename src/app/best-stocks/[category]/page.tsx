import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CategoryLinks } from '@/components/seo/RelatedLinks'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getItemListSchema,
  SITE_URL,
} from '@/lib/seo'

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ category: string }>
}

// Category definitions
const CATEGORIES: Record<string, {
  title: string
  description: string
  keywords: string[]
  criteria: string[]
  stocks: string[]
  disclaimer?: string
}> = {
  'dividend': {
    title: 'Best Dividend Stocks',
    description: 'Top dividend-paying stocks with high yields and consistent payouts for income investors.',
    keywords: ['best dividend stocks', 'high dividend yield stocks', 'dividend investing', 'income stocks'],
    criteria: ['Dividend yield > 2%', 'Consistent dividend history', 'Strong payout ratio', 'Stable earnings'],
    stocks: ['JNJ', 'PG', 'KO', 'PEP', 'VZ', 'T', 'XOM', 'CVX', 'ABBV', 'MO', 'PM', 'O', 'SCHD', 'VYM', 'JEPI']
  },
  'growth': {
    title: 'Best Growth Stocks',
    description: 'Top growth stocks with strong revenue growth, market expansion, and high potential returns.',
    keywords: ['best growth stocks', 'high growth stocks', 'growth investing', 'fast growing companies'],
    criteria: ['Revenue growth > 15%', 'Expanding market share', 'Strong competitive moat', 'Scalable business model'],
    stocks: ['NVDA', 'TSLA', 'AMD', 'CRM', 'SNOW', 'PLTR', 'CRWD', 'DDOG', 'NET', 'SHOP', 'SQ', 'MELI', 'SE', 'RBLX', 'U']
  },
  'value': {
    title: 'Best Value Stocks',
    description: 'Undervalued stocks trading below intrinsic value with strong fundamentals and upside potential.',
    keywords: ['best value stocks', 'undervalued stocks', 'value investing', 'cheap stocks to buy'],
    criteria: ['P/E ratio < 15', 'P/B ratio < 2', 'Strong cash flows', 'Margin of safety'],
    stocks: ['JPM', 'BAC', 'WFC', 'C', 'GM', 'F', 'INTC', 'VZ', 'T', 'CVS', 'WBA', 'KHC', 'PARA', 'WBD', 'USB']
  },
  'tech': {
    title: 'Best Tech Stocks',
    description: 'Top technology stocks leading in AI, cloud computing, semiconductors, and digital transformation.',
    keywords: ['best tech stocks', 'technology stocks', 'AI stocks', 'semiconductor stocks', 'cloud stocks'],
    criteria: ['Technology sector leader', 'Strong R&D investment', 'High growth potential', 'Innovative products'],
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'AVGO', 'ADBE', 'CRM', 'ORCL', 'NOW', 'PANW', 'CRWD']
  },
  'healthcare': {
    title: 'Best Healthcare Stocks',
    description: 'Top healthcare and biotech stocks with strong pipelines, market positions, and growth potential.',
    keywords: ['best healthcare stocks', 'biotech stocks', 'pharma stocks', 'medical stocks'],
    criteria: ['Strong drug pipeline', 'Market leadership', 'Recurring revenue', 'Aging population tailwinds'],
    stocks: ['UNH', 'JNJ', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN', 'GILD', 'REGN', 'VRTX', 'ISRG']
  },
  'energy': {
    title: 'Best Energy Stocks',
    description: 'Top energy stocks including oil, gas, and renewable energy companies with strong dividends.',
    keywords: ['best energy stocks', 'oil stocks', 'natural gas stocks', 'renewable energy stocks'],
    criteria: ['Strong cash flows', 'Low breakeven costs', 'Dividend sustainability', 'Transition strategy'],
    stocks: ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'OXY', 'PSX', 'VLO', 'MPC', 'PXD', 'NEE', 'DUK', 'SO', 'AEP', 'FSLR']
  },
  'ai': {
    title: 'Best AI Stocks',
    description: 'Top artificial intelligence stocks benefiting from the AI revolution and machine learning growth.',
    keywords: ['best AI stocks', 'artificial intelligence stocks', 'machine learning stocks', 'AI investing'],
    criteria: ['AI/ML technology focus', 'Strong competitive position', 'Growing AI revenue', 'Scalable AI products'],
    stocks: ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMD', 'PLTR', 'CRM', 'SNOW', 'AI', 'PATH', 'UPST', 'SMCI', 'ARM', 'MRVL', 'CDNS']
  },
  'small-cap': {
    title: 'Best Small Cap Stocks',
    description: 'Top small-cap stocks with market caps under $2B offering high growth potential and innovation.',
    keywords: ['best small cap stocks', 'small cap investing', 'small cap growth stocks', 'micro cap stocks'],
    criteria: ['Market cap < $2B', 'Strong growth trajectory', 'Niche market leader', 'Scalable business'],
    stocks: ['IONQ', 'RKLB', 'CRDO', 'BROS', 'GTLB', 'ASTS', 'RXRX', 'TMDX', 'FOUR', 'DOCS', 'FRSH', 'ZI', 'ESTC', 'BILL', 'DOMO']
  },
  'large-cap': {
    title: 'Best Large Cap Stocks',
    description: 'Top large-cap stocks with market caps over $10B offering stability, dividends, and reliable growth.',
    keywords: ['best large cap stocks', 'large cap investing', 'blue chip stocks', 'mega cap stocks'],
    criteria: ['Market cap > $10B', 'Market leadership', 'Proven track record', 'Strong financials'],
    stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'UNH', 'JPM', 'V', 'MA', 'WMT', 'PG', 'JNJ', 'XOM']
  },
  'etf': {
    title: 'Best ETFs to Buy',
    description: 'Top exchange-traded funds for diversified exposure across markets, sectors, and asset classes.',
    keywords: ['best ETFs', 'top ETFs to buy', 'ETF investing', 'index fund ETFs'],
    criteria: ['Low expense ratio', 'High liquidity', 'Strong performance history', 'Broad diversification'],
    stocks: ['SPY', 'QQQ', 'VOO', 'IVV', 'VTI', 'VEA', 'IEFA', 'AGG', 'BND', 'GLD', 'TLT', 'EEM', 'VWO', 'SCHD', 'JEPI']
  },
  'penny': {
    title: 'Best Penny Stocks',
    description: 'Speculative penny stocks under $5 with high volatility and potential for significant gains or losses.',
    keywords: ['best penny stocks', 'penny stocks to buy', 'cheap stocks under $5', 'penny stock trading'],
    criteria: ['Price < $5 per share', 'Catalyst potential', 'Trading volume', 'Business viability'],
    stocks: ['SOFI', 'NIO', 'PLUG', 'XPEV', 'F', 'NOK', 'BB', 'SNDL', 'GNUS', 'NAKD', 'CTRM', 'BNGO', 'OCGN', 'SENS', 'ZOM'],
    disclaimer: 'WARNING: Penny stocks are extremely high risk and speculative. Most penny stocks lose value. Only invest money you can afford to lose. Do your own research.'
  },
  'safe': {
    title: 'Safest Stocks for Conservative Investors',
    description: 'Low-risk defensive stocks with stable earnings, consistent dividends, and recession-resistant businesses.',
    keywords: ['safest stocks', 'safe stocks to buy', 'defensive stocks', 'low risk stocks'],
    criteria: ['Low volatility', 'Consistent earnings', 'Strong balance sheet', 'Defensive sector'],
    stocks: ['JNJ', 'PG', 'KO', 'PEP', 'WMT', 'COST', 'MCD', 'WM', 'ED', 'DUK', 'SO', 'NEE', 'AEP', 'XEL', 'D']
  },
  'recession-proof': {
    title: 'Best Recession-Proof Stocks',
    description: 'Recession-resistant stocks in defensive sectors that maintain stability during economic downturns.',
    keywords: ['recession proof stocks', 'recession resistant stocks', 'defensive stocks', 'recession stocks'],
    criteria: ['Essential products/services', 'Pricing power', 'Low cyclicality', 'Strong moat'],
    stocks: ['WMT', 'COST', 'DG', 'DLTR', 'MCD', 'KO', 'PEP', 'JNJ', 'PG', 'CL', 'CLX', 'WM', 'RSG', 'DUK', 'SO']
  },
  'beginner': {
    title: 'Best Stocks for Beginners',
    description: 'Beginner-friendly stocks and ETFs with low volatility, strong track records, and easy-to-understand businesses.',
    keywords: ['best stocks for beginners', 'beginner stocks', 'stocks for new investors', 'easy stocks to buy'],
    criteria: ['Easy to understand', 'Low volatility', 'Blue chip quality', 'Long-term stability'],
    stocks: ['VOO', 'SPY', 'QQQ', 'VTI', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'JNJ', 'PG', 'KO', 'V', 'MA', 'DIS', 'COST']
  },
  'monthly-dividend': {
    title: 'Best Monthly Dividend Stocks',
    description: 'Top stocks and REITs paying monthly dividends for consistent income and cash flow.',
    keywords: ['monthly dividend stocks', 'best monthly dividend stocks', 'monthly income stocks', 'REITs monthly dividends'],
    criteria: ['Monthly dividend payments', 'Sustainable payout', 'Consistent history', 'High yield'],
    stocks: ['O', 'STAG', 'LTC', 'GOOD', 'LAND', 'MAIN', 'GLAD', 'PSEC', 'FDUS', 'AGNC', 'NLY', 'GAIN', 'MPW', 'PECO', 'NEWT']
  },
  'high-growth': {
    title: 'Highest Growth Stocks',
    description: 'Fastest-growing stocks with explosive revenue growth, market disruption, and high return potential.',
    keywords: ['highest growth stocks', 'fast growing stocks', 'hyper growth stocks', 'explosive growth stocks'],
    criteria: ['Revenue growth > 30%', 'Market disruption', 'Large addressable market', 'Strong momentum'],
    stocks: ['NVDA', 'PLTR', 'CRWD', 'SNOW', 'DDOG', 'NET', 'SHOP', 'SQ', 'RBLX', 'U', 'COIN', 'MELI', 'SE', 'DASH', 'ABNB']
  },
  'undervalued': {
    title: 'Most Undervalued Stocks',
    description: 'Deep value stocks trading significantly below fair value with strong upside potential.',
    keywords: ['most undervalued stocks', 'undervalued stocks to buy', 'cheap stocks', 'value stocks'],
    criteria: ['Trading below intrinsic value', 'Catalyst for rerating', 'Strong fundamentals', 'Margin of safety'],
    stocks: ['INTC', 'PYPL', 'DIS', 'BABA', 'PFE', 'CVS', 'WBA', 'F', 'GM', 'C', 'WBD', 'PARA', 'NKE', 'SBUX', 'MU']
  },
  'momentum': {
    title: 'Best Momentum Stocks',
    description: 'High-momentum stocks with strong price trends, technical strength, and trading volume.',
    keywords: ['best momentum stocks', 'momentum trading stocks', 'trending stocks', 'stocks with momentum'],
    criteria: ['Strong price momentum', 'High relative strength', 'Volume confirmation', 'Trend continuation'],
    stocks: ['NVDA', 'PLTR', 'TSLA', 'SMCI', 'AVGO', 'AMD', 'ARM', 'COIN', 'MARA', 'RIOT', 'MSTR', 'HOOD', 'CVNA', 'APP', 'IONQ']
  },
  'blue-chip': {
    title: 'Best Blue Chip Stocks',
    description: 'Established blue-chip companies with long histories, strong brands, and reliable performance.',
    keywords: ['best blue chip stocks', 'blue chip investing', 'reliable stocks', 'quality stocks'],
    criteria: ['Market cap > $50B', 'Decades of history', 'Strong brand value', 'Consistent performance'],
    stocks: ['AAPL', 'MSFT', 'JNJ', 'JPM', 'V', 'MA', 'WMT', 'PG', 'KO', 'PEP', 'DIS', 'MCD', 'NKE', 'HD', 'UNH']
  },
  'index-fund': {
    title: 'Best Index Funds',
    description: 'Top index funds for passive investing with broad market exposure and ultra-low fees.',
    keywords: ['best index funds', 'index fund investing', 'passive investing', 'low cost index funds'],
    criteria: ['Ultra-low expense ratio', 'Tracks major index', 'High assets under management', 'Tax efficient'],
    stocks: ['VOO', 'VTI', 'VXUS', 'VEA', 'VWO', 'SCHD', 'SCHX', 'VIG', 'VYM', 'BND', 'BNDX', 'VNQ', 'VGT', 'VHT', 'VFH']
  },
  'reit': {
    title: 'Best REIT Stocks',
    description: 'Top real estate investment trusts with strong properties, high dividends, and growth potential.',
    keywords: ['best REIT stocks', 'real estate investment trusts', 'REIT investing', 'real estate stocks'],
    criteria: ['Quality property portfolio', 'High dividend yield', 'Strong occupancy rates', 'Growth strategy'],
    stocks: ['O', 'PLD', 'AMT', 'EQIX', 'PSA', 'WELL', 'DLR', 'SPG', 'AVB', 'EQR', 'VTR', 'ARE', 'VICI', 'IRM', 'CUBE']
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = CATEGORIES[category.toLowerCase()]

  if (!cat) {
    return { title: 'Best Stocks | Lician' }
  }

  const currentYear = new Date().getFullYear()

  return {
    title: `${cat.title} ${currentYear} - Top Picks & Analysis`,
    description: cat.description,
    keywords: cat.keywords,
    openGraph: {
      title: `${cat.title} ${currentYear}`,
      description: cat.description,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/best-stocks/${category.toLowerCase()}`,
    },
  }
}

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }))
}

export default async function BestStocksPage({ params }: Props) {
  const { category } = await params
  const cat = CATEGORIES[category.toLowerCase()]

  if (!cat) {
    notFound()
  }

  const currentYear = new Date().getFullYear()
  const pageUrl = `${SITE_URL}/best-stocks/${category.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Best Stocks', url: `${SITE_URL}/best-stocks` },
    { name: cat.title, url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${cat.title} ${currentYear} - Top Picks & Analysis`,
    description: cat.description,
    url: pageUrl,
    keywords: cat.keywords,
  })

  // ItemList Schema for the stock list
  const itemListSchema = getItemListSchema({
    name: `${cat.title} ${currentYear}`,
    description: cat.description,
    url: pageUrl,
    items: cat.stocks.map((stock, index) => ({
      name: stock,
      url: `${SITE_URL}/stock/${stock}`,
      position: index + 1,
    })),
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema, articleSchema, itemListSchema]) }}
      />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{cat.title}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">
            {cat.title} {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {cat.description}
          </p>

          {/* High Risk Disclaimer for Penny Stocks */}
          {cat.disclaimer && (
            <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="text-lg font-bold text-red-500 mb-2">High Risk Warning</h3>
                  <p className="text-sm text-red-400">{cat.disclaimer}</p>
                </div>
              </div>
            </div>
          )}

          {/* Selection Criteria */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Selection Criteria</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <ul className="grid grid-cols-2 gap-4">
                {cat.criteria.map((criterion, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-500">&#10003;</span>
                    <span>{criterion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Stock List */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Top Picks</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {cat.stocks.map((stock, i) => (
                <Link
                  key={stock}
                  href={`/dashboard?ticker=${stock}`}
                  className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                    <span className="text-xs text-green-500">View</span>
                  </div>
                  <p className="text-lg font-bold">{stock}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Quick Analysis Links for Each Stock */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Quick Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cat.stocks.slice(0, 6).map((stock) => (
                <div key={stock} className="bg-card p-4 rounded-lg border border-border">
                  <p className="font-bold text-lg mb-2">{stock}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Link href={`/should-i-buy/${stock.toLowerCase()}`} className="text-green-500 hover:underline">
                      Should I Buy?
                    </Link>
                    <span className="text-muted-foreground">|</span>
                    <Link href={`/prediction/${stock.toLowerCase()}`} className="text-green-500 hover:underline">
                      Prediction
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">Get AI-Powered Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed analysis, DCF valuations, and AI insights for any stock
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
            >
              Start Research
            </Link>
          </section>

          {/* Category Links */}
          <CategoryLinks currentCategory={category} />
        </div>
      </main>
    </>
  )
}
