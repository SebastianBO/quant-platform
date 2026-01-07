import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase, CompanyFundamentals } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getItemListSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ sector: string }>
}

// Sector mapping: slug -> database sector values
const SECTOR_MAPPINGS: Record<string, string[]> = {
  'technology': ['Technology'],
  'healthcare': ['Healthcare'],
  'financials': ['Financial Services', 'Financials'],
  'energy': ['Energy'],
  'consumer-discretionary': ['Consumer Cyclical', 'Consumer Discretionary'],
  'consumer-staples': ['Consumer Defensive', 'Consumer Staples'],
  'industrials': ['Industrials'],
  'materials': ['Basic Materials', 'Materials'],
  'utilities': ['Utilities'],
  'real-estate': ['Real Estate'],
  'communication-services': ['Communication Services'],
}

// Sector definitions with metadata (stocks are now fetched dynamically)
const SECTORS: Record<string, {
  title: string
  description: string
  longDescription: string
  keywords: string[]
  relatedSectors: string[]
  faqs: { question: string; answer: string }[]
}> = {
  'technology': {
    title: 'Technology Sector Stocks',
    description: 'Top technology stocks including software, semiconductors, cloud computing, AI, and tech hardware companies.',
    longDescription: 'The technology sector encompasses companies driving digital transformation, from mega-cap tech giants to innovative software startups. This sector includes semiconductors, cloud infrastructure, enterprise software, cybersecurity, and artificial intelligence companies.',
    keywords: ['tech stocks', 'technology stocks', 'best tech stocks', 'semiconductor stocks', 'software stocks', 'cloud computing stocks'],
    relatedSectors: ['communication-services', 'consumer-discretionary', 'industrials'],
    faqs: [
      {
        question: 'What are the best technology stocks to buy?',
        answer: 'Top technology stocks include established giants like Apple (AAPL), Microsoft (MSFT), and Nvidia (NVDA), as well as high-growth software companies like Salesforce (CRM) and Snowflake (SNOW). The best choice depends on your investment goals and risk tolerance.'
      },
      {
        question: 'What sub-sectors are in technology?',
        answer: 'Technology includes semiconductors (NVDA, AMD), software (MSFT, CRM), cloud computing (AMZN, GOOGL), cybersecurity (CRWD, PANW), hardware (AAPL), and emerging areas like AI and quantum computing.'
      },
      {
        question: 'Are tech stocks good for long-term investing?',
        answer: 'Technology stocks have historically provided strong long-term returns due to innovation and secular growth trends. However, they can be volatile and valuations can fluctuate significantly. Diversification within tech is recommended.'
      },
      {
        question: 'How does AI impact technology stocks?',
        answer: 'AI is a major growth driver for tech stocks, benefiting semiconductor companies (NVDA, AMD), cloud providers (MSFT, GOOGL), and AI-focused companies (PLTR, AI). Companies with AI capabilities are seeing increased investor interest.'
      }
    ]
  },
  'healthcare': {
    title: 'Healthcare Sector Stocks',
    description: 'Top healthcare stocks including pharmaceuticals, biotechnology, medical devices, and health insurance companies.',
    longDescription: 'The healthcare sector includes pharmaceutical companies, biotechnology innovators, medical device manufacturers, health insurers, and healthcare services. This defensive sector benefits from aging demographics and continuous medical innovation.',
    keywords: ['healthcare stocks', 'biotech stocks', 'pharma stocks', 'best healthcare stocks', 'medical device stocks', 'health insurance stocks'],
    relatedSectors: ['consumer-staples', 'industrials'],
    faqs: [
      {
        question: 'What are the best healthcare stocks?',
        answer: 'Top healthcare stocks include UnitedHealth (UNH), Eli Lilly (LLY), Johnson & Johnson (JNJ), and innovative biotech companies like Vertex (VRTX) and Regeneron (REGN). The sector offers both growth and defensive characteristics.'
      },
      {
        question: 'What is the difference between pharma and biotech stocks?',
        answer: 'Pharmaceutical companies typically have established drug portfolios and stable revenues (JNJ, MRK), while biotech companies (VRTX, REGN) focus on innovative therapies and may be pre-revenue or have concentrated product portfolios, making them higher risk but potentially higher reward.'
      },
      {
        question: 'Are healthcare stocks recession-proof?',
        answer: 'Healthcare is considered defensive because demand for medical care remains relatively stable during economic downturns. However, specific segments like elective procedures and biotech can be more cyclical.'
      },
      {
        question: 'How do drug patents affect pharma stocks?',
        answer: 'Patent expirations can significantly impact pharmaceutical stocks as generic competition reduces revenue. Investors should monitor pipeline drugs and patent cliffs when evaluating pharma companies.'
      }
    ]
  },
  'financials': {
    title: 'Financial Sector Stocks',
    description: 'Top financial stocks including banks, investment firms, insurance companies, payment processors, and asset managers.',
    longDescription: 'The financial sector encompasses banking, insurance, asset management, payment processing, and financial services. These companies benefit from economic growth, interest rates, and increasing financial activity.',
    keywords: ['financial stocks', 'bank stocks', 'best financial stocks', 'insurance stocks', 'payment stocks', 'fintech stocks'],
    relatedSectors: ['real-estate', 'technology', 'industrials'],
    faqs: [
      {
        question: 'What are the best financial stocks to buy?',
        answer: 'Top financial stocks include mega-cap banks like JPMorgan (JPM) and Bank of America (BAC), payment networks Visa (V) and Mastercard (MA), and diversified Berkshire Hathaway (BRK.B). Each sub-sector has different risk-return profiles.'
      },
      {
        question: 'How do interest rates affect bank stocks?',
        answer: 'Higher interest rates typically benefit banks by increasing net interest margins (the spread between lending and deposit rates). However, rapid rate increases can also slow loan growth and increase default risk.'
      },
      {
        question: 'Are payment stocks better than banks?',
        answer: 'Payment processors like Visa and Mastercard have higher margins and growth rates than traditional banks because they don\'t take credit risk. However, they face different risks like regulatory changes and digital competition.'
      },
      {
        question: 'What makes a good financial stock investment?',
        answer: 'Look for strong capital ratios, consistent earnings, reasonable valuations, dividend history, and management quality. For banks, net interest margin and loan quality are key metrics. For insurers, combined ratio and underwriting discipline matter most.'
      }
    ]
  },
  'energy': {
    title: 'Energy Sector Stocks',
    description: 'Top energy stocks including oil & gas producers, refiners, midstream companies, and renewable energy firms.',
    longDescription: 'The energy sector includes oil and gas exploration and production, refining, midstream infrastructure, and renewable energy. Energy stocks are cyclical and influenced by commodity prices, geopolitics, and the energy transition.',
    keywords: ['energy stocks', 'oil stocks', 'best energy stocks', 'renewable energy stocks', 'natural gas stocks', 'clean energy stocks'],
    relatedSectors: ['utilities', 'materials', 'industrials'],
    faqs: [
      {
        question: 'What are the best energy stocks?',
        answer: 'Top energy stocks include integrated majors like ExxonMobil (XOM) and Chevron (CVX), pure-play producers like ConocoPhillips (COP), and renewable leaders like NextEra Energy (NEE). Energy stocks offer dividends and commodity price exposure.'
      },
      {
        question: 'Should I invest in oil stocks or renewable energy?',
        answer: 'Traditional oil and gas companies offer higher current cash flows and dividends, while renewable energy companies offer growth potential. Many investors hold both as the energy transition unfolds over decades.'
      },
      {
        question: 'How do oil prices affect energy stocks?',
        answer: 'Energy stocks are highly correlated with oil and gas prices. Upstream producers benefit most from higher prices, while refiners can face margin compression. Integrated companies balance upstream and downstream exposure.'
      },
      {
        question: 'Are energy stocks good dividend investments?',
        answer: 'Many energy stocks offer attractive dividends, particularly integrated majors and midstream companies. However, dividends can be cut during commodity price downturns, so financial strength is important.'
      }
    ]
  },
  'consumer-discretionary': {
    title: 'Consumer Discretionary Stocks',
    description: 'Top consumer discretionary stocks including retail, automotive, restaurants, travel, and entertainment companies.',
    longDescription: 'Consumer discretionary includes companies selling non-essential goods and services like automobiles, retail, restaurants, hotels, and entertainment. These cyclical stocks benefit from economic growth and consumer confidence.',
    keywords: ['consumer discretionary stocks', 'retail stocks', 'best retail stocks', 'restaurant stocks', 'auto stocks', 'e-commerce stocks'],
    relatedSectors: ['communication-services', 'technology', 'consumer-staples'],
    faqs: [
      {
        question: 'What are consumer discretionary stocks?',
        answer: 'Consumer discretionary stocks are companies that sell non-essential products and services like cars, restaurants, retail, travel, and entertainment. Unlike consumer staples, spending in this sector is more sensitive to economic conditions.'
      },
      {
        question: 'What are the best consumer discretionary stocks?',
        answer: 'Top performers include e-commerce leader Amazon (AMZN), home improvement retailers Home Depot (HD) and Lowe\'s (LOW), restaurants like McDonald\'s (MCD) and Chipotle (CMG), and brands like Nike (NKE).'
      },
      {
        question: 'Are consumer discretionary stocks good during recessions?',
        answer: 'Consumer discretionary stocks typically underperform during recessions as consumers cut non-essential spending. However, value retailers and strong brands often hold up better than luxury or discretionary categories.'
      },
      {
        question: 'How is e-commerce changing retail stocks?',
        answer: 'E-commerce growth has benefited online retailers like Amazon while pressuring traditional brick-and-mortar stores. Successful retailers are investing in omnichannel capabilities to compete effectively.'
      }
    ]
  },
  'consumer-staples': {
    title: 'Consumer Staples Stocks',
    description: 'Top consumer staples stocks including food, beverage, household products, and personal care companies.',
    longDescription: 'Consumer staples companies produce essential products like food, beverages, household items, and personal care products. This defensive sector offers stable demand and consistent dividends regardless of economic conditions.',
    keywords: ['consumer staples stocks', 'food stocks', 'beverage stocks', 'best consumer staples', 'dividend stocks', 'defensive stocks'],
    relatedSectors: ['healthcare', 'consumer-discretionary', 'materials'],
    faqs: [
      {
        question: 'What are consumer staples stocks?',
        answer: 'Consumer staples are companies that produce essential everyday products like food, beverages, household supplies, and personal care items. Examples include Procter & Gamble (PG), Coca-Cola (KO), and Walmart (WMT).'
      },
      {
        question: 'Why invest in consumer staples?',
        answer: 'Consumer staples offer defensive characteristics with stable earnings and dividends because demand remains consistent regardless of economic conditions. They tend to outperform during recessions and market volatility.'
      },
      {
        question: 'What are the best consumer staples stocks?',
        answer: 'Top consumer staples include brand powerhouses like Procter & Gamble (PG), beverage giants Coca-Cola (KO) and PepsiCo (PEP), and retailers Costco (COST) and Walmart (WMT). These companies have strong pricing power and loyal customers.'
      },
      {
        question: 'Do consumer staples stocks pay good dividends?',
        answer: 'Yes, consumer staples typically offer attractive dividends with long histories of increases. Companies like Procter & Gamble and Coca-Cola are Dividend Aristocrats with 50+ years of consecutive dividend growth.'
      }
    ]
  },
  'industrials': {
    title: 'Industrial Sector Stocks',
    description: 'Top industrial stocks including aerospace, manufacturing, defense, construction, and transportation companies.',
    longDescription: 'The industrial sector includes aerospace, defense, machinery, construction, transportation, and industrial conglomerates. These cyclical companies benefit from economic growth, infrastructure spending, and global trade.',
    keywords: ['industrial stocks', 'aerospace stocks', 'defense stocks', 'manufacturing stocks', 'construction stocks', 'transportation stocks'],
    relatedSectors: ['materials', 'technology', 'energy'],
    faqs: [
      {
        question: 'What are industrial stocks?',
        answer: 'Industrial stocks include companies in aerospace (BA, GE), defense (LMT, RTX), machinery (CAT, DE), transportation (UNP, UPS), and construction. These companies serve businesses and government rather than consumers.'
      },
      {
        question: 'What are the best industrial stocks?',
        answer: 'Top industrial stocks include Caterpillar (CAT), Boeing (BA), Honeywell (HON), United Parcel Service (UPS), and railroads like Union Pacific (UNP). Defense contractors like Lockheed Martin (LMT) offer stable government revenues.'
      },
      {
        question: 'Are industrial stocks cyclical?',
        answer: 'Yes, most industrial stocks are cyclical and sensitive to economic growth. However, defense contractors and waste management companies offer more defensive characteristics with stable government contracts or essential services.'
      },
      {
        question: 'How does infrastructure spending affect industrial stocks?',
        answer: 'Infrastructure spending benefits construction equipment makers (CAT), engineering firms, materials companies, and railroads. Government infrastructure bills can provide multi-year tailwinds for the sector.'
      }
    ]
  },
  'materials': {
    title: 'Materials Sector Stocks',
    description: 'Top materials stocks including chemicals, metals & mining, packaging, and specialty materials companies.',
    longDescription: 'The materials sector produces industrial commodities including chemicals, metals, mining, packaging, paper, and construction materials. These cyclical companies are sensitive to commodity prices and global economic growth.',
    keywords: ['materials stocks', 'mining stocks', 'chemical stocks', 'metals stocks', 'commodity stocks', 'materials sector'],
    relatedSectors: ['industrials', 'energy', 'utilities'],
    faqs: [
      {
        question: 'What are materials stocks?',
        answer: 'Materials stocks include companies producing chemicals (LIN, DOW), metals and mining (NEM, FCX), packaging (BALL, PKG), and construction materials (VMC, MLM). They provide raw materials to other industries.'
      },
      {
        question: 'What are the best materials stocks?',
        answer: 'Top materials stocks include industrial gas leader Linde (LIN), chemical companies like DuPont (DD), miners like Newmont (NEM) and Freeport-McMoRan (FCX), and steel producers like Nucor (NUE).'
      },
      {
        question: 'Are materials stocks affected by commodity prices?',
        answer: 'Yes, materials stocks are highly sensitive to underlying commodity prices like copper, gold, chemicals, and steel. Miners and metal producers see direct price exposure, while chemical companies face both input and output price dynamics.'
      },
      {
        question: 'How does inflation affect materials stocks?',
        answer: 'Materials stocks can benefit from inflation as commodity prices and input costs rise. They often have pricing power to pass costs through. However, demand destruction from high prices can be a headwind.'
      }
    ]
  },
  'utilities': {
    title: 'Utilities Sector Stocks',
    description: 'Top utility stocks including electric, natural gas, water utilities, and renewable energy infrastructure.',
    longDescription: 'Utilities provide essential services including electricity, natural gas, and water. This defensive sector offers stable cash flows, consistent dividends, and regulated returns, making it popular with income investors.',
    keywords: ['utility stocks', 'electric utility stocks', 'best utility stocks', 'dividend utility stocks', 'renewable utilities', 'power stocks'],
    relatedSectors: ['energy', 'real-estate', 'consumer-staples'],
    faqs: [
      {
        question: 'What are utility stocks?',
        answer: 'Utility stocks are companies providing essential services like electricity, natural gas, and water. Examples include NextEra Energy (NEE), Duke Energy (DUK), and Southern Company (SO). They operate in regulated markets with stable cash flows.'
      },
      {
        question: 'Why invest in utility stocks?',
        answer: 'Utilities offer defensive characteristics with predictable earnings, high dividend yields, and low volatility. They perform well during market downturns and provide steady income for conservative investors.'
      },
      {
        question: 'What are the best utility stocks for dividends?',
        answer: 'Top utility dividend stocks include NextEra Energy (NEE), Duke Energy (DUK), Southern Company (SO), and American Electric Power (AEP). Many utilities are Dividend Aristocrats with decades of consecutive increases.'
      },
      {
        question: 'How do interest rates affect utility stocks?',
        answer: 'Utility stocks are sensitive to interest rates because they carry significant debt and compete with bonds for income investors. Rising rates can pressure utility valuations, while falling rates typically benefit the sector.'
      }
    ]
  },
  'real-estate': {
    title: 'Real Estate Sector Stocks',
    description: 'Top real estate stocks including REITs across residential, commercial, data centers, cell towers, and healthcare properties.',
    longDescription: 'The real estate sector includes Real Estate Investment Trusts (REITs) that own and operate property portfolios. Subsectors include residential, commercial, retail, industrial, data centers, cell towers, and specialized healthcare properties.',
    keywords: ['REIT stocks', 'real estate stocks', 'best REITs', 'real estate investment', 'property stocks', 'commercial real estate'],
    relatedSectors: ['financials', 'utilities', 'consumer-discretionary'],
    faqs: [
      {
        question: 'What are REIT stocks?',
        answer: 'REITs (Real Estate Investment Trusts) are companies that own and operate income-producing properties. They must distribute 90% of taxable income as dividends, making them attractive for income investors. Examples include Prologis (PLD) and American Tower (AMT).'
      },
      {
        question: 'What are the different types of REITs?',
        answer: 'Major REIT categories include industrial/warehouse (PLD), cell towers (AMT, CCI), data centers (EQIX, DLR), residential (AVB, EQR), retail (SPG), healthcare (WELL), and self-storage (PSA). Each has different growth and risk characteristics.'
      },
      {
        question: 'What are the best REIT stocks?',
        answer: 'Top REITs include Prologis (PLD) for industrial properties, American Tower (AMT) for cell towers, Equinix (EQIX) for data centers, and Public Storage (PSA) for self-storage. Technology-related REITs have shown particularly strong growth.'
      },
      {
        question: 'How do interest rates affect REITs?',
        answer: 'REITs are sensitive to interest rates because they carry debt and compete with bonds for yield. However, strong REITs can pass through inflation via rent increases, and property values may appreciate over time.'
      }
    ]
  },
  'communication-services': {
    title: 'Communication Services Stocks',
    description: 'Top communication services stocks including social media, telecom, streaming, gaming, and entertainment companies.',
    longDescription: 'Communication services includes traditional telecom providers, social media platforms, streaming services, gaming companies, and entertainment conglomerates. This diverse sector combines growth tech companies with stable telecom utilities.',
    keywords: ['communication stocks', 'telecom stocks', 'media stocks', 'social media stocks', 'streaming stocks', 'entertainment stocks'],
    relatedSectors: ['technology', 'consumer-discretionary', 'industrials'],
    faqs: [
      {
        question: 'What are communication services stocks?',
        answer: 'Communication services includes social media (META, GOOGL), streaming (NFLX, DIS), telecom (VZ, T, TMUS), cable (CMCSA), gaming (EA, TTWO), and traditional media. The sector combines high-growth tech with stable telecom.'
      },
      {
        question: 'What are the best communication services stocks?',
        answer: 'Top performers include Alphabet/Google (GOOGL), Meta (META), Netflix (NFLX), and T-Mobile (TMUS). Each subsector offers different characteristics - tech platforms offer growth while telecom provides dividends and stability.'
      },
      {
        question: 'How are streaming services changing media stocks?',
        answer: 'Streaming has disrupted traditional media, benefiting Netflix (NFLX) and Disney (DIS) while pressuring cable companies. The shift to direct-to-consumer models offers growth but requires significant content investment.'
      },
      {
        question: 'Are telecom stocks good for dividends?',
        answer: 'Traditional telecom companies like Verizon (VZ) and AT&T (T) offer high dividend yields due to stable cash flows from essential services. However, heavy debt loads and competition can limit growth and pressure dividends.'
      }
    ]
  }
}

// Helper functions for formatting
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return `$${marketCap.toLocaleString()}`
}

// Fetch stocks from Supabase based on sector
async function fetchSectorStocks(sectorSlug: string): Promise<CompanyFundamentals[]> {
  const sectorNames = SECTOR_MAPPINGS[sectorSlug]
  if (!sectorNames) {
    return []
  }

  // Build OR condition for multiple sector names
  const sectorConditions = sectorNames.map(name => `sector.ilike.%${name}%`).join(',')

  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('*')
    .or(sectorConditions)
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(100)

  if (error) {
    console.error('Error fetching sector stocks:', error)
    return []
  }

  return (data || []) as CompanyFundamentals[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector } = await params
  const sectorData = SECTORS[sector.toLowerCase()]

  if (!sectorData) {
    return { title: 'Sectors | Lician' }
  }

  const currentYear = new Date().getFullYear()

  return {
    title: `${sectorData.title} ${currentYear} - Top Stocks & Analysis`,
    description: sectorData.description,
    keywords: sectorData.keywords,
    openGraph: {
      title: `${sectorData.title} ${currentYear}`,
      description: sectorData.description,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/sectors/${sector.toLowerCase()}`,
    },
  }
}

// Dynamic rendering - Supabase needs env vars at runtime
export const revalidate = 3600

// No static params - render on demand
// export async function generateStaticParams() {
//   return Object.keys(SECTORS).map((sector) => ({ sector }))
// }

export default async function SectorPage({ params }: Props) {
  const { sector } = await params
  const sectorData = SECTORS[sector.toLowerCase()]

  if (!sectorData) {
    notFound()
  }

  // Fetch real stocks from Supabase
  const allStocks = await fetchSectorStocks(sector.toLowerCase())
  const topStocks = allStocks.slice(0, 20)

  const currentYear = new Date().getFullYear()
  const pageUrl = `${SITE_URL}/sectors/${sector.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Sectors', url: `${SITE_URL}/sectors` },
    { name: sectorData.title, url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `${sectorData.title} ${currentYear} - Top Stocks & Analysis`,
    description: sectorData.description,
    url: pageUrl,
    keywords: sectorData.keywords,
  })

  // ItemList Schema for the stock list
  const itemListSchema = getItemListSchema({
    name: `Top ${topStocks.length} ${sectorData.title} ${currentYear}`,
    description: sectorData.description,
    url: pageUrl,
    items: topStocks.map((stock, index) => ({
      name: stock.ticker,
      url: `${SITE_URL}/stock/${stock.ticker}`,
      position: index + 1,
    })),
  })

  // FAQ Schema
  const faqSchema = getFAQSchema(sectorData.faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, itemListSchema, faqSchema])
        }}
      />
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/sectors" className="hover:text-foreground">Sectors</Link>
            {' / '}
            <span>{sectorData.title}</span>
          </nav>

          {/* Header */}
          <h1 className="text-4xl font-bold mb-4">
            {sectorData.title} {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            {sectorData.description}
          </p>
          <p className="text-base text-muted-foreground mb-8">
            {sectorData.longDescription}
          </p>

          {/* Top Stocks Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Top {topStocks.length} {sectorData.title}
            </h2>
            {topStocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topStocks.map((stock, i) => (
                  <Link
                    key={stock.ticker}
                    href={`/dashboard?ticker=${stock.ticker}`}
                    className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">#{i + 1}</span>
                          <span className="text-xl font-bold">{stock.ticker}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {stock.company_name || stock.ticker}
                        </p>
                      </div>
                      <span className="text-xs text-green-500">View</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Market Cap</p>
                        <p className="font-semibold">
                          {stock.market_cap ? formatMarketCap(stock.market_cap) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">P/E Ratio</p>
                        <p className={`font-semibold ${
                          stock.pe_ratio && stock.pe_ratio < 15
                            ? 'text-green-500'
                            : stock.pe_ratio && stock.pe_ratio > 30
                            ? 'text-red-500'
                            : ''
                        }`}>
                          {stock.pe_ratio ? stock.pe_ratio.toFixed(2) : '—'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card p-8 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">No stocks found in this sector.</p>
              </div>
            )}
          </section>

          {/* Quick Analysis Links */}
          {topStocks.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Stock Analysis Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topStocks.slice(0, 6).map((stock) => (
                  <div key={stock.ticker} className="bg-card p-5 rounded-lg border border-border">
                    <p className="font-bold text-lg mb-3">{stock.ticker}</p>
                    <div className="flex flex-col gap-2 text-sm">
                      <Link
                        href={`/should-i-buy/${stock.ticker.toLowerCase()}`}
                        className="text-green-500 hover:underline"
                      >
                        Should I Buy {stock.ticker}?
                      </Link>
                      <Link
                        href={`/prediction/${stock.ticker.toLowerCase()}`}
                        className="text-green-500 hover:underline"
                      >
                        {stock.ticker} Price Prediction {currentYear}
                      </Link>
                      <Link
                        href={`/stock/${stock.ticker}`}
                        className="text-green-500 hover:underline"
                      >
                        {stock.ticker} Stock Analysis
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stock Comparisons */}
          {topStocks.length > 1 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Compare Top Stocks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topStocks.slice(0, 5).map((stock1, i) => {
                  const stock2 = topStocks[i + 1]
                  if (!stock2) return null
                  return (
                    <Link
                      key={`${stock1.ticker}-${stock2.ticker}`}
                      href={`/compare/${stock1.ticker.toLowerCase()}-vs-${stock2.ticker.toLowerCase()}`}
                      className="bg-card p-4 rounded-lg border border-border hover:border-green-500/50 transition-colors"
                    >
                      <p className="font-medium text-green-500">
                        {stock1.ticker} vs {stock2.ticker}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Compare fundamentals, valuation & performance
                      </p>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {sectorData.faqs.map((faq, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Sectors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Sectors</h2>
            <div className="flex flex-wrap gap-3">
              {sectorData.relatedSectors.map((relatedSector) => {
                const related = SECTORS[relatedSector]
                return (
                  <Link
                    key={relatedSector}
                    href={`/sectors/${relatedSector}`}
                    className="px-5 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {related.title}
                  </Link>
                )
              })}
              <Link
                href="/sectors"
                className="px-5 py-3 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600/30 transition-colors"
              >
                View All Sectors
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">Get AI-Powered Stock Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed DCF valuations, AI insights, and comprehensive analysis for any stock
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
            >
              Start Research
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
