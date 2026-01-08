import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// TEST ENDPOINT - Verify database writes work
// Deploy check: v1

export async function GET(request: NextRequest) {
  const deployVersion = 'v1'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const today = new Date().toISOString().split('T')[0]

  const testRecord = {
    ticker: 'TESTDB',
    date: today,
    open: 100.50,
    high: 105.25,
    low: 99.00,
    close: 103.75,
    volume: 1000000,
    prev_close: 101.00,
    change: 2.75,
    change_percent: 2.72,
    updated_at: new Date().toISOString(),
  }

  try {
    const { data, error } = await supabase
      .from('stock_prices_snapshot')
      .upsert([testRecord], { onConflict: 'ticker' })
      .select()

    if (error) {
      return NextResponse.json({
        deploy_version: deployVersion,
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
    }

    // Verify write by reading back
    const { data: readBack, error: readError } = await supabase
      .from('stock_prices_snapshot')
      .select('*')
      .eq('ticker', 'TESTDB')
      .single()

    return NextResponse.json({
      deploy_version: deployVersion,
      success: true,
      written: data,
      readBack: readBack,
      readError: readError?.message,
    })
  } catch (err) {
    return NextResponse.json({
      deploy_version: deployVersion,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
