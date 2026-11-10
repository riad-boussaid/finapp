import { useState } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AreaChart } from "@/components/charts/AreaChart"
import type { MarketCoin } from "@/api/coingeckoApi"
import { useCoinMeta, useMarketChart, useTopCoins } from "@/hooks/useCrypto"
import { formatTokenPrice } from "@/lib/token"
import type { ChartPoint } from "@/api/coingeckoApi"

const RANGES = [
  { label: "24H", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const

function pricePrecision(value: number): number {
  const abs = Math.abs(value)
  if (abs >= 1000) return 2
  if (abs >= 1) return 4
  if (abs === 0) return 2
  return 8
}

export function CoinDetailPage() {
  const { t } = useTranslation()
  const { coinId } = useParams<{ coinId: string }>()
  const [rangeDays, setRangeDays] = useState<number>(30)

  const topCoins = useTopCoins()
  const cached = topCoins.data?.pages.flat().find((c) => c.id === coinId)
  const meta = useCoinMeta(cached ? undefined : coinId)
  const info: MarketCoin | undefined = cached ?? meta.data
  const chart = useMarketChart(coinId, rangeDays)

  return (
    <div className="space-y-6">
      <Link
        to="/crypto"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:-scale-x-100" /> {t("nav.crypto")}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <CoinHeader info={info} chart={chart.data} />
        <div className="inline-flex rounded-lg bg-muted p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setRangeDays(r.days)}
              aria-selected={rangeDays === r.days}
              className={`rounded-md px-3 py-1 text-xs transition-colors ${
                rangeDays === r.days
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {chart.isPending || !chart.data ? (
            chart.isError ? (
              <p className="py-16 text-center text-sm text-destructive">
                {t("coin.chartError")}
              </p>
            ) : (
              <Skeleton className="h-[320px] w-full" />
            )
          ) : (
            <AreaChart
              points={chart.data.map((p) => [p.time, p.value])}
              height={320}
              precision={pricePrecision(chart.data.at(-1)!.value)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CoinHeader({
  info,
  chart,
}: {
  info: MarketCoin | undefined
  chart: ChartPoint[] | undefined
}) {
  const { t } = useTranslation()
  const latest = chart?.at(-1)?.value ?? info?.current_price
  const change = info?.price_change_percentage_24h
  const up = (change ?? 0) > 0
  const down = (change ?? 0) < 0

  return (
    <div className="flex items-center gap-3">
      {info && (
        <img src={info.image} alt="" className="size-10 rounded-full" />
      )}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {info?.name ?? "…"}
          </h1>
          {info?.symbol && (
            <Badge variant="secondary" className="uppercase">
              {info.symbol}
            </Badge>
          )}
          {change !== null && change !== undefined && (
            <Badge
              variant="outline"
              className={
                up
                  ? "text-profit border-profit/40"
                  : down
                    ? "text-loss border-loss/40"
                    : ""
              }
            >
              <span dir="ltr">
                {up ? "+" : ""}
                {change.toFixed(2)}%
              </span>{" "}
              {t("coin.change24h")}
            </Badge>
          )}
        </div>
        {latest !== undefined && (
          <p className="mt-0.5 text-2xl font-semibold tabular-nums">
            ${formatTokenPrice(latest)}
          </p>
        )}
      </div>
    </div>
  )
}
