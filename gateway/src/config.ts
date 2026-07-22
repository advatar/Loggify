export interface ProjectIdentity {
  tenant: string;
  environment: string;
}

export interface GatewayConfig {
  port: number;
  collectorUrl: string;
  maxBodyBytes: number;
  timeoutMs: number;
  requestsPerMinute: number;
  keys: Map<string, ProjectIdentity>;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer, received ${value}`);
  }
  return parsed;
}

export function parseKeys(raw: string | undefined): Map<string, ProjectIdentity> {
  const result = new Map<string, ProjectIdentity>();
  for (const entry of (raw ?? "").split(",").map((item) => item.trim()).filter(Boolean)) {
    const [key, tenant, environment, ...rest] = entry.split(":");
    if (!key || !tenant || !environment || rest.length > 0) {
      throw new Error("LOGGIFY_KEYS entries must use key:tenant:environment");
    }
    if (result.has(key)) throw new Error("LOGGIFY_KEYS contains a duplicate key");
    result.set(key, { tenant, environment });
  }
  if (result.size === 0) throw new Error("LOGGIFY_KEYS must contain at least one key");
  return result;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  return {
    port: positiveInteger(env.LOGGIFY_PORT, 8080),
    collectorUrl: (env.LOGGIFY_COLLECTOR_URL ?? "http://localhost:4318").replace(/\/$/, ""),
    maxBodyBytes: positiveInteger(env.LOGGIFY_MAX_BODY_BYTES, 1_048_576),
    timeoutMs: positiveInteger(env.LOGGIFY_TIMEOUT_MS, 5_000),
    requestsPerMinute: positiveInteger(env.LOGGIFY_REQUESTS_PER_MINUTE, 600),
    keys: parseKeys(env.LOGGIFY_KEYS),
  };
}
