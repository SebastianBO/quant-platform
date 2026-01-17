import { NextResponse } from "next/server"
import Stripe from "stripe"

// Simple test endpoint to verify Stripe configuration
export async function GET() {
  const startTime = Date.now()

  const config = {
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasBasicPriceId: !!process.env.STRIPE_API_BASIC_PRICE_ID,
    hasProPriceId: !!process.env.STRIPE_API_PRO_PRICE_ID,
    hasMonthlyPriceId: !!process.env.STRIPE_MONTHLY_PRICE_ID,
    hasAnnualPriceId: !!process.env.STRIPE_ANNUAL_PRICE_ID,
    hasNewsletterMonthlyPriceId: !!process.env.STRIPE_NEWSLETTER_MONTHLY_PRICE_ID,
    hasNewsletterAnnualPriceId: !!process.env.STRIPE_NEWSLETTER_ANNUAL_PRICE_ID,
    nodeEnv: process.env.NODE_ENV,
  }

  // If no secret key, return early
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      status: 'error',
      message: 'STRIPE_SECRET_KEY not configured',
      config,
      elapsed: Date.now() - startTime
    })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { timeout: 5000 })

    // Try to list prices to verify connection
    const prices = await stripe.prices.list({ limit: 1 })

    return NextResponse.json({
      status: 'success',
      message: 'Stripe connection successful',
      priceCount: prices.data.length,
      config,
      elapsed: Date.now() - startTime
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Stripe.errors.StripeError ? error.type : 'unknown',
      config,
      elapsed: Date.now() - startTime
    })
  }
}
