import { useQuery } from "@tanstack/react-query"
import { fetchMetal, type MetalSymbol } from "@/api/metalsApi"

export function useMetal(symbol: MetalSymbol) {
  return useQuery({
    queryKey: ["metal", symbol],
    queryFn: () => fetchMetal(symbol),
    staleTime: 10 * 60_000,
    refetchInterval: 10 * 60_000,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 2,
    refetchOnWindowFocus: true,
  })
}
