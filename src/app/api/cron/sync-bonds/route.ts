/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Sync corporate bonds data from OpenFIGI to Supabase
// Runs weekly (bond data doesn't change frequently)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Map company ticker to issuer name for OpenFIGI search
const TICKER_TO_ISSUER: Record<string, string> = {
  AAPL: 'APPLE INC',
  MSFT: 'MICROSOFT CORP',
  GOOGL: 'ALPHABET INC',
  GOOG: 'ALPHABET INC',
  AMZN: 'AMAZON COM INC',
  META: 'META PLATFORMS INC',
  TSLA: 'TESLA INC',
  NVDA: 'NVIDIA CORP',
  JPM: 'JPMORGAN CHASE',
  V: 'VISA INC',
  JNJ: 'JOHNSON & JOHNSON',
  WMT: 'WALMART INC',
  PG: 'PROCTER & GAMBLE',
  MA: 'MASTERCARD INC',
  HD: 'HOME DEPOT INC',
  CVX: 'CHEVRON CORP',
  XOM: 'EXXON MOBIL CORP',
  ABBV: 'ABBVIE INC',
  MRK: 'MERCK & CO',
  LLY: 'ELI LILLY',
  COST: 'COSTCO WHOLESALE',
  PEP: 'PEPSICO INC',
  KO: 'COCA-COLA CO',
  AVGO: 'BROADCOM INC',
  TMO: 'THERMO FISHER',
  MCD: 'MCDONALDS CORP',
  CSCO: 'CISCO SYSTEMS',
  ABT: 'ABBOTT LABORATORIES',
  NKE: 'NIKE INC',
  CRM: 'SALESFORCE INC',
  DIS: 'WALT DISNEY CO',
  VZ: 'VERIZON COMMUNICATIONS',
  INTC: 'INTEL CORP',
  CMCSA: 'COMCAST CORP',
  ADBE: 'ADOBE INC',
  TXN: 'TEXAS INSTRUMENTS',
  NFLX: 'NETFLIX INC',
  AMD: 'ADVANCED MICRO DEVICES',
  ORCL: 'ORACLE CORP',
  IBM: 'IBM CORP',
  BA: 'BOEING CO',
  GE: 'GENERAL ELECTRIC',
  GS: 'GOLDMAN SACHS',
  MS: 'MORGAN STANLEY',
  C: 'CITIGROUP INC',
  BAC: 'BANK OF AMERICA',
  WFC: 'WELLS FARGO',
  T: 'AT&T INC',
  CAT: 'CATERPILLAR INC',
}

interface ParsedBond {
  figi: string
  issuer: string
  bond_ticker: string
  coupon_rate: number | null
  maturity_date: string | null
  description: string
  exchange: string
  is_matured: boolean
  years_to_maturity: number | null
}

// Parse bond ticker to extract coupon and maturity
function parseBondTicker(ticker: string): { coupon: number | null; maturityDate: string | null } {
  const match = ticker.match(/^\w+\s+([\d.]+)\s+(\d{2}\/\d{2}\/\d{2,4})$/)

  if (match) {
    const coupon = parseFloat(match[1])
    const dateStr = match[2]
    const [month, day, year] = dateStr.split('/')
    const fullYear = year.length === 2 ?
      (parseInt(year) > 50 ? `19${year}` : `20${year}`) : year

    return {
      coupon: isNaN(coupon) ? null : coupon,
      maturityDate: `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }

  // Floating rate notes
  const floatMatch = ticker.match(/^\w+\s+F(?:loat)?\s+(\d{2}\/\d{2}\/\d{2,4})$/)
  if (floatMatch) {
    const dateStr = floatMatch[1]
    const [month, day, year] = dateStr.split('/')
    const fullYear = year.length === 2 ?
      (parseInt(year) > 50 ? `19${year}` : `20${year}`) : year
    return {
      coupon: null,
      maturityDate: `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }

  return { coupon: null, maturityDate: null }
}

function calculateYearsToMaturity(maturityDate: string | null): number | null {
  if (!maturityDate) return null
  const maturity = new Date(maturityDate)
  const now = new Date()
  const diffMs = maturity.getTime() - now.getTime()
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25)
  return Math.round(diffYears * 10) / 10
}

// Fetch bonds for a single ticker from OpenFIGI
async function fetchBondsForTicker(ticker: string): Promise<{ bonds: ParsedBond[]; summary: any }> {
  const issuerName = TICKER_TO_ISSUER[ticker] || ticker

  try {
    const response = await fetch('https://api.openfigi.com/v3/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: issuerName,
        securityType2: 'Corp',
      }),
    })

    if (!response.ok) {
      console.error(`OpenFIGI API error for ${ticker}:`, response.status)
      return { bonds: [], summary: null }
    }

    const data = await response.json()
    const allBonds = data.data || []
    const traceBonds = allBonds.filter((b: any) => b.exchCode === 'TRACE')

    const now = new Date()
    const parsedBonds: ParsedBond[] = traceBonds.map((bond: any) => {
      const { coupon, maturityDate } = parseBondTicker(bond.ticker)
      const yearsToMaturity = calculateYearsToMaturity(maturityDate)
      const isMatured = maturityDate ? new Date(maturityDate) < now : false

      return {
        figi: bond.figi,
        issuer: bond.name,
        bond_ticker: bond.ticker,
        coupon_rate: coupon,
        maturity_date: maturityDate,
        description: bond.securityDescription || '',
        exchange: bond.exchCode,
        is_matured: isMatured,
        years_to_maturity: isMatured ? null : yearsToMaturity
      }
    })

    // Filter active bonds for stats
    const activeBonds = parsedBonds.filter(b => !b.is_matured)
    const bondsWithCoupon = activeBonds.filter(b => b.coupon_rate !== null)
    const avgCoupon = bondsWithCoupon.length > 0
      ? bondsWithCoupon.reduce((sum, b) => sum + (b.coupon_rate || 0), 0) / bondsWithCoupon.length
      : null

    const maturingSoon = activeBonds.filter(b =>
      b.years_to_maturity !== null && b.years_to_maturity <= 2 && b.years_to_maturity > 0
    )

    // Get unique maturity years
    const maturityYears = [...new Set(
      activeBonds
        .filter(b => b.maturity_date)
        .map(b => new Date(b.maturity_date!).getFullYear())
    )].sort()

    return {
      bonds: parsedBonds,
      summary: {
        ticker,
        issuer: issuerName,
        total_bonds: activeBonds.length,
        total_matured: parsedBonds.filter(b => b.is_matured).length,
        avg_coupon_rate: avgCoupon ? Math.round(avgCoupon * 100) / 100 : null,
        maturing_soon_count: maturingSoon.length,
        maturity_years: maturityYears,
        last_synced_at: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error(`Error fetching bonds for ${ticker}:`, error)
    return { bonds: [], summary: null }
  }
}

// Priority tickers to sync
function getPriorityTickers(): string[] {
  return Object.keys(TICKER_TO_ISSUER)
}

export async function GET(request: NextRequest) {
  // Check for cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('Bonds sync called without CRON_SECRET')
  }

  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker') // Single ticker to sync
  const limit = parseInt(searchParams.get('limit') || '0') // 0 = all
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const results: { ticker: string; bondsInserted: number; error?: string }[] = []

  try {
    // Get tickers to sync
    let tickersToSync: string[]

    if (ticker) {
      tickersToSync = [ticker.toUpperCase()]
    } else {
      tickersToSync = getPriorityTickers()
      if (offset > 0) {
        tickersToSync = tickersToSync.slice(offset)
      }
      if (limit > 0) {
        tickersToSync = tickersToSync.slice(0, limit)
      }
    }

    console.log(`Syncing bonds for ${tickersToSync.length} tickers...`)

    for (let i = 0; i < tickersToSync.length; i++) {
      const t = tickersToSync[i]
      // Add delay to respect OpenFIGI rate limits (6 requests/minute without API key)
      // Skip delay for first request
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 11000))
      }

      const { bonds, summary } = await fetchBondsForTicker(t)

      if (bonds.length === 0) {
        results.push({ ticker: t, bondsInserted: 0, error: 'No bonds found' })
        continue
      }

      // Delete old bonds for this ticker
      const { error: deleteError } = await supabase
        .from('company_bonds')
        .delete()
        .eq('ticker', t)

      if (deleteError) {
        console.error(`Delete error for ${t}:`, deleteError)
      }

      // Insert new bonds
      const bondsWithTicker = bonds.map(b => ({ ...b, ticker: t }))

      const { error: insertError } = await (supabase as any)
        .from('company_bonds')
        .insert(bondsWithTicker)

      if (insertError) {
        console.error(`Insert error for ${t}:`, insertError)
        results.push({ ticker: t, bondsInserted: 0, error: insertError.message })
        continue
      }

      // Upsert summary
      if (summary) {
        const { error: summaryError } = await (supabase as any)
          .from('company_bonds_summary')
          .upsert(summary, {
            onConflict: 'ticker'
          })

        if (summaryError) {
          console.error(`Summary error for ${t}:`, summaryError)
        }
      }

      results.push({ ticker: t, bondsInserted: bonds.length })
    }

    const totalBonds = results.reduce((sum, r) => sum + r.bondsInserted, 0)
    const totalErrors = results.filter(r => r.error).length

    return NextResponse.json({
      success: true,
      summary: {
        tickersProcessed: tickersToSync.length,
        totalBondsInserted: totalBonds,
        totalErrors
      },
      results
    })

  } catch (error) {
    console.error('Bonds sync error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
