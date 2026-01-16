import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Biotech Catalysts API
// Aggregates clinical trial milestones into investable catalyst events

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const CLINICALTRIALS_API_BASE = 'https://clinicaltrials.gov/api/v2/studies'

interface Catalyst {
  id: string
  ticker: string
  companyName: string
  catalystType: 'TRIAL_RESULT' | 'FDA_DECISION' | 'PDUFA_DATE' | 'PHASE_TRANSITION' | 'DATA_READOUT'
  title: string
  description: string
  expectedDate: string | null
  datePrecision: 'EXACT' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ESTIMATED'
  drugName: string | null
  indication: string | null
  phase: string | null
  sourceType: 'CLINICAL_TRIAL' | 'FDA' | 'COMPANY'
  sourceId: string
  importance: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'UPCOMING' | 'IMMINENT' | 'PAST'
  daysUntil: number | null
}

// Determine catalyst importance based on phase and type
function determineCatalystImportance(phase: string | null, isLateStage: boolean): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (!phase) return 'LOW'

  if (phase === 'PHASE3' || phase === 'PHASE4' || isLateStage) {
    return 'HIGH'
  } else if (phase === 'PHASE2' || phase === 'PHASE2/PHASE3') {
    return 'MEDIUM'
  }
  return 'LOW'
}

// Determine date precision from ClinicalTrials.gov date type
function determineDatePrecision(dateType: string | null, dateStr: string | null): 'EXACT' | 'MONTH' | 'QUARTER' | 'ESTIMATED' {
  if (!dateStr) return 'ESTIMATED'

  // If date has day component (YYYY-MM-DD format with day > 01)
  if (dateStr.length === 10 && !dateStr.endsWith('-01')) {
    return 'EXACT'
  }

  // ESTIMATED means the date is a projection
  if (dateType === 'ESTIMATED') {
    return 'ESTIMATED'
  }

  // ACTUAL means we have a confirmed date
  if (dateType === 'ACTUAL') {
    return 'EXACT'
  }

  // If only month precision (YYYY-MM format)
  return 'MONTH'
}

// Calculate days until date
function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const targetDate = new Date(dateStr)
  const now = new Date()
  const diffMs = targetDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// Determine catalyst status
function determineCatalystStatus(daysUntil: number | null): 'UPCOMING' | 'IMMINENT' | 'PAST' {
  if (daysUntil === null) return 'UPCOMING'
  if (daysUntil < 0) return 'PAST'
  if (daysUntil <= 90) return 'IMMINENT'
  return 'UPCOMING'
}

// Fetch and transform trials into catalysts
async function fetchTrialCatalystsForTicker(
  ticker: string,
  companyName: string,
  sponsorAliases: string[]
): Promise<Catalyst[]> {
  const catalysts: Catalyst[] = []

  // Try each sponsor alias
  for (const sponsor of [companyName, ...sponsorAliases]) {
    try {
      const params = new URLSearchParams({
        'query.spons': sponsor,
        'filter.overallStatus': 'RECRUITING,ACTIVE_NOT_RECRUITING,ENROLLING_BY_INVITATION,NOT_YET_RECRUITING',
        'pageSize': '50',
        'format': 'json'
      })

      const response = await fetch(`${CLINICALTRIALS_API_BASE}?${params}`, {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 3600 }
      })

      if (!response.ok) continue

      const data = await response.json()
      const studies = data.studies || []

      for (const study of studies) {
        const protocol = study.protocolSection
        const identification = protocol?.identificationModule
        const status = protocol?.statusModule
        const design = protocol?.designModule
        const conditions = protocol?.conditionsModule?.conditions || []
        const interventions = protocol?.armsInterventionsModule?.interventions || []

        if (!identification?.nctId) continue

        const phase = design?.phases?.[0] || null
        const primaryCompletionDate = status?.primaryCompletionDateStruct?.date
        const dateType = status?.primaryCompletionDateStruct?.type

        // Get drug names from interventions
        const drugNames = interventions
          .filter((i: { type: string }) => i.type === 'DRUG' || i.type === 'BIOLOGICAL')
          .map((i: { name: string }) => i.name)
          .slice(0, 3)

        const drugName = drugNames.length > 0 ? drugNames.join(', ') : null
        const indication = conditions.slice(0, 2).join(', ') || null

        // Parse date - handle formats like "2024-06" or "2024-06-15"
        let parsedDate = primaryCompletionDate
        if (parsedDate && parsedDate.length === 7) {
          parsedDate = `${parsedDate}-01`
        }

        const days = daysUntil(parsedDate)
        const importance = determineCatalystImportance(phase, phase === 'PHASE3')
        const datePrecision = determineDatePrecision(dateType, parsedDate)

        // Only include future or recent past catalysts
        if (days !== null && days < -180) continue

        catalysts.push({
          id: `trial-${identification.nctId}`,
          ticker,
          companyName,
          catalystType: phase === 'PHASE3' ? 'DATA_READOUT' : 'TRIAL_RESULT',
          title: identification.briefTitle,
          description: `${phase || 'Clinical'} trial for ${indication || 'various conditions'}`,
          expectedDate: parsedDate,
          datePrecision,
          drugName,
          indication,
          phase,
          sourceType: 'CLINICAL_TRIAL',
          sourceId: identification.nctId,
          importance,
          status: determineCatalystStatus(days),
          daysUntil: days
        })
      }

      // If we found trials, break out of alias loop
      if (catalysts.length > 0) break

    } catch (error) {
      logger.error('Error fetching trials', { sponsor, error: error instanceof Error ? error.message : 'Unknown' })
    }
  }

  return catalysts
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const timeframe = searchParams.get('timeframe') || 'all' // all, upcoming, imminent
  const importance = searchParams.get('importance') // HIGH, MEDIUM, LOW
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    // If ticker provided, get catalysts for that company
    if (ticker) {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // Get company mapping
      const { data: mapping, error: mappingError } = await supabase
        .from('biotech_company_mapping')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .single()

      if (mappingError || !mapping) {
        // If not in our mapping, try to fetch directly from API
        const catalysts = await fetchTrialCatalystsForTicker(
          ticker.toUpperCase(),
          ticker.toUpperCase(),
          []
        )

        // Calculate summary stats for fallback response
        const upcomingCount = catalysts.filter(c => c.status === 'UPCOMING').length
        const imminentCount = catalysts.filter(c => c.status === 'IMMINENT').length
        const highImportanceCount = catalysts.filter(c => c.importance === 'HIGH').length
        const phase3Count = catalysts.filter(c => c.phase === 'PHASE3').length

        return NextResponse.json({
          ticker: ticker.toUpperCase(),
          companyName: ticker.toUpperCase(),
          catalysts: catalysts.slice(0, limit),
          totalCount: catalysts.length,
          summary: {
            upcoming: upcomingCount,
            imminent: imminentCount,
            highImportance: highImportanceCount,
            phase3Trials: phase3Count
          },
          _meta: {
            source: 'clinicaltrials.gov',
            fetchedAt: new Date().toISOString()
          }
        })
      }

      // Fetch catalysts using company mapping
      const catalysts = await fetchTrialCatalystsForTicker(
        mapping.ticker,
        mapping.company_name,
        mapping.sponsor_aliases || []
      )

      // Apply filters
      let filteredCatalysts = catalysts

      if (timeframe === 'upcoming') {
        filteredCatalysts = filteredCatalysts.filter(c => c.status !== 'PAST')
      } else if (timeframe === 'imminent') {
        filteredCatalysts = filteredCatalysts.filter(c => c.status === 'IMMINENT')
      }

      if (importance) {
        filteredCatalysts = filteredCatalysts.filter(c => c.importance === importance)
      }

      // Sort by date
      filteredCatalysts.sort((a, b) => {
        if (!a.expectedDate) return 1
        if (!b.expectedDate) return -1
        return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
      })

      // Calculate summary stats
      const upcomingCount = filteredCatalysts.filter(c => c.status === 'UPCOMING').length
      const imminentCount = filteredCatalysts.filter(c => c.status === 'IMMINENT').length
      const highImportanceCount = filteredCatalysts.filter(c => c.importance === 'HIGH').length
      const phase3Count = filteredCatalysts.filter(c => c.phase === 'PHASE3').length

      return NextResponse.json({
        ticker: mapping.ticker,
        companyName: mapping.company_name,
        industry: mapping.industry,
        focusAreas: mapping.focus_areas,
        catalysts: filteredCatalysts.slice(0, limit),
        totalCount: filteredCatalysts.length,
        summary: {
          upcoming: upcomingCount,
          imminent: imminentCount,
          highImportance: highImportanceCount,
          phase3Trials: phase3Count
        },
        _meta: {
          source: 'clinicaltrials.gov',
          fetchedAt: new Date().toISOString()
        }
      })
    }

    // If no ticker, get catalysts for all tracked biotech companies
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Get all company mappings
    const { data: mappings, error: mappingsError } = await supabase
      .from('biotech_company_mapping')
      .select('*')
      .order('market_cap_tier', { ascending: true })
      .limit(10) // Limit to avoid rate limiting

    if (mappingsError) {
      return NextResponse.json({ error: 'Failed to fetch company mappings' }, { status: 500 })
    }

    // Fetch catalysts for each company (with rate limiting)
    const allCatalysts: Catalyst[] = []

    for (const mapping of mappings || []) {
      const catalysts = await fetchTrialCatalystsForTicker(
        mapping.ticker,
        mapping.company_name,
        mapping.sponsor_aliases || []
      )
      allCatalysts.push(...catalysts)

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Apply filters
    let filteredCatalysts = allCatalysts

    if (timeframe === 'upcoming') {
      filteredCatalysts = filteredCatalysts.filter(c => c.status !== 'PAST')
    } else if (timeframe === 'imminent') {
      filteredCatalysts = filteredCatalysts.filter(c => c.status === 'IMMINENT')
    }

    if (importance) {
      filteredCatalysts = filteredCatalysts.filter(c => c.importance === importance)
    }

    // Sort by date
    filteredCatalysts.sort((a, b) => {
      if (!a.expectedDate) return 1
      if (!b.expectedDate) return -1
      return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
    })

    // Group by ticker
    const byTicker: Record<string, Catalyst[]> = {}
    for (const catalyst of filteredCatalysts) {
      if (!byTicker[catalyst.ticker]) {
        byTicker[catalyst.ticker] = []
      }
      byTicker[catalyst.ticker].push(catalyst)
    }

    return NextResponse.json({
      catalysts: filteredCatalysts.slice(0, limit),
      totalCount: filteredCatalysts.length,
      byTicker,
      companiesTracked: mappings?.length || 0,
      summary: {
        upcoming: filteredCatalysts.filter(c => c.status === 'UPCOMING').length,
        imminent: filteredCatalysts.filter(c => c.status === 'IMMINENT').length,
        highImportance: filteredCatalysts.filter(c => c.importance === 'HIGH').length,
        phase3Trials: filteredCatalysts.filter(c => c.phase === 'PHASE3').length
      },
      _meta: {
        source: 'clinicaltrials.gov',
        fetchedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('Biotech catalysts API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Failed to fetch biotech catalysts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
