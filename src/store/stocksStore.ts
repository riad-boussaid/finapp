import { create } from "zustand"
import { persist } from "zustand/middleware"

const DEFAULT_WATCHLIST = ["^GSPC", "^IXIC", "^DJI"]

type StocksState = {
  symbols: string[]
  addSymbol: (symbol: string) => boolean
  removeSymbol: (symbol: string) => void
}

export const useStocksStore = create<StocksState>()(
  persist(
    (set) => ({
      symbols: DEFAULT_WATCHLIST,
      addSymbol: (symbol) => {
        let added = false
        set((s) => {
          if (s.symbols.includes(symbol) || s.symbols.length >= 25) return s
          added = true
          return { symbols: [...s.symbols, symbol] }
        })
        return added
      },
      removeSymbol: (symbol) =>
        set((s) => ({ symbols: s.symbols.filter((x) => x !== symbol) })),
    }),
    { name: "finapp-stocks" },
  ),
)
