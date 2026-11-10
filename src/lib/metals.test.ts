import { describe, expect, it } from "vitest"
import {
  GRAMS_PER_TROY_OUNCE,
  caratPricePerGram,
  convertUsdToDzd,
  pricePerGram,
} from "./metals"

describe("pricePerGram", () => {
  it("divides troy ounce price by 31.1034768", () => {
    expect(pricePerGram(GRAMS_PER_TROY_OUNCE)).toBe(1)
    expect(pricePerGram(GRAMS_PER_TROY_OUNCE * 50)).toBe(50)
    expect(pricePerGram(0)).toBe(0)
  })
})

describe("caratPricePerGram", () => {
  const g24 = 100
  it("scales by carat fraction", () => {
    expect(caratPricePerGram(g24, 24)).toBe(100)
    expect(caratPricePerGram(g24, 21)).toBeCloseTo(87.5)
    expect(caratPricePerGram(g24, 18)).toBeCloseTo(75)
  })
})

describe("convertUsdToDzd", () => {
  it("multiplies by rate", () => {
    expect(convertUsdToDzd(100, 132.98)).toBeCloseTo(13298)
  })
})
