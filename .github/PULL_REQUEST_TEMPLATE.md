<!-- Title should follow Conventional Commits, e.g. feat(crypto): add favorites paging -->

## What does this PR do?

<!-- One or two sentences. Reference issues with #N. -->

## Type of change

- [ ] feat — new functionality
- [ ] fix — bug fix
- [ ] perf — performance
- [ ] refactor / style — no behavior change
- [ ] docs / ci / chore

## Checklist

- [ ] `pnpm lint` passes (oxlint)
- [ ] `pnpm test` passes (vitest)
- [ ] `pnpm build` passes (strict typecheck + PWA build)
- [ ] New UI strings added to `src/i18n/en.ts` **and** translated in `src/i18n/ar.ts` (missing keys fail the build)
- [ ] Worker changes are reflected in `worker/README.md` (if applicable)

## Beta notes

finapp is pre-1.0 — does this PR introduce a breaking change (data shape, worker API, settings)? If so, describe what users must do after updating.
