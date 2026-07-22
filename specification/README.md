# Loggify semantic specification

Loggify uses OTLP as its wire format and W3C Trace Context for propagation.
The canonical extension vocabulary is `semantic-events.yaml`.

ARK compatibility mappings:

| ARK GELF field | OpenTelemetry representation |
| --- | --- |
| `_trace_id` | LogRecord `traceId` |
| `_span_id` | LogRecord `spanId` |
| `_event` | LogRecord `eventName` |
| `_service` | Resource `service.name` |
| `_component` | Attribute `loggify.component` |
| `_operation` | Attribute `loggify.operation` |
| `_flow_id` | Attribute `loggify.flow.id` |
| `_trace_history` | Attribute `loggify.trace.history` |

Use actual spans for timed operations. `span.start` and `span.end` remain legacy
event aliases for migration, not the preferred new instrumentation style.

