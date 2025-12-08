import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

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

    // Get user's portfolios
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        investments (
          id,
          ticker,
          shares,
          avg_cost,
          current_price,
          market_value
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching portfolios:', error)
      return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        ...profile
      },
      portfolios: portfolios || []
    })
  } catch (error) {
    console.error('User portfolios API error:', error)
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
      console.error('Error creating portfolio:', error)
      return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
    }

    return NextResponse.json({ portfolio })
  } catch (error) {
    console.error('Create portfolio API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
