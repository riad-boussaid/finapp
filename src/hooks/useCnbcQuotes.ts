import { useQuery } from "@tanstack/react-query"
import { fetchCnbcQuotes } from "@/api/cnbcApi"

export function useCnbcQuotes() {
  return useQuery({
    queryKey: ["cnbc", "extended-commodities"],
    queryFn: () => fetchCnbcQuotes(),
    staleTime: 10 * 60_000,
    refetchInterval: 10 * 60_000,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 2,
    refetchOnWindowFocus: true,
  })
}
