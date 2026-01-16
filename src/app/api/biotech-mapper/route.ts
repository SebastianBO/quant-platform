import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  autoMapBiotechCompany,
  batchDiscoverBiotechCompanies,
  findTickerForSponsor,
  BIOTECH_TICKERS
} from '@/lib/biotech-mapper'
import { logger } from '@/lib/logger'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action') || 'map'
  const ticker = searchParams.get('ticker')
  const sponsor = searchParams.get('sponsor')
  const discover = searchParams.get('discover') === 'true'
  const limit = parseInt(searchParams.get('limit') || '10')

  const supabase = SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    : null

  try {
    // Action: Map a single ticker
    if (action === 'map' && ticker) {
      const mapping = await autoMapBiotechCompany(ticker, supabase || undefined)

      return NextResponse.json({
        success: true,
        mapping,
        _meta: {
          action: 'map',
          ticker
        }
      })
    }

    // Action: Find ticker for a sponsor name
    if (action === 'find' && sponsor) {
      if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
      }

      const foundTicker = await findTickerForSponsor(sponsor, supabase)

      return NextResponse.json({
        success: true,
        sponsor,
        ticker: foundTicker,
        _meta: {
          action: 'find'
        }
      })
    }

    // Action: Discover and map multiple biotech companies
    if (action === 'discover' || discover) {
      const tickersToDiscover = BIOTECH_TICKERS.slice(0, limit)

      const results = await batchDiscoverBiotechCompanies(
        tickersToDiscover,
        supabase || undefined
      )

      const mappings = Array.from(results.entries()).map(([t, m]) => ({
        ticker: t,
        companyName: m.companyName,
        cik: m.cik,
        aliasCount: m.sponsorAliases.length,
        confidence: m.confidence
      }))

      return NextResponse.json({
        success: true,
        discovered: mappings.length,
        mappings,
        _meta: {
          action: 'discover',
          limit
        }
      })
    }

    // Action: Get current mappings from database
    if (action === 'list') {
      if (!supabase) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
      }

      const { data: mappings, error } = await supabase
        .from('biotech_company_mapping')
        .select('*')
        .order('ticker')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        count: mappings?.length || 0,
        mappings,
        _meta: {
          action: 'list'
        }
      })
    }

    return NextResponse.json({
      error: 'Invalid action. Use: map, find, discover, or list',
      usage: {
        map: '/api/biotech-mapper?action=map&ticker=MRNA',
        find: '/api/biotech-mapper?action=find&sponsor=Moderna',
        discover: '/api/biotech-mapper?action=discover&limit=10',
        list: '/api/biotech-mapper?action=list'
      }
    }, { status: 400 })

  } catch (error) {
    logger.error('Biotech mapper error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Mapping failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST: Bulk update mappings
export async function POST(request: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  try {
    const body = await request.json()
    const { tickers } = body

    if (!tickers || !Array.isArray(tickers)) {
      return NextResponse.json({ error: 'tickers array required' }, { status: 400 })
    }

    const results = await batchDiscoverBiotechCompanies(tickers, supabase)

    const successful = Array.from(results.values()).filter(m => m.confidence >= 0.6).length
    const failed = results.size - successful

    return NextResponse.json({
      success: true,
      processed: results.size,
      successful,
      failed,
      mappings: Array.from(results.entries()).map(([t, m]) => ({
        ticker: t,
        companyName: m.companyName,
        confidence: m.confidence,
        aliases: m.sponsorAliases.length
      }))
    })

  } catch (error) {
    logger.error('Bulk mapping error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Bulk mapping failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
