# Loggify ingest gateway

The gateway exposes OTLP/HTTP JSON endpoints at `/v1/logs`, `/v1/traces`, and
`/v1/metrics`. It is intentionally storage-agnostic and forwards requests to a
private OpenTelemetry Collector.

Keys are configured as comma-separated `key:tenant:environment` entries:

```sh
LOGGIFY_KEYS='key-one:cardio:production,key-two:ark:staging'
```

Clients authenticate with `X-Loggify-Key` or `Authorization: Bearer <key>`.
Place a TLS reverse proxy, cloud load balancer, or API gateway in front of this
service. Do not expose the downstream Collector publicly.

