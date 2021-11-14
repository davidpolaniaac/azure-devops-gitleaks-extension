module.exports = {
    moduleFileExtensions: ["js", "ts", "json"],
    testPathIgnorePatterns: ["/node_modules/"],
    projects: [
        "<rootDir>/tasks/*/jest.config.js",
    ],
    testMatch: ["<rootDir>/tasks/*/**/*.spec.ts"],
    testEnvironment: "node",
    transform: { "^.+\\.ts?$": "ts-jest" },
    collectCoverageFrom: [
        "**/*.{ts,tsx}"
    ],
    collectCoverage: true,

    coverageDirectory: '<rootDir>/coverage/',
    coverageReporters: ["html", "json", "lcov", "text", "clover", "cobertura"],
    reporters: ['default', 'jest-sonar']
}