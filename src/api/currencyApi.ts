import { z } from "zod"

const PRIMARY_HOST = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1"
const FALLBACK_HOST = "https://latest.currency-api.pages.dev/v1"

export const FALLBACK_USD_RATES: Record<string, number> = {
  usd: 1,
  dzd: 250,
}

const ratesResponseSchema = z.object({
  date: z.string(),
  usd: z.record(z.string(), z.number()),
})

const namesResponseSchema = z.record(z.string(), z.string())

export type RatesData = z.infer<typeof ratesResponseSchema> & { fetchedAt: number }
export type CurrencyNames = Record<string, string>

const ISO_CODE = /^[a-z]{3}$/

async function fetchJson<T>(paths: string[], parse: (data: unknown) => T): Promise<T> {
  let lastError: unknown = new Error("No hosts available")
  for (const path of paths) {
    try {
      const res = await fetch(path)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return parse(await res.json())
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

function urlsFor(file: string): string[] {
  return [`${PRIMARY_HOST}/${file}`, `${FALLBACK_HOST}/${file}`]
}

export async function fetchUsdRates(): Promise<RatesData> {
  const data = await fetchJson(urlsFor("currencies/usd.json"), ratesResponseSchema.parse)
  const usd: Record<string, number> = {}
  for (const [code, rate] of Object.entries(data.usd)) {
    if (ISO_CODE.test(code) && rate > 0) usd[code] = rate
  }
  if (!("dzd" in usd)) throw new Error("DZD missing from response")
  return { ...data, usd, fetchedAt: Date.now() }
}

export async function fetchCurrencyNames(): Promise<CurrencyNames> {
  const raw = await fetchJson(urlsFor("currencies.json"), namesResponseSchema.parse)
  const names: CurrencyNames = {}
  for (const [code, name] of Object.entries(raw)) {
    if (ISO_CODE.test(code)) names[code] = name
  }
  return names
}
