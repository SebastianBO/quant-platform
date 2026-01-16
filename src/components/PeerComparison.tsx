"use client"

import { useState, useEffect, useMemo, memo } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent, cn } from "@/lib/utils"
import { STOCK_CATEGORIES } from "@/lib/stocks"

// Peer data interface
interface PeerData {
  ticker: string
  name: string
  marketCap: number
  pe: number
  revenueGrowth: number
  grossMargin: number
  profitMargin: number
  price: number
  sector?: string
  industry?: string
}

// Props for the component
interface PeerComparisonProps {
  ticker: string
  companyName: string
  sector?: string
  industry?: string
  marketCap?: number
  pe?: number
  revenueGrowth?: number
  grossMargin?: number
  profitMargin?: number
  price?: number
  variant?: 'full' | 'compact' | 'valuation'
}

// Industry to peer mapping for smart peer selection
const INDUSTRY_PEERS: Record<string, string[]> = {
  // Technology - Software
  'Software': ['MSFT', 'CRM', 'ADBE', 'NOW', 'INTU', 'ORCL', 'SAP', 'WDAY', 'TEAM', 'PLTR'],
  'Software - Application': ['CRM', 'ADBE', 'INTU', 'WDAY', 'DDOG', 'NOW', 'SNOW', 'TEAM', 'ZS', 'PANW'],
  'Software - Infrastructure': ['MSFT', 'ORCL', 'NOW', 'SNOW', 'DDOG', 'MDB', 'NET', 'CRWD', 'ZS', 'OKTA'],

  // Technology - Hardware / Semiconductors
  'Semiconductors': ['NVDA', 'AMD', 'INTC', 'AVGO', 'QCOM', 'TXN', 'AMAT', 'MU', 'LRCX', 'KLAC'],
  'Consumer Electronics': ['AAPL', 'SONY', 'DELL', 'HPQ', 'LOGI', 'SONO'],
  'Computer Hardware': ['AAPL', 'DELL', 'HPQ', 'IBM', 'HPE', 'NTAP'],

  // Internet / Tech Giants
  'Internet Content & Information': ['GOOGL', 'META', 'SNAP', 'PINS', 'TWTR', 'BIDU', 'NFLX'],
  'Internet Retail': ['AMZN', 'SHOP', 'MELI', 'EBAY', 'ETSY', 'W', 'CHWY'],

  // Finance
  'Banks - Diversified': ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'USB', 'PNC'],
  'Banks - Regional': ['USB', 'PNC', 'TFC', 'FITB', 'KEY', 'CFG', 'RF', 'HBAN'],
  'Credit Services': ['V', 'MA', 'AXP', 'COF', 'DFS', 'SYF'],
  'Insurance': ['BRK.B', 'UNH', 'PGR', 'MET', 'AFL', 'AIG', 'TRV', 'ALL'],
  'Asset Management': ['BLK', 'BX', 'KKR', 'APO', 'SCHW', 'TROW', 'IVZ'],

  // Healthcare
  'Drug Manufacturers': ['LLY', 'JNJ', 'PFE', 'MRK', 'ABBV', 'BMY', 'AMGN', 'GILD', 'BIIB'],
  'Biotechnology': ['AMGN', 'GILD', 'VRTX', 'REGN', 'BIIB', 'MRNA', 'ILMN', 'SGEN'],
  'Medical Devices': ['ABT', 'MDT', 'SYK', 'BSX', 'ISRG', 'EW', 'DXCM', 'HOLX'],
  'Healthcare Plans': ['UNH', 'CVS', 'CI', 'ELV', 'HUM', 'CNC', 'MOH'],

  // Consumer
  'Retail': ['WMT', 'COST', 'TGT', 'HD', 'LOW', 'DG', 'DLTR', 'ROSS', 'TJX'],
  'Restaurants': ['MCD', 'SBUX', 'CMG', 'YUM', 'DPZ', 'QSR', 'DARDEN', 'WEN'],
  'Apparel': ['NKE', 'LULU', 'VFC', 'PVH', 'HBI', 'GOOS', 'RL', 'TPR'],
  'Beverages - Non-Alcoholic': ['KO', 'PEP', 'MNST', 'CELH', 'KDP'],
  'Household Products': ['PG', 'CL', 'CLX', 'CHD', 'KMB', 'HLN'],

  // Industrial
  'Aerospace & Defense': ['BA', 'LMT', 'RTX', 'NOC', 'GD', 'TXT', 'HII', 'LHX'],
  'Auto Manufacturers': ['TSLA', 'F', 'GM', 'TM', 'RIVN', 'LCID', 'HMC', 'NIO'],
  'Industrial Machinery': ['CAT', 'DE', 'ETN', 'EMR', 'ROK', 'ITW', 'PH', 'IR'],
  'Railroads': ['UNP', 'CSX', 'NSC', 'CP', 'CNI'],

  // Energy
  'Oil & Gas Integrated': ['XOM', 'CVX', 'SHEL', 'BP', 'TTE', 'COP', 'OXY'],
  'Oil & Gas E&P': ['COP', 'EOG', 'DVN', 'PXD', 'FANG', 'MRO', 'OVV'],
  'Oil & Gas Equipment': ['SLB', 'HAL', 'BKR', 'NOV'],

  // Utilities & Energy
  'Utilities': ['NEE', 'DUK', 'SO', 'AEP', 'D', 'XEL', 'EXC', 'WEC', 'ES'],
  'Renewable Energy': ['NEE', 'ENPH', 'FSLR', 'RUN', 'SEDG', 'PLUG', 'BE'],

  // Real Estate
  'REIT': ['PLD', 'AMT', 'CCI', 'EQIX', 'PSA', 'WELL', 'DLR', 'O', 'SPG'],

  // Communications
  'Telecom Services': ['VZ', 'T', 'TMUS', 'CHTR', 'CMCSA'],
  'Entertainment': ['DIS', 'NFLX', 'WBD', 'PARA', 'LGF.A', 'FOXA'],
}

// Sector to category mapping for fallback
const SECTOR_CATEGORIES: Record<string, keyof typeof STOCK_CATEGORIES> = {
  'Technology': 'MEGA_CAP',
  'Information Technology': 'MEGA_CAP',
  'Financial Services': 'FINANCIALS',
  'Financials': 'FINANCIALS',
  'Healthcare': 'HEALTHCARE',
  'Health Care': 'HEALTHCARE',
  'Consumer Cyclical': 'CONSUMER',
  'Consumer Defensive': 'CONSUMER',
  'Consumer Discretionary': 'CONSUMER',
  'Consumer Staples': 'CONSUMER',
  'Energy': 'ENERGY',
  'Industrials': 'INDUSTRIALS',
  'Communication Services': 'COMMUNICATIONS',
  'Real Estate': 'REAL_ESTATE',
  'Materials': 'MATERIALS',
  'Utilities': 'UTILITIES',
}

// Get peers based on industry and sector
function getPeersForStock(ticker: string, industry?: string, sector?: string): string[] {
  const upperTicker = ticker.toUpperCase()

  // Try to find by industry first
  if (industry) {
    for (const [key, peers] of Object.entries(INDUSTRY_PEERS)) {
      if (industry.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(industry.toLowerCase())) {
        return peers.filter(p => p !== upperTicker).slice(0, 5)
      }
    }
  }

  // Fallback to sector
  if (sector) {
    const category = SECTOR_CATEGORIES[sector]
    if (category && STOCK_CATEGORIES[category]) {
      return STOCK_CATEGORIES[category].filter(p => p !== upperTicker).slice(0, 5)
    }
  }

  // Default to mega cap tech
  return STOCK_CATEGORIES.MEGA_CAP.filter(p => p !== upperTicker).slice(0, 5)
}

// Get ordinal suffix
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Metric comparison indicator
function MetricIndicator({ value, avg, higherIsBetter = true }: { value: number, avg: number, higherIsBetter?: boolean }) {
  const isGood = higherIsBetter ? value > avg : value < avg
  const diff = ((value - avg) / avg) * 100

  if (Math.abs(diff) < 5) {
    return <span className="text-yellow-500 text-xs font-medium ml-1">~avg</span>
  }

  return (
    <span className={cn("text-xs font-medium ml-1", isGood ? "text-green-500" : "text-red-500")}>
      {isGood ? "+" : ""}{diff.toFixed(0)}%
    </span>
  )
}

function PeerComparisonComponent({
  ticker,
  companyName,
  sector,
  industry,
  marketCap = 0,
  pe = 0,
  revenueGrowth = 0,
  grossMargin = 0,
  profitMargin = 0,
  price = 0,
  variant = 'full'
}: PeerComparisonProps) {
  const [peers, setPeers] = useState<PeerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const symbol = ticker.toUpperCase()
  const peerTickers = useMemo(() => getPeersForStock(symbol, industry, sector), [symbol, industry, sector])

  // Fetch peer data
  useEffect(() => {
    const fetchPeers = async () => {
      setLoading(true)
      setError(null)

      try {
        const peerPromises = peerTickers.map(async (peerTicker) => {
          try {
            const response = await fetch(`/api/stock?ticker=${peerTicker}`)
            if (!response.ok) return null
            const data = await response.json()

            return {
              ticker: peerTicker,
              name: data.companyFacts?.name || peerTicker,
              marketCap: data.snapshot?.market_cap || 0,
              pe: data.metrics?.price_to_earnings_ratio || 0,
              revenueGrowth: data.metrics?.revenue_growth || 0,
              grossMargin: data.metrics?.gross_margin || 0,
              profitMargin: data.metrics?.profit_margin || 0,
              price: data.snapshot?.price || 0,
              sector: data.companyFacts?.sector,
              industry: data.companyFacts?.industry,
            } as PeerData
          } catch {
            return null
          }
        })

        const results = await Promise.all(peerPromises)
        const validPeers = results.filter((p): p is PeerData => p !== null && p.marketCap > 0)
        setPeers(validPeers)
      } catch (err) {
        setError('Failed to load peer data')
      } finally {
        setLoading(false)
      }
    }

    if (peerTickers.length > 0) {
      fetchPeers()
    }
  }, [peerTickers])

  // Include current stock in rankings
  const currentStock: PeerData = {
    ticker: symbol,
    name: companyName,
    marketCap,
    pe,
    revenueGrowth,
    grossMargin,
    profitMargin,
    price,
    sector,
    industry,
  }

  const allStocks = [currentStock, ...peers]
  const peerCount = allStocks.length

  // Calculate rankings
  const rankings = useMemo(() => {
    if (peers.length === 0) return null

    const validPE = allStocks.filter(s => s.pe > 0)
    const validMargin = allStocks.filter(s => s.profitMargin !== 0)
    const validGrowth = allStocks.filter(s => s.revenueGrowth !== 0)
    const validMarketCap = allStocks.filter(s => s.marketCap > 0)

    // Sort and find rankings (lower PE is better)
    const peRank = validPE.length > 0 ?
      [...validPE].sort((a, b) => a.pe - b.pe).findIndex(s => s.ticker === symbol) + 1 : 0

    // Higher margin is better
    const marginRank = validMargin.length > 0 ?
      [...validMargin].sort((a, b) => b.profitMargin - a.profitMargin).findIndex(s => s.ticker === symbol) + 1 : 0

    // Higher growth is better
    const growthRank = validGrowth.length > 0 ?
      [...validGrowth].sort((a, b) => b.revenueGrowth - a.revenueGrowth).findIndex(s => s.ticker === symbol) + 1 : 0

    // Higher market cap for size
    const sizeRank = validMarketCap.length > 0 ?
      [...validMarketCap].sort((a, b) => b.marketCap - a.marketCap).findIndex(s => s.ticker === symbol) + 1 : 0

    return {
      pe: { rank: peRank, total: validPE.length },
      margin: { rank: marginRank, total: validMargin.length },
      growth: { rank: growthRank, total: validGrowth.length },
      size: { rank: sizeRank, total: validMarketCap.length },
    }
  }, [peers, allStocks, symbol])

  // Calculate averages
  const averages = useMemo(() => {
    if (peers.length === 0) return null

    const validPeers = peers.filter(p => p.marketCap > 0)
    if (validPeers.length === 0) return null

    return {
      pe: validPeers.filter(p => p.pe > 0).reduce((a, b) => a + b.pe, 0) / validPeers.filter(p => p.pe > 0).length || 0,
      profitMargin: validPeers.reduce((a, b) => a + b.profitMargin, 0) / validPeers.length,
      revenueGrowth: validPeers.reduce((a, b) => a + b.revenueGrowth, 0) / validPeers.length,
      marketCap: validPeers.reduce((a, b) => a + b.marketCap, 0) / validPeers.length,
    }
  }, [peers])

  // Generate ranking insights
  const insights = useMemo(() => {
    if (!rankings || !averages) return []

    const result: string[] = []
    const industryName = industry || sector || 'its peer group'

    // Valuation insight
    if (rankings.pe.rank > 0 && rankings.pe.total > 1) {
      if (rankings.pe.rank === 1) {
        result.push(`${symbol} has the lowest P/E ratio in ${industryName}, suggesting it may be the most undervalued`)
      } else if (rankings.pe.rank <= 2) {
        result.push(`${symbol} ranks ${getOrdinal(rankings.pe.rank)} most undervalued by P/E ratio among peers`)
      } else if (rankings.pe.rank === rankings.pe.total) {
        result.push(`${symbol} trades at a premium valuation vs peers (highest P/E)`)
      }
    }

    // Margin insight
    if (rankings.margin.rank > 0 && rankings.margin.total > 1) {
      if (rankings.margin.rank === 1) {
        result.push(`${symbol} has the highest profit margins in ${industryName}`)
      } else if (rankings.margin.rank <= 2) {
        result.push(`${symbol} ranks ${getOrdinal(rankings.margin.rank)} in profitability among competitors`)
      }
    }

    // Growth insight
    if (rankings.growth.rank > 0 && rankings.growth.total > 1) {
      if (rankings.growth.rank === 1) {
        result.push(`${symbol} has the fastest revenue growth among competitors`)
      } else if (rankings.growth.rank <= 2) {
        result.push(`${symbol} ranks ${getOrdinal(rankings.growth.rank)} in revenue growth vs peers`)
      }
    }

    // Size insight
    if (rankings.size.rank > 0) {
      if (rankings.size.rank === 1) {
        result.push(`${symbol} is the largest company in its peer group by market cap`)
      } else if (rankings.size.rank === rankings.size.total) {
        result.push(`${symbol} is the smallest among peers, which may offer higher growth potential`)
      }
    }

    return result.slice(0, 3)
  }, [rankings, averages, symbol, industry, sector])

  // Loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>How {symbol} Compares to Peers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="h-32 bg-secondary rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error or no data state
  if (error || peers.length === 0) {
    return null
  }

  // Compact variant for sidebars
  if (variant === 'compact') {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Peer Rankings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.length > 0 && (
            <ul className="space-y-2 text-sm">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">*</span>
                  <span className="text-muted-foreground">{insight}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">Compare with:</p>
            <div className="flex flex-wrap gap-1">
              {peers.slice(0, 3).map(peer => (
                <Link
                  key={peer.ticker}
                  href={`/compare/${symbol.toLowerCase()}-vs-${peer.ticker.toLowerCase()}`}
                  className="text-xs px-2 py-1 bg-secondary hover:bg-secondary/80 rounded transition-colors"
                >
                  vs {peer.ticker}
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Valuation-focused variant
  if (variant === 'valuation') {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          How {symbol} Valuation Compares to Peers
        </h2>

        {insights.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-blue-500 font-bold">-</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left p-3 font-semibold">Company</th>
                <th className="text-right p-3 font-semibold">P/E</th>
                <th className="text-right p-3 font-semibold">Margin</th>
                <th className="text-right p-3 font-semibold">Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="bg-green-50/50 dark:bg-green-950/20">
                <td className="p-3">
                  <span className="font-bold text-green-600 dark:text-green-400">{symbol}</span>
                  <span className="text-muted-foreground ml-2 text-xs">(This stock)</span>
                </td>
                <td className="text-right p-3 font-medium">
                  {pe > 0 ? pe.toFixed(1) + 'x' : 'N/A'}
                </td>
                <td className="text-right p-3 font-medium">
                  {profitMargin ? (profitMargin * 100).toFixed(1) + '%' : 'N/A'}
                </td>
                <td className="text-right p-3 font-medium">
                  <span className={revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {revenueGrowth ? (revenueGrowth * 100).toFixed(1) + '%' : 'N/A'}
                  </span>
                </td>
              </tr>
              {peers.slice(0, 4).map(peer => (
                <tr key={peer.ticker} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3">
                    <Link
                      href={`/valuation/${peer.ticker.toLowerCase()}`}
                      className="font-medium hover:text-green-600 dark:hover:text-green-400"
                    >
                      {peer.ticker}
                    </Link>
                    <span className="text-muted-foreground ml-2 text-xs truncate">{peer.name.split(' ')[0]}</span>
                  </td>
                  <td className="text-right p-3">
                    {peer.pe > 0 ? peer.pe.toFixed(1) + 'x' : 'N/A'}
                  </td>
                  <td className="text-right p-3">
                    {peer.profitMargin ? (peer.profitMargin * 100).toFixed(1) + '%' : 'N/A'}
                  </td>
                  <td className="text-right p-3">
                    <span className={peer.revenueGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {peer.revenueGrowth ? (peer.revenueGrowth * 100).toFixed(1) + '%' : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {peers.slice(0, 3).map(peer => (
            <Link
              key={peer.ticker}
              href={`/compare/${symbol.toLowerCase()}-vs-${peer.ticker.toLowerCase()}`}
              className="text-sm px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
            >
              See full {symbol} vs {peer.ticker} comparison
            </Link>
          ))}
        </div>
      </section>
    )
  }

  // Full variant (default)
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>How {symbol} Compares to Peers</span>
          {rankings && (
            <span className="text-sm font-normal text-muted-foreground">
              Ranks #{rankings.size.rank} of {rankings.size.total} by market cap
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Ranking Insights */}
        {insights.length > 0 && (
          <div className="mb-6 space-y-2">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  i === 0 ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/50"
                )}
              >
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  insight.includes('highest') || insight.includes('fastest') || insight.includes('largest') || insight.includes('lowest P/E') || insight.includes('most undervalued')
                    ? 'bg-green-500'
                    : insight.includes('premium') || insight.includes('smallest')
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                )} />
                <span className="text-sm">{insight}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ranking Cards */}
        {rankings && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-secondary/50 p-4 rounded-lg text-center">
              <p className="text-muted-foreground text-xs mb-1">P/E Rank</p>
              <p className="text-2xl font-bold">
                {rankings.pe.rank > 0 ? `#${rankings.pe.rank}` : 'N/A'}
              </p>
              {rankings.pe.total > 0 && (
                <p className={cn(
                  "text-xs",
                  rankings.pe.rank <= 2 ? 'text-green-500' : 'text-muted-foreground'
                )}>
                  of {rankings.pe.total} (lower = better value)
                </p>
              )}
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg text-center">
              <p className="text-muted-foreground text-xs mb-1">Margin Rank</p>
              <p className="text-2xl font-bold">
                {rankings.margin.rank > 0 ? `#${rankings.margin.rank}` : 'N/A'}
              </p>
              {rankings.margin.total > 0 && (
                <p className={cn(
                  "text-xs",
                  rankings.margin.rank <= 2 ? 'text-green-500' : 'text-muted-foreground'
                )}>
                  of {rankings.margin.total}
                </p>
              )}
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg text-center">
              <p className="text-muted-foreground text-xs mb-1">Growth Rank</p>
              <p className="text-2xl font-bold">
                {rankings.growth.rank > 0 ? `#${rankings.growth.rank}` : 'N/A'}
              </p>
              {rankings.growth.total > 0 && (
                <p className={cn(
                  "text-xs",
                  rankings.growth.rank <= 2 ? 'text-green-500' : 'text-muted-foreground'
                )}>
                  of {rankings.growth.total}
                </p>
              )}
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg text-center">
              <p className="text-muted-foreground text-xs mb-1">Size Rank</p>
              <p className="text-2xl font-bold">
                {rankings.size.rank > 0 ? `#${rankings.size.rank}` : 'N/A'}
              </p>
              {rankings.size.total > 0 && (
                <p className="text-xs text-muted-foreground">of {rankings.size.total}</p>
              )}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 text-left font-medium">Company</th>
                <th className="p-3 text-right font-medium">Market Cap</th>
                <th className="p-3 text-right font-medium">P/E</th>
                <th className="p-3 text-right font-medium">Rev Growth</th>
                <th className="p-3 text-right font-medium">Profit Margin</th>
                <th className="p-3 text-center font-medium">Compare</th>
              </tr>
            </thead>
            <tbody>
              {/* Current stock row - highlighted */}
              <tr className="border-b border-border bg-green-500/10">
                <td className="p-3">
                  <span className="font-bold text-green-500">{symbol}</span>
                  <span className="text-muted-foreground ml-2 text-xs">(This stock)</span>
                </td>
                <td className="p-3 text-right font-medium">{formatCurrency(marketCap)}</td>
                <td className="p-3 text-right">
                  {pe > 0 ? pe.toFixed(1) : 'N/A'}
                  {pe > 0 && averages?.pe && <MetricIndicator value={pe} avg={averages.pe} higherIsBetter={false} />}
                </td>
                <td className="p-3 text-right">
                  <span className={revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {formatPercent(revenueGrowth)}
                  </span>
                  {averages?.revenueGrowth !== undefined && (
                    <MetricIndicator value={revenueGrowth} avg={averages.revenueGrowth} />
                  )}
                </td>
                <td className="p-3 text-right">
                  {formatPercent(profitMargin)}
                  {averages?.profitMargin !== undefined && (
                    <MetricIndicator value={profitMargin} avg={averages.profitMargin} />
                  )}
                </td>
                <td className="p-3 text-center">-</td>
              </tr>

              {/* Peer rows */}
              {peers.map((peer) => (
                <tr key={peer.ticker} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3">
                    <Link
                      href={`/stock/${peer.ticker.toLowerCase()}`}
                      className="font-medium hover:text-green-500 transition-colors"
                    >
                      {peer.ticker}
                    </Link>
                    <span className="text-muted-foreground ml-2 text-xs">{peer.name.split(' ').slice(0, 2).join(' ')}</span>
                  </td>
                  <td className="p-3 text-right">{formatCurrency(peer.marketCap)}</td>
                  <td className="p-3 text-right">
                    {peer.pe > 0 ? peer.pe.toFixed(1) : 'N/A'}
                  </td>
                  <td className="p-3 text-right">
                    <span className={peer.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {formatPercent(peer.revenueGrowth)}
                    </span>
                  </td>
                  <td className="p-3 text-right">{formatPercent(peer.profitMargin)}</td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/compare/${symbol.toLowerCase()}-vs-${peer.ticker.toLowerCase()}`}
                      className="text-xs px-2 py-1 bg-secondary hover:bg-green-500/20 hover:text-green-500 rounded transition-colors"
                    >
                      vs {peer.ticker}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Peer Average Summary */}
        {averages && (
          <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
            <p className="font-medium mb-2 text-sm">Peer Group Averages ({industry || sector || 'Industry'})</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Avg P/E:</span>
                <span className="ml-2 font-bold">{averages.pe > 0 ? averages.pe.toFixed(1) : 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Growth:</span>
                <span className="ml-2 font-bold">{formatPercent(averages.revenueGrowth)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Margin:</span>
                <span className="ml-2 font-bold">{formatPercent(averages.profitMargin)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Market Cap:</span>
                <span className="ml-2 font-bold">{formatCurrency(averages.marketCap)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Full Comparison Links */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-3">See full comparison:</p>
          <div className="flex flex-wrap gap-2">
            {peers.map(peer => (
              <Link
                key={peer.ticker}
                href={`/compare/${symbol.toLowerCase()}-vs-${peer.ticker.toLowerCase()}`}
                className="px-3 py-1.5 bg-secondary hover:bg-green-500/20 hover:text-green-500 rounded-lg text-sm transition-colors"
              >
                {symbol} vs {peer.ticker}
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const PeerComparison = memo(PeerComparisonComponent)
export default PeerComparison

// Export a server-side compatible version for SSR pages
export function PeerComparisonSSR({
  ticker,
  companyName,
  sector,
  industry,
  marketCap = 0,
  pe = 0,
  revenueGrowth = 0,
  profitMargin = 0,
  price = 0,
  peers,
}: PeerComparisonProps & { peers: PeerData[] }) {
  const symbol = ticker.toUpperCase()
  const industryName = industry || sector || 'its peer group'

  if (!peers || peers.length === 0) return null

  // Include current stock in rankings
  const currentStock: PeerData = {
    ticker: symbol,
    name: companyName,
    marketCap,
    pe,
    revenueGrowth,
    grossMargin: 0,
    profitMargin,
    price,
    sector,
    industry,
  }

  const allStocks = [currentStock, ...peers]

  // Calculate rankings
  const validPE = allStocks.filter(s => s.pe > 0)
  const validMargin = allStocks.filter(s => s.profitMargin !== 0)
  const validGrowth = allStocks.filter(s => s.revenueGrowth !== 0)

  const peRank = validPE.length > 0 ?
    [...validPE].sort((a, b) => a.pe - b.pe).findIndex(s => s.ticker === symbol) + 1 : 0
  const marginRank = validMargin.length > 0 ?
    [...validMargin].sort((a, b) => b.profitMargin - a.profitMargin).findIndex(s => s.ticker === symbol) + 1 : 0
  const growthRank = validGrowth.length > 0 ?
    [...validGrowth].sort((a, b) => b.revenueGrowth - a.revenueGrowth).findIndex(s => s.ticker === symbol) + 1 : 0

  // Generate insights
  const insights: string[] = []

  if (peRank === 1 && validPE.length > 1) {
    insights.push(`${symbol} has the lowest P/E ratio in ${industryName}, suggesting it may be the most undervalued`)
  } else if (peRank <= 2 && validPE.length > 2) {
    insights.push(`${symbol} ranks ${getOrdinal(peRank)} most undervalued by P/E ratio among peers`)
  }

  if (marginRank === 1 && validMargin.length > 1) {
    insights.push(`${symbol} has the highest profit margins in ${industryName}`)
  } else if (marginRank <= 2 && validMargin.length > 2) {
    insights.push(`${symbol} ranks ${getOrdinal(marginRank)} in profitability among competitors`)
  }

  if (growthRank === 1 && validGrowth.length > 1) {
    insights.push(`${symbol} has the fastest revenue growth among competitors`)
  } else if (growthRank <= 2 && validGrowth.length > 2) {
    insights.push(`${symbol} ranks ${getOrdinal(growthRank)} in revenue growth vs peers`)
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">How {symbol} Compares to Peers</h2>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="mb-4 space-y-2">
          {insights.slice(0, 3).map((insight, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {insight}
            </div>
          ))}
        </div>
      )}

      {/* Simple comparison table */}
      <div className="overflow-x-auto bg-card border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-right">P/E</th>
              <th className="p-3 text-right">Growth</th>
              <th className="p-3 text-right">Margin</th>
              <th className="p-3 text-center">Compare</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="bg-green-500/10">
              <td className="p-3 font-bold text-green-500">{symbol}</td>
              <td className="p-3 text-right">{pe > 0 ? pe.toFixed(1) : 'N/A'}</td>
              <td className="p-3 text-right">
                <span className={revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {(revenueGrowth * 100).toFixed(1)}%
                </span>
              </td>
              <td className="p-3 text-right">{(profitMargin * 100).toFixed(1)}%</td>
              <td className="p-3 text-center">-</td>
            </tr>
            {peers.slice(0, 5).map(peer => (
              <tr key={peer.ticker}>
                <td className="p-3">
                  <Link href={`/stock/${peer.ticker.toLowerCase()}`} className="font-medium hover:text-green-500">
                    {peer.ticker}
                  </Link>
                </td>
                <td className="p-3 text-right">{peer.pe > 0 ? peer.pe.toFixed(1) : 'N/A'}</td>
                <td className="p-3 text-right">
                  <span className={peer.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {(peer.revenueGrowth * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="p-3 text-right">{(peer.profitMargin * 100).toFixed(1)}%</td>
                <td className="p-3 text-center">
                  <Link
                    href={`/compare/${symbol.toLowerCase()}-vs-${peer.ticker.toLowerCase()}`}
                    className="text-xs text-green-500 hover:underline"
                  >
                    Compare
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comparison links */}
      <nav className="mt-4 flex flex-wrap gap-2">
        {peers.slice(0, 5).map(peer => (
          <Link
            key={peer.ticker}
            href={`/compare/${symbol.toLowerCase()}-vs-${peer.ticker.toLowerCase()}`}
            className="text-sm px-3 py-1 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            {symbol} vs {peer.ticker}
          </Link>
        ))}
      </nav>
    </section>
  )
}
