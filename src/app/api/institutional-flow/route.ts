import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

const SEC_USER_AGENT = 'Lician contact@lician.com'

// Elite institutions to track (high alpha signal)
const ELITE_INSTITUTIONS: Record<string, string> = {
  '1067983': 'Berkshire Hathaway',
  '1350694': 'Bridgewater Associates',
  '1037389': 'Renaissance Technologies',
  '1423053': 'Citadel Advisors',
  '1029160': 'Soros Fund Management',
  '1167483': 'Tiger Global',
  '1336528': 'Pershing Square',
  '1048445': 'Elliott Management',
  '1040273': 'Third Point',
  '102909': 'Vanguard Group',
  '1364742': 'BlackRock',
  '93751': 'State Street',
  '315066': 'FMR (Fidelity)',
}

interface HolderData {
  investor: string
  cik?: string
  shares: number
  value: number
  percentOwnership: number
  isElite?: boolean
}

interface QuarterData {
  reportDate: string
  filingDate: string
  totalHolders: number
  totalShares: number
  totalValue: number
  holders: HolderData[]
}

interface FlowAnalysis {
  ticker: string
  currentQuarter: QuarterData
  previousQuarter: QuarterData | null
  changes: {
    netHolderChange: number
    netShareChange: number
    netShareChangePercent: number
    netValueChange: number
    flowScore: number // 0-100
    flowSignal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL'
  }
  holderChanges: {
    newPositions: HolderData[]
    increasedPositions: { holder: HolderData; shareChange: number; percentChange: number }[]
    decreasedPositions: { holder: HolderData; shareChange: number; percentChange: number }[]
    exitedPositions: HolderData[]
  }
  eliteActivity: {
    eliteHolderCount: number
    eliteNetFlow: number
    eliteHolders: string[]
    eliteSignal: 'BUYING' | 'SELLING' | 'NEUTRAL'
  }
  concentration: {
    hhi: number
    hhiNormalized: number
    top5Percent: number
    top10Percent: number
    effectiveHolders: number
    rating: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
  }
}

// Calculate HHI concentration
function calculateConcentration(holders: HolderData[], totalShares: number) {
  if (totalShares === 0 || holders.length === 0) {
    return {
      hhi: 0,
      hhiNormalized: 0,
      top5Percent: 0,
      top10Percent: 0,
      effectiveHolders: 0,
      rating: 'LOW' as const
    }
  }

  // Calculate HHI
  const hhi = holders.reduce((sum, holder) => {
    const marketShare = holder.shares / totalShares
    return sum + (marketShare * marketShare)
  }, 0)

  // Sort by shares for top N calculations
  const sorted = [...holders].sort((a, b) => b.shares - a.shares)
  const top5Shares = sorted.slice(0, 5).reduce((sum, h) => sum + h.shares, 0)
  const top10Shares = sorted.slice(0, 10).reduce((sum, h) => sum + h.shares, 0)

  const hhiNormalized = hhi * 10000

  return {
    hhi,
    hhiNormalized,
    top5Percent: (top5Shares / totalShares) * 100,
    top10Percent: (top10Shares / totalShares) * 100,
    effectiveHolders: hhi > 0 ? 1 / hhi : 0,
    rating: hhi > 0.25 ? 'VERY_HIGH' as const :
            hhi > 0.15 ? 'HIGH' as const :
            hhi > 0.10 ? 'MODERATE' as const : 'LOW' as const
  }
}

// Calculate flow score (0-100)
function calculateFlowScore(
  newPositions: number,
  increased: number,
  decreased: number,
  exited: number,
  totalHolders: number
): { score: number; signal: FlowAnalysis['changes']['flowSignal'] } {
  if (totalHolders === 0) {
    return { score: 50, signal: 'NEUTRAL' }
  }

  // Weighted scoring
  const rawScore = (
    (newPositions * 3) +
    (increased * 2) -
    (decreased * 1) -
    (exited * 2)
  ) / totalHolders * 50 + 50

  const score = Math.max(0, Math.min(100, rawScore))

  let signal: FlowAnalysis['changes']['flowSignal']
  if (score >= 75) signal = 'STRONG_BUY'
  else if (score >= 60) signal = 'BUY'
  else if (score >= 40) signal = 'NEUTRAL'
  else if (score >= 25) signal = 'SELL'
  else signal = 'STRONG_SELL'

  return { score, signal }
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Fetch institutional data for current and previous quarters
    const [currentRes, previousRes] = await Promise.all([
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'https://lician.com'}/api/institutional?ticker=${ticker}`,
        { next: { revalidate: 3600 } }
      ),
      // For previous quarter, we'd need to fetch with a quarter offset
      // For now, use Financial Datasets which includes change data
      fetch(
        `https://api.financialdatasets.ai/institutional-ownership/?ticker=${ticker}&limit=100`,
        {
          headers: { 'X-API-KEY': process.env.FINANCIAL_DATASETS_API_KEY || '' },
          next: { revalidate: 3600 }
        }
      ).catch(() => null)
    ])

    const currentData = await currentRes.json()
    const fdData = previousRes ? await previousRes.json().catch(() => null) : null

    const holders = currentData.holders || []
    const totalShares = currentData.summary?.totalShares || 0
    const totalValue = currentData.summary?.totalValue || 0

    // Build holder data with elite flagging
    const holderData: HolderData[] = holders.map((h: any) => ({
      investor: h.investor,
      shares: h.shares || 0,
      value: h.value || 0,
      percentOwnership: h.percentOwnership || 0,
      isElite: Object.values(ELITE_INSTITUTIONS).some(
        name => h.investor?.toLowerCase().includes(name.toLowerCase().split(' ')[0])
      )
    }))

    // Calculate concentration
    const concentration = calculateConcentration(holderData, totalShares)

    // Analyze changes using Financial Datasets data if available
    const fdHoldings = fdData?.institutional_ownership || []

    // Categorize holder changes
    const newPositions = fdHoldings
      .filter((h: any) => h.is_new_position)
      .map((h: any) => ({
        investor: h.investor_name || h.investor,
        shares: h.shares,
        value: h.market_value,
        percentOwnership: h.percent_of_outstanding
      }))

    const increasedPositions = fdHoldings
      .filter((h: any) => !h.is_new_position && h.change_in_shares > 0)
      .map((h: any) => ({
        holder: {
          investor: h.investor_name || h.investor,
          shares: h.shares,
          value: h.market_value,
          percentOwnership: h.percent_of_outstanding
        },
        shareChange: h.change_in_shares,
        percentChange: h.change_percent || 0
      }))

    const decreasedPositions = fdHoldings
      .filter((h: any) => h.change_in_shares < 0)
      .map((h: any) => ({
        holder: {
          investor: h.investor_name || h.investor,
          shares: h.shares,
          value: h.market_value,
          percentOwnership: h.percent_of_outstanding
        },
        shareChange: h.change_in_shares,
        percentChange: h.change_percent || 0
      }))

    // Calculate flow score
    const { score: flowScore, signal: flowSignal } = calculateFlowScore(
      newPositions.length,
      increasedPositions.length,
      decreasedPositions.length,
      0, // We don't have exited positions data easily
      holders.length
    )

    // Calculate net changes
    const netShareChange = fdHoldings.reduce((sum: number, h: any) =>
      sum + (h.change_in_shares || 0), 0)

    // Elite institution analysis
    const eliteHolders = holderData.filter(h => h.isElite)
    const eliteNetFlow = fdHoldings
      .filter((h: any) => {
        const name = (h.investor_name || h.investor || '').toLowerCase()
        return Object.values(ELITE_INSTITUTIONS).some(
          elite => name.includes(elite.toLowerCase().split(' ')[0])
        )
      })
      .reduce((sum: number, h: any) => sum + (h.change_in_shares || 0), 0)

    const eliteSignal: 'BUYING' | 'SELLING' | 'NEUTRAL' =
      eliteNetFlow > 100000 ? 'BUYING' :
      eliteNetFlow < -100000 ? 'SELLING' : 'NEUTRAL'

    const response: FlowAnalysis = {
      ticker,
      currentQuarter: {
        reportDate: fdHoldings[0]?.report_date || new Date().toISOString().split('T')[0],
        filingDate: fdHoldings[0]?.filing_date || new Date().toISOString().split('T')[0],
        totalHolders: holders.length,
        totalShares,
        totalValue,
        holders: holderData.slice(0, 20) // Top 20
      },
      previousQuarter: null, // Would need historical data
      changes: {
        netHolderChange: newPositions.length - 0, // exits unknown
        netShareChange,
        netShareChangePercent: totalShares > 0 ? (netShareChange / totalShares) * 100 : 0,
        netValueChange: 0, // Would need price-adjusted calculation
        flowScore,
        flowSignal
      },
      holderChanges: {
        newPositions: newPositions.slice(0, 10),
        increasedPositions: increasedPositions.slice(0, 10),
        decreasedPositions: decreasedPositions.slice(0, 10),
        exitedPositions: []
      },
      eliteActivity: {
        eliteHolderCount: eliteHolders.length,
        eliteNetFlow,
        eliteHolders: eliteHolders.map(h => h.investor),
        eliteSignal
      },
      concentration
    }

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Institutional flow error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Failed to fetch flow data' }, { status: 500 })
  }
}
