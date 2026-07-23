# Loggify Swift SDK

The Swift package carries forward ARK UniLogger's semantic event and W3C trace
context concepts, but emits vendor-neutral OTLP/HTTP JSON.

This package is the small reference implementation of the Loggify contract.
For application integration through `swift-log`, use
[UniLogger](https://github.com/advatar/UniLogger). UniLogger maps its existing
`SemanticEvent` and `TraceContext` metadata to schema-v1 OTLP and provides
production batching, redaction, retry, lifecycle flushing, and a bounded
offline spool.

```swift
let exporter = OTLPHTTPExporter(configuration: .init(endpoint: url, projectKey: key))
let logger = SemanticLogger(service: "ios-app", environment: "production", exporter: exporter)

try await TraceContext.withValue(.root()) {
    try await logger.emit(.init(name: .stateTransition, component: "sync", operation: "sync.start"))
}
```

Application code must supply only allowlisted, non-sensitive attributes.
