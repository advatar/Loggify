import 'package:loggify/loggify.dart';
import 'package:test/test.dart';

void main() {
  test('creates W3C trace context and child span', () {
    final root = TraceContext.root();
    final child = root.child();
    expect(root.traceId, matches(RegExp(r'^[0-9a-f]{32}$')));
    expect(root.spanId, matches(RegExp(r'^[0-9a-f]{16}$')));
    expect(child.traceId, root.traceId);
    expect(child.parentSpanId, root.spanId);
    expect(child.traceparent,
        matches(RegExp(r'^00-[0-9a-f]{32}-[0-9a-f]{16}-01$')));
  });

  test('builds semantic OTLP payload', () {
    final client = LoggifyClient(
        endpoint: Uri.parse('https://example.invalid'),
        projectKey: 'test',
        service: 'cardio',
        environment: 'test');
    final payload = client.buildPayload(
        const SemanticEvent(
            name: SemanticEventName.stateTransition,
            component: 'ecg',
            operation: 'ecg.sync'),
        trace: TraceContext.root());
    final resourceLogs = payload['resourceLogs']! as List<Object?>;
    final resourceLog = resourceLogs.single! as Map<String, Object?>;
    final scopeLogs = resourceLog['scopeLogs']! as List<Object?>;
    final scopeLog = scopeLogs.single! as Map<String, Object?>;
    final records = scopeLog['logRecords']! as List<Object?>;
    final record = records.single! as Map<String, Object?>;
    expect(record['eventName'], 'state.transition');
  });
}
