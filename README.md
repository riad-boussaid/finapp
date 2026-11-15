# finapp

![status: beta](https://img.shields.io/badge/status-beta-orange)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A personal finance dashboard PWA: currency converter, precious metals,
commodities, crypto, and stocks — installable, offline-capable, and available
in **English and Arabic (full RTL)**.

> **⚠️ Beta — expect breaking changes.** finapp is pre-1.0 and its direction
> isn't settled yet. Anything can change between versions: module structure,
> the worker API, and locally stored data (settings, favorites, history,
> cached rates). There is no migration path — an update may require clearing
> the app's local data or reconfiguring the proxy URL.

## Modules

| Module         | What it does                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------- |
| **Currencies** | Cross-rate converter for 150+ currencies, favorites, and a **DZD street-rate (parallel market)** mode |
| **Commodities**| Spot gold/silver/platinum/palladium (per-ozt, per-gram, DZD & carat prices) + a CNBC futures board |
| **Crypto**     | Top coins by market cap with sparklines, favorites, detail charts, and load-more paging        |
| **Stocks**     | Watchlist with quotes and range charts via your own self-hosted Yahoo proxy (no API keys)      |

## Tech stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · shadcn/ui ·
TanStack Query (persisted) · Zustand · lightweight-charts · i18next ·
Vite PWA (service worker + runtime API caching)

## Getting started

```sh
pnpm install
pnpm dev        # http://localhost:5173
```

| Script              | What it does                     |
| ------------------- | -------------------------------- |
| `pnpm dev`          | Dev server with HMR              |
| `pnpm build`        | Typecheck (strict) + production build + PWA assets |
| `pnpm preview`      | Serve the production build       |
| `pnpm test`         | Run unit tests (vitest)          |
| `pnpm lint`         | Oxlint                           |

## Stocks: one-time proxy setup

Yahoo Finance sends no CORS headers, so browser calls fail. The `worker/`
directory holds a ~100-line Cloudflare Worker (`finapp-proxy`) that adds CORS
and edge-caches responses:

```sh
npx wrangler login
cd worker && npx wrangler deploy
```

Paste the printed `https://finapp-proxy.<your-subdomain>.workers.dev` URL into
the app's **Settings dialog** (⚙ on the Stocks page). See
[worker/README.md](worker/README.md) for details.

## Data sources

| Data            | Source                                                | Key required |
| --------------- | ----------------------------------------------------- | ------------ |
| FX rates        | [@fawazahmed0/currency-api](https://github.com/fawazahmed0/exchange) via jsDelivr (+ fallback host) | No |
| Metals          | [gold-api.com](https://www.gold-api.com)              | No |
| Crypto          | [CoinGecko](https://www.coingecko.com) public API     | No |
| Futures         | CNBC quote webservice                                 | No |
| Stocks          | Yahoo Finance via your own deployed worker            | No |

All state lives on-device: rates are cached in localStorage (with a PWA
service-worker cache on top), and the only server you depend on for stocks is
one you deploy yourself.

## Internationalization

UI strings live in `src/i18n/` — `en.ts` is the typed source of truth and
`ar.ts` is checked against it, so a missing translation fails the build.
Arabic uses MSA with Latin digits (`ar-u-nu-latn`); `<html dir>` flips to RTL
automatically, charts and numeric inputs stay LTR on purpose.

**Adding a language:** create `src/i18n/<lang>.ts` typed as `typeof en`,
register it in `src/i18n/index.ts`, and add it to the switcher in
`AppShell.tsx`.

## Project structure

```
src/
├── api/        # fetch + zod validation per data source
├── lib/        # pure logic (rates, formatting) — unit-tested
├── hooks/      # TanStack Query wiring
├── store/      # persisted zustand stores (settings, favorites, history)
├── modules/    # one folder per module (page components)
├── components/ # shared UI (shadcn ui/, currency/, crypto/, layout/)
└── i18n/       # translations + i18next setup
worker/         # Cloudflare Worker CORS proxy for Yahoo Finance
```

## Disclaimer

Rates are for reference only. Parallel-market (street) figures are
community-reported approximations and can differ significantly from official
rates. Informal currency exchange is illegal in Algeria — use licensed
channels.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Bug
reports and feature requests can use the
[issue templates](.github/ISSUE_TEMPLATE/).

## License

[MIT](LICENSE) © riad-boussaid
