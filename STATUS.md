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
- [ ] Deploy both services and generate the public HTTPS gateway domain.
- [ ] Verify health, authentication enforcement, OTLP ingest, and Collector receipt.
- [ ] Document deployment, operations, secret retrieval, and rollback.
- [ ] Run local validation and pass pull-request CI on `loggify-mac`.
- [ ] Merge to `main`, verify the main CI run, close issue #5, and delete the branch.
