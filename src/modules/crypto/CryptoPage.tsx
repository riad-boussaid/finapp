import { useMemo, useState } from "react"
import { Link } from "react-router"
import { Search, Star } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Sparkline } from "@/components/crypto/Sparkline"
import { useTopCoins } from "@/hooks/useCrypto"
import type { MarketCoin } from "@/api/coingeckoApi"
import { formatCompactUsd, formatTokenPrice } from "@/lib/token"
import { formatSignedPct } from "@/lib/format"
import { useCryptoStore } from "@/store/cryptoStore"

export function CryptoPage() {
  const { t } = useTranslation()
  const query = useTopCoins()
  const [search, setSearch] = useState("")
  const favorites = useCryptoStore((s) => s.favorites)

  const coins = useMemo(() => {
    const data = query.data?.pages.flat() ?? []
    const q = search.trim().toLowerCase()
    const filtered = q
      ? data.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.symbol.toLowerCase().includes(q),
        )
      : data
    return [
      ...filtered.filter((c) => favorites.includes(c.id)),
      ...filtered.filter((c) => !favorites.includes(c.id)),
    ]
  }, [query.data, search, favorites])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("crypto.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("crypto.subtitle")}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-3">
            <Search className="absolute top-1/2 start-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("crypto.search")}
              className="ps-9"
            />
          </div>

          {query.isPending ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("crypto.loading")}
            </p>
          ) : query.isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              {t("crypto.loadError")}
            </p>
          ) : (
            <>
              <CryptoTable coins={coins} />
              {query.hasNextPage && (
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage
                    ? t("crypto.loadingMore")
                    : t("crypto.loadMore", { count: coins.length })}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CryptoTable({ coins }: { coins: MarketCoin[] }) {
  const { t } = useTranslation()
  const favorites = useCryptoStore((s) => s.favorites)
  const toggleFavorite = useCryptoStore((s) => s.toggleFavorite)

  if (coins.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t("crypto.noMatch")}
      </p>
    )
  }

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-8" />
          <TableHead className="hidden w-10 sm:table-cell">#</TableHead>
          <TableHead>{t("crypto.colCoin")}</TableHead>
          <TableHead className="w-24 text-end">{t("crypto.colPrice")}</TableHead>
          <TableHead className="w-20 text-end">{t("crypto.col24h")}</TableHead>
          <TableHead className="hidden w-24 text-end lg:table-cell">{t("crypto.colMktCap")}</TableHead>
          <TableHead className="hidden w-[120px] text-end lg:table-cell">{t("crypto.col7d")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coins.map((coin) => {
          const change = coin.price_change_percentage_24h
          const up = (change ?? 0) > 0
          const down = (change ?? 0) < 0
          const deltaClass = up
            ? "text-profit bg-profit/10 border-profit/30"
            : down
              ? "text-loss bg-loss/10 border-loss/30"
              : "text-muted-foreground"
          const isFavorite = favorites.includes(coin.id)
          const spark = coin.sparkline_in_7d?.price ?? []

          return (
            <TableRow key={coin.id} className="group">
              <TableCell className="pe-0">
                <button
                  type="button"
                  onClick={() => toggleFavorite(coin.id)}
                  aria-label={
                    isFavorite
                      ? t("crypto.unpin", { name: coin.name })
                      : t("crypto.pin", { name: coin.name })
                  }
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Star
                    className={`size-4 ${
                      isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                    }`}
                  />
                </button>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground tabular-nums hidden sm:table-cell">
                {coin.market_cap_rank ?? "—"}
              </TableCell>
              <TableCell>
                <Link
                  to={`/crypto/${coin.id}`}
                  className="flex items-center gap-2.5"
                >
                  <img
                    src={coin.image}
                    alt=""
                    loading="lazy"
                    className="size-6 rounded-full"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium group-hover:underline">
                      {coin.name}
                    </span>
                    <span className="block text-xs text-muted-foreground uppercase">
                      {coin.symbol}
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="text-end font-medium tabular-nums whitespace-nowrap">
                {formatTokenPrice(coin.current_price)}
              </TableCell>
              <TableCell className="text-end">
                <Badge
                  variant="outline"
                  dir="ltr"
                  className={`ms-auto min-w-[64px] justify-end tabular-nums ${deltaClass}`}
                >
                  {change === null || change === undefined
                    ? "—"
                    : formatSignedPct(change)}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-end tabular-nums text-muted-foreground lg:table-cell">
                {formatCompactUsd(coin.market_cap)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex justify-end" dir="ltr">
                  <Sparkline data={spark} positive={up} width={104} />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
