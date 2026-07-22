import Foundation

public enum SemanticEventName: String, Codable, Sendable {
    case decision
    case invariantFail = "invariant.fail"
    case stateTransition = "state.transition"
    case snapshot
    case spanStart = "span.start"
    case spanEnd = "span.end"
    case externalCallStart = "external.call.start"
    case externalCallEnd = "external.call.end"
}

public enum AttributeValue: Sendable, Equatable {
    case string(String)
    case integer(Int)
    case double(Double)
    case bool(Bool)

    var otlp: [String: Any] {
        switch self {
        case let .string(value): ["stringValue": value]
        case let .integer(value): ["intValue": String(value)]
        case let .double(value): ["doubleValue": value]
        case let .bool(value): ["boolValue": value]
        }
    }
}

public struct SemanticEvent: Sendable, Equatable {
    public let name: SemanticEventName
    public let component: String
    public let operation: String
    public let attributes: [String: AttributeValue]

    public init(name: SemanticEventName, component: String, operation: String, attributes: [String: AttributeValue] = [:]) {
        self.name = name
        self.component = component
        self.operation = operation
        self.attributes = attributes
    }
}

public enum LogSeverity: String, Sendable {
    case debug = "DEBUG", info = "INFO", warning = "WARN", error = "ERROR"
    var number: Int { switch self { case .debug: 5; case .info: 9; case .warning: 13; case .error: 17 } }
}

