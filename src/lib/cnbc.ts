export type CommodityDef = {
  id: string
  cnbcSymbol: string
  label: string
  unit: string
}

export const EXTENDED_COMMODITIES: CommodityDef[] = [
  { id: "wti", cnbcSymbol: "@CL.1", label: "WTI Crude", unit: "$/bbl" },
  { id: "brent", cnbcSymbol: "@LCO.1", label: "Brent Crude", unit: "$/bbl" },
  { id: "natgas", cnbcSymbol: "@NG.1", label: "Natural Gas", unit: "$/MMBtu" },
  { id: "copper", cnbcSymbol: "@HG.1", label: "Copper", unit: "$/lb" },
  { id: "wheat", cnbcSymbol: "@W.1", label: "Wheat", unit: "¢/bu" },
  { id: "corn", cnbcSymbol: "@C.1", label: "Corn", unit: "¢/bu" },
  { id: "soybeans", cnbcSymbol: "@S.1", label: "Soybeans", unit: "¢/bu" },
  { id: "sugar", cnbcSymbol: "@SB.1", label: "Sugar", unit: "¢/lb" },
  { id: "coffee", cnbcSymbol: "@KC.1", label: "Coffee", unit: "¢/lb" },
  { id: "cotton", cnbcSymbol: "@CT.1", label: "Cotton", unit: "¢/lb" },
]

export type CnbcQuote = {
  symbol: string
  label: string
  unit: string
  name: string
  price: number
  change?: number
  changePct?: number
  currency: string
  updatedAt?: string
}

export function parseCnbcNumber(raw: string | undefined | null): number | undefined {
  if (!raw) return undefined
  const s = String(raw).trim()
  if (/^unch/i.test(s)) return 0
  if (/^n\/?a$/i.test(s)) return undefined
  const cleaned = s.replace(/,/g, "").replace(/%$/, "").replace(/^\+/, "")
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : undefined
}

import { currentLocale } from "@/i18n"

export function formatCommodityPrice(value: number): string {
  return new Intl.NumberFormat(currentLocale(), {
    maximumFractionDigits: Math.abs(value) < 100 ? 3 : 2,
  }).format(value)
}
