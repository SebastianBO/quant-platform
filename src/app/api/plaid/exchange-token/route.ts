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

    const { public_token, userId, institution_id, institution_name } = await request.json()

    if (!public_token || !userId) {
      return NextResponse.json(
        { error: 'public_token and userId are required' },
        { status: 400 }
      )
    }

    // Exchange public token for access token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // Store the access token in Supabase
    const { error: dbError } = await supabaseAdmin
      .from('plaid_items')
      .upsert({
        user_id: userId,
        item_id: itemId,
        access_token: accessToken,
        institution_id: institution_id || null,
        institution_name: institution_name || null,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'item_id' })

    if (dbError) {
      console.error('Error storing Plaid item:', dbError)
      return NextResponse.json({
        message: 'Token exchanged but failed to store in database',
        itemId,
        error: dbError.message,
      }, { status: 207 })
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected account',
      itemId,
    })
  } catch (error: any) {
    console.error('Error exchanging Plaid token:', error?.response?.data || error.message)
    return NextResponse.json(
      {
        error: 'Failed to exchange token',
        details: error?.response?.data || error.message
      },
      { status: 500 }
    )
  }
}
