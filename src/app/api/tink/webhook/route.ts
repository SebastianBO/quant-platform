import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const TINK_API_URL = 'https://api.tink.com'
const TINK_WEBHOOK_SECRET = process.env.TINK_WEBHOOK_SECRET || ''

// Lazy initialization of Supabase admin client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Verify Tink webhook signature
function verifyTinkWebhook(body: string, signature: string | null): boolean {
  if (!TINK_WEBHOOK_SECRET) {
    console.warn('[Tink Webhook] No webhook secret configured')
    return process.env.TINK_ENV === 'sandbox' // Allow in sandbox
  }

  if (!signature) {
    console.warn('[Tink Webhook] No signature present')
    return false
  }

  // Tink uses HMAC-SHA256 for webhook verification
  const expectedSignature = crypto
    .createHmac('sha256', TINK_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
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
    const error = await response.text()
    throw new Error(`Tink API error: ${error}`)
  }

  return response.json()
}

// Sync holdings for a specific Tink user
async function syncHoldingsForUser(userId: string, supabaseAdmin: any) {
  console.log(`[Tink Webhook] Syncing holdings for user: ${userId}`)

  // Get the Tink connection
  const { data: connection, error: connectionError } = await supabaseAdmin
    .from('tink_connections')
    .select('access_token, refresh_token')
    .eq('user_id', userId)
    .single()

  if (connectionError || !connection) {
    console.error(`[Tink Webhook] Connection not found for user: ${userId}`)
    return { success: false, error: 'Connection not found' }
  }

  try {
    // Fetch accounts
    const accountsData = await fetchFromTink('/data/v2/accounts', connection.access_token)

    // Filter investment accounts
    const investmentAccounts = accountsData.accounts?.filter(
      (acc: any) => acc.type === 'INVESTMENT' || acc.type === 'PENSION'
    ) || []

    // Fetch holdings for each investment account
    let allHoldings: any[] = []
    for (const account of investmentAccounts) {
      try {
        const holdingsData = await fetchFromTink(
          `/data/v2/investments/${account.id}/holdings`,
          connection.access_token
        )
        allHoldings = [...allHoldings, ...(holdingsData.holdings || [])]
      } catch (err) {
        console.error(`[Tink Webhook] Error fetching holdings for account ${account.id}:`, err)
      }
    }

    // Find the portfolio
    const { data: portfolio } = await supabaseAdmin
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .eq('tink_connected', true)
      .single()

    if (!portfolio) {
      console.error(`[Tink Webhook] Portfolio not found for user: ${userId}`)
      return { success: false, error: 'Portfolio not found' }
    }

    // Map and save holdings
    const investmentsToSave = allHoldings.map(holding => {
      const ticker = holding.isin || holding.ticker || holding.name || 'Unknown'
      const quantity = holding.quantity || 0
      const currentPrice = holding.marketValue?.amount?.value
        ? holding.marketValue.amount.value / quantity
        : 0

      return {
        portfolio_id: portfolio.id,
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
        console.error('[Tink Webhook] Error upserting investments:', upsertError)
        return { success: false, error: upsertError.message }
      }
    }

    // Update connection timestamp
    await supabaseAdmin
      .from('tink_connections')
      .update({ last_updated: new Date().toISOString() })
      .eq('user_id', userId)

    console.log(`[Tink Webhook] Successfully synced ${allHoldings.length} holdings for user: ${userId}`)
    return { success: true, holdingsCount: allHoldings.length }
  } catch (error: any) {
    console.error('[Tink Webhook] Error syncing holdings:', error.message)
    return { success: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('X-Tink-Signature')

    // Verify webhook authenticity
    if (!verifyTinkWebhook(body, signature)) {
      console.error('[Tink Webhook] Verification failed')
      return NextResponse.json({ error: 'Verification failed' }, { status: 401 })
    }

    const webhookData = JSON.parse(body)
    const { event, userId, credentialsId, accountId } = webhookData

    console.log(`[Tink Webhook] Received: ${event} for user: ${userId}`)

    // Log webhook to database
    const supabaseAdmin = getSupabaseAdmin()
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('webhook_logs')
          .insert({
            provider: 'tink',
            webhook_type: event,
            webhook_code: event,
            item_id: credentialsId || accountId,
            payload: webhookData,
            processed_at: new Date().toISOString(),
          })
      } catch {
        // Ignore if table doesn't exist
      }
    }

    // Handle different event types
    // https://docs.tink.com/api/webhooks
    switch (event) {
      case 'investment/holdings:updated':
      case 'account:updated':
      case 'credentials:updated':
        // Holdings or account updated - sync them
        if (userId && supabaseAdmin) {
          const result = await syncHoldingsForUser(userId, supabaseAdmin)
          return NextResponse.json({ received: true, ...result })
        }
        break

      case 'credentials:error':
        // Credentials error - log it
        console.error(`[Tink Webhook] Credentials error for user ${userId}:`, webhookData.error)
        // TODO: Notify user to re-authenticate
        break

      case 'refresh:finished':
        // Background refresh completed
        if (userId && supabaseAdmin) {
          const result = await syncHoldingsForUser(userId, supabaseAdmin)
          return NextResponse.json({ received: true, ...result })
        }
        break

      default:
        console.log(`[Tink Webhook] Unhandled event type: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Tink Webhook] Error processing webhook:', error.message)
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error.message },
      { status: 500 }
    )
  }
}

// Handle GET for webhook URL verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Tink webhook endpoint active' })
}
