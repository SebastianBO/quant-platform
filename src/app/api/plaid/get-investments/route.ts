import { NextRequest, NextResponse } from 'next/server'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization of Plaid client
function getPlaidClient() {
  const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || ''
  const PLAID_ENV = process.env.PLAID_ENV || 'sandbox'

  const PLAID_SECRET = PLAID_ENV === 'production'
    ? process.env.PLAID_SECRET_PRODUCTION
    : PLAID_ENV === 'development'
      ? process.env.PLAID_SECRET_DEVELOPMENT
      : process.env.PLAID_SECRET_SANDBOX

  const plaidEnv = PLAID_ENV === 'development' ? PlaidEnvironments.development :
                   PLAID_ENV === 'production' ? PlaidEnvironments.production :
                   PlaidEnvironments.sandbox

  const plaidConfig = new Configuration({
    basePath: plaidEnv,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
        'PLAID-SECRET': PLAID_SECRET || '',
      },
    },
  })

  return { client: new PlaidApi(plaidConfig), clientId: PLAID_CLIENT_ID, secret: PLAID_SECRET }
}

// Lazy initialization of Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const { client, clientId, secret } = getPlaidClient()
    const supabaseAdmin = getSupabaseAdmin()

    if (!clientId || !secret) {
      return NextResponse.json(
        { error: 'Plaid credentials not configured' },
        { status: 500 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const { userId, itemId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Fetch the Plaid item from database
    const query = supabaseAdmin
      .from('plaid_items')
      .select('access_token, item_id, institution_name')
      .eq('user_id', userId)

    if (itemId) {
      query.eq('item_id', itemId)
    }

    const { data: itemData, error: dbError } = await query.order('last_updated', { ascending: false }).limit(1).single()

    if (dbError || !itemData) {
      return NextResponse.json(
        { error: 'No connected account found. Please link your brokerage first.' },
        { status: 404 }
      )
    }

    // Fetch holdings from Plaid
    const holdingsResponse = await client.investmentsHoldingsGet({
      access_token: itemData.access_token,
    })

    const { holdings, securities, accounts } = holdingsResponse.data

    // Find or create portfolio
    let portfolioId: string | null = null
    const portfolioName = `${itemData.institution_name || 'Brokerage'} - ${itemData.item_id.slice(-4)}`

    const { data: existingPortfolio } = await supabaseAdmin
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .eq('plaid_item_id', itemData.item_id)
      .single()

    if (existingPortfolio) {
      portfolioId = existingPortfolio.id
    } else {
      // Create new portfolio
      const defaultCurrency = (accounts as any)?.[0]?.balances?.iso_currency_code || 'USD'
      const { data: newPortfolio, error: portfolioError } = await supabaseAdmin
        .from('portfolios')
        .insert({
          name: portfolioName,
          user_id: userId,
          plaid_item_id: itemData.item_id,
          currency: defaultCurrency,
        })
        .select('id')
        .single()

      if (portfolioError) {
        console.error('Error creating portfolio:', portfolioError)
        return NextResponse.json(
          { error: 'Failed to create portfolio' },
          { status: 500 }
        )
      }
      portfolioId = newPortfolio.id
    }

    // Map and save holdings
    const investmentsToSave = holdings.map((holding: any) => {
      const security = (securities as any[]).find((s: any) => s.security_id === holding.security_id)

      let assetIdentifier = security?.ticker_symbol || security?.isin || security?.cusip || security?.name || `Unknown (${holding.security_id})`

      let assetType = 'Other'
      switch (security?.type?.toLowerCase()) {
        case 'equity': assetType = 'Stock'; break
        case 'etf': assetType = 'ETF'; break
        case 'mutual fund': assetType = 'Mutual Fund'; break
        case 'derivative': assetType = 'Option'; break
        case 'cash': assetType = 'Cash'; break
      }

      const quantity = holding.quantity ?? 0
      const costBasis = holding.cost_basis
      const purchasePrice = (quantity && costBasis != null) ? costBasis / quantity : null
      const currentPrice = security?.close_price ?? 0
      const currentValue = quantity * currentPrice

      // Create unique holding ID from security_id and account_id
      const holdingId = `${holding.security_id}_${holding.account_id}`

      return {
        portfolio_id: portfolioId,
        user_id: userId,
        plaid_holding_id: holdingId,
        plaid_account_id: holding.account_id,
        asset_identifier: assetIdentifier,
        asset_type: assetType,
        name: security?.name || 'Unknown',
        quantity,
        purchase_price: purchasePrice,
        current_price: currentPrice,
        current_value: currentValue,
        last_updated_from_plaid: new Date().toISOString(),
      }
    })

    if (investmentsToSave.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from('investments')
        .upsert(investmentsToSave, {
          onConflict: 'plaid_holding_id,user_id',
        })

      if (upsertError) {
        console.error('Error upserting investments:', upsertError)
      }
    }

    // Update last_updated timestamp
    await supabaseAdmin
      .from('plaid_items')
      .update({ last_updated: new Date().toISOString() })
      .eq('item_id', itemData.item_id)

    return NextResponse.json({
      success: true,
      portfolioId,
      holdingsCount: holdings.length,
      accountsCount: accounts.length,
      institutionName: itemData.institution_name,
    })
  } catch (error: any) {
    console.error('Error fetching investments:', error?.response?.data || error.message)
    return NextResponse.json(
      {
        error: 'Failed to fetch investments',
        details: error?.response?.data || error.message
      },
      { status: 500 }
    )
  }
}
