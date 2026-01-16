import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

interface SubscribeRequest {
  email: string
  source?: string
  interests?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json()
    const { email, source = 'website', interests = [] } = body

    // Validate email
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()

    // Check if Supabase is configured
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      // In development, just log and return success
      logger.info('Newsletter signup (no DB)', { email: emailLower, source, interests })
      return NextResponse.json({
        success: true,
        message: 'Thanks for subscribing! Check your inbox for confirmation.',
        _dev: 'Database not configured - email logged only'
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', emailLower)
      .single()

    if (existing) {
      if (existing.status === 'unsubscribed') {
        // Resubscribe
        await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            resubscribed_at: new Date().toISOString(),
            interests: interests.length > 0 ? interests : undefined,
          })
          .eq('id', existing.id)

        return NextResponse.json({
          success: true,
          message: 'Welcome back! You\'ve been resubscribed.',
        })
      }

      return NextResponse.json({
        success: true,
        message: 'You\'re already subscribed!',
        alreadySubscribed: true,
      })
    }

    // Create new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: emailLower,
        source,
        interests: interests.length > 0 ? interests : null,
        status: 'active',
        subscribed_at: new Date().toISOString(),
      })

    if (insertError) {
      logger.error('Newsletter insert error', { error: insertError.message })
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing! Check your inbox for the welcome email.',
    })

  } catch (error) {
    logger.error('Newsletter API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json({
      error: 'Failed to process subscription',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
