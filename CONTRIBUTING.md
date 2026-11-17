# 🤝 Contributing

Thanks for helping improve Styler! See the [README](README.md) for configuration
and [Releases](docs/releases.md) for maintainer release instructions.

## Requirements

- Node.js **22.12+** and the pnpm version declared in `package.json`.
- CI uses Node.js **24**; `.node-version` selects the same major for local development.
- Chromium for `pnpm test:browser`; set `CHROME_BIN` if its executable is not `chromium`.

## Development

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm lint
pnpm format:check
pnpm test
pnpm test:browser
```

`pnpm test` builds `dist/styler.js` before running the regression suite, so no
separate build is needed for these checks. `pnpm build` builds only the bundle;
`pnpm watch` rebuilds it as source files change.

Use `pnpm lint:fix` and `pnpm format` to apply fixes. Release Please owns
`CHANGELOG.md` and `.github/release-please-manifest.json`; do not reformat those
generated files. Use conventional commits (`feat:`, `fix:`, `docs:`, and so on)
so release notes and version bumps can be generated automatically.

## Testing

- **Types:** `pnpm check` strictly typechecks production code and the Vite config.
- **Lint:** `pnpm lint` includes type-aware promise checks and import rules.
- **Regression tests:** `pnpm test` uses `node:test` to exercise the built plugin
  with real Lit initializers and updates. The DOM, custom-element registry, and
  native Home Assistant editor components are stubbed. The `.mjs` tests are not
  covered by the TypeScript check.

Keep the bundle-level tests: they cover global patching, preset updates, listener
cleanup, stylesheet ownership, fallback styles, and editor round trips. Add
regressions when changing these behaviors.

`pnpm test:browser` builds the plugin and runs focused Chromium rendering tests for
native custom-element registration, nested Lit styles, inherited styling,
reparenting, inline-style restoration, tile animations, stylesheet reuse, DOM
fallbacks, and editor reuse. It bundles the fixture with Vite and requires no
additional JavaScript dependencies. These tests still mock Home Assistant's card
and editor components; also test changes in a live dashboard.

Preserve fallback styling for browsers without constructed sheets and CSS
containing `@import`. The tile animation API is `styler.animation`; top-level
`animation`, `info`, and `spin_icon` are no longer interpreted by Styler. See the
README migration notes.

## Local Deployment

Build with `pnpm build` and copy `dist/styler.js` to a Home Assistant test
installation. Hard-refresh the browser after updating the resource and remove any
stale `styler.js.gz` sibling if your local deployment created one.

A maintainer-specific `/justfile` is intentionally git-ignored. Contributors do not
need it to build or test; if you use one, check its host and destination before
deploying.
