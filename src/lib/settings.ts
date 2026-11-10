export function normalizeProxyUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ""
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== "https:") return ""
    return url.origin
  } catch {
    return ""
  }
}
