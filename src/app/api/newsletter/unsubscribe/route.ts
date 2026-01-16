import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return null
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}

/**
 * Newsletter Unsubscribe API
 *
 * POST /api/newsletter/unsubscribe
 * Body: { email: string }
 *
 * GET /api/newsletter/unsubscribe?email=xxx&token=xxx
 * (for one-click unsubscribe from email links)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()
    if (!supabase) {
      logger.info('Newsletter unsubscribe (no DB)', { email })
      return NextResponse.json({
        success: true,
        message: "You've been unsubscribed."
      })
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase().trim())

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "You've been unsubscribed. We're sorry to see you go!"
    })

  } catch (error) {
    logger.error('Newsletter unsubscribe error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  try {
    const supabase = getSupabase()
    if (supabase) {
      await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase().trim())
    }

    // Redirect to confirmation page
    return NextResponse.redirect(
      new URL('/unsubscribed?success=true', request.url)
    )
  } catch {
    return NextResponse.redirect(
      new URL('/unsubscribed?success=false', request.url)
    )
  }
}
