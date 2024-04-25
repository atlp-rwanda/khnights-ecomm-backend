"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
exports.default = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/**/*.test.ts"],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}", // Include all JavaScript/JSX files in the src directory
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/", // Exclude the node_modules directory
        "/__tests__/", // Exclude the tests directory
    ],
};
