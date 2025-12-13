import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autoMapBiotechCompany } from '@/lib/biotech-mapper'

// Comprehensive Biotech Stock API
// Returns all biotech-relevant data for a single ticker:
// - Clinical trials & catalysts
// - Pipeline drugs
// - PDUFA dates
// - Cash runway & financials
// - Recent 8-Ks
// - Competitive landscape

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const CLINICALTRIALS_API = 'https://clinicaltrials.gov/api/v2/studies'

interface BiotechStockData {
  ticker: string
  companyName: string
  cik: string | null
  industry: string | null
  focusAreas: string[]
  mapping: {
    sponsorAliases: string[]
    isVerified: boolean
  }
  trials: {
    active: number
    recruiting: number
    phase3: number
    upcoming: {
      nctId: string
      title: string
      phase: string | null
      expectedDate: string | null
      indication: string | null
      drugName: string | null
    }[]
  }
  catalysts: {
    imminent: number // Within 90 days
    highImportance: number
    next: {
      type: string
      title: string
      expectedDate: string | null
      importance: string
    } | null
  }
  pipeline: {
    totalDrugs: number
    byPhase: Record<string, number>
    drugs: {
      name: string
      phase: string
      indication: string | null
      expectedCompletion: string | null
    }[]
  }
  pdufa: {
    upcoming: {
      drugName: string
      indication: string | null
      date: string
      isPriorityReview: boolean
      isBreakthroughTherapy: boolean
    }[]
    nextDate: string | null
  }
  financials: {
    cashPosition: number | null
    quarterlyBurn: number | null
    runwayQuarters: number | null
    runwayDate: string | null
    sharesOutstanding: number | null
    dilutionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | null
  }
  alerts: {
    recent8Ks: {
      date: string
      type: string
      headline: string
      sentiment: string | null
    }[]
  }
  competitors: {
    indication: string
    competitors: {
      ticker: string
      drug: string
      phase: string
    }[]
  }[]
  _meta: {
    sources: string[]
    fetchedAt: string
  }
}

// Fetch trials from ClinicalTrials.gov
async function fetchTrialsForCompany(sponsor: string, aliases: string[]) {
  const allStudies: {
    nctId: string
    title: string
    phase: string | null
    status: string
    expectedDate: string | null
    indication: string | null
    drugName: string | null
  }[] = []

  const seenNctIds = new Set<string>()

  for (const searchTerm of [sponsor, ...aliases].slice(0, 3)) {
    try {
      const response = await fetch(
        `${CLINICALTRIALS_API}?query.spons=${encodeURIComponent(searchTerm)}&pageSize=50&format=json`,
        { next: { revalidate: 3600 } }
      )

      if (!response.ok) continue

      const data = await response.json()

      for (const study of data.studies || []) {
        const protocol = study.protocolSection
        const nctId = protocol?.identificationModule?.nctId
        if (!nctId || seenNctIds.has(nctId)) continue
        seenNctIds.add(nctId)

        const status = protocol?.statusModule?.overallStatus
        const phases = protocol?.designModule?.phases || []
        const conditions = protocol?.conditionsModule?.conditions || []
        const interventions = protocol?.armsInterventionsModule?.interventions || []

        // Parse date
        let expectedDate = protocol?.statusModule?.primaryCompletionDateStruct?.date || null
        if (expectedDate && expectedDate.length === 7) {
          expectedDate = `${expectedDate}-01`
        }

        // Get drug names
        const drugNames = interventions
          .filter((i: { type: string }) => i.type === 'DRUG' || i.type === 'BIOLOGICAL')
          .map((i: { name: string }) => i.name)
          .slice(0, 2)
          .join(', ')

        allStudies.push({
          nctId,
          title: protocol?.identificationModule?.briefTitle || '',
          phase: phases[0] || null,
          status,
          expectedDate,
          indication: conditions[0] || null,
          drugName: drugNames || null
        })
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`Error fetching trials for ${searchTerm}:`, error)
    }
  }

  return allStudies
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  const upperTicker = ticker.toUpperCase()

  const result: BiotechStockData = {
    ticker: upperTicker,
    companyName: '',
    cik: null,
    industry: null,
    focusAreas: [],
    mapping: {
      sponsorAliases: [],
      isVerified: false
    },
    trials: {
      active: 0,
      recruiting: 0,
      phase3: 0,
      upcoming: []
    },
    catalysts: {
      imminent: 0,
      highImportance: 0,
      next: null
    },
    pipeline: {
      totalDrugs: 0,
      byPhase: {},
      drugs: []
    },
    pdufa: {
      upcoming: [],
      nextDate: null
    },
    financials: {
      cashPosition: null,
      quarterlyBurn: null,
      runwayQuarters: null,
      runwayDate: null,
      sharesOutstanding: null,
      dilutionRisk: null
    },
    alerts: {
      recent8Ks: []
    },
    competitors: [],
    _meta: {
      sources: [],
      fetchedAt: new Date().toISOString()
    }
  }

  try {
    let companyMapping: {
      company_name: string
      cik: string | null
      sponsor_aliases: string[]
      industry: string | null
      focus_areas: string[]
    } | null = null

    // 1. Get company mapping from database or auto-discover
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      const { data: mapping } = await supabase
        .from('biotech_company_mapping')
        .select('*')
        .eq('ticker', upperTicker)
        .single()

      if (mapping) {
        companyMapping = mapping
        result.mapping.isVerified = true
      }
    }

    // Auto-discover if not in database
    if (!companyMapping) {
      const autoMapping = await autoMapBiotechCompany(upperTicker)
      if (autoMapping.companyName) {
        companyMapping = {
          company_name: autoMapping.companyName,
          cik: autoMapping.cik,
          sponsor_aliases: autoMapping.sponsorAliases,
          industry: 'Biotechnology',
          focus_areas: []
        }
      }
    }

    if (!companyMapping) {
      return NextResponse.json({
        error: 'Company not found',
        ticker: upperTicker
      }, { status: 404 })
    }

    result.companyName = companyMapping.company_name
    result.cik = companyMapping.cik
    result.industry = companyMapping.industry
    result.focusAreas = companyMapping.focus_areas || []
    result.mapping.sponsorAliases = companyMapping.sponsor_aliases || []
    result._meta.sources.push('sec-edgar')

    // 2. Fetch clinical trials
    const trials = await fetchTrialsForCompany(
      companyMapping.company_name,
      companyMapping.sponsor_aliases || []
    )
    result._meta.sources.push('clinicaltrials.gov')

    const activeStatuses = ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'ENROLLING_BY_INVITATION', 'NOT_YET_RECRUITING']
    const activeTrials = trials.filter(t => activeStatuses.includes(t.status))

    result.trials.active = activeTrials.length
    result.trials.recruiting = trials.filter(t => t.status === 'RECRUITING').length
    result.trials.phase3 = trials.filter(t => t.phase === 'PHASE3').length

    // Get upcoming trials (future completion dates)
    const now = new Date()
    const upcomingTrials = activeTrials
      .filter(t => t.expectedDate && new Date(t.expectedDate) > now)
      .sort((a, b) => new Date(a.expectedDate!).getTime() - new Date(b.expectedDate!).getTime())
      .slice(0, 10)

    result.trials.upcoming = upcomingTrials.map(t => ({
      nctId: t.nctId,
      title: t.title,
      phase: t.phase,
      expectedDate: t.expectedDate,
      indication: t.indication,
      drugName: t.drugName
    }))

    // 3. Calculate catalysts from trials
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    const imminentTrials = upcomingTrials.filter(t =>
      t.expectedDate && new Date(t.expectedDate) <= ninetyDaysFromNow
    )
    const phase3Trials = upcomingTrials.filter(t => t.phase === 'PHASE3')

    result.catalysts.imminent = imminentTrials.length
    result.catalysts.highImportance = phase3Trials.length

    if (upcomingTrials.length > 0) {
      const next = upcomingTrials[0]
      result.catalysts.next = {
        type: next.phase === 'PHASE3' ? 'DATA_READOUT' : 'TRIAL_RESULT',
        title: next.title,
        expectedDate: next.expectedDate,
        importance: next.phase === 'PHASE3' ? 'HIGH' : 'MEDIUM'
      }
    }

    // 4. Build pipeline from trials
    const drugMap = new Map<string, {
      name: string
      phase: string
      indication: string | null
      expectedCompletion: string | null
    }>()

    for (const trial of activeTrials) {
      if (!trial.drugName) continue

      const existing = drugMap.get(trial.drugName)
      // Keep highest phase
      if (!existing || (trial.phase && trial.phase > (existing.phase || ''))) {
        drugMap.set(trial.drugName, {
          name: trial.drugName,
          phase: trial.phase || 'PHASE1',
          indication: trial.indication,
          expectedCompletion: trial.expectedDate
        })
      }
    }

    result.pipeline.totalDrugs = drugMap.size
    result.pipeline.drugs = Array.from(drugMap.values())

    // Count by phase
    for (const drug of result.pipeline.drugs) {
      const phase = drug.phase || 'UNKNOWN'
      result.pipeline.byPhase[phase] = (result.pipeline.byPhase[phase] || 0) + 1
    }

    // 5. Get PDUFA dates, financials, and 8-Ks from database
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

      // PDUFA dates
      const { data: pdufaData } = await supabase
        .from('pdufa_dates')
        .select('*')
        .eq('ticker', upperTicker)
        .eq('outcome', 'PENDING')
        .gte('pdufa_date', now.toISOString().split('T')[0])
        .order('pdufa_date', { ascending: true })
        .limit(5)

      if (pdufaData && pdufaData.length > 0) {
        result.pdufa.upcoming = pdufaData.map(p => ({
          drugName: p.drug_name,
          indication: p.indication,
          date: p.pdufa_date,
          isPriorityReview: p.is_priority_review || false,
          isBreakthroughTherapy: p.is_breakthrough_therapy || false
        }))
        result.pdufa.nextDate = pdufaData[0]?.pdufa_date || null
      }

      // Biotech financials
      const { data: financials } = await supabase
        .from('biotech_financials')
        .select('*')
        .eq('ticker', upperTicker)
        .order('report_date', { ascending: false })
        .limit(1)
        .single()

      if (financials) {
        result.financials = {
          cashPosition: financials.total_cash,
          quarterlyBurn: financials.quarterly_cash_burn,
          runwayQuarters: financials.cash_runway_quarters,
          runwayDate: financials.cash_runway_date,
          sharesOutstanding: financials.shares_outstanding,
          dilutionRisk: financials.cash_runway_quarters
            ? financials.cash_runway_quarters < 4 ? 'HIGH'
            : financials.cash_runway_quarters < 8 ? 'MEDIUM'
            : 'LOW'
            : null
        }
      }

      // Recent 8-K alerts
      const { data: alerts8k } = await supabase
        .from('biotech_8k_alerts')
        .select('*')
        .eq('ticker', upperTicker)
        .order('filing_date', { ascending: false })
        .limit(5)

      if (alerts8k) {
        result.alerts.recent8Ks = alerts8k.map(a => ({
          date: a.filing_date,
          type: a.alert_type,
          headline: a.headline,
          sentiment: a.sentiment
        }))
      }

      // Competitors by indication
      if (result.focusAreas.length > 0) {
        const { data: competitors } = await supabase
          .from('indication_competitors')
          .select('*')
          .contains('competitors', [{ ticker: upperTicker }])
          .limit(5)

        if (competitors) {
          result.competitors = competitors.map(c => ({
            indication: c.indication,
            competitors: (c.competitors || [])
              .filter((comp: { ticker: string }) => comp.ticker !== upperTicker)
              .slice(0, 5)
          }))
        }
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Biotech stock API error:', error)
    return NextResponse.json({
      error: 'Failed to fetch biotech data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
