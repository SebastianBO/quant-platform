import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/macro/interest-rates

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
  const rateType = searchParams.get('rate_type') || 'fed_funds'
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

  try {
    const { data, error } = await getSupabase()
      .from('interest_rates')
      .select('*')
      .eq('rate_type', rateType)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Interest rates query error', { error: error.message })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Transform to Financial Datasets format
    const rates = (data || []).map(row => ({
      rate_type: row.rate_type,
      date: row.date,
      rate: row.rate,
    }))

    return NextResponse.json({ interest_rates: rates })
  } catch (error) {
    logger.error('Interest rates API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
