const path = require("path");
const rootDir = path.join(__dirname);
module.exports = {

    moduleFileExtensions: ["js", "ts", "json"],
    testPathIgnorePatterns: ["/node_modules/"],
    projects: [

        path.join(`${rootDir}`, "tasks/*/jest.config.js"),
    ],
    testMatch: [path.join(`${rootDir}`, "tasks/*/**/*.spec.ts")],
    testEnvironment: "node",
    transform: { "^.+\\.ts?$": "ts-jest" },
    collectCoverageFrom: [
        "**/*.{ts,tsx}"
    ],
    collectCoverage: true,

    coverageDirectory: path.join(`${rootDir}`, '/coverage/'),
    coverageReporters: ["html", "json", "lcov", "text", "clover"],
    reporters: ['default', 'jest-sonar']
}