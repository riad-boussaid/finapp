import { describe, expect, it } from "vitest"
import { commonAmounts, convertAmount, crossRate } from "./convert"

const rates = { usd: 1, dzd: 250, eur: 1.1 }

describe("crossRate", () => {
  it("returns 1 for identical currencies", () => {
    expect(crossRate(rates, "usd", "usd")).toBe(1)
  })

  it("computes usd to dzd", () => {
    expect(crossRate(rates, "usd", "dzd")).toBe(250)
  })

  it("computes cross rate via usd base (eur to dzd)", () => {
    expect(crossRate(rates, "eur", "dzd")).toBeCloseTo(250 / 1.1)
  })

  it("computes inverse rate (dzd to eur)", () => {
    expect(crossRate(rates, "dzd", "eur")).toBeCloseTo(1.1 / 250)
  })

  it("returns NaN for missing currency", () => {
    expect(crossRate(rates, "usd", "xyz")).toBeNaN()
    expect(crossRate(rates, "xyz", "usd")).toBeNaN()
  })
})

describe("convertAmount", () => {
  it("multiplies amount by rate", () => {
    expect(convertAmount(10, 250)).toBe(2500)
    expect(convertAmount(2.5, 1.5)).toBe(3.75)
    expect(convertAmount(0, 250)).toBe(0)
  })
})

describe("commonAmounts", () => {
  it("is sorted ascending and unique", () => {
    for (let i = 1; i < commonAmounts.length; i++) {
      expect(commonAmounts[i]).toBeGreaterThan(commonAmounts[i - 1])
    }
  })
})
