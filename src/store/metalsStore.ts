import { create } from "zustand"
import { persist } from "zustand/middleware"

export type MetalPoint = { price: number; at: number }

const MAX_POINTS = 365

type MetalsState = {
  history: Record<string, MetalPoint[]>
  logPrice: (symbol: string, price: number, at?: number) => void
  clearHistory: () => void
}

function dayKey(at: number): number {
  return Math.floor(at / 86_400_000)
}

export const useMetalsStore = create<MetalsState>()(
  persist(
    (set) => ({
      history: {},
      logPrice: (symbol, price, at = Date.now()) =>
        set((s) => {
          if (!Number.isFinite(price) || price <= 0) return s
          const log = [...(s.history[symbol] ?? [])]
          const last = log.at(-1)
          if (last && dayKey(last.at) === dayKey(at)) {
            log[log.length - 1] = { price, at }
          } else {
            log.push({ price, at })
          }
          return {
            history: { ...s.history, [symbol]: log.slice(-MAX_POINTS) },
          }
        }),
      clearHistory: () => set({ history: {} }),
    }),
    { name: "finapp-metals" },
  ),
)
