module.exports = {
  roots: ['<rootDir>/src'],
  verbose: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!<rootDir>/node_modules/"
  ],
  preset: "ts-jest",
  collectCoverage: true,
  transform: { "^.+\\.ts?$": "ts-jest" },
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"]
};