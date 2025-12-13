/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Sync clinical trials data from ClinicalTrials.gov to Supabase
// Runs daily to keep trial data fresh

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const CLINICALTRIALS_API_BASE = 'https://clinicaltrials.gov/api/v2/studies'

interface SyncResult {
  ticker: string
  trialsFound: number
  trialsInserted: number
  catalystsCreated: number
  error?: string
}

// Parse date from ClinicalTrials.gov format
function parseDate(dateStr?: string): string | null {
  if (!dateStr) return null
  // Handle formats like "2024-06" or "2024-06-15"
  return dateStr.length === 7 ? `${dateStr}-01` : dateStr
}

// Fetch trials for a sponsor
async function fetchTrialsForSponsor(sponsor: string, pageSize: number = 100): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      'query.spons': sponsor,
      'pageSize': String(pageSize),
      'format': 'json'
    })

    const response = await fetch(`${CLINICALTRIALS_API_BASE}?${params}`, {
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) {
      console.error(`ClinicalTrials.gov API error for ${sponsor}: ${response.status}`)
      return []
    }

    const data = await response.json()
    return data.studies || []
  } catch (error) {
    console.error(`Error fetching trials for ${sponsor}:`, error)
    return []
  }
}

// Transform ClinicalTrials.gov study to our schema
function transformStudy(study: any, ticker: string) {
  const protocol = study.protocolSection
  const identification = protocol?.identificationModule
  const status = protocol?.statusModule
  const sponsorModule = protocol?.sponsorCollaboratorsModule
  const conditions = protocol?.conditionsModule
  const design = protocol?.designModule
  const interventions = protocol?.armsInterventionsModule?.interventions || []
  const locations = protocol?.contactsLocationsModule?.locations || []

  return {
    nct_id: identification?.nctId,
    ticker: ticker,
    sponsor: sponsorModule?.leadSponsor?.name || 'Unknown',
    brief_title: identification?.briefTitle || 'Untitled Study',
    official_title: identification?.officialTitle || null,
    phase: design?.phases?.[0] || null,
    overall_status: status?.overallStatus || null,
    conditions: conditions?.conditions || [],
    interventions: interventions.map((i: any) => ({
      type: i.type,
      name: i.name,
      description: i.description || null
    })),
    primary_completion_date: parseDate(status?.primaryCompletionDateStruct?.date),
    completion_date: parseDate(status?.completionDateStruct?.date),
    study_first_posted: parseDate(status?.studyFirstPostDateStruct?.date),
    last_update_posted: parseDate(status?.lastUpdatePostDateStruct?.date),
    enrollment_count: design?.enrollmentInfo?.count || null,
    enrollment_type: design?.enrollmentInfo?.type || null,
    study_type: design?.studyType || null,
    locations: locations.slice(0, 20).map((l: any) => ({
      facility: l.facility,
      city: l.city,
      state: l.state || null,
      country: l.country
    })),
    has_results: study.hasResults || false
  }
}

// Create catalyst from trial
function createCatalyst(trial: any, ticker: string, companyName: string) {
  const phase = trial.phase
  const primaryCompletionDate = trial.primary_completion_date

  if (!primaryCompletionDate) return null

  const daysUntil = Math.ceil(
    (new Date(primaryCompletionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  // Only create catalysts for trials completing in the next 2 years
  if (daysUntil > 730 || daysUntil < -30) return null

  // Determine importance
  let importance = 'MEDIUM'
  if (phase === 'PHASE3' || phase === 'PHASE4') {
    importance = 'HIGH'
  } else if (phase === 'PHASE1' || phase === 'EARLY_PHASE1') {
    importance = 'LOW'
  }

  // Get drug names
  const drugNames = (trial.interventions || [])
    .filter((i: any) => i.type === 'DRUG' || i.type === 'BIOLOGICAL')
    .map((i: any) => i.name)
    .slice(0, 3)
    .join(', ')

  const indications = (trial.conditions || []).slice(0, 2).join(', ')

  return {
    ticker,
    catalyst_type: phase === 'PHASE3' ? 'DATA_READOUT' : 'TRIAL_RESULT',
    title: trial.brief_title,
    description: `${phase || 'Clinical'} trial primary completion expected`,
    expected_date: primaryCompletionDate,
    expected_date_precision: 'MONTH',
    source_type: 'CLINICAL_TRIAL',
    source_id: trial.nct_id,
    drug_name: drugNames || null,
    indication: indications || null,
    phase: phase,
    importance,
    is_confirmed: false,
    outcome: 'PENDING'
  }
}

// Sync trials for a single company
async function syncTrialsForCompany(
  supabase: any,
  ticker: string,
  companyName: string,
  sponsorAliases: string[]
): Promise<SyncResult> {
  const result: SyncResult = {
    ticker,
    trialsFound: 0,
    trialsInserted: 0,
    catalystsCreated: 0
  }

  try {
    // Fetch trials using all sponsor aliases
    const allTrials: any[] = []
    const seenNctIds = new Set<string>()

    for (const sponsor of [companyName, ...sponsorAliases]) {
      const studies = await fetchTrialsForSponsor(sponsor, 50)

      for (const study of studies) {
        const nctId = study.protocolSection?.identificationModule?.nctId
        if (nctId && !seenNctIds.has(nctId)) {
          seenNctIds.add(nctId)
          allTrials.push(transformStudy(study, ticker))
        }
      }

      // Rate limit between sponsor queries
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    result.trialsFound = allTrials.length

    if (allTrials.length === 0) {
      return result
    }

    // Upsert trials
    for (const trial of allTrials) {
      const { error: trialError } = await supabase
        .from('clinical_trials')
        .upsert(trial, { onConflict: 'nct_id' })

      if (trialError) {
        console.error(`Error upserting trial ${trial.nct_id}:`, trialError.message)
      } else {
        result.trialsInserted++
      }
    }

    // Create catalysts from trials with upcoming completion dates
    const catalysts = allTrials
      .map(t => createCatalyst(t, ticker, companyName))
      .filter(Boolean)

    for (const catalyst of catalysts) {
      // Check if catalyst already exists
      const { data: existing } = await supabase
        .from('biotech_catalysts')
        .select('id')
        .eq('source_id', catalyst!.source_id)
        .single()

      if (!existing) {
        const { error: catalystError } = await supabase
          .from('biotech_catalysts')
          .insert(catalyst)

        if (catalystError) {
          console.error(`Error inserting catalyst:`, catalystError.message)
        } else {
          result.catalystsCreated++
        }
      }
    }

    return result
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error'
    return result
  }
}

export async function GET(request: NextRequest) {
  // Check for cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('Clinical trials sync called without CRON_SECRET')
  }

  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const results: SyncResult[] = []

  try {
    // Get companies to sync
    let companies: { ticker: string; company_name: string; sponsor_aliases: string[] }[]

    if (ticker) {
      // Sync single company
      const { data, error } = await supabase
        .from('biotech_company_mapping')
        .select('ticker, company_name, sponsor_aliases')
        .eq('ticker', ticker.toUpperCase())
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Company not found in mapping' }, { status: 404 })
      }

      companies = [data]
    } else {
      // Get all biotech companies
      const { data, error } = await supabase
        .from('biotech_company_mapping')
        .select('ticker, company_name, sponsor_aliases')
        .eq('is_biotech', true)
        .order('market_cap_tier', { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
      }

      companies = data || []
    }

    console.log(`Syncing clinical trials for ${companies.length} companies...`)

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i]

      // Add delay between companies to respect rate limits
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      console.log(`Syncing ${company.ticker} (${company.company_name})...`)

      const result = await syncTrialsForCompany(
        supabase,
        company.ticker,
        company.company_name,
        company.sponsor_aliases || []
      )

      results.push(result)
      console.log(`  Found ${result.trialsFound} trials, inserted ${result.trialsInserted}, created ${result.catalystsCreated} catalysts`)
    }

    const totalTrials = results.reduce((sum, r) => sum + r.trialsInserted, 0)
    const totalCatalysts = results.reduce((sum, r) => sum + r.catalystsCreated, 0)
    const errors = results.filter(r => r.error)

    return NextResponse.json({
      success: true,
      summary: {
        companiesProcessed: companies.length,
        totalTrialsInserted: totalTrials,
        totalCatalystsCreated: totalCatalysts,
        errors: errors.length
      },
      results
    })

  } catch (error) {
    console.error('Clinical trials sync error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
