import { useQuery } from "@tanstack/react-query"
import { fetchStockChart, fetchStockQuotes } from "@/api/yahooApi"
import { useSettingsStore } from "@/store/settingsStore"
import { useStocksStore } from "@/store/stocksStore"

export function useStockQuotes() {
  const symbols = useStocksStore((s) => s.symbols)
  const proxyUrl = useSettingsStore((s) => s.proxyUrl)
  const key = symbols.join(",")
  return useQuery({
    queryKey: ["stocks", "quotes", key],
    queryFn: () => fetchStockQuotes(symbols),
    enabled: Boolean(proxyUrl) && symbols.length > 0,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 120,
    retry: 1,
  })
}

export function useStockChart(symbol: string, range: string, interval = "1d") {
  const proxyUrl = useSettingsStore((s) => s.proxyUrl)
  return useQuery({
    queryKey: ["stocks", "chart", symbol, range, interval],
    queryFn: () => fetchStockChart(symbol, range, interval),
    enabled: Boolean(proxyUrl),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
