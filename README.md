# createPRD web app

This repository includes tasks **1.0** and **2.0** from `tasks/website-tasks.md`.

## Stack

- Next.js 14 (App Router)
- TypeScript
- ESLint + Prettier
- Jest + Testing Library

## GitHub authentication approach (Task 2.1)

This app uses a **GitHub OAuth App** flow for v1.

### Why OAuth App for v1

- Lets any GitHub user sign in without requiring repo installation UX.
- Keeps setup simple for early validation.
- Provides one user-scoped access token that can be used to list repositories and fetch metadata.

### Required scopes

- `repo`: required in v1 so private/public repositories can be listed and files can be written by later commit endpoints.
- `read:user`: used to read the authenticated user profile (`/user`) for session identity.

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
- `NEXT_PUBLIC_APP_URL`: base URL for OAuth callback redirects (for local dev: `http://localhost:3000`).
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID.
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret.
- `SESSION_SECRET`: random secret used to sign encrypted session cookies.

4. Configure the GitHub OAuth App callback URL:

- `http://localhost:3000/api/auth/github` for local development.

5. Start the app:

   ```bash
   npm run dev
   ```

## Current auth + repo selection behavior

- Sign in with GitHub from the **Repository picker** panel.
- Session token is stored server-side in an **HTTP-only signed cookie**.
- Repository list includes permission details and a warning when write access is likely missing.
- Selecting a repository stores it as the **last selected repo in session** and displays it in the header.
- The repo picker also fetches and shows the repository default branch via `/api/github/repo-meta`.

## Scripts

- `npm run dev` - start local dev server.
- `npm run build` - production build.
- `npm run start` - run production server.
- `npm run lint` - run Next.js lint checks (auto-skips with a warning if local dependencies are unavailable).
- `npm run format` - format with Prettier.
- `npm run format:check` - verify formatting.
- `npm run test` - run Jest tests (auto-skips with a warning if local dependencies are unavailable).
- `npm run test:watch` - run tests in watch mode (auto-skips with a warning if local dependencies are unavailable).
