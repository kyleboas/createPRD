# PRD: Make Buttons Grey

## 1. Introduction / Overview

This feature changes the background color of all buttons across the entire application to light grey (`#D1D5DB`, equivalent to Tailwind CSS `gray-300`). The change applies only to the default/resting state. Text and icon colors on buttons must be set to whatever value passes WCAG AA contrast requirements against the new light grey background.

## 2. Goals

- Every button in the application displays a background color of `#D1D5DB` in its default state.
- Every button's text/icon color meets WCAG AA contrast ratio (minimum 4.5:1 for normal text, 3:1 for large text) against `#D1D5DB`.
- No regressions in button functionality or layout.

## 3. User Stories

- **As a user**, I want all buttons to appear in a consistent light grey so the UI feels cohesive and neutral.
- **As a developer**, I want button background color defined in one place so future changes are easy to make.

## 4. Functional Requirements

1. The system must apply a background color of `#D1D5DB` (light grey / Tailwind `gray-300`) to every button element in the application in its default/resting state.
2. The system must apply this to **all** button variants and instances across all pages and components (primary, secondary, icon-only, and any element styled to look like a button).
3. The system must NOT change the button background for hover, active, focus, or disabled states — only the default state is in scope.
4. The system must ensure that the text and/or icon color on each button passes WCAG AA contrast standards against `#D1D5DB`. A dark color such as `#111827` (Tailwind `gray-900`) typically meets this requirement and should be used as the default where no accessible color already exists.
5. The system must NOT alter any other button property: size, padding, border, border-radius, font size, font weight, or layout.

## 5. Non-Goals (Out of Scope)

- Changing button styles for hover, active, focus, or disabled states.
- Changing buttons inside third-party embedded widgets (payment forms, maps, chat widgets, etc.).
- Updating buttons in emails or other non-application surfaces.
- Any redesign of button shape, size, spacing, or typography.
- Dark mode variations.
- Updating design system documentation or Storybook stories.

## 6. Design Considerations

- **Target background color:** `#D1D5DB` (Tailwind `gray-300`).
- **Text/icon color:** Must pass WCAG AA. `#111827` (Tailwind `gray-900`) achieves a contrast ratio above 10:1 against `#D1D5DB` and is a safe default. Verify each color using a tool like the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
- If the codebase uses a design token system (CSS custom properties, Tailwind theme config, styled-system theme), update the token rather than hardcoding `#D1D5DB` at every call site.

## 7. Technical Considerations

- Locate all button style definitions: global CSS, CSS Modules, Tailwind utility classes, styled-components, CSS-in-JS, or theme files.
- If a shared `Button` component exists, updating its default styles may be sufficient to cover most buttons in a single change.
- If Tailwind is used, replace existing background-color utilities (e.g., `bg-blue-500`, `bg-primary`) on button elements/components with `bg-gray-300`, or update the base button config in `tailwind.config`.
- After changes, manually inspect (or run a visual regression test on) all button instances to confirm no button was missed.
- Ensure changes work across all browsers the application supports.

## 8. Success Metrics

- 100% of buttons in the application show `#D1D5DB` as their background color in the default state.
- 100% of buttons pass WCAG AA contrast ratio for text/icon color against `#D1D5DB`.
- Zero functional regressions reported after deployment (clicks, form submissions, navigation all work as before).
- No non-button elements are unintentionally affected.

## 9. Open Questions

- Are there any buttons intentionally styled as transparent or invisible (e.g., icon-only toolbar buttons with no background)? Should those also become grey?
- Is there a centralized design token or theme file for button colors, or are styles scattered across individual component files?
- Should `<a>` tags or other non-`<button>` elements styled to look like buttons also be updated?
