# 📦 Releases

[← README](../README.md) · [Contributing](../CONTRIBUTING.md)

## Release Flow

After successful CI on `main`, Release Please uses the automation GitHub App to
maintain a release PR from conventional commits. Merging it updates `CHANGELOG.md`,
`package.json`, `.github/release-please-manifest.json`, and the embedded version in
`src/main.ts`, then publishes a GitHub release. Existing version history is
preserved; tags use the form `v3.2.1`.

A separate job resolves the published tag to an immutable commit, checks out that
commit, installs from the frozen lockfile, and runs typechecks, lint, and tests.
`pnpm test` builds the installable **`styler.js`** before testing it. Publishing
checks that the tag still points to the verified commit, then attaches that exact
artifact to the release. The publish job has write access but does not execute
repository code.

`dist/` stays git-ignored. HACS users receive `styler.js` as a release asset, not an
Actions artifact or a committed bundle. There is no npm publishing or ZIP package.
The release is published first; its asset follows when the upload finishes. HACS
validation runs after a successful upload, on normal CI events, and daily.

`CHANGELOG.md` and `.github/release-please-manifest.json` are generated and excluded
from formatting. Keep the release config and `package.json` formatted normally.
Do not remove the `x-release-please-version` marker in `src/main.ts` or its
`extra-files` entry in the release config.

## Repository Setup

- Install the automation GitHub App for this repository with **Contents**, **Issues**,
  and **Pull requests** read/write permissions.
- Set repository variable `AUTOMATION_APP_ID` and Actions secret
  `AUTOMATION_APP_PRIVATE_KEY`.
- Ensure required checks match the new CI job names; HACS validation now lives in
  `ci.yml` rather than a separate validation workflow.

The workflow defaults to read-only access. Release Please gets a short-lived App
token; only the asset-publishing job gets a writable `GITHUB_TOKEN`. App-authored
release PRs can trigger their own CI checks.

## Recovering an Upload

Rerun failed jobs, or manually run **CI** from `main` with **release_tag** set to an
existing release tag:

```sh
gh workflow run ci.yml --ref main -f release_tag=v3.2.1
```

This rebuilds and tests the tagged source, then replaces its `styler.js` asset with
`--clobber`. It does not create a release, change its tag, or build current `main`.
Formatting is not checked when rebuilding historical releases. Their own checked-in
scripts and tooling are used, so tags predating this setup retain their old checks.
Leave `release_tag` empty to run normal CI without releasing.
