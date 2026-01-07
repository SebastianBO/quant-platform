import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SITE_URL } from '@/lib/seo'

interface Props {
  params: Promise<{ ticker: string }>
}

// Force dynamic - this redirect page should not be pre-rendered
export const dynamic = 'force-dynamic'

// List of valid stock tickers (top 100 most searched)
const TOP_TICKERS = [
  'aapl', 'msft', 'googl', 'amzn', 'nvda', 'meta', 'tsla', 'v', 'jpm',
  'wmt', 'jnj', 'pg', 'ma', 'hd', 'cvx', 'abbv', 'ko', 'pep', 'cost',
  'avgo', 'mrk', 'adbe', 'crm', 'nflx', 'tmo', 'csco', 'acn', 'dis', 'abt',
  'nke', 'vz', 'intc', 'cmcsa', 'amd', 'pfe', 'wfc', 'bac', 'orcl', 'dhr',
  'txn', 'qcom', 'cat', 'ge', 'intu', 'spgi', 'low', 'ups', 'ibm', 'amgn',
  'sbux', 'hon', 'cvs', 'amat', 'gs', 'ms', 'axp', 'de', 'rtx', 'ely',
  'pltr', 'snow', 'crwd', 'ddog', 'net', 'shop', 'sq', 'pypl', 'coin', 'uber',
  'lyft', 'abnb', 'zm', 'docu', 'roku', 'snap', 'pins', 'spot', 'rivn', 'lcid',
  'nio', 'f', 'gm', 'dal', 'aal', 'ba', 'luv', 'nclh', 'ccl', 'rcl',
  'mara', 'riot', 'btbt', 'sofi', 'hood', 'afrm', 'upst', 'lc', 'pton', 'bynd',
]

// Generate metadata with canonical to main stock page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params
  const symbol = ticker.toUpperCase()
  const currentYear = new Date().getFullYear()

  // Fetch stock data for rich metadata
  let companyName = symbol
  let price: number | undefined
  let description = `${symbol} stock analysis`

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock?ticker=${symbol}`,
      { next: { revalidate: 3600 } }
    )
    if (response.ok) {
      const data = await response.json()
      companyName = data.companyFacts?.name || symbol
      price = data.snapshot?.price
      description = data.companyFacts?.description?.slice(0, 160) ||
        `${companyName} (${symbol}) stock analysis, price charts, financial statements, and AI-powered investment insights.`
    }
  } catch {
    // Use fallback metadata if fetch fails
  }

  const title = `${symbol} Stock - ${companyName} Analysis & Price ${currentYear}`
  const fullDescription = `${symbol} stock (${companyName}): ${price ? `Current price $${price.toFixed(2)}.` : ''} View real-time quotes, financial analysis, DCF valuation, institutional ownership, insider trades, and AI-powered investment insights.`

  return {
    title,
    description: fullDescription,
    keywords: [
      `${symbol} stock`,
      `${symbol.toLowerCase()} stock`,
      `${symbol} stock price`,
      `${symbol} stock analysis`,
      `${companyName} stock`,
      `buy ${symbol} stock`,
      `${symbol} forecast ${currentYear}`,
    ],
    openGraph: {
      title: `${symbol} Stock - ${companyName}`,
      description: fullDescription,
      type: 'article',
      url: `${SITE_URL}/${ticker.toLowerCase()}-stock`,
      images: [
        {
          url: `${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`,
          width: 1200,
          height: 630,
          alt: `${symbol} Stock Analysis`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${symbol} Stock Analysis`,
      description: fullDescription,
      images: [`${SITE_URL}/api/og/stock/${ticker.toLowerCase()}`],
    },
    // IMPORTANT: Canonical URL points to main stock page to avoid duplicate content
    alternates: {
      canonical: `${SITE_URL}/stock/${ticker.toLowerCase()}`,
    },
  }
}

// Optional: Generate static params for top tickers (can help with crawling)
// Uncomment if you want to pre-generate these pages
// export async function generateStaticParams() {
//   return TOP_TICKERS.map((ticker) => ({
//     ticker: ticker.toLowerCase(),
//   }))
// }

export default async function TickerStockPage({ params }: Props) {
  const { ticker } = await params

  // Redirect to the canonical stock page
  // This ensures users see the main page while the URL variant helps with SEO discovery
  redirect(`/stock/${ticker.toLowerCase()}`)
}
