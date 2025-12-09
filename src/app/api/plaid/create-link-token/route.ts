import { NextRequest, NextResponse } from 'next/server'
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'

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

export async function POST(request: NextRequest) {
  try {
    const { client, clientId, secret } = getPlaidClient()

    // Verify Plaid credentials are configured
    if (!clientId || !secret) {
      return NextResponse.json(
        { error: 'Plaid credentials not configured' },
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

    // Create link token request
    const linkTokenResponse = await client.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'Lician',
      products: [Products.Investments],
      country_codes: [CountryCode.Us],
      language: 'en',
    })

    return NextResponse.json({
      link_token: linkTokenResponse.data.link_token,
      expiration: linkTokenResponse.data.expiration,
    })
  } catch (error: any) {
    console.error('Error creating Plaid link token:', error?.response?.data || error.message)
    return NextResponse.json(
      {
        error: 'Failed to create link token',
        details: error?.response?.data || error.message
      },
      { status: 500 }
    )
  }
}
