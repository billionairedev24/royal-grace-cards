import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"


// Get single card from backend
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cards/${id}`)
    if (!response.ok) {
      return NextResponse.json({ error: "Card not found" }, { status: response.status })
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching card:", error)
    return NextResponse.json({ error: "Failed to fetch card" }, { status: 500 })
  }
}

// Update card on backend
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const cookieStore = await cookies()
    const jsessionid = cookieStore.get("JSESSIONID")?.value

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cards/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Cookie": jsessionid ? `JSESSIONID=${jsessionid}` : "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to update card" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to update card:", error)
    return NextResponse.json({ error: "Failed to update card" }, { status: 500 })
  }
}

// Delete card from backend
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const jsessionid = cookieStore.get("JSESSIONID")?.value

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cards/${id}`, {
      method: "DELETE",
      headers: {
        "Cookie": jsessionid ? `JSESSIONID=${jsessionid}` : "",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to delete card" }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete card:", error)
    return NextResponse.json({ error: "Failed to delete card" }, { status: 500 })
  }
}
