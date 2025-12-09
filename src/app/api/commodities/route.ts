import { NextRequest, NextResponse } from 'next/server'

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || ""
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"

// Commodity types supported by Alpha Vantage
const COMMODITY_FUNCTIONS = {
  WTI: { name: "WTI Crude Oil", unit: "USD/barrel" },
  BRENT: { name: "Brent Crude Oil", unit: "USD/barrel" },
  NATURAL_GAS: { name: "Natural Gas", unit: "USD/mmBtu" },
  COPPER: { name: "Copper", unit: "USD/lb" },
  ALUMINUM: { name: "Aluminum", unit: "USD/ton" },
  WHEAT: { name: "Wheat", unit: "USD/bushel" },
  CORN: { name: "Corn", unit: "USD/bushel" },
  COTTON: { name: "Cotton", unit: "USD/lb" },
  SUGAR: { name: "Sugar", unit: "USD/lb" },
  COFFEE: { name: "Coffee", unit: "USD/lb" },
} as const

type CommodityType = keyof typeof COMMODITY_FUNCTIONS

interface CommodityDataPoint {
  date: string
  value: string
}

interface AlphaVantageResponse {
  name: string
  interval: string
  unit: string
  data: CommodityDataPoint[]
  "Information"?: string
  "Note"?: string
}

interface CommodityResult {
  symbol: string
  name: string
  unit: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  week52High: number
  week52Low: number
  history: { date: string; price: number }[]
  error?: string
}

async function fetchCommodity(
  commodity: CommodityType,
  interval: string = "monthly"
): Promise<CommodityResult> {
  const info = COMMODITY_FUNCTIONS[commodity]

  try {
    const params = new URLSearchParams({
      function: commodity,
      interval: interval,
      apikey: ALPHA_VANTAGE_API_KEY,
    })

    const response = await fetch(
      `${ALPHA_VANTAGE_BASE_URL}?${params.toString()}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data: AlphaVantageResponse = await response.json()

    // Check for API limit or error messages
    if (data["Information"] || data["Note"]) {
      throw new Error(data["Information"] || data["Note"] || "API limit reached")
    }

    if (!data.data || data.data.length === 0) {
      throw new Error("No data returned")
    }

    // Process the data
    const history = data.data
      .filter(d => d.value && d.value !== ".")
      .map(d => ({
        date: d.date,
        price: parseFloat(d.value)
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const currentPrice = history[0]?.price || 0
    const previousPrice = history[1]?.price || currentPrice
    const change = currentPrice - previousPrice
    const changePercent = previousPrice ? (change / previousPrice) * 100 : 0

    // Calculate 52-week high/low
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const yearHistory = history.filter(d => new Date(d.date) >= oneYearAgo)
    const week52High = Math.max(...yearHistory.map(d => d.price), currentPrice)
    const week52Low = Math.min(...yearHistory.map(d => d.price), currentPrice)

    return {
      symbol: commodity,
      name: info.name,
      unit: info.unit,
      price: currentPrice,
      change,
      changePercent,
      previousClose: previousPrice,
      week52High,
      week52Low,
      history: history.slice(0, 12) // Last 12 data points
    }
  } catch (error) {
    return {
      symbol: commodity,
      name: info.name,
      unit: info.unit,
      price: 0,
      change: 0,
      changePercent: 0,
      previousClose: 0,
      week52High: 0,
      week52Low: 0,
      history: [],
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export async function GET(request: NextRequest) {
  const commodity = request.nextUrl.searchParams.get('commodity')
  const interval = request.nextUrl.searchParams.get('interval') || 'monthly'

  try {
    if (commodity && commodity !== 'all') {
      // Fetch single commodity
      const upperCommodity = commodity.toUpperCase() as CommodityType
      if (!COMMODITY_FUNCTIONS[upperCommodity]) {
        return NextResponse.json(
          { error: `Unknown commodity: ${commodity}` },
          { status: 400 }
        )
      }

      const result = await fetchCommodity(upperCommodity, interval)
      return NextResponse.json(result)
    }

    // Fetch all commodities
    // Note: Alpha Vantage has rate limits (5 calls/minute on free tier)
    // We'll fetch them sequentially with small delays
    const results: Record<string, CommodityResult> = {}
    const commodities = Object.keys(COMMODITY_FUNCTIONS) as CommodityType[]

    for (const comm of commodities) {
      results[comm] = await fetchCommodity(comm, interval)
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return NextResponse.json({
      commodities: results,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Commodities API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commodities data' },
      { status: 500 }
    )
  }
}
