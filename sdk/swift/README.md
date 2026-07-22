# Loggify Swift SDK

The Swift package carries forward ARK UniLogger's semantic event and W3C trace
context concepts, but emits vendor-neutral OTLP/HTTP JSON.

```swift
let exporter = OTLPHTTPExporter(configuration: .init(endpoint: url, projectKey: key))
let logger = SemanticLogger(service: "ios-app", environment: "production", exporter: exporter)

try await TraceContext.withValue(.root()) {
    try await logger.emit(.init(name: .stateTransition, component: "sync", operation: "sync.start"))
}
```

Application code must supply only allowlisted, non-sensitive attributes.

