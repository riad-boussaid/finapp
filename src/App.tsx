import { Route, Routes } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { CurrenciesPage } from "@/modules/currencies/CurrenciesPage"
import { CommoditiesPage } from "@/modules/commodities/CommoditiesPage"
import { CryptoPage } from "@/modules/crypto/CryptoPage"
import { CoinDetailPage } from "@/modules/crypto/CoinDetailPage"
import { StocksPage } from "@/modules/stocks/StocksPage"
import { StockDetailPage } from "@/modules/stocks/StockDetailPage"

export default function App() {
  return (
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
  )
}
