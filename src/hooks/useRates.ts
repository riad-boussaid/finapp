import { useQuery } from "@tanstack/react-query"
import { fetchCurrencyNames, fetchUsdRates, FALLBACK_USD_RATES } from "@/api/currencyApi"

export function useUsdRates() {
  return useQuery({
    queryKey: ["rates", "usd"],
    queryFn: fetchUsdRates,
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useCurrencyNames() {
  return useQuery({
    queryKey: ["currencyNames"],
    queryFn: fetchCurrencyNames,
    staleTime: 1000 * 60 * 60 * 24 * 30,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export type RatesState = {
  rates: Record<string, number>
  date?: string
  fetchedAt?: number
  isLive: boolean
  isPending: boolean
}

export function useRatesState(): RatesState {
  const query = useUsdRates()
  if (query.data) {
    return {
      rates: query.data.usd,
      date: query.data.date,
      fetchedAt: query.data.fetchedAt,
      isLive: true,
      isPending: false,
    }
  }
  return { rates: FALLBACK_USD_RATES, isLive: false, isPending: query.isPending }
}
