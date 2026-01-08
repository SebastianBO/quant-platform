import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'

// Sync Finnish Companies from PRH (Patent and Registration Office) - COMPLETELY FREE!
// NO API KEY REQUIRED - Just make requests!
// API: https://avoindata.prh.fi/opendata-ytj-api/v3
// Rate limit: 300 requests per minute (global)
// 600K+ Finnish companies

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// PRH API - NO AUTH NEEDED!
const PRH_YTJ_BASE = 'https://avoindata.prh.fi/opendata-ytj-api/v3'
const PRH_XBRL_BASE = 'https://avoindata.prh.fi/opendata-xbrl-api/v3'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface FinnishCompany {
  businessId: string // Y-tunnus format: 1234567-8
  euId?: string
  name: string
  companyForm?: string
  mainBusinessLine?: {
    code: string
    description: string
  }
  address?: {
    street?: string
    postalCode?: string
    city?: string
    country?: string
  }
  registrationDate?: string
  lastModified?: string
  tradeRegisterStatus?: string
}

interface FinnishFinancials {
  businessId: string
  fiscalYear: number
  reportDate: string
  // IXBRL data available
}

// Finnish company form codes
const FINNISH_COMPANY_FORMS: Record<string, string> = {
  '1': 'OY',     // Osakeyhtiö (Private limited)
  '17': 'OYJ',   // Julkinen osakeyhtiö (Public limited)
  '2': 'KY',     // Kommandiittiyhtiö
  '3': 'AY',     // Avoin yhtiö
  '4': 'OK',     // Osuuskunta
  '5': 'SRY',    // Säätiö (Foundation)
  '27': 'ASY',   // Asunto-osakeyhtiö
}

// Fetch company from PRH YTJ API (NO AUTH!)
async function fetchCompany(businessId: string): Promise<FinnishCompany | null> {
  try {
    const response = await fetch(
      `${PRH_YTJ_BASE}/companies?businessId=${encodeURIComponent(businessId)}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (response.status === 429) {
      console.log('PRH rate limited (300/min global)')
      return null
    }

    if (!response.ok) {
      console.log(`PRH API returned ${response.status} for ${businessId}`)
      return null
    }

    const data = await response.json()
    const company = data.companies?.[0]

    if (!company) return null

    // Find current name (type 1 = official name, without endDate)
    const currentName = company.names?.find((n: any) => n.type === '1' && !n.endDate)?.name ||
                       company.names?.find((n: any) => n.type === '1')?.name ||
                       company.names?.[0]?.name

    // Find current address (type 1 = business, type 2 = postal)
    const currentAddress = company.addresses?.find((a: any) => a.type === 1) ||
                          company.addresses?.[0]

    // Find current company form (get the type code)
    const currentFormCode = company.companyForms?.find((f: any) => !f.endDate)?.type ||
                           company.companyForms?.[0]?.type
    const currentFormDescription = company.companyForms?.[0]?.descriptions?.find(
      (d: any) => d.languageCode === '3' // English
    )?.description || company.companyForms?.[0]?.descriptions?.[0]?.description

    // Get city from postOffices array (prefer Finnish/English)
    const cityObj = currentAddress?.postOffices?.find((p: any) => p.languageCode === '1') ||
                   currentAddress?.postOffices?.[0]

    // Get business line description
    const businessLineDesc = company.mainBusinessLine?.descriptions?.find(
      (d: any) => d.languageCode === '3'
    )?.description || company.mainBusinessLine?.descriptions?.find(
      (d: any) => d.languageCode === '1'
    )?.description

    return {
      businessId: company.businessId?.value, // Note: it's .value not .identifier!
      euId: company.euId?.value,
      name: currentName,
      companyForm: FINNISH_COMPANY_FORMS[currentFormCode] || currentFormDescription || currentFormCode,
      mainBusinessLine: company.mainBusinessLine ? {
        code: company.mainBusinessLine.type || company.mainBusinessLine.code,
        description: businessLineDesc
      } : undefined,
      address: currentAddress ? {
        street: [currentAddress.street, currentAddress.buildingNumber].filter(Boolean).join(' '),
        postalCode: currentAddress.postCode,
        city: cityObj?.city,
        country: 'FI',
      } : undefined,
      registrationDate: company.businessId?.registrationDate,
      lastModified: company.lastModified,
      tradeRegisterStatus: company.tradeRegisterStatus?.toString(),
    }
  } catch (error) {
    console.error(`Error fetching Finnish company ${businessId}:`, error)
    return null
  }
}

// Search Finnish companies
async function searchCompanies(params: {
  name?: string
  location?: string
  companyForm?: string
  page?: number
}): Promise<string[]> {
  try {
    const searchParams = new URLSearchParams()

    if (params.name) searchParams.set('name', params.name)
    if (params.location) searchParams.set('location', params.location)
    if (params.companyForm) searchParams.set('companyForm', params.companyForm)
    if (params.page) searchParams.set('page', params.page.toString())

    const response = await fetch(
      `${PRH_YTJ_BASE}/companies?${searchParams.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.companies?.map((c: any) => c.businessId?.identifier).filter(Boolean) || []
  } catch (error) {
    console.error('Error searching Finnish companies:', error)
    return []
  }
}

// Get financial periods for a company
async function getFinancialPeriods(businessId: string): Promise<Array<{ date: string }>> {
  try {
    const response = await fetch(
      `${PRH_XBRL_BASE}/financials?businessId=${encodeURIComponent(businessId)}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    return data.financials?.map((f: any) => ({
      date: f.financialDate
    })) || []
  } catch (error) {
    return []
  }
}

// Save company to Supabase
async function saveCompany(company: FinnishCompany): Promise<boolean> {
  // Finnish company form codes
  const formMap: Record<string, string> = {
    'OY': 'Osakeyhtiö (Ltd)',
    'OYJ': 'Julkinen osakeyhtiö (Plc)',
    'KY': 'Kommandiittiyhtiö',
    'AY': 'Avoin yhtiö',
    'OK': 'Osuuskunta',
    'SRY': 'Säätiö (Foundation)',
    'ASY': 'Asunto-osakeyhtiö',
    'AOY': 'Asunto-osakeyhtiö',
  }

  // Trade register status: 1 = Registered in Trade Register, which means active
  // Status 2 = "Rekisterissä" (In register) is also active
  const isActive = company.tradeRegisterStatus === '1' || company.tradeRegisterStatus === '2'

  const record = {
    org_number: company.businessId,
    country_code: 'FI',
    name: company.name,
    legal_form: formMap[company.companyForm || ''] || company.companyForm,
    industry_code: company.mainBusinessLine?.code,
    industry_description: company.mainBusinessLine?.description,
    address_street: company.address?.street,
    address_city: company.address?.city,
    address_postal_code: company.address?.postalCode,
    address_country: 'Finland',
    founded_year: company.registrationDate ? parseInt(company.registrationDate.split('-')[0]) : undefined,
    is_active: isActive,
    is_listed: company.companyForm === 'OYJ', // Public limited companies
    // Note: company.euId stored in trade_name as PRH EU identifier
    trade_name: company.euId,
    source: 'PRH',
    source_url: `https://tietopalvelu.ytj.fi/yritystiedot.aspx?yavain=${company.businessId?.replace('-', '')}`,
    updated_at: new Date().toISOString(),
  }

  const { error, data } = await getSupabase()
    .from('eu_companies')
    .upsert(record, {
      onConflict: 'country_code,org_number',
      ignoreDuplicates: false
    })
    .select()

  if (error) {
    console.error(`Failed to save Finnish company ${company.businessId}:`, JSON.stringify(error, null, 2))
    console.error('Record attempted:', JSON.stringify(record, null, 2))
    return false
  }

  return true
}

// Major Finnish companies (OMXH25 + notable)
const KNOWN_FINNISH_COMPANIES = [
  // OMXH25 - Helsinki Stock Exchange major companies
  '0112038-9',  // Nokia
  '2858394-9',  // Nordea Bank Abp
  '1463611-4',  // Fortum
  '1927405-2',  // KONE
  '1041090-0',  // UPM-Kymmene
  '1852302-9',  // Neste
  '0773744-3',  // Wärtsilä
  '1039050-8',  // Stora Enso
  '0116510-6',  // Elisa
  '0142213-3',  // Sampo
  '1802966-5',  // Kesko
  '0195820-3',  // Outokumpu
  '0109606-2',  // Huhtamäki
  '0109823-2',  // Metso
  '0109862-6',  // Valmet
  '1080075-9',  // Orion
  '0109908-5',  // Sanoma
  '0215382-8',  // Konecranes
  '2410309-5',  // Terveystalo
  '0109150-4',  // Nokian Tyres
  // Other notable
  '0112096-0',  // SOK (S-Group)
  '0116754-8',  // Fazer
  '0109150-4',  // Finnair
  '0199920-3',  // Angry Birds (Rovio)
  '2308215-2',  // Supercell
  '0112044-8',  // Marimekko
  '0113901-0',  // Fiskars
  '0109072-3',  // Paulig
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const businessId = searchParams.get('id') || searchParams.get('businessId')
  const mode = searchParams.get('mode') || 'known' // 'known', 'search', 'oyj' (public limited)
  const query = searchParams.get('q') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-finnish-companies', async () => {
    // Single company mode
    if (businessId) {
      const company = await fetchCompany(businessId)

      if (!company) {
        return NextResponse.json({
          success: false,
          businessId,
          error: 'Could not fetch company from PRH',
          note: 'PRH API is completely FREE - no API key required!',
        }, { status: 404 })
      }

      const saved = await saveCompany(company)

      // Also get financial periods
      const financialPeriods = await getFinancialPeriods(businessId)

      return NextResponse.json({
        success: saved,
        company: {
          businessId: company.businessId,
          name: company.name,
          companyForm: company.companyForm,
          industry: company.mainBusinessLine?.description,
          address: company.address?.city,
          isActive: company.tradeRegisterStatus === '2',
        },
        financialPeriods: financialPeriods.slice(0, 5),
        source: 'PRH',
        apiNote: 'Completely FREE - no API key required!',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode
    let businessIds: string[]

    if (mode === 'search' && query) {
      businessIds = await searchCompanies({ name: query })
      businessIds = businessIds.slice(0, limit)
    } else if (mode === 'oyj') {
      // Public limited companies only
      businessIds = await searchCompanies({ companyForm: 'OYJ', page: Math.floor(offset / 100) })
      businessIds = businessIds.slice(0, limit)
    } else {
      // Default: known major companies
      businessIds = KNOWN_FINNISH_COMPANIES.slice(offset, offset + limit)
    }

    if (businessIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No companies to sync',
        mode,
        duration: Date.now() - startTime,
      })
    }

    // Rate limit: 300/min global, so we'll do 4/sec to be safe
    const rateLimiter = new RateLimiter(4)
    const results: Array<{
      businessId: string
      name?: string
      success: boolean
      error?: string
    }> = []
    let successCount = 0
    let failCount = 0

    for (const id of businessIds) {
      await rateLimiter.wait()

      try {
        const company = await fetchCompany(id)

        if (company && company.name) {
          const saved = await saveCompany(company)
          if (saved) {
            successCount++
            results.push({
              businessId: id,
              name: company.name,
              success: true
            })
          } else {
            failCount++
            results.push({ businessId: id, name: company.name, success: false, error: 'Save failed' })
          }
        } else {
          failCount++
          results.push({ businessId: id, success: false, error: 'Fetch failed' })
        }
      } catch (error) {
        failCount++
        results.push({
          businessId: id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Log sync progress
    await getSupabase().from('eu_sync_log').insert({
      source: 'PRH',
      country_code: 'FI',
      sync_type: mode.toUpperCase(),
      completed_at: new Date().toISOString(),
      status: 'COMPLETED',
      companies_synced: successCount,
      errors: failCount,
      last_offset: offset + businessIds.length,
      details: { mode, query, limit, offset }
    })

    return NextResponse.json({
      success: true,
      source: 'PRH',
      country: 'FI',
      apiNote: 'Completely FREE - NO API KEY REQUIRED!',
      rateLimit: '300 requests/minute (global)',
      summary: {
        mode,
        companiesProcessed: businessIds.length,
        successCount,
        failCount,
        duration: Date.now() - startTime,
      },
      pagination: {
        offset,
        limit,
        nextOffset: offset + businessIds.length,
      },
      results: results.slice(0, 10),
    })
  })
}
