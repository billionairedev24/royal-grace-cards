import { NextResponse } from "next/server"
import { mockOrders } from "@/lib/mock-data"

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 300))

  try {
    const { orderId, method } = await request.json()

    if (!orderId || !method) {
      return NextResponse.json({ error: "Missing orderId or method" }, { status: 400 })
    }

    const order = mockOrders.find((o) => o.id === orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // For QR code payments, mark as completed when customer confirms
    if (method === "zelle" || method === "cashapp") {
      const now = new Date().toISOString()

      order.paymentStatus = "completed"
      order.fulfillmentStatus = "processing"
      order.updatedAt = now

      if (!order.trackingUpdates) {
        order.trackingUpdates = []
      }

      order.trackingUpdates.push({
        status: "processing",
        timestamp: now,
        message: `Payment received via ${method}. Order is being prepared for shipment`,
      })

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        order,
      })
    }

    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
  } catch (error) {
    console.error("Failed to verify payment:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
