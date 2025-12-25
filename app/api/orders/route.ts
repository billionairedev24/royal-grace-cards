import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {getApiBaseUrl} from "@/lib/config";


// Get all orders from backend
export async function GET() {
  try {
    const cookieStore = await cookies()
    const jsessionid = cookieStore.get("JSESSIONID")?.value
    
    const response = await fetch(`${getApiBaseUrl()}/api/orders`, {
      headers: {
        "Cookie": jsessionid ? `JSESSIONID=${jsessionid}` : "",
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      console.error("Backend did not return an array for orders. Response data:", data)
      // Return empty array to avoid frontend crash, but ensure we return something that is an array
      return NextResponse.json([])
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// Create new order on backend
export async function POST(request: Request) {
  try {
    const orderData = await request.json()
    const cookieStore = await cookies()
    const jsessionid = cookieStore.get("JSESSIONID")?.value

    const response = await fetch(`${getApiBaseUrl()}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": jsessionid ? `JSESSIONID=${jsessionid}` : "",
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    const newOrder = await response.json()
    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
