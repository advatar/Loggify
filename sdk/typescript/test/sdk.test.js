import assert from "node:assert/strict";
import { test } from "node:test";
import { buildOtlpLogRequest, childTrace, createTrace, traceparent } from "../dist/index.js";

test("creates W3C-compatible trace identifiers and children", () => {
  const root = createTrace();
  const child = childTrace(root);
  assert.match(root.traceId, /^[0-9a-f]{32}$/);
  assert.match(root.spanId, /^[0-9a-f]{16}$/);
  assert.equal(child.traceId, root.traceId);
  assert.equal(child.parentSpanId, root.spanId);
  assert.match(traceparent(child), /^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
});

test("builds OTLP log requests with semantic attributes", () => {
  const payload = buildOtlpLogRequest({
    service: "cardio", environment: "test", trace: createTrace(),
    event: { name: "state.transition", component: "ecg", operation: "ecg.sync", attributes: { to: "uploading" } },
  });
  const record = payload.resourceLogs[0].scopeLogs[0].logRecords[0];
  assert.equal(record.eventName, "state.transition");
  assert.equal(record.attributes.find((item) => item.key === "loggify.component").value.stringValue, "ecg");
});

