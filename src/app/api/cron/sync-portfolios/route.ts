import { NextRequest, NextResponse } from 'next/server'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { createClient } from '@supabase/supabase-js'

/**
 * Cron Job: Sync all connected portfolios
 *
 * This endpoint should be called by Vercel Cron or an external scheduler.
 * Recommended schedule: Every 15 minutes during market hours, hourly otherwise.
 *
 * Vercel Cron config in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-portfolios",
 *     "schedule": "0,15,30,45 13-21 * * 1-5"  // Every 15 min, 9am-5pm EST, Mon-Fri
 *   }]
 * }
 */

const TINK_API_URL = 'https://api.tink.com'

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.warn('[Cron] No CRON_SECRET configured')
    return process.env.NODE_ENV === 'development'
  }

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${cronSecret}`
}

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

  return new PlaidApi(plaidConfig)
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

// Fetch from Tink API
async function fetchFromTink(endpoint: string, accessToken: string) {
  const response = await fetch(`${TINK_API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Tink API error: ${response.status}`)
  }

  return response.json()
}

// Sync a single Plaid item
async function syncPlaidItem(item: any, supabaseAdmin: any, plaidClient: PlaidApi) {
  try {
    const holdingsResponse = await plaidClient.investmentsHoldingsGet({
      access_token: item.access_token,
    })

    const { holdings, securities } = holdingsResponse.data

    // Find the portfolio
    const { data: portfolio } = await supabaseAdmin
      .from('portfolios')
      .select('id')
      .eq('user_id', item.user_id)
      .eq('plaid_item_id', item.item_id)
      .single()

    if (!portfolio) return { success: false, error: 'No portfolio' }

    // Map and save holdings
    const investmentsToSave = holdings.map((holding: any) => {
      const security = (securities as any[]).find((s: any) => s.security_id === holding.security_id)
      const quantity = holding.quantity ?? 0
      const costBasis = holding.cost_basis
      const currentPrice = security?.close_price ?? 0

      return {
        portfolio_id: portfolio.id,
        user_id: item.user_id,
        plaid_holding_id: `${holding.security_id}_${holding.account_id}`,
        plaid_account_id: holding.account_id,
        asset_identifier: security?.ticker_symbol || security?.name || 'Unknown',
        asset_type: security?.type || 'Other',
        name: security?.name || 'Unknown',
        quantity,
        purchase_price: (quantity && costBasis != null) ? costBasis / quantity : null,
        current_price: currentPrice,
        current_value: quantity * currentPrice,
        currency: security?.iso_currency_code || 'USD',
        last_updated_from_plaid: new Date().toISOString(),
      }
    })

    if (investmentsToSave.length > 0) {
      await supabaseAdmin
        .from('investments')
        .upsert(investmentsToSave, { onConflict: 'plaid_holding_id,user_id' })
    }

    await supabaseAdmin
      .from('plaid_items')
      .update({ last_updated: new Date().toISOString() })
      .eq('item_id', item.item_id)

    return { success: true, holdings: holdings.length }
  } catch (error: any) {
    console.error(`[Cron] Error syncing Plaid item ${item.item_id}:`, error.message)
    return { success: false, error: error.message }
  }
}

// Sync a single Tink connection
async function syncTinkConnection(connection: any, supabaseAdmin: any) {
  try {
    // Fetch accounts
    const accountsData = await fetchFromTink('/data/v2/accounts', connection.access_token)
    const investmentAccounts = accountsData.accounts?.filter(
      (acc: any) => acc.type === 'INVESTMENT' || acc.type === 'PENSION'
    ) || []

    // Fetch holdings
    let allHoldings: any[] = []
    for (const account of investmentAccounts) {
      try {
        const holdingsData = await fetchFromTink(
          `/data/v2/investments/${account.id}/holdings`,
          connection.access_token
        )
        allHoldings = [...allHoldings, ...(holdingsData.holdings || [])]
      } catch (err) {
        // Continue with other accounts
      }
    }

    // Find the portfolio
    const { data: portfolio } = await supabaseAdmin
      .from('portfolios')
      .select('id')
      .eq('user_id', connection.user_id)
      .eq('tink_connected', true)
      .single()

    if (!portfolio) return { success: false, error: 'No portfolio' }

    // Map and save holdings
    const investmentsToSave = allHoldings.map(holding => {
      const quantity = holding.quantity || 0
      const currentPrice = holding.marketValue?.amount?.value
        ? holding.marketValue.amount.value / quantity
        : 0

      return {
        portfolio_id: portfolio.id,
        user_id: connection.user_id,
        tink_holding_id: holding.id,
        asset_identifier: holding.isin || holding.ticker || holding.name || 'Unknown',
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
      await supabaseAdmin
        .from('investments')
        .upsert(investmentsToSave, { onConflict: 'tink_holding_id,user_id' })
    }

    await supabaseAdmin
      .from('tink_connections')
      .update({ last_updated: new Date().toISOString() })
      .eq('user_id', connection.user_id)

    return { success: true, holdings: allHoldings.length }
  } catch (error: any) {
    console.error(`[Cron] Error syncing Tink connection for user ${connection.user_id}:`, error.message)
    return { success: false, error: error.message }
  }
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results = {
    plaid: { synced: 0, failed: 0, errors: [] as string[] },
    tink: { synced: 0, failed: 0, errors: [] as string[] },
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const plaidClient = getPlaidClient()

    // Sync all Plaid items
    const { data: plaidItems } = await supabaseAdmin
      .from('plaid_items')
      .select('item_id, access_token, user_id')
      .order('last_updated', { ascending: true })
      .limit(50) // Process up to 50 items per run

    if (plaidItems && plaidItems.length > 0) {
      console.log(`[Cron] Syncing ${plaidItems.length} Plaid items...`)

      for (const item of plaidItems) {
        const result = await syncPlaidItem(item, supabaseAdmin, plaidClient)
        if (result.success) {
          results.plaid.synced++
        } else {
          results.plaid.failed++
          results.plaid.errors.push(`${item.item_id}: ${result.error}`)
        }

        // Rate limiting: wait 100ms between API calls
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Sync all Tink connections
    const { data: tinkConnections } = await supabaseAdmin
      .from('tink_connections')
      .select('user_id, access_token, refresh_token')
      .order('last_updated', { ascending: true })
      .limit(50)

    if (tinkConnections && tinkConnections.length > 0) {
      console.log(`[Cron] Syncing ${tinkConnections.length} Tink connections...`)

      for (const connection of tinkConnections) {
        const result = await syncTinkConnection(connection, supabaseAdmin)
        if (result.success) {
          results.tink.synced++
        } else {
          results.tink.failed++
          results.tink.errors.push(`${connection.user_id}: ${result.error}`)
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    const duration = Date.now() - startTime

    console.log(`[Cron] Sync completed in ${duration}ms:`, results)

    return NextResponse.json({
      success: true,
      duration: `${duration}ms`,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Cron] Error running sync:', error.message)
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
