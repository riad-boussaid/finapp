import { create } from "zustand"
import { persist } from "zustand/middleware"
import { normalizeProxyUrl } from "@/lib/settings"
import type { Lang } from "@/i18n"

type SettingsState = {
  proxyUrl: string
  lang: Lang
  setProxyUrl: (url: string) => boolean
  setLang: (lang: Lang) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      proxyUrl: "",
      lang: "en",
      setProxyUrl: (input) => {
        const normalized = normalizeProxyUrl(input)
        if (!normalized) return false
        set({ proxyUrl: normalized })
        return true
      },
      setLang: (lang) => set({ lang }),
    }),
    { name: "finapp-settings" },
  ),
)

export function getProxyUrl(): string {
  return useSettingsStore.getState().proxyUrl
}
