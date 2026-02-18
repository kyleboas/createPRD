# Tasks: Make Buttons Grey

## Relevant Files

- `app/globals.css` - Contains all button styles (`.button` and `.button-secondary`). This is the only file that needs to be modified.

### Notes

- All button styling is centralized in `app/globals.css`. No component files (`.tsx`) need to change.
- Unit tests should typically be placed alongside the code files they are testing.
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Instructions for Completing Tasks

IMPORTANT: As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout a new branch for this feature (e.g., `git checkout -b feature/grey-buttons`)

- [ ] 1.0 Update primary button (`.button`) background and text colors
  - [ ] 1.1 Open `app/globals.css` and locate the `.button` rule (currently at line 76)
  - [ ] 1.2 Change `border` color from `#0f172a` to `#D1D5DB`
  - [ ] 1.3 Change `background` from `#0f172a` to `#D1D5DB`
  - [ ] 1.4 Change `color` from `#ffffff` to `#1F2937` (dark grey for contrast)

- [ ] 2.0 Update secondary button (`.button-secondary`) background and text colors
  - [ ] 2.1 Locate the `.button-secondary` rule (currently at line 88)
  - [ ] 2.2 Change `border-color` from `#334155` to `#D1D5DB`
  - [ ] 2.3 Change `background` from `#ffffff` to `#D1D5DB`
  - [ ] 2.4 Change `color` from `#0f172a` to `#1F2937`

- [ ] 3.0 Add hover, focus, and active interactive states for buttons
  - [ ] 3.1 Add a `.button:hover` rule with `background: #9CA3AF` and `border-color: #9CA3AF` (gray-400, slightly darker)
  - [ ] 3.2 Add a `.button:focus` rule with `outline: 2px solid #6B7280` and `outline-offset: 2px`
  - [ ] 3.3 Add a `.button:active` rule with `background: #6B7280` and `border-color: #6B7280` (gray-500, darkest)
  - [ ] 3.4 Confirm existing `.button:disabled` styling (if any) is left unchanged

- [ ] 4.0 Verify visual output and contrast
  - [ ] 4.1 Run the development server (`npm run dev`) and open the app in a browser
  - [ ] 4.2 Confirm all buttons (primary and secondary) appear light grey
  - [ ] 4.3 Confirm button text is dark and legible against the grey background
  - [ ] 4.4 Hover over a button and confirm it darkens to gray-400
  - [ ] 4.5 Tab to a button via keyboard and confirm a visible focus ring appears
  - [ ] 4.6 Click and hold a button and confirm it darkens further to gray-500

- [ ] 5.0 Commit and push changes
  - [ ] 5.1 Stage the modified file: `git add app/globals.css`
  - [ ] 5.2 Commit with a descriptive message, e.g. `git commit -m "Make all buttons light grey with updated interactive states"`
  - [ ] 5.3 Push to the feature branch: `git push -u origin <branch-name>`
