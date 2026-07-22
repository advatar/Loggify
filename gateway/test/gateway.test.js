import assert from "node:assert/strict";
import { createServer } from "node:http";
import { afterEach, test } from "node:test";
import { createGateway } from "../dist/server.js";

const servers = [];
afterEach(async () => Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve)))));

async function listen(server) {
  servers.push(server);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

function config(collectorUrl, maxBodyBytes = 1_048_576) {
  return {
    port: 0,
    collectorUrl,
    maxBodyBytes,
    timeoutMs: 1000,
    requestsPerMinute: 600,
    keys: new Map([["test-key", { tenant: "cardio", environment: "test" }]]),
  };
}

const payload = {
  resourceLogs: [{ resource: { attributes: [
    { key: "service.name", value: { stringValue: "app" } },
    { key: "loggify.tenant.id", value: { stringValue: "spoofed" } },
  ] }, scopeLogs: [{ logRecords: [{ attributes: [
    { key: "password", value: { stringValue: "unsafe" } },
  ] }] }] }],
};

test("authenticates, redacts, stamps tenant, and forwards OTLP", async () => {
  let forwarded;
  const collector = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    forwarded = JSON.parse(Buffer.concat(chunks).toString());
    response.writeHead(200, { "content-type": "application/json" });
    response.end("{}");
  });
  const collectorUrl = await listen(collector);
  const gatewayUrl = await listen(createGateway(config(collectorUrl)));
  const response = await fetch(`${gatewayUrl}/v1/logs`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-loggify-key": "test-key" },
    body: JSON.stringify(payload),
  });
  assert.equal(response.status, 200);
  const resourceAttributes = forwarded.resourceLogs[0].resource.attributes;
  assert.equal(resourceAttributes.find((item) => item.key === "loggify.tenant.id").value.stringValue, "cardio");
  assert.equal(resourceAttributes.find((item) => item.key === "deployment.environment.name").value.stringValue, "test");
  assert.equal(forwarded.resourceLogs[0].scopeLogs[0].logRecords[0].attributes[0].value.stringValue, "<redacted>");
});

test("rejects missing credentials without contacting collector", async () => {
  let contacted = false;
  const collectorUrl = await listen(createServer((_request, response) => { contacted = true; response.end(); }));
  const gatewayUrl = await listen(createGateway(config(collectorUrl)));
  const response = await fetch(`${gatewayUrl}/v1/logs`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload),
  });
  assert.equal(response.status, 401);
  assert.equal(contacted, false);
});

test("enforces body limits", async () => {
  const collectorUrl = await listen(createServer((_request, response) => response.end("{}")));
  const gatewayUrl = await listen(createGateway(config(collectorUrl, 10)));
  const response = await fetch(`${gatewayUrl}/v1/logs`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-loggify-key": "test-key" },
    body: JSON.stringify(payload),
  });
  assert.equal(response.status, 413);
});

test("rate limits each project", async () => {
  const collectorUrl = await listen(createServer((_request, response) => response.end("{}")));
  const limited = config(collectorUrl);
  limited.requestsPerMinute = 1;
  const gatewayUrl = await listen(createGateway(limited));
  const send = () => fetch(`${gatewayUrl}/v1/logs`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-loggify-key": "test-key" },
    body: JSON.stringify(payload),
  });
  assert.equal((await send()).status, 200);
  const rejected = await send();
  assert.equal(rejected.status, 429);
  assert.equal(rejected.headers.get("retry-after"), "60");
});
