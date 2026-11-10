import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { METAL_LABELS, METAL_SYMBOLS, type MetalData, type MetalSymbol } from "@/api/metalsApi"
import { useRatesState } from "@/hooks/useRates"
import { useMetal } from "@/hooks/useMetals"
import { useCnbcQuotes } from "@/hooks/useCnbcQuotes"
import type { CnbcQuote } from "@/lib/cnbc"
import { formatCommodityPrice } from "@/lib/cnbc"
import { formatSignedPct } from "@/lib/format"
import {
  CARAT_FRACTIONS,
  caratPricePerGram,
  convertUsdToDzd,
  pricePerGram,
  type Carat,
} from "@/lib/metals"
import { formatMoney, formatRelativeTime } from "@/lib/format"
import { useMetalsStore } from "@/store/metalsStore"

const ACCENTS: Record<MetalSymbol, string> = {
  XAU: "#f5c542",
  XAG: "#c0c7d1",
  XPT: "#8fd4d9",
  XPD: "#c9a2e0",
}

export function CommoditiesPage() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("commodities.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("commodities.subtitle")}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {METAL_SYMBOLS.map((symbol) => (
          <MetalCard key={symbol} symbol={symbol} />
        ))}
      </div>
      <ExtendedCommoditiesCard />
    </div>
  )
}

function MetalCard({ symbol }: { symbol: MetalSymbol }) {
  const { t } = useTranslation()
  const query = useMetal(symbol)
  const dzdRate = useRatesState().rates.dzd
  const logPrice = useMetalsStore((s) => s.logPrice)

  useEffect(() => {
    if (query.data) logPrice(query.data.symbol as MetalSymbol, query.data.price)
  }, [query.data, logPrice])

  const data = query.data

  return (
    <Card className="overflow-hidden">
      <div className="h-1 w-full" style={{ background: ACCENTS[symbol] }} />
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ background: ACCENTS[symbol] }}
            />
            <span className="font-medium">{METAL_LABELS[symbol]}</span>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {symbol}
          </Badge>
        </div>

        {query.isPending || !data || !dzdRate ? (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : query.isError ? (
          <p className="pt-1 text-sm text-destructive">
            {t("commodities.loadFailed")}
          </p>
        ) : (
          <MetalValues symbol={symbol} data={data} dzdRate={dzdRate} />
        )}
      </CardContent>
    </Card>
  )
}

function MetalValues({
  symbol,
  data,
  dzdRate,
}: {
  symbol: MetalSymbol
  data: MetalData
  dzdRate: number
}) {
  const { t } = useTranslation()
  const perGramUsd = pricePerGram(data.price)
  const perGramDzd = convertUsdToDzd(perGramUsd, dzdRate)
  const perOztDzd = convertUsdToDzd(data.price, dzdRate)

  return (
    <>
      <div className="text-3xl font-semibold tabular-nums tracking-tight">
        {formatMoney(data.price, data.currency)}
        <span className="ms-1.5 text-sm font-normal text-muted-foreground">
          {t("commodities.ozt")}
        </span>
      </div>

      <div className="space-y-1.5 text-sm">
        <ValueRow label={t("commodities.perOztDzd")} value={formatMoney(perOztDzd, "dzd")} />
        <ValueRow label={t("commodities.perGUsd")} value={formatMoney(perGramUsd, "usd")} />
        <ValueRow label={t("commodities.perGDzd")} value={formatMoney(perGramDzd, "dzd")} />
      </div>

      {symbol === "XAU" && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CARAT_FRACTIONS) as unknown as Carat[]).map(
              (carat) => (
                <Badge key={carat} variant="outline" className="gap-1 font-normal">
                  {carat}K
                  <span className="tabular-nums text-muted-foreground">
                    {formatMoney(
                      caratPricePerGram(perGramDzd, carat),
                      "dzd",
                    )}
                  </span>
                </Badge>
              ),
            )}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        {t("commodities.updated", { time: formatRelativeTime(data.updatedAt) })}
      </p>
    </>
  )
}

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}

function ExtendedCommoditiesCard() {
  const { t } = useTranslation()
  const query = useCnbcQuotes()

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              {t("commodities.boardTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("commodities.boardSubtitle")}
            </p>
          </div>
          {!query.isPending && !query.isError && (
            <Badge variant="outline" className="gap-1.5 text-xs">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-profit opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-profit" />
              </span>
              {t("commodities.liveBoard")}
            </Badge>
          )}
        </div>

        {query.isPending ? (
          <div className="space-y-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : query.isError || !query.data?.length ? (
          <p className="py-4 text-sm text-muted-foreground">
            {t("commodities.boardUnavailable")}
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {query.data.map((q) => (
              <QuoteRow key={q.symbol} quote={q} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function QuoteRow({ quote }: { quote: CnbcQuote }) {
  const up = (quote.change ?? 0) > 0
  const down = (quote.change ?? 0) < 0
  const deltaClass = up
    ? "text-profit bg-profit/10 border-profit/30"
    : down
      ? "text-loss bg-loss/10 border-loss/30"
      : "text-muted-foreground"

  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <span className="text-sm font-medium">{quote.label}</span>
        <span className="ms-2 text-xs text-muted-foreground">{quote.unit}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm font-semibold tabular-nums">
          {formatCommodityPrice(quote.price)}
        </span>
        <span
          dir="ltr"
          className={`inline-flex min-w-[72px] justify-end rounded-md border px-1.5 py-0.5 text-xs tabular-nums ${deltaClass}`}
        >
          {formatSignedPct(quote.changePct)}
        </span>
      </div>
    </li>
  )
}
