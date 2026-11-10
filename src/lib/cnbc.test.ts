import { describe, expect, it } from "vitest"
import { formatCommodityPrice, parseCnbcNumber } from "./cnbc"

describe("parseCnbcNumber", () => {
  it("parses plain and comma-grouped numbers", () => {
    expect(parseCnbcNumber("86.64")).toBeCloseTo(86.64, 10)
    expect(parseCnbcNumber("4,661.60")).toBeCloseTo(4661.6, 10)
    expect(parseCnbcNumber("1,240.25")).toBeCloseTo(1240.25, 10)
  })

  it("handles signed values and percent strings", () => {
    expect(parseCnbcNumber("+90.20")).toBeCloseTo(90.2, 10)
    expect(parseCnbcNumber("-0.19")).toBeCloseTo(-0.19, 10)
    expect(parseCnbcNumber("-0.22%")).toBeCloseTo(-0.22, 10)
    expect(parseCnbcNumber("+1.97%")).toBeCloseTo(1.97, 10)
  })

  it("maps UNCH to zero and junk to undefined", () => {
    expect(parseCnbcNumber("UNCH")).toBe(0)
    expect(parseCnbcNumber("unch")).toBe(0)
    expect(parseCnbcNumber("N/A")).toBeUndefined()
    expect(parseCnbcNumber(undefined)).toBeUndefined()
    expect(parseCnbcNumber("")).toBeUndefined()
  })
})

describe("formatCommodityPrice", () => {
  it("uses fewer decimals for big numbers", () => {
    expect(formatCommodityPrice(4661.6)).toBe("4,661.6")
    expect(formatCommodityPrice(2.755)).toBe("2.755")
  })
})
