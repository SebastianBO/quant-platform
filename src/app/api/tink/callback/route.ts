import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createLogger } from '@/lib/logger'

const log = createLogger({ service: 'tink-callback' })

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

// Get a client access token (for server-to-server API calls)
async function getClientAccessToken() {
  const response = await fetch(`${TINK_API_URL}/api/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: TINK_CLIENT_ID,
      client_secret: TINK_CLIENT_SECRET,
      grant_type: 'client_credentials',
      scope: 'authorization:grant',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Client token failed: ${error}`)
  }

  return response.json()
}

// Get a user authorization code using the client token
async function getUserAuthorizationCode(clientAccessToken: string, userId: string) {
  const response = await fetch(`${TINK_API_URL}/api/v1/oauth/authorization-grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${clientAccessToken}`,
    },
    body: new URLSearchParams({
      user_id: userId,
      scope: 'accounts:read,transactions:read,user:read,credentials:read,investments:read',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`User auth grant failed: ${error}`)
  }

  return response.json()
}

// Exchange user authorization code for user access token
async function getUserAccessToken(authCode: string) {
  const response = await fetch(`${TINK_API_URL}/api/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: TINK_CLIENT_ID,
      client_secret: TINK_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: authCode,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`User token exchange failed: ${error}`)
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
  log.info('Tink callback processing:', {
    code: code ? 'present' : 'missing',
    state,
    error,
    errorDescription,
    credentialsId: credentialsId ? 'present' : 'missing'
  })

  // If we have no code but have credentialsId and state, Tink Products flow was used
  // We need to get a user access token using the server-side flow
  if (!code && credentialsId && state) {
    log.info('Tink Products flow detected (credentialsId only), getting user token via server flow')

    try {
      const supabaseAdmin = getSupabaseAdmin()

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

      // Step 1: Get a client access token
      log.info('Getting client access token...')
      const clientTokenData = await getClientAccessToken()
      log.info('Got client token')

      // Step 2: Get a user authorization code
      // Note: For Tink, the user_id here is the TINK user id, not our app user id
      // We need to first create or get a Tink user. For now, use our userId as external_user_id
      log.info('Getting user authorization code', { userId })
      const authGrantData = await getUserAuthorizationCode(clientTokenData.access_token, userId)
      log.info('Got auth grant code')

      // Step 3: Exchange for user access token
      log.info('Exchanging for user access token...')
      const tokenData = await getUserAccessToken(authGrantData.code)
      log.info('Got user access token', { scopes: tokenData.scope })

      // Store the connection in Supabase
      const { data: upsertData, error: dbError } = await supabaseAdmin
        .from('tink_connections')
        .upsert({
          user_id: userId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in,
          scope: tokenData.scope,
          credentials_id: credentialsId,
          last_updated: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()

      if (dbError) {
        log.error('Error storing Tink connection', { message: dbError.message, code: dbError.code, details: dbError.details })
        return NextResponse.redirect(
          new URL(`/dashboard?error=tink_db_error&message=${encodeURIComponent(dbError.message)}`, request.url)
        )
      }

      log.info('Tink connection stored successfully', { userId })
      return NextResponse.redirect(
        new URL('/dashboard?success=tink_connected', request.url)
      )
    } catch (err: any) {
      log.error('Error in Products flow token acquisition', { message: err.message })
      return NextResponse.redirect(
        new URL(`/dashboard?error=tink_token_error&message=${encodeURIComponent(err.message)}`, request.url)
      )
    }
  }

  // If we have credentialsId but no state, we can't get the user token
  if (!code && credentialsId && !state) {
    log.info('Tink Products flow with credentialsId but no state - cannot get token')
    return NextResponse.redirect(
      new URL('/dashboard?error=tink_missing_state&credentials_id=' + credentialsId, request.url)
    )
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Handle errors from Tink
    if (error) {
      log.error('Tink callback error', { error, errorDescription })
      return NextResponse.redirect(
        new URL(`/dashboard?error=tink_${error}&message=${encodeURIComponent(errorDescription || 'Connection failed')}`, request.url)
      )
    }

    if (!code || !state) {
      log.info('Missing code or state, returning HTML page to extract hash params')
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
    } else if (credentialsId && state) {
      // Products flow with credentialsId and state - redirect to callback to get token
      window.location.href = '/api/tink/callback?credentials_id=' + encodeURIComponent(credentialsId) + '&state=' + encodeURIComponent(state);
    } else if (credentialsId) {
      // Products flow with credentialsId but no state - can't get token
      window.location.href = '/dashboard?error=tink_missing_state&credentials_id=' + encodeURIComponent(credentialsId);
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
    log.info('Exchanging code for token', { redirectUri })
    const tokenData = await exchangeCodeForToken(code, redirectUri)
    log.info('Token exchange successful', { scopes: tokenData.scope })

    // Store the connection in Supabase
    log.info('Storing connection', {
      userId,
      tokenDataKeys: Object.keys(tokenData),
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token
    })

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
      log.error('Error storing Tink connection', { message: dbError.message, code: dbError.code, details: dbError.details })
      return NextResponse.redirect(
        new URL(`/dashboard?error=tink_db_error&message=${encodeURIComponent(dbError.message)}`, request.url)
      )
    }

    log.info('Tink connection stored successfully', { userId })
    log.info('Upsert result', { data: upsertData })

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?success=tink_connected', request.url)
    )
  } catch (error: any) {
    log.error('Error in Tink callback', { message: error.message })
    return NextResponse.redirect(
      new URL(`/dashboard?error=tink_exchange_failed&message=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}

// Handle GET requests (standard OAuth flow)
export async function GET(request: NextRequest) {
  log.info('Tink callback GET', { url: request.url })

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
  log.info('Tink callback POST', { url: request.url })

  try {
    const body = await request.json()
    log.info('Tink callback POST body', { body })

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
      log.info('Tink callback POST form data')

      const code = formData.get('code') as string | null
      const state = formData.get('state') as string | null
      const error = formData.get('error') as string | null
      const errorDescription = formData.get('error_description') as string | null
      const credentialsId = formData.get('credentials_id') as string | null || formData.get('credentialsId') as string | null

      return handleCallback(request, code, state, error, errorDescription, credentialsId)
    } catch (e2) {
      log.error('Failed to parse POST body', { error: e2 })
      return NextResponse.redirect(
        new URL('/dashboard?error=tink_invalid_request', request.url)
      )
    }
  }
}
