import { NextResponse } from "next/server"

// Proxy to backend API for single order operations
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${id}`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Order not found" }, { status: response.status })
    }

    const order = await response.json()
    return NextResponse.json(order)
  } catch (error) {
    console.error("Failed to fetch order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

// Proxy PATCH requests to backend
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to update order" }, { status: response.status })
    }

    const updatedOrder = await response.json()
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Failed to update order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

// Proxy DELETE requests to backend
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to delete order" }, { status: response.status })
    }

    const deletedOrder = await response.json()
    return NextResponse.json(deletedOrder)
  } catch (error) {
    console.error("Failed to delete order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
