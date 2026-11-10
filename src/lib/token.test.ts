import { describe, expect, it } from "vitest"
import { formatCompactUsd, formatTokenPrice } from "./token"

describe("formatTokenPrice", () => {
  it("formats big prices with grouping and 2 decimals", () => {
    expect(formatTokenPrice(78277.12)).toBe("78,277.12")
  })

  it("gives small prices extra decimals", () => {
    expect(formatTokenPrice(2.7551)).toBe("2.7551")
  })

  it("uses significant digits below 1", () => {
    expect(formatTokenPrice(0.000023456)).toBe("0.0000235")
    expect(formatTokenPrice(0.5123)).toBe("0.512")
  })

  it("handles zero", () => {
    expect(formatTokenPrice(0)).toBe("0")
  })
})

describe("formatCompactUsd", () => {
  it("compacts trillions/billions", () => {
    expect(formatCompactUsd(1_550_000_000_000)).toBe("$1.55T")
    expect(formatCompactUsd(48_200_000_000)).toBe("$48.2B")
  })

  it("handles missing values", () => {
    expect(formatCompactUsd(null)).toBe("—")
    expect(formatCompactUsd(undefined)).toBe("—")
  })
})
