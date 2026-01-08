import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'

// Sync Swedish Companies from Allabolag.se (FREE scraping)
// Sweden has ~1.2 million registered companies
// Target: All AB (Aktiebolag) companies with financial data

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface SwedishCompany {
  orgNumber: string
  name: string
  legalForm?: string
  address?: string
  city?: string
  postalCode?: string
  industry?: string
  industryCode?: string
  employees?: number
  revenue?: number
  profit?: number
  assets?: number
  equity?: number
  foundedYear?: number
  website?: string
  phone?: string
  fiscalYear?: string
}

// Parse Swedish number format (1 234 567 -> 1234567)
function parseSwedishNumber(value: string | null | undefined): number | undefined {
  if (!value) return undefined
  const cleaned = value.replace(/\s/g, '').replace(/,/g, '.').replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? undefined : num
}

// Parse Swedish currency (often in KSEK = thousands SEK)
function parseSwedishCurrency(value: string | null | undefined, isKSEK: boolean = true): number | undefined {
  const num = parseSwedishNumber(value)
  if (num === undefined) return undefined
  // Allabolag often shows values in KSEK (thousands)
  return isKSEK ? num * 1000 : num
}

// Scrape company data from Allabolag.se
async function scrapeAllabolagCompany(orgNumber: string): Promise<SwedishCompany | null> {
  try {
    // Format org number for URL (XXXXXX-XXXX)
    const formattedOrg = orgNumber.replace(/[^0-9]/g, '')
    if (formattedOrg.length !== 10) return null

    const orgWithDash = `${formattedOrg.slice(0, 6)}-${formattedOrg.slice(6)}`
    const url = `https://www.allabolag.se/${orgWithDash}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
      }
    })

    if (!response.ok) {
      console.log(`Allabolag returned ${response.status} for ${orgNumber}`)
      return null
    }

    const html = await response.text()

    // Extract company data using regex (Allabolag structure)
    const company: SwedishCompany = {
      orgNumber: formattedOrg,
      name: extractText(html, /<h1[^>]*class="[^"]*company-name[^"]*"[^>]*>([^<]+)</) ||
        extractText(html, /<title>([^|<]+)/) || '',
    }

    // Legal form (AB, HB, etc.)
    company.legalForm = extractText(html, /Bolagsform[^<]*<[^>]*>([^<]+)</)

    // Address
    company.address = extractText(html, /Adress[^<]*<[^>]*>([^<]+)</)
    company.postalCode = extractText(html, /(\d{3}\s?\d{2})/)
    company.city = extractText(html, /Ort[^<]*<[^>]*>([^<]+)</) ||
      extractText(html, />\d{3}\s?\d{2}\s+([A-ZÅÄÖ][a-zåäö]+)/)

    // Industry (SNI code)
    company.industryCode = extractText(html, /SNI[^<]*<[^>]*>(\d+)/)
    company.industry = extractText(html, /Bransch[^<]*<[^>]*>([^<]+)</)

    // Employees
    const employeesStr = extractText(html, /Anställda[^<]*<[^>]*>([^<]+)</)
    company.employees = parseSwedishNumber(employeesStr)

    // Financial data (usually in KSEK)
    const revenueStr = extractText(html, /Omsättning[^<]*<[^>]*>([^<]+)</) ||
      extractText(html, /Nettoomsättning[^<]*<[^>]*>([^<]+)</)
    company.revenue = parseSwedishCurrency(revenueStr)

    const profitStr = extractText(html, /Resultat[^<]*<[^>]*>([^<]+)</) ||
      extractText(html, /Årets resultat[^<]*<[^>]*>([^<]+)</)
    company.profit = parseSwedishCurrency(profitStr)

    const assetsStr = extractText(html, /Summa tillgångar[^<]*<[^>]*>([^<]+)</) ||
      extractText(html, /Tillgångar[^<]*<[^>]*>([^<]+)</)
    company.assets = parseSwedishCurrency(assetsStr)

    const equityStr = extractText(html, /Eget kapital[^<]*<[^>]*>([^<]+)</)
    company.equity = parseSwedishCurrency(equityStr)

    // Founded year
    const foundedStr = extractText(html, /Registrerad[^<]*<[^>]*>(\d{4})/) ||
      extractText(html, /Grundades[^<]*<[^>]*>(\d{4})/)
    if (foundedStr) company.foundedYear = parseInt(foundedStr)

    // Contact info
    company.website = extractText(html, /href="(https?:\/\/[^"]+)"[^>]*>\s*(?:Webbplats|Hemsida)/)
    company.phone = extractText(html, /Telefon[^<]*<[^>]*>([^<]+)</)

    // Fiscal year
    company.fiscalYear = extractText(html, /Räkenskapsår[^<]*<[^>]*>([^<]+)</)

    return company
  } catch (error) {
    console.error(`Error scraping ${orgNumber}:`, error)
    return null
  }
}

// Helper to extract text using regex
function extractText(html: string, pattern: RegExp): string | undefined {
  const match = html.match(pattern)
  return match ? match[1].trim() : undefined
}

// Search Allabolag for companies
async function searchAllabolag(query: string, page: number = 1): Promise<string[]> {
  try {
    const url = `https://www.allabolag.se/what/${encodeURIComponent(query)}?page=${page}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      }
    })

    if (!response.ok) return []

    const html = await response.text()

    // Extract org numbers from search results
    const orgNumbers: string[] = []
    const pattern = /href="\/(\d{6}-\d{4})"/g
    let match

    while ((match = pattern.exec(html)) !== null) {
      const orgNum = match[1].replace('-', '')
      if (!orgNumbers.includes(orgNum)) {
        orgNumbers.push(orgNum)
      }
    }

    return orgNumbers
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

// Get list of top Swedish companies by revenue
async function getTopSwedishCompanies(limit: number, offset: number): Promise<string[]> {
  try {
    // Allabolag has lists sorted by revenue
    const url = `https://www.allabolag.se/bransch/alla?sort=omsattning&order=desc&page=${Math.floor(offset / 50) + 1}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      }
    })

    if (!response.ok) return []

    const html = await response.text()

    // Extract org numbers
    const orgNumbers: string[] = []
    const pattern = /href="\/(\d{6}-\d{4})"/g
    let match

    while ((match = pattern.exec(html)) !== null && orgNumbers.length < limit) {
      const orgNum = match[1].replace('-', '')
      if (!orgNumbers.includes(orgNum)) {
        orgNumbers.push(orgNum)
      }
    }

    return orgNumbers.slice(0, limit)
  } catch (error) {
    console.error('Failed to get top companies:', error)
    return []
  }
}

// Save company to Supabase
async function saveCompany(company: SwedishCompany): Promise<boolean> {
  const record = {
    org_number: company.orgNumber,
    country_code: 'SE',
    name: company.name,
    legal_form: company.legalForm,
    industry_code: company.industryCode,
    industry_description: company.industry,
    address_street: company.address,
    address_city: company.city,
    address_postal_code: company.postalCode,
    address_country: 'Sweden',
    website: company.website,
    phone: company.phone,
    employees: company.employees,
    revenue_latest: company.revenue,
    profit_latest: company.profit,
    total_assets_latest: company.assets,
    equity_latest: company.equity,
    founded_year: company.foundedYear,
    is_active: true,
    is_listed: false, // Will be updated later for OMX companies
    source: 'ALLABOLAG',
    source_url: `https://www.allabolag.se/${company.orgNumber.slice(0, 6)}-${company.orgNumber.slice(6)}`,
    updated_at: new Date().toISOString(),
  }

  const { error } = await getSupabase()
    .from('eu_companies')
    .upsert(record, {
      onConflict: 'country_code,org_number',
      ignoreDuplicates: false
    })

  if (error) {
    console.error(`Failed to save ${company.orgNumber}:`, error)
    return false
  }

  return true
}

// Well-known Swedish companies to start with
const KNOWN_SWEDISH_COMPANIES = [
  // Major publicly traded (OMX Stockholm)
  '5560125790', // Volvo
  '5560002230', // Ericsson
  '5560124113', // H&M
  '5560001644', // SEB
  '5560190138', // Nordea Sweden
  '5560258403', // Atlas Copco
  '5561188882', // Spotify (via holding)
  '5564866324', // Klarna
  '5560006230', // SKF
  '5560086446', // Sandvik
  '5560093349', // ABB Sweden
  '5560155083', // Essity
  '5561013439', // Electrolux
  '5560002466', // Handelsbanken
  '5560041636', // Swedbank
  '5561182066', // Sinch
  '5560086768', // Telia Company
  '5565467768', // EQT
  '5560067813', // Investor
  '5560016382', // Industrivärden
  // Tech companies
  '5565065448', // Truecaller
  '5567466285', // iZettle (PayPal)
  '5568560739', // Northvolt
  '5591679581', // Bolt Technology
  // Large private companies
  '5560360917', // IKEA Svenska
  '5563786680', // Spotify AB
  '5560004949', // Vattenfall
  '5560035715', // Scania
  '5560006399', // Stora Enso Sweden
  '5560016467', // AstraZeneca Sweden
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orgNumber = searchParams.get('org')
  const mode = searchParams.get('mode') || 'known' // 'known', 'search', 'top'
  const query = searchParams.get('q') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-swedish-companies', async () => {
    // Single company mode
    if (orgNumber) {
      const company = await scrapeAllabolagCompany(orgNumber)

      if (!company) {
        return NextResponse.json({
          success: false,
          orgNumber,
          error: 'Could not scrape company from Allabolag',
        }, { status: 404 })
      }

      const saved = await saveCompany(company)

      return NextResponse.json({
        success: saved,
        company: {
          orgNumber: company.orgNumber,
          name: company.name,
          revenue: company.revenue,
          employees: company.employees,
          industry: company.industry,
        },
        source: 'ALLABOLAG',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode
    let orgNumbers: string[]

    if (mode === 'search' && query) {
      orgNumbers = await searchAllabolag(query, Math.floor(offset / 50) + 1)
    } else if (mode === 'top') {
      orgNumbers = await getTopSwedishCompanies(limit, offset)
    } else {
      // Default: known large companies
      orgNumbers = KNOWN_SWEDISH_COMPANIES.slice(offset, offset + limit)
    }

    if (orgNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No companies to sync',
        mode,
        duration: Date.now() - startTime,
      })
    }

    const rateLimiter = new RateLimiter(1) // 1 request/second to be nice
    const results: Array<{ orgNumber: string; name?: string; success: boolean; error?: string }> = []
    let successCount = 0
    let failCount = 0

    for (const org of orgNumbers) {
      await rateLimiter.wait()

      try {
        const company = await scrapeAllabolagCompany(org)

        if (company && company.name) {
          const saved = await saveCompany(company)
          if (saved) {
            successCount++
            results.push({
              orgNumber: org,
              name: company.name,
              success: true
            })
          } else {
            failCount++
            results.push({ orgNumber: org, name: company.name, success: false, error: 'Save failed' })
          }
        } else {
          failCount++
          results.push({ orgNumber: org, success: false, error: 'Scrape failed or no data' })
        }
      } catch (error) {
        failCount++
        results.push({
          orgNumber: org,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Log sync progress
    await getSupabase().from('eu_sync_log').insert({
      source: 'ALLABOLAG',
      country_code: 'SE',
      sync_type: mode.toUpperCase(),
      completed_at: new Date().toISOString(),
      status: 'COMPLETED',
      companies_synced: successCount,
      errors: failCount,
      last_offset: offset + orgNumbers.length,
      details: { mode, query, limit, offset }
    })

    return NextResponse.json({
      success: true,
      source: 'ALLABOLAG',
      country: 'SE',
      summary: {
        mode,
        companiesProcessed: orgNumbers.length,
        successCount,
        failCount,
        duration: Date.now() - startTime,
      },
      pagination: {
        offset,
        limit,
        nextOffset: offset + orgNumbers.length,
      },
      results: results.slice(0, 10), // Only show first 10
    })
  })
}
