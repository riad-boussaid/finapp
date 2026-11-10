# finapp-proxy

Key-less Yahoo Finance proxy for the stocks module. Yahoo sends no
`Access-Control-Allow-Origin`, so browser calls fail — this ~100-line
Worker adds CORS and normalizes the response.

## Endpoints

| Route | Description |
| --- | --- |
| `GET /health` | Returns `{ ok: true }` |
| `GET /quote?symbols=AAPL,^GSPC` | Quotes for up to 25 symbols (5d/1d chart meta) |
| `GET /chart/:symbol?range=3mo&interval=1d` | Full history: `{ points: [[ts, close]] }` |

Ranges: `1d 5d 1mo 3mo 6mo 1y 2y 5y max` · Intervals: `5m 15m 30m 1h 1d 1wk 1mo`
(intraday intervals only work with short ranges, per Yahoo).

Responses are edge-cached via `cf.cacheTtl` (45 s), so heavy polling is cheap
on the free plan (100k req/day).

## Deploy (one-time)

```sh
npx wrangler login      # opens browser
cd worker
npx wrangler deploy
```

Copy the printed `https://finapp-proxy.<your-subdomain>.workers.dev` URL into
the app's Settings dialog. That's it.
