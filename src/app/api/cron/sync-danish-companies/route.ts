import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { withCronLogging, RateLimiter } from '@/lib/cron-utils'
import { logger } from '@/lib/logger'

// Sync Danish Companies from CVR Register (FREE!)
// Financials endpoint: NO AUTH REQUIRED - completely open!
// Company search: Needs free email registration (cvrselvbetjening@erst.dk)
// API: https://distribution.virk.dk (Elasticsearch-based)
// 2.2+ million Danish companies

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Danish CVR credentials (optional - financials work without auth!)
const DANISH_CVR_USER = process.env.DANISH_CVR_USER || ''
const DANISH_CVR_PASS = process.env.DANISH_CVR_PASS || ''

// API Endpoints
const CVR_FINANCIALS_ENDPOINT = 'http://distribution.virk.dk/offentliggoerelser/_search'
const CVR_COMPANY_ENDPOINT = 'http://distribution.virk.dk/cvr-permanent/virksomhed/_search'

let supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  }
  return supabase
}

interface DanishCompany {
  cvrNumber: string
  name: string
  legalForm?: string
  status?: string
  registrationDate?: string
  address?: {
    street?: string
    postalCode?: string
    city?: string
    municipality?: string
  }
  industryCodes?: Array<{ code: string; description: string }>
  employees?: string
}

interface DanishFinancials {
  cvrNumber: string
  fiscalYear: number
  reportDate: string
  currency: string
  revenue?: number
  grossProfit?: number
  operatingProfit?: number
  profitBeforeTax?: number
  netIncome?: number
  totalAssets?: number
  equity?: number
  totalLiabilities?: number
}

// Fetch company from CVR (requires auth)
async function fetchCompany(cvrNumber: string): Promise<DanishCompany | null> {
  if (!DANISH_CVR_USER || !DANISH_CVR_PASS) {
    logger.info('Danish CVR credentials not configured - using financials-only mode')
    return null
  }

  try {
    const auth = Buffer.from(`${DANISH_CVR_USER}:${DANISH_CVR_PASS}`).toString('base64')

    const response = await fetch(CVR_COMPANY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: {
          term: { 'Vrvirksomhed.cvrNummer': cvrNumber }
        }
      })
    })

    if (!response.ok) {
      logger.warn('CVR API returned error', { status: response.status, cvrNumber })
      return null
    }

    const data = await response.json()
    const hit = data.hits?.hits?.[0]?._source?.Vrvirksomhed

    if (!hit) return null

    const metadata = hit.virksomhedMetadata || {}
    const address = metadata.nyesteBeliggenhedsadresse || {}

    return {
      cvrNumber: hit.cvrNummer?.toString(),
      name: metadata.nyesteNavn?.navn,
      legalForm: metadata.nyesteVirksomhedsform?.langBeskrivelse,
      status: metadata.sammensatStatus,
      registrationDate: hit.livsforloeb?.[0]?.periode?.gyldigFra,
      address: {
        street: [address.vejnavn, address.husnummerFra].filter(Boolean).join(' '),
        postalCode: address.postnummer?.toString(),
        city: address.postdistrikt,
        municipality: address.kommune?.kommuneNavn,
      },
      industryCodes: metadata.nyesteHovedbranche ? [{
        code: metadata.nyesteHovedbranche.branchekode,
        description: metadata.nyesteHovedbranche.branchetekst
      }] : undefined,
      employees: metadata.nyesteKvartalsbeskaeftigelse?.intervalKodeAntalAnsatte,
    }
  } catch (error) {
    logger.error('Error fetching Danish company', { cvrNumber, error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// Fetch financials from CVR (NO AUTH REQUIRED!)
async function fetchFinancials(cvrNumber: string): Promise<DanishFinancials | null> {
  try {
    // This endpoint is completely open - no auth needed!
    const response = await fetch(
      `${CVR_FINANCIALS_ENDPOINT}?q=cvrNummer:${cvrNumber}&size=1&sort=regnskab.regnskabsperiode.slutDato:desc`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    )

    if (!response.ok) {
      logger.warn('CVR financials returned error', { status: response.status, cvrNumber })
      return null
    }

    const data = await response.json()
    const hit = data.hits?.hits?.[0]?._source

    if (!hit || !hit.regnskab) return null

    const regnskab = hit.regnskab
    const period = regnskab.regnskabsperiode || {}

    // Parse XBRL data - Danish reports use Danish GAAP taxonomy
    const findValue = (arr: any[], concept: string): number | undefined => {
      const item = arr?.find((i: any) => i.kontonavn?.toLowerCase().includes(concept))
      return item?.vaerdi ? parseFloat(item.vaerdi) : undefined
    }

    return {
      cvrNumber: hit.cvrNummer?.toString(),
      fiscalYear: parseInt(period.slutDato?.split('-')[0]) || new Date().getFullYear(),
      reportDate: period.slutDato,
      currency: regnskab.valuta || 'DKK',
      revenue: findValue(regnskab.resultatregnskab, 'omsætning') ||
               findValue(regnskab.resultatregnskab, 'nettoomsætning'),
      grossProfit: findValue(regnskab.resultatregnskab, 'bruttofortjeneste'),
      operatingProfit: findValue(regnskab.resultatregnskab, 'driftsresultat'),
      profitBeforeTax: findValue(regnskab.resultatregnskab, 'resultat før skat'),
      netIncome: findValue(regnskab.resultatregnskab, 'årets resultat'),
      totalAssets: findValue(regnskab.balance, 'aktiver i alt'),
      equity: findValue(regnskab.balance, 'egenkapital'),
      totalLiabilities: findValue(regnskab.balance, 'gæld'),
    }
  } catch (error) {
    logger.error('Error fetching Danish financials', { cvrNumber, error: error instanceof Error ? error.message : 'Unknown' })
    return null
  }
}

// Save company to Supabase
async function saveCompany(company: DanishCompany): Promise<boolean> {
  const legalFormMap: Record<string, string> = {
    'Aktieselskab': 'A/S',
    'Anpartsselskab': 'ApS',
    'Interessentskab': 'I/S',
    'Kommanditselskab': 'K/S',
    'Enkeltmandsvirksomhed': 'Enkeltmand',
    'Andelsselskab': 'A.m.b.A.',
  }

  const record = {
    org_number: company.cvrNumber,
    country_code: 'DK',
    name: company.name,
    legal_form: legalFormMap[company.legalForm || ''] || company.legalForm,
    industry_code: company.industryCodes?.[0]?.code,
    industry_description: company.industryCodes?.[0]?.description,
    address_street: company.address?.street,
    address_city: company.address?.city,
    address_postal_code: company.address?.postalCode,
    address_country: 'Denmark',
    founded_year: company.registrationDate ? parseInt(company.registrationDate.split('-')[0]) : undefined,
    is_active: company.status === 'NORMAL',
    source: 'CVR',
    source_url: `https://datacvr.virk.dk/data/visenhed?enhedstype=virksomhed&id=${company.cvrNumber}`,
    updated_at: new Date().toISOString(),
  }

  const { error } = await getSupabase()
    .from('eu_companies')
    .upsert(record, {
      onConflict: 'country_code,org_number',
      ignoreDuplicates: false
    })

  if (error) {
    logger.error('Failed to save Danish company', { cvrNumber: company.cvrNumber, error: error.message })
    return false
  }

  return true
}

// Save financials to EU tables
async function saveFinancials(financials: DanishFinancials): Promise<{ income: boolean; balance: boolean }> {
  const reportPeriod = financials.reportDate || `${financials.fiscalYear}-12-31`

  // Save Income Statement
  const incomeRecord = {
    org_number: financials.cvrNumber,
    country_code: 'DK',
    report_period: reportPeriod,
    fiscal_year: financials.fiscalYear,
    period: 'annual',
    currency: financials.currency,
    revenue: financials.revenue,
    gross_profit: financials.grossProfit,
    operating_profit: financials.operatingProfit,
    profit_before_tax: financials.profitBeforeTax,
    profit_for_the_year: financials.netIncome,
    source: 'CVR',
    updated_at: new Date().toISOString(),
  }

  const { error: incomeError } = await getSupabase()
    .from('eu_income_statements')
    .upsert(incomeRecord, {
      onConflict: 'org_number,country_code,report_period,period',
      ignoreDuplicates: false
    })

  // Save Balance Sheet
  const balanceRecord = {
    org_number: financials.cvrNumber,
    country_code: 'DK',
    report_period: reportPeriod,
    fiscal_year: financials.fiscalYear,
    period: 'annual',
    currency: financials.currency,
    total_assets: financials.totalAssets,
    total_equity: financials.equity,
    total_liabilities: financials.totalLiabilities,
    source: 'CVR',
    updated_at: new Date().toISOString(),
  }

  const { error: balanceError } = await getSupabase()
    .from('eu_balance_sheets')
    .upsert(balanceRecord, {
      onConflict: 'org_number,country_code,report_period,period',
      ignoreDuplicates: false
    })

  if (incomeError) logger.error('Income save error', { cvrNumber: financials.cvrNumber, error: incomeError.message })
  if (balanceError) logger.error('Balance save error', { cvrNumber: financials.cvrNumber, error: balanceError.message })

  return {
    income: !incomeError,
    balance: !balanceError
  }
}

// Major Danish companies (C25 index + notable)
const KNOWN_DANISH_COMPANIES = [
  // C25 Index - Major listed companies
  '61126228', // Novo Nordisk
  '21256882', // A.P. Møller - Mærsk
  '28505116', // Vestas Wind Systems
  '26041645', // Danske Bank
  '15313714', // Carlsberg
  '33258595', // DSV Panalpina
  '33369939', // Coloplast
  '26042783', // Pandora
  '10040466', // Novozymes
  '48233511', // Ørsted
  '56759814', // Chr. Hansen
  '13178756', // ROCKWOOL International
  '36213728', // GN Store Nord
  '15063241', // Tryg
  '31199256', // William Demant
  '25578485', // SimCorp
  '20991396', // ISS
  '56765619', // FLSmidth
  '14712903', // Netcompany
  // Other notable
  '17471740', // LEGO
  '10403782', // Arla Foods
  '14213119', // Bang & Olufsen
  '10089813', // Bestseller
  '33372912', // Ecco
  '10403782', // Copenhagen Airports
]

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cvrNumber = searchParams.get('cvr')
  const mode = searchParams.get('mode') || 'known' // 'known', 'financials'
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  const startTime = Date.now()
  const hasAuth = !!(DANISH_CVR_USER && DANISH_CVR_PASS)

  return withCronLogging('sync-danish-companies', async () => {
    // Single company mode
    if (cvrNumber) {
      const financials = await fetchFinancials(cvrNumber)

      if (!financials) {
        return NextResponse.json({
          success: false,
          cvrNumber,
          error: 'Could not fetch financials from CVR',
          note: 'Financials endpoint is open - no auth required!',
        }, { status: 404 })
      }

      const saved = await saveFinancials(financials)

      // Also try to save company if we have auth
      let company: DanishCompany | null = null
      if (hasAuth) {
        company = await fetchCompany(cvrNumber)
        if (company) await saveCompany(company)
      }

      return NextResponse.json({
        success: saved.income || saved.balance,
        cvrNumber: financials.cvrNumber,
        fiscalYear: financials.fiscalYear,
        financials: {
          revenue: financials.revenue,
          operatingProfit: financials.operatingProfit,
          netIncome: financials.netIncome,
          totalAssets: financials.totalAssets,
          equity: financials.equity,
        },
        company: company ? { name: company.name, status: company.status } : null,
        saved,
        source: 'CVR',
        authNote: hasAuth ? 'Full company data available' : 'Financials only (no auth)',
        duration: Date.now() - startTime,
      })
    }

    // Batch mode - fetch financials for known companies
    const cvrNumbers = KNOWN_DANISH_COMPANIES.slice(offset, offset + limit)

    if (cvrNumbers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No companies to sync',
        mode,
        duration: Date.now() - startTime,
      })
    }

    // Rate limit: be respectful
    const rateLimiter = new RateLimiter(2)
    const results: Array<{
      cvrNumber: string
      name?: string
      year?: number
      success: boolean
      error?: string
    }> = []
    let successCount = 0
    let failCount = 0
    let incomeCount = 0
    let balanceCount = 0

    for (const cvr of cvrNumbers) {
      await rateLimiter.wait()

      try {
        const financials = await fetchFinancials(cvr)

        if (financials) {
          const saved = await saveFinancials(financials)

          if (saved.income || saved.balance) {
            successCount++
            if (saved.income) incomeCount++
            if (saved.balance) balanceCount++
            results.push({
              cvrNumber: cvr,
              year: financials.fiscalYear,
              success: true
            })
          } else {
            failCount++
            results.push({ cvrNumber: cvr, success: false, error: 'Save failed' })
          }
        } else {
          results.push({ cvrNumber: cvr, success: false, error: 'No financials available' })
          failCount++
        }
      } catch (error) {
        failCount++
        results.push({
          cvrNumber: cvr,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Log sync
    await getSupabase().from('eu_sync_log').insert({
      source: 'CVR',
      country_code: 'DK',
      sync_type: mode.toUpperCase(),
      completed_at: new Date().toISOString(),
      status: 'COMPLETED',
      financials_synced: successCount,
      errors: failCount,
      last_offset: offset + cvrNumbers.length,
      details: { mode, hasAuth, incomeStatements: incomeCount, balanceSheets: balanceCount }
    })

    return NextResponse.json({
      success: true,
      source: 'CVR',
      country: 'DK',
      apiNote: 'Financials endpoint is FREE - no API key required!',
      authStatus: hasAuth ? 'Full access with credentials' : 'Financials-only mode (no auth)',
      setupInstructions: hasAuth ? null : {
        step1: 'Email cvrselvbetjening@erst.dk to request CVR access',
        step2: 'Sign the usage agreement',
        step3: 'Add DANISH_CVR_USER and DANISH_CVR_PASS to environment',
        note: 'Financials work without registration!'
      },
      summary: {
        mode,
        companiesProcessed: cvrNumbers.length,
        successCount,
        failCount,
        incomeStatementsSaved: incomeCount,
        balanceSheetsSaved: balanceCount,
        duration: Date.now() - startTime,
      },
      pagination: {
        offset,
        limit,
        nextOffset: offset + cvrNumbers.length,
      },
      results: results.slice(0, 10),
    })
  })
}
