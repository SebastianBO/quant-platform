import { NextRequest, NextResponse } from 'next/server'

// SEC EDGAR requires a proper User-Agent header
const SEC_USER_AGENT = 'Lician contact@lician.com'

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
  ticker?: string // Resolved from CUSIP
  value: number // in dollars (SEC reports in $1000s)
  shares: number
  shareType: string // 'SH' for shares, 'PRN' for principal
  investmentDiscretion: string
  votingSole: number
  votingShared: number
  votingNone: number
  putCall?: string
}

// Common CUSIP to ticker mappings (top stocks)
const CUSIP_TO_TICKER: Record<string, string> = {
  // Mega caps
  '037833100': 'AAPL', '594918104': 'MSFT', '02079K305': 'GOOGL', '02079K107': 'GOOG',
  '023135106': 'AMZN', '67066G104': 'NVDA', '88160R101': 'TSLA', '30303M102': 'META',
  '084670702': 'BRK.B', '084670108': 'BRK.A',
  // Financials
  '060505104': 'BAC', '46625H100': 'JPM', '172967424': 'C', '949746101': 'WFC',
  '38141G104': 'GS', '617446448': 'MS', '025816109': 'AXP', '92826C839': 'V', '585055106': 'MA',
  // Healthcare
  '478160104': 'JNJ', '91324P102': 'UNH', '718172109': 'PFE', '58933Y105': 'MRK',
  '002824100': 'ABBV', '532457108': 'LLY',
  // Consumer
  '191216100': 'KO', '713448108': 'PEP', '742718109': 'PG', '931142103': 'WMT',
  '437076102': 'HD', '580135101': 'MCD', '654106103': 'NKE', '853061100': 'SBUX', '22160K105': 'COST',
  // Industrial
  '097023105': 'BA', '149123101': 'CAT', '369550108': 'GE', '443556101': 'HON',
  '912909108': 'UNP', '902973304': 'UPS', '345370860': 'F', '370334104': 'GM',
  // Energy
  '30231G102': 'XOM', '166764100': 'CVX', '20825C104': 'COP',
  // Tech
  '00724F101': 'ADBE', '79466L302': 'CRM', '458140100': 'INTC', '17275R102': 'CSCO',
  '254687106': 'DIS', '64110L106': 'NFLX', '747525103': 'QCOM', '09061G101': 'AVGO',
  '882508104': 'TXN', '59517P701': 'MU',
  // Other
  '02005N100': 'ALLY', '693718108': 'OXY', '126650100': 'CVS', '70450Y103': 'PYPL',
  '90384S303': 'UBER', '56585A102': 'MRNA', '742935101': 'PLD', '03027X100': 'AMT',
  // Additional common holdings
  'H1467J104': 'CB',   // Chubb Limited
  '500754106': 'KHC',  // Kraft Heinz
  '74460D109': 'PSX',  // Phillips 66
  '576323109': 'MDLZ', // Mondelez
  '45866F104': 'ICE',  // Intercontinental Exchange
  '92343E102': 'VRSN', // Verisign
  '031162100': 'AMGN', // Amgen
  '053332102': 'ATVI', // Activision (now MSFT)
  '98978V103': 'ZTS',  // Zoetis
  '88579Y101': 'MMM',  // 3M
  '24478K103': 'DE',   // Deere
  '826809100': 'SHW',  // Sherwin-Williams
  '571900102': 'MAR',  // Marriott
  '74834L100': 'QGEN', // Qiagen
  '46284V101': 'ISRG', // Intuitive Surgical
}

interface InstitutionInfo {
  cik: string
  name: string
  filings: Filing[]
}

// Get institution info and filing list from SEC
async function getInstitutionFilings(cik: string): Promise<InstitutionInfo | null> {
  // Pad CIK to 10 digits
  const paddedCik = cik.padStart(10, '0')

  try {
    const response = await fetch(
      `https://data.sec.gov/submissions/CIK${paddedCik}.json`,
      {
        headers: {
          'User-Agent': SEC_USER_AGENT,
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      console.error(`SEC API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    // Filter for 13F-HR filings
    const filings: Filing[] = []
    const recent = data.filings?.recent || {}

    if (recent.form) {
      for (let i = 0; i < recent.form.length; i++) {
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

    return {
      cik: data.cik,
      name: data.name,
      filings: filings.slice(0, 8) // Last 8 quarters (2 years)
    }
  } catch (error) {
    console.error('Error fetching SEC data:', error)
    return null
  }
}

// Parse 13F XML to extract holdings
async function getFilingHoldings(cik: string, accessionNumber: string): Promise<Holding[]> {
  // Remove dashes from accession number for URL
  const accessionNoDashes = accessionNumber.replace(/-/g, '')
  // SEC wants CIK without leading zeros in the URL path
  const cikNoLeadingZeros = cik.replace(/^0+/, '')
  const baseUrl = `https://www.sec.gov/Archives/edgar/data/${cikNoLeadingZeros}/${accessionNoDashes}`

  // First, fetch the directory listing to find the correct XML file
  try {
    const dirResponse = await fetch(baseUrl, {
      headers: { 'User-Agent': SEC_USER_AGENT }
    })

    if (dirResponse.ok) {
      const dirHtml = await dirResponse.text()

      // Find XML files that might contain the info table
      // SEC returns full paths like href="/Archives/edgar/data/.../filename.xml"
      const xmlMatches = dirHtml.match(/href="[^"]*\/([^"\/]+\.xml)"/gi) || []
      const xmlFiles = xmlMatches
        .map(m => {
          // Extract just the filename from the path
          const match = m.match(/\/([^"\/]+\.xml)"$/i)
          return match ? match[1] : ''
        })
        .filter(f => f && !f.includes('primary_doc') && !f.includes('index')) // Skip primary_doc, it's metadata
        .sort((a, b) => {
          // Prefer files with numbers (like 46994.xml) as they're usually the info table
          const aNum = a.match(/\d+/)
          const bNum = b.match(/\d+/)
          if (aNum && !bNum) return -1
          if (!aNum && bNum) return 1
          return 0
        })

      for (const xmlFile of xmlFiles) {
        const xmlUrl = `${baseUrl}/${xmlFile}`
        const xmlResponse = await fetch(xmlUrl, {
          headers: { 'User-Agent': SEC_USER_AGENT },
          next: { revalidate: 86400 }
        })

        if (xmlResponse.ok) {
          const xmlText = await xmlResponse.text()

          // Check if this file contains infoTable elements
          if (xmlText.includes('infoTable') || xmlText.includes('informationTable')) {
            const holdings = parseInfoTable(xmlText)
            if (holdings.length > 0) {
              return holdings
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching filing directory:', error)
  }

  // Fallback: Try common file names
  const possibleFiles = ['infotable.xml', 'INFOTABLE.XML', 'form13fInfoTable.xml']

  for (const filename of possibleFiles) {
    try {
      const url = `${baseUrl}/${filename}`
      const response = await fetch(url, {
        headers: { 'User-Agent': SEC_USER_AGENT },
        next: { revalidate: 86400 }
      })

      if (response.ok) {
        const xmlText = await response.text()
        const holdings = parseInfoTable(xmlText)
        if (holdings.length > 0) {
          return holdings
        }
      }
    } catch (error) {
      continue
    }
  }

  return []
}

// Parse the 13F infotable XML
function parseInfoTable(xml: string): Holding[] {
  const holdings: Holding[] = []

  // Match each infoTable entry (handles various namespace formats and casing)
  const entryRegex = /<infoTable[^>]*>([\s\S]*?)<\/infoTable>/gi
  let match

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1]

    const getValue = (tag: string): string => {
      // Handle various tag formats (with/without namespace, different casing)
      const regex = new RegExp(`<(?:\\w+:)?${tag}[^>]*>([^<]*)<\/(?:\\w+:)?${tag}>`, 'i')
      const m = entry.match(regex)
      return m ? m[1].trim() : ''
    }

    const getNumeric = (tag: string): number => {
      const val = getValue(tag)
      return val ? parseInt(val.replace(/,/g, ''), 10) || 0 : 0
    }

    // SEC 13F values are already in dollars (despite documentation saying $1000s)
    // Modern filings report actual dollar amounts
    const rawValue = getNumeric('value')

    const cusip = getValue('cusip')
    const holding: Holding = {
      issuer: getValue('nameOfIssuer'),
      class: getValue('titleOfClass'),
      cusip,
      ticker: CUSIP_TO_TICKER[cusip] || undefined, // Resolve ticker from CUSIP
      value: rawValue, // Already in dollars
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

// Search for institutions by name
async function searchInstitutions(query: string): Promise<{ cik: string; name: string }[]> {
  try {
    // Use SEC company search
    const response = await fetch(
      `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(query)}&dateRange=custom&forms=13F-HR&startdt=2024-01-01&enddt=2025-12-31`,
      {
        headers: { 'User-Agent': SEC_USER_AGENT }
      }
    )

    if (!response.ok) {
      // Fallback: Try the company tickers JSON
      const tickersResponse = await fetch(
        'https://www.sec.gov/files/company_tickers.json',
        { headers: { 'User-Agent': SEC_USER_AGENT } }
      )

      if (tickersResponse.ok) {
        const tickers = await tickersResponse.json()
        const results: { cik: string; name: string }[] = []
        const queryLower = query.toLowerCase()

        for (const key in tickers) {
          const company = tickers[key]
          if (company.title.toLowerCase().includes(queryLower)) {
            results.push({
              cik: String(company.cik_str),
              name: company.title
            })
            if (results.length >= 20) break
          }
        }

        return results
      }
    }

    return []
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

// Well-known institution CIKs for quick lookup
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
  'TWO_SIGMA': '1179392',
  'SOROS': '1029160',
  'SOROS_FUND_MANAGEMENT': '1029160',
  'TIGER_GLOBAL': '1167483',
  'PERSHING_SQUARE': '1336528',
  'ELLIOTT': '1048445',
  'THIRD_POINT': '1040273',
  'APPALOOSA': '1656456',
  'NORGES_BANK': '1582202',
}

export async function GET(request: NextRequest) {
  const cik = request.nextUrl.searchParams.get('cik')
  const investor = request.nextUrl.searchParams.get('investor')
  const search = request.nextUrl.searchParams.get('search')
  const quarter = request.nextUrl.searchParams.get('quarter') // Optional: specific quarter index (0 = latest)

  // Search for institutions
  if (search) {
    const results = await searchInstitutions(search)
    return NextResponse.json({ institutions: results })
  }

  // Resolve CIK from investor name if provided
  let resolvedCik = cik
  if (!resolvedCik && investor) {
    const normalizedInvestor = investor.toUpperCase().replace(/ /g, '_')
    resolvedCik = KNOWN_INSTITUTIONS[normalizedInvestor]

    if (!resolvedCik) {
      // Try partial matching
      for (const [key, value] of Object.entries(KNOWN_INSTITUTIONS)) {
        if (key.includes(normalizedInvestor) || normalizedInvestor.includes(key.split('_')[0])) {
          resolvedCik = value
          break
        }
      }
    }
  }

  if (!resolvedCik) {
    return NextResponse.json({
      error: 'CIK or investor name required',
      hint: 'Provide ?cik=1067983 or ?investor=BERKSHIRE_HATHAWAY'
    }, { status: 400 })
  }

  // Get institution info and filings
  const institutionInfo = await getInstitutionFilings(resolvedCik)

  if (!institutionInfo || institutionInfo.filings.length === 0) {
    return NextResponse.json({
      error: 'Institution not found or no 13F filings',
      cik: resolvedCik
    }, { status: 404 })
  }

  // Get holdings for the specified quarter (default: latest)
  const quarterIndex = quarter ? parseInt(quarter) : 0
  const filing = institutionInfo.filings[quarterIndex]

  if (!filing) {
    return NextResponse.json({
      error: 'Filing not found for specified quarter',
      availableQuarters: institutionInfo.filings.length
    }, { status: 404 })
  }

  const holdings = await getFilingHoldings(resolvedCik, filing.accessionNumber)

  // Sort by value descending
  holdings.sort((a, b) => b.value - a.value)

  // Calculate totals
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)

  return NextResponse.json({
    institution: {
      cik: institutionInfo.cik,
      name: institutionInfo.name,
    },
    filing: {
      accessionNumber: filing.accessionNumber,
      filingDate: filing.filingDate,
      reportDate: filing.reportDate,
      form: filing.form
    },
    summary: {
      totalValue,
      totalPositions: holdings.length,
      topHolding: holdings[0]?.issuer || null
    },
    holdings: holdings.map(h => ({
      ...h,
      portfolioPercent: totalValue > 0 ? (h.value / totalValue) * 100 : 0
    })),
    availableQuarters: institutionInfo.filings.map(f => ({
      reportDate: f.reportDate,
      filingDate: f.filingDate
    }))
  })
}
