import XCTest
@testable import Loggify

final class LoggifyTests: XCTestCase {
    func testTraceContextCreatesValidChild() {
        let root = TraceContextValue.root()
        let child = root.child()
        XCTAssertEqual(root.traceID.count, 32)
        XCTAssertEqual(root.spanID.count, 16)
        XCTAssertEqual(child.traceID, root.traceID)
        XCTAssertEqual(child.parentSpanID, root.spanID)
        XCTAssertEqual(child.traceparent.count, 55)
    }

    func testPayloadUsesOTLPSemanticFields() throws {
        let exporter = OTLPHTTPExporter(configuration: .init(endpoint: URL(string: "https://example.invalid")!, projectKey: "test"))
        let logger = SemanticLogger(service: "cardio", environment: "test", exporter: exporter)
        let event = SemanticEvent(name: .stateTransition, component: "ecg", operation: "ecg.sync")
        let data = try logger.payload(for: event, trace: .root())
        let root = try XCTUnwrap(JSONSerialization.jsonObject(with: data) as? [String: Any])
        let resourceLogs = try XCTUnwrap(root["resourceLogs"] as? [[String: Any]])
        let scopeLogs = try XCTUnwrap(resourceLogs[0]["scopeLogs"] as? [[String: Any]])
        let records = try XCTUnwrap(scopeLogs[0]["logRecords"] as? [[String: Any]])
        XCTAssertEqual(records[0]["eventName"] as? String, "state.transition")
    }
}

