import { NextRequest, NextResponse } from 'next/server'

// Free crypto prices from CoinGecko (no API key needed)
// Rate limit: 10-50 calls/minute for free tier

interface CryptoPrice {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
  high24h: number
  low24h: number
  ath: number
  athChangePercent: number
  rank: number
  image: string
  sparkline?: number[]
  lastUpdated: string
}

// Top crypto IDs for CoinGecko
const TOP_CRYPTOS = [
  'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana',
  'ripple', 'usd-coin', 'cardano', 'dogecoin', 'avalanche-2',
  'polkadot', 'chainlink', 'matic-network', 'tron', 'shiba-inu',
  'litecoin', 'bitcoin-cash', 'uniswap', 'stellar', 'cosmos',
  'monero', 'ethereum-classic', 'okb', 'hedera-hashgraph', 'aptos'
]

async function fetchCoinGeckoPrices(ids: string[]): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }, // Cache for 30 seconds
      }
    )

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status)
      return []
    }

    const data = await response.json()

    return data.map((coin: Record<string, unknown>) => ({
      id: coin.id,
      symbol: (coin.symbol as string).toUpperCase(),
      name: coin.name,
      price: coin.current_price || 0,
      change24h: (coin.current_price as number) - ((coin.current_price as number) / (1 + (coin.price_change_percentage_24h as number || 0) / 100)),
      changePercent24h: coin.price_change_percentage_24h || 0,
      volume24h: coin.total_volume || 0,
      marketCap: coin.market_cap || 0,
      high24h: coin.high_24h || 0,
      low24h: coin.low_24h || 0,
      ath: coin.ath || 0,
      athChangePercent: coin.ath_change_percentage || 0,
      rank: coin.market_cap_rank || 0,
      image: coin.image || '',
      sparkline: (coin.sparkline_in_7d as Record<string, number[]>)?.price || [],
      lastUpdated: coin.last_updated || new Date().toISOString(),
    }))
  } catch (error) {
    console.error('CoinGecko fetch error:', error)
    return []
  }
}

// Get trending cryptos
async function fetchTrendingCrypto(): Promise<{ id: string; name: string; symbol: string; rank: number }[]> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/search/trending',
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.coins?.map((item: { item: { id: string; name: string; symbol: string; market_cap_rank: number } }) => ({
      id: item.item.id,
      name: item.item.name,
      symbol: item.item.symbol,
      rank: item.item.market_cap_rank,
    })) || []
  } catch (error) {
    console.error('Trending crypto error:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const idsParam = searchParams.get('ids')
  const trending = searchParams.get('trending') === 'true'
  const top = searchParams.get('top')

  try {
    // Get trending cryptos
    if (trending) {
      const trendingCoins = await fetchTrendingCrypto()
      return NextResponse.json({
        trending: trendingCoins,
        timestamp: Date.now(),
      })
    }

    // Get specific crypto prices
    let ids: string[]
    if (idsParam) {
      ids = idsParam.toLowerCase().split(',')
    } else if (top) {
      ids = TOP_CRYPTOS.slice(0, parseInt(top) || 25)
    } else {
      ids = TOP_CRYPTOS
    }

    const prices = await fetchCoinGeckoPrices(ids)

    return NextResponse.json({
      prices,
      count: prices.length,
      timestamp: Date.now(),
      _meta: {
        source: 'coingecko',
        cacheTime: 30,
        rateLimit: '10-50 calls/minute',
      },
    })
  } catch (error) {
    console.error('Crypto API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch crypto prices',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
