import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET - Fetch user's watchlist (compatible with portfoliocare-expo)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Fetch watchlist - using same structure as portfoliocare-expo
    const { data, error } = await supabase
      .from('watchlist')
      .select('ticker, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Watchlist fetch error', { error: error.message })
      return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 })
    }

    return NextResponse.json({ watchlist: data || [] })
  } catch (error) {
    logger.error('Watchlist API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add stock to watchlist (compatible with portfoliocare-expo)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { ticker } = await request.json()

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if already in watchlist
    const { count } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('ticker', ticker.toUpperCase())

    if (count && count > 0) {
      return NextResponse.json({ success: true, message: 'Already in watchlist' })
    }

    // Add to watchlist - simple structure matching portfoliocare-expo
    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        ticker: ticker.toUpperCase()
      })
      .select()
      .single()

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already in watchlist' })
      }
      logger.error('Watchlist add error', { error: error.message })
      return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 })
    }

    return NextResponse.json({ success: true, item: data })
  } catch (error) {
    logger.error('Watchlist POST error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove stock from watchlist
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker is required' }, { status: 400 })
  }

  try {
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Remove from watchlist
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('ticker', ticker.toUpperCase())

    if (error) {
      logger.error('Watchlist delete error', { error: error.message })
      return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Watchlist DELETE error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET check if a specific ticker is in watchlist
export async function HEAD(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const ticker = request.nextUrl.searchParams.get('ticker')

  if (!authHeader || !ticker) {
    return new NextResponse(null, { status: 400 })
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new NextResponse(null, { status: 401 })
    }

    const { count } = await supabase
      .from('watchlist')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('ticker', ticker.toUpperCase())

    // Return 200 if in watchlist, 404 if not
    return new NextResponse(null, { status: count && count > 0 ? 200 : 404 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}
