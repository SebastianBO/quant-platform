import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autoMapBiotechCompany, similarityScore } from '@/lib/biotech-mapper'

// ClinicalTrials.gov API v2 Integration
// Free API, no key required, ~50 requests/minute rate limit
// Uses smart biotech mapper for accurate company-to-sponsor matching

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const CLINICALTRIALS_API_BASE = 'https://clinicaltrials.gov/api/v2/studies'

interface ClinicalTrialResponse {
  studies: ClinicalTrialStudy[]
  nextPageToken?: string
}

interface ClinicalTrialStudy {
  protocolSection: {
    identificationModule: {
      nctId: string
      briefTitle: string
      officialTitle?: string
    }
    statusModule: {
      overallStatus: string
      startDateStruct?: { date: string }
      primaryCompletionDateStruct?: { date: string; type?: string }
      completionDateStruct?: { date: string; type?: string }
      studyFirstPostDateStruct?: { date: string }
      lastUpdatePostDateStruct?: { date: string }
    }
    sponsorCollaboratorsModule: {
      leadSponsor: {
        name: string
        class: string
      }
      collaborators?: { name: string; class: string }[]
    }
    conditionsModule?: {
      conditions: string[]
    }
    designModule?: {
      studyType: string
      phases?: string[]
      enrollmentInfo?: { count: number; type: string }
    }
    armsInterventionsModule?: {
      interventions?: {
        type: string
        name: string
        description?: string
      }[]
    }
    contactsLocationsModule?: {
      locations?: {
        facility: string
        city: string
        state?: string
        country: string
      }[]
    }
  }
  hasResults: boolean
}

// Fetch trials from ClinicalTrials.gov API
async function fetchTrialsFromAPI(params: {
  sponsor?: string
  condition?: string
  intervention?: string
  phase?: string
  status?: string
  pageSize?: number
  pageToken?: string
}): Promise<ClinicalTrialResponse> {
  const searchParams = new URLSearchParams()

  if (params.sponsor) {
    searchParams.set('query.spons', params.sponsor)
  }
  if (params.condition) {
    searchParams.set('query.cond', params.condition)
  }
  if (params.intervention) {
    searchParams.set('query.intr', params.intervention)
  }
  if (params.phase) {
    searchParams.set('filter.phase', params.phase)
  }
  if (params.status) {
    searchParams.set('filter.overallStatus', params.status)
  }

  searchParams.set('pageSize', String(params.pageSize || 20))
  searchParams.set('format', 'json')

  if (params.pageToken) {
    searchParams.set('pageToken', params.pageToken)
  }

  const url = `${CLINICALTRIALS_API_BASE}?${searchParams.toString()}`

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`ClinicalTrials.gov API error: ${response.status}`)
  }

  return response.json()
}

// Get single trial by NCT ID
async function fetchTrialByNctId(nctId: string): Promise<ClinicalTrialStudy | null> {
  const url = `${CLINICALTRIALS_API_BASE}/${nctId}?format=json`

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 }
  })

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`ClinicalTrials.gov API error: ${response.status}`)
  }

  return response.json()
}

// Transform API response to our format
function transformTrial(study: ClinicalTrialStudy) {
  const { protocolSection, hasResults } = study
  const { identificationModule, statusModule, sponsorCollaboratorsModule, conditionsModule, designModule, armsInterventionsModule, contactsLocationsModule } = protocolSection

  // Extract phase - ClinicalTrials.gov returns array like ["PHASE3"]
  const phases = designModule?.phases || []
  const phase = phases.length > 0 ? phases[0] : null

  // Parse dates
  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null
    // Handle formats like "2024-06" or "2024-06-15"
    return dateStr.length === 7 ? `${dateStr}-01` : dateStr
  }

  return {
    nctId: identificationModule.nctId,
    briefTitle: identificationModule.briefTitle,
    officialTitle: identificationModule.officialTitle || null,
    sponsor: sponsorCollaboratorsModule.leadSponsor.name,
    sponsorClass: sponsorCollaboratorsModule.leadSponsor.class,
    collaborators: sponsorCollaboratorsModule.collaborators?.map(c => c.name) || [],
    overallStatus: statusModule.overallStatus,
    phase,
    conditions: conditionsModule?.conditions || [],
    studyType: designModule?.studyType || null,
    enrollmentCount: designModule?.enrollmentInfo?.count || null,
    enrollmentType: designModule?.enrollmentInfo?.type || null,
    interventions: armsInterventionsModule?.interventions?.map(i => ({
      type: i.type,
      name: i.name,
      description: i.description || null
    })) || [],
    primaryCompletionDate: parseDate(statusModule.primaryCompletionDateStruct?.date),
    primaryCompletionType: statusModule.primaryCompletionDateStruct?.type || null,
    completionDate: parseDate(statusModule.completionDateStruct?.date),
    studyFirstPosted: parseDate(statusModule.studyFirstPostDateStruct?.date),
    lastUpdatePosted: parseDate(statusModule.lastUpdatePostDateStruct?.date),
    locations: contactsLocationsModule?.locations?.slice(0, 10).map(l => ({
      facility: l.facility,
      city: l.city,
      state: l.state || null,
      country: l.country
    })) || [],
    locationCount: contactsLocationsModule?.locations?.length || 0,
    hasResults
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const sponsor = searchParams.get('sponsor')
  const nctId = searchParams.get('nctId')
  const condition = searchParams.get('condition')
  const intervention = searchParams.get('intervention')
  const phase = searchParams.get('phase')
  const status = searchParams.get('status') || 'RECRUITING,ACTIVE_NOT_RECRUITING,ENROLLING_BY_INVITATION'
  const pageSize = parseInt(searchParams.get('pageSize') || '20')
  const pageToken = searchParams.get('pageToken') || undefined
  const useCache = searchParams.get('cache') !== 'false'

  try {
    // If NCT ID provided, fetch single trial
    if (nctId) {
      const trial = await fetchTrialByNctId(nctId)
      if (!trial) {
        return NextResponse.json({ error: 'Trial not found' }, { status: 404 })
      }
      return NextResponse.json({
        trial: transformTrial(trial),
        _meta: {
          source: 'clinicaltrials.gov',
          fetchedAt: new Date().toISOString()
        }
      })
    }

    // If ticker provided, look up sponsor name using smart mapper
    let sponsorName = sponsor
    let sponsorAliases: string[] = []
    let mappingSource = 'user-provided'

    if (ticker && !sponsor) {
      // First try cached mapping in database
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        const { data: mapping } = await supabase
          .from('biotech_company_mapping')
          .select('company_name, sponsor_aliases')
          .eq('ticker', ticker.toUpperCase())
          .single()

        if (mapping) {
          sponsorName = mapping.company_name
          sponsorAliases = mapping.sponsor_aliases || []
          mappingSource = 'database-cache'
        }
      }

      // If not in cache, use auto-mapper to discover
      if (!sponsorName) {
        try {
          const autoMapping = await autoMapBiotechCompany(ticker)
          if (autoMapping.confidence >= 0.4 && autoMapping.companyName) {
            sponsorName = autoMapping.companyName
            sponsorAliases = autoMapping.sponsorAliases
            mappingSource = 'auto-discovered'

            // Save to database for future use
            if (SUPABASE_URL && SUPABASE_ANON_KEY && autoMapping.confidence >= 0.6) {
              const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
              await supabase.from('biotech_company_mapping').upsert({
                ticker: ticker.toUpperCase(),
                company_name: autoMapping.companyName,
                cik: autoMapping.cik,
                sponsor_aliases: autoMapping.sponsorAliases,
                is_biotech: true,
                updated_at: new Date().toISOString()
              }, { onConflict: 'ticker' }).then(() => {})
            }
          }
        } catch (error) {
          console.error('Auto-mapping failed:', error)
        }
      }
    }

    if (!sponsorName && !condition && !intervention) {
      return NextResponse.json({
        error: 'At least one of ticker, sponsor, condition, or intervention is required'
      }, { status: 400 })
    }

    // Check cache first if enabled
    if (useCache && ticker && SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data: cachedTrials, error } = await supabase
        .from('clinical_trials')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .order('primary_completion_date', { ascending: true, nullsFirst: false })
        .limit(pageSize)

      if (!error && cachedTrials && cachedTrials.length > 0) {
        // Check if cache is recent (within 24 hours)
        const mostRecent = cachedTrials[0]?.updated_at
        if (mostRecent) {
          const cacheAge = Date.now() - new Date(mostRecent).getTime()
          const cacheMaxAge = 24 * 60 * 60 * 1000 // 24 hours

          if (cacheAge < cacheMaxAge) {
            return NextResponse.json({
              trials: cachedTrials,
              totalCount: cachedTrials.length,
              ticker: ticker.toUpperCase(),
              _meta: {
                source: 'supabase-cache',
                fetchedAt: new Date().toISOString(),
                cacheAge: Math.round(cacheAge / 1000 / 60) + ' minutes'
              }
            })
          }
        }
      }
    }

    // Fetch from API - try primary sponsor first, then aliases if no results
    let apiResponse = await fetchTrialsFromAPI({
      sponsor: sponsorName || undefined,
      condition: condition || undefined,
      intervention: intervention || undefined,
      phase: phase || undefined,
      status: status || undefined,
      pageSize,
      pageToken
    })

    // If no results with primary sponsor, try aliases
    let usedSponsor = sponsorName
    if ((!apiResponse.studies || apiResponse.studies.length === 0) && sponsorAliases.length > 0) {
      for (const alias of sponsorAliases) {
        if (alias === sponsorName) continue // Skip if same as primary

        const aliasResponse = await fetchTrialsFromAPI({
          sponsor: alias,
          condition: condition || undefined,
          intervention: intervention || undefined,
          phase: phase || undefined,
          status: status || undefined,
          pageSize,
          pageToken
        })

        if (aliasResponse.studies && aliasResponse.studies.length > 0) {
          apiResponse = aliasResponse
          usedSponsor = alias
          break
        }
      }
    }

    const trials = apiResponse.studies.map(transformTrial)

    // Calculate upcoming catalysts from trial completion dates
    const now = new Date()
    const upcomingCatalysts = trials
      .filter(t => t.primaryCompletionDate && new Date(t.primaryCompletionDate) > now)
      .map(t => ({
        nctId: t.nctId,
        title: t.briefTitle,
        expectedDate: t.primaryCompletionDate,
        dateType: t.primaryCompletionType,
        phase: t.phase,
        conditions: t.conditions,
        interventions: t.interventions.map(i => i.name)
      }))
      .sort((a, b) => new Date(a.expectedDate!).getTime() - new Date(b.expectedDate!).getTime())

    return NextResponse.json({
      trials,
      totalCount: trials.length,
      nextPageToken: apiResponse.nextPageToken || null,
      ticker: ticker?.toUpperCase() || null,
      sponsor: usedSponsor || null,
      sponsorAliases: sponsorAliases.length > 0 ? sponsorAliases : undefined,
      upcomingCatalysts,
      _meta: {
        source: 'clinicaltrials.gov',
        mappingSource,
        fetchedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Clinical trials API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch clinical trials',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
