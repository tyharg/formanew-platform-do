import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
  testEnvironment: 'node',
  testMatch: [
    '**/app/api/**/*.test.ts',
    '**/lib/**/*.test.ts',
    '**/services/**/*.test.ts',
    '**/helpers/**/*.test.ts',
    '**/middleware.test.ts',
  ],
  moduleNameMapper: {
    '^lib/(.*)$': '<rootDir>/src/lib/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^settings$': '<rootDir>/src/settings',
  },
});
