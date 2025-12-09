import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "")
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  )
}

const PRICE_IDS = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || "",
  annual: process.env.STRIPE_ANNUAL_PRICE_ID || ""
}

// Free trial only for annual plan
const TRIAL_DAYS = {
  monthly: 0,
  annual: 3
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, emailOffers, userId } = body

    if (!planId || !PRICE_IDS[planId as keyof typeof PRICE_IDS]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS]

    // Get or create Stripe customer
    let customerId: string | undefined

    if (userId) {
      // Check if user already has a Stripe customer ID
      const { data: profile } = await getSupabase()
        .from("profiles")
        .select("stripe_customer_id, email")
        .eq("id", userId)
        .single()

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
      } else if (profile?.email) {
        // Create new Stripe customer
        const customer = await getStripe().customers.create({
          email: profile.email,
          metadata: {
            userId,
            emailOffers: emailOffers ? "true" : "false"
          }
        })
        customerId = customer.id

        // Save customer ID to profile
        await getSupabase()
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId)
      }
    }

    const trialDays = TRIAL_DAYS[planId as keyof typeof TRIAL_DAYS] || 0

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/premium?canceled=true`,
      metadata: {
        planId,
        userId: userId || "",
        emailOffers: emailOffers ? "true" : "false"
      },
      subscription_data: {
        metadata: {
          planId,
          userId: userId || ""
        },
        ...(trialDays > 0 && { trial_period_days: trialDays })
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      tax_id_collection: {
        enabled: true
      }
    }

    if (customerId) {
      sessionParams.customer = customerId
    } else {
      sessionParams.customer_creation = "always"
    }

    const session = await getStripe().checkout.sessions.create(sessionParams)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
