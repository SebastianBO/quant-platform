import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// openFDA DrugsFDA API Integration
// Free API, no key required (but recommended for higher rate limits)
// Covers NDA/BLA drug approvals

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const OPENFDA_API_BASE = 'https://api.fda.gov/drug/drugsfda.json'

interface OpenFDAResponse {
  meta: {
    results: {
      skip: number
      limit: number
      total: number
    }
  }
  results: OpenFDADrugApplication[]
}

interface OpenFDADrugApplication {
  application_number: string
  sponsor_name: string
  submissions: {
    submission_type: string
    submission_number: string
    submission_status: string
    submission_status_date: string
    review_priority?: string
    submission_class_code?: string
    submission_class_code_description?: string
    application_docs?: {
      id: string
      url: string
      date: string
      type: string
    }[]
  }[]
  products: {
    product_number: string
    brand_name: string
    active_ingredients: {
      name: string
      strength: string
    }[]
    dosage_form: string
    route: string
    marketing_status: string
  }[]
  openfda?: {
    brand_name?: string[]
    generic_name?: string[]
    manufacturer_name?: string[]
    product_type?: string[]
    route?: string[]
    substance_name?: string[]
  }
}

// Fetch FDA drug approvals from openFDA API
async function fetchFDAApprovals(params: {
  sponsor?: string
  brandName?: string
  genericName?: string
  applicationNumber?: string
  limit?: number
  skip?: number
}): Promise<OpenFDAResponse> {
  const searchTerms: string[] = []

  if (params.sponsor) {
    // Search across sponsor_name and manufacturer_name
    searchTerms.push(`(sponsor_name:"${params.sponsor}" OR openfda.manufacturer_name:"${params.sponsor}")`)
  }
  if (params.brandName) {
    searchTerms.push(`openfda.brand_name:"${params.brandName}"`)
  }
  if (params.genericName) {
    searchTerms.push(`openfda.generic_name:"${params.genericName}"`)
  }
  if (params.applicationNumber) {
    searchTerms.push(`application_number:"${params.applicationNumber}"`)
  }

  const searchQuery = searchTerms.join('+AND+')
  const limit = params.limit || 20
  const skip = params.skip || 0

  let url = `${OPENFDA_API_BASE}?limit=${limit}&skip=${skip}`
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`
  }

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (errorData.error?.code === 'NOT_FOUND') {
      return {
        meta: { results: { skip: 0, limit, total: 0 } },
        results: []
      }
    }
    throw new Error(`openFDA API error: ${response.status}`)
  }

  return response.json()
}

// Transform FDA application to our format
function transformFDAApplication(app: OpenFDADrugApplication) {
  // Get the most recent original approval
  const originalApproval = app.submissions.find(s => s.submission_type === 'ORIG' && s.submission_status === 'AP')

  // Get all supplemental approvals
  const supplements = app.submissions
    .filter(s => s.submission_type === 'SUPPL' && s.submission_status === 'AP')
    .sort((a, b) => b.submission_status_date.localeCompare(a.submission_status_date))

  // Get latest submission
  const latestSubmission = app.submissions
    .filter(s => s.submission_status === 'AP')
    .sort((a, b) => b.submission_status_date.localeCompare(a.submission_status_date))[0]

  // Format date from YYYYMMDD to YYYY-MM-DD
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return null
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  }

  // Get product info
  const products = app.products.map(p => ({
    brandName: p.brand_name,
    activeIngredients: p.active_ingredients,
    dosageForm: p.dosage_form,
    route: p.route,
    marketingStatus: p.marketing_status
  }))

  return {
    applicationNumber: app.application_number,
    applicationType: app.application_number.startsWith('NDA') ? 'NDA' :
                     app.application_number.startsWith('BLA') ? 'BLA' :
                     app.application_number.startsWith('ANDA') ? 'ANDA' : 'OTHER',
    sponsorName: app.sponsor_name,
    brandNames: app.openfda?.brand_name || products.map(p => p.brandName).filter(Boolean),
    genericNames: app.openfda?.generic_name || [],
    manufacturerNames: app.openfda?.manufacturer_name || [],
    productType: app.openfda?.product_type?.[0] || null,
    routes: app.openfda?.route || [],
    substances: app.openfda?.substance_name || [],
    originalApprovalDate: originalApproval ? formatDate(originalApproval.submission_status_date) : null,
    originalReviewPriority: originalApproval?.review_priority || null,
    latestApprovalDate: latestSubmission ? formatDate(latestSubmission.submission_status_date) : null,
    totalSupplements: supplements.length,
    products,
    // Recent label changes
    recentLabelChanges: supplements
      .filter(s => s.submission_class_code_description?.includes('Labeling'))
      .slice(0, 3)
      .map(s => ({
        date: formatDate(s.submission_status_date),
        type: s.submission_class_code_description
      })),
    // Get application docs if available
    documents: originalApproval?.application_docs?.map(d => ({
      type: d.type,
      url: d.url,
      date: formatDate(d.date)
    })) || []
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const sponsor = searchParams.get('sponsor')
  const brandName = searchParams.get('brandName')
  const genericName = searchParams.get('genericName')
  const applicationNumber = searchParams.get('applicationNumber')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = parseInt(searchParams.get('skip') || '0')
  const useCache = searchParams.get('cache') !== 'false'

  try {
    // If ticker provided, look up sponsor name from mapping
    let sponsorName = sponsor
    if (ticker && !sponsor && SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data: mapping } = await supabase
        .from('biotech_company_mapping')
        .select('company_name, sponsor_aliases')
        .eq('ticker', ticker.toUpperCase())
        .single()

      if (mapping) {
        sponsorName = mapping.company_name
      }
    }

    if (!sponsorName && !brandName && !genericName && !applicationNumber) {
      return NextResponse.json({
        error: 'At least one of ticker, sponsor, brandName, genericName, or applicationNumber is required'
      }, { status: 400 })
    }

    // Check cache first if enabled
    if (useCache && ticker && SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      const { data: cachedApprovals, error } = await supabase
        .from('fda_drug_approvals')
        .select('*')
        .eq('ticker', ticker.toUpperCase())
        .order('submission_status_date', { ascending: false })
        .limit(limit)

      if (!error && cachedApprovals && cachedApprovals.length > 0) {
        const mostRecent = cachedApprovals[0]?.updated_at
        if (mostRecent) {
          const cacheAge = Date.now() - new Date(mostRecent).getTime()
          const cacheMaxAge = 24 * 60 * 60 * 1000

          if (cacheAge < cacheMaxAge) {
            return NextResponse.json({
              approvals: cachedApprovals,
              totalCount: cachedApprovals.length,
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

    // Fetch from openFDA API
    const apiResponse = await fetchFDAApprovals({
      sponsor: sponsorName || undefined,
      brandName: brandName || undefined,
      genericName: genericName || undefined,
      applicationNumber: applicationNumber || undefined,
      limit,
      skip
    })

    const approvals = apiResponse.results.map(transformFDAApplication)

    // Categorize by application type
    const byType = {
      NDA: approvals.filter(a => a.applicationType === 'NDA'),
      BLA: approvals.filter(a => a.applicationType === 'BLA'),
      ANDA: approvals.filter(a => a.applicationType === 'ANDA'),
      OTHER: approvals.filter(a => a.applicationType === 'OTHER')
    }

    // Get recent approvals (last 2 years)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
    const recentApprovals = approvals.filter(a =>
      a.originalApprovalDate && new Date(a.originalApprovalDate) > twoYearsAgo
    )

    // Priority reviews
    const priorityReviews = approvals.filter(a =>
      a.originalReviewPriority === 'PRIORITY'
    )

    return NextResponse.json({
      approvals,
      totalCount: apiResponse.meta.results.total,
      returnedCount: approvals.length,
      skip,
      ticker: ticker?.toUpperCase() || null,
      sponsor: sponsorName || null,
      summary: {
        totalApplications: approvals.length,
        byType: {
          NDA: byType.NDA.length,
          BLA: byType.BLA.length,
          ANDA: byType.ANDA.length
        },
        recentApprovalsCount: recentApprovals.length,
        priorityReviewsCount: priorityReviews.length,
        uniqueBrandNames: [...new Set(approvals.flatMap(a => a.brandNames))].length,
        uniqueSubstances: [...new Set(approvals.flatMap(a => a.substances))].length
      },
      recentApprovals: recentApprovals.slice(0, 5),
      priorityReviews: priorityReviews.slice(0, 5),
      _meta: {
        source: 'openfda',
        fetchedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    logger.error('FDA approvals API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Failed to fetch FDA approvals',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
