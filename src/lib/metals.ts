export const GRAMS_PER_TROY_OUNCE = 31.1034768

export const CARAT_FRACTIONS = { 24: 1, 21: 0.875, 18: 0.75 } as const
export type Carat = keyof typeof CARAT_FRACTIONS

export function pricePerGram(pricePerOzt: number): number {
  return pricePerOzt / GRAMS_PER_TROY_OUNCE
}

export function caratPricePerGram(
  pricePerGram24k: number,
  carat: Carat,
): number {
  return pricePerGram24k * CARAT_FRACTIONS[carat]
}

export function convertUsdToDzd(usdAmount: number, usdToDzd: number): number {
  return usdAmount * usdToDzd
}
