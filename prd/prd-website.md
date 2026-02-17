## 1. Introduction / Overview

Create a web app that lets **any GitHub user** sign in, use a chat flow to generate and approve a Product Requirements Document (PRD), then automatically writes the PRD plus a **full task breakdown (including sub-tasks)** into a **user-selected GitHub repository** by committing directly to the repository’s **default branch** (typically `main`).

This solves the problem of: (1) turning an idea into a clear PRD and implementation plan, and (2) reliably storing that output in the correct repo without manual copy/paste.

## 2. Goals

- Allow any GitHub user to authenticate and select a target repository they have access to.
- Produce a PRD via chat with a clear approval step (nothing is written to GitHub before approval).
- Generate a separate tasks document that includes **high-level tasks + sub-tasks** and uses **Markdown checkboxes**.
- Commit both documents to the selected repo’s default branch under `/tasks/` with consistent naming.
- Support **BYOK (Bring Your Own Key)** for LLM access so each user can supply their own API key.

## 3. User Stories

- As a GitHub user, I want to sign in with GitHub so I can securely connect my account to the app.
- As a GitHub user, I want to select a repository from a list of repos I can access so I don’t have to type `owner/repo`.
- As a product owner, I want the app to ask a small set of essential clarifying questions so the PRD is accurate and actionable.
- As a product owner, I want to review and approve the PRD before anything is committed to my repository.
- As a developer, I want a tasks document with checkboxes and sub-tasks so I can implement the feature step-by-step.
- As a repo maintainer, I want the documents saved in a predictable location (`/tasks/`) with consistent filenames.

## 4. Functional Requirements

1. **GitHub Authentication**
   1.1 The system must allow any GitHub user to sign in using GitHub authentication.  
   1.2 The system must request the minimum permissions required to:
   - list repositories the user can access, and
   - write files to the selected repository’s default branch.  
   1.3 The system must allow the user to sign out.

2. **Repository Discovery and Selection**
   2.1 The system must display a list of repositories the user can access after sign-in.  
   2.2 The system must provide search/filter controls to find a repository by name and/or owner (user/org).  
   2.3 The system must allow the user to select exactly one “target repository” per PRD session.  
   2.4 The system should store the last selected repository for the user to speed up future sessions.

3. **Chat-Based PRD Flow**
   3.1 The system must provide a chat interface where the user submits an initial feature request (the “initial prompt”).  
   3.2 The system must ask 3–5 clarifying questions maximum, numbered `1..N`, each with multiple-choice options labeled `A, B, C, D...`.  
   3.3 The system must accept compact answers like `1B, 2C, 3A` and use them to generate the PRD.  
   3.4 The system must generate a PRD in Markdown using the required PRD structure (this document’s section layout).  
   3.5 The system must display a rendered preview of the PRD before approval.

4. **Approval Gate**
   4.1 The system must not write anything to GitHub until the user explicitly approves the PRD.  
   4.2 The system must allow the user to request revisions and regenerate the PRD prior to approval.  
   4.3 The system must store the final approved PRD content that will be committed.

5. **Tasks Document Generation (Full Breakdown + Sub-Tasks)**
   5.1 The system must generate a second Markdown document after PRD approval (or as part of the approval flow) containing:
   - high-level tasks, and
   - sub-tasks nested under each high-level task.  
   5.2 The tasks document must use Markdown checkboxes for every task line, including sub-tasks, for example:
   - `- [ ] High-level task`
   - `  - [ ] Sub-task`  
   5.3 The system must preview the tasks document before committing it to GitHub.  
   5.4 The system must allow the user to regenerate/edit the tasks document before committing, without re-authenticating or re-selecting the repo.

6. **Commit to GitHub Default Branch**
   6.1 The system must commit the approved PRD to: `/tasks/prd-[feature-name].md` on the repository’s default branch.  
   6.2 The system must commit the tasks document to: `/tasks/tasks-[feature-name].md` on the repository’s default branch.  
   6.3 The system must generate `feature-name` as a deterministic, sanitized slug (lowercase, hyphen-separated, safe characters only).  
   6.4 The system must not silently overwrite existing files. If a filename collision occurs, the system must do one of the following:
   - require explicit user confirmation to overwrite, **or**
   - write a versioned filename (e.g., `prd-[feature-name]-v2.md`) and clearly show the final filenames used.  
   6.5 The system must show a success message after commit that includes:
   - repository name,
   - default branch name,
   - commit SHA (or equivalent identifier),
   - and the paths of files written.

7. **BYOK (Bring Your Own Key) for LLM**
   7.1 The system must allow the user to provide their own LLM API key.  
   7.2 The system must not log the raw API key in server logs or analytics.  
   7.3 The system must validate the key (e.g., via a lightweight test request) and show a clear error if invalid.  
   7.4 The system must support at least one LLM provider in v1 (codex) and be designed so additional providers can be added later.  
   7.5 The system must define where the key lives (session-only, client-only, or encrypted server storage) and implement that choice consistently.

8. **Error Handling and Safety**
   8.1 The system must show clear, actionable errors for common GitHub failures (missing permissions, repo not found, rate limits, API errors).  
   8.2 If the default branch rejects direct commits (e.g., branch protection rules), the system must fail safely and explain why the commit did not occur.  
   8.3 The system must never partially commit only one artifact without clearly informing the user (e.g., PRD committed but tasks failed). If partial failure occurs, the UI must show exactly what succeeded and what did not.

## 5. Non-Goals (Out of Scope)

- Creating a pull request instead of committing directly to the default branch.
- Generating or committing application source code for the user’s feature (beyond the two Markdown documents).
- Project management integrations (Jira, Linear, Asana) in v1.
- Real-time collaborative editing by multiple users in the same session.

## 6. Design Considerations (Optional)

- Simple layout:
  - Bottom: Chat
  - Top: Preview panel with tabs: **PRD** and **Tasks**
- Clear primary actions:
  - “Ask clarifying questions”
  - “Generate PRD”
  - “Approve PRD”
  - “Generate tasks”
  - “Commit to repo”
- The selected repository should be highly visible (header/banner) to avoid committing to the wrong repo.
- Include a final confirmation screen before commit showing:
  - selected repo + default branch,
  - the exact file paths that will be created/updated,
  - whether any filename versioning will be applied.

## 7. Technical Considerations (Optional)

- **Auth approach:** Choose between a GitHub App or OAuth flow. The chosen approach must support:
  - listing repos the user can access,
  - writing to the selected repo’s default branch.
- **Default branch detection:** The system should read the repository’s default branch name (do not assume `main`).  
- **Branch protection:** Direct commits to default branch may fail on many repos due to protection rules. The system must detect/handle this gracefully (even if “PR fallback” is a non-goal for v1).  
- **Filename slugging:** Implement strict slug sanitization to prevent invalid paths and to keep filenames stable across regenerations.  
- **Auditability:** Store minimal audit records (user id, repo, file paths, commit SHA, timestamps) to help debug issues.

## 8. Success Metrics

- Commit success rate: `% of approved sessions that successfully commit both files`.
- Median time from initial prompt → PRD approval.
- Median time from PRD approval → successful commit.
- Error rate breakdown (permissions, branch protection, rate limits, validation failures).
- Repeat usage: `% of users who complete a second session within 7 days`.

## 9. Open Questions

- Which GitHub authorization model will be used in v1 (GitHub App vs OAuth), and what exact permissions/scopes are required?
- Where will BYOK keys be stored (session-only, client-only, encrypted server-side), and what is the minimum acceptable security posture for v1?
- Should tasks generation be automatic immediately after PRD approval, or require a separate explicit “Generate tasks” click?
- What is the chosen collision policy: always version filenames, or prompt the user to overwrite?
- Should the repo picker show *all* accessible repos, or only repos where the user appears to have write access (to reduce failed commits)?