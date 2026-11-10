import { z } from "zod"

const BASE = "https://api.gold-api.com"

const metalResponseSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  price: z.number().positive(),
  currency: z.string(),
  updatedAt: z.string(),
})

export type MetalData = z.infer<typeof metalResponseSchema> & {
  fetchedAt: number
}

export const METAL_SYMBOLS = ["XAU", "XAG", "XPT", "XPD"] as const
export type MetalSymbol = (typeof METAL_SYMBOLS)[number]

export const METAL_LABELS: Record<MetalSymbol, string> = {
  XAU: "Gold",
  XAG: "Silver",
  XPT: "Platinum",
  XPD: "Palladium",
}

export async function fetchMetal(symbol: MetalSymbol): Promise<MetalData> {
  const res = await fetch(`${BASE}/price/${symbol}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = metalResponseSchema.parse(await res.json())
  return { ...data, fetchedAt: Date.now() }
}
