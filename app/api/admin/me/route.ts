import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {getApiBaseUrl} from "@/lib/config";


export async function GET() {
  try {
    const cookieStore = await cookies()
    const jsessionid = cookieStore.get("JSESSIONID")?.value

    if (!jsessionid) {
      return NextResponse.json({ authenticated: false, message: "No session" }, { status: 401 })
    }

    const response = await fetch(`${getApiBaseUrl()}/api/admin/me`, {
      headers: {
        "Cookie": `JSESSIONID=${jsessionid}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ authenticated: false }, { status: 401 })
      }
      throw new Error(`Backend returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching admin session:", error)
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
  }
}
