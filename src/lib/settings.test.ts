import { describe, expect, it } from "vitest"
import { normalizeProxyUrl } from "./settings"

describe("normalizeProxyUrl", () => {
  it("keeps clean https origins", () => {
    expect(normalizeProxyUrl("https://finapp-proxy.foo.workers.dev")).toBe(
      "https://finapp-proxy.foo.workers.dev",
    )
  })

  it("adds https scheme and strips paths/query", () => {
    expect(normalizeProxyUrl("finapp-proxy.foo.workers.dev/quote?x=1")).toBe(
      "https://finapp-proxy.foo.workers.dev",
    )
    expect(normalizeProxyUrl("  http://localhost:8787/  ")).toBe("")
  })

  it("rejects garbage", () => {
    expect(normalizeProxyUrl("not a url")).toBe("")
    expect(normalizeProxyUrl("")).toBe("")
  })
})
