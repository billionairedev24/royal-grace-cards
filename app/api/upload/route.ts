import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// Proxy image upload to backend
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const cookieStore = await cookies()
    const jsessionid = cookieStore.get("JSESSIONID")?.value

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
      method: "POST",
      headers: {
        "Cookie": jsessionid ? `JSESSIONID=${jsessionid}` : "",
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Backend upload error:", errorData)
      return NextResponse.json({ error: "Failed to upload images to backend" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to upload images:", error)
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 })
  }
}
