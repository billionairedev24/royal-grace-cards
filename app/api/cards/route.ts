import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"


// Get all cards from backend
export async function GET() {
  try {
    const cookieStore = await cookies()
    const jsessionid = cookieStore.get("JSESSIONID")?.value

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cards`, {
      headers: {
        "Cookie": jsessionid ? `JSESSIONID=${jsessionid}` : "",
      },
    })

    if (!response.ok) {
      console.error(`Backend returned ${response.status} for /api/cards`)
      return NextResponse.json({ error: `Backend error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    console.log('card data', data)
    
    if (!Array.isArray(data)) {
      console.error("Backend did not return an array for cards:", data)
      return NextResponse.json([]) // Return empty array to prevent frontend crash
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching cards:", error)
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookieStore = await cookies()
    const jsessionid = cookieStore.get("JSESSIONID")?.value

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": jsessionid ? `JSESSIONID=${jsessionid}` : "",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to create card" }, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating card:", error)
    return NextResponse.json({ error: "Failed to create card" }, { status: 500 })
  }
}
