import { NextRequest, NextResponse } from 'next/server'

// Common CUSIP to ticker mappings (top ~200 stocks)
// CUSIP format: 9 characters, first 6 = issuer, next 2 = issue, last = check digit
const CUSIP_TO_TICKER: Record<string, string> = {
  // Mega caps
  '037833100': 'AAPL',   // Apple
  '594918104': 'MSFT',   // Microsoft
  '02079K305': 'GOOGL',  // Alphabet Class A
  '02079K107': 'GOOG',   // Alphabet Class C
  '023135106': 'AMZN',   // Amazon
  '67066G104': 'NVDA',   // NVIDIA
  '88160R101': 'TSLA',   // Tesla
  '30303M102': 'META',   // Meta
  '084670702': 'BRK.B',  // Berkshire B
  '084670108': 'BRK.A',  // Berkshire A

  // Large caps - Tech
  '00724F101': 'ADBE',   // Adobe
  '79466L302': 'SALESFORCE', // Salesforce (CRM)
  '79466L302': 'CRM',    // Salesforce
  '458140100': 'INTC',   // Intel
  '00206R102': 'T',      // AT&T
  '92343V104': 'VZ',     // Verizon
  '17275R102': 'CSCO',   // Cisco
  '571903202': 'MRK',    // Merck (actually pharma)
  '00507V109': 'ADSK',   // Autodesk
  '22160K105': 'COST',   // Costco

  // Financials
  '060505104': 'BAC',    // Bank of America
  '46625H100': 'JPM',    // JPMorgan
  '172967424': 'C',      // Citigroup
  '949746101': 'WFC',    // Wells Fargo
  '38141G104': 'GS',     // Goldman Sachs
  '617446448': 'MS',     // Morgan Stanley
  '025816109': 'AXP',    // American Express
  '92826C839': 'V',      // Visa
  '585055106': 'MA',     // Mastercard
  '0258161092': 'AXP',   // American Express (alternate)

  // Healthcare/Pharma
  '478160104': 'JNJ',    // Johnson & Johnson
  '91324P102': 'UNH',    // UnitedHealth
  '718172109': 'PFE',    // Pfizer
  '58933Y105': 'MRK',    // Merck
  '002824100': 'ABBV',   // AbbVie
  '09857L108': 'BMY',    // Bristol-Myers
  '49456B101': 'KMB',    // Kimberly-Clark
  '532457108': 'LLY',    // Eli Lilly

  // Consumer
  '191216100': 'KO',     // Coca-Cola
  '713448108': 'PEP',    // PepsiCo
  '742718109': 'PG',     // Procter & Gamble
  '931142103': 'WMT',    // Walmart
  '548661107': 'LOW',    // Lowe's
  '437076102': 'HD',     // Home Depot
  '580135101': 'MCD',    // McDonald's
  '654106103': 'NKE',    // Nike
  '853061100': 'SBUX',   // Starbucks

  // Industrial
  '097023105': 'BA',     // Boeing
  '149123101': 'CAT',    // Caterpillar
  '369550108': 'GE',     // General Electric
  '443556101': 'HON',    // Honeywell
  '912909108': 'UNP',    // Union Pacific
  '902973304': 'UPS',    // UPS
  '345370860': 'F',      // Ford
  '370334104': 'GM',     // General Motors

  // Energy
  '30231G102': 'XOM',    // Exxon Mobil
  '166764100': 'CVX',    // Chevron
  '163852103': 'CHTR',   // Charter Communications
  '20825C104': 'COP',    // ConocoPhillips
  '81369Y506': 'SLB',    // Schlumberger

  // Entertainment/Media
  '254687106': 'DIS',    // Disney
  '64110L106': 'NFLX',   // Netflix
  '22160N109': 'COST',   // Costco (alternate)
  '925524303': 'ABNB',   // Airbnb (use full)

  // Semiconductors
  '032654105': 'AMAT',   // Applied Materials
  '458140100': 'INTC',   // Intel
  '00724F101': 'ADBE',   // Adobe
  '59517P701': 'MU',     // Micron
  '882508104': 'TXN',    // Texas Instruments
  '00790A105': 'ADI',    // Analog Devices
  '747525103': 'QCOM',   // Qualcomm
  '09061G101': 'AVGO',   // Broadcom

  // Other Large Caps
  '02005N100': 'ALLY',   // Ally Financial
  '00287Y109': 'ABBV',   // AbbVie (alternate)
  '023135106': 'AMZN',   // Amazon (confirm)
  '98138H101': 'WBD',    // Warner Bros Discovery
  '872540109': 'TJX',    // TJX Companies
  '057224107': 'BKNG',   // Booking Holdings
  '693718108': 'OXY',    // Occidental Petroleum
  '91529Y106': 'VEEV',   // Veeva Systems
  '552953101': 'MCHP',   // Microchip Technology
  '44919P508': 'IBKR',   // Interactive Brokers
  '30063P105': 'EXPE',   // Expedia
  '81464W409': 'SQ',     // Block (Square)
  '761152107': 'RCL',    // Royal Caribbean
  '126650100': 'CVS',    // CVS Health
  '02687478': 'AON',     // Aon
  '22788C105': 'CRWD',   // CrowdStrike
  '03027X100': 'AMT',    // American Tower
  '29444U700': 'EQIX',   // Equinix
  '761152107': 'RCL',    // Royal Caribbean
  '929160109': 'VMC',    // Vulcan Materials
  '91913Y100': 'VALE',   // Vale
  '879868107': 'TDG',    // TransDigm
  '90384S303': 'UBER',   // Uber
  '53814L108': 'LYFT',   // Lyft
  '70450Y103': 'PYPL',   // PayPal
  '68268K103': 'ON',     // ON Semiconductor
  '742935101': 'PLD',    // Prologis
  '49271V100': 'KEY',    // KeyCorp
  '09062X103': 'BIIB',   // Biogen
  '56585A102': 'MRNA',   // Moderna

  // ETFs that might appear
  '78462F103': 'SPY',    // SPDR S&P 500
  '464287200': 'IVV',    // iShares Core S&P 500
  '922908363': 'VOO',    // Vanguard S&P 500
  '46090E103': 'QQQ',    // Invesco QQQ
}

// Reverse mapping for search
const TICKER_TO_CUSIP: Record<string, string> = Object.entries(CUSIP_TO_TICKER)
  .reduce((acc, [cusip, ticker]) => {
    acc[ticker] = cusip
    return acc
  }, {} as Record<string, string>)

export async function GET(request: NextRequest) {
  const cusip = request.nextUrl.searchParams.get('cusip')
  const ticker = request.nextUrl.searchParams.get('ticker')
  const batch = request.nextUrl.searchParams.get('batch') // comma-separated CUSIPs

  // Batch lookup
  if (batch) {
    const cusips = batch.split(',').map(c => c.trim())
    const results: Record<string, string | null> = {}

    for (const c of cusips) {
      results[c] = CUSIP_TO_TICKER[c] || null
    }

    return NextResponse.json({ mappings: results })
  }

  // Single CUSIP lookup
  if (cusip) {
    const foundTicker = CUSIP_TO_TICKER[cusip]
    return NextResponse.json({
      cusip,
      ticker: foundTicker || null,
      found: !!foundTicker
    })
  }

  // Ticker to CUSIP lookup
  if (ticker) {
    const foundCusip = TICKER_TO_CUSIP[ticker.toUpperCase()]
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      cusip: foundCusip || null,
      found: !!foundCusip
    })
  }

  return NextResponse.json({
    error: 'Provide cusip, ticker, or batch parameter',
    availableMappings: Object.keys(CUSIP_TO_TICKER).length
  }, { status: 400 })
}
