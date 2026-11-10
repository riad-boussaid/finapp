export function crossRate(usdRates: Record<string, number>, from: string, to: string): number {
  if (from === to) return 1
  const fromRate = usdRates[from]
  const toRate = usdRates[to]
  if (!fromRate || !toRate || fromRate <= 0) return NaN
  return toRate / fromRate
}

export function convertAmount(amount: number, rate: number): number {
  return amount * rate
}

export const commonAmounts = [
  1, 2, 5, 10, 20, 25, 50, 75, 100, 200, 250, 500, 750, 1000, 2500, 5000,
  10000, 25000, 50000, 100000, 250000, 500000, 1000000,
] as const
