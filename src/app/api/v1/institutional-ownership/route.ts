import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/institutional-ownership/

let supabase: SupabaseClient | null = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

// SEC User-Agent for direct SEC calls
const SEC_USER_AGENT = 'Lician contact@lician.com'

interface InstitutionalOwnership {
  ticker: string
  investor: string
  report_period: string // YYYY-MM-DD
  price: number | null
  shares: number
  market_value: number
  // Extended fields (not in Financial Datasets, but useful)
  change_in_shares?: number
  change_percent?: number
  is_new_position?: boolean
}

// Parse date filter parameters
function parseDateFilters(params: URLSearchParams) {
  return {
    report_period: params.get('report_period'),
    report_period_gte: params.get('report_period_gte'),
    report_period_lte: params.get('report_period_lte'),
    report_period_gt: params.get('report_period_gt'),
    report_period_lt: params.get('report_period_lt'),
  }
}

// Get holdings by ticker (who holds this stock)
async function getHoldersByTicker(
  ticker: string,
  limit: number,
  dateFilters: ReturnType<typeof parseDateFilters>
): Promise<InstitutionalOwnership[]> {
  let query = getSupabase()
    .from('institutional_holdings')
    .select(`
      ticker,
      investor_cik,
      report_date,
      shares,
      market_value,
      price
    `)
    .eq('ticker', ticker.toUpperCase())
    .order('market_value', { ascending: false })
    .limit(limit)

  // Apply date filters
  if (dateFilters.report_period) {
    query = query.eq('report_date', dateFilters.report_period)
  }
  if (dateFilters.report_period_gte) {
    query = query.gte('report_date', dateFilters.report_period_gte)
  }
  if (dateFilters.report_period_lte) {
    query = query.lte('report_date', dateFilters.report_period_lte)
  }
  if (dateFilters.report_period_gt) {
    query = query.gt('report_date', dateFilters.report_period_gt)
  }
  if (dateFilters.report_period_lt) {
    query = query.lt('report_date', dateFilters.report_period_lt)
  }

  const { data: holdings, error } = await query

  if (error || !holdings || holdings.length === 0) {
    // Fallback to SEC direct fetch if no data in DB
    return await fetchFromSEC(ticker, null, limit)
  }

  // Get investor names
  const ciks = [...new Set(holdings.map(h => h.investor_cik))]
  const { data: investors } = await getSupabase()
    .from('institutional_investors')
    .select('cik, normalized_name')
    .in('cik', ciks)

  const investorMap = new Map(investors?.map(i => [i.cik, i.normalized_name]) || [])

  // Get changes data
  const { data: changes } = await getSupabase()
    .from('institutional_changes')
    .select('investor_cik, ticker, change_in_shares, change_percent, is_new_position')
    .eq('ticker', ticker.toUpperCase())

  const changesMap = new Map(
    changes?.map(c => [`${c.investor_cik}-${c.ticker}`, c]) || []
  )

  return holdings.map(h => {
    const change = changesMap.get(`${h.investor_cik}-${h.ticker}`)
    return {
      ticker: h.ticker,
      investor: investorMap.get(h.investor_cik) || h.investor_cik,
      report_period: h.report_date,
      price: h.price,
      shares: h.shares,
      market_value: h.market_value,
      change_in_shares: change?.change_in_shares,
      change_percent: change?.change_percent,
      is_new_position: change?.is_new_position,
    }
  })
}

// Get holdings by investor (what does this investor hold)
async function getHoldingsByInvestor(
  investor: string,
  limit: number,
  dateFilters: ReturnType<typeof parseDateFilters>
): Promise<InstitutionalOwnership[]> {
  // First resolve investor to CIK
  const normalizedInvestor = investor.toUpperCase().replace(/ /g, '_')

  const { data: investorData } = await getSupabase()
    .from('institutional_investors')
    .select('cik, normalized_name')
    .or(`normalized_name.eq.${normalizedInvestor},cik.eq.${investor}`)
    .limit(1)
    .single()

  const cik = investorData?.cik
  const investorName = investorData?.normalized_name || normalizedInvestor

  if (!cik) {
    // Try to find by partial match or fallback to SEC
    return await fetchFromSEC(null, investor, limit)
  }

  let query = getSupabase()
    .from('institutional_holdings')
    .select(`
      ticker,
      investor_cik,
      report_date,
      shares,
      market_value,
      price
    `)
    .eq('investor_cik', cik)
    .order('market_value', { ascending: false })
    .limit(limit)

  // Apply date filters
  if (dateFilters.report_period) {
    query = query.eq('report_date', dateFilters.report_period)
  }
  if (dateFilters.report_period_gte) {
    query = query.gte('report_date', dateFilters.report_period_gte)
  }
  if (dateFilters.report_period_lte) {
    query = query.lte('report_date', dateFilters.report_period_lte)
  }
  if (dateFilters.report_period_gt) {
    query = query.gt('report_date', dateFilters.report_period_gt)
  }
  if (dateFilters.report_period_lt) {
    query = query.lt('report_date', dateFilters.report_period_lt)
  }

  const { data: holdings, error } = await query

  if (error || !holdings || holdings.length === 0) {
    return await fetchFromSEC(null, investor, limit)
  }

  // Get changes data
  const { data: changes } = await getSupabase()
    .from('institutional_changes')
    .select('investor_cik, ticker, change_in_shares, change_percent, is_new_position')
    .eq('investor_cik', cik)

  const changesMap = new Map(
    changes?.map(c => [`${c.investor_cik}-${c.ticker}`, c]) || []
  )

  return holdings.map(h => {
    const change = changesMap.get(`${h.investor_cik}-${h.ticker}`)
    return {
      ticker: h.ticker,
      investor: investorName,
      report_period: h.report_date,
      price: h.price,
      shares: h.shares,
      market_value: h.market_value,
      change_in_shares: change?.change_in_shares,
      change_percent: change?.change_percent,
      is_new_position: change?.is_new_position,
    }
  })
}

// Fallback: Fetch directly from SEC EDGAR
async function fetchFromSEC(
  ticker: string | null,
  investor: string | null,
  limit: number
): Promise<InstitutionalOwnership[]> {
  // Known institution CIKs for quick lookup
  const KNOWN_INSTITUTIONS: Record<string, string> = {
    'BERKSHIRE_HATHAWAY': '1067983',
    'BERKSHIRE_HATHAWAY_INC': '1067983',
    'VANGUARD_GROUP': '102909',
    'VANGUARD_GROUP_INC': '102909',
    'BLACKROCK': '1364742',
    'BLACKROCK_INC': '1364742',
    'STATE_STREET': '93751',
    'STATE_STREET_CORP': '93751',
    'FIDELITY': '315066',
    'FMR_LLC': '315066',
    'JPMORGAN': '19617',
    'JPMORGAN_CHASE': '19617',
    'MORGAN_STANLEY': '895421',
    'GOLDMAN_SACHS': '886982',
    'CITADEL': '1423053',
    'CITADEL_ADVISORS': '1423053',
    'BRIDGEWATER': '1350694',
    'BRIDGEWATER_ASSOCIATES': '1350694',
    'RENAISSANCE': '1037389',
    'RENAISSANCE_TECHNOLOGIES': '1037389',
  }

  // CUSIP to ticker mapping
  const CUSIP_TO_TICKER: Record<string, string> = {
    '037833100': 'AAPL', '594918104': 'MSFT', '02079K305': 'GOOGL',
    '023135106': 'AMZN', '67066G104': 'NVDA', '88160R101': 'TSLA',
    '30303M102': 'META', '084670702': 'BRK.B', '46625H100': 'JPM',
    '92826C839': 'V', '91324P102': 'UNH', '532457108': 'LLY',
    '060505104': 'BAC', '30231G102': 'XOM', '166764100': 'CVX',
    '191216100': 'KO', '025816109': 'AXP', '693718108': 'OXY',
    '585055106': 'MA', '478160104': 'JNJ', '718172109': 'PFE',
  }

  if (investor) {
    const normalizedInvestor = investor.toUpperCase().replace(/ /g, '_')
    let cik = KNOWN_INSTITUTIONS[normalizedInvestor]

    if (!cik) {
      // Try partial match
      for (const [key, value] of Object.entries(KNOWN_INSTITUTIONS)) {
        if (key.includes(normalizedInvestor.split('_')[0])) {
          cik = value
          break
        }
      }
    }

    if (!cik) {
      return []
    }

    // Fetch from SEC
    try {
      const response = await fetch(
        `https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`,
        { headers: { 'User-Agent': SEC_USER_AGENT }, next: { revalidate: 3600 } }
      )

      if (!response.ok) return []

      const data = await response.json()
      const recent = data.filings?.recent || {}

      // Find latest 13F filing
      let filingIdx = -1
      for (let i = 0; i < (recent.form?.length || 0); i++) {
        if (recent.form[i] === '13F-HR') {
          filingIdx = i
          break
        }
      }

      if (filingIdx === -1) return []

      const accessionNumber = recent.accessionNumber[filingIdx]
      const reportDate = recent.reportDate[filingIdx]

      // Fetch holdings from the filing
      const holdings = await fetchFilingHoldings(cik, accessionNumber, CUSIP_TO_TICKER)

      return holdings.slice(0, limit).map(h => ({
        ticker: h.ticker || h.cusip,
        investor: normalizedInvestor,
        report_period: reportDate,
        price: h.shares > 0 ? h.value / h.shares : null,
        shares: h.shares,
        market_value: h.value,
      }))
    } catch {
      return []
    }
  }

  // For ticker queries, would need to scan multiple investors (expensive)
  // Return empty for now - data should be pre-loaded in database
  return []
}

// Fetch holdings from SEC filing
async function fetchFilingHoldings(
  cik: string,
  accessionNumber: string,
  cusipMap: Record<string, string>
): Promise<{ cusip: string; ticker?: string; value: number; shares: number }[]> {
  const accessionNoDashes = accessionNumber.replace(/-/g, '')
  const cikNoLeadingZeros = cik.replace(/^0+/, '')
  const baseUrl = `https://www.sec.gov/Archives/edgar/data/${cikNoLeadingZeros}/${accessionNoDashes}`

  try {
    const dirResponse = await fetch(baseUrl, {
      headers: { 'User-Agent': SEC_USER_AGENT }
    })

    if (!dirResponse.ok) return []

    const dirHtml = await dirResponse.text()
    const xmlMatches = dirHtml.match(/href="[^"]*\/([^"\/]+\.xml)"/gi) || []
    const xmlFiles = xmlMatches
      .map(m => {
        const match = m.match(/\/([^"\/]+\.xml)"$/i)
        return match ? match[1] : ''
      })
      .filter(f => f && !f.includes('primary_doc') && !f.includes('index'))

    for (const xmlFile of xmlFiles) {
      const xmlUrl = `${baseUrl}/${xmlFile}`
      const xmlResponse = await fetch(xmlUrl, {
        headers: { 'User-Agent': SEC_USER_AGENT },
        next: { revalidate: 86400 }
      })

      if (xmlResponse.ok) {
        const xmlText = await xmlResponse.text()
        if (xmlText.includes('infoTable') || xmlText.includes('informationTable')) {
          return parseInfoTable(xmlText, cusipMap)
        }
      }
    }
  } catch {
    // Silent fail
  }

  return []
}

// Parse 13F XML
function parseInfoTable(
  xml: string,
  cusipMap: Record<string, string>
): { cusip: string; ticker?: string; value: number; shares: number }[] {
  const holdings: { cusip: string; ticker?: string; value: number; shares: number }[] = []

  const entryRegex = /<infoTable[^>]*>([\s\S]*?)<\/infoTable>/gi
  let match

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1]

    const getValue = (tag: string): string => {
      const regex = new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]*)<\/(?:\\w+:)?${tag}>`, 'i')
      const m = entry.match(regex)
      return m ? m[1].trim() : ''
    }

    const getNumeric = (tag: string): number => {
      const val = getValue(tag)
      return val ? parseInt(val.replace(/,/g, ''), 10) || 0 : 0
    }

    const cusip = getValue('cusip')
    const holding = {
      cusip,
      ticker: cusipMap[cusip],
      value: getNumeric('value'),
      shares: getNumeric('sshPrnamt'),
    }

    if (holding.value > 0) {
      holdings.push(holding)
    }
  }

  return holdings.sort((a, b) => b.value - a.value)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const investor = searchParams.get('investor')
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 500)
  const dateFilters = parseDateFilters(searchParams)

  // Validate: must have either ticker or investor, not both
  if (!ticker && !investor) {
    return NextResponse.json({
      error: 'Either ticker or investor parameter is required',
      documentation: 'https://docs.financialdatasets.ai/api-reference/endpoint/institutional-ownership'
    }, { status: 400 })
  }

  if (ticker && investor) {
    return NextResponse.json({
      error: 'Cannot specify both ticker and investor parameters'
    }, { status: 400 })
  }

  try {
    let holdings: InstitutionalOwnership[]

    if (ticker) {
      holdings = await getHoldersByTicker(ticker, limit, dateFilters)
    } else {
      holdings = await getHoldingsByInvestor(investor!, limit, dateFilters)
    }

    // Return in Financial Datasets format
    return NextResponse.json({
      'institutional-ownership': holdings.map(h => ({
        ticker: h.ticker,
        investor: h.investor,
        report_period: h.report_period,
        price: h.price,
        shares: h.shares,
        market_value: h.market_value,
        // Include extended fields if available
        ...(h.change_in_shares !== undefined && { change_in_shares: h.change_in_shares }),
        ...(h.change_percent !== undefined && { change_percent: h.change_percent }),
        ...(h.is_new_position !== undefined && { is_new_position: h.is_new_position }),
      }))
    })
  } catch (error) {
    console.error('Institutional ownership API error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
