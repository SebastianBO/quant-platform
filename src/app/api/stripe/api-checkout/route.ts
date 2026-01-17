import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { logger } from '@/lib/logger'

// API Access checkout - Basic ($29) and Pro ($99) plans

// Initialize Stripe once
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 10000 })
  : null

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Check Stripe is configured
    if (!stripe) {
      logger.error('Stripe not configured - missing STRIPE_SECRET_KEY')
      return NextResponse.redirect(new URL("/developers?error=stripe_not_configured", request.url))
    }

    const { searchParams } = new URL(request.url)
    const plan = searchParams.get("plan") || "basic"
    const email = searchParams.get("email") // Optional pre-fill

    logger.info('API checkout started', { plan, email: email ? 'provided' : 'none' })

    // API access price IDs from env
    const priceIds: Record<string, string | undefined> = {
      basic: process.env.STRIPE_API_BASIC_PRICE_ID,
      pro: process.env.STRIPE_API_PRO_PRICE_ID
    }

    const priceId = priceIds[plan]

    if (!priceId) {
      logger.error('Price ID not configured', { plan, availablePlans: Object.keys(priceIds) })
      return NextResponse.redirect(new URL(`/developers?error=price_not_configured&plan=${plan}`, request.url))
    }

    logger.info('Creating Stripe session', { plan, priceId: priceId.substring(0, 10) + '...' })

    // Create Stripe checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      // 7-day free trial for new API customers
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://lician.com"}/developers/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://lician.com"}/developers?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      tax_id_collection: {
        enabled: true
      },
      metadata: {
        product: 'api_access',
        plan: plan
      }
    }

    // Pre-fill email if provided
    if (email) {
      sessionParams.customer_email = email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    const elapsed = Date.now() - startTime
    logger.info('Stripe session created', { sessionId: session.id, elapsed })

    // Redirect directly to Stripe checkout
    if (session.url) {
      return NextResponse.redirect(session.url)
    }

    logger.error('No session URL returned from Stripe')
    return NextResponse.redirect(new URL("/developers?error=no_session_url", request.url))
  } catch (error) {
    const elapsed = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Stripe.errors.StripeError ? error.code : undefined

    logger.error('API checkout error', {
      error: errorMsg,
      code: errorCode,
      elapsed,
      type: error instanceof Stripe.errors.StripeError ? error.type : 'unknown'
    })

    return NextResponse.redirect(new URL(`/developers?error=checkout_failed&details=${encodeURIComponent(errorMsg)}`, request.url))
  }
}
