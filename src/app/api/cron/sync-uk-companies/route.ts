import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'

// Sync UK Companies from Companies House (FREE Official API)
// UK has ~4.5 million registered companies
// API: https://developer.company-information.service.gov.uk/
// Rate limit: 600 requests per 5 minutes

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const COMPANIES_HOUSE_API_KEY = process.env.COMPANIES_HOUSE_API_KEY || ''

const API_BASE = 'https://api.company-information.service.gov.uk'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface UKCompany {
  companyNumber: string
  name: string
  type?: string
  status?: string
  dateOfCreation?: string
  addressLine1?: string
  addressLine2?: string
  locality?: string
  postalCode?: string
  country?: string
  sicCodes?: string[]
  sicDescription?: string
  accounts?: {
    lastMadeUpTo?: string
    nextDue?: string
    type?: string
  }
}

interface UKAccounts {
  companyNumber: string
  accountingPeriodEndDate?: string
  currentAssets?: number
  fixedAssets?: number
  totalAssets?: number
  currentLiabilities?: number
  totalLiabilities?: number
  netAssets?: number
  shareholdersFunds?: number
  turnover?: number
  profit?: number
  employees?: number
}

// Make authenticated request to Companies House API
async function apiRequest(endpoint: string): Promise<any | null> {
  if (!COMPANIES_HOUSE_API_KEY) {
    console.error('Companies House API key not configured')
    return null
  }

  try {
    // API uses HTTP Basic Auth with API key as username
    const auth = Buffer.from(`${COMPANIES_HOUSE_API_KEY}:`).toString('base64')

    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      }
    })

    if (response.status === 429) {
      // Rate limited - wait and signal to caller
      console.log('Companies House rate limited')
      return { rateLimited: true }
    }

    if (!response.ok) {
      console.log(`Companies House API returned ${response.status} for ${endpoint}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    return null
  }
}

// Get company profile
async function getCompanyProfile(companyNumber: string): Promise<UKCompany | null> {
  const data = await apiRequest(`/company/${companyNumber}`)
  if (!data || data.rateLimited) return null

  return {
    companyNumber: data.company_number,
    name: data.company_name,
    type: data.type,
    status: data.company_status,
    dateOfCreation: data.date_of_creation,
    addressLine1: data.registered_office_address?.address_line_1,
    addressLine2: data.registered_office_address?.address_line_2,
    locality: data.registered_office_address?.locality,
    postalCode: data.registered_office_address?.postal_code,
    country: data.registered_office_address?.country,
    sicCodes: data.sic_codes,
    accounts: data.accounts ? {
      lastMadeUpTo: data.accounts.last_accounts?.made_up_to,
      nextDue: data.accounts.next_due,
      type: data.accounts.accounting_reference_date?.type,
    } : undefined,
  }
}

// Search companies
async function searchCompanies(query: string, itemsPerPage: number = 20, startIndex: number = 0): Promise<string[]> {
  const data = await apiRequest(`/search/companies?q=${encodeURIComponent(query)}&items_per_page=${itemsPerPage}&start_index=${startIndex}`)
  if (!data || data.rateLimited || !data.items) return []

  return data.items.map((item: any) => item.company_number)
}

// Get companies with advanced search (by SIC code, incorporation date, etc.)
async function advancedSearchCompanies(sicCode?: string, incorporatedFrom?: string, itemsPerPage: number = 100): Promise<string[]> {
  let endpoint = `/advanced-search/companies?size=${itemsPerPage}`

  if (sicCode) endpoint += `&sic_codes=${sicCode}`
  if (incorporatedFrom) endpoint += `&incorporated_from=${incorporatedFrom}`

  const data = await apiRequest(endpoint)
  if (!data || data.rateLimited || !data.items) return []

  return data.items.map((item: any) => item.company_number)
}

// Save company to Supabase
async function saveUKCompany(company: UKCompany): Promise<boolean> {
  // Map UK company types to readable forms
  const typeMap: Record<string, string> = {
    'ltd': 'Ltd',
    'private-limited-guarant-nsc': 'Ltd by Guarantee',
    'plc': 'PLC',
    'llp': 'LLP',
    'private-unlimited': 'Unlimited',
    'private-limited-shares-section-30-exemption': 'Ltd',
  }

  const record = {
    org_number: company.companyNumber,
    country_code: 'GB',
    name: company.name,
    legal_form: typeMap[company.type || ''] || company.type,
    industry_code: company.sicCodes?.[0],
    address_street: [company.addressLine1, company.addressLine2].filter(Boolean).join(', '),
    address_city: company.locality,
    address_postal_code: company.postalCode,
    address_country: company.country || 'United Kingdom',
    founded_year: company.dateOfCreation ? parseInt(company.dateOfCreation.split('-')[0]) : undefined,
    is_active: company.status === 'active',
    is_listed: company.type === 'plc', // PLCs are often listed
    source: 'COMPANIES_HOUSE',
    source_url: `https://find-and-update.company-information.service.gov.uk/company/${company.companyNumber}`,
    updated_at: new Date().toISOString(),
  }

  const { error } = await getSupabase()
    .from('eu_companies')
    .upsert(record, {
      onConflict: 'country_code,org_number',
      ignoreDuplicates: false
    })

  if (error) {
    console.error(`Failed to save UK company ${company.companyNumber}:`, error)
    return false
  }

  return true
}

// Major UK company numbers (FTSE 100 + notable)
const KNOWN_UK_COMPANIES = [
  // FTSE 100
  '00102498', // Shell
  '02017060', // Unilever PLC
  'SC286832', // NatWest Group
  '02191894', // BP
  '00445790', // HSBC Holdings
  '00968721', // Barclays
  '00109535', // BAE Systems
  '00059163', // GSK (GlaxoSmithKline)
  '07796015', // AstraZeneca UK
  '00095527', // Rio Tinto
  '00059152', // Glencore UK
  '00074219', // Rolls-Royce
  '00151188', // Diageo
  '00214436', // BT Group
  '00020329', // Lloyds Banking Group
  '00236882', // Aviva
  '00958850', // RELX
  '00896073', // National Grid
  '10378759', // Compass Group
  '00198085', // Imperial Brands
  '00029581', // Legal & General
  '00968171', // Standard Chartered
  '00471941', // Vodafone
  '00102541', // Smiths Group
  '00218226', // Associated British Foods
  // Tech companies
  '10507023', // Arm Holdings
  '06730569', // Wise (TransferWise)
  '08390330', // Deliveroo
  '09429130', // Revolut
  '07552853', // Monzo
  '08817533', // Starling Bank
  // Other notable
  '00086124', // Tesco
  '00111876', // J Sainsbury
  '00519110', // Marks & Spencer
  '02238618', // WPP
  '00896086', // British Airways
  '09422789', // Virgin Atlantic
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const companyNumber = searchParams.get('company')
  const mode = searchParams.get('mode') || 'known' // 'known', 'search', 'sic'
  const query = searchParams.get('q') || ''
  const sicCode = searchParams.get('sic') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  if (!COMPANIES_HOUSE_API_KEY) {
    return NextResponse.json({
      error: 'Companies House API key not configured',
      setup: 'Get free API key from https://developer.company-information.service.gov.uk/',
    }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-uk-companies', async () => {
    // Single company mode
    if (companyNumber) {
      const company = await getCompanyProfile(companyNumber)

      if (!company) {
        return NextResponse.json({
          success: false,
          companyNumber,
          error: 'Could not fetch company from Companies House',
        }, { status: 404 })
      }

      const saved = await saveUKCompany(company)

      return NextResponse.json({
        success: saved,
        company: {
          companyNumber: company.companyNumber,
          name: company.name,
          type: company.type,
          status: company.status,
          locality: company.locality,
        },
        source: 'COMPANIES_HOUSE',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode
    let companyNumbers: string[]

    if (mode === 'search' && query) {
      companyNumbers = await searchCompanies(query, limit, offset)
    } else if (mode === 'sic' && sicCode) {
      companyNumbers = await advancedSearchCompanies(sicCode, undefined, limit)
    } else {
      // Default: known major companies
      companyNumbers = KNOWN_UK_COMPANIES.slice(offset, offset + limit)
    }

    if (companyNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No companies to sync',
        mode,
        duration: Date.now() - startTime,
      })
    }

    // Companies House rate limit: 600/5min = 2/sec
    const rateLimiter = new RateLimiter(2)
    const results: Array<{ companyNumber: string; name?: string; success: boolean; error?: string }> = []
    let successCount = 0
    let failCount = 0

    for (const num of companyNumbers) {
      await rateLimiter.wait()

      try {
        const company = await getCompanyProfile(num)

        if (company && company.name) {
          const saved = await saveUKCompany(company)
          if (saved) {
            successCount++
            results.push({
              companyNumber: num,
              name: company.name,
              success: true
            })
          } else {
            failCount++
            results.push({ companyNumber: num, name: company.name, success: false, error: 'Save failed' })
          }
        } else {
          failCount++
          results.push({ companyNumber: num, success: false, error: 'Fetch failed' })
        }
      } catch (error) {
        failCount++
        results.push({
          companyNumber: num,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Log sync progress
    await getSupabase().from('eu_sync_log').insert({
      source: 'COMPANIES_HOUSE',
      country_code: 'GB',
      sync_type: mode.toUpperCase(),
      completed_at: new Date().toISOString(),
      status: 'COMPLETED',
      companies_synced: successCount,
      errors: failCount,
      last_offset: offset + companyNumbers.length,
      details: { mode, query, sicCode, limit, offset }
    })

    return NextResponse.json({
      success: true,
      source: 'COMPANIES_HOUSE',
      country: 'GB',
      summary: {
        mode,
        companiesProcessed: companyNumbers.length,
        successCount,
        failCount,
        duration: Date.now() - startTime,
      },
      pagination: {
        offset,
        limit,
        nextOffset: offset + companyNumbers.length,
      },
      results: results.slice(0, 10),
    })
  })
}
