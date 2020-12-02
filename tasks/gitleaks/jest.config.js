const path = require("path");
module.exports = {
  rootDir: path.join(__dirname),
  verbose: true,
  moduleFileExtensions: ["js", "ts", "json"],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!<rootDir>/node_modules/"
  ],
  collectCoverage: true,
  transform: { "^.+\\.ts?$": "ts-jest" },
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"]
};