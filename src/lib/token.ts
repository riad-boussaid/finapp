import { currentLocale } from "@/i18n"

export function formatTokenPrice(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1) {
    return new Intl.NumberFormat(currentLocale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: abs < 10 ? 4 : 2,
    }).format(value)
  }
  if (abs === 0) return "0"
  return new Intl.NumberFormat(currentLocale(), {
    maximumSignificantDigits: 3,
  }).format(value)
}

export function formatCompactUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  return new Intl.NumberFormat(currentLocale(), {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value)
}
