const sensitiveKeyFragments = [
  "authorization", "password", "passwd", "secret", "token", "cookie",
  "patient", "medical_record", "raw_health", "ecg_data", "email",
];

const trustedKeys = new Set([
  "loggify.tenant.id",
  "deployment.environment.name",
]);

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function isSensitive(key: string): boolean {
  const normalized = key.toLowerCase();
  return sensitiveKeyFragments.some((fragment) => normalized.includes(fragment));
}

function sanitizeAttributes(value: Json): Json {
  if (!Array.isArray(value)) return sanitize(value);
  return value.slice(0, 256).map((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return sanitize(entry);
    const key = typeof entry.key === "string" ? entry.key : "";
    if (trustedKeys.has(key)) {
      const discarded: Json = { key: "loggify.discarded.trusted_attribute", value: { boolValue: true } };
      return discarded;
    }
    if (isSensitive(key)) {
      const redacted: Json = { key, value: { stringValue: "<redacted>" } };
      return redacted;
    }
    return sanitize(entry);
  });
}

function sanitize(value: Json, parentKey = ""): Json {
  if (Array.isArray(value)) return value.slice(0, 1000).map((item) => sanitize(item, parentKey));
  if (value === null || typeof value !== "object") {
    return isSensitive(parentKey) ? "<redacted>" : value;
  }
  const result: { [key: string]: Json } = {};
  for (const [key, child] of Object.entries(value).slice(0, 1000)) {
    result[key] = key === "attributes" ? sanitizeAttributes(child) : sanitize(child, key);
  }
  return result;
}

function resourceContainers(payload: Record<string, Json>): Array<Record<string, Json>> {
  const candidates = [payload.resourceLogs, payload.resourceSpans, payload.resourceMetrics];
  const resources: Array<Record<string, Json>> = [];
  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    for (const item of candidate) {
      if (item && typeof item === "object" && !Array.isArray(item)) resources.push(item);
    }
  }
  return resources;
}

export function sanitizeAndStamp(
  input: unknown,
  tenant: string,
  environment: string,
): Record<string, Json> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("OTLP payload must be a JSON object");
  }
  const payload = sanitize(input as Json) as Record<string, Json>;
  const containers = resourceContainers(payload);
  if (containers.length === 0) throw new Error("Payload contains no OTLP resources");
  for (const container of containers) {
    const resource = container.resource;
    const object = resource && typeof resource === "object" && !Array.isArray(resource)
      ? resource as Record<string, Json>
      : {};
    const attributes = Array.isArray(object.attributes) ? object.attributes : [];
    object.attributes = [
      ...attributes.filter((entry) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return true;
        return !trustedKeys.has(String(entry.key ?? ""));
      }),
      { key: "loggify.tenant.id", value: { stringValue: tenant } },
      { key: "deployment.environment.name", value: { stringValue: environment } },
    ];
    container.resource = object;
  }
  return payload;
}
