"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown, Flame } from "lucide-react"

interface MarketDataItem {
  symbol: string
  name: string
  price: number
  changeToday: number
  changeTodayPercent: number
  change5d: number
  change1m: number
  changeYtd: number
  change1y: number
  change3y: number
  dayLow: number
  dayHigh: number
  week52Low: number
  week52High: number
  unit?: string
}

interface CategoryData {
  name: string
  data: MarketDataItem[]
}

interface MarketData {
  categories: Record<string, CategoryData>
  lastUpdated: string
}

interface CommodityData {
  symbol: string
  name: string
  unit: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  week52High: number
  week52Low: number
  error?: string
}

interface CommoditiesResponse {
  commodities: Record<string, CommodityData>
  lastUpdated: string
}

const CATEGORY_ORDER = [
  'us_equities',
  'us_sectors',
  'us_factors',
  'global_equities',
  'countries',
  'bonds',
  'commodities',
  'real_commodities',
  'currencies'
]

function formatPercent(value: number): string {
  if (value === 0 || isNaN(value)) return "0.00%"
  return `${value >= 0 ? "" : ""}${value.toFixed(2)}%`
}

function formatPrice(value: number): string {
  if (!value) return "-"
  return value.toFixed(2)
}

function PercentCell({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span className={`tabular-nums ${isPositive ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
      {formatPercent(value)}
    </span>
  )
}

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  if (!low || !high || low === high) return <span className="text-[#868f97]">-</span>

  const percentage = ((current - low) / (high - low)) * 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage))

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <span className="text-xs text-[#868f97] tabular-nums">{formatPrice(low)}</span>
      <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full relative">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
          style={{ width: `${clampedPercentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full border border-background"
          style={{ left: `calc(${clampedPercentage}% - 4px)` }}
        />
      </div>
      <span className="text-xs text-[#868f97] tabular-nums">{formatPrice(high)}</span>
    </div>
  )
}

export default function MarketDataTable() {
  const [data, setData] = useState<MarketData | null>(null)
  const [commoditiesData, setCommoditiesData] = useState<CommoditiesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch both market data and real commodities in parallel
      const [marketResponse, commoditiesResponse] = await Promise.all([
        fetch('/api/market-data?category=all'),
        fetch('/api/commodities?commodity=all').catch(() => null)
      ])

      const marketResult = await marketResponse.json()
      setData(marketResult)

      if (commoditiesResponse && commoditiesResponse.ok) {
        const commoditiesResult = await commoditiesResponse.json()
        setCommoditiesData(commoditiesResult)
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
    }
    setLoading(false)
  }

  // Transform commodities data to market data format
  const getRealCommoditiesCategory = (): CategoryData | null => {
    if (!commoditiesData?.commodities) return null

    const commodityItems: MarketDataItem[] = Object.values(commoditiesData.commodities)
      .filter(c => !c.error && c.price > 0)
      .map(c => ({
        symbol: c.symbol,
        name: c.name,
        price: c.price,
        changeToday: c.change,
        changeTodayPercent: c.changePercent,
        change5d: 0, // Alpha Vantage monthly data doesn't have 5d
        change1m: c.changePercent, // Use changePercent as 1m proxy
        changeYtd: 0,
        change1y: 0,
        change3y: 0,
        dayLow: c.previousClose,
        dayHigh: c.price,
        week52Low: c.week52Low,
        week52High: c.week52High,
        unit: c.unit
      }))

    return commodityItems.length > 0 ? {
      name: "Real Commodities",
      data: commodityItems
    } : null
  }

  const categories = data?.categories || {}
  const realCommodities = getRealCommoditiesCategory()

  // Merge real commodities into categories
  const allCategories = realCommodities
    ? { ...categories, real_commodities: realCommodities }
    : categories

  const sortedCategories = CATEGORY_ORDER.filter(cat => allCategories[cat])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market Data</h1>
          <p className="text-sm text-[#868f97]">
            Key market indices, sectors, and asset classes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data?.lastUpdated && (
            <span className="text-xs text-[#868f97]">
              Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
        >
          All
        </Button>
        {sortedCategories.map(cat => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'real_commodities' && <Flame className="w-3 h-3 mr-1 text-[#ffa16c]" />}
            {allCategories[cat]?.name}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
              <CardHeader>
                <div className="h-6 w-40 bg-white/[0.05] animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-8 bg-white/[0.05] animate-pulse rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedCategories
            .filter(cat => activeCategory === 'all' || activeCategory === cat)
            .map(cat => {
              const category = allCategories[cat]
              if (!category) return null

              const isRealCommodities = cat === 'real_commodities'

              return (
                <Card key={cat} className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl overflow-hidden">
                  <CardHeader className="bg-white/[0.015] py-3">
                    <div className="flex items-center gap-2">
                      {isRealCommodities && <Flame className="w-4 h-4 text-[#ffa16c]" />}
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      {isRealCommodities && (
                        <span className="text-xs text-[#868f97] ml-2">via Alpha Vantage</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/[0.08]">
                            <th className="text-left p-3 font-medium text-[#868f97]">Name</th>
                            <th className="text-left p-3 font-medium text-[#868f97]">Symbol</th>
                            {isRealCommodities && (
                              <th className="text-right p-3 font-medium text-[#868f97]">Price</th>
                            )}
                            <th className="text-right p-3 font-medium text-[#868f97]">
                              {isRealCommodities ? "Change" : "Today"}
                            </th>
                            {!isRealCommodities && (
                              <>
                                <th className="text-right p-3 font-medium text-[#868f97]">5 Days</th>
                                <th className="text-right p-3 font-medium text-[#868f97]">1 Month</th>
                                <th className="text-right p-3 font-medium text-[#868f97]">YTD</th>
                                <th className="text-right p-3 font-medium text-[#868f97]">1 Year</th>
                                <th className="text-right p-3 font-medium text-[#868f97]">3 Years</th>
                                <th className="p-3 font-medium text-[#868f97]">Day Range</th>
                              </>
                            )}
                            <th className="p-3 font-medium text-[#868f97]">52 Week Range</th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.data.map((item, i) => (
                            <tr
                              key={item.symbol}
                              className={`border-b border-white/[0.04] hover:bg-white/[0.015] motion-safe:transition-colors motion-safe:duration-150 ease-out cursor-pointer ${
                                i % 2 === 0 ? '' : 'bg-white/[0.005]'
                              }`}
                            >
                              <td className="p-3 font-medium">
                                {item.name}
                                {item.unit && (
                                  <span className="text-xs text-[#868f97] ml-1">({item.unit})</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="text-primary font-medium">{item.symbol}</span>
                              </td>
                              {isRealCommodities && (
                                <td className="p-3 text-right tabular-nums font-medium">
                                  ${typeof item.price === 'number' ? item.price.toFixed(2) : '—'}
                                </td>
                              )}
                              <td className="p-3 text-right">
                                <PercentCell value={item.changeTodayPercent} />
                              </td>
                              {!isRealCommodities && (
                                <>
                                  <td className="p-3 text-right">
                                    <PercentCell value={item.change5d} />
                                  </td>
                                  <td className="p-3 text-right">
                                    <PercentCell value={item.change1m} />
                                  </td>
                                  <td className="p-3 text-right">
                                    <PercentCell value={item.changeYtd} />
                                  </td>
                                  <td className="p-3 text-right">
                                    <PercentCell value={item.change1y} />
                                  </td>
                                  <td className="p-3 text-right">
                                    <PercentCell value={item.change3y} />
                                  </td>
                                  <td className="p-3">
                                    <RangeBar
                                      low={item.dayLow}
                                      high={item.dayHigh}
                                      current={item.price}
                                    />
                                  </td>
                                </>
                              )}
                              <td className="p-3">
                                <RangeBar
                                  low={item.week52Low}
                                  high={item.week52High}
                                  current={item.price}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}
