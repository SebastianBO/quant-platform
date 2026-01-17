import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { logger } from "@/lib/logger"

// Direct checkout without requiring login
// User creates account after payment or during Stripe checkout

// Initialize Stripe once with timeout
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 10000 })
  : null

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    if (!stripe) {
      logger.error('Stripe not configured - missing STRIPE_SECRET_KEY')
      return NextResponse.redirect(new URL("/premium?error=stripe_not_configured", request.url))
    }

    const { searchParams } = new URL(request.url)
    const plan = searchParams.get("plan") || "annual"

    logger.info('Quick checkout started', { plan })

    // Read env vars at runtime
    const priceIds: Record<string, string | undefined> = {
      monthly: process.env.STRIPE_MONTHLY_PRICE_ID,
      annual: process.env.STRIPE_ANNUAL_PRICE_ID
    }

    const priceId = priceIds[plan]

    if (!priceId) {
      logger.error('Price ID not configured', { plan })
      return NextResponse.redirect(new URL(`/premium?error=price_not_configured&plan=${plan}`, request.url))
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      // For annual plan, add 3-day free trial
      subscription_data: plan === "annual" ? {
        trial_period_days: 3,
      } : undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://lician.com"}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://lician.com"}/?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      tax_id_collection: {
        enabled: true
      }
    })

    const elapsed = Date.now() - startTime
    logger.info('Stripe session created', { sessionId: session.id, elapsed })

    if (session.url) {
      return NextResponse.redirect(session.url)
    }

    logger.error('No session URL returned from Stripe')
    return NextResponse.redirect(new URL("/premium?error=no_session_url", request.url))
  } catch (error) {
    const elapsed = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    const errorCode = error instanceof Stripe.errors.StripeError ? error.code : undefined

    logger.error("Quick checkout error", {
      error: errorMsg,
      code: errorCode,
      elapsed,
      type: error instanceof Stripe.errors.StripeError ? error.type : 'unknown'
    })

    return NextResponse.redirect(new URL(`/premium?error=checkout_failed&details=${encodeURIComponent(errorMsg)}`, request.url))
  }
}
