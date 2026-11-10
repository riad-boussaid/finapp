import { z } from "zod"
import { getProxyUrl } from "@/store/settingsStore"

// The proxy is our own worker, but validate its responses like every other
// API layer — bad data should fail the query, not the UI.
const quoteSchema = z.looseObject({
  symbol: z.string(),
  name: z.string().nullish().catch(undefined),
  currency: z.string().nullish().catch(undefined),
  exchange: z.string().nullish().catch(null),
  price: z.number().nullish().catch(null),
  previousClose: z.number().nullish().catch(null),
  change: z.number().nullish().catch(null),
  changePct: z.number().nullish().catch(null),
  error: z.string().nullish().catch(undefined),
})

const quotesResponseSchema = z.object({
  quotes: z.array(quoteSchema),
})

const chartResponseSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  currency: z.string(),
  price: z.number().nullable().catch(null),
  previousClose: z.number().nullable().catch(null),
  points: z.tuple([z.number(), z.number()]).array(),
})

export type StockQuote = z.infer<typeof quoteSchema>
export type StockChart = z.infer<typeof chartResponseSchema>

function proxyBase(): string {
  const base = getProxyUrl()
  if (!base) throw new Error("Proxy URL not configured")
  return base
}

async function proxyFetch<T>(path: string, parse: (data: unknown) => T): Promise<T> {
  const res = await fetch(`${proxyBase()}${path}`)
  if (!res.ok) throw new Error(`proxy ${res.status}`)
  return parse(await res.json())
}

export async function fetchStockQuotes(symbols: string[]): Promise<StockQuote[]> {
  if (symbols.length === 0) return []
  const data = await proxyFetch(
    `/quote?symbols=${encodeURIComponent(symbols.join(","))}`,
    quotesResponseSchema.parse,
  )
  return data.quotes
}

export async function fetchStockChart(
  symbol: string,
  range = "3mo",
  interval = "1d",
): Promise<StockChart> {
  return proxyFetch(
    `/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`,
    chartResponseSchema.parse,
  )
}
