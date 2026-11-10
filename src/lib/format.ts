import { formatDistanceToNowStrict } from "date-fns"
import { currentLocale, dateFnsLocale } from "@/i18n"

export function formatMoney(value: number, code: string): string {
  const upper = code.toUpperCase()
  try {
    return new Intl.NumberFormat(currentLocale(), {
      style: "currency",
      currency: upper,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${new Intl.NumberFormat(currentLocale(), { maximumFractionDigits: 2 }).format(value)} ${upper}`
  }
}

export function formatMoneySmart(value: number, code: string): string {
  const upper = code.toUpperCase()
  const fractionDigits = value !== 0 && Math.abs(value) < 1 ? 6 : 2
  try {
    return new Intl.NumberFormat(currentLocale(), {
      style: "currency",
      currency: upper,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: Math.min(2, fractionDigits),
    }).format(value)
  } catch {
    return `${new Intl.NumberFormat(currentLocale(), { maximumFractionDigits: fractionDigits }).format(value)} ${upper}`
  }
}

export function formatRate(rate: number): string {
  const digits = rate >= 1 ? 4 : 6
  return new Intl.NumberFormat(currentLocale(), {
    maximumFractionDigits: digits,
  }).format(rate)
}

export function formatRelativeTime(date: Date | number | string): string {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: dateFnsLocale(),
  })
}

export function formatSignedPct(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export function displayName(code: string): string {
  return code.toUpperCase()
}
