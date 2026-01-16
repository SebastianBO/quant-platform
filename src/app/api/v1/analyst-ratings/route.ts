import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Analyst Ratings API - Our own data from press release scraping
// No external API costs - all data collected from news sources

let supabase: SupabaseClient | null = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const analystId = searchParams.get('analyst_id')
  const firmId = searchParams.get('firm_id')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const days = parseInt(searchParams.get('days') || '90') // Last N days

  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    let query = getSupabase()
      .from('analyst_ratings')
      .select(`
        *,
        analysts (
          id,
          name,
          success_rate,
          average_return,
          rank_score
        ),
        analyst_firms (
          id,
          name,
          tier
        )
      `)
      .gte('rating_date', cutoffDate.toISOString().split('T')[0])
      .order('rating_date', { ascending: false })
      .limit(limit)

    if (ticker) {
      query = query.eq('ticker', ticker.toUpperCase())
    }
    if (analystId) {
      query = query.eq('analyst_id', parseInt(analystId))
    }
    if (firmId) {
      query = query.eq('firm_id', parseInt(firmId))
    }

    const { data, error } = await query

    if (error) {
      logger.error('Analyst ratings query error', { error: error.message })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to clean format
    const ratings = (data || []).map(row => ({
      id: row.id,
      ticker: row.ticker,
      rating: row.rating,
      ratingPrior: row.rating_prior,
      action: row.action,
      priceTarget: row.price_target,
      priceTargetPrior: row.price_target_prior,
      priceAtRating: row.price_at_rating,
      ratingDate: row.rating_date,
      // Performance
      return1d: row.return_1d,
      return1w: row.return_1w,
      return1m: row.return_1m,
      return3m: row.return_3m,
      // Analyst info
      analyst: row.analysts ? {
        id: row.analysts.id,
        name: row.analysts.name,
        successRate: row.analysts.success_rate,
        averageReturn: row.analysts.average_return,
        rankScore: row.analysts.rank_score
      } : null,
      // Firm info
      firm: row.analyst_firms ? {
        id: row.analyst_firms.id,
        name: row.analyst_firms.name,
        tier: row.analyst_firms.tier
      } : null,
      // Meta
      confidence: row.confidence,
      sourceUrl: row.source_url,
      sourceName: row.source_name
    }))

    return NextResponse.json({
      analyst_ratings: ratings,
      _meta: {
        source: 'internal_scraper',
        count: ratings.length,
        days: days,
        fetched_at: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('Analyst ratings API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
