import { create } from "zustand"
import { persist } from "zustand/middleware"

export type StreetQuote = { buy: number; sell: number; at: number }
export type StreetQuotes = Record<string, StreetQuote>

export const coreCurrencies = ["usd", "eur", "gbp", "cad"] as const

const MAX_HISTORY = 365

type ParallelState = {
  latest: StreetQuotes
  history: Record<string, StreetQuote[]>
  setQuotes: (
    quotes: Record<string, { buy: number; sell: number }>,
    at?: number,
  ) => void
  clearHistory: () => void
}

export const useParallelStore = create<ParallelState>()(
  persist(
    (set) => ({
      latest: {},
      history: {},
      setQuotes: (quotes, at = Date.now()) =>
        set((s) => {
          const latest = { ...s.latest }
          const history = { ...s.history }
          for (const [code, q] of Object.entries(quotes)) {
            if (!Number.isFinite(q.buy) || !Number.isFinite(q.sell)) continue
            if (q.buy < 0 || q.sell < 0 || q.sell < q.buy) continue
            const entry: StreetQuote = { buy: q.buy, sell: q.sell, at }
            latest[code] = entry
            const log = [...(history[code] ?? [])]
            const last = log.at(-1)
            if (!last || last.buy !== entry.buy || last.sell !== entry.sell) {
              log.push(entry)
            } else {
              log[log.length - 1] = entry
            }
            history[code] = log.slice(-MAX_HISTORY)
          }
          return { latest, history }
        }),
      clearHistory: () => set({ history: {} }),
    }),
    { name: "finapp-parallel" },
  ),
)
