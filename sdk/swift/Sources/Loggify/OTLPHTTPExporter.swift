import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public actor OTLPHTTPExporter {
    public struct Configuration: Sendable {
        public let endpoint: URL
        public let projectKey: String
        public let timeout: TimeInterval

        public init(endpoint: URL, projectKey: String, timeout: TimeInterval = 5) {
            self.endpoint = endpoint
            self.projectKey = projectKey
            self.timeout = timeout
        }
    }

    private let configuration: Configuration
    private let session: URLSession

    public init(configuration: Configuration) {
        self.configuration = configuration
        let sessionConfiguration = URLSessionConfiguration.ephemeral
        sessionConfiguration.timeoutIntervalForRequest = configuration.timeout
        self.session = URLSession(configuration: sessionConfiguration)
    }

    public func export(_ data: Data) async throws {
        var request = URLRequest(url: configuration.endpoint.appendingPathComponent("v1/logs"))
        request.httpMethod = "POST"
        request.httpBody = data
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(configuration.projectKey, forHTTPHeaderField: "X-Loggify-Key")
        let (_, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw ExportError.rejected
        }
    }

    public enum ExportError: Error { case rejected }
}

public struct SemanticLogger: Sendable {
    public let service: String
    public let environment: String
    public let exporter: OTLPHTTPExporter

    public init(service: String, environment: String, exporter: OTLPHTTPExporter) {
        self.service = service
        self.environment = environment
        self.exporter = exporter
    }

    public func payload(for event: SemanticEvent, severity: LogSeverity = .info, message: String? = nil, trace: TraceContextValue? = TraceContext.current) throws -> Data {
        var eventAttributes = event.attributes
        eventAttributes["loggify.component"] = .string(event.component)
        eventAttributes["loggify.operation"] = .string(event.operation)
        if let trace { eventAttributes["loggify.flow.id"] = .string(trace.flowID) }

        var record: [String: Any] = [
            "timeUnixNano": String(UInt64(Date().timeIntervalSince1970 * 1_000_000_000)),
            "severityNumber": severity.number,
            "severityText": severity.rawValue,
            "body": ["stringValue": message ?? event.name.rawValue],
            "eventName": event.name.rawValue,
            "attributes": Self.attributes(eventAttributes),
        ]
        if let trace {
            record["traceId"] = trace.traceID
            record["spanId"] = trace.spanID
            record["flags"] = 1
        }
        let root: [String: Any] = ["resourceLogs": [[
            "resource": ["attributes": Self.attributes([
                "service.name": .string(service),
                "deployment.environment.name": .string(environment),
                "loggify.schema.version": .integer(1),
            ])],
            "scopeLogs": [["scope": ["name": "loggify.swift", "version": "0.1.0"], "logRecords": [record]]],
        ]]]
        return try JSONSerialization.data(withJSONObject: root)
    }

    public func emit(_ event: SemanticEvent, severity: LogSeverity = .info, message: String? = nil) async throws {
        try await exporter.export(payload(for: event, severity: severity, message: message))
    }

    private static func attributes(_ values: [String: AttributeValue]) -> [[String: Any]] {
        values.sorted(by: { $0.key < $1.key }).map { ["key": $0.key, "value": $0.value.otlp] }
    }
}

