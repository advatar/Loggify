# Status

## Standalone semantic telemetry platform

- [x] Assess ARK semantic logging contract and define standalone boundaries.
- [x] Initialize the portable repository documentation and versioned schema.
- [x] Create GitHub issue #1 and its issue-scoped implementation branch.
- [x] Implement and test the TypeScript SDK.
- [x] Implement and test the Swift SDK.
- [x] Implement and test the Dart SDK.
- [x] Implement and test the authenticated OTLP ingest gateway.
- [x] Add Docker Compose and OpenTelemetry Collector deployment.
- [x] Add and validate a portable Helm chart.
- [x] Add conformance fixtures and end-to-end smoke coverage.
- [x] Run Node, Dart, Swift, Docker, Compose, Helm, syntax, and deployment checks.
- [x] Commit and push the issue branch.
- [x] Merge the verified feature into `main`, push, and verify it is reachable from `origin/main`.
- [x] Close the GitHub issue and delete the merged implementation branch.

GitHub Actions run `29949691686` was created, but GitHub started none of its
steps because the account has a failed payment or exhausted spending limit.
The equivalent Node, Dart, Swift, Helm, Compose, Docker build, and live
gateway-to-Collector checks passed locally before merge.

## Issue #3 — local self-hosted CI runner

- [x] Assess repository runner registration and existing local runner services.
- [x] Create GitHub issue #3 and its single implementation branch.
- [x] Register and start the dedicated `loggify-mac` runner on this Mac.
- [x] Update all CI jobs to target `[self-hosted, macOS, ARM64, loggify]`.
- [x] Validate the workflow syntax and runner labels locally.
- [x] Push the branch and verify PR run `29952492536` passes on `loggify-mac`.
- [x] Merge to `main`, verify `origin/main`, and verify the main CI run.
- [x] Close issue #3 and delete the implementation branch.

## Issue #5 — Railway deployment

- [x] Confirm Railway CLI authentication and the Advatar workspace.
- [x] Create GitHub issue #5 and its single implementation branch.
- [x] Add Railway-specific gateway and Collector deployment configuration.
- [x] Create an isolated Loggify project and production services on Railway.
- [x] Configure private Collector networking and protected gateway variables.
- [x] Deploy both services and generate the public HTTPS gateway domain.
- [x] Verify health, authentication enforcement, OTLP ingest, and Collector receipt.
- [x] Document deployment, operations, secret retrieval, and rollback.
- [x] Run local validation and pass pull-request CI on `loggify-mac`.
- [x] Merge to `main`, verify the main CI run, close issue #5, and delete the branch.

## Issue #7 — UniLogger integration

- [x] Implement and merge UniLogger's authenticated Loggify OTLP transport.
- [x] Verify the Swift transport against the live Railway gateway and Collector.
- [x] Document UniLogger as Loggify's production `swift-log` adapter.
- [x] Run local validation and pass pull-request CI on `loggify-mac`.
- [x] Merge to `main`, verify the main CI run, close issue #7, and delete the branch.

## Align #103 — local-only Loggify gateway evidence

The user's local-only instruction supersedes the earlier CI approach. The new product workflow and Align workflow additions are removed; prior CI-backed reports are superseded, not relabeled as local.

- [x] Read execution plan and existing verifier/release checks; preserve owner boundaries.
- [x] Run #149 in a real local browser, including both download buttons; record results there.
- [x] Capture an actual clean local gateway build at `9deb2eb848b6958aecbb522d738ef7bcd47c7170`; four native tests passed.
- [x] Run four local capture refusal tests, 12 offline adapter tests, 11 release-gate regressions and constitutional specification checks.
- [x] Compare actual local rebuilt package bytes with reference SHA-256 `f5a601ec647070a1db2287e4b3de8bdf1981103154741e67cd2ecf6ff0c470de`.
- [x] Generate replacement offline HTML/JSON dossier and five held challenges; retain original local package/TAP/record.
- [x] Update local reproduction instructions and existing PRs; commit/push with CI skip markers.

Product PR: https://github.com/advatar/Loggify/pull/10. Align PR: https://github.com/advatar/Align/pull/150. Current dossier in Align: `integrations/loggify/results/local-20261117/`; one-command local reproduction: `integrations/loggify/README.md`.

Evidence is unsigned. Issuer authentication, qualified legal decisions, named quality ownership/real quality record and the human release decision remain HOLD. Local hashes are integrity checks, never an authenticated signer or permission. No GitHub CI, Sigstore, log fallback or artifact upload is used by this implementation; artifact quota and disabled Actions are no longer dependencies. #103 remains open for its missing acceptance evidence and independent human review.
