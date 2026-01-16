import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'
import { logger } from '@/lib/logger'

// Sync German Companies from OffeneRegister.de (FREE - No API key!)
// Source: Open data from German trade registers
// API: https://db.offeneregister.de (Datasette SQL interface)
// Data: 5+ million German companies
// License: CC-BY 4.0 (attribute OpenCorporates)
// Note: Data is from 2017-2019 (static snapshot), but still valuable

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// OffeneRegister Datasette API - NO AUTH NEEDED!
const OFFENEREGISTER_API = 'https://db.offeneregister.de/openregister.json'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

/**
 * Sanitize string for SQL LIKE queries in external Datasette API
 * Escapes SQL special characters to prevent injection
 *
 * SECURITY NOTE: This external API (Datasette) doesn't support parameterized queries,
 * so we use comprehensive sanitization as the best available protection.
 */
function sanitizeForSql(input: string): string {
  if (!input || typeof input !== 'string') return ''

  // Remove or escape dangerous characters
  return input
    .replace(/'/g, "''")        // Escape single quotes
    .replace(/\\/g, '\\\\')     // Escape backslashes
    .replace(/\x00/g, '')       // Remove null bytes
    .replace(/\n/g, ' ')        // Replace newlines
    .replace(/\r/g, ' ')        // Replace carriage returns
    .replace(/;/g, '')          // Remove semicolons (prevent query termination)
    .replace(/--/g, '')         // Remove SQL comments
    .replace(/\/\*/g, '')       // Remove block comment start
    .replace(/\*\//g, '')       // Remove block comment end
    .replace(/UNION/gi, '')     // Remove UNION keyword
    .replace(/SELECT/gi, '')    // Remove SELECT keyword (except in our query)
    .replace(/INSERT/gi, '')    // Remove INSERT keyword
    .replace(/UPDATE/gi, '')    // Remove UPDATE keyword
    .replace(/DELETE/gi, '')    // Remove DELETE keyword
    .replace(/DROP/gi, '')      // Remove DROP keyword
    .replace(/EXEC/gi, '')      // Remove EXEC keyword
    .trim()
    .slice(0, 200)              // Limit length to prevent abuse
}

/**
 * Sanitize company number - alphanumeric and spaces only
 * German company numbers follow pattern like "HRB 12345 B"
 */
function sanitizeCompanyNumber(input: string): string {
  if (!input || typeof input !== 'string') return ''
  // Only allow alphanumeric characters, spaces, and hyphens (common in German HRB numbers)
  return input.replace(/[^a-zA-Z0-9\s\-]/g, '').trim().slice(0, 50)
}

// Database row types from Datasette API (returns arrays of values)
type CompanyRow = [string, string, string, string, string, string] // [company_number, name, status, address, jurisdiction, type]
type OfficerRow = [string, string, string] // [name, position, start_date]

interface GermanCompany {
  companyNumber: string // Handelsregister number (e.g., HRB 12345)
  name: string
  currentStatus?: string
  registeredAddress?: string
  jurisdiction?: string // Court (e.g., Berlin Charlottenburg)
  companyType?: string
  registrationDate?: string
  officers?: Array<{
    name: string
    position: string
    startDate?: string
  }>
}

// Query OffeneRegister Datasette API
// Returns array of row tuples - callers should type the rows appropriately
async function queryOffeneRegister(sql: string): Promise<unknown[]> {
  try {
    const url = `${OFFENEREGISTER_API}?sql=${encodeURIComponent(sql)}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      logger.warn('OffeneRegister returned error status', { status: response.status })
      return []
    }

    const data = await response.json()
    return data.rows || []
  } catch (error) {
    logger.error('OffeneRegister query error', { error: error instanceof Error ? error.message : 'Unknown' })
    return []
  }
}

// Search companies by name
async function searchCompanies(name: string, limit: number = 20): Promise<GermanCompany[]> {
  const sanitizedName = sanitizeForSql(name)
  const sanitizedLimit = Math.min(Math.max(1, Math.floor(limit)), 100) // Clamp to 1-100

  const sql = `
    SELECT
      company_number,
      name,
      current_status,
      registered_address,
      jurisdiction_code,
      company_type
    FROM company
    WHERE name LIKE '%${sanitizedName}%'
    LIMIT ${sanitizedLimit}
  `

  const rows = await queryOffeneRegister(sql) as CompanyRow[]

  return rows.map((row) => ({
    companyNumber: row[0],
    name: row[1],
    currentStatus: row[2],
    registeredAddress: row[3],
    jurisdiction: row[4],
    companyType: row[5],
  }))
}

// Get companies by offset (for batch processing)
async function getCompaniesBatch(limit: number = 100, offset: number = 0): Promise<GermanCompany[]> {
  const sql = `
    SELECT
      company_number,
      name,
      current_status,
      registered_address,
      jurisdiction_code,
      company_type
    FROM company
    WHERE current_status = 'currently registered'
    ORDER BY company_number
    LIMIT ${limit}
    OFFSET ${offset}
  `

  const rows = await queryOffeneRegister(sql) as CompanyRow[]

  return rows.map((row) => ({
    companyNumber: row[0],
    name: row[1],
    currentStatus: row[2],
    registeredAddress: row[3],
    jurisdiction: row[4],
    companyType: row[5],
  }))
}

// Get company officers
async function getCompanyOfficers(companyNumber: string): Promise<Array<{ name: string; position: string; startDate?: string }>> {
  // Use stricter whitelist sanitization for company numbers
  const sanitizedCompanyNumber = sanitizeCompanyNumber(companyNumber)

  const sql = `
    SELECT
      name,
      position,
      start_date
    FROM officer
    WHERE company_number = '${sanitizedCompanyNumber}'
    LIMIT 10
  `

  const rows = await queryOffeneRegister(sql) as OfficerRow[]

  return rows.map((row) => ({
    name: row[0],
    position: row[1],
    startDate: row[2],
  }))
}

// Save company to Supabase
async function saveCompany(company: GermanCompany): Promise<boolean> {
  // German company types
  const typeMap: Record<string, string> = {
    'gmbh': 'GmbH',
    'ag': 'AG',
    'kg': 'KG',
    'ohg': 'OHG',
    'ug': 'UG (haftungsbeschränkt)',
    'eg': 'eG',
    'ev': 'e.V.',
    'kgaa': 'KGaA',
    'gmbh_co_kg': 'GmbH & Co. KG',
  }

  // Parse address if available
  let city = ''
  let postalCode = ''
  if (company.registeredAddress) {
    // Try to extract postal code and city from German address format
    const match = company.registeredAddress.match(/(\d{5})\s+(.+)/)
    if (match) {
      postalCode = match[1]
      city = match[2]
    }
  }

  const record = {
    org_number: company.companyNumber,
    country_code: 'DE',
    name: company.name,
    legal_form: typeMap[company.companyType?.toLowerCase() || ''] || company.companyType,
    address_street: company.registeredAddress,
    address_city: city,
    address_postal_code: postalCode,
    address_country: 'Germany',
    is_active: company.currentStatus === 'currently registered',
    // jurisdiction contains the court name
    sector: company.jurisdiction,
    source: 'OFFENEREGISTER',
    source_url: `https://offeneregister.de/company/${encodeURIComponent(company.companyNumber)}`,
    updated_at: new Date().toISOString(),
  }

  const { error } = await getSupabase()
    .from('eu_companies')
    .upsert(record, {
      onConflict: 'country_code,org_number',
      ignoreDuplicates: false
    })

  if (error) {
    logger.error('Failed to save German company', { companyNumber: company.companyNumber, error: error.message })
    return false
  }

  return true
}

// Major German companies (DAX + notable)
const KNOWN_GERMAN_COMPANIES = [
  // Search terms for major German companies
  'Volkswagen',
  'Siemens',
  'BASF',
  'Deutsche Telekom',
  'Deutsche Bank',
  'BMW',
  'Daimler',
  'SAP',
  'Allianz',
  'Bayer',
  'Adidas',
  'Deutsche Post',
  'Munich Re',
  'Infineon',
  'Continental',
  'Henkel',
  'Merck',
  'Deutsche Börse',
  'E.ON',
  'RWE',
  'Lufthansa',
  'Commerzbank',
  'Porsche',
  'Zalando',
  'HelloFresh',
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || searchParams.get('query')
  const mode = searchParams.get('mode') || 'search' // 'search', 'batch', 'known'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-german-companies', async () => {
    let companies: GermanCompany[] = []

    if (mode === 'search' && query) {
      // Search by name
      companies = await searchCompanies(query, limit)
    } else if (mode === 'batch') {
      // Get batch by offset
      companies = await getCompaniesBatch(limit, offset)
    } else if (mode === 'known') {
      // Search for known major companies
      const searchTerms = KNOWN_GERMAN_COMPANIES.slice(offset, offset + limit)

      for (const term of searchTerms) {
        const found = await searchCompanies(term, 3)
        companies.push(...found)

        // Small delay to be nice to the API
        await new Promise(r => setTimeout(r, 200))
      }
    } else {
      return NextResponse.json({
        error: 'Specify mode: search (with q=), batch (with offset=), or known',
        example: '/api/cron/sync-german-companies?mode=known&limit=10',
      }, { status: 400 })
    }

    if (companies.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No companies found',
        mode,
        query,
        duration: Date.now() - startTime,
      })
    }

    // Save companies
    const results: Array<{ companyNumber: string; name: string; success: boolean; error?: string }> = []
    let successCount = 0
    let failCount = 0

    for (const company of companies) {
      if (!company.name) continue

      const saved = await saveCompany(company)
      if (saved) {
        successCount++
        results.push({
          companyNumber: company.companyNumber,
          name: company.name,
          success: true
        })
      } else {
        failCount++
        results.push({
          companyNumber: company.companyNumber,
          name: company.name,
          success: false,
          error: 'Save failed'
        })
      }
    }

    // Log sync
    await getSupabase().from('eu_sync_log').insert({
      source: 'OFFENEREGISTER',
      country_code: 'DE',
      sync_type: mode.toUpperCase(),
      completed_at: new Date().toISOString(),
      status: 'COMPLETED',
      companies_synced: successCount,
      errors: failCount,
      last_offset: offset + companies.length,
      details: { mode, query, limit, offset }
    })

    return NextResponse.json({
      success: true,
      source: 'OFFENEREGISTER',
      country: 'DE',
      apiNote: 'FREE - No API key required! (CC-BY 4.0 license)',
      dataNote: 'Data from 2017-2019 trade register snapshot',
      summary: {
        mode,
        query,
        companiesFound: companies.length,
        successCount,
        failCount,
        duration: Date.now() - startTime,
      },
      pagination: {
        offset,
        limit,
        nextOffset: offset + limit,
      },
      results: results.slice(0, 10),
    })
  })
}
