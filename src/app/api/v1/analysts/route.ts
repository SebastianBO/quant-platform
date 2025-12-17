import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Analysts Leaderboard API - TipRanks-style analyst rankings
// Based on our own tracked performance data

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
  const sortBy = searchParams.get('sort') || 'rank_score' // rank_score, success_rate, average_return
  const sector = searchParams.get('sector')
  const firmTier = searchParams.get('tier') // tier1, tier2, boutique
  const minRatings = parseInt(searchParams.get('min_ratings') || '5')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)

  try {
    let query = getSupabase()
      .from('analysts')
      .select(`
        *,
        analyst_firms (
          id,
          name,
          tier
        )
      `)
      .gte('total_ratings', minRatings)
      .order(sortBy, { ascending: false })
      .limit(limit)

    if (sector) {
      query = query.contains('sectors', [sector])
    }

    const { data, error } = await query

    if (error) {
      console.error('Analysts query error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Filter by firm tier if specified
    let analysts = data || []
    if (firmTier) {
      analysts = analysts.filter(a => a.analyst_firms?.tier === firmTier)
    }

    // Calculate percentile ranks
    const totalAnalysts = analysts.length
    const rankedAnalysts = analysts.map((analyst, index) => ({
      id: analyst.id,
      name: analyst.name,
      firm: analyst.analyst_firms ? {
        id: analyst.analyst_firms.id,
        name: analyst.analyst_firms.name,
        tier: analyst.analyst_firms.tier
      } : null,
      // Performance metrics
      totalRatings: analyst.total_ratings,
      successfulRatings: analyst.successful_ratings,
      successRate: analyst.success_rate,
      averageReturn: analyst.average_return,
      rankScore: analyst.rank_score,
      // Ranking
      rank: index + 1,
      percentile: Math.round((1 - index / totalAnalysts) * 100),
      // Coverage
      sectors: analyst.sectors || []
    }))

    return NextResponse.json({
      analysts: rankedAnalysts,
      _meta: {
        source: 'internal_tracking',
        count: rankedAnalysts.length,
        sortedBy: sortBy,
        minRatings: minRatings,
        fetched_at: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Analysts API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
