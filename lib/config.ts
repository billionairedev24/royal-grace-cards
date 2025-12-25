export function getApiBaseUrl(): string {
  // Check if we're on the server (Node.js) or client (browser)
  if (typeof window === 'undefined') {
    // Server-side: use Docker internal hostname
    return process.env.INTERNAL_API_URL || ""
  } else {
    // Client-side: use empty string (same domain, APIs are at root)
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9091"
  }
}