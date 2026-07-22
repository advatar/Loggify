# Loggify TypeScript SDK

```ts
const exporter = createHttpExporter({ endpoint, key });
const trace = createTrace();
await exporter(buildOtlpLogRequest({
  service: "web",
  environment: "production",
  event: { name: "decision", component: "checkout", operation: "select-provider" },
  trace,
}));
```

Use `tracedFetch` for outbound calls. It creates a child span context, injects
`traceparent`, and emits start/end semantic log records without ever throwing
because telemetry delivery failed.

