import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/macro/interest-rates/snapshot

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

export async function GET() {
  try {
    // Get latest rate for each type
    const rateTypes = ['fed_funds', 'prime', '10y_treasury', '2y_treasury', '30y_mortgage']

    const results = await Promise.all(
      rateTypes.map(async (rateType) => {
        const { data } = await getSupabase()
          .from('interest_rates')
          .select('*')
          .eq('rate_type', rateType)
          .order('date', { ascending: false })
          .limit(1)
          .single()
        return data
      })
    )

    const snapshot = results
      .filter(Boolean)
      .reduce((acc, row) => {
        if (row) {
          acc[row.rate_type] = {
            date: row.date,
            rate: row.rate,
          }
        }
        return acc
      }, {} as Record<string, { date: string; rate: number }>)

    return NextResponse.json({ snapshot })
  } catch (error) {
    logger.error('Interest rates snapshot API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
