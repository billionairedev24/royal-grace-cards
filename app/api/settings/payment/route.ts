import { NextResponse } from "next/server"

// Proxy route to backend config endpoint for payment settings
export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customer/config`, {
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch config")
    }

    const config = await response.json()

    return NextResponse.json({
      stripeEnabled: config.stripeEnabled || false,
      zelleEnabled: config.zelleEnabled || false,
      cashappEnabled: config.cashappEnabled || false,
      zelleEmail: config.zelleEmail || "",
      zellePhone: config.zellePhone || "",
      cashappHandle: config.cashappHandle || "",
    })
  } catch (error) {
    console.error("Failed to fetch payment settings:", error)
    return NextResponse.json({ error: "Failed to fetch payment settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const paymentSettings = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(paymentSettings),
    })

    if (!response.ok) {
      throw new Error("Failed to update payment settings")
    }

    const updatedConfig = await response.json()

    return NextResponse.json({
      stripeEnabled: updatedConfig.stripeEnabled,
      zelleEnabled: updatedConfig.zelleEnabled,
      cashappEnabled: updatedConfig.cashappEnabled,
      zelleEmail: updatedConfig.zelleEmail,
      zellePhone: updatedConfig.zellePhone,
      cashappHandle: updatedConfig.cashappHandle,
    })
  } catch (error) {
    console.error("Failed to update payment settings:", error)
    return NextResponse.json({ error: "Failed to update payment settings" }, { status: 500 })
  }
}
