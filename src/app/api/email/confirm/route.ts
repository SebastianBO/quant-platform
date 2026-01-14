import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables are not set')
  }
  return createClient(supabaseUrl, supabaseKey)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url))
    }

    const supabase = getSupabase()

    // Find subscriber with this token
    const { data: subscriber, error: findError } = await supabase
      .from('email_subscribers')
      .select('id, status')
      .eq('confirmation_token', token)
      .single()

    if (findError || !subscriber) {
      return NextResponse.redirect(new URL('/?error=invalid_token', request.url))
    }

    if (subscriber.status === 'confirmed') {
      return NextResponse.redirect(new URL('/?confirmed=already', request.url))
    }

    // Confirm the subscription
    const { error: updateError } = await supabase
      .from('email_subscribers')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id)

    if (updateError) {
      console.error('Error confirming subscription:', updateError)
      return NextResponse.redirect(new URL('/?error=confirmation_failed', request.url))
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/?confirmed=true', request.url))
  } catch (error) {
    console.error('Confirmation error:', error)
    return NextResponse.redirect(new URL('/?error=confirmation_failed', request.url))
  }
}
