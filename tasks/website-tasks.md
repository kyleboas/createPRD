## Relevant Files

- `README.md` - Setup, local dev instructions, and how the PRD/tasks publishing flow works.
- `package.json` - Dependencies and scripts (dev, build, test, lint).
- `app/page.tsx` - Main page rendering chat + previews + repo picker (Next.js App Router style).
- `app/layout.tsx` - Global layout (header showing selected repo / branch / status).
- `app/api/auth/github/route.ts` - GitHub OAuth start/callback (if not using an auth library).
- `app/api/session/route.ts` - Session helpers (store tokens securely server-side).
- `app/api/github/repos/route.ts` - List repositories the user can access (and basic permission info).
- `app/api/github/repo-meta/route.ts` - Fetch repo metadata (default branch, protections if available).
- `app/api/github/commit/route.ts` - Commit PRD + tasks files to default branch.
- `app/api/llm/clarify/route.ts` - Generate clarifying questions from the initial prompt.
- `app/api/llm/prd/route.ts` - Generate PRD markdown from prompt + answers.
- `app/api/llm/tasks/route.ts` - Generate tasks markdown with checkboxes from PRD.
- `components/RepoPicker.tsx` - Repo selection UI (search, select, display permission warnings).
- `components/Chat.tsx` - Chat UI (messages, input, quick-select answers).
- `components/PreviewTabs.tsx` - Tabs for PRD/Tasks preview and markdown rendering.
- `components/ApprovalBar.tsx` - Approve/regenerate/commit actions and status indicators.
- `components/BYOKKeyModal.tsx` - UI to enter/validate/store BYOK LLM key.
- `lib/github/client.ts` - GitHub API client wrapper (auth headers, error normalization).
- `lib/github/repos.ts` - Repo listing + default branch lookup.
- `lib/github/contents.ts` - Create/update file content + collision checks.
- `lib/github/commits.ts` - Commit message conventions + multi-file commit flow.
- `lib/llm/provider.ts` - LLM provider abstraction using BYOK keys.
- `lib/llm/prompts.ts` - Prompt templates for clarify → PRD → tasks generation.
- `lib/slug.ts` - `feature-name` slug generation + sanitization.
- `lib/validation.ts` - Validate user inputs and guardrails for generated markdown.
- `__tests__/lib/slug.test.ts` - Unit tests for slug rules.
- `__tests__/lib/github-contents.test.ts` - Unit tests for collision/versioning logic.
- `__tests__/api/github-commit.test.ts` - Integration-style tests for commit route error handling.

### Notes

- Keep secrets server-side: GitHub client secret, session secrets. BYOK keys should never be logged.
- Unit tests should typically live near what they test (or in `__tests__/` if that’s your repo convention).
- Use `npx jest` to run all tests, or `npx jest path/to/test` to run a single test file.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file`

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 1.0 Scaffold the web app project and baseline tooling
  - [x] 1.1 Choose the app framework and structure (e.g., Next.js App Router) and initialize the project
  - [x] 1.2 Add linting/formatting (ESLint/Prettier) and ensure scripts exist in `package.json`
  - [x] 1.3 Add a testing framework (Jest + TS support) and a basic smoke test
  - [x] 1.4 Add environment variable management (e.g., `.env.local`) and document required env vars in `README.md`
  - [x] 1.5 Create a minimal homepage shell with placeholder panels: repo picker, chat, preview tabs, action bar

- [x] 2.0 Implement GitHub authentication and repository selection
  - [x] 2.1 Decide auth approach (OAuth app vs GitHub App) and document the choice + required permissions/scopes
  - [x] 2.2 Implement GitHub login flow and session handling (store access token securely server-side)
  - [x] 2.3 Create an API route to list accessible repositories for the signed-in user
  - [x] 2.4 In the repo list response, include enough info to warn about likely write failures (e.g., user permission level if available)
  - [x] 2.5 Build `RepoPicker` UI with search/filter, selection state, and “selected repo” display
  - [x] 2.6 Add API route to fetch repo metadata (default branch name at minimum)
  - [x] 2.7 Persist “last selected repo” per user session (and optionally per user account, if you add a DB later)

- [x] 3.0 Build the chat flow for clarifying questions + PRD generation + approval
  - [x] 3.1 Implement a conversation state model (initial prompt → clarifying questions → answers → PRD draft → approved)
  - [x] 3.2 Create `clarify` API route to generate 3–5 numbered questions with A/B/C/D options
  - [x] 3.3 Ensure the clarifying questions format is strict:
    - numbered questions `1..N`
    - options labeled `A..D` (or more)
    - user answer format accepted like `1B, 2C, 3A`
  - [x] 3.4 Build chat UI to display questions and support quick answering (copy/paste answer string or button picks)
  - [x] 3.5 Create `prd` API route to generate PRD markdown using the required PRD structure
  - [x] 3.6 Render PRD markdown in a preview panel (with safe markdown rendering)
  - [x] 3.7 Add “Regenerate PRD” and “Edit PRD” UX (edit can be a simple markdown textarea in v1)
  - [x] 3.8 Implement the approval gate: PRD must be explicitly approved before any GitHub write endpoints can run
  - [x] 3.9 Store the approved PRD snapshot (in session state at minimum)

- [x] 4.0 Generate the tasks document (full breakdown) and preview it with checkboxes
  - [x] 4.1 Create `tasks` API route that takes the approved PRD and outputs `tasks-[feature-name].md` content
  - [x] 4.2 Enforce tasks formatting:
    - every task line uses markdown checkboxes `- [ ]`
    - parent tasks use `X.0`, sub-tasks use `X.1`, `X.2`, etc.
    - include task `0.0 Create feature branch` only in the *generated* tasks file if your process requires it (your app can still generate it consistently)
  - [x] 4.3 Ensure the generated tasks include sub-tasks for each parent task (no “empty” parents unless purely config)
  - [x] 4.4 Add preview tab for Tasks and render the markdown
  - [x] 4.5 Add “Regenerate Tasks” and optional “Edit Tasks” UX
  - [x] 4.6 Compute and display the final target filenames:
    - `/tasks/prd-[feature-name].md`
    - `/tasks/tasks-[feature-name].md`

- [x] 5.0 Commit PRD + tasks into the selected repo’s default branch with collision handling
  - [x] 5.1 Implement `feature-name` slugging rules and unit tests (lowercase, hyphenated, safe chars)
  - [x] 5.2 Implement GitHub “get default branch” logic (do not assume `main`)
  - [x] 5.3 Implement “check if file exists” logic for both target paths before committing
  - [x] 5.4 Implement collision policy:
    - either prompt user to overwrite, or
    - auto-version filenames (e.g., `-v2`, `-v3`) and display chosen filenames before commit
  - [x] 5.5 Implement commit API route to write both files to the default branch
  - [x] 5.6 Ensure atomic-ish behavior:
    - if you can’t guarantee a single commit containing both files, then handle partial failure clearly (show exactly what succeeded)
  - [x] 5.7 Add a final “Review summary” confirmation UI before commit (repo, branch, filenames, overwrite/versioning)
  - [x] 5.8 On success, display repo + branch + commit SHA + file paths
  - [x] 5.9 Handle branch protection failures:
    - show a clear error message (“Direct commits to default branch are blocked by branch protection”)
    - include actionable guidance (e.g., “disable protection or allow this app to bypass” if applicable)

- [x] 6.0 Implement BYOK LLM key entry, validation, and secure handling
  - [x] 6.1 Add UI for entering an LLM key (modal/settings panel) with provider selection (at least one provider in v1)
  - [x] 6.2 Implement key handling strategy for v1 (decided):
    - **Default:** store key in `sessionStorage` (cleared on tab close, never persisted automatically)
    - **Opt-in "Remember my key":** encrypt with AES-256 via Web Crypto API (`crypto.subtle`), key derived via PBKDF2 from a user-supplied passphrase, store ciphertext in `localStorage`
    - Show a visible warning when opt-in persistence is enabled: *"Stored locally — not protected against XSS"*
    - Add a "Forget my key" button that clears `localStorage` immediately
    - Never send the raw key to the server except as an `Authorization` header for proxied LLM calls
  - [x] 6.3 Implement “Validate key” action using a lightweight test request and show clear errors
  - [x] 6.4 Ensure the raw key is never printed in logs and never returned to the client once stored
  - [x] 6.5 Update all LLM routes (`clarify`, `prd`, `tasks`) to require a valid BYOK key (or show a friendly prompt to add one)
  - [x] 6.6 Add rate-limit and safety guardrails:
    - prevent rapid repeated regenerate spam
    - cap maximum prompt/response sizes
  - [x] 6.7 Add basic telemetry counters (non-sensitive) for debugging (e.g., “LLM call failed”, “GitHub write failed”)

- [ ] 7.0 Add tests, error handling, UX polish, and deployment readiness
  - [ ] 7.1 Add unit tests for slugging and filename collision/versioning logic
  - [ ] 7.2 Add tests for GitHub client error normalization (401, 403, 404, rate limit)
  - [ ] 7.3 Add tests for “format validators”:
    - clarifying questions structure
    - tasks markdown checkbox structure
  - [ ] 7.4 Add end-to-end happy path checklist (manual QA doc in `README.md`)
  - [ ] 7.5 Improve UX states:
    - loading spinners
    - disabled buttons when prerequisites missing
    - clear step indicator (prompt → clarify → PRD → approve → tasks → commit)
  - [ ] 7.6 Add security review checklist:
    - secrets only in env vars
    - no token leakage to client
    - CSRF/basic request hardening as appropriate
  - [ ] 7.7 Prepare deployment config (Vercel/Railway/etc.) and document env vars + setup steps
  - [ ] 7.8 Final pass: ensure `/tasks/` outputs exactly match required filenames and formatting constraints
