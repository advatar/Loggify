// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "Loggify",
    platforms: [.macOS(.v13), .iOS(.v16)],
    products: [.library(name: "Loggify", targets: ["Loggify"])],
    targets: [
        .target(name: "Loggify"),
        .testTarget(name: "LoggifyTests", dependencies: ["Loggify"]),
    ]
)

