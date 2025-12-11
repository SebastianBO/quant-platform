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

async function handleCallback(
  request: NextRequest,
  code: string | null,
  state: string | null,
  error: string | null,
  errorDescription: string | null,
  credentialsId: string | null
) {
  console.log('Tink callback processing:', {
    code: code ? 'present' : 'missing',
    state,
    error,
    errorDescription,
    credentialsId: credentialsId ? 'present' : 'missing'
  })

  // If we have no code but have credentialsId, Tink Products flow was used
  // In this case, we need to redirect user to connect via OAuth flow instead
  if (!code && credentialsId) {
    console.log('Tink Products flow detected (credentialsId only), redirecting to OAuth')
    return NextResponse.redirect(
      new URL('/dashboard?success=tink_credentials_added&credentials_id=' + credentialsId, request.url)
    )
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Handle errors from Tink
    if (error) {
      console.error('Tink callback error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/dashboard?error=tink_${error}&message=${encodeURIComponent(errorDescription || 'Connection failed')}`, request.url)
      )
    }

    if (!code || !state) {
      console.log('Missing code or state, returning HTML page to extract hash params')
      // Return an HTML page that can read hash fragments and redirect properly
      const html = `<!DOCTYPE html>
<html>
<head><title>Processing Tink Connection...</title></head>
<body>
<p>Processing your bank connection...</p>
<script>
  // Check if params are in hash fragment
  const hash = window.location.hash.substring(1);
  if (hash) {
    const params = new URLSearchParams(hash);
    const code = params.get('code');
    const state = params.get('state');
    const credentialsId = params.get('credentials_id') || params.get('credentialsId');

    if (code && state) {
      // Redirect to same endpoint with query params
      window.location.href = '/api/tink/callback?code=' + encodeURIComponent(code) + '&state=' + encodeURIComponent(state);
    } else if (credentialsId) {
      // Products flow - just credentialsId
      window.location.href = '/dashboard?success=tink_credentials_added&credentials_id=' + encodeURIComponent(credentialsId);
    } else {
      window.location.href = '/dashboard?error=tink_missing_params&hash=' + encodeURIComponent(hash);
    }
  } else {
    // No hash params either
    window.location.href = '/dashboard?error=tink_missing_params';
  }
</script>
</body>
</html>`
      return new NextResponse(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      })
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
    console.log('Token data keys:', Object.keys(tokenData))
    console.log('Access token present:', !!tokenData.access_token)
    console.log('Refresh token present:', !!tokenData.refresh_token)

    const { data: upsertData, error: dbError } = await supabaseAdmin
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
      .select()

    if (dbError) {
      console.error('Error storing Tink connection:', dbError.message, dbError.code, dbError.details)
      return NextResponse.redirect(
        new URL(`/dashboard?error=tink_db_error&message=${encodeURIComponent(dbError.message)}`, request.url)
      )
    }

    console.log('Tink connection stored successfully for user:', userId)
    console.log('Upsert result:', upsertData)

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

// Handle GET requests (standard OAuth flow)
export async function GET(request: NextRequest) {
  console.log('Tink callback GET:', request.url)

  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const credentialsId = searchParams.get('credentials_id') || searchParams.get('credentialsId')

  return handleCallback(request, code, state, error, errorDescription, credentialsId)
}

// Handle POST requests (some Tink flows use POST)
export async function POST(request: NextRequest) {
  console.log('Tink callback POST:', request.url)

  try {
    const body = await request.json()
    console.log('Tink callback POST body:', JSON.stringify(body))

    const code = body.code || null
    const state = body.state || null
    const error = body.error || null
    const errorDescription = body.error_description || null
    const credentialsId = body.credentials_id || body.credentialsId || null

    return handleCallback(request, code, state, error, errorDescription, credentialsId)
  } catch (e) {
    // If body isn't JSON, try form data
    try {
      const formData = await request.formData()
      console.log('Tink callback POST form data')

      const code = formData.get('code') as string | null
      const state = formData.get('state') as string | null
      const error = formData.get('error') as string | null
      const errorDescription = formData.get('error_description') as string | null
      const credentialsId = formData.get('credentials_id') as string | null || formData.get('credentialsId') as string | null

      return handleCallback(request, code, state, error, errorDescription, credentialsId)
    } catch (e2) {
      console.error('Failed to parse POST body:', e2)
      return NextResponse.redirect(
        new URL('/dashboard?error=tink_invalid_request', request.url)
      )
    }
  }
}
