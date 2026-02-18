## Relevant Files

- `app/globals.css` - The single global stylesheet containing all button styles (`.button` and `.button-secondary` classes). This is the primary file to modify.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/make-buttons-grey`)

- [ ] 1.0 Audit existing button styles
  - [ ] 1.1 Read `app/globals.css` in full to understand all existing button-related rules
  - [ ] 1.2 Search all component files (`components/*.tsx`, `app/*.tsx`) for any inline styles or className references related to buttons to confirm no additional button styling exists outside `globals.css`
  - [ ] 1.3 Note the current `background`/`background-color` values for `.button` and `.button-secondary` so hover/active adjustments can be calculated relative to the new grey base

- [ ] 2.0 Update `.button` (primary) background to grey
  - [ ] 2.1 In `app/globals.css`, change the `background` property of `.button` from `#0f172a` to `#D1D5DB`
  - [ ] 2.2 Verify that the `color` property (`#ffffff`) is **not** changed — update it to a dark colour (e.g., `#0f172a`) so text remains readable against the new light grey background
  - [ ] 2.3 Add or update the `border-color` of `.button` to match the new grey base (e.g., `#D1D5DB`) or a slightly darker shade for visual clarity

- [ ] 3.0 Update `.button-secondary` background to grey
  - [ ] 3.1 In `app/globals.css`, change the `background` property of `.button-secondary` from `#ffffff` to `#D1D5DB`
  - [ ] 3.2 Confirm that the `color` property (`#0f172a`) is unchanged
  - [ ] 3.3 Adjust `border-color` of `.button-secondary` if needed so it remains visually distinct against the grey background

- [ ] 4.0 Add / update hover and active states
  - [ ] 4.1 Add a `:hover` rule for `.button` that darkens from the grey base (e.g., `background: #9CA3AF`)
  - [ ] 4.2 Add a `:hover` rule for `.button-secondary` that darkens from the grey base (e.g., `background: #9CA3AF`)
  - [ ] 4.3 Add an `:active` rule for both button classes that darkens further (e.g., `background: #6B7280`) to preserve the relative shift behaviour described in the PRD
  - [ ] 4.4 Confirm no `:focus` or `:disabled` rules are inadvertently overridden; leave disabled styles untouched unless they explicitly relied on the old button color

- [ ] 5.0 Verify the changes visually and via tests
  - [ ] 5.1 Run the existing test suite (`npx jest`) and confirm all tests pass with no regressions
  - [ ] 5.2 Manually review each component that uses `.button` or `.button-secondary` (`ActionBar`, `BYOKKeyModal`, `ChatPanel`, `PreviewTabs`, `RepoPicker`, `SessionStatus`, `WorkflowShell`) to confirm buttons render with the grey background and readable text
  - [ ] 5.3 Confirm hover and active states are visually distinct from the default grey state
