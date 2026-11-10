import { describe, expect, it } from "vitest"
import {
  involvesDzd,
  isStale,
  midRate,
  parallelCrossRate,
  premiumPercent,
  quoteAgeHours,
} from "./parallel"
import type { StreetQuotes } from "@/store/parallelStore"

const officialUsdRates = { dzd: 132.98, eur: 0.86, gbp: 0.74, usd: 1 }
const quotes: StreetQuotes = {
  usd: { buy: 235, sell: 237, at: Date.now() },
}

describe("midRate", () => {
  it("averages buy and sell", () => {
    expect(midRate({ buy: 235, sell: 237 })).toBe(236)
  })
})

describe("parallelRateToDzd via parallelCrossRate", () => {
  it("gives USD mid directly", () => {
    expect(parallelCrossRate("usd", "dzd", quotes, officialUsdRates)).toBe(236)
  })

  it("derives EUR from the USD anchor (sanity ≈ street)", () => {
    const eur = parallelCrossRate("eur", "dzd", quotes, officialUsdRates)!
    expect(eur).toBeGreaterThan(260)
    expect(eur).toBeLessThan(290)
    expect(eur).toBeCloseTo(236 / 0.86, 5)
  })

  it("inverts direction (dzd to usd)", () => {
    expect(parallelCrossRate("dzd", "usd", quotes, officialUsdRates)).toBeCloseTo(
      1 / 236,
      10,
    )
  })

  it("returns undefined without a USD quote", () => {
    expect(parallelCrossRate("eur", "dzd", {}, officialUsdRates)).toBeUndefined()
  })

  it("returns undefined for unknown currency", () => {
    expect(parallelCrossRate("xyz", "dzd", quotes, officialUsdRates)).toBeUndefined()
  })
})

describe("premiumPercent", () => {
  it("computes positive premium", () => {
    expect(premiumPercent(236, 132.98)).toBeCloseTo(
      ((236 - 132.98) / 132.98) * 100,
      6,
    )
  })

  it("guards against zero and NaN officials", () => {
    expect(premiumPercent(100, 0)).toBeNaN()
    expect(premiumPercent(NaN, 100)).toBeNaN()
  })
})

describe("staleness", () => {
  const now = Date.now()
  it("flags quotes older than 72h", () => {
    expect(isStale(now - 71 * 3_600_000, now)).toBe(false)
    expect(isStale(now - 73 * 3_600_000, now)).toBe(true)
  })
  it("computes age hours from timestamp", () => {
    expect(quoteAgeHours(now - 3_600_000 * 2, now)).toBeCloseTo(2)
  })
})

describe("involvesDzd", () => {
  it("detects DZD on either side only", () => {
    expect(involvesDzd("usd", "dzd")).toBe(true)
    expect(involvesDzd("dzd", "eur")).toBe(true)
    expect(involvesDzd("eur", "gbp")).toBe(false)
  })
})
