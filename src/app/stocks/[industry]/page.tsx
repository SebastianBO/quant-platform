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
  params: Promise<{ industry: string }>
}

// Industry mapping: slug -> database industry values (case-insensitive matching)
const INDUSTRY_MAPPINGS: Record<string, string[]> = {
  'software': ['Software', 'Application Software', 'Enterprise Software', 'Software - Application', 'Software - Infrastructure'],
  'semiconductors': ['Semiconductors', 'Semiconductor Equipment & Materials', 'Semiconductors - Memory Chips', 'Semiconductors - Integrated Circuits'],
  'banks': ['Banks', 'Regional Banks', 'Banks - Regional', 'Banks - Global', 'Banking Services'],
  'retail': ['Retail', 'Specialty Retail', 'Department Stores', 'Discount Stores', 'Retail - Apparel & Specialty', 'Retail - Cyclical'],
  'pharmaceuticals': ['Pharmaceuticals', 'Drug Manufacturers', 'Drug Manufacturers - Major', 'Drug Manufacturers - Specialty & Generic'],
  'biotechnology': ['Biotechnology', 'Biotech'],
  'insurance': ['Insurance', 'Life Insurance', 'Property & Casualty Insurance', 'Insurance - Diversified', 'Insurance - Life', 'Insurance - Property & Casualty'],
  'aerospace': ['Aerospace & Defense', 'Aerospace', 'Defense'],
  'automotive': ['Auto Manufacturers', 'Automotive', 'Auto Parts', 'Auto & Truck Dealerships'],
  'oil-gas': ['Oil & Gas', 'Oil & Gas E&P', 'Oil & Gas Integrated', 'Oil & Gas Exploration', 'Oil & Gas Refining'],
  'telecommunications': ['Telecommunications', 'Telecom Services', 'Wireless Telecommunications'],
  'media': ['Media', 'Entertainment', 'Broadcasting', 'Publishing'],
  'real-estate': ['Real Estate', 'REIT', 'Real Estate Services', 'REIT - Diversified', 'REIT - Residential', 'REIT - Office'],
  'construction': ['Construction', 'Engineering & Construction', 'Building Materials'],
  'chemicals': ['Chemicals', 'Specialty Chemicals', 'Agricultural Inputs'],
  'consumer-electronics': ['Consumer Electronics', 'Electronics', 'Electronic Components'],
  'restaurants': ['Restaurants', 'Food Service'],
  'apparel': ['Apparel', 'Footwear & Accessories', 'Textile Manufacturing'],
  'hotels': ['Hotels', 'Resorts & Casinos', 'Leisure'],
  'utilities': ['Utilities', 'Electric Utilities', 'Gas Utilities', 'Water Utilities'],
  'mining': ['Mining', 'Gold', 'Silver', 'Copper', 'Industrial Metals & Minerals'],
  'fintech': ['Financial Technology', 'FinTech', 'Payment Processing', 'Credit Services'],
  'cloud-computing': ['Cloud Computing', 'Cloud Infrastructure', 'Internet Services'],
  'cybersecurity': ['Cybersecurity', 'Security Software', 'Information Technology Services'],
  'artificial-intelligence': ['Artificial Intelligence', 'AI', 'Machine Learning'],
  'e-commerce': ['E-Commerce', 'Internet Retail', 'Online Retail'],
}

// Industry metadata with SEO-optimized content
const INDUSTRIES: Record<string, {
  title: string
  description: string
  longDescription: string
  keywords: string[]
  relatedIndustries: string[]
  faqs: { question: string; answer: string }[]
}> = {
  'software': {
    title: 'Software Stocks',
    description: 'Top software stocks including SaaS, enterprise software, application software, and cloud-based software companies.',
    longDescription: 'The software industry includes Software-as-a-Service (SaaS) companies, enterprise software providers, application developers, and infrastructure software firms. These high-margin businesses benefit from recurring revenue, network effects, and digital transformation trends.',
    keywords: ['software stocks', 'best software stocks', 'SaaS stocks', 'enterprise software stocks', 'software companies', 'cloud software stocks'],
    relatedIndustries: ['cloud-computing', 'cybersecurity', 'fintech', 'artificial-intelligence'],
    faqs: [
      {
        question: 'What are the best software stocks to buy?',
        answer: 'Top software stocks include Microsoft (MSFT), Salesforce (CRM), Adobe (ADBE), Oracle (ORCL), and high-growth SaaS companies like Snowflake (SNOW), Datadog (DDOG), and CrowdStrike (CRWD). The best choice depends on your preference for established giants vs. high-growth companies.'
      },
      {
        question: 'Why invest in software stocks?',
        answer: 'Software stocks offer high margins (often 70-90% gross margins), recurring revenue through subscriptions, scalability, and strong secular growth trends. The shift to cloud computing and digital transformation drives consistent demand for software solutions.'
      },
      {
        question: 'Are SaaS stocks good long-term investments?',
        answer: 'SaaS stocks can be excellent long-term investments due to predictable recurring revenue, low marginal costs, and strong customer retention. However, they often trade at premium valuations and can be volatile. Focus on companies with strong unit economics and path to profitability.'
      },
      {
        question: 'How do you value software stocks?',
        answer: 'Software stocks are typically valued using revenue multiples (Price/Sales), growth rates (PEG ratio for profitable companies), and SaaS metrics like ARR growth, net revenue retention, and rule of 40 (growth rate + profit margin). Traditional P/E ratios work for mature, profitable software companies.'
      }
    ]
  },
  'semiconductors': {
    title: 'Semiconductor Stocks',
    description: 'Top semiconductor stocks including chip manufacturers, designers, and equipment makers powering AI, computing, and electronics.',
    longDescription: 'The semiconductor industry includes chip designers, manufacturers, and equipment suppliers. These companies power everything from smartphones to data centers, with AI and autonomous vehicles driving new growth. The industry is cyclical but benefits from secular trends in digitalization.',
    keywords: ['semiconductor stocks', 'chip stocks', 'best semiconductor stocks', 'AI chip stocks', 'semiconductor companies'],
    relatedIndustries: ['consumer-electronics', 'artificial-intelligence', 'automotive'],
    faqs: [
      {
        question: 'What are the best semiconductor stocks?',
        answer: 'Top semiconductor stocks include Nvidia (NVDA) for AI chips, Taiwan Semiconductor (TSM) for manufacturing, AMD for CPUs/GPUs, Intel (INTC) for processors, and ASML for chip equipment. Each serves different segments with unique competitive advantages.'
      },
      {
        question: 'Are semiconductor stocks cyclical?',
        answer: 'Yes, semiconductor stocks are cyclical due to inventory cycles, capital expenditure patterns, and demand fluctuations. However, secular trends like AI, 5G, and automotive electrification provide long-term growth that can smooth cycles for leading companies.'
      },
      {
        question: 'How is AI impacting semiconductor stocks?',
        answer: 'AI is a massive driver for semiconductor stocks, particularly for GPU makers like Nvidia and AMD. Data centers need powerful chips for AI training and inference, creating multi-year tailwinds. Memory, networking, and cooling solution providers also benefit from AI infrastructure buildout.'
      },
      {
        question: 'Should I invest in chip designers or manufacturers?',
        answer: 'Chip designers (fabless companies like Nvidia, AMD) have higher margins and less capital intensity but face design risks. Manufacturers (foundries like TSM, Intel) have huge capital requirements but benefit from capacity scarcity. Diversifying across both can balance risk and reward.'
      }
    ]
  },
  'banks': {
    title: 'Bank Stocks',
    description: 'Top bank stocks including regional banks, global banks, investment banks, and diversified financial institutions.',
    longDescription: 'Banking stocks include commercial banks, regional banks, investment banks, and diversified financial institutions. Banks benefit from net interest margins, fee income, and economic growth, while facing regulatory requirements and credit cycle risks.',
    keywords: ['bank stocks', 'best bank stocks', 'banking stocks', 'regional bank stocks', 'investment bank stocks'],
    relatedIndustries: ['insurance', 'fintech', 'real-estate'],
    faqs: [
      {
        question: 'What are the best bank stocks to buy?',
        answer: 'Top bank stocks include JPMorgan Chase (JPM) for diversified banking, Bank of America (BAC) for scale, Wells Fargo (WFC) for retail banking, Goldman Sachs (GS) for investment banking, and regional leaders with strong deposit franchises. Consider capital ratios, efficiency, and dividend history.'
      },
      {
        question: 'How do interest rates affect bank stocks?',
        answer: 'Higher interest rates typically benefit banks by expanding net interest margins - the spread between what they charge borrowers and pay depositors. However, rapid rate increases can slow loan growth and increase defaults. The relationship is complex and varies by bank business model.'
      },
      {
        question: 'Are bank stocks good dividend investments?',
        answer: 'Many bank stocks offer attractive dividends with yields of 3-5%. Large banks like JPMorgan and Bank of America have strong dividend histories. However, dividends can be cut during financial crises, so focus on banks with strong capital ratios and consistent earnings.'
      },
      {
        question: 'What metrics matter most for bank stocks?',
        answer: 'Key metrics include: Return on Equity (ROE) for profitability, net interest margin for lending spread, efficiency ratio for cost management, capital ratios (CET1) for safety, loan quality metrics (NPL ratio, charge-offs), and tangible book value for valuation.'
      }
    ]
  },
  'retail': {
    title: 'Retail Stocks',
    description: 'Top retail stocks including department stores, specialty retailers, discount stores, and omnichannel retail leaders.',
    longDescription: 'The retail sector encompasses department stores, specialty retailers, discount chains, and e-commerce companies. Winners demonstrate omnichannel capabilities, strong brands, operational excellence, and adaptation to changing consumer preferences.',
    keywords: ['retail stocks', 'best retail stocks', 'retail companies', 'department store stocks', 'specialty retail stocks'],
    relatedIndustries: ['e-commerce', 'apparel', 'consumer-electronics'],
    faqs: [
      {
        question: 'What are the best retail stocks?',
        answer: 'Top retail stocks include Walmart (WMT) for discount retail, Costco (COST) for warehouse clubs, Home Depot (HD) for home improvement, Target (TGT) for general merchandise, and specialty leaders like Lululemon (LULU) and TJX Companies (TJX). Focus on companies with strong omnichannel capabilities.'
      },
      {
        question: 'Are retail stocks affected by e-commerce?',
        answer: 'Yes, e-commerce has significantly impacted traditional retail. Winners either excel at online sales (omnichannel retailers like Walmart, Target) or offer experiences Amazon can\'t replicate (warehouse clubs, home improvement, experiential retail). Pure brick-and-mortar models struggle without online integration.'
      },
      {
        question: 'Are retail stocks recession-proof?',
        answer: 'Most retail stocks are cyclical and suffer during recessions as consumer spending declines. However, discount retailers (Walmart, Dollar stores) and warehouse clubs (Costco) can be relatively defensive. Luxury and discretionary retailers face the most pressure during downturns.'
      },
      {
        question: 'What makes a good retail investment?',
        answer: 'Look for: strong comparable store sales growth, healthy gross margins, efficient inventory management, omnichannel capabilities, defensible market position, and adapting to consumer trends. Same-store sales, inventory turnover, and operating margin trends are key metrics.'
      }
    ]
  },
  'pharmaceuticals': {
    title: 'Pharmaceutical Stocks',
    description: 'Top pharmaceutical stocks including drug manufacturers, specialty pharma, and generic drug companies.',
    longDescription: 'Pharmaceutical companies develop, manufacture, and market drugs for human and veterinary use. The industry offers defensive characteristics with essential products, though patent cliffs, regulatory risks, and drug development failures pose challenges.',
    keywords: ['pharmaceutical stocks', 'pharma stocks', 'best pharma stocks', 'drug stocks', 'pharmaceutical companies'],
    relatedIndustries: ['biotechnology', 'insurance'],
    faqs: [
      {
        question: 'What are the best pharmaceutical stocks?',
        answer: 'Top pharma stocks include Eli Lilly (LLY) for innovation, Johnson & Johnson (JNJ) for diversification, Pfizer (PFE) for scale, Merck (MRK) for pipeline strength, and AbbVie (ABBV) for immunology. Consider drug pipelines, patent expirations, and therapeutic area exposure.'
      },
      {
        question: 'How do drug patents affect pharma stocks?',
        answer: 'Patent expirations create "patent cliffs" where exclusive drugs face generic competition, causing revenue drops of 80-90%. Successful pharma companies offset this with new drug approvals. Analyzing patent expiration dates and pipeline drugs is crucial for pharma investing.'
      },
      {
        question: 'Are pharma stocks defensive?',
        answer: 'Pharmaceutical stocks are generally defensive because people need medications regardless of economic conditions. However, individual companies face binary risks from drug trial failures, FDA rejections, and patent expirations that can cause significant volatility.'
      },
      {
        question: 'What\'s the difference between pharma and biotech stocks?',
        answer: 'Pharma companies typically have diversified drug portfolios, established revenues, and lower risk profiles (though lower growth). Biotech companies focus on innovative therapies, may be pre-revenue, and carry higher risk but potentially higher rewards. Many large pharmas acquire successful biotechs.'
      }
    ]
  },
  'biotechnology': {
    title: 'Biotechnology Stocks',
    description: 'Top biotechnology stocks including gene therapy, immunotherapy, rare disease treatments, and innovative biotech companies.',
    longDescription: 'Biotechnology companies develop innovative therapies using biological processes. These high-risk, high-reward investments focus on novel treatments for cancer, rare diseases, autoimmune disorders, and genetic conditions.',
    keywords: ['biotech stocks', 'biotechnology stocks', 'best biotech stocks', 'gene therapy stocks', 'immunotherapy stocks'],
    relatedIndustries: ['pharmaceuticals'],
    faqs: [
      {
        question: 'What are the best biotech stocks?',
        answer: 'Top biotech stocks include Vertex Pharmaceuticals (VRTX) for cystic fibrosis, Regeneron (REGN) for antibody therapies, Moderna (MRNA) for mRNA technology, Amgen (AMGN) for established biologics, and Gilead (GILD) for HIV/HCV treatments. Evaluate clinical pipeline and FDA approval timelines.'
      },
      {
        question: 'Are biotech stocks risky?',
        answer: 'Yes, biotech stocks carry significant risk due to binary clinical trial outcomes, FDA approval uncertainty, and potential competition. A failed Phase 3 trial can cause 50-90% stock drops. Diversification and understanding clinical trial data are essential for biotech investing.'
      },
      {
        question: 'How do you value biotech stocks?',
        answer: 'Pre-revenue biotechs are valued on pipeline potential using risk-adjusted NPV of drug candidates, cash runway, and probability of approval. Profitable biotechs use traditional metrics like P/E, EV/Sales, and cash flow. Understanding drug economics and market size is critical.'
      },
      {
        question: 'What makes a good biotech investment?',
        answer: 'Look for: validated science (peer-reviewed data), strong clinical trial results, experienced management, adequate cash runway, large addressable markets, and competitive advantages (patents, data exclusivity). Understand the therapeutic area and competitive landscape.'
      }
    ]
  },
  'fintech': {
    title: 'FinTech Stocks',
    description: 'Top financial technology stocks including payment processors, digital banking, lending platforms, and financial software companies.',
    longDescription: 'FinTech companies leverage technology to improve financial services, from payments to lending to investment management. These disruptors challenge traditional banks with better user experiences, lower costs, and innovative business models.',
    keywords: ['fintech stocks', 'best fintech stocks', 'payment stocks', 'digital banking stocks', 'financial technology stocks'],
    relatedIndustries: ['software', 'banks', 'e-commerce'],
    faqs: [
      {
        question: 'What are the best FinTech stocks?',
        answer: 'Top fintech stocks include Visa (V) and Mastercard (MA) for payment networks, Block (SQ) for merchant services, PayPal (PYPL) for digital payments, Coinbase (COIN) for crypto, and SoFi (SOFI) for digital banking. Each serves different segments with unique moats.'
      },
      {
        question: 'Are payment stocks better than traditional banks?',
        answer: 'Payment processors like Visa and Mastercard have higher margins (50-60%) and faster growth than banks because they don\'t take credit risk or hold deposits. However, they face different risks like regulatory changes, competition, and network effects. Both can coexist in portfolios.'
      },
      {
        question: 'How is blockchain affecting FinTech stocks?',
        answer: 'Blockchain and crypto create opportunities and threats for fintech. Companies like Coinbase directly benefit, while payment processors integrate crypto capabilities. Traditional fintech must adapt to decentralized finance (DeFi) or risk disruption, though regulatory uncertainty remains.'
      },
      {
        question: 'What metrics matter for FinTech stocks?',
        answer: 'Key metrics include: total payment volume (TPV), take rate, user growth, engagement metrics, gross margins, customer acquisition cost (CAC), lifetime value (LTV), and for lenders, credit quality metrics like charge-offs and delinquencies.'
      }
    ]
  },
  'e-commerce': {
    title: 'E-Commerce Stocks',
    description: 'Top e-commerce stocks including online retailers, marketplace platforms, and direct-to-consumer brands.',
    longDescription: 'E-commerce companies sell products and services online, from marketplaces like Amazon to specialized online retailers. The sector benefits from the ongoing shift to digital commerce, offering convenience and selection advantages over physical stores.',
    keywords: ['e-commerce stocks', 'best e-commerce stocks', 'online retail stocks', 'marketplace stocks', 'digital commerce stocks'],
    relatedIndustries: ['retail', 'software', 'consumer-electronics'],
    faqs: [
      {
        question: 'What are the best e-commerce stocks?',
        answer: 'Amazon (AMZN) dominates general e-commerce, while Shopify (SHOP) powers independent merchants, Etsy (ETSY) serves handmade goods, MercadoLibre (MELI) leads Latin America, and Sea Limited (SE) dominates Southeast Asia. Wayfair (W) specializes in furniture. Each has different geographic or category focus.'
      },
      {
        question: 'Are e-commerce stocks still growing?',
        answer: 'Yes, e-commerce continues growing as a percentage of total retail, though growth rates normalized after COVID acceleration. International markets, grocery delivery, and specialized categories offer continued expansion. Mobile commerce and social commerce provide new growth vectors.'
      },
      {
        question: 'How profitable are e-commerce companies?',
        answer: 'Profitability varies widely. Amazon\'s AWS subsidizes lower-margin retail. Pure e-commerce often has thin margins (2-5%) due to fulfillment costs and customer acquisition. Marketplaces (taking commissions without holding inventory) typically have higher margins than direct retailers.'
      },
      {
        question: 'What makes a good e-commerce investment?',
        answer: 'Look for: strong gross merchandise value (GMV) growth, improving unit economics, customer retention, brand strength, logistics capabilities, and path to profitability. Key metrics include conversion rates, repeat purchase rates, average order value, and customer acquisition cost vs lifetime value.'
      }
    ]
  }
}

// Helper function to format market cap
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return `$${marketCap.toLocaleString()}`
}

// Fetch stocks by industry from Supabase with timeout and error handling
async function fetchIndustryStocks(industrySlug: string): Promise<CompanyFundamentals[]> {
  const industryNames = INDUSTRY_MAPPINGS[industrySlug]
  if (!industryNames || industryNames.length === 0) {
    return []
  }

  try {
    // Build OR condition for multiple industry names (case-insensitive)
    const industryConditions = industryNames.map(name => `industry.ilike.%${name}%`).join(',')

    const { data, error } = await supabase
      .from('company_fundamentals')
      .select('ticker, company_name, sector, industry, market_cap, pe_ratio')
      .or(industryConditions)
      .order('market_cap', { ascending: false, nullsFirst: false })
      .limit(50)

    if (error) {
      console.error('Error fetching industry stocks:', error)
      return []
    }

    return (data || []) as CompanyFundamentals[]
  } catch (err) {
    console.error('Unexpected error fetching industry stocks:', err)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry } = await params
  const industryData = INDUSTRIES[industry.toLowerCase()]

  if (!industryData) {
    return { title: 'Industries | Lician' }
  }

  const currentYear = new Date().getFullYear()

  return {
    title: `Best ${industryData.title} ${currentYear} - Top Stocks & Analysis`,
    description: industryData.description,
    keywords: industryData.keywords,
    openGraph: {
      title: `Best ${industryData.title} ${currentYear}`,
      description: industryData.description,
      type: 'article',
      url: `${SITE_URL}/stocks/${industry.toLowerCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best ${industryData.title} ${currentYear}`,
      description: industryData.description,
    },
    alternates: {
      canonical: `${SITE_URL}/stocks/${industry.toLowerCase()}`,
    },
  }
}

// Dynamic rendering for fresh data
export const dynamic = 'force-dynamic'

export default async function IndustryPage({ params }: Props) {
  const { industry } = await params
  const industryData = INDUSTRIES[industry.toLowerCase()]

  if (!industryData) {
    notFound()
  }

  // Fetch real stocks from Supabase
  const allStocks = await fetchIndustryStocks(industry.toLowerCase())
  const topStocks = allStocks.slice(0, 25)

  const currentYear = new Date().getFullYear()
  const pageUrl = `${SITE_URL}/stocks/${industry.toLowerCase()}`

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Stocks', url: `${SITE_URL}/dashboard` },
    { name: industryData.title, url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: `Best ${industryData.title} ${currentYear} - Analysis & Stock Picks`,
    description: industryData.description,
    url: pageUrl,
    keywords: industryData.keywords,
  })

  // ItemList Schema for the stock list - filter out stocks with missing data
  const validStocks = topStocks.filter(stock => stock.ticker && stock.company_name)
  const itemListSchema = getItemListSchema({
    name: `Top ${validStocks.length} ${industryData.title} ${currentYear}`,
    description: industryData.description,
    url: pageUrl,
    items: validStocks.map((stock, index) => ({
      name: `${stock.ticker} - ${stock.company_name}`,
      url: `${SITE_URL}/stock/${stock.ticker.toLowerCase()}`,
      position: index + 1,
    })),
  })

  // FAQ Schema
  const faqSchema = getFAQSchema(industryData.faqs)

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
            <Link href="/dashboard" className="hover:text-foreground">Stocks</Link>
            {' / '}
            <span>{industryData.title}</span>
          </nav>

          {/* Header */}
          <h1 className="text-4xl font-bold mb-4">
            Best {industryData.title} {currentYear}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            {industryData.description}
          </p>
          <p className="text-base text-muted-foreground mb-8">
            {industryData.longDescription}
          </p>

          {/* Top Stocks Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Top {topStocks.length} {industryData.title} to Buy
            </h2>
            {topStocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topStocks.map((stock, i) => (
                  <Link
                    key={stock.ticker}
                    href={`/stock/${stock.ticker.toLowerCase()}`}
                    className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">#{i + 1}</span>
                          <span className="text-xl font-bold">{stock.ticker}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {stock.company_name || stock.ticker}
                        </p>
                        {stock.industry && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {stock.industry}
                          </p>
                        )}
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
                <p className="text-muted-foreground">No stocks found in this industry. Check back soon as we add more data.</p>
              </div>
            )}
          </section>

          {/* Investment Tools */}
          {topStocks.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Stock Analysis & Investment Tools</h2>
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
                        href={`/buy/${stock.ticker.toLowerCase()}`}
                        className="text-green-500 hover:underline"
                      >
                        How to Buy {stock.ticker}
                      </Link>
                      <Link
                        href={`/prediction/${stock.ticker.toLowerCase()}`}
                        className="text-green-500 hover:underline"
                      >
                        {stock.ticker} Price Prediction {currentYear}
                      </Link>
                      <Link
                        href={`/stock/${stock.ticker.toLowerCase()}`}
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
              <h2 className="text-2xl font-bold mb-6">Compare Top {industryData.title}</h2>
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
              {industryData.faqs.map((faq, i) => (
                <div key={i} className="bg-card p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Industries */}
          {industryData.relatedIndustries.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Related Industries</h2>
              <div className="flex flex-wrap gap-3">
                {industryData.relatedIndustries.map((relatedIndustry) => {
                  const related = INDUSTRIES[relatedIndustry]
                  if (!related) return null
                  return (
                    <Link
                      key={relatedIndustry}
                      href={`/stocks/${relatedIndustry}`}
                      className="px-5 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      {related.title}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-card p-8 rounded-xl border border-border text-center">
            <h2 className="text-2xl font-bold mb-4">Get AI-Powered Stock Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Access detailed DCF valuations, AI insights, and comprehensive analysis for {industryData.title.toLowerCase()}
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
