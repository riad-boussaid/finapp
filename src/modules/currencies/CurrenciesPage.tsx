import { useMemo, useState } from "react"
import { ArrowLeftRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CurrencyPicker } from "@/components/currency/CurrencyPicker"
import { FavoritesBar } from "@/components/currency/FavoritesBar"
import { StreetRatesDialog } from "@/components/currency/StreetRatesDialog"
import { useCurrencyNames, useRatesState } from "@/hooks/useRates"
import { commonAmounts, convertAmount, crossRate } from "@/lib/convert"
import { currentLocale } from "@/i18n"
import {
  formatMoneySmart,
  formatMoney,
  formatRate,
  formatRelativeTime,
} from "@/lib/format"
import {
  involvesDzd,
  isStale,
  midRate,
  parallelCrossRate,
  premiumPercent,
} from "@/lib/parallel"
import { useAppStore, type RateSource } from "@/store/appStore"
import { useParallelStore } from "@/store/parallelStore"

function parseAmount(raw: string): number | null | undefined {
  if (raw.trim() === "") return null
  const n = Number.parseFloat(raw)
  return Number.isNaN(n) ? undefined : n
}

export function CurrenciesPage() {
  const { t } = useTranslation()
  const amountRaw = useAppStore((s) => s.amount)
  const setAmount = useAppStore((s) => s.setAmount)
  const pair = useAppStore((s) => s.pair)
  const setPair = useAppStore((s) => s.setPair)
  const swapPair = useAppStore((s) => s.swapPair)
  const source = useAppStore((s) => s.source)
  const setSource = useAppStore((s) => s.setSource)

  const streetQuotes = useParallelStore((s) => s.latest)

  const { rates, fetchedAt, isLive, isPending } = useRatesState()
  const names = useCurrencyNames().data
  const fallbackCodes = useMemo(() => Object.keys(rates).sort(), [rates])

  const [dialogOpen, setDialogOpen] = useState(false)

  const pairAllowsParallel = involvesDzd(pair.from, pair.to)
  const effectiveSource: RateSource =
    source === "parallel" && pairAllowsParallel ? "parallel" : "official"

  const officialRate = useMemo(
    () => crossRate(rates, pair.from, pair.to),
    [rates, pair.from, pair.to],
  )

  const parallelRate = useMemo(
    () =>
      pairAllowsParallel
        ? parallelCrossRate(pair.from, pair.to, streetQuotes, rates)
        : undefined,
    [pair.from, pair.to, pairAllowsParallel, streetQuotes, rates],
  )

  const rate =
    effectiveSource === "parallel" && parallelRate !== undefined
      ? parallelRate
      : officialRate

  const hasStreetQuotes = Object.keys(streetQuotes).length > 0
  const stalestQuoteAt = useMemo(
    () =>
      Object.values(streetQuotes).reduce<number | undefined>(
        (min, q) => (min === undefined || q.at < min ? q.at : min),
        undefined,
      ),
    [streetQuotes],
  )
  const quotesStale = stalestQuoteAt !== undefined && isStale(stalestQuoteAt)

  const foreignCode = pair.from === "dzd" ? pair.to : pair.from
  const directQuote =
    effectiveSource === "parallel" ? streetQuotes[foreignCode] : undefined
  const usdMid =
    effectiveSource === "parallel" && streetQuotes.usd
      ? midRate(streetQuotes.usd)
      : undefined

  const premium =
    effectiveSource === "parallel" &&
    parallelRate !== undefined &&
    Number.isFinite(officialRate)
      ? premiumPercent(parallelRate, officialRate)
      : NaN

  const parsed = parseAmount(amountRaw)
  const hasError =
    parsed === undefined ||
    (parsed !== null && (parsed < 0 || !Number.isFinite(parsed)))
  const result = parsed && !hasError ? convertAmount(parsed, rate) : null

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("currencies.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("currencies.subtitle")}
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <FavoritesBar onPick={setPair} />
              <div className="flex items-center gap-2">
                <FreshnessBadge
                  isLive={isLive}
                  isPending={isPending}
                  fetchedAt={fetchedAt}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-5 px-2 text-xs"
                  onClick={() => setDialogOpen(true)}
                >
                  {t("currencies.streetRatesBtn")}
                </Button>
              </div>
            </div>

            <div className="flex justify-center pt-1">
              <SourceToggle
                value={effectiveSource}
                disabled={!pairAllowsParallel}
                hasQuotes={hasStreetQuotes}
                stale={quotesStale}
                onChange={setSource}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
              <CurrencyPicker
                value={pair.from}
                names={names}
                fallbackCodes={fallbackCodes}
                onSelect={(code) => setPair({ ...pair, from: code })}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={swapPair}
                aria-label="Swap currencies"
                className="mt-2 rounded-full"
              >
                <ArrowLeftRight className="size-4" />
              </Button>
              <CurrencyPicker
                value={pair.to}
                names={names}
                fallbackCodes={fallbackCodes}
                onSelect={(code: string) => setPair({ ...pair, to: code })}
              />
            </div>

            <Input
              value={amountRaw}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder={t("currencies.amountPlaceholder", {
                code: pair.from.toUpperCase(),
              })}
              aria-invalid={hasError}
              className="h-14 text-lg font-medium tabular-nums"
            />

            {hasError ? (
              <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {parsed === undefined
                  ? t("currencies.errInvalidNumber")
                  : t("currencies.errPositive")}
              </p>
            ) : result === null ? (
              <div className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                {t("currencies.typeHint", {
                  from: pair.from.toUpperCase(),
                  to: pair.to.toUpperCase(),
                })}
              </div>
            ) : (
              <div
                className={`rounded-lg px-4 py-4 ring-1 ${
                  effectiveSource === "parallel"
                    ? "bg-yellow-400/5 ring-yellow-400/30"
                    : "bg-primary/5 ring-primary/20"
                }`}
              >
                <div className="text-xs text-muted-foreground">
                  <span dir="auto">{formatMoney(parsed!, pair.from)}</span>{" "}
                  {t("currencies.equals")}
                  {effectiveSource === "parallel" &&
                    ` (${t("currencies.streetTag")})`}
                </div>
                <div className="mt-0.5 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                  {isPending ? (
                    <Skeleton className="h-9 w-56" />
                  ) : (
                    formatMoneySmart(result, pair.to)
                  )}
                </div>

                {!isPending && (
                  <div className="mt-2 space-y-1.5">
                    <div className="text-xs text-muted-foreground">
                      <span dir="ltr" className="tabular-nums">
                        {t("currencies.perUnit", {
                          from: pair.from.toUpperCase(),
                          rate: formatRate(rate),
                          to: pair.to.toUpperCase(),
                        })}
                      </span>
                      {effectiveSource === "parallel"
                        ? ""
                        : ` · ${t("currencies.officialTag")}`}
                    </div>

                    {effectiveSource === "parallel" && !hasStreetQuotes && (
                      <p className="text-xs text-yellow-500/90">
                        {t("currencies.noStreetQuotes")}
                      </p>
                    )}

                    {effectiveSource === "parallel" && directQuote && (
                      <div className="text-xs text-muted-foreground">
                        {t("currencies.streetBuySell", {
                          buy: formatRate(directQuote.buy),
                          sell: formatRate(directQuote.sell),
                        })}{" "}
                        {quotesStale && (
                          <span className="text-yellow-500/90">
                            · {t("common.stale")}
                          </span>
                        )}
                      </div>
                    )}
                    {effectiveSource === "parallel" &&
                      !directQuote &&
                      usdMid !== undefined &&
                      Number.isFinite(parallelRate ?? NaN) && (
                        <div className="text-xs text-muted-foreground">
                          {t("currencies.derivedFromUsd", {
                            rate: formatRate(usdMid),
                          })}
                        </div>
                      )}

                    {effectiveSource === "parallel" &&
                      Number.isFinite(premium) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">
                          <span>
                            {t("currencies.officialRate", {
                              rate: formatRate(officialRate),
                            })}
                          </span>
                          <span>·</span>
                          <span>
                            {t("currencies.parallelRate", {
                              rate: formatRate(parallelRate!),
                            })}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-profit/40 text-profit"
                          >
                            <span dir="ltr">+{premium.toFixed(1)}%</span>{" "}
                            {t("currencies.premium")}
                          </Badge>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("currencies.commonTitle", {
                from: pair.from.toUpperCase(),
                to: pair.to.toUpperCase(),
              })}
            </CardTitle>
            <CardDescription>
              {t("currencies.tapRow")}
              {!Number.isFinite(rate) && ` · ${t("currencies.pairUnavailable")}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="ps-6">{pair.from.toUpperCase()}</TableHead>
                  <TableHead className="pe-6 text-end">
                    {pair.to.toUpperCase()}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commonAmounts.map((amount) => (
                  <TableRow
                    key={amount}
                    className="cursor-pointer"
                    onClick={() => setAmount(String(amount))}
                  >
                    <TableCell className="py-2.5 ps-6 font-medium tabular-nums">
                      {amount.toLocaleString(currentLocale())}
                    </TableCell>
                    <TableCell className="py-2.5 pe-6 text-end tabular-nums text-muted-foreground">
                      {Number.isFinite(rate)
                        ? formatMoney(convertAmount(amount, rate), pair.to)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          {t("currencies.disclaimer")}
        </p>
      </div>

      <StreetRatesDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </TooltipProvider>
  )
}

function FreshnessBadge({
  isLive,
  isPending,
  fetchedAt,
}: {
  isLive: boolean
  isPending: boolean
  fetchedAt?: number
}) {
  const { t } = useTranslation()
  if (isPending) return <Skeleton className="h-5 w-28" />
  if (!isLive) {
    return (
      <Badge variant="outline" className="text-xs">
        {t("currencies.offlineCached")}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1.5 text-xs">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-profit opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-profit" />
      </span>
      {t("common.live")}
      {fetchedAt ? ` · ${formatRelativeTime(fetchedAt)}` : ""}
    </Badge>
  )
}

function SourceToggle({
  value,
  disabled,
  hasQuotes,
  stale,
  onChange,
}: {
  value: RateSource
  disabled: boolean
  hasQuotes: boolean
  stale: boolean
  onChange: (s: RateSource) => void
}) {
  const { t } = useTranslation()
  const options: { id: RateSource; label: string }[] = [
    { id: "official", label: t("currencies.sourceOfficial") },
    { id: "parallel", label: t("currencies.sourceParallel") },
  ]
  const toggle = (
    <div
      role="tablist"
      aria-label={t("currencies.sourceAria")}
      className={`inline-flex rounded-lg bg-muted p-0.5 ${disabled ? "opacity-40" : ""}`}
    >
      {options.map((opt) => {
        const active = value === opt.id
        const showStaleDot = opt.id === "parallel" && hasQuotes && stale
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm transition-colors ${
              active
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            } ${disabled ? "cursor-not-allowed" : ""}`}
          >
            {showStaleDot && <span className="size-1.5 rounded-full bg-yellow-400" />}
            {opt.label}
            {opt.id === "parallel" && !hasQuotes && (
              <span className="text-[10px] uppercase text-muted-foreground">
                {t("currencies.sourceSetup")}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
  if (!disabled) return toggle
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0}>{toggle}</span>
      </TooltipTrigger>
      <TooltipContent>
        {t("currencies.parallelOnlyDzd")}
      </TooltipContent>
    </Tooltip>
  )
}
