import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TINK_CLIENT_ID = process.env.TINK_CLIENT_ID || ''
const TINK_CLIENT_SECRET = process.env.TINK_CLIENT_SECRET || ''
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

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const response = await fetch(`${TINK_API_URL}/api/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: TINK_CLIENT_ID,
      client_secret: TINK_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  console.log('Tink callback received:', request.url)

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    console.log('Tink callback params:', { code: code ? 'present' : 'missing', state, error, errorDescription })

    // Handle errors from Tink
    if (error) {
      console.error('Tink callback error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/dashboard?error=tink_${error}&message=${encodeURIComponent(errorDescription || 'Connection failed')}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=tink_missing_params', request.url)
      )
    }

    // Parse userId from state
    const [userId] = state.split('_')
    if (!userId) {
      return NextResponse.redirect(
        new URL('/dashboard?error=tink_invalid_state', request.url)
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.redirect(
        new URL('/dashboard?error=database_not_configured', request.url)
      )
    }

    // Get redirect URI
    const redirectUri = process.env.TINK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tink/callback`

    // Exchange code for access token
    console.log('Exchanging code for token with redirectUri:', redirectUri)
    const tokenData = await exchangeCodeForToken(code, redirectUri)
    console.log('Token exchange successful, got scopes:', tokenData.scope)

    // Store the connection in Supabase
    console.log('Storing connection for userId:', userId)
    const { error: dbError } = await supabaseAdmin
      .from('tink_connections')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('Error storing Tink connection:', dbError)
    } else {
      console.log('Tink connection stored successfully for user:', userId)
    }

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?success=tink_connected', request.url)
    )
  } catch (error: any) {
    console.error('Error in Tink callback:', error.message)
    return NextResponse.redirect(
      new URL(`/dashboard?error=tink_exchange_failed&message=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}
