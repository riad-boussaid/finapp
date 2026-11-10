import { describe, expect, it } from "vitest"
import { normalizeSymbol } from "./stocks"

describe("normalizeSymbol", () => {
  it("uppercases and accepts tickers with ^ . - =", () => {
    expect(normalizeSymbol(" aapl ")).toBe("AAPL")
    expect(normalizeSymbol("^gspc")).toBe("^GSPC")
    expect(normalizeSymbol("brk.b")).toBe("BRK.B")
  })

  it("rejects invalid input", () => {
    expect(normalizeSymbol("TOOLONGTICKER123")).toBeNull()
    expect(normalizeSymbol("AA PL")).toBeNull()
    expect(normalizeSymbol("")).toBeNull()
  })
})
