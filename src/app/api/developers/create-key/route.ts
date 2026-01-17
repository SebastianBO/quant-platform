import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { logger } from '@/lib/logger'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Supabase env missing: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`)
  }
  return createClient(supabaseUrl, supabaseKey)
}

// Generate a secure API key with prefix
function generateApiKey(): string {
  const prefix = 'lc_'
  const randomBytes = crypto.randomBytes(24).toString('base64url')
  return `${prefix}${randomBytes}`
}

// Hash API key for storage (we never store the plain key)
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, company, useCase } = body

    // Validate required fields
    if (!email || !name || !useCase) {
      return NextResponse.json(
        { error: 'Email, name, and use case are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Check if email already has an API key
    const { data: existing } = await supabase
      .from('api_keys')
      .select('id, created_at')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'An API key already exists for this email. Contact support to regenerate.' },
        { status: 409 }
      )
    }

    // Generate new API key
    const apiKey = generateApiKey()
    const keyHash = hashApiKey(apiKey)

    // Store in database (hashed)
    const { error: insertError } = await supabase
      .from('api_keys')
      .insert({
        email: email.toLowerCase(),
        name,
        company: company || null,
        use_case: useCase,
        key_hash: keyHash,
        key_prefix: apiKey.substring(0, 10), // Store prefix for identification
        tier: 'free',
        daily_limit: 100,
        requests_today: 0,
        is_active: true,
      })

    if (insertError) {
      logger.error('Error creating API key', { error: insertError.message })
      throw insertError
    }

    // Return the plain API key (only time it's visible)
    return NextResponse.json({
      apiKey,
      message: 'API key created successfully',
      tier: 'free',
      dailyLimit: 100,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = (error as { code?: string })?.code
    logger.error('API key creation error', { error: errorMessage, code: errorCode })
    console.error('[create-key] Full error:', error)
    return NextResponse.json(
      { error: `Failed to create API key: ${errorMessage}` },
      { status: 500 }
    )
  }
}
