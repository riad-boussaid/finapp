const SYMBOL_RE = /^[A-Za-z0-9^.\-=]{1,15}$/

export function normalizeSymbol(input: string): string | null {
  const symbol = input.trim().toUpperCase()
  if (!symbol || !SYMBOL_RE.test(symbol)) return null
  return symbol
}
