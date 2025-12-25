export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9091"
}
