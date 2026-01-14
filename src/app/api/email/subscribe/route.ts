import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not set')
  }
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source = 'homepage' } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    const supabase = getSupabase()

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      if (existing.status === 'confirmed') {
        return NextResponse.json(
          { message: 'Already subscribed', status: 'already_subscribed' },
          { status: 200 }
        )
      } else if (existing.status === 'unsubscribed') {
        // Resubscribe
        const { error } = await supabase
          .from('email_subscribers')
          .update({
            status: 'pending',
            unsubscribed_at: null,
            confirmation_token: crypto.randomUUID(),
          })
          .eq('id', existing.id)

        if (error) throw error

        return NextResponse.json({
          message: 'Resubscribed! Check your email to confirm.',
          status: 'resubscribed',
        })
      }
      // If pending, just say we sent another email
      return NextResponse.json({
        message: 'Check your email to confirm your subscription.',
        status: 'pending',
      })
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomUUID()

    // Insert new subscriber
    const { data: subscriber, error } = await supabase
      .from('email_subscribers')
      .insert({
        email: email.toLowerCase(),
        source,
        status: 'pending',
        confirmation_token: confirmationToken,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting subscriber:', error)
      throw error
    }

    // Send welcome email with confirmation link
    try {
      await sendWelcomeEmail(email, confirmationToken)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the subscription even if email fails
    }

    return NextResponse.json({
      message: 'Thanks for subscribing! Check your email to confirm.',
      status: 'subscribed',
      id: subscriber.id,
    })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
}
