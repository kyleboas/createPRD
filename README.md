# createPRD web app

This repository now includes the baseline scaffold for task **1.0** from `tasks/website-tasks.md`.

## Stack

- Next.js 14 (App Router)
- TypeScript
- ESLint + Prettier
- Jest + Testing Library

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill required values in `.env.local`:

- `NEXT_PUBLIC_APP_NAME`: public display name for the UI.
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID (for future auth tasks).
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret.
- `SESSION_SECRET`: random secret used to sign session data.

4. Start the app:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - start local dev server.
- `npm run build` - production build.
- `npm run start` - run production server.
- `npm run lint` - run ESLint checks.
- `npm run format` - format with Prettier.
- `npm run format:check` - verify formatting.
- `npm run test` - run Jest tests.
- `npm run test:watch` - run tests in watch mode.
