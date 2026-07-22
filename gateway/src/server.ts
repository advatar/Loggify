import { createHash, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { loadConfig, type GatewayConfig, type ProjectIdentity } from "./config.js";
import { sanitizeAndStamp } from "./sanitize.js";

const paths = new Set(["/v1/logs", "/v1/traces", "/v1/metrics"]);

function reply(response: ServerResponse, status: number, body: object): void {
  response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  response.end(JSON.stringify(body));
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function identity(request: IncomingMessage, config: GatewayConfig): ProjectIdentity | undefined {
  const direct = request.headers["x-loggify-key"];
  const authorization = request.headers.authorization;
  const candidate = typeof direct === "string"
    ? direct
    : authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  if (!candidate) return undefined;
  const candidateHash = digest(candidate);
  for (const [key, project] of config.keys) {
    if (timingSafeEqual(candidateHash, digest(key))) return project;
  }
  return undefined;
}

async function readBody(request: IncomingMessage, maximum: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maximum) throw new RangeError("payload too large");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

export function createGateway(config: GatewayConfig) {
  const rateWindows = new Map<string, { minute: number; count: number }>();
  return createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/healthz") {
      reply(response, 200, { status: "ok" });
      return;
    }
    if (request.method !== "POST" || !request.url || !paths.has(request.url)) {
      reply(response, 404, { error: "not_found" });
      return;
    }
    const project = identity(request, config);
    if (!project) {
      reply(response, 401, { error: "unauthorized" });
      return;
    }
    const minute = Math.floor(Date.now() / 60_000);
    const rateKey = `${project.tenant}:${project.environment}`;
    const current = rateWindows.get(rateKey);
    const window = current?.minute === minute ? current : { minute, count: 0 };
    window.count += 1;
    rateWindows.set(rateKey, window);
    if (window.count > config.requestsPerMinute) {
      response.setHeader("retry-after", "60");
      reply(response, 429, { error: "rate_limit_exceeded" });
      return;
    }
    if (!request.headers["content-type"]?.toLowerCase().includes("application/json")) {
      reply(response, 415, { error: "content_type_must_be_application_json" });
      return;
    }
    try {
      const raw = await readBody(request, config.maxBodyBytes);
      const decoded = JSON.parse(raw.toString("utf8")) as unknown;
      const payload = sanitizeAndStamp(decoded, project.tenant, project.environment);
      const upstream = await fetch(`${config.collectorUrl}${request.url}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(config.timeoutMs),
      });
      if (!upstream.ok) {
        reply(response, 502, { error: "collector_rejected_telemetry" });
        return;
      }
      const responseBody = await upstream.text();
      response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
      response.end(responseBody || "{}");
    } catch (error) {
      if (error instanceof RangeError) reply(response, 413, { error: "payload_too_large" });
      else if (error instanceof SyntaxError || (error instanceof Error && (
        error.message.startsWith("OTLP") || error.message.startsWith("Payload")
      ))) {
        reply(response, 400, { error: "invalid_otlp_json" });
      } else {
        reply(response, 503, { error: "collector_unavailable" });
      }
    }
  });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const config = loadConfig();
  createGateway(config).listen(config.port, "0.0.0.0", () => {
    process.stdout.write(`Loggify gateway listening on ${config.port}\n`);
  });
}
