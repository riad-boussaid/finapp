import { create } from "zustand"
import { persist } from "zustand/middleware"

type CryptoState = {
  favorites: string[]
  toggleFavorite: (id: string) => void
}

export const useCryptoStore = create<CryptoState>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
    }),
    { name: "finapp-crypto" },
  ),
)
