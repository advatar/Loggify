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

## Align #103 — native Loggify gateway evidence

- [x] Read execution plan, existing qualification verifier and release checks; keep owner boundaries.
- [x] Browser-review Align #149 independently (both downloads, desktop and mobile).
- [x] Package and attest actual native gateway CI build 44011837827 (four tests passed).
- [x] Verify all three original files with GitHub/Sigstore, pinned workflow/commit/run and independent scope policy.
- [x] Generate read-only HTML/JSON dossier and six held refusal challenges; legal, quality and human release decisions remain pending.
- [x] Publish separate reviewable product PR #10 and Align PR #150, actual CI run and generated dossier; leave #103 open for unfulfilled acceptance.

Observed external dependency: GitHub Actions artifact storage quota rejects uploads. Authenticated public CI-log fallback preserves original bytes; artifact retention remains HOLD. Product PR: https://github.com/advatar/Loggify/pull/10. Actual tested merge commit: `09da6145e03b32e1815e434a176d38aa8c9e0b70`. No independent human review or full #103 completion claimed.

Align integration PR: https://github.com/advatar/Align/pull/150. Dossier: `integrations/loggify/results/44011837827/dossier.html` and `.json` in Align. One-command reproduction is in `integrations/loggify/README.md`. Local verification: 12 adapter tests, 11 release-gate tests, constitutional specification validation and offline desktop/mobile dossier browser checks passed. Product capture refusal tests passed locally and in actual CI. #149 real-browser results are recorded on that PR.

## Align #103 correction — local tests only

User direction supersedes the CI-based approach above. Prior CI reports are historical and are not the current deliverable.

- [ ] Remove the new product workflow and Align workflow additions.
- [ ] Capture a real local gateway build/tests; remove Actions/Sigstore/log dependencies.
- [ ] Produce an offline dossier with integrity checks and explicit unsigned-issuer hold.
- [ ] Run local regression/browser tests; update both PRs and reproduction instructions.
- [ ] Commit/push with CI skip markers and keep PRs open for review.
