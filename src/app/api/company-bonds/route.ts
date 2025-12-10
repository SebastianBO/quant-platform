import { NextRequest, NextResponse } from 'next/server'

// OpenFIGI API - Free, no key required (but rate limited without key)
// Returns bond listings for a company with coupon and maturity info parsed from ticker

interface OpenFigiBond {
  figi: string
  name: string
  ticker: string
  exchCode: string
  compositeFIGI: string | null
  securityType: string
  marketSector: string
  shareClassFIGI: string | null
  securityType2: string
  securityDescription: string
}

interface ParsedBond {
  figi: string
  issuer: string
  ticker: string
  couponRate: number | null
  maturityDate: string | null
  maturityYear: number | null
  description: string
  exchange: string
  isMatured: boolean
  yearsToMaturity: number | null
}

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

// Parse bond ticker to extract coupon and maturity
// Format: "AAPL 3.2 05/13/25" -> coupon: 3.2, maturity: 05/13/25
function parseBondTicker(ticker: string): { coupon: number | null; maturityDate: string | null } {
  // Match pattern: TICKER COUPON MM/DD/YY
  const match = ticker.match(/^\w+\s+([\d.]+)\s+(\d{2}\/\d{2}\/\d{2,4})$/)

  if (match) {
    const coupon = parseFloat(match[1])
    const dateStr = match[2]

    // Parse date - handle 2-digit and 4-digit years
    const [month, day, year] = dateStr.split('/')
    const fullYear = year.length === 2 ?
      (parseInt(year) > 50 ? `19${year}` : `20${year}`) : year

    return {
      coupon: isNaN(coupon) ? null : coupon,
      maturityDate: `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }

  // Try alternative format with "Float" for floating rate notes
  const floatMatch = ticker.match(/^\w+\s+F(?:loat)?\s+(\d{2}\/\d{2}\/\d{2,4})$/)
  if (floatMatch) {
    const dateStr = floatMatch[1]
    const [month, day, year] = dateStr.split('/')
    const fullYear = year.length === 2 ?
      (parseInt(year) > 50 ? `19${year}` : `20${year}`) : year

    return {
      coupon: null, // Floating rate
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

  return Math.round(diffYears * 10) / 10 // Round to 1 decimal
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const includeMatured = request.nextUrl.searchParams.get('includeMatured') === 'true'

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  const upperTicker = ticker.toUpperCase()

  // Get issuer name for the ticker
  let issuerName = TICKER_TO_ISSUER[upperTicker]

  if (!issuerName) {
    // Try to use the ticker directly as company name
    issuerName = upperTicker
  }

  try {
    // Search OpenFIGI for corporate bonds
    const response = await fetch('https://api.openfigi.com/v3/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add API key if you have one for higher rate limits
        // 'X-OPENFIGI-APIKEY': process.env.OPENFIGI_API_KEY || ''
      },
      body: JSON.stringify({
        query: issuerName,
        securityType2: 'Corp', // Corporate bonds only
      }),
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('OpenFIGI API error:', response.status)
      return NextResponse.json({
        error: 'Failed to fetch bond data',
        ticker: upperTicker,
        bonds: []
      }, { status: response.status })
    }

    const data = await response.json()
    const allBonds: OpenFigiBond[] = data.data || []

    // Filter to TRACE only (US-traded bonds)
    const traceBonds = allBonds.filter(b => b.exchCode === 'TRACE')

    // Parse and enrich bond data
    const now = new Date()
    const parsedBonds: ParsedBond[] = traceBonds.map(bond => {
      const { coupon, maturityDate } = parseBondTicker(bond.ticker)
      const maturityYear = maturityDate ? new Date(maturityDate).getFullYear() : null
      const yearsToMaturity = calculateYearsToMaturity(maturityDate)
      const isMatured = maturityDate ? new Date(maturityDate) < now : false

      return {
        figi: bond.figi,
        issuer: bond.name,
        ticker: bond.ticker,
        couponRate: coupon,
        maturityDate,
        maturityYear,
        description: bond.securityDescription,
        exchange: bond.exchCode,
        isMatured,
        yearsToMaturity: isMatured ? null : yearsToMaturity
      }
    })

    // Filter out matured bonds unless requested
    const activeBonds = includeMatured
      ? parsedBonds
      : parsedBonds.filter(b => !b.isMatured)

    // Sort by maturity date (earliest first)
    activeBonds.sort((a, b) => {
      if (!a.maturityDate) return 1
      if (!b.maturityDate) return -1
      return new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()
    })

    // Group by maturity year for summary
    const byMaturityYear: Record<number, { count: number; bonds: ParsedBond[] }> = {}
    activeBonds.forEach(bond => {
      if (bond.maturityYear) {
        if (!byMaturityYear[bond.maturityYear]) {
          byMaturityYear[bond.maturityYear] = { count: 0, bonds: [] }
        }
        byMaturityYear[bond.maturityYear].count++
        byMaturityYear[bond.maturityYear].bonds.push(bond)
      }
    })

    // Calculate average coupon
    const bondsWithCoupon = activeBonds.filter(b => b.couponRate !== null)
    const avgCoupon = bondsWithCoupon.length > 0
      ? bondsWithCoupon.reduce((sum, b) => sum + (b.couponRate || 0), 0) / bondsWithCoupon.length
      : null

    // Find maturing soon (within 2 years)
    const maturingSoon = activeBonds.filter(b =>
      b.yearsToMaturity !== null && b.yearsToMaturity <= 2 && b.yearsToMaturity > 0
    )

    return NextResponse.json({
      ticker: upperTicker,
      issuer: issuerName,
      summary: {
        totalBonds: activeBonds.length,
        totalMatured: parsedBonds.filter(b => b.isMatured).length,
        avgCouponRate: avgCoupon ? Math.round(avgCoupon * 100) / 100 : null,
        maturingSoonCount: maturingSoon.length,
        maturityYears: Object.keys(byMaturityYear).map(Number).sort()
      },
      bonds: activeBonds,
      maturingSoon,
      byMaturityYear,
      _meta: {
        source: 'OpenFIGI',
        fetched_at: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Company bonds API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      ticker: upperTicker,
      bonds: []
    }, { status: 500 })
  }
}
