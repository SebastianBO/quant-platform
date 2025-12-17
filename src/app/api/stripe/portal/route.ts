import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { requireAuth } from "@/lib/auth"

function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set')
  }
  return new Stripe(stripeKey)
}

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
    // Require authentication - user must be logged in
    const { user, error: authError } = await requireAuth(request)
    if (authError) {
      return authError
    }

    // Use authenticated user's ID (NOT from request body for security)
    const userId = user.userId

    // Get user's Stripe customer ID
    const { data: profile, error } = await getSupabase()
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single()

    if (error || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No subscription found for this user" },
        { status: 404 }
      )
    }

    // Create Stripe customer portal session
    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/subscription`
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create portal session" },
      { status: 500 }
    )
  }
}
