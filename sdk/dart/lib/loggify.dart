import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

enum SemanticEventName {
  decision('decision'),
  invariantFail('invariant.fail'),
  stateTransition('state.transition'),
  snapshot('snapshot'),
  externalCallStart('external.call.start'),
  externalCallEnd('external.call.end');

  const SemanticEventName(this.value);
  final String value;
}

final class TraceContext {
  const TraceContext(
      {required this.traceId,
      required this.spanId,
      required this.flowId,
      this.parentSpanId,
      this.traceFlags = '01'});

  factory TraceContext.root({String? flowId}) {
    final traceId = _randomHex(16);
    return TraceContext(
        traceId: traceId, spanId: _randomHex(8), flowId: flowId ?? traceId);
  }

  final String traceId;
  final String spanId;
  final String flowId;
  final String? parentSpanId;
  final String traceFlags;

  TraceContext child() => TraceContext(
      traceId: traceId,
      spanId: _randomHex(8),
      flowId: flowId,
      parentSpanId: spanId,
      traceFlags: traceFlags);
  String get traceparent => '00-$traceId-$spanId-$traceFlags';
}

final _random = Random.secure();
String _randomHex(int bytes) => List.generate(
        bytes, (_) => _random.nextInt(256).toRadixString(16).padLeft(2, '0'))
    .join();

abstract final class LoggifyTrace {
  static final Object _key = Object();
  static TraceContext? get current => Zone.current[_key] as TraceContext?;
  static Future<T> run<T>(TraceContext trace, Future<T> Function() body) =>
      runZoned(body, zoneValues: {_key: trace});
}

final class SemanticEvent {
  const SemanticEvent(
      {required this.name,
      required this.component,
      required this.operation,
      this.attributes = const {}});
  final SemanticEventName name;
  final String component;
  final String operation;
  final Map<String, Object> attributes;
}

final class LoggifyClient {
  LoggifyClient(
      {required this.endpoint,
      required this.projectKey,
      required this.service,
      required this.environment,
      HttpClient? httpClient})
      : _http = httpClient ?? HttpClient();

  final Uri endpoint;
  final String projectKey;
  final String service;
  final String environment;
  final HttpClient _http;

  Map<String, Object?> buildPayload(SemanticEvent event,
      {TraceContext? trace, String severity = 'INFO'}) {
    trace ??= LoggifyTrace.current;
    final attributes = <String, Object>{
      'loggify.component': event.component,
      'loggify.operation': event.operation,
      ...event.attributes,
      if (trace != null) 'loggify.flow.id': trace.flowId,
    };
    return {
      'resourceLogs': [
        {
          'resource': {
            'attributes': _attributes({
              'service.name': service,
              'deployment.environment.name': environment,
              'loggify.schema.version': 1,
            })
          },
          'scopeLogs': [
            {
              'scope': {'name': 'loggify.dart', 'version': '0.1.0'},
              'logRecords': [
                {
                  'timeUnixNano':
                      (DateTime.now().microsecondsSinceEpoch * 1000).toString(),
                  'severityNumber': _severityNumber(severity),
                  'severityText': severity,
                  'body': {'stringValue': event.name.value},
                  'eventName': event.name.value,
                  if (trace != null) ...{
                    'traceId': trace.traceId,
                    'spanId': trace.spanId,
                    'flags': 1
                  },
                  'attributes': _attributes(attributes),
                }
              ]
            }
          ],
        }
      ],
    };
  }

  Future<void> emit(SemanticEvent event,
      {TraceContext? trace, String severity = 'INFO'}) async {
    final request = await _http.postUrl(endpoint.resolve('/v1/logs'));
    request.headers.contentType = ContentType.json;
    request.headers.set('x-loggify-key', projectKey);
    request.write(
        jsonEncode(buildPayload(event, trace: trace, severity: severity)));
    final response = await request.close().timeout(const Duration(seconds: 5));
    await response.drain<void>();
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw HttpException(
          'Loggify export failed with HTTP ${response.statusCode}');
    }
  }

  static List<Map<String, Object>> _attributes(Map<String, Object> values) =>
      values.entries
          .map((entry) => {
                'key': entry.key,
                'value': switch (entry.value) {
                  String value => {'stringValue': value},
                  bool value => {'boolValue': value},
                  int value => {'intValue': value.toString()},
                  double value => {'doubleValue': value},
                  _ => throw ArgumentError.value(entry.value, entry.key,
                      'Unsupported OTLP attribute type'),
                },
              })
          .toList(growable: false);

  static int _severityNumber(String value) => switch (value) {
        'DEBUG' => 5,
        'INFO' => 9,
        'WARN' => 13,
        'ERROR' => 17,
        _ => 9
      };
}
