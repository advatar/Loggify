# Native gateway evidence for Align #103

`npm ci && python3 scripts/evidence/capture.py /tmp/loggify-evidence`
builds the actual gateway and runs its existing native tests, then packages
`dist` and `package.json`. The ZIP needs Node 22 at runtime. Evidence is detached.
Local output has no authenticated issuer and must remain unverified.

The native-evidence workflow repeats this on the product CI runner. GitHub
OIDC/Sigstore authenticates the ZIP, TAP output and build record. The issuer is
`advatar/Loggify/.github/workflows/native-evidence.yml`. This uses GitHub's
existing provenance format, not an Align approval protocol. CI runner integrity,
GitHub identity and the reviewed workflow remain trust assumptions. This is not
an isolated trusted builder. Pull-request provenance covers the tested merge
commit, which can differ from the PR head. Retain that exact commit in review.

No telemetry, credentials or production records are exported. The record exposes
public source/build identities, tool versions, fixture test names and hashes.
Tests use fictional telemetry. This is gateway engineering evidence only; SDKs,
deployment, production configuration, legal applicability and qualified human
quality/release decisions are separate. The latter remain pending in Align.

The Align adapter independently pins repository, workflow, source commit, scope,
maximum age and revocations, verifies the original attestations using `gh`, and
checks evidence bytes with its existing release integrity helper. It does not use
the product record as a trust policy or manufacture Kline qualification evidence.
