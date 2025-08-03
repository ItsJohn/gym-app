---
description: Unit test helper for Jest testing with expo-sqlite mocking
globs: **/*.test.ts
alwaysApply: false
---

# Unit Test Guidelines

## Testing Framework
- Use Jest as the testing framework
- Always mock expo-sqlite in tests, including openDatabaseAsync and deleteDatabaseAsync
- Reset all mockResolvedValue and mockRejectedValue in beforeEach to avoid test bleedover
- Use resetDatabase() from database module to clear internal state before each test

## Running Tests
- Always use `nvm use` to ensure correct Node.js version
- Run tests with `yarn test`
- Use `nvm use && yarn test` to run tests with proper Node version

## Code Style
- Use TypeScript with double quotes, semicolons, and trailing commas
- Use 2 spaces for indentation
- Follow Prettier and ESLint configurations
- No comments in test files

## AI Assistant Guidelines
- Prefer comprehensive tests without comments
- Always reset mocks and database state in tests
- Follow the established mocking patterns for expo-sqlite
- Use the resetDatabase() function to clear internal database state
- Ensure all async operations are properly awaited in tests
- Always run tests with `nvm use && yarn test`