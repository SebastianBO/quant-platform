import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const TINK_API_URL = 'https://api.tink.com'

// Lazy initialization of Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

async function fetchFromTink(endpoint: string, accessToken: string) {
  const response = await fetch(`${TINK_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Tink API error: ${error}`)
  }

  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get Tink connection
    const { data: connection, error: connectionError } = await supabaseAdmin
      .from('tink_connections')
      .select('access_token, refresh_token')
      .eq('user_id', userId)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'No Tink connection found. Please connect your European bank first.' },
        { status: 404 }
      )
    }

    // Fetch accounts
    const accountsData = await fetchFromTink('/data/v2/accounts', connection.access_token)

    // Fetch investment accounts specifically
    const investmentAccounts = accountsData.accounts?.filter(
      (acc: any) => acc.type === 'INVESTMENT' || acc.type === 'PENSION'
    ) || []

    // Fetch holdings for investment accounts
    let allHoldings: any[] = []
    for (const account of investmentAccounts) {
      try {
        const holdingsData = await fetchFromTink(
          `/data/v2/investments/${account.id}/holdings`,
          connection.access_token
        )
        allHoldings = [...allHoldings, ...(holdingsData.holdings || [])]
      } catch (err) {
        logger.error('Error fetching holdings', { accountId: account.id, error: err instanceof Error ? err.message : 'Unknown' })
      }
    }

    // Find or create portfolio
    let portfolioId: string | null = null
    const portfolioName = `European Broker - Tink`

    const { data: existingPortfolio } = await supabaseAdmin
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .eq('tink_connected', true)
      .single()

    if (existingPortfolio) {
      portfolioId = existingPortfolio.id
    } else {
      const { data: newPortfolio, error: portfolioError } = await supabaseAdmin
        .from('portfolios')
        .insert({
          name: portfolioName,
          user_id: userId,
          tink_connected: true,
          currency: 'EUR',
        })
        .select('id')
        .single()

      if (portfolioError) {
        logger.error('Error creating portfolio', { error: portfolioError.message })
        return NextResponse.json(
          { error: 'Failed to create portfolio' },
          { status: 500 }
        )
      }
      portfolioId = newPortfolio.id
    }

    // Map and save holdings
    const investmentsToSave = allHoldings.map(holding => {
      const ticker = holding.isin || holding.ticker || holding.name || 'Unknown'
      const quantity = holding.quantity || 0
      const currentPrice = holding.marketValue?.amount?.value
        ? holding.marketValue.amount.value / quantity
        : 0

      return {
        portfolio_id: portfolioId,
        user_id: userId,
        tink_holding_id: holding.id,
        asset_identifier: ticker,
        asset_type: holding.type || 'Stock',
        name: holding.name || 'Unknown',
        quantity,
        purchase_price: holding.acquiredValue?.amount?.value
          ? holding.acquiredValue.amount.value / quantity
          : null,
        current_price: currentPrice,
        current_value: holding.marketValue?.amount?.value || 0,
        currency: holding.marketValue?.amount?.currencyCode || 'EUR',
        isin: holding.isin,
        last_updated_from_tink: new Date().toISOString(),
      }
    })

    if (investmentsToSave.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from('investments')
        .upsert(investmentsToSave, {
          onConflict: 'tink_holding_id,user_id',
        })

      if (upsertError) {
        logger.error('Error upserting investments', { error: upsertError.message })
      }
    }

    // Update connection timestamp
    await supabaseAdmin
      .from('tink_connections')
      .update({ last_updated: new Date().toISOString() })
      .eq('user_id', userId)

    return NextResponse.json({
      success: true,
      portfolioId,
      accountsCount: investmentAccounts.length,
      holdingsCount: allHoldings.length,
    })
  } catch (error: any) {
    logger.error('Error fetching Tink investments', { error: error.message })
    return NextResponse.json(
      { error: 'Failed to fetch investments', details: error.message },
      { status: 500 }
    )
  }
}
