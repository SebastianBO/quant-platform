import { NextRequest, NextResponse } from 'next/server'

// Tink configuration
const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID || ''
const TINK_CLIENT_SECRET = process.env.TINK_CLIENT_SECRET || ''
const TINK_ENV = process.env.TINK_ENV || 'sandbox'

// Supported European markets
const EUROPEAN_MARKETS = [
  { code: 'SE', name: 'Sweden', locale: 'sv_SE' },
  { code: 'NO', name: 'Norway', locale: 'no_NO' },
  { code: 'DK', name: 'Denmark', locale: 'da_DK' },
  { code: 'FI', name: 'Finland', locale: 'fi_FI' },
  { code: 'DE', name: 'Germany', locale: 'de_DE' },
  { code: 'AT', name: 'Austria', locale: 'de_AT' },
  { code: 'NL', name: 'Netherlands', locale: 'nl_NL' },
  { code: 'BE', name: 'Belgium', locale: 'nl_BE' },
  { code: 'ES', name: 'Spain', locale: 'es_ES' },
  { code: 'IT', name: 'Italy', locale: 'it_IT' },
  { code: 'FR', name: 'France', locale: 'fr_FR' },
  { code: 'GB', name: 'United Kingdom', locale: 'en_GB' },
  { code: 'CH', name: 'Switzerland', locale: 'de_CH' },
  { code: 'PT', name: 'Portugal', locale: 'pt_PT' },
  { code: 'IE', name: 'Ireland', locale: 'en_IE' },
  { code: 'PL', name: 'Poland', locale: 'pl_PL' },
]

const TINK_SCOPES = [
  'accounts:read',
  'investments:read',
  'transactions:read',
  'user:read',
  'credentials:read'
].join(',')

export async function POST(request: NextRequest) {
  try {
    if (!TINK_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Tink credentials not configured' },
        { status: 500 }
      )
    }

    const { userId, market = 'SE' } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Find market config
    const marketConfig = EUROPEAN_MARKETS.find(m => m.code === market) || EUROPEAN_MARKETS[0]

    // Generate state for security
    const state = `${userId}_${Date.now()}`

    // Get the redirect URL from environment or construct it
    const redirectUri = process.env.TINK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tink/callback`

    // Build Tink Link URL
    const params = new URLSearchParams({
      client_id: TINK_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: TINK_SCOPES,
      market: market,
      locale: marketConfig.locale,
      state: state,
    })

    // Add test parameter for sandbox
    if (TINK_ENV === 'sandbox') {
      params.append('test', 'true')
    }

    const tinkLinkUrl = `https://link.tink.com/1.0/authorize?${params.toString()}`

    return NextResponse.json({
      linkUrl: tinkLinkUrl,
      state,
      market: marketConfig,
      supportedMarkets: EUROPEAN_MARKETS,
    })
  } catch (error: any) {
    console.error('Error creating Tink link:', error.message)
    return NextResponse.json(
      { error: 'Failed to create Tink link', details: error.message },
      { status: 500 }
    )
  }
}
