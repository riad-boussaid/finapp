# Contributing to finapp

Thanks for your interest! finapp is a young beta project, so contributions are
welcome but expect churn: the structure isn't frozen and breaking changes are
allowed before 1.0.

## Setup

You need Node 24+ and pnpm 11 (or `corepack enable`).

```sh
pnpm install
pnpm dev        # http://localhost:5173
```

| Script         | What it does                                       |
| -------------- | -------------------------------------------------- |
| `pnpm dev`     | Dev server with HMR                                |
| `pnpm build`   | Strict typecheck + production build + PWA assets   |
| `pnpm test`    | Unit tests (vitest)                                |
| `pnpm lint`    | Oxlint                                             |

The Stocks module needs the worker to return data. If you're touching stocks
or the proxy, deploy your own worker for testing:

```sh
cd worker && npx wrangler deploy
```

then paste the printed URL into the app's Settings dialog. All other modules
work without it.

## Ground rules

- **Strict TypeScript** — `pnpm build` fails on type errors; don't use `any`
  to make it pass.
- **Pure logic lives in `src/lib/`** and is unit-tested. If you add or change
  rate math, formatting, or anything non-UI, add tests.
- **APIs are validated with zod** in `src/api/`. Never trust a data source's
  shape — parse it.
- **No API keys.** finapp only uses free, keyless data sources; the stocks
  proxy is self-hosted by users. Don't introduce a source that requires a key.
- **Layout stays RTL-safe.** Charts and numeric inputs are deliberately LTR —
  don't "fix" that without discussion.

## Translations

`src/i18n/en.ts` is the typed source of truth; `ar.ts` is typed against it, so
a missing key fails the build. Arabic uses MSA with Latin digits
(`ar-u-nu-latn`). To add a language, create `src/i18n/<lang>.ts` typed as
`typeof en`, register it in `src/i18n/index.ts`, and add it to the switcher in
`AppShell.tsx`.

## Commits & PRs

- Use [Conventional Commits](https://www.conventionalcommits.org): `feat`,
  `fix`, `perf`, `refactor`, `docs`, `ci`, `chore`, `test`.
- Keep PRs small and focused on one thing.
- There's no CI on this repo yet — run `pnpm lint`, `pnpm test`, and
  `pnpm build` locally before opening a PR.
- If your change breaks data shapes, the worker API, or stored settings, say
  so in the PR (there's no migration path in beta).

## Issues

Use the issue templates. For data inaccuracies (rates looking off), remember
all sources are free public APIs — check the source's own status page first.

## Licensing

By contributing you agree that your contributions are licensed under the
[MIT License](LICENSE).
