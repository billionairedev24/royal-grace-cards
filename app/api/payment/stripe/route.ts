import { type NextRequest, NextResponse } from "next/server"

// Mock Stripe payment processing - simulates Micronaut backend response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount } = body

    // Simulate Micronaut backend API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const mockCheckoutUrl = `https://checkout.stripe.com/pay/cs_mock_${orderId}_${Date.now()}`

    return NextResponse.json({
      success: true,
      checkoutUrl: mockCheckoutUrl,
      sessionId: `cs_mock_${orderId}`,
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ success: false, error: "Payment processing failed" }, { status: 500 })
  }
}

// Create Stripe Payment Intent (mock)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const amount = searchParams.get("amount")

  if (!amount) {
    return NextResponse.json({ error: "Amount is required" }, { status: 400 })
  }

  // Mock client secret for Stripe Elements
  const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`

  return NextResponse.json({
    clientSecret: mockClientSecret,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock",
  })
}
