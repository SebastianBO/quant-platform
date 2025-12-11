import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')

  // Get user by email if provided
  let userId = null
  if (email) {
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === email)
    userId = user?.id
  }

  // Check tink_connections table
  const { data: connections, error: connError } = await supabase
    .from('tink_connections')
    .select('*')
    .limit(10)

  // Check env vars (masked)
  const envCheck = {
    TINK_CLIENT_ID: process.env.TINK_CLIENT_ID ? `${process.env.TINK_CLIENT_ID.slice(0, 8)}...` : 'NOT SET',
    TINK_CLIENT_SECRET: process.env.TINK_CLIENT_SECRET ? `${process.env.TINK_CLIENT_SECRET.slice(0, 8)}...` : 'NOT SET',
    TINK_REDIRECT_URI: process.env.TINK_REDIRECT_URI || 'NOT SET',
    TINK_ENV: process.env.TINK_ENV || 'NOT SET',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
  }

  return NextResponse.json({
    user: email ? { email, id: userId } : null,
    connections: connections || [],
    connectionError: connError?.message,
    envCheck,
    redirectUri: process.env.TINK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tink/callback`
  })
}
