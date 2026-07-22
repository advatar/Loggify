# Loggify Dart SDK

```dart
final client = LoggifyClient(
  endpoint: Uri.parse('https://logs.example.com'),
  projectKey: const String.fromEnvironment('LOGGIFY_KEY'),
  service: 'vagus-cardio',
  environment: 'debug',
);

await LoggifyTrace.run(TraceContext.root(), () async {
  await client.emit(const SemanticEvent(
    name: SemanticEventName.stateTransition,
    component: 'ecg',
    operation: 'ecg.synchronize',
  ));
});
```

Pass keys through `--dart-define` or native secure configuration; never commit
production keys. The client intentionally accepts structured, allowlisted
attributes rather than forwarding arbitrary application log messages.

