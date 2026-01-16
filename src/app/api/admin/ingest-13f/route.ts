import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// SEC 13F Data Ingestion API
// Fetches and stores institutional ownership data from SEC EDGAR

// Admin password - MUST be set in environment variables (no fallback for security)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const SEC_USER_AGENT = 'Lician contact@lician.com'

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

// CUSIP to ticker mapping (expanded)
const CUSIP_TO_TICKER: Record<string, string> = {
  // Mega caps
  '037833100': 'AAPL', '594918104': 'MSFT', '02079K305': 'GOOGL', '02079K107': 'GOOG',
  '023135106': 'AMZN', '67066G104': 'NVDA', '88160R101': 'TSLA', '30303M102': 'META',
  '084670702': 'BRK.B', '084670108': 'BRK.A',
  // Financials
  '060505104': 'BAC', '46625H100': 'JPM', '172967424': 'C', '949746101': 'WFC',
  '38141G104': 'GS', '617446448': 'MS', '025816109': 'AXP', '92826C839': 'V', '585055106': 'MA',
  '075887109': 'BLK', '14913Q104': 'SCHW', '06738C101': 'BX',
  // Healthcare
  '478160104': 'JNJ', '91324P102': 'UNH', '718172109': 'PFE', '58933Y105': 'MRK',
  '002824100': 'ABBV', '532457108': 'LLY', '883556102': 'TMO', '002824105': 'ABT',
  // Consumer
  '191216100': 'KO', '713448108': 'PEP', '742718109': 'PG', '931142103': 'WMT',
  '437076102': 'HD', '580135101': 'MCD', '654106103': 'NKE', '853061100': 'SBUX', '22160K105': 'COST',
  // Industrial
  '097023105': 'BA', '149123101': 'CAT', '369550108': 'GE', '443556101': 'HON',
  '912909108': 'UNP', '902973304': 'UPS', '345370860': 'F', '370334104': 'GM',
  // Energy
  '30231G102': 'XOM', '166764100': 'CVX', '20825C104': 'COP', '693718108': 'OXY',
  // Tech
  '00724F101': 'ADBE', '79466L302': 'CRM', '458140100': 'INTC', '17275R102': 'CSCO',
  '254687106': 'DIS', '64110L106': 'NFLX', '747525103': 'QCOM', '09061G101': 'AVGO',
  '882508104': 'TXN', '59517P701': 'MU', '68902V107': 'ORCL', '032654105': 'AMD',
  // Semis
  '88160G103': 'TSM', '00971T101': 'AMAT', '48203R104': 'KLAC', '53578A108': 'LRCX',
  // Other
  '70450Y103': 'PYPL', '90384S303': 'UBER', '00287Y109': 'ABNB', '79468M107': 'SNOW',
  '26441C204': 'DDOG', '22266T109': 'CRWD', '549498100': 'NOW',
}

// Known investor CIKs
const KNOWN_INVESTORS = [
  { cik: '102909', name: 'VANGUARD GROUP INC', type: 'Index Fund' },
  { cik: '1364742', name: 'BLACKROCK INC', type: 'Index Fund' },
  { cik: '93751', name: 'STATE STREET CORP', type: 'Index Fund' },
  { cik: '315066', name: 'FMR LLC', type: 'Asset Manager' },
  { cik: '1067983', name: 'BERKSHIRE HATHAWAY INC', type: 'Conglomerate' },
  { cik: '19617', name: 'JPMORGAN CHASE & CO', type: 'Bank' },
  { cik: '895421', name: 'MORGAN STANLEY', type: 'Bank' },
  { cik: '886982', name: 'GOLDMAN SACHS GROUP INC', type: 'Bank' },
  { cik: '1423053', name: 'CITADEL ADVISORS LLC', type: 'Hedge Fund' },
  { cik: '1350694', name: 'BRIDGEWATER ASSOCIATES LP', type: 'Hedge Fund' },
  { cik: '1037389', name: 'RENAISSANCE TECHNOLOGIES LLC', type: 'Hedge Fund' },
  { cik: '1179392', name: 'TWO SIGMA INVESTMENTS LP', type: 'Hedge Fund' },
  { cik: '1582202', name: 'NORGES BANK', type: 'Sovereign Wealth' },
  { cik: '909012', name: 'T ROWE PRICE ASSOCIATES INC', type: 'Asset Manager' },
  { cik: '1166559', name: 'GEODE CAPITAL MANAGEMENT LLC', type: 'Index Fund' },
]

interface Filing {
  accessionNumber: string
  filingDate: string
  reportDate: string
  form: string
}

interface Holding {
  issuer: string
  class: string
  cusip: string
  ticker?: string
  value: number
  shares: number
  shareType: string
  investmentDiscretion: string
  votingSole: number
  votingShared: number
  votingNone: number
  putCall?: string
}

// Get filing list for an investor
async function getInvestorFilings(cik: string): Promise<{ name: string; filings: Filing[] } | null> {
  const paddedCik = cik.padStart(10, '0')

  try {
    const response = await fetch(
      `https://data.sec.gov/submissions/CIK${paddedCik}.json`,
      {
        headers: { 'User-Agent': SEC_USER_AGENT },
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    const filings: Filing[] = []
    const recent = data.filings?.recent || {}

    if (recent.form) {
      for (let i = 0; i < recent.form.length && filings.length < 8; i++) {
        if (recent.form[i] === '13F-HR' || recent.form[i] === '13F-HR/A') {
          filings.push({
            accessionNumber: recent.accessionNumber[i],
            filingDate: recent.filingDate[i],
            reportDate: recent.reportDate[i],
            form: recent.form[i]
          })
        }
      }
    }

    return { name: data.name, filings }
  } catch (error) {
    logger.error('Error fetching filings', { cik, error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// Fetch holdings from a filing
async function getFilingHoldings(cik: string, accessionNumber: string): Promise<Holding[]> {
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
          return parseInfoTable(xmlText)
        }
      }
    }
  } catch (error) {
    logger.error('Error fetching holdings', { accessionNumber, error: error instanceof Error ? error.message : 'Unknown' })
  }

  return []
}

// Parse 13F XML
function parseInfoTable(xml: string): Holding[] {
  const holdings: Holding[] = []
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
    const holding: Holding = {
      issuer: getValue('nameOfIssuer'),
      class: getValue('titleOfClass'),
      cusip,
      ticker: CUSIP_TO_TICKER[cusip],
      value: getNumeric('value'),
      shares: getNumeric('sshPrnamt'),
      shareType: getValue('sshPrnamtType') || 'SH',
      investmentDiscretion: getValue('investmentDiscretion'),
      votingSole: getNumeric('Sole'),
      votingShared: getNumeric('Shared'),
      votingNone: getNumeric('None'),
      putCall: getValue('putCall') || undefined
    }

    if (holding.issuer && holding.value > 0) {
      holdings.push(holding)
    }
  }

  return holdings
}

// Standardize investor name
function normalizeInvestorName(name: string): string {
  return name
    .toUpperCase()
    .replace(/[.,]/g, '')
    .replace(/&/g, 'AND')
    .replace(/\s+/g, '_')
    .replace(/THE_/, '')
    .replace(/_INCORPORATED$/, '_INC')
    .replace(/_CORPORATION$/, '_CORP')
    .replace(/_LIMITED_LIABILITY_COMPANY$/, '_LLC')
    .replace(/_LIMITED_PARTNERSHIP$/, '_LP')
}

// Main ingestion function
async function ingestInvestor(
  cik: string,
  name: string,
  investorType: string
): Promise<{ success: boolean; holdings: number; error?: string }> {
  const normalizedName = normalizeInvestorName(name)

  // Upsert investor
  const { error: investorError } = await getSupabase()
    .from('institutional_investors')
    .upsert({
      cik,
      name,
      normalized_name: normalizedName,
      investor_type: investorType,
      updated_at: new Date().toISOString()
    }, { onConflict: 'cik' })

  if (investorError) {
    return { success: false, holdings: 0, error: `Investor upsert failed: ${investorError.message}` }
  }

  // Get filings
  const filingData = await getInvestorFilings(cik)
  if (!filingData || filingData.filings.length === 0) {
    return { success: false, holdings: 0, error: 'No 13F filings found' }
  }

  let totalHoldings = 0

  // Process each filing (up to 4 most recent quarters)
  for (const filing of filingData.filings.slice(0, 4)) {
    // Check if already processed
    const { data: existingFiling } = await getSupabase()
      .from('institutional_filings')
      .select('id, processed')
      .eq('accession_number', filing.accessionNumber)
      .single()

    if (existingFiling?.processed) {
      continue
    }

    // Insert or update filing record
    const { data: filingRecord, error: filingError } = await getSupabase()
      .from('institutional_filings')
      .upsert({
        investor_cik: cik,
        accession_number: filing.accessionNumber,
        filing_date: filing.filingDate,
        report_date: filing.reportDate,
        form_type: filing.form,
        is_amendment: filing.form.includes('/A'),
        processed: false
      }, { onConflict: 'accession_number' })
      .select('id')
      .single()

    if (filingError || !filingRecord) {
      logger.error('Filing insert error', { accessionNumber: filing.accessionNumber, error: filingError?.message })
      continue
    }

    // Fetch holdings
    const holdings = await getFilingHoldings(cik, filing.accessionNumber)

    if (holdings.length === 0) {
      await getSupabase()
        .from('institutional_filings')
        .update({ error_message: 'No holdings found in filing' })
        .eq('id', filingRecord.id)
      continue
    }

    // Insert holdings
    const holdingsToInsert = holdings.map(h => ({
      filing_id: filingRecord.id,
      investor_cik: cik,
      cusip: h.cusip,
      ticker: h.ticker || null,
      issuer_name: h.issuer,
      title_of_class: h.class,
      report_date: filing.reportDate,
      shares: h.shares,
      market_value: h.value,
      share_type: h.shareType,
      price: h.shares > 0 ? h.value / h.shares : null,
      investment_discretion: h.investmentDiscretion || null,
      voting_sole: h.votingSole,
      voting_shared: h.votingShared,
      voting_none: h.votingNone,
      put_call: h.putCall || null
    }))

    const { error: holdingsError } = await getSupabase()
      .from('institutional_holdings')
      .insert(holdingsToInsert)

    if (holdingsError) {
      logger.error('Holdings insert error', { filingId: filingRecord.id, error: holdingsError.message })
      await getSupabase()
        .from('institutional_filings')
        .update({ error_message: holdingsError.message })
        .eq('id', filingRecord.id)
      continue
    }

    // Mark filing as processed
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
    await getSupabase()
      .from('institutional_filings')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        total_value: totalValue,
        total_positions: holdings.length
      })
      .eq('id', filingRecord.id)

    totalHoldings += holdings.length

    // Update CUSIP mappings for any new CUSIPs
    const newCusips = holdings
      .filter(h => h.ticker)
      .map(h => ({
        cusip: h.cusip,
        ticker: h.ticker,
        issuer_name: h.issuer,
        source: 'SEC',
        verified: true
      }))

    if (newCusips.length > 0) {
      await getSupabase()
        .from('cusip_mappings')
        .upsert(newCusips, { onConflict: 'cusip', ignoreDuplicates: true })
    }
  }

  // Update investor stats
  const { data: latestHoldings } = await getSupabase()
    .from('institutional_holdings')
    .select('market_value')
    .eq('investor_cik', cik)
    .order('report_date', { ascending: false })
    .limit(1000)

  if (latestHoldings) {
    const latestAum = latestHoldings.reduce((sum, h) => sum + (h.market_value || 0), 0)
    await getSupabase()
      .from('institutional_investors')
      .update({
        latest_aum: latestAum,
        latest_positions: latestHoldings.length,
        updated_at: new Date().toISOString()
      })
      .eq('cik', cik)
  }

  return { success: true, holdings: totalHoldings }
}

// Calculate position changes for an investor
async function calculateChanges(cik: string): Promise<number> {
  // Get all holdings ordered by date
  const { data: holdings } = await getSupabase()
    .from('institutional_holdings')
    .select('ticker, cusip, shares, market_value, report_date')
    .eq('investor_cik', cik)
    .not('ticker', 'is', null)
    .order('report_date', { ascending: false })

  if (!holdings || holdings.length === 0) return 0

  // Group by ticker
  const holdingsByTicker = new Map<string, typeof holdings>()
  for (const h of holdings) {
    const existing = holdingsByTicker.get(h.ticker!) || []
    existing.push(h)
    holdingsByTicker.set(h.ticker!, existing)
  }

  const changes: any[] = []

  for (const [ticker, tickerHoldings] of holdingsByTicker) {
    // Sort by date descending
    tickerHoldings.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime())

    for (let i = 0; i < tickerHoldings.length; i++) {
      const current = tickerHoldings[i]
      const prior = tickerHoldings[i + 1]

      const changeInShares = prior ? current.shares - prior.shares : current.shares
      const changePercent = prior && prior.shares > 0
        ? ((current.shares - prior.shares) / prior.shares) * 100
        : null

      changes.push({
        investor_cik: cik,
        ticker,
        cusip: current.cusip,
        report_date: current.report_date,
        shares: current.shares,
        market_value: current.market_value,
        prior_report_date: prior?.report_date || null,
        prior_shares: prior?.shares || null,
        prior_market_value: prior?.market_value || null,
        change_in_shares: changeInShares,
        change_percent: changePercent ? Math.round(changePercent * 100) / 100 : null,
        change_in_value: prior ? current.market_value - prior.market_value : current.market_value,
        is_new_position: !prior,
        is_exit: false,
        is_increased: prior ? current.shares > prior.shares : false,
        is_decreased: prior ? current.shares < prior.shares : false
      })
    }
  }

  // Upsert changes
  if (changes.length > 0) {
    const { error } = await getSupabase()
      .from('institutional_changes')
      .upsert(changes, { onConflict: 'investor_cik,ticker,report_date' })

    if (error) {
      logger.error('Changes upsert error', { cik, error: error.message })
    }
  }

  return changes.length
}

export async function POST(request: NextRequest) {
  // Auth check - ADMIN_PASSWORD must be configured
  if (!ADMIN_PASSWORD) {
    logger.error('ADMIN_PASSWORD environment variable is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, cik, investors } = body

  // Create sync log entry
  const { data: syncLog } = await getSupabase()
    .from('institutional_sync_log')
    .insert({
      sync_type: action || 'MANUAL',
      parameters: body
    })
    .select('id')
    .single()

  const results: { investor: string; success: boolean; holdings: number; changes?: number; error?: string }[] = []

  if (action === 'ingest-all' || action === 'ingest-known') {
    // Ingest all known investors
    for (const inv of KNOWN_INVESTORS) {
      const result = await ingestInvestor(inv.cik, inv.name, inv.type)
      let changesCount = 0
      if (result.success) {
        changesCount = await calculateChanges(inv.cik)
      }
      results.push({
        investor: inv.name,
        ...result,
        changes: changesCount
      })

      // Small delay to be nice to SEC servers
      await new Promise(r => setTimeout(r, 500))
    }
  } else if (action === 'ingest-one' && cik) {
    // Ingest single investor
    const investor = KNOWN_INVESTORS.find(i => i.cik === cik) || { cik, name: `CIK ${cik}`, type: 'Unknown' }
    const result = await ingestInvestor(investor.cik, investor.name, investor.type)
    let changesCount = 0
    if (result.success) {
      changesCount = await calculateChanges(investor.cik)
    }
    results.push({
      investor: investor.name,
      ...result,
      changes: changesCount
    })
  } else if (action === 'calculate-changes') {
    // Just calculate changes for all investors
    const { data: allInvestors } = await getSupabase()
      .from('institutional_investors')
      .select('cik, name')

    for (const inv of allInvestors || []) {
      const changesCount = await calculateChanges(inv.cik)
      results.push({
        investor: inv.name,
        success: true,
        holdings: 0,
        changes: changesCount
      })
    }
  } else {
    return NextResponse.json({ error: 'Invalid action. Use: ingest-all, ingest-one, calculate-changes' }, { status: 400 })
  }

  // Update sync log
  const totalHoldings = results.reduce((sum, r) => sum + r.holdings, 0)
  const totalChanges = results.reduce((sum, r) => sum + (r.changes || 0), 0)
  const errorCount = results.filter(r => !r.success).length

  if (syncLog) {
    await getSupabase()
      .from('institutional_sync_log')
      .update({
        completed_at: new Date().toISOString(),
        status: errorCount > 0 ? 'PARTIAL' : 'COMPLETED',
        investors_processed: results.length,
        holdings_processed: totalHoldings,
        changes_calculated: totalChanges,
        error_count: errorCount
      })
      .eq('id', syncLog.id)
  }

  return NextResponse.json({
    success: true,
    summary: {
      investors_processed: results.length,
      holdings_ingested: totalHoldings,
      changes_calculated: totalChanges,
      errors: errorCount
    },
    results
  })
}

export async function GET(request: NextRequest) {
  // Auth check - ADMIN_PASSWORD must be configured
  if (!ADMIN_PASSWORD) {
    logger.error('ADMIN_PASSWORD environment variable is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return current ingestion status
  const { data: investors } = await getSupabase()
    .from('institutional_investors')
    .select('cik, name, investor_type, latest_aum, latest_positions, updated_at')
    .order('latest_aum', { ascending: false })

  const { data: recentSyncs } = await getSupabase()
    .from('institutional_sync_log')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10)

  const { count: holdingsCount } = await getSupabase()
    .from('institutional_holdings')
    .select('*', { count: 'exact', head: true })

  const { count: changesCount } = await getSupabase()
    .from('institutional_changes')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    investors,
    stats: {
      total_investors: investors?.length || 0,
      total_holdings: holdingsCount || 0,
      total_changes: changesCount || 0
    },
    recent_syncs: recentSyncs,
    available_actions: [
      { action: 'ingest-all', description: 'Ingest all known institutional investors' },
      { action: 'ingest-one', description: 'Ingest single investor by CIK', params: ['cik'] },
      { action: 'calculate-changes', description: 'Calculate QoQ changes for all investors' }
    ]
  })
}
