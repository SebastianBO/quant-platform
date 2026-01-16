import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

async function getSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore errors in server components
          }
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user's portfolios with correct column names
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        investments (
          id,
          asset_identifier,
          quantity,
          purchase_price,
          total_cost_basis,
          current_price,
          current_value
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching portfolios', { error: error.message })
      return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Map investments to consistent format
    const mappedPortfolios = (portfolios || []).map((p: any) => ({
      ...p,
      investments: (p.investments || []).map((inv: any) => ({
        id: inv.id,
        ticker: inv.asset_identifier,
        asset_identifier: inv.asset_identifier,
        shares: inv.quantity || 0,
        quantity: inv.quantity,
        avg_cost: inv.purchase_price,
        purchase_price: inv.purchase_price,
        current_price: inv.current_price,
        current_value: inv.current_value,
        market_value: inv.current_value || (inv.quantity * (inv.current_price || inv.purchase_price || 0)),
        total_cost_basis: inv.total_cost_basis
      }))
    }))

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...profile
      },
      portfolios: mappedPortfolios
    })
  } catch (error) {
    logger.error('User portfolios API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, currency = 'USD' } = body

    if (!name) {
      return NextResponse.json({ error: 'Portfolio name is required' }, { status: 400 })
    }

    // Create portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert([{
        user_id: user.id,
        name,
        description,
        currency
      }])
      .select()
      .single()

    if (error) {
      logger.error('Error creating portfolio', { error: error.message })
      return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
    }

    return NextResponse.json({ portfolio })
  } catch (error) {
    logger.error('Create portfolio API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
