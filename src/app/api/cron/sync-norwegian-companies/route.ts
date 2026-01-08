import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'

// Sync Norwegian Companies from Brreg (FREE - No API key required!)
// Brønnøysund Register Centre - Official Norwegian business registry
// API: https://data.brreg.no/enhetsregisteret/api/docs/index.html
// Contains 1.1+ million Norwegian companies

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const API_BASE = 'https://data.brreg.no/enhetsregisteret/api'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface NorwegianCompany {
  orgNumber: string
  name: string
  orgForm?: string // AS, ASA, ENK, ANS, etc.
  registrationDate?: string
  employees?: number
  website?: string
  businessAddress?: {
    street?: string
    postalCode?: string
    city?: string
    country?: string
  }
  postalAddress?: {
    street?: string
    postalCode?: string
    city?: string
  }
  industryCodes?: Array<{
    code: string
    description: string
  }>
  isRegisteredInVAT?: boolean
  isRegisteredAsEmployer?: boolean
  isInLiquidation?: boolean
  isUnderBankruptcy?: boolean
}

// Make request to Brreg API (no auth required!)
async function brregRequest(endpoint: string): Promise<any | null> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (response.status === 429) {
      console.log('Brreg rate limited')
      return { rateLimited: true }
    }

    if (!response.ok) {
      console.log(`Brreg API returned ${response.status} for ${endpoint}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Brreg API request failed for ${endpoint}:`, error)
    return null
  }
}

// Get single company (enhet)
async function getCompany(orgNumber: string): Promise<NorwegianCompany | null> {
  // Norwegian org numbers are 9 digits
  const cleanOrg = orgNumber.replace(/\s/g, '')
  if (cleanOrg.length !== 9) return null

  const data = await brregRequest(`/enheter/${cleanOrg}`)
  if (!data || data.rateLimited) return null

  return {
    orgNumber: data.organisasjonsnummer,
    name: data.navn,
    orgForm: data.organisasjonsform?.kode,
    registrationDate: data.registreringsdatoEnhetsregisteret,
    employees: data.antallAnsatte,
    website: data.hjemmeside,
    businessAddress: data.forretningsadresse ? {
      street: [data.forretningsadresse.adresse?.[0], data.forretningsadresse.adresse?.[1]].filter(Boolean).join(', '),
      postalCode: data.forretningsadresse.postnummer,
      city: data.forretningsadresse.poststed,
      country: data.forretningsadresse.land,
    } : undefined,
    postalAddress: data.postadresse ? {
      street: data.postadresse.adresse?.[0],
      postalCode: data.postadresse.postnummer,
      city: data.postadresse.poststed,
    } : undefined,
    industryCodes: data.naeringskode1 ? [{
      code: data.naeringskode1.kode,
      description: data.naeringskode1.beskrivelse,
    }] : undefined,
    isRegisteredInVAT: data.registrertIMvaregisteret,
    isRegisteredAsEmployer: data.registrertIForetaksregisteret,
    isInLiquidation: data.underAvvikling,
    isUnderBankruptcy: data.konkurs,
  }
}

// Search companies
async function searchCompanies(params: {
  query?: string
  orgForm?: string // AS, ASA, etc.
  naeringskode?: string // Industry code
  kommunenummer?: string // Municipality
  size?: number
  page?: number
}): Promise<string[]> {
  const queryParams = new URLSearchParams()

  if (params.query) queryParams.append('navn', params.query)
  if (params.orgForm) queryParams.append('organisasjonsform', params.orgForm)
  if (params.naeringskode) queryParams.append('naeringskode', params.naeringskode)
  if (params.kommunenummer) queryParams.append('kommunenummer', params.kommunenummer)

  queryParams.append('size', String(params.size || 20))
  queryParams.append('page', String(params.page || 0))

  const data = await brregRequest(`/enheter?${queryParams.toString()}`)
  if (!data || data.rateLimited || !data._embedded?.enheter) return []

  return data._embedded.enheter.map((e: any) => e.organisasjonsnummer)
}

// Get recently updated companies
async function getRecentlyUpdated(size: number = 100): Promise<string[]> {
  const data = await brregRequest(`/oppdateringer/enheter?size=${size}`)
  if (!data || data.rateLimited || !data._embedded?.oppdaterteEnheter) return []

  return data._embedded.oppdaterteEnheter.map((e: any) => e.organisasjonsnummer)
}

// Save company to Supabase
async function saveNorwegianCompany(company: NorwegianCompany): Promise<boolean> {
  // Map Norwegian org forms
  const orgFormMap: Record<string, string> = {
    'AS': 'AS (Aksjeselskap)',
    'ASA': 'ASA (Allmennaksjeselskap)',
    'ENK': 'Enkeltpersonforetak',
    'ANS': 'ANS (Ansvarlig selskap)',
    'DA': 'DA (Selskap med delt ansvar)',
    'NUF': 'NUF (Norskregistrert utenlandsk foretak)',
    'SA': 'SA (Samvirkeforetak)',
    'STI': 'Stiftelse',
  }

  const address = company.businessAddress || company.postalAddress

  const record = {
    org_number: company.orgNumber,
    country_code: 'NO',
    name: company.name,
    legal_form: orgFormMap[company.orgForm || ''] || company.orgForm,
    industry_code: company.industryCodes?.[0]?.code,
    industry_description: company.industryCodes?.[0]?.description,
    address_street: address?.street,
    address_city: address?.city,
    address_postal_code: address?.postalCode,
    address_country: 'Norway',
    website: company.website,
    employees: company.employees,
    founded_year: company.registrationDate ? parseInt(company.registrationDate.split('-')[0]) : undefined,
    is_active: !company.isInLiquidation && !company.isUnderBankruptcy,
    is_listed: company.orgForm === 'ASA', // ASA = public limited company (often listed on Oslo Børs)
    source: 'BRREG',
    source_url: `https://data.brreg.no/enhetsregisteret/oppslag/enheter/${company.orgNumber}`,
    updated_at: new Date().toISOString(),
  }

  const { error } = await getSupabase()
    .from('eu_companies')
    .upsert(record, {
      onConflict: 'country_code,org_number',
      ignoreDuplicates: false
    })

  if (error) {
    console.error(`Failed to save Norwegian company ${company.orgNumber}:`, error)
    return false
  }

  return true
}

// Major Norwegian company org numbers (Oslo Børs + notable)
const KNOWN_NORWEGIAN_COMPANIES = [
  // Oslo Børs - Major listed companies
  '923609016', // Equinor (Statoil)
  '910747711', // DNB
  '976389387', // Telenor
  '985985325', // Norsk Hydro
  '911382008', // Orkla
  '966748085', // Yara International
  '923470298', // Mowi (Marine Harvest)
  '991681086', // Aker BP
  '977041545', // Kongsberg Gruppen
  '960216687', // Storebrand
  '982463718', // Subsea 7
  '988375218', // Schibsted
  '983373804', // TGS-NOPEC
  '812656272', // SalMar
  '980007460', // Veidekke
  '935649107', // Aker Solutions
  '986386661', // SpareBank 1 SR-Bank
  '989584022', // Grieg Seafood
  '985224323', // BW Offshore
  '914778271', // Norwegian Air Shuttle
  // Other notable
  '979191138', // Posten Norge
  '937620448', // NSB (Vy)
  '940192226', // NRK
  '921303808', // Statkraft
  '985163327', // Rema 1000
  '965920358', // Coop Norge
  '959459042', // Kiwi (NorgesGruppen)
  '925596262', // Vipps
  '997891345', // Kahoot!
  '916058309', // AutoStore
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const orgNumber = searchParams.get('org')
  const mode = searchParams.get('mode') || 'known' // 'known', 'search', 'recent', 'as' (only AS companies)
  const query = searchParams.get('q') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()

  return withCronLogging('sync-norwegian-companies', async () => {
    // Single company mode
    if (orgNumber) {
      const company = await getCompany(orgNumber)

      if (!company) {
        return NextResponse.json({
          success: false,
          orgNumber,
          error: 'Could not fetch company from Brreg',
        }, { status: 404 })
      }

      const saved = await saveNorwegianCompany(company)

      return NextResponse.json({
        success: saved,
        company: {
          orgNumber: company.orgNumber,
          name: company.name,
          orgForm: company.orgForm,
          employees: company.employees,
          industry: company.industryCodes?.[0]?.description,
        },
        source: 'BRREG',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode
    let orgNumbers: string[]

    if (mode === 'search' && query) {
      orgNumbers = await searchCompanies({ query, size: limit, page: Math.floor(offset / limit) })
    } else if (mode === 'recent') {
      orgNumbers = await getRecentlyUpdated(limit)
    } else if (mode === 'as') {
      // Only AS (Aksjeselskap) companies - private limited companies ~370K
      orgNumbers = await searchCompanies({ orgForm: 'AS', size: limit, page: Math.floor(offset / limit) })
    } else if (mode === 'asa') {
      // Only ASA (Allmennaksjeselskap) companies - public limited (usually listed) ~200
      orgNumbers = await searchCompanies({ orgForm: 'ASA', size: limit, page: Math.floor(offset / limit) })
    } else if (mode === 'enk') {
      // Enkeltpersonforetak - sole proprietorships ~500K
      orgNumbers = await searchCompanies({ orgForm: 'ENK', size: limit, page: Math.floor(offset / limit) })
    } else if (mode === 'nuf') {
      // NUF - Norwegian registered foreign enterprises ~30K
      orgNumbers = await searchCompanies({ orgForm: 'NUF', size: limit, page: Math.floor(offset / limit) })
    } else if (mode === 'sa') {
      // SA - Cooperative societies ~5K
      orgNumbers = await searchCompanies({ orgForm: 'SA', size: limit, page: Math.floor(offset / limit) })
    } else if (mode === 'da') {
      // DA - Shared liability company ~10K
      orgNumbers = await searchCompanies({ orgForm: 'DA', size: limit, page: Math.floor(offset / limit) })
    } else if (mode === 'ans') {
      // ANS - General partnership ~15K
      orgNumbers = await searchCompanies({ orgForm: 'ANS', size: limit, page: Math.floor(offset / limit) })
    } else if (mode === 'all') {
      // All company types - cycle through based on offset to get diverse coverage
      const orgForms = ['AS', 'ENK', 'NUF', 'ANS', 'DA', 'SA', 'ASA']
      const formIndex = Math.floor(offset / 10000) % orgForms.length
      const innerPage = Math.floor((offset % 10000) / limit)
      orgNumbers = await searchCompanies({ orgForm: orgForms[formIndex], size: limit, page: innerPage })
    } else {
      // Default: known major companies
      orgNumbers = KNOWN_NORWEGIAN_COMPANIES.slice(offset, offset + limit)
    }

    if (orgNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No companies to sync',
        mode,
        duration: Date.now() - startTime,
      })
    }

    // Brreg is generous but let's be nice (3 req/sec)
    const rateLimiter = new RateLimiter(3)
    const results: Array<{ orgNumber: string; name?: string; success: boolean; error?: string }> = []
    let successCount = 0
    let failCount = 0

    for (const org of orgNumbers) {
      await rateLimiter.wait()

      try {
        const company = await getCompany(org)

        if (company && company.name) {
          const saved = await saveNorwegianCompany(company)
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

    // Log sync progress
    await getSupabase().from('eu_sync_log').insert({
      source: 'BRREG',
      country_code: 'NO',
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
      source: 'BRREG',
      country: 'NO',
      apiNote: 'FREE - No API key required!',
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
