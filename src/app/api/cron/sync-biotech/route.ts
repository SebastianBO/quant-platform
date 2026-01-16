import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/**
 * Biotech Sync Cron Job
 *
 * Runs daily to:
 * 1. Discover new biotech companies (incremental)
 * 2. Sync clinical trials for existing companies (rotating batches)
 * 3. Update catalyst dates
 *
 * Designed to handle thousands of companies over time
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const CLINICALTRIALS_API = 'https://clinicaltrials.gov/api/v2/studies'

interface SyncState {
  lastDiscoveryOffset: number
  lastTrialSyncBatch: number
  totalCompanies: number
  companiesSynced: number
  lastRunAt: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SyncStateData = {
  last_discovery_offset?: number
  last_trial_sync_batch?: number
  total_companies?: number
  companies_synced?: number
  last_run_at?: string
}

// Get or create sync state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSyncState(supabase: ReturnType<typeof createClient<any>>): Promise<SyncState> {
  const { data } = await supabase
    .from('sync_state')
    .select('*')
    .eq('sync_type', 'biotech')
    .single()

  if (data) {
    const d = data as SyncStateData
    return {
      lastDiscoveryOffset: d.last_discovery_offset || 0,
      lastTrialSyncBatch: d.last_trial_sync_batch || 0,
      totalCompanies: d.total_companies || 0,
      companiesSynced: d.companies_synced || 0,
      lastRunAt: d.last_run_at || ''
    }
  }

  // Create initial state
  await supabase.from('sync_state').insert({
    sync_type: 'biotech',
    last_discovery_offset: 0,
    last_trial_sync_batch: 0,
    total_companies: 0,
    companies_synced: 0,
    last_run_at: new Date().toISOString()
  })

  return {
    lastDiscoveryOffset: 0,
    lastTrialSyncBatch: 0,
    totalCompanies: 0,
    companiesSynced: 0,
    lastRunAt: ''
  }
}

// Update sync state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateSyncState(
  supabase: ReturnType<typeof createClient<any>>,
  updates: Partial<SyncState>
) {
  await supabase.from('sync_state').update({
    ...updates,
    last_run_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('sync_type', 'biotech')
}

// Fetch trials for a company
async function fetchTrialsForCompany(
  sponsor: string,
  aliases: string[]
): Promise<{
  nctId: string
  title: string
  phase: string | null
  status: string
  completionDate: string | null
}[]> {
  const trials: {
    nctId: string
    title: string
    phase: string | null
    status: string
    completionDate: string | null
  }[] = []
  const seenNctIds = new Set<string>()

  for (const searchTerm of [sponsor, ...aliases].slice(0, 2)) {
    try {
      const response = await fetch(
        `${CLINICALTRIALS_API}?query.spons=${encodeURIComponent(searchTerm)}&pageSize=100&format=json`,
        { next: { revalidate: 0 } }
      )

      if (!response.ok) continue

      const data = await response.json()

      for (const study of data.studies || []) {
        const protocol = study.protocolSection
        const nctId = protocol?.identificationModule?.nctId
        if (!nctId || seenNctIds.has(nctId)) continue
        seenNctIds.add(nctId)

        const phases = protocol?.designModule?.phases || []
        let completionDate = protocol?.statusModule?.primaryCompletionDateStruct?.date || null
        if (completionDate && completionDate.length === 7) {
          completionDate = `${completionDate}-01`
        }

        trials.push({
          nctId,
          title: protocol?.identificationModule?.briefTitle || '',
          phase: phases[0] || null,
          status: protocol?.statusModule?.overallStatus || '',
          completionDate
        })
      }

      // Found trials, don't need to try more aliases
      if (trials.length > 0) break

    } catch (error) {
      logger.error('Error fetching trials', { searchTerm, error: error instanceof Error ? error.message : 'Unknown' })
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return trials
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Biotech sync called without CRON_SECRET')
  }

  const searchParams = request.nextUrl.searchParams
  const batchSize = parseInt(searchParams.get('batch') || '20')
  const mode = searchParams.get('mode') || 'full' // full, trials-only, discover-only

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const results = {
    discovered: 0,
    trialsUpdated: 0,
    catalystsCreated: 0,
    errors: [] as string[]
  }

  try {
    const syncState = await getSyncState(supabase)

    // Phase 1: Get companies to sync (rotating through all)
    const { count: totalCompanies } = await supabase
      .from('biotech_company_mapping')
      .select('*', { count: 'exact', head: true })

    const total = totalCompanies || 0

    // Calculate which batch to sync (rotating through all companies)
    const batchStart = syncState.lastTrialSyncBatch % Math.max(1, Math.ceil(total / batchSize))
    const offset = batchStart * batchSize

    logger.info('Syncing biotech batch', { batch: batchStart + 1, totalBatches: Math.ceil(total / batchSize), offset })

    // Get batch of companies
    const { data: companies } = await supabase
      .from('biotech_company_mapping')
      .select('ticker, company_name, sponsor_aliases')
      .range(offset, offset + batchSize - 1)
      .order('ticker')

    if (!companies || companies.length === 0) {
      // Reset to beginning
      await updateSyncState(supabase, { lastTrialSyncBatch: 0 })
      return NextResponse.json({
        success: true,
        message: 'No companies in batch, reset to beginning',
        results
      })
    }

    // Phase 2: Sync trials for each company
    if (mode === 'full' || mode === 'trials-only') {
      for (const company of companies) {
        try {
          const trials = await fetchTrialsForCompany(
            company.company_name,
            company.sponsor_aliases || []
          )

          // Upsert trials
          for (const trial of trials) {
            const conditions: string[] = []
            const interventions: { type: string; name: string }[] = []

            await supabase.from('clinical_trials').upsert({
              nct_id: trial.nctId,
              ticker: company.ticker,
              sponsor: company.company_name,
              brief_title: trial.title,
              phase: trial.phase,
              overall_status: trial.status,
              primary_completion_date: trial.completionDate,
              conditions,
              interventions,
              updated_at: new Date().toISOString()
            }, { onConflict: 'nct_id' })

            results.trialsUpdated++
          }

          // Create catalysts for Phase 3 trials with upcoming completion
          const now = new Date()
          const phase3Upcoming = trials.filter(t =>
            t.phase === 'PHASE3' &&
            t.completionDate &&
            new Date(t.completionDate) > now
          )

          for (const trial of phase3Upcoming) {
            const { data: existing } = await supabase
              .from('biotech_catalysts')
              .select('id')
              .eq('source_id', trial.nctId)
              .single()

            if (!existing) {
              await supabase.from('biotech_catalysts').insert({
                ticker: company.ticker,
                catalyst_type: 'DATA_READOUT',
                title: trial.title,
                description: `Phase 3 trial primary completion`,
                expected_date: trial.completionDate,
                expected_date_precision: 'MONTH',
                source_type: 'CLINICAL_TRIAL',
                source_id: trial.nctId,
                phase: 'PHASE3',
                importance: 'HIGH',
                outcome: 'PENDING'
              })
              results.catalystsCreated++
            }
          }

        } catch (error) {
          results.errors.push(`${company.ticker}: ${error}`)
        }

        // Rate limit between companies
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Update sync state
    await updateSyncState(supabase, {
      lastTrialSyncBatch: batchStart + 1,
      totalCompanies: total,
      companiesSynced: Math.min(offset + companies.length, total)
    })

    // Log sync
    await supabase.from('sync_logs').insert({
      sync_type: 'biotech-trials',
      status: results.errors.length === 0 ? 'success' : 'partial',
      records_processed: results.trialsUpdated,
      error_message: results.errors.length > 0 ? results.errors.join('; ') : null,
      completed_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      batch: batchStart + 1,
      totalBatches: Math.ceil(total / batchSize),
      companiesInBatch: companies.length,
      totalCompanies: total,
      results,
      nextRun: `Batch ${(batchStart + 2) % Math.ceil(total / batchSize) || 1}`
    })

  } catch (error) {
    logger.error('Biotech sync error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 })
  }
}
