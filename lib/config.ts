export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    return ""
  }

  return process.env.INTERNAL_API_BASE_URL!
}
