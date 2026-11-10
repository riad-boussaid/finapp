import type { StreetQuotes } from "@/store/parallelStore"

export type Quote = { buy: number; sell: number }

export const STALE_AFTER_HOURS = 72

export function midRate(q: Quote): number {
  return (q.buy + q.sell) / 2
}

/** DZD received per 1 unit of `code` on the street. */
export function parallelRateToDzd(
  code: string,
  quotes: StreetQuotes,
  officialUsdRates: Record<string, number>,
): number | undefined {
  if (code === "dzd") return 1
  const usdQuote = quotes.usd
  if (!usdQuote) return undefined
  const midUsd = midRate(usdQuote)
  if (code === "usd") return midUsd
  const perUsd = officialUsdRates[code]
  if (!perUsd || perUsd <= 0) return undefined
  return midUsd / perUsd
}

/** Cross rate from → to priced off the street, valid when one side is DZD. */
export function parallelCrossRate(
  from: string,
  to: string,
  quotes: StreetQuotes,
  officialUsdRates: Record<string, number>,
): number | undefined {
  const fromDzd = parallelRateToDzd(from, quotes, officialUsdRates)
  const toDzd = parallelRateToDzd(to, quotes, officialUsdRates)
  if (!fromDzd || !toDzd) return undefined
  return fromDzd / toDzd
}

export function premiumPercent(parallel: number, official: number): number {
  if (!Number.isFinite(parallel) || !Number.isFinite(official) || official === 0) {
    return NaN
  }
  return ((parallel - official) / official) * 100
}

export function quoteAgeHours(at: number, now: number = Date.now()): number {
  return Math.max(0, (now - at) / 3_600_000)
}

export function isStale(at: number, now: number = Date.now()): boolean {
  return quoteAgeHours(at, now) > STALE_AFTER_HOURS
}

export function involvesDzd(a: string, b: string): boolean {
  return a === "dzd" || b === "dzd"
}
