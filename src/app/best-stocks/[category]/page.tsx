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
    stocks: ['BRK.B', 'JPM', 'BAC', 'WFC', 'C', 'GM', 'F', 'INTC', 'VZ', 'T', 'CVS', 'WBA', 'KHC', 'PARA', 'WBD']
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
