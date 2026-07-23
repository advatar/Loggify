# Railway deployment

Loggify maps to two Railway services:

- `gateway`: built from the repository root using `/railway.json`; this is the
  only service with a public domain.
- `collector`: runs the pinned upstream OpenTelemetry Collector image; it is
  reachable only over Railway private networking on port `4318`. The custom
  image in `deployment/railway/collector` is available when a smaller explicit
  configuration is preferred.

The checked-in Collector uses the debug exporter. It proves authenticated OTLP
delivery but does not retain telemetry. Configure an `otlphttp` exporter for a
durable backend such as Grafana Cloud before treating this as production log
storage.

## Initial deployment

```sh
railway init --name Loggify --workspace <workspace-id>
railway add --service gateway
railway add --service collector

railway service source connect \
  --image otel/opentelemetry-collector-contrib:0.130.1 \
  --service collector
railway service source connect \
  --repo <owner>/Loggify \
  --branch main \
  --service gateway

railway variable set \
  'LOGGIFY_COLLECTOR_URL=http://${{collector.RAILWAY_PRIVATE_DOMAIN}}:4318' \
  LOGGIFY_PORT=8080 \
  LOGGIFY_MAX_BODY_BYTES=1048576 \
  LOGGIFY_TIMEOUT_MS=5000 \
  LOGGIFY_REQUESTS_PER_MINUTE=600 \
  --service gateway --skip-deploys

printf '%s:%s:%s' "$INGEST_KEY" my-project production | \
  railway variable set LOGGIFY_KEYS --stdin --service gateway
railway domain --service gateway --port 8080
```

`LOGGIFY_KEYS` uses `key:tenant:environment` entries. Supply it through stdin
or the Railway dashboard so it does not enter shell history. Build the full
value with `printf`; an unbraced colon-delimited expansion can be interpreted
as a modifier by zsh.

For a private GitHub repository, grant the Railway GitHub App access to that
repository before connecting the gateway source. Public repositories need no
additional repository grant.

## Operations

```sh
railway service status --service gateway --environment production --json
railway service status --service collector --environment production --json
railway logs --service gateway --lines 100
railway logs --service collector --lines 100
railway service redeploy --service gateway --yes
railway service redeploy --service collector --yes
```

Use the Railway dashboard to roll back a service to a previous successful
deployment. Rotate a compromised ingest key by replacing `LOGGIFY_KEYS`,
redeploying the gateway, updating clients, and then removing the old key.

The first Advatar deployment uses
`https://gateway-production-79ac.up.railway.app`. Its ingest key is stored in
the deploying Mac's login Keychain under service
`dev.advatar.loggify.railway.ingest`, account `cardio-production`.

## Security

- Never create a public domain for `collector`.
- Keep backend credentials on the Collector service, not in applications.
- Client ingest keys are project-scoped and revocable, not administrator keys.
- The gateway replaces client-supplied tenant and environment attributes.
- Continue to exclude account, patient, medical-record, and raw health data.
