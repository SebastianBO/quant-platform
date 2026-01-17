import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { logger } from '@/lib/logger'

// Premium Newsletter checkout - Insider Trade Alerts subscription

// Initialize Stripe once with timeout
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 10000 })
  : null

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    if (!stripe) {
      logger.error('Stripe not configured - missing STRIPE_SECRET_KEY')
      return NextResponse.redirect(new URL("/newsletter?error=stripe_not_configured", request.url))
    }

    const { searchParams } = new URL(request.url)
    const plan = searchParams.get("plan") || "monthly"
    const email = searchParams.get("email") // Optional pre-fill

    logger.info('Newsletter checkout started', { plan, email: email ? 'provided' : 'none' })

    // Newsletter price IDs from env
    const priceIds: Record<string, string | undefined> = {
      monthly: process.env.STRIPE_NEWSLETTER_MONTHLY_PRICE_ID,
      annual: process.env.STRIPE_NEWSLETTER_ANNUAL_PRICE_ID
    }

    const priceId = priceIds[plan]

    if (!priceId) {
      logger.error('Price ID not configured', { plan })
      return NextResponse.redirect(new URL(`/newsletter?error=price_not_configured&plan=${plan}`, request.url))
    }

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://lician.com"}/newsletter/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://lician.com"}/newsletter?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      tax_id_collection: {
        enabled: true
      },
      metadata: {
        product: 'newsletter',
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

    if (session.url) {
      return NextResponse.redirect(session.url)
    }

    logger.error('No session URL returned from Stripe')
    return NextResponse.redirect(new URL("/newsletter?error=no_session_url", request.url))
  } catch (error) {
    const elapsed = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Stripe.errors.StripeError ? error.code : undefined

    logger.error('Newsletter checkout error', {
      error: errorMsg,
      code: errorCode,
      elapsed,
      type: error instanceof Stripe.errors.StripeError ? error.type : 'unknown'
    })

    return NextResponse.redirect(new URL(`/newsletter?error=checkout_failed&details=${encodeURIComponent(errorMsg)}`, request.url))
  }
}
