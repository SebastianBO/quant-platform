import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "")
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    )
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      customerId: session.customer,
      subscriptionId: session.subscription
    })
  } catch (error) {
    console.error("Error verifying session:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify session" },
      { status: 500 }
    )
  }
}
