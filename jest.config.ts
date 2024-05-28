/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  testTimeout: 30000,
  resetMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    'src/services/**/*.{ts,tsx}', // Include all JavaScript/JSX files in the src directory
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/', // Exclude the node_modules directory
    '/__tests__/', // Exclude the tests directory
  ],
};
