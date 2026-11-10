import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import "./index.css"
import App from "./App"
import { Toaster } from "@/components/ui/sonner"
import { AppSync } from "@/components/AppSync"

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
