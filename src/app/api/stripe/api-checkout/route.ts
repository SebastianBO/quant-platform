import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { logger } from '@/lib/logger'

// API Access checkout - Basic ($29) and Pro ($99) plans

function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return new Stripe(stripeKey)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get("plan") || "basic"
    const email = searchParams.get("email") // Optional pre-fill

    // API access price IDs from env
    const priceIds: Record<string, string> = {
      basic: process.env.STRIPE_API_BASIC_PRICE_ID || "",
      pro: process.env.STRIPE_API_PRO_PRICE_ID || ""
    }

    const priceId = priceIds[plan]

    if (!priceId) {
      // If no price configured, redirect to developers page with message
      return NextResponse.redirect(new URL("/developers?error=not_configured", request.url))
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

    const session = await getStripe().checkout.sessions.create(sessionParams)

    // Redirect directly to Stripe checkout
    if (session.url) {
      return NextResponse.redirect(session.url)
    }

    return NextResponse.redirect(new URL("/developers", request.url))
  } catch (error) {
    logger.error('API checkout error', { error: error instanceof Error ? error.message : 'Unknown' })
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(new URL(`/developers?error=checkout_failed&details=${encodeURIComponent(errorMsg)}`, request.url))
  }
}
