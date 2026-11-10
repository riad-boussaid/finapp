import { z } from "zod"
import {
  EXTENDED_COMMODITIES,
  parseCnbcNumber,
  type CnbcQuote,
} from "@/lib/cnbc"

const BASE = "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol"

const quoteSchema = z.looseObject({
  symbol: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  last: z.string(),
  change: z.string().optional(),
  change_pct: z.string().optional(),
  currencyCode: z.string().default("USD"),
  last_time: z.string().optional(),
})

const quoteListSchema = z.preprocess(
  (v) => (Array.isArray(v) ? v : v != null ? [v] : []),
  z.array(quoteSchema),
)

const responseSchema = z.object({
  FormattedQuoteResult: z.object({
    FormattedQuote: quoteListSchema,
  }),
})

export async function fetchCnbcQuotes(fetchedAt = Date.now()): Promise<CnbcQuote[]> {
  const symbols = EXTENDED_COMMODITIES.map((c) => c.cnbcSymbol)
  const url =
    `${BASE}?symbols=${encodeURIComponent(symbols.join("|"))}` +
    `&requestMethod=itv&noform=1&partnerId=2&fund=1&output=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const parsed = responseSchema.parse(await res.json())

  return parsed.FormattedQuoteResult.FormattedQuote.flatMap((q) => {
    const def = EXTENDED_COMMODITIES.find((c) => c.cnbcSymbol === q.symbol)
    if (!def) return []
    const price = parseCnbcNumber(q.last)
    if (price === undefined) return []
    return [
      {
        symbol: q.symbol,
        label: def.label,
        unit: def.unit,
        name: q.name || def.label,
        price,
        change: parseCnbcNumber(q.change),
        changePct: parsePct(q.change_pct),
        currency: q.currencyCode,
        updatedAt: q.last_time ?? new Date(fetchedAt).toISOString(),
      } satisfies CnbcQuote,
    ]
  })
}

function parsePct(raw: string | undefined): number | undefined {
  if (!raw) return undefined
  if (/^unch/i.test(raw)) return 0
  return parseCnbcNumber(raw.replace(/%$/, ""))
}
