export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  flowId: string;
  traceFlags: string;
}

export interface SemanticEvent {
  name: "decision" | "invariant.fail" | "state.transition" | "snapshot" |
    "span.start" | "span.end" | "external.call.start" | "external.call.end";
  component: string;
  operation: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface LogInput {
  service: string;
  environment: string;
  event: SemanticEvent;
  trace?: TraceContext;
  message?: string;
  severity?: "DEBUG" | "INFO" | "WARN" | "ERROR";
  resource?: Record<string, string | number | boolean>;
}

function randomHex(bytes: number): string {
  const data = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(data);
  return Array.from(data, (value) => value.toString(16).padStart(2, "0")).join("");
}

export function createTrace(flowId?: string): TraceContext {
  const traceId = randomHex(16);
  return { traceId, spanId: randomHex(8), flowId: flowId ?? traceId, traceFlags: "01" };
}

export function childTrace(parent: TraceContext): TraceContext {
  return { ...parent, spanId: randomHex(8), parentSpanId: parent.spanId };
}

export function traceparent(trace: TraceContext): string {
  return `00-${trace.traceId}-${trace.spanId}-${trace.traceFlags}`;
}

function anyValue(value: string | number | boolean): object {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { boolValue: value };
  return Number.isInteger(value) ? { intValue: String(value) } : { doubleValue: value };
}

function attributes(input: Record<string, string | number | boolean>): object[] {
  return Object.entries(input).map(([key, value]) => ({ key, value: anyValue(value) }));
}

const severities = { DEBUG: 5, INFO: 9, WARN: 13, ERROR: 17 } as const;

export function buildOtlpLogRequest(input: LogInput): object {
  const severity = input.severity ?? "INFO";
  const eventAttributes: Record<string, string | number | boolean> = {
    "loggify.component": input.event.component,
    "loggify.operation": input.event.operation,
    ...input.event.attributes,
  };
  if (input.trace) eventAttributes["loggify.flow.id"] = input.trace.flowId;
  return { resourceLogs: [{
    resource: { attributes: attributes({
      "service.name": input.service,
      "deployment.environment.name": input.environment,
      "loggify.schema.version": 1,
      ...input.resource,
    }) },
    scopeLogs: [{ scope: { name: "loggify.sdk", version: "0.1.0" }, logRecords: [{
      timeUnixNano: String(BigInt(Date.now()) * 1_000_000n),
      severityNumber: severities[severity], severityText: severity,
      body: { stringValue: input.message ?? input.event.name },
      eventName: input.event.name,
      ...(input.trace ? { traceId: input.trace.traceId, spanId: input.trace.spanId, flags: 1 } : {}),
      attributes: attributes(eventAttributes),
    }] }],
  }] };
}

export function createHttpExporter(options: { endpoint: string; key: string; timeoutMs?: number }) {
  return async (payload: object): Promise<void> => {
    const response = await fetch(`${options.endpoint.replace(/\/$/, "")}/v1/logs`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-loggify-key": options.key },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(options.timeoutMs ?? 5_000),
    });
    if (!response.ok) throw new Error(`Loggify export failed with HTTP ${response.status}`);
  };
}

export async function tracedFetch(
  input: RequestInfo | URL,
  init: RequestInit,
  options: Omit<LogInput, "event" | "trace"> & {
    parent: TraceContext;
    component: string;
    operation: string;
    emit: (payload: object) => Promise<void>;
  },
): Promise<Response> {
  const trace = childTrace(options.parent);
  const headers = new Headers(init.headers);
  headers.set("traceparent", traceparent(trace));
  const started = Date.now();
  void options.emit(buildOtlpLogRequest({ ...options, trace, event: {
    name: "external.call.start", component: options.component, operation: options.operation,
  } })).catch(() => undefined);
  try {
    const response = await fetch(input, { ...init, headers });
    void options.emit(buildOtlpLogRequest({ ...options, trace, event: {
      name: "external.call.end", component: options.component, operation: options.operation,
      attributes: { "http.response.status_code": response.status, "loggify.duration.ms": Date.now() - started },
    } })).catch(() => undefined);
    return response;
  } catch (error) {
    void options.emit(buildOtlpLogRequest({ ...options, severity: "ERROR", trace, event: {
      name: "invariant.fail", component: options.component, operation: options.operation,
      attributes: { "loggify.error.code": "network_failure", "loggify.duration.ms": Date.now() - started },
    } })).catch(() => undefined);
    throw error;
  }
}

