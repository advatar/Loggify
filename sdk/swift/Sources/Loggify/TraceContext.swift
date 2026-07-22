import Foundation

public struct TraceContextValue: Sendable, Equatable {
    public let traceID: String
    public let spanID: String
    public let parentSpanID: String?
    public let flowID: String
    public let traceFlags: String

    public init(traceID: String, spanID: String, parentSpanID: String? = nil, flowID: String? = nil, traceFlags: String = "01") {
        self.traceID = traceID
        self.spanID = spanID
        self.parentSpanID = parentSpanID
        self.flowID = flowID ?? traceID
        self.traceFlags = traceFlags
    }

    public static func root(flowID: String? = nil) -> Self {
        let traceID = TraceIdentifiers.hex(bytes: 16)
        return .init(traceID: traceID, spanID: TraceIdentifiers.hex(bytes: 8), flowID: flowID)
    }

    public func child() -> Self {
        .init(traceID: traceID, spanID: TraceIdentifiers.hex(bytes: 8), parentSpanID: spanID, flowID: flowID, traceFlags: traceFlags)
    }

    public var traceparent: String { "00-\(traceID)-\(spanID)-\(traceFlags)" }
}

public enum TraceContext {
    @TaskLocal public static var current: TraceContextValue?

    public static func withValue<T: Sendable>(_ value: TraceContextValue, operation: () async throws -> T) async rethrows -> T {
        try await $current.withValue(value, operation: operation)
    }
}

enum TraceIdentifiers {
    static func hex(bytes: Int) -> String {
        var generator = SystemRandomNumberGenerator()
        return (0..<bytes).map { _ in String(format: "%02x", UInt8.random(in: .min ... .max, using: &generator)) }.joined()
    }
}

