import { NextRequest, NextResponse } from 'next/server'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Plaid webhook types we care about
const INVESTMENT_WEBHOOK_TYPES = [
  'HOLDINGS: DEFAULT_UPDATE',  // Holdings have been updated
  'HOLDINGS: ACCOUNT_REMOVED', // Investment account removed
  'INVESTMENTS_TRANSACTIONS: DEFAULT_UPDATE', // New investment transactions
]

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

// Verify Plaid webhook signature
function verifyPlaidWebhook(body: string, signedJwt: string | null): boolean {
  // In production, you should verify the JWT signature
  // For now, we'll do basic validation
  if (!signedJwt) {
    console.warn('No Plaid-Verification header present')
    return process.env.PLAID_ENV === 'sandbox' // Allow in sandbox
  }

  // TODO: Implement full JWT verification with Plaid's public key
  // https://plaid.com/docs/api/webhooks/webhook-verification/
  return true
}

// Sync holdings for a specific Plaid item
async function syncHoldingsForItem(itemId: string, supabaseAdmin: any, plaidClient: PlaidApi) {
  console.log(`[Plaid Webhook] Syncing holdings for item: ${itemId}`)

  // Get the access token for this item
  const { data: itemData, error: itemError } = await supabaseAdmin
    .from('plaid_items')
    .select('access_token, user_id, institution_name')
    .eq('item_id', itemId)
    .single()

  if (itemError || !itemData) {
    console.error(`[Plaid Webhook] Item not found: ${itemId}`)
    return { success: false, error: 'Item not found' }
  }

  try {
    // Fetch updated holdings from Plaid
    const holdingsResponse = await plaidClient.investmentsHoldingsGet({
      access_token: itemData.access_token,
    })

    const { holdings, securities, accounts } = holdingsResponse.data

    // Find the portfolio for this item
    const { data: portfolio } = await supabaseAdmin
      .from('portfolios')
      .select('id')
      .eq('user_id', itemData.user_id)
      .eq('plaid_item_id', itemId)
      .single()

    if (!portfolio) {
      console.error(`[Plaid Webhook] Portfolio not found for item: ${itemId}`)
      return { success: false, error: 'Portfolio not found' }
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

      const holdingId = `${holding.security_id}_${holding.account_id}`

      return {
        portfolio_id: portfolio.id,
        user_id: itemData.user_id,
        plaid_holding_id: holdingId,
        plaid_account_id: holding.account_id,
        asset_identifier: assetIdentifier,
        asset_type: assetType,
        name: security?.name || 'Unknown',
        quantity,
        purchase_price: purchasePrice,
        current_price: currentPrice,
        current_value: currentValue,
        currency: security?.iso_currency_code || 'USD',
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
        console.error('[Plaid Webhook] Error upserting investments:', upsertError)
        return { success: false, error: upsertError.message }
      }
    }

    // Update last_updated timestamp
    await supabaseAdmin
      .from('plaid_items')
      .update({ last_updated: new Date().toISOString() })
      .eq('item_id', itemId)

    console.log(`[Plaid Webhook] Successfully synced ${holdings.length} holdings for item: ${itemId}`)
    return { success: true, holdingsCount: holdings.length }
  } catch (error: any) {
    console.error('[Plaid Webhook] Error syncing holdings:', error?.response?.data || error.message)
    return { success: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signedJwt = request.headers.get('Plaid-Verification')

    // Verify webhook authenticity
    if (!verifyPlaidWebhook(body, signedJwt)) {
      console.error('[Plaid Webhook] Verification failed')
      return NextResponse.json({ error: 'Verification failed' }, { status: 401 })
    }

    const webhookData = JSON.parse(body)
    const { webhook_type, webhook_code, item_id, error: webhookError } = webhookData

    console.log(`[Plaid Webhook] Received: ${webhook_type} - ${webhook_code} for item: ${item_id}`)

    // Log webhook to database for debugging
    const supabaseAdmin = getSupabaseAdmin()
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('webhook_logs')
          .insert({
            provider: 'plaid',
            webhook_type,
            webhook_code,
            item_id,
            payload: webhookData,
            processed_at: new Date().toISOString(),
          })
      } catch {
        // Ignore if table doesn't exist
      }
    }

    // Handle different webhook types
    if (webhook_type === 'HOLDINGS') {
      if (webhook_code === 'DEFAULT_UPDATE') {
        // Holdings have been updated - sync them
        const plaidClient = getPlaidClient()
        const result = await syncHoldingsForItem(item_id, supabaseAdmin, plaidClient)
        return NextResponse.json({ received: true, ...result })
      }
    }

    if (webhook_type === 'INVESTMENTS_TRANSACTIONS') {
      if (webhook_code === 'DEFAULT_UPDATE') {
        // New investment transactions - also trigger holdings sync
        const plaidClient = getPlaidClient()
        const result = await syncHoldingsForItem(item_id, supabaseAdmin, plaidClient)
        return NextResponse.json({ received: true, ...result })
      }
    }

    if (webhook_type === 'ITEM') {
      if (webhook_code === 'ERROR') {
        // Item error - log it
        console.error(`[Plaid Webhook] Item error for ${item_id}:`, webhookError)

        // Update item status in database
        if (supabaseAdmin) {
          await supabaseAdmin
            .from('plaid_items')
            .update({
              error_code: webhookError?.error_code,
              error_message: webhookError?.error_message,
              last_updated: new Date().toISOString(),
            })
            .eq('item_id', item_id)
        }
      }

      if (webhook_code === 'PENDING_EXPIRATION') {
        // Access token expiring - notify user
        console.warn(`[Plaid Webhook] Token expiring for item: ${item_id}`)
        // TODO: Send notification to user to re-authenticate
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Plaid Webhook] Error processing webhook:', error.message)
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error.message },
      { status: 500 }
    )
  }
}

// Also handle GET for webhook URL verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Plaid webhook endpoint active' })
}
