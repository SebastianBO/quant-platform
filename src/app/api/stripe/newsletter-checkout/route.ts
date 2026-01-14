import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Premium Newsletter checkout - Insider Trade Alerts subscription

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
    const plan = searchParams.get("plan") || "monthly"
    const email = searchParams.get("email") // Optional pre-fill

    // Newsletter price IDs from env
    const priceIds: Record<string, string> = {
      monthly: process.env.STRIPE_NEWSLETTER_MONTHLY_PRICE_ID || "",
      annual: process.env.STRIPE_NEWSLETTER_ANNUAL_PRICE_ID || ""
    }

    const priceId = priceIds[plan]

    if (!priceId) {
      // If no price configured, redirect to newsletter page with message
      return NextResponse.redirect(new URL("/newsletter?error=not_configured", request.url))
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

    const session = await getStripe().checkout.sessions.create(sessionParams)

    // Redirect directly to Stripe checkout
    if (session.url) {
      return NextResponse.redirect(session.url)
    }

    return NextResponse.redirect(new URL("/newsletter", request.url))
  } catch (error) {
    console.error("Newsletter checkout error:", error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(new URL(`/newsletter?error=checkout_failed&details=${encodeURIComponent(errorMsg)}`, request.url))
  }
}
