import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Pair = { from: string; to: string }
export type RateSource = "official" | "parallel"

export const pairId = (p: Pair) => `${p.from}-${p.to}`

type AppState = {
  amount: string
  pair: Pair
  favorites: string[]
  source: RateSource
  setAmount: (amount: string) => void
  setPair: (pair: Pair) => void
  swapPair: () => void
  toggleFavorite: (pair: Pair) => void
  setSource: (source: RateSource) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      amount: "100",
      pair: { from: "usd", to: "dzd" },
      favorites: ["usd-dzd", "eur-dzd"],
      source: "official",
      setAmount: (amount) => set({ amount }),
      setPair: (pair) => set({ pair }),
      swapPair: () =>
        set((s) => ({ pair: { from: s.pair.to, to: s.pair.from } })),
      toggleFavorite: (pair) => {
        const id = pairId(pair)
        const exists = get().favorites.includes(id)
        set((s) => ({
          favorites: exists
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        }))
      },
      setSource: (source) => set({ source }),
    }),
    {
      name: "finapp-app",
    },
  ),
)
