# Agent Instructions

To ensure JavaScript/TypeScript quality checks always run, follow these rules when modifying any files in this repository:

- Before committing, change into the `application` directory and run the following commands:
  - `npm run lint` (runs ESLint via Next.js)
  - `npx tsc --noEmit` (type-checks the project without generating output)
- Include the results of these commands in your final report when applicable.

These steps are mandatory for every change affecting the application codebase.
