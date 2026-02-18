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


## BYOK behavior (Task 6.0)

- LLM routes now require a validated BYOK key sent as an `Authorization: Bearer ...` header.
- Use **BYOK settings** in the UI to validate your key using a lightweight provider check.
- Default storage is `sessionStorage` (cleared on tab close).
- Optional **Remember my key** encrypts the key with AES-256 (Web Crypto) and a PBKDF2-derived key from your passphrase, then stores ciphertext in `localStorage`.
- A **Forget my key** action immediately removes persisted ciphertext from `localStorage`.
- Basic non-sensitive telemetry counters are exposed at `GET /api/telemetry`.

## Scripts

- `npm run dev` - start local dev server.
- `npm run build` - production build.
- `npm run start` - run production server.
- `npm run lint` - run Next.js lint checks (auto-skips with a warning if local dependencies are unavailable).
- `npm run format` - format with Prettier.
- `npm run format:check` - verify formatting.
- `npm run test` - run Jest tests (auto-skips with a warning if local dependencies are unavailable).
- `npm run test:watch` - run tests in watch mode (auto-skips with a warning if local dependencies are unavailable).

## Manual QA happy-path checklist (Task 7.4)

Run this checklist before cutting a release:

1. Sign in with GitHub in the **Repository picker** and select a repo with write access.
2. Open **BYOK settings**, validate a provider key, and confirm status updates to a validated state.
3. Enter a feature prompt and click **Ask clarifying questions**.
4. Answer clarifying questions in `1B, 2C, 3A` format (or quick-pick buttons).
5. Click **Generate PRD**, verify PRD content appears in the preview tab.
6. Optionally edit PRD, then click **Approve PRD**.
7. Click **Generate Tasks**, confirm task markdown has checkbox formatting and numbered hierarchy.
8. Click **Review Summary** and verify repo, branch, and final file paths.
9. Click **Commit to Repo** and verify success UI includes commit SHA + file paths.
10. In GitHub, verify both files landed on the default branch:
    - `/tasks/prd-[feature-name].md`
    - `/tasks/tasks-[feature-name].md`

## Security review checklist (Task 7.6)

- [ ] Secrets only exist in environment variables (`GITHUB_CLIENT_SECRET`, `SESSION_SECRET`) and are never committed.
- [ ] No raw BYOK/API tokens are logged by server routes or telemetry.
- [ ] Client receives only non-sensitive session context (no GitHub access token leakage).
- [ ] LLM routes require `Authorization: Bearer ...` and provider validation before use.
- [ ] Session cookies remain HTTP-only and signed.
- [ ] API routes return actionable but non-sensitive error messages.
- [ ] GitHub write flow fails safely on branch protection/rate-limit/permission errors.

## Deployment readiness (Task 7.7)

A Vercel deployment configuration is included in `vercel.json`.

### Quick deploy (Vercel)

1. Import this repository into Vercel.
2. Configure environment variables for all environments:
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_APP_URL`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `SESSION_SECRET`
3. Set your GitHub OAuth callback to:
   - `https://<your-domain>/api/auth/github`
4. Deploy and verify:
   - GitHub login works.
   - Repo metadata loads.
   - BYOK validate route works.
   - Clarify → PRD → approve → tasks → commit flow succeeds.

### Notes

- `NEXT_PUBLIC_APP_URL` must match the public deployment URL for OAuth callback state to pass.
- BYOK keys are user-provided and client-held; do not add provider master keys to server env in v1.
