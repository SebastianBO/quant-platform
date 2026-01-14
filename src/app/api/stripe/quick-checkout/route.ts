import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Direct checkout without requiring login
// User creates account after payment or during Stripe checkout

function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return new Stripe(stripeKey)
}

function getPriceId(plan: string): string {
  // Read env vars at runtime, not build time
  const priceIds: Record<string, string> = {
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "",
    annual: process.env.STRIPE_ANNUAL_PRICE_ID || ""
  }
  return priceIds[plan] || ""
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get("plan") || "annual"

    const priceId = getPriceId(plan)

    if (!priceId) {
      // If no price configured, redirect to premium page
      return NextResponse.redirect(new URL("/premium", request.url))
    }

    // Create Stripe checkout session
    const session = await getStripe().checkout.sessions.create({
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
      customer_creation: "always",
      tax_id_collection: {
        enabled: true
      }
    })

    // Redirect directly to Stripe checkout
    if (session.url) {
      return NextResponse.redirect(session.url)
    }

    return NextResponse.redirect(new URL("/premium", request.url))
  } catch (error) {
    console.error("Quick checkout error:", error)
    console.error("STRIPE_SECRET_KEY set:", !!process.env.STRIPE_SECRET_KEY)
    console.error("STRIPE_ANNUAL_PRICE_ID:", process.env.STRIPE_ANNUAL_PRICE_ID)
    console.error("STRIPE_MONTHLY_PRICE_ID:", process.env.STRIPE_MONTHLY_PRICE_ID)
    // On error, redirect to premium page with error details
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.redirect(new URL(`/premium?error=checkout_failed&details=${encodeURIComponent(errorMsg)}`, request.url))
  }
}
