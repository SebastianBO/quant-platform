// SEC EDGAR API Client
// Direct access to SEC data - no authentication required

import {
  SECCompanySubmissions,
  SECCompanyFacts,
  Form13FHolding,
  Form13FFiling,
  Form4Filing,
  Form4Transaction,
} from './types'

const SEC_BASE_URL = 'https://data.sec.gov'
const SEC_ARCHIVES_URL = 'https://www.sec.gov/Archives/edgar/data'

// Required by SEC - must identify your application
const SEC_USER_AGENT = 'Lician contact@lician.com'

// Rate limiting: SEC allows 10 requests/second
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 100 // 100ms = 10 req/sec

async function rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }

  lastRequestTime = Date.now()

  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': SEC_USER_AGENT,
      Accept: 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`SEC API error: ${response.status} ${response.statusText}`)
  }

  return response
}

// ============================================================================
// Company Submissions API
// ============================================================================

/**
 * Get company filing history and metadata
 * @param cik Company CIK (with or without leading zeros)
 */
export async function getCompanySubmissions(cik: string): Promise<SECCompanySubmissions> {
  const paddedCik = cik.padStart(10, '0')
  const url = `${SEC_BASE_URL}/submissions/CIK${paddedCik}.json`

  const response = await rateLimitedFetch(url)
  return response.json()
}

/**
 * Get list of companies with a specific form type filed recently
 */
export async function getRecentFilings(formType: string): Promise<{ cik: string; filingDate: string }[]> {
  // Use SEC's daily index
  const today = new Date()
  const year = today.getFullYear()
  const quarter = Math.ceil((today.getMonth() + 1) / 3)

  const url = `${SEC_BASE_URL}/Archives/edgar/full-index/${year}/QTR${quarter}/company.idx`

  const response = await rateLimitedFetch(url, {
    headers: { Accept: 'text/plain' },
  })

  const text = await response.text()
  const lines = text.split('\n').slice(10) // Skip header

  return lines
    .filter(line => line.includes(formType))
    .map(line => {
      const parts = line.split(/\s{2,}/)
      return {
        cik: parts[0]?.trim() || '',
        filingDate: parts[3]?.trim() || '',
      }
    })
    .filter(item => item.cik)
}

// ============================================================================
// Company Facts API (XBRL Data)
// ============================================================================

/**
 * Get all XBRL facts for a company
 * This is the main source for financial statement data
 */
export async function getCompanyFacts(cik: string): Promise<SECCompanyFacts> {
  const paddedCik = cik.padStart(10, '0')
  const url = `${SEC_BASE_URL}/api/xbrl/companyfacts/CIK${paddedCik}.json`

  const response = await rateLimitedFetch(url)
  return response.json()
}

/**
 * Get a specific XBRL concept across all companies for a period
 * Example: us-gaap/Revenue/USD/CY2023Q4
 */
export async function getXBRLFrame(
  taxonomy: string,
  concept: string,
  unit: string,
  period: string
): Promise<{ data: Array<{ cik: number; entityName: string; val: number }> }> {
  const url = `${SEC_BASE_URL}/api/xbrl/frames/${taxonomy}/${concept}/${unit}/${period}.json`

  const response = await rateLimitedFetch(url)
  return response.json()
}

// ============================================================================
// 13F Parser (Institutional Holdings)
// ============================================================================

/**
 * Parse 13F XML filing to extract holdings
 */
export async function parse13FFiling(
  cik: string,
  accessionNumber: string
): Promise<Form13FFiling | null> {
  const cikNoZeros = cik.replace(/^0+/, '')
  const accessionNoHyphens = accessionNumber.replace(/-/g, '')
  const baseUrl = `${SEC_ARCHIVES_URL}/${cikNoZeros}/${accessionNoHyphens}`

  try {
    // First, get the filing index to find the XML file
    const indexResponse = await rateLimitedFetch(`${baseUrl}/index.json`)
    const indexData = await indexResponse.json()

    // Find the information table XML file
    const xmlFile = indexData.directory?.item?.find(
      (item: { name: string }) =>
        item.name.toLowerCase().includes('infotable') ||
        item.name.toLowerCase().includes('primary_doc')
    )

    if (!xmlFile) {
      // Try to find any XML file
      const anyXml = indexData.directory?.item?.find((item: { name: string }) =>
        item.name.toLowerCase().endsWith('.xml')
      )
      if (!anyXml) return null
    }

    // Fetch and parse the XML
    const xmlUrl = `${baseUrl}/${xmlFile?.name || 'primary_doc.xml'}`
    const xmlResponse = await rateLimitedFetch(xmlUrl, {
      headers: { Accept: 'application/xml, text/xml' },
    })
    const xmlText = await xmlResponse.text()

    return parseInfoTableXML(xmlText, cik, accessionNumber)
  } catch (error) {
    console.error(`Error parsing 13F filing ${accessionNumber}:`, error)
    return null
  }
}

function parseInfoTableXML(xml: string, investorCik: string, accessionNumber: string): Form13FFiling {
  const holdings: Form13FHolding[] = []

  // Parse each infoTable entry
  const entryRegex = /<infoTable[^>]*>([\s\S]*?)<\/infoTable>/gi
  let match

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1]

    const getValue = (tag: string): string => {
      const regex = new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]*)<\\/(?:\\w+:)?${tag}>`, 'i')
      const m = entry.match(regex)
      return m ? m[1].trim() : ''
    }

    const getNumeric = (tag: string): number => {
      const val = getValue(tag)
      return val ? parseInt(val.replace(/,/g, ''), 10) || 0 : 0
    }

    const holding: Form13FHolding = {
      cusip: getValue('cusip'),
      issuerName: getValue('nameOfIssuer'),
      titleOfClass: getValue('titleOfClass'),
      value: getNumeric('value') * 1000, // SEC reports in thousands
      shares: getNumeric('sshPrnamt'),
      shareType: getValue('sshPrnamtType') as 'SH' | 'PRN',
      investmentDiscretion: getValue('investmentDiscretion') as 'SOLE' | 'SHARED' | 'DFND',
      votingSole: getNumeric('Sole'),
      votingShared: getNumeric('Shared'),
      votingNone: getNumeric('None'),
      putCall: getValue('putCall') as 'PUT' | 'CALL' | undefined,
    }

    if (holding.value > 0) {
      holdings.push(holding)
    }
  }

  // Extract report date from header
  const reportDateMatch = xml.match(/<reportCalendarOrQuarter>([^<]+)<\/reportCalendarOrQuarter>/i)
  const filingDateMatch = xml.match(/<signatureDate>([^<]+)<\/signatureDate>/i)

  return {
    accessionNumber,
    filingDate: filingDateMatch?.[1] || '',
    reportDate: reportDateMatch?.[1] || '',
    investorCik,
    investorName: '', // Need to get from submissions
    holdings,
    totalValue: holdings.reduce((sum, h) => sum + h.value, 0),
    totalPositions: holdings.length,
  }
}

// ============================================================================
// Form 4 Parser (Insider Trading)
// ============================================================================

/**
 * Parse Form 4 XML filing to extract insider trades
 */
export async function parseForm4Filing(
  cik: string,
  accessionNumber: string
): Promise<Form4Filing | null> {
  const cikNoZeros = cik.replace(/^0+/, '')
  const accessionNoHyphens = accessionNumber.replace(/-/g, '')
  const baseUrl = `${SEC_ARCHIVES_URL}/${cikNoZeros}/${accessionNoHyphens}`

  try {
    // Get the primary document XML
    const indexResponse = await rateLimitedFetch(`${baseUrl}/index.json`)
    const indexData = await indexResponse.json()

    const xmlFile = indexData.directory?.item?.find((item: { name: string }) =>
      item.name.toLowerCase().endsWith('.xml')
    )

    if (!xmlFile) return null

    const xmlUrl = `${baseUrl}/${xmlFile.name}`
    const xmlResponse = await rateLimitedFetch(xmlUrl, {
      headers: { Accept: 'application/xml, text/xml' },
    })
    const xmlText = await xmlResponse.text()

    return parseForm4XML(xmlText, accessionNumber)
  } catch (error) {
    console.error(`Error parsing Form 4 filing ${accessionNumber}:`, error)
    return null
  }
}

function parseForm4XML(xml: string, accessionNumber: string): Form4Filing {
  // SEC Form 4 XML has nested <value> tags, e.g. <securityTitle><value>Common Stock</value></securityTitle>
  // This helper extracts either the direct value or the nested <value> content
  const getValue = (tag: string, context: string = xml): string => {
    // First try to match nested <value> pattern
    const nestedRegex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<value>([^<]*)</value>[\\s\\S]*?</${tag}>`, 'i')
    const nestedMatch = context.match(nestedRegex)
    if (nestedMatch) {
      return nestedMatch[1].trim()
    }
    // Fallback to direct value
    const directRegex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i')
    const directMatch = context.match(directRegex)
    return directMatch ? directMatch[1].trim() : ''
  }

  const getBoolean = (tag: string): boolean => {
    const val = getValue(tag)
    return val === '1' || val.toLowerCase() === 'true'
  }

  const transactions: Form4Transaction[] = []

  // Parse non-derivative transactions
  const nonDerivRegex =
    /<nonDerivativeTransaction>([\s\S]*?)<\/nonDerivativeTransaction>/gi
  let match

  while ((match = nonDerivRegex.exec(xml)) !== null) {
    const trans = match[1]

    const getTransValue = (tag: string): string => {
      return getValue(tag, trans)
    }

    const getTransNumeric = (tag: string): number | undefined => {
      const val = getTransValue(tag)
      return val ? parseFloat(val.replace(/,/g, '')) : undefined
    }

    transactions.push({
      securityTitle: getTransValue('securityTitle'),
      transactionDate: getTransValue('transactionDate'),
      transactionCode: getTransValue('transactionCode'),
      transactionShares: getTransNumeric('transactionShares'),
      transactionPricePerShare: getTransNumeric('transactionPricePerShare'),
      sharesOwnedAfterTransaction: getTransNumeric('sharesOwnedFollowingTransaction') || 0,
      acquiredDisposed: getTransValue('transactionAcquiredDisposedCode') as 'A' | 'D',
      directOrIndirect: getTransValue('directOrIndirectOwnership') as 'D' | 'I',
      indirectOwnershipExplanation: getTransValue('natureOfOwnership'),
    })
  }

  // Parse derivative transactions (options, etc.)
  const derivRegex =
    /<derivativeTransaction>([\s\S]*?)<\/derivativeTransaction>/gi

  while ((match = derivRegex.exec(xml)) !== null) {
    const trans = match[1]

    const getTransValue = (tag: string): string => {
      return getValue(tag, trans)
    }

    const getTransNumeric = (tag: string): number | undefined => {
      const val = getTransValue(tag)
      return val ? parseFloat(val.replace(/,/g, '')) : undefined
    }

    transactions.push({
      securityTitle: getTransValue('securityTitle'),
      transactionDate: getTransValue('transactionDate'),
      transactionCode: getTransValue('transactionCode'),
      transactionShares: getTransNumeric('transactionShares'),
      transactionPricePerShare: getTransNumeric('conversionOrExercisePrice'),
      sharesOwnedAfterTransaction: getTransNumeric('sharesOwnedFollowingTransaction') || 0,
      acquiredDisposed: getTransValue('transactionAcquiredDisposedCode') as 'A' | 'D',
      directOrIndirect: getTransValue('directOrIndirectOwnership') as 'D' | 'I',
    })
  }

  // Get filing date from periodOfReport or reportDate
  const filingDate = getValue('periodOfReport') || getValue('reportDate') || ''

  return {
    accessionNumber,
    filingDate,
    issuerCik: getValue('issuerCik'),
    issuerName: getValue('issuerName'),
    issuerTicker: getValue('issuerTradingSymbol'),
    ownerCik: getValue('rptOwnerCik'),
    ownerName: getValue('rptOwnerName'),
    isDirector: getBoolean('isDirector'),
    isOfficer: getBoolean('isOfficer'),
    isTenPercentOwner: getBoolean('isTenPercentOwner'),
    isOther: getBoolean('isOther'),
    officerTitle: getValue('officerTitle'),
    transactions,
  }
}

// ============================================================================
// Bulk Data Downloads
// ============================================================================

/**
 * Download the companyfacts.zip bulk file
 * This contains all XBRL data and is updated nightly ~3AM ET
 */
export async function downloadCompanyFactsBulk(): Promise<ArrayBuffer> {
  const url = 'https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip'

  const response = await fetch(url, {
    headers: { 'User-Agent': SEC_USER_AGENT },
  })

  if (!response.ok) {
    throw new Error(`Failed to download companyfacts.zip: ${response.status}`)
  }

  return response.arrayBuffer()
}

/**
 * Get list of CIKs with recent 13F filings
 */
export async function getRecent13FFilers(daysBack: number = 7): Promise<string[]> {
  const submissions = await getCompanySubmissions('0000102909') // Vanguard as test

  // In production, you'd scan the daily index files
  // For now, return known large filers
  return [
    '102909', // Vanguard
    '1364742', // BlackRock
    '93751', // State Street
    '315066', // FMR (Fidelity)
    '1067983', // Berkshire Hathaway
    '19617', // JPMorgan
    '1423053', // Citadel
    '1350694', // Bridgewater
    '1037389', // Renaissance
  ]
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert CIK to padded format
 */
export function padCik(cik: string | number): string {
  return String(cik).padStart(10, '0')
}

/**
 * Get SEC filing URL
 */
export function getFilingUrl(cik: string, accessionNumber: string): string {
  const cikNoZeros = cik.replace(/^0+/, '')
  const accessionNoHyphens = accessionNumber.replace(/-/g, '')
  return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cikNoZeros}&type=&dateb=&owner=include&count=40&search_text=`
}

/**
 * Parse fiscal period from XBRL
 */
export function parseFiscalPeriod(fp: string | undefined): string {
  if (!fp) return ''
  switch (fp) {
    case 'FY':
      return 'FY'
    case 'Q1':
    case 'Q2':
    case 'Q3':
    case 'Q4':
      return fp
    default:
      return fp
  }
}
