import { describe, expect, it } from "vitest"
import {
  formatMoney,
  formatMoneySmart,
  formatRate,
  formatRelativeTime,
  formatSignedPct,
} from "./format"

describe("formatMoney", () => {
  it("formats with currency symbol or code", () => {
    const out = formatMoney(1234.5, "usd")
    expect(out).toMatch(/1,234\.50/)
    expect(out).toMatch(/\$|USD/)
  })

  it("renders unknown codes in currency position", () => {
    const out = formatMoney(10, "xyz")
    expect(out).toMatch(/XYZ/)
    expect(out).toMatch(/10\.00/)
  })
})

describe("formatMoneySmart", () => {
  it("uses extra precision below 1", () => {
    const out = formatMoneySmart(0.000023456, "usd")
    expect(out.replace(/[^0-9.]/g, "")).toMatch(/0\.000023/)
  })

  it("keeps 2 decimals for normal values", () => {
    const out = formatMoneySmart(250.5, "dzd")
    expect(out).toMatch(/250[.,]50/)
  })
})

describe("formatRate", () => {
  it("uses 4 digits above 1 and 6 below", () => {
    expect(formatRate(249.85317)).toBe("249.8532")
    expect(formatRate(0.000123456)).toBe("0.000123")
  })
})

describe("formatSignedPct", () => {
  it("signs positives and keeps negatives as-is", () => {
    expect(formatSignedPct(1.234)).toBe("+1.23%")
    expect(formatSignedPct(-0.5)).toBe("-0.50%")
  })

  it("renders dash for null/NaN", () => {
    expect(formatSignedPct(null)).toBe("—")
    expect(formatSignedPct(NaN)).toBe("—")
  })
})

describe("formatRelativeTime", () => {
  it("describes past moments with a suffix", () => {
    const twoHoursAgo = Date.now() - 2 * 3_600_000
    expect(formatRelativeTime(twoHoursAgo)).toMatch(/2 hours ago/)
  })

  it("handles just-now timestamps", () => {
    expect(formatRelativeTime(Date.now() - 5000)).toMatch(/second|now/)
  })
})
