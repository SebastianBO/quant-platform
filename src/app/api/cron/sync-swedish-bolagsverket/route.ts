import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'

// Sync Swedish Companies from Bolagsverket (Official Government API)
// Uses the "Värdefulla datamängder" (High Value Datasets) API
// FREE as mandated by EU regulations
// API Docs: https://bolagsverket.se/apierochoppnadata/vardefulladatamangder.5294.html

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Bolagsverket API - requires registration at portal.api.bolagsverket.se
const BOLAGSVERKET_API_KEY = process.env.BOLAGSVERKET_API_KEY || ''
const BOLAGSVERKET_API_BASE = 'https://api.bolagsverket.se'

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
  sniCode?: string
  sniDescription?: string
  address?: string
  city?: string
  postalCode?: string
  registrationDate?: string
  isActive?: boolean
}

// Fetch company from Bolagsverket API
async function fetchFromBolagsverket(orgNumber: string): Promise<SwedishCompany | null> {
  if (!BOLAGSVERKET_API_KEY) {
    console.log('Bolagsverket API key not configured')
    return null
  }

  try {
    // Format org number (10 digits, no dash)
    const cleanOrg = orgNumber.replace(/[^0-9]/g, '')
    if (cleanOrg.length !== 10) return null

    const response = await fetch(
      `${BOLAGSVERKET_API_BASE}/vardefulla-datamangder/v1/foretag/${cleanOrg}`,
      {
        headers: {
          'Authorization': `Bearer ${BOLAGSVERKET_API_KEY}`,
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      console.log(`Bolagsverket API returned ${response.status} for ${orgNumber}`)
      return null
    }

    const data = await response.json()

    return {
      orgNumber: cleanOrg,
      name: data.namn || data.foretagsnamn,
      legalForm: data.juridiskForm || data.foretagsform,
      sniCode: data.sniKod,
      sniDescription: data.sniBeskrivning,
      address: data.adress?.gatuadress,
      city: data.adress?.postort,
      postalCode: data.adress?.postnummer,
      registrationDate: data.registreringsdatum,
      isActive: data.aktiv !== false,
    }
  } catch (error) {
    console.error(`Error fetching from Bolagsverket:`, error)
    return null
  }
}

// Alternative: Fetch from Näringslivsregistret (public search)
async function fetchFromNaringslivsregistret(orgNumber: string): Promise<SwedishCompany | null> {
  try {
    const cleanOrg = orgNumber.replace(/[^0-9]/g, '')

    // SNR (Svenskt Näringslivsregister) has a public endpoint
    const response = await fetch(
      `https://snr4.bolagsverket.se/snrgate/foretagsinfo/foretagsinformation?orgnr=${cleanOrg}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; LicianBot/1.0)',
        }
      }
    )

    if (!response.ok) return null

    const data = await response.json()

    return {
      orgNumber: cleanOrg,
      name: data.foretagsnamn,
      legalForm: data.foretagsform,
      sniCode: data.sniKod,
      address: data.adress,
      city: data.ort,
      postalCode: data.postnummer,
      isActive: true,
    }
  } catch (error) {
    return null
  }
}

// Fetch annual report events (årsredovisningshändelser)
async function fetchAnnualReportEvents(orgNumber: string): Promise<any[]> {
  try {
    const cleanOrg = orgNumber.replace(/[^0-9]/g, '')

    const response = await fetch(
      `${BOLAGSVERKET_API_BASE}/hamta-arsredovisningshandelser/v1.2/handelser?orgnr=${cleanOrg}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.handelser || []
  } catch (error) {
    return []
  }
}

// Save company to Supabase
async function saveCompany(company: SwedishCompany): Promise<boolean> {
  const legalFormMap: Record<string, string> = {
    'AB': 'Aktiebolag',
    'HB': 'Handelsbolag',
    'KB': 'Kommanditbolag',
    'EF': 'Enskild firma',
    'EK': 'Ekonomisk förening',
    'BRF': 'Bostadsrättsförening',
  }

  const record = {
    org_number: company.orgNumber,
    country_code: 'SE',
    name: company.name,
    legal_form: legalFormMap[company.legalForm || ''] || company.legalForm,
    industry_code: company.sniCode,
    industry_description: company.sniDescription,
    address_street: company.address,
    address_city: company.city,
    address_postal_code: company.postalCode,
    address_country: 'Sweden',
    founded_year: company.registrationDate ? parseInt(company.registrationDate.split('-')[0]) : undefined,
    is_active: company.isActive,
    source: 'BOLAGSVERKET',
    source_url: `https://foretagsinfo.bolagsverket.se/sok-foretag/${company.orgNumber}`,
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

// Major Swedish companies (OMX Stockholm + large private)
const KNOWN_SWEDISH_COMPANIES = [
  // OMX Stockholm Large Cap
  '5560125790', // Volvo
  '5560002230', // Ericsson
  '5560124113', // H&M
  '5560001644', // SEB
  '5560006230', // SKF
  '5560086446', // Sandvik
  '5560155083', // Essity
  '5561013439', // Electrolux
  '5560002466', // Handelsbanken
  '5560041636', // Swedbank
  '5560086768', // Telia Company
  '5560067813', // Investor
  '5560016382', // Industrivärden
  '5560258403', // Atlas Copco
  '5560093349', // ABB Sweden
  '5560035715', // Scania
  // Tech
  '5565065448', // Truecaller
  '5563786680', // Spotify AB
  '5564866324', // Klarna
  '5568560739', // Northvolt
  // Large private
  '5560360917', // IKEA Svenska
  '5560004949', // Vattenfall
  '5560006399', // Stora Enso Sweden
  '5560016467', // AstraZeneca Sweden
  '5560190138', // Nordea Sweden
  '5561182066', // Sinch
  '5565467768', // EQT
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orgNumber = searchParams.get('org')
  const mode = searchParams.get('mode') || 'known'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()
  const hasApiKey = !!BOLAGSVERKET_API_KEY

  return withCronLogging('sync-swedish-bolagsverket', async () => {
    // Single company mode
    if (orgNumber) {
      let company: SwedishCompany | null = null

      // Try official API first
      if (hasApiKey) {
        company = await fetchFromBolagsverket(orgNumber)
      }

      // Fallback to public registry
      if (!company) {
        company = await fetchFromNaringslivsregistret(orgNumber)
      }

      if (!company) {
        return NextResponse.json({
          success: false,
          orgNumber,
          error: 'Could not fetch company data',
          note: hasApiKey ? 'API key configured' : 'Get API key from portal.api.bolagsverket.se',
        }, { status: 404 })
      }

      const saved = await saveCompany(company)

      return NextResponse.json({
        success: saved,
        company: {
          orgNumber: company.orgNumber,
          name: company.name,
          legalForm: company.legalForm,
          sniCode: company.sniCode,
        },
        source: hasApiKey ? 'BOLAGSVERKET_API' : 'NARINGSLIVSREGISTRET',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode
    const orgNumbers = KNOWN_SWEDISH_COMPANIES.slice(offset, offset + limit)

    if (orgNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No companies to sync',
        mode,
        duration: Date.now() - startTime,
      })
    }

    const rateLimiter = new RateLimiter(2)
    const results: Array<{ orgNumber: string; name?: string; success: boolean; error?: string }> = []
    let successCount = 0
    let failCount = 0

    for (const org of orgNumbers) {
      await rateLimiter.wait()

      try {
        let company: SwedishCompany | null = null

        if (hasApiKey) {
          company = await fetchFromBolagsverket(org)
        }

        if (!company) {
          company = await fetchFromNaringslivsregistret(org)
        }

        if (company && company.name) {
          const saved = await saveCompany(company)
          if (saved) {
            successCount++
            results.push({ orgNumber: org, name: company.name, success: true })
          } else {
            failCount++
            results.push({ orgNumber: org, success: false, error: 'Save failed' })
          }
        } else {
          failCount++
          results.push({ orgNumber: org, success: false, error: 'Fetch failed' })
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

    // Log sync
    await getSupabase().from('eu_sync_log').insert({
      source: 'BOLAGSVERKET',
      country_code: 'SE',
      sync_type: mode.toUpperCase(),
      completed_at: new Date().toISOString(),
      status: 'COMPLETED',
      companies_synced: successCount,
      errors: failCount,
      last_offset: offset + orgNumbers.length,
      details: { mode, hasApiKey, limit, offset }
    })

    return NextResponse.json({
      success: true,
      source: hasApiKey ? 'BOLAGSVERKET_API' : 'NARINGSLIVSREGISTRET',
      country: 'SE',
      apiStatus: hasApiKey ? 'API key configured' : 'No API key - using public registry',
      setupInstructions: hasApiKey ? null : {
        step1: 'Register at https://portal.api.bolagsverket.se',
        step2: 'Apply for Värdefulla datamängder API access',
        step3: 'Add BOLAGSVERKET_API_KEY to environment variables',
      },
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
      results: results.slice(0, 10),
    })
  })
}
