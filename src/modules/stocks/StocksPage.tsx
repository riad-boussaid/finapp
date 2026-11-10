import { useState } from "react"
import { Link } from "react-router"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SettingsDialog } from "@/components/settings/SettingsDialog"
import { useStockQuotes } from "@/hooks/useStocks"
import { formatMoneySmart, formatSignedPct } from "@/lib/format"
import { normalizeSymbol } from "@/lib/stocks"
import type { StockQuote } from "@/api/yahooApi"
import { useSettingsStore } from "@/store/settingsStore"
import { useStocksStore } from "@/store/stocksStore"

const INDEX_CHIPS: [string, string][] = [
  ["^GSPC", "S&P 500"],
  ["^IXIC", "NASDAQ"],
  ["^DJI", "Dow"],
]

function SetupState() {
  const { t } = useTranslation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("stocks.setupTitle")}</CardTitle>
        <CardDescription>
          {t("stocks.setupDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
          <li>
            {t("stocks.stepRun")}{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              npx wrangler login
            </code>
          </li>
          <li>
            {t("stocks.stepThen")}{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-foreground">
              cd worker && npx wrangler deploy
            </code>
          </li>
          <li>{t("stocks.stepPaste")}</li>
        </ol>
        <div className="flex items-center gap-2">
          <SettingsDialog />
          <span className="text-muted-foreground">
            {t("stocks.openSettings")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function QuoteRow({ quote }: { quote: StockQuote }) {
  const { t } = useTranslation()
  const removeSymbol = useStocksStore((s) => s.removeSymbol)
  if (quote.error || quote.price == null) {
    return (
      <TableRow>
        <TableCell className="font-mono">{quote.symbol}</TableCell>
        <TableCell colSpan={2} className="text-xs text-destructive">
          {t("stocks.unavailable")}
        </TableCell>
        <TableCell className="w-8 text-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t("stocks.remove", { symbol: quote.symbol })}
            onClick={() => removeSymbol(quote.symbol)}
          >
            <X className="size-4" />
          </Button>
        </TableCell>
      </TableRow>
    )
  }
  const up = (quote.changePct ?? 0) >= 0
  return (
    <TableRow>
      <TableCell>
        <Link
          to={`/stocks/${encodeURIComponent(quote.symbol)}`}
          className="block"
        >
          <span className="font-mono font-medium hover:text-primary">
            {quote.symbol}
          </span>
          <p className="max-w-40 truncate text-xs text-muted-foreground">
            {quote.name}
          </p>
        </Link>
      </TableCell>
      <TableCell className="text-end tabular-nums">
        {quote.price != null
          ? formatMoneySmart(quote.price, (quote.currency ?? "usd").toLowerCase())
          : "—"}
        {up ? (
          <p dir="ltr" className="text-xs text-profit">
            +{quote.change?.toFixed(2)}
          </p>
        ) : (
          <p dir="ltr" className="text-xs text-loss">
            {quote.change?.toFixed(2)}
          </p>
        )}
      </TableCell>
      <TableCell className="text-end">
        <Badge variant={up ? "outline" : "outline"} className={`${up ? "text-profit" : "text-loss"} tabular-nums`}>
          {formatSignedPct(quote.changePct)}
        </Badge>
      </TableCell>
      <TableCell className="w-8 text-end">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t("stocks.remove", { symbol: quote.symbol })}
          onClick={() => removeSymbol(quote.symbol)}
        >
          <X className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function StocksPage() {
  const { t } = useTranslation()
  const proxyUrl = useSettingsStore((s) => s.proxyUrl)
  const symbols = useStocksStore((s) => s.symbols)
  const addSymbol = useStocksStore((s) => s.addSymbol)
  const [draft, setDraft] = useState("")
  const quotes = useStockQuotes()

  function submit() {
    const symbol = normalizeSymbol(draft)
    if (!symbol) {
      toast.error(t("stocks.invalidTicker"))
      return
    }
    if (!addSymbol(symbol)) {
      toast.info(t("stocks.alreadyAdded", { symbol }))
    }
    setDraft("")
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {t("stocks.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("stocks.subtitle")}
          </p>
        </div>
        <div className="md:hidden">
          <SettingsDialog />
        </div>
      </header>

      {!proxyUrl ? (
        <SetupState />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={t("stocks.addPlaceholder")}
              spellCheck={false}
              autoCapitalize="characters"
              className="font-mono uppercase"
            />
            <Button onClick={submit} size="icon" aria-label={t("stocks.addAria")}>
              <Plus className="size-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {INDEX_CHIPS.map(([sym, label]) =>
              symbols.includes(sym) ? null : (
                <Button
                  key={sym}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    if (!addSymbol(sym)) toast.info(t("stocks.alreadyAddedShort"))
                  }}
                >
                  + {label}
                </Button>
              ),
            )}
          </div>

          {quotes.isPending ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("stocks.loading")}
            </p>
          ) : quotes.isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              {t("stocks.connError")}
            </p>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("stocks.colSymbol")}</TableHead>
                    <TableHead className="text-end">{t("stocks.colPrice")}</TableHead>
                    <TableHead className="text-end">{t("stocks.colDay")}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(quotes.data ?? []).map((q) => (
                    <QuoteRow key={q.symbol} quote={q} />
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
