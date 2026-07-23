# Loggify extraction and delivery plan

## Goal

Make ARK's semantic trace logging available to any application and deployable
on any cloud without coupling SDKs to Graylog, GELF, ARK, or showntell.dev.

## Product boundaries

1. **Specification**: a versioned semantic event vocabulary layered on the
   stable OpenTelemetry log model and W3C Trace Context.
2. **SDKs**: thin language-native facades for traces, semantic events, context
   propagation, redaction, batching, and bounded offline delivery.
3. **Gateway**: the only public service. It authenticates projects, enforces
   limits and privacy policy, and forwards OTLP to a private Collector.
4. **Collector and backends**: standard OpenTelemetry components. Storage and
   UI remain selectable deployment concerns.

## Delivery phases

### Phase 1 — standalone vertical slice (implemented here)

- Publish schema version 1 and OTLP attribute mappings.
- Provide Dart, Swift, and TypeScript SDK foundations.
- Accept OTLP/HTTP JSON logs and traces at a tenant-aware ingest gateway.
- Enforce authentication, payload limits, tenant stamping, and redaction.
- Deploy gateway plus Collector with Docker Compose or Helm.
- Supply conformance fixtures and automated gateway/TypeScript/Swift tests.

### Phase 2 — Cardio proving integration

- Integrate the Dart SDK behind Cardio's existing `Log` facade.
- Add Dio trace propagation and semantic request spans.
- Instrument authentication and ECG synchronization first.
- Keep verbose bodies local; remotely emit only allowlisted semantic fields.
- Add a bounded encrypted/offline mobile queue and delivery lifecycle hooks.

### Phase 3 — ARK migration

- Publish versioned SDK artifacts.
- [x] Adapt UniLogger to the shared specification and OTLP exporter interface.
- Point ARK at Loggify's gateway while retaining Graylog as a Collector output.
- Compare records and dashboards during a dual-write period.
- Remove ARK-local copies only after parity and rollback validation.

### Phase 4 — production hardening

- Store project keys in a secret manager and implement key rotation.
- Replace static key parsing with a control-plane-backed project registry.
- Add per-project quotas, audit records, metrics, and abuse protection.
- Add persistent gateway buffering or a message broker where loss tolerance
  requires it; keep mobile buffering bounded.
- Add integration tests against Loki/Tempo, Graylog, and one managed OTLP
  backend.
- Publish Terraform examples for AWS, Azure, GCP, and a generic VM.

### Phase 5 — ecosystem

- Generate schemas and constants from the canonical YAML.
- Add .NET, Python, Rust, Kotlin, and Java packages as demand requires.
- Establish compatibility policy, signed releases, SBOMs, and provenance.

## Compatibility policy

- Semantic schema changes are additive within a major version.
- SDKs send `loggify.schema.version` on every resource.
- Gateways accept the current and previous major schema versions.
- Backend-specific names never appear in public SDK APIs.

## Definition of production-ready

- Two independent cloud deployments pass the same conformance suite.
- No privileged backend secret is distributed in an application.
- Redaction is tested at SDK and gateway layers.
- Load, retry, shutdown, and Collector-unavailable behavior are measured.
- Retention, deletion, residency, and incident procedures are documented.
