# Local gateway evidence for Align #103

From the Loggify checkout:

```sh
npm ci
python3 -m unittest discover -s scripts/evidence -v
python3 scripts/evidence/capture.py /tmp/loggify-local-evidence
```

Use a new empty output directory outside the source checkout. The capture runs
the real TypeScript gateway build and its existing native tests, then saves
`gateway.zip`, `tests.tap` and `build-record.json`. The ZIP contains dist and
package metadata with fixed ZIP metadata for independent local comparison. Node
is an external runtime, recorded alongside npm. Commit identity, source dirtiness,
local run ID, exact artifact/test hashes and intended-use scope are recorded.

All execution is local. No Actions job, OIDC/Sigstore, log transport, artifact
upload or remote evidence lookup is used. `npm ci` installs the locked local
build dependencies; it does not invoke GitHub CI. The capture refuses execution
in GitHub Actions and refuses to overwrite prior evidence.

The output is unsigned: issuer and signature are null. Hashes establish integrity,
not who produced the evidence. Align explicitly holds issuer authentication, legal
applicability, quality review and the human release decision. Local tests cannot
manufacture an authorized signer or legal judgement. The output contains only
public build metadata and fictional test output; no production telemetry.

The earlier CI approach was superseded by the user's local-only direction. The
new workflow has been removed. Existing unrelated repository workflows are not
part of this adapter. Review stays in product PR #10 and Align PR #150.
