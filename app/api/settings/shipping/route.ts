import { NextResponse } from "next/server"
import { cookies } from "next/headers"


// Get shipping settings from backend
export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/shipping`)
    if (!response.ok) throw new Error(`Backend returned ${response.status}`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching shipping settings:", error)
    return NextResponse.json({ error: "Failed to fetch shipping settings" }, { status: 500 })
  }
}

// Update shipping settings on backend
export async function PUT(request: Request) {
  try {
    const updates = await request.json()
    const cookieStore = await cookies()
    const jsessionid = cookieStore.get("JSESSIONID")?.value

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/shipping`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Cookie": jsessionid ? `JSESSIONID=${jsessionid}` : "",
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) throw new Error(`Backend returned ${response.status}`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating shipping settings:", error)
    return NextResponse.json({ error: "Failed to update shipping settings" }, { status: 500 })
  }
}
