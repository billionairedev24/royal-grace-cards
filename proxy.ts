import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {getApiBaseUrl} from "@/lib/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    // Check for session cookie (JSESSIONID from backend)
    const session = request.cookies.get("JSESSIONID")

    // If no session, redirect to backend login
    if (!session) {
      const loginUrl = new URL(`${getApiBaseUrl()}/login`)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
