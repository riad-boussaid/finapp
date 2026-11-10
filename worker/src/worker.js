const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
}

const JSON_HEADERS = {
  ...CORS_HEADERS,
  "Content-Type": "application/json; charset=utf-8",
}

const ALLOWED_RANGES = new Set([
  "1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "max",
])
const ALLOWED_INTERVALS = new Set([
  "5m", "15m", "30m", "1h", "1d", "1wk", "1mo",
])

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  Accept: "*/*",
}

async function fetchYahooChart(symbol, range, interval, extraDelayMs = 0) {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/` +
    `${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`
  let lastError
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0 || extraDelayMs) {
      await sleep(attempt === 0 ? extraDelayMs : 600)
    }
    const res = await fetch(url, {
      headers: BROWSER_HEADERS,
      cf: { cacheTtl: 45 },
    })
    if (res.ok) {
      return parseYahooChart(symbol, await res.json())
    }
    if (res.status !== 429) throw new Error(`yahoo ${res.status} for ${symbol}`)
    lastError = new Error(`yahoo 429 for ${symbol}`)
  }
  throw lastError
}

function parseYahooChart(symbol, data) {
  const result = data?.chart?.result?.[0]
  if (!result) throw new Error(`no data for ${symbol}`)
  const meta = result.meta ?? {}
  const timestamps = result.timestamp ?? []
  const closes = result?.indicators?.quote?.[0]?.close ?? []
  const points = []
  for (let i = 0; i < timestamps.length; i++) {
    const value = closes[i]
    if (value != null) points.push([timestamps[i] * 1000, value])
  }
  return {
    symbol: meta.symbol ?? symbol,
    name: meta.shortName ?? meta.longName ?? symbol,
    currency: meta.currency ?? "USD",
    price: meta.regularMarketPrice ?? null,
    previousClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
    exchange: meta.fullExchangeName ?? meta.exchangeName ?? null,
    points,
  }
}

async function handleQuote(url) {
  const raw = (url.searchParams.get("symbols") ?? "").trim()
  if (!raw) return json({ error: "symbols query param required" }, 400)
  const symbols = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25)
  const settled = await Promise.allSettled(
    symbols.map((s, i) => fetchYahooChart(s, "5d", "1d", i * 80)),
  )
  const quotes = []
  for (let i = 0; i < settled.length; i++) {
    const item = settled[i]
    if (item.status === "fulfilled") {
      const c = item.value
      const change =
        c.price != null && c.previousClose != null
          ? c.price - c.previousClose
          : null
      const changePct =
        change != null && c.previousClose
          ? (change / c.previousClose) * 100
          : null
      quotes.push({
        symbol: c.symbol,
        name: c.name,
        currency: c.currency,
        exchange: c.exchange,
        price: c.price,
        previousClose: c.previousClose,
        change,
        changePct,
      })
    } else {
      quotes.push({ symbol: symbols[i], error: String(item.reason) })
    }
  }
  return json({ quotes })
}

async function handleChart(url) {
  const symbol = decodeURIComponent(url.pathname.split("/")[2] ?? "")
  if (!symbol) return json({ error: "symbol required" }, 400)
  let range = url.searchParams.get("range") ?? "3mo"
  let interval = url.searchParams.get("interval") ?? "1d"
  if (!ALLOWED_RANGES.has(range)) range = "3mo"
  if (!ALLOWED_INTERVALS.has(interval)) interval = "1d"
  try {
    const data = await fetchYahooChart(symbol, range, interval)
    return json(data)
  } catch (err) {
    return json({ error: String(err) }, 502)
  }
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }
    const url = new URL(request.url)
    if (url.pathname === "/health") return json({ ok: true })
    if (url.pathname === "/quote") return handleQuote(url)
    if (url.pathname.startsWith("/chart/")) return handleChart(url)
    return json({ error: "not found" }, 404)
  },
}
