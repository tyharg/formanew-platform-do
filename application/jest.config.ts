import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts', '@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^lib/(.*)$': '<rootDir>/src/lib/$1',
    '^settings$': '<rootDir>/src/settings',
  },
  transformIgnorePatterns: ['/node_modules/(?!next-auth|@auth/core).+\\.js$'],
  testPathIgnorePatterns: [
    '<rootDir>/src/lib/',
    '<rootDir>/src/services/',
    '<rootDir>/src/app/api/',
    '<rootDir>/src/middleware.test.ts',
    '/node_modules/',
  ],
};

export default createJestConfig(customJestConfig);
