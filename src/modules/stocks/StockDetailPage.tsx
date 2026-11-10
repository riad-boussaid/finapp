import { useState } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AreaChart } from "@/components/charts/AreaChart"
import { useStockChart } from "@/hooks/useStocks"
import { formatMoneySmart, formatSignedPct } from "@/lib/format"

const RANGES = [
  ["1M", "1mo", "1d"],
  ["3M", "3mo", "1d"],
  ["6M", "6mo", "1d"],
  ["1Y", "1y", "1d"],
] as const

function Chart({ symbol, range, interval }: { symbol: string; range: string; interval: string }) {
  const { t } = useTranslation()
  const chartQuery = useStockChart(symbol, range, interval)
  const points = chartQuery.data?.points ?? []
  const rising = points.length > 1 ? points.at(-1)![1] >= points[0][1] : true

  if (chartQuery.isPending) {
    return <Skeleton className="h-64 w-full rounded-xl" />
  }
  if (chartQuery.isError) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        {t("stockDetail.chartError")}
      </p>
    )
  }
  return (
    <div className="space-y-2">
      <AreaChart points={points} height={256} />
      <p className="text-center text-xs text-muted-foreground">
        {rising
          ? t("stockDetail.captionUp", { range: range.toUpperCase() })
          : t("stockDetail.captionDown", { range: range.toUpperCase() })}
      </p>
    </div>
  )
}

export function StockDetailPage() {
  const { t } = useTranslation()
  const { symbol = "" } = useParams()
  const [active, setActive] = useState<(typeof RANGES)[number]>(RANGES[1])
  const chartQuery = useStockChart(symbol, active[1], active[2])
  const meta = chartQuery.data

  const changePct =
    meta?.price != null && meta?.previousClose
      ? ((meta.price - meta.previousClose) / meta.previousClose) * 100
      : null

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ms-2">
        <Link to="/stocks">
          <ArrowLeft className="size-4 rtl:-scale-x-100" /> {t("stockDetail.back")}
        </Link>
      </Button>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <CardTitle className="font-mono text-2xl tracking-tight">
              {symbol}
            </CardTitle>
            {meta?.name && meta.name !== symbol ? (
              <span className="text-sm text-muted-foreground">{meta.name}</span>
            ) : null}
            {changePct != null ? (
              <Badge variant="outline" className={`${changePct >= 0 ? "text-profit" : "text-loss"} tabular-nums`}>
                <span dir="ltr">{formatSignedPct(changePct)}</span>{" "}
                {t("stockDetail.today")}
              </Badge>
            ) : null}
          </div>
          {meta?.price != null ? (
            <p className="text-3xl font-semibold tabular-nums">
              {formatMoneySmart(meta.price, (meta.currency ?? "usd").toLowerCase())}
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {RANGES.map((r) => (
                <Button
                  key={r[0]}
                  size="sm"
                  variant={active[0] === r[0] ? "secondary" : "ghost"}
                  onClick={() => setActive(r)}
                >
                  {r[0]}
                </Button>
              ))}
            </div>
          </div>
          <Chart symbol={symbol} range={active[1]} interval={active[2]} />
        </CardContent>
      </Card>
    </div>
  )
}
