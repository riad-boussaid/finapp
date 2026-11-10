import { useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDistanceToNowStrict } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { coreCurrencies, useParallelStore, type StreetQuotes } from "@/store/parallelStore"
import { dateFnsLocale } from "@/i18n"

type Draft = Record<string, { buy: string; sell: string }>

function draftFrom(quotes: StreetQuotes): Draft {
  return Object.fromEntries(
    coreCurrencies.map((code) => [
      code,
      quotes[code]
        ? {
            buy: String(quotes[code].buy),
            sell: String(quotes[code].sell),
          }
        : { buy: "", sell: "" },
    ]),
  )
}

function StreetRatesForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation()
  const latest = useParallelStore((s) => s.latest)
  const setQuotes = useParallelStore((s) => s.setQuotes)
  const [draft, setDraft] = useState<Draft>(() => draftFrom(latest))
  const [error, setError] = useState<string | null>(null)

  const update = (code: string, side: "buy" | "sell", value: string) => {
    setDraft((d) => ({ ...d, [code]: { ...d[code], [side]: value } }))
    setError(null)
  }

  const save = () => {
    const parsed: Record<string, { buy: number; sell: number }> = {}
    for (const code of coreCurrencies) {
      const { buy, sell } = draft[code]
      if (buy.trim() === "" && sell.trim() === "") continue
      const b = Number.parseFloat(buy)
      const s = Number.parseFloat(sell)
      if (
        Number.isNaN(b) ||
        Number.isNaN(s) ||
        b <= 0 ||
        s <= 0 ||
        !Number.isFinite(b) ||
        !Number.isFinite(s)
      ) {
        setError(t("streetRates.errBoth", { code: code.toUpperCase() }))
        return
      }
      if (s < b) {
        setError(t("streetRates.errSellGeBuy", { code: code.toUpperCase() }))
        return
      }
      parsed[code] = { buy: b, sell: s }
    }
    if (Object.keys(parsed).length === 0) {
      setError(t("streetRates.errNothing"))
      return
    }
    setQuotes(parsed)
    onDone()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("streetRates.title")}</DialogTitle>
        <DialogDescription>
          {t("streetRates.desc")}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_1fr_1fr_1.4fr] items-center gap-2 text-xs text-muted-foreground">
          <span />
          <span className="text-center">{t("streetRates.buy")}</span>
          <span className="text-center">{t("streetRates.sell")}</span>
          <span />
        </div>
        {coreCurrencies.map((code) => {
          const q = latest[code]
          return (
            <div key={code} className="grid grid-cols-[1fr_1fr_1fr_1.4fr] items-center gap-2">
              <span className="font-semibold">{code.toUpperCase()}</span>
              <Input
                dir="ltr"
                inputMode="decimal"
                value={draft[code].buy}
                onChange={(e) => update(code, "buy", e.target.value)}
                placeholder={t("streetRates.buy")}
                aria-label={t("streetRates.buyAria", { code: code.toUpperCase() })}
                className="h-9 text-right tabular-nums"
              />
              <Input
                dir="ltr"
                inputMode="decimal"
                value={draft[code].sell}
                onChange={(e) => update(code, "sell", e.target.value)}
                placeholder={t("streetRates.sell")}
                aria-label={t("streetRates.sellAria", { code: code.toUpperCase() })}
                className="h-9 text-right tabular-nums"
              />
              <span className="truncate text-xs text-muted-foreground">
                {q
                  ? formatDistanceToNowStrict(q.at, {
                      addSuffix: true,
                      locale: dateFnsLocale(),
                    })
                  : "—"}
              </span>
            </div>
          )
        })}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          {t("streetRates.derivedNote")}
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone}>
          {t("common.cancel")}
        </Button>
        <Button onClick={save}>{t("common.save")}</Button>
      </DialogFooter>
    </>
  )
}

export function StreetRatesDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <StreetRatesForm onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
