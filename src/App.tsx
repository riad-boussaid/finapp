import { Suspense, lazy } from "react"
import { Route, Routes } from "react-router"
import { Loader2 } from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"

const CurrenciesPage = lazy(() =>
  import("@/modules/currencies/CurrenciesPage").then((m) => ({ default: m.CurrenciesPage })),
)
const CommoditiesPage = lazy(() =>
  import("@/modules/commodities/CommoditiesPage").then((m) => ({ default: m.CommoditiesPage })),
)
const CryptoPage = lazy(() =>
  import("@/modules/crypto/CryptoPage").then((m) => ({ default: m.CryptoPage })),
)
const CoinDetailPage = lazy(() =>
  import("@/modules/crypto/CoinDetailPage").then((m) => ({ default: m.CoinDetailPage })),
)
const StocksPage = lazy(() =>
  import("@/modules/stocks/StocksPage").then((m) => ({ default: m.StocksPage })),
)
const StockDetailPage = lazy(() =>
  import("@/modules/stocks/StockDetailPage").then((m) => ({ default: m.StockDetailPage })),
)

function PageFallback() {
  return (
    <div className="flex min-h-64 items-center justify-center text-muted-foreground">
      <Loader2 className="size-6 animate-spin" aria-label="loading" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<CurrenciesPage />} />
          <Route path="commodities" element={<CommoditiesPage />} />
          <Route path="crypto" element={<CryptoPage />} />
          <Route path="crypto/:coinId" element={<CoinDetailPage />} />
          <Route path="stocks" element={<StocksPage />} />
          <Route path="stocks/:symbol" element={<StockDetailPage />} />
          <Route path="*" element={<CurrenciesPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
