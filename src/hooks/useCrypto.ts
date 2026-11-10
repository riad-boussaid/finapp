import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { fetchCoinMeta, fetchMarketChart, fetchTopCoins } from "@/api/coingeckoApi"

export function useTopCoins(perPage = 100) {
  return useInfiniteQuery({
    // "paged" busts persisted caches written before load-more existed
    // (they hold a plain MarketCoin[] where InfiniteData.pages is expected).
    queryKey: ["crypto", "top", perPage, "paged"],
    queryFn: ({ pageParam }) => fetchTopCoins(perPage, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < perPage ? undefined : allPages.length + 1,
    staleTime: 5 * 60_000,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 2,
    refetchOnWindowFocus: true,
  })
}

export function useCoinMeta(coinId: string | undefined) {
  return useQuery({
    queryKey: ["crypto", "meta", coinId],
    queryFn: () => fetchCoinMeta(coinId!),
    enabled: !!coinId,
    staleTime: 5 * 60_000,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}

export function useMarketChart(coinId: string | undefined, days: number) {
  return useQuery({
    queryKey: ["crypto", "chart", coinId, days],
    queryFn: () => fetchMarketChart(coinId!, days),
    enabled: !!coinId,
    staleTime: 10 * 60_000,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 2,
    refetchOnWindowFocus: false,
  })
}
