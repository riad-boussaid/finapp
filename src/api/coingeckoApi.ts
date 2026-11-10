import { z } from "zod"

const BASE = "https://api.coingecko.com/api/v3"

const marketCoinSchema = z.looseObject({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string(),
  current_price: z.number(),
  market_cap: z.number().nullable().catch(null),
  market_cap_rank: z.number().nullable().catch(null),
  total_volume: z.number().nullable().catch(null),
  price_change_percentage_24h: z.number().nullable().catch(null),
  sparkline_in_7d: z
    .object({ price: z.array(z.number()) })
    .nullish()
    .catch(undefined),
})

export type MarketCoin = z.infer<typeof marketCoinSchema>

export async function fetchTopCoins(perPage = 100, page = 1): Promise<MarketCoin[]> {
  const url =
    `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc` +
    `&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = marketCoinSchema.array().parse(await res.json())
  if (data.length === 0) throw new Error("Empty markets response")
  return data
}

export async function fetchCoinMeta(id: string): Promise<MarketCoin | undefined> {
  const url =
    `${BASE}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(id)}` +
    `&sparkline=false&price_change_percentage=24h`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = marketCoinSchema.array().parse(await res.json())
  return data[0]
}

export type ChartPoint = { time: number; value: number }

export async function fetchMarketChart(
  coinId: string,
  days: number,
): Promise<ChartPoint[]> {
  const url = `${BASE}/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=${days}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const raw = z.object({ prices: z.tuple([z.number(), z.number()]).array() }).parse(
    await res.json(),
  )
  return raw.prices.map(([time, value]) => ({ time, value }))
}
