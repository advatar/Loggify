# Collector configuration

The checked-in configuration validates the complete ingest path using the
Collector's debug exporter. Replace or extend `exporters` and pipeline exporter
lists for the selected backend. Keep this receiver private; applications should
reach it only through the Loggify gateway.

Typical production outputs are OTLP/HTTP to a managed provider, Loki/Tempo,
OpenSearch, or a Graylog-compatible bridge. Backend credentials belong in the
Collector's secret environment, never SDK configuration.

