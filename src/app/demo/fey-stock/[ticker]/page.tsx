'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Text,
  GradientText,
  Badge,
  PriceBadge,
  LiveBadge,
  Card,
  CardContent,
  Button,
  LinkButton,
  Section,
  CommandSearch,
  FeyLogo,
} from '@/components/fey-ui'

// =============================================================================
// TYPES
// =============================================================================

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  avgVolume: number
  marketCap: number
  pe: number
  eps: number
  dividend: number
  dividendYield: number
  beta: number
  week52High: number
  week52Low: number
  sector: string
  industry: string
  description: string
  exchange: string
  logo?: string
}

interface ChartDataPoint {
  date: string
  price: number
  volume: number
}

// =============================================================================
// FEY STOCK PAGE
// =============================================================================

export default function FeyStockPage() {
  const params = useParams()
  const router = useRouter()
  const ticker = (params?.ticker as string)?.toUpperCase() || 'AAPL'

  const [stockData, setStockData] = useState<StockData | null>(null)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRange, setSelectedRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'>('1M')
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'news' | 'analysis'>('overview')

  // Fetch stock data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch from Lician API
        const res = await fetch(`/api/stock?ticker=${ticker}`)
        if (res.ok) {
          const data = await res.json()
          setStockData({
            symbol: ticker,
            name: data.companyFacts?.name || ticker,
            price: data.snapshot?.price || 0,
            change: data.snapshot?.day_change || 0,
            changePercent: data.snapshot?.day_change_percent || 0,
            open: data.snapshot?.open || 0,
            high: data.snapshot?.high || 0,
            low: data.snapshot?.low || 0,
            volume: data.snapshot?.volume || 0,
            avgVolume: data.snapshot?.avg_volume || 0,
            marketCap: data.snapshot?.market_cap || 0,
            pe: data.metrics?.price_to_earnings_ratio || 0,
            eps: data.metrics?.earnings_per_share || 0,
            dividend: data.snapshot?.dividendShare || 0,
            dividendYield: data.metrics?.dividend_yield || 0,
            beta: data.snapshot?.beta || 0,
            week52High: data.snapshot?.week52_high || 0,
            week52Low: data.snapshot?.week52_low || 0,
            sector: data.companyFacts?.sector || 'Unknown',
            industry: data.companyFacts?.industry || 'Unknown',
            description: data.companyFacts?.description || '',
            exchange: data.snapshot?.exchange || 'NASDAQ',
            logo: data.companyFacts?.logoUrl,
          })
        }

        // Generate mock chart data (would be real API call)
        const points: ChartDataPoint[] = []
        const basePrice = 180
        const now = Date.now()
        for (let i = 30; i >= 0; i--) {
          const date = new Date(now - i * 24 * 60 * 60 * 1000)
          points.push({
            date: date.toISOString().split('T')[0],
            price: basePrice + Math.random() * 20 - 10 + (30 - i) * 0.5,
            volume: Math.floor(Math.random() * 50000000) + 30000000,
          })
        }
        setChartData(points)
      } catch (error) {
        console.error('Failed to fetch stock data:', error)
      }
      setLoading(false)
    }

    fetchData()
  }, [ticker])

  const handleCommandSelect = (type: 'stock' | 'briefing' | 'action', value: string) => {
    if (type === 'stock') {
      router.push(`/demo/fey-stock/${value}`)
    } else if (type === 'action') {
      router.push(value)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (!stockData) {
    return <ErrorState ticker={ticker} />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/demo/fey-components" className="flex items-center gap-2">
              <FeyLogo />
              <span className="text-white font-semibold">Lician</span>
            </a>
            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/demo/fey-components" active={false}>Components</NavLink>
              <NavLink href="/dashboard" active={false}>Dashboard</NavLink>
              <NavLink href="/chat" active={false}>AI Chat</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <CommandSearch onSelect={handleCommandSelect} className="hidden md:flex" />
          </div>
        </div>
      </nav>

      {/* CMD+K Search (global) */}
      <CommandSearch onSelect={handleCommandSelect} />

      {/* Main Content */}
      <main className="pt-20">
        {/* Stock Header */}
        <Section padding="md" className="border-b border-white/[0.06]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left: Stock Info */}
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="size-16 rounded-2xl bg-gradient-to-br from-white/[0.1] to-white/[0.05] flex items-center justify-center overflow-hidden shrink-0">
                  {stockData.logo ? (
                    <img src={stockData.logo} alt={stockData.symbol} className="size-12 object-contain" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{stockData.symbol.charAt(0)}</span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-[32px] font-semibold">{stockData.symbol}</h1>
                    <Badge variant="default">{stockData.exchange}</Badge>
                    <LiveBadge color="green">Market Open</LiveBadge>
                  </div>
                  <Text variant="body" className="mb-2">{stockData.name}</Text>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{stockData.sector}</Badge>
                    <span className="text-[#555]">•</span>
                    <Text variant="caption">{stockData.industry}</Text>
                  </div>
                </div>
              </div>

              {/* Right: Price */}
              <div className="text-right">
                <div className="flex items-baseline gap-3 justify-end">
                  <span className="text-[48px] font-semibold tabular-nums">
                    ${stockData.price.toFixed(2)}
                  </span>
                  <PriceBadge value={stockData.changePercent} size="lg" />
                </div>
                <Text variant="caption" className="mt-1">
                  {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} today
                </Text>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <Button variant="primary" size="md">Add to Watchlist</Button>
              <Button variant="secondary" size="md">Trade</Button>
              <Button variant="ghost" size="md">Set Alert</Button>
            </div>
          </motion.div>
        </Section>

        {/* Chart Section */}
        <Section padding="md" className="border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-6">
            <Text variant="title">Price Chart</Text>
            <div className="flex items-center gap-1">
              {(['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={cn(
                    'px-3 py-1.5 text-[13px] rounded-lg transition-colors',
                    selectedRange === range
                      ? 'bg-white/[0.1] text-white'
                      : 'text-[#868f97] hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <FeyChart data={chartData} isPositive={stockData.change >= 0} />
        </Section>

        {/* Tabs */}
        <div className="border-b border-white/[0.06]">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center gap-1">
              {(['overview', 'financials', 'news', 'analysis'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-3 text-[14px] capitalize border-b-2 transition-colors',
                    activeTab === tab
                      ? 'text-white border-white'
                      : 'text-[#868f97] border-transparent hover:text-white'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab key="overview" stockData={stockData} />
          )}
          {activeTab === 'financials' && (
            <FinancialsTab key="financials" ticker={ticker} />
          )}
          {activeTab === 'news' && (
            <NewsTab key="news" ticker={ticker} />
          )}
          {activeTab === 'analysis' && (
            <AnalysisTab key="analysis" ticker={ticker} stockData={stockData} />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

// =============================================================================
// CHART COMPONENT
// =============================================================================

interface FeyChartProps {
  data: ChartDataPoint[]
  isPositive: boolean
}

function FeyChart({ data, isPositive }: FeyChartProps) {
  if (data.length === 0) return null

  const prices = data.map(d => d.price)
  const minPrice = Math.min(...prices) * 0.995
  const maxPrice = Math.max(...prices) * 1.005
  const priceRange = maxPrice - minPrice

  const width = 800
  const height = 300
  const padding = 40

  // Build path
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = height - padding - ((d.price - minPrice) / priceRange) * (height - padding * 2)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  // Area fill path
  const areaPath = `${points} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`

  const lineColor = isPositive ? '#4ebe96' : '#e15241'
  const gradientId = `chart-gradient-${isPositive ? 'up' : 'down'}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full aspect-[2.5/1] relative"
    >
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            y1={padding + ratio * (height - padding * 2)}
            x2={width - padding}
            y2={padding + ratio * (height - padding * 2)}
            stroke="#222"
            strokeDasharray="4 4"
          />
        ))}

        {/* Area */}
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Line */}
        <motion.path
          d={points}
          fill="none"
          stroke={lineColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Current price indicator */}
        <motion.circle
          cx={width - padding}
          cy={height - padding - ((prices[prices.length - 1] - minPrice) / priceRange) * (height - padding * 2)}
          r={6}
          fill={lineColor}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
        />

        {/* Price labels */}
        <text x={padding - 8} y={padding} fill="#555" fontSize={10} textAnchor="end">
          ${maxPrice.toFixed(0)}
        </text>
        <text x={padding - 8} y={height - padding} fill="#555" fontSize={10} textAnchor="end">
          ${minPrice.toFixed(0)}
        </text>
      </svg>
    </motion.div>
  )
}

// =============================================================================
// TAB COMPONENTS
// =============================================================================

function OverviewTab({ stockData }: { stockData: StockData }) {
  const stats = [
    { label: 'Open', value: `$${stockData.open.toFixed(2)}` },
    { label: 'High', value: `$${stockData.high.toFixed(2)}` },
    { label: 'Low', value: `$${stockData.low.toFixed(2)}` },
    { label: 'Volume', value: formatNumber(stockData.volume) },
    { label: 'Avg Volume', value: formatNumber(stockData.avgVolume) },
    { label: 'Market Cap', value: formatMarketCap(stockData.marketCap) },
    { label: 'P/E Ratio', value: stockData.pe > 0 ? stockData.pe.toFixed(2) : 'N/A' },
    { label: 'EPS', value: `$${stockData.eps.toFixed(2)}` },
    { label: '52W High', value: `$${stockData.week52High.toFixed(2)}` },
    { label: '52W Low', value: `$${stockData.week52Low.toFixed(2)}` },
    { label: 'Beta', value: stockData.beta.toFixed(2) },
    { label: 'Div Yield', value: stockData.dividendYield > 0 ? `${(stockData.dividendYield * 100).toFixed(2)}%` : 'N/A' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Section padding="md">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Key Stats */}
          <Card>
            <CardContent className="p-6">
              <Text variant="title" className="mb-6">Key Statistics</Text>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex justify-between py-2 border-b border-white/[0.06]">
                    <Text variant="caption">{stat.label}</Text>
                    <Text variant="body" className="text-white font-medium tabular-nums">{stat.value}</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardContent className="p-6">
              <Text variant="title" className="mb-4">About {stockData.name}</Text>
              <Text variant="body" className="leading-relaxed">
                {stockData.description || `${stockData.name} is a ${stockData.sector.toLowerCase()} company operating in the ${stockData.industry.toLowerCase()} industry.`}
              </Text>
              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">{stockData.sector}</Badge>
                  <Badge variant="default">{stockData.industry}</Badge>
                  <Badge variant="default">{stockData.exchange}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </motion.div>
  )
}

function FinancialsTab({ ticker }: { ticker: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Section padding="md">
        <Card variant="glass" className="p-8 text-center">
          <Text variant="headline" className="text-[32px] mb-4">Financial Statements</Text>
          <Text variant="body" className="mb-6">
            View income statements, balance sheets, and cash flow data for {ticker}
          </Text>
          <LinkButton href={`/stock/${ticker.toLowerCase()}`}>
            View Full Financials
          </LinkButton>
        </Card>
      </Section>
    </motion.div>
  )
}

function NewsTab({ ticker }: { ticker: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Section padding="md">
        <Card variant="glass" className="p-8 text-center">
          <Text variant="headline" className="text-[32px] mb-4">Latest News</Text>
          <Text variant="body" className="mb-6">
            Stay updated with the latest news and announcements for {ticker}
          </Text>
          <LinkButton href={`/news?ticker=${ticker}`}>
            View All News
          </LinkButton>
        </Card>
      </Section>
    </motion.div>
  )
}

function AnalysisTab({ ticker, stockData }: { ticker: string; stockData: StockData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Section padding="md">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Text variant="title" className="mb-4">AI Analysis</Text>
              <Text variant="body" className="mb-4">
                Get AI-powered insights on {stockData.name}'s fundamentals, technicals, and market position.
              </Text>
              <Button variant="accent" size="md">
                Ask AI about {ticker}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Text variant="title" className="mb-4">Lician Score</Text>
              <div className="flex items-center gap-4 mb-4">
                <div className="size-16 rounded-full bg-gradient-to-br from-[#4ebe96] to-[#2a7a5a] flex items-center justify-center">
                  <span className="text-[24px] font-bold text-white">7.8</span>
                </div>
                <div>
                  <Text variant="subtitle">Strong Buy</Text>
                  <Text variant="caption">Based on 5 factors</Text>
                </div>
              </div>
              <LinkButton href={`/stock/${ticker.toLowerCase()}`}>
                View Score Breakdown
              </LinkButton>
            </CardContent>
          </Card>
        </div>
      </Section>
    </motion.div>
  )
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={cn(
        'px-3 py-2 text-[14px] rounded-lg transition-colors',
        active ? 'text-white' : 'text-[#868f97] hover:text-white hover:bg-white/[0.05]'
      )}
    >
      {children}
    </a>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        className="size-12 border-2 border-[#479ffa] border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

function ErrorState({ ticker }: { ticker: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Text variant="headline" className="mb-4">Stock Not Found</Text>
        <Text variant="body" className="mb-6">
          We couldn't find data for "{ticker}"
        </Text>
        <LinkButton href="/demo/fey-components">
          Go Back
        </LinkButton>
      </div>
    </div>
  )
}

// =============================================================================
// FORMATTERS
// =============================================================================

function formatNumber(num: number): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toString()
}

function formatMarketCap(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  return `$${num.toLocaleString()}`
}
