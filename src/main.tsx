import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import "./index.css"
import App from "./App"
import { Toaster } from "@/components/ui/sonner"
import { i18n } from "@/i18n"
import { applyTheme, useThemeStore } from "@/store/themeStore"
import { useSettingsStore } from "@/store/settingsStore"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 12,
      gcTime: 1000 * 60 * 60 * 24 * 365,
    },
  },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "finapp-query-cache",
})

function AppSync() {
  const theme = useThemeStore((s) => s.theme)
  const lang = useSettingsStore((s) => s.lang)
  useEffect(() => {
    applyTheme(theme)
  }, [theme])
  useEffect(() => {
    void i18n.changeLanguage(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
    document.title = i18n.t("app.title")
  }, [lang])
  return null
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 365 }}
    >
      <BrowserRouter>
        <AppSync />
        <App />
        <Toaster position="top-center" />
      </BrowserRouter>
    </PersistQueryClientProvider>
  </StrictMode>,
)
