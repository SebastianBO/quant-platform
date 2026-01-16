import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { createLogger } from "@/lib/logger"

const log = createLogger({ service: 'stripe-webhook' })

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "")
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  )
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature") || ""

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    log.error("Webhook signature verification failed", { error: err })
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        // Get the subscription
        if (session.subscription) {
          const subscription = await getStripe().subscriptions.retrieve(
            session.subscription as string
          ) as unknown as {
            id: string
            status: string
            current_period_start: number
            current_period_end: number
            cancel_at_period_end: boolean
          }

          const userId = session.metadata?.userId
          const customerId = session.customer as string
          const planId = session.metadata?.planId

          // Update user's subscription status in database
          if (userId) {
            await getSupabase().from("subscriptions").upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan_id: planId,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: "user_id"
            })

            // Update user profile with premium status
            await getSupabase().from("profiles").update({
              is_premium: true,
              stripe_customer_id: customerId,
              premium_since: new Date().toISOString()
            }).eq("id", userId)

            // Sync to RevenueCat for mobile app access
            await syncToRevenueCat(userId, subscription.id, planId || "yearly")
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscriptionData = event.data.object as unknown as {
          id: string
          status: string
          customer: string
          current_period_start: number
          current_period_end: number
          cancel_at_period_end: boolean
        }
        const customerId = subscriptionData.customer

        // Find user by customer ID
        const { data: profile } = await getSupabase()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await getSupabase().from("subscriptions").update({
            status: subscriptionData.status,
            current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
            updated_at: new Date().toISOString()
          }).eq("user_id", profile.id)

          // Update premium status based on subscription status
          const isPremium = ["active", "trialing"].includes(subscriptionData.status)
          await getSupabase().from("profiles").update({
            is_premium: isPremium
          }).eq("id", profile.id)
        }
        break
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as unknown as { customer: string }
        const customerId = deletedSub.customer

        // Find user by customer ID
        const { data: profile } = await getSupabase()
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await getSupabase().from("subscriptions").update({
            status: "canceled",
            updated_at: new Date().toISOString()
          }).eq("user_id", profile.id)

          // Remove premium status
          await getSupabase().from("profiles").update({
            is_premium: false
          }).eq("id", profile.id)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as unknown as {
          id: string
          subscription: string | null
          payment_intent: string | null
          amount_paid: number
          currency: string
        }

        // Record successful payment
        if (invoice.subscription) {
          const { data: sub } = await getSupabase()
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", invoice.subscription)
            .single()

          if (sub) {
            await getSupabase().from("payments").insert({
              user_id: sub.user_id,
              stripe_invoice_id: invoice.id,
              stripe_payment_intent_id: invoice.payment_intent || "",
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: "succeeded",
              created_at: new Date().toISOString()
            })
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const failedInvoice = event.data.object as unknown as {
          id: string
          subscription: string | null
          amount_due: number
          currency: string
        }

        // Record failed payment
        if (failedInvoice.subscription) {
          const { data: sub } = await getSupabase()
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", failedInvoice.subscription)
            .single()

          if (sub) {
            await getSupabase().from("payments").insert({
              user_id: sub.user_id,
              stripe_invoice_id: failedInvoice.id,
              amount: failedInvoice.amount_due,
              currency: failedInvoice.currency,
              status: "failed",
              created_at: new Date().toISOString()
            })
          }
        }
        break
      }

      default:
        log.info("Unhandled event type", { eventType: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    log.error("Error processing webhook", { error })
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

// Sync subscription to RevenueCat for cross-platform access
async function syncToRevenueCat(userId: string, subscriptionId: string, productId: string) {
  const REVENUECAT_API_KEY = process.env.REVENUECAT_SECRET_KEY

  if (!REVENUECAT_API_KEY) {
    log.warn("RevenueCat API key not configured, skipping sync")
    return
  }

  try {
    // Grant entitlement via RevenueCat REST API
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${userId}/entitlements/lician.pro/promotional`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${REVENUECAT_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          duration: productId.includes("yearly") ? "yearly" : "weekly"
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      log.error("Failed to sync to RevenueCat", { error: errorText, userId })
    } else {
      log.info("Successfully synced subscription to RevenueCat", { userId, subscriptionId })
    }
  } catch (error) {
    log.error("Error syncing to RevenueCat", { error, userId })
  }
}
