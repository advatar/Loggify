# Loggify

Loggify is a cloud-neutral semantic telemetry toolkit extracted from ARK. It
adds a small application-event vocabulary to the OpenTelemetry data model and
ships SDKs, a public ingest gateway, and portable deployment configurations.

Applications send OTLP/HTTP JSON to the gateway. The gateway authenticates the
project, applies limits and redaction, stamps trusted tenant metadata, and
forwards telemetry to an OpenTelemetry Collector. The Collector can route to
Graylog, Loki, Tempo, OpenSearch, or any commercial OTLP backend.

## Quick start

```sh
cp .env.example .env
docker compose up --build
curl http://localhost:8080/healthz
```

Send OTLP logs with the development key:

```sh
curl -X POST http://localhost:8080/v1/logs \
  -H 'content-type: application/json' \
  -H 'x-loggify-key: local-development-key' \
  --data @conformance/fixtures/valid-otlp-log.json
```

See [PLAN.md](PLAN.md), [the specification](specification/README.md), and the
individual SDK READMEs for integration details.

## Security model

- Client keys identify a project but are not backend administrator secrets.
- The gateway derives tenant identity from its key configuration; clients
  cannot choose it.
- Attribute names and payload sizes are bounded.
- Sensitive key names are recursively redacted before forwarding.
- Mobile applications should use an installation identifier, never an account,
  patient, device-health, or medical-record identifier.
- Production deployments must terminate TLS before the gateway and keep the
  Collector on a private network.

## Repository layout

```text
specification/       Versioned semantic contract
sdk/                 Dart, Swift, and TypeScript client libraries
gateway/             Public OTLP/HTTP ingest boundary
deployment/          Docker Compose, Collector, and Helm assets
conformance/         Cross-language payload fixtures
```
