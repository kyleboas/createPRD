# PRD: Make Buttons Grey

## 1. Introduction / Overview

Currently, the application uses dark navy (`#0f172a`) as the primary button background and white as the secondary button background. This change updates **all buttons** to use a light grey color scheme (`#D1D5DB`) across primary and secondary variants, including all interactive states (hover, focus, active). Text color will be automatically adjusted to dark (near-black) to ensure sufficient contrast against the light grey background.

The only file that requires modification is `app/globals.css`, which defines the `.button` and `.button-secondary` CSS classes used across all components.

---

## 2. Goals

- **G1:** All elements with class `.button` must display a light grey background (`#D1D5DB`) instead of dark navy.
- **G2:** All elements with class `.button-secondary` must display a light grey background (`#D1D5DB`) instead of white.
- **G3:** Button text must switch to a dark color (`#1F2937`) to maintain WCAG AA contrast against the light grey background.
- **G4:** Hover, focus, and active states must use appropriate grey variants (e.g., slightly darker grey on hover).
- **G5:** No component files (`.tsx`) require modification — all changes are confined to `app/globals.css`.

---

## 3. User Stories

- **US1:** As a user, I want all buttons to appear grey so the UI has a consistent, neutral visual style.
- **US2:** As a user, I want button text to remain legible against the grey background so I can easily read button labels.
- **US3:** As a user, I want hover and focus states to still feel interactive so I know the button responds to my actions.

---

## 4. Functional Requirements

1. The system must set the background color of `.button` to `#D1D5DB` (light grey).
2. The system must set the border color of `.button` to `#D1D5DB`.
3. The system must set the text color of `.button` to `#1F2937` (dark grey, near-black) for contrast.
4. The system must set the background color of `.button-secondary` to `#D1D5DB`.
5. The system must set the border color of `.button-secondary` to `#D1D5DB`.
6. The system must set the text color of `.button-secondary` to `#1F2937`.
7. The system must define a hover state for `.button` (and `.button-secondary`) that uses a slightly darker grey, e.g. `#9CA3AF` (`gray-400`), to indicate interactivity.
8. The system must define a focus state for `.button` that provides a visible focus ring using a grey tone (e.g., `outline: 2px solid #6B7280`).
9. The system must define an active state for `.button` that uses a darker grey, e.g. `#6B7280` (`gray-500`).
10. The system must not change any class names used in component files (`.button`, `.button-secondary` remain as-is).

---

## 5. Non-Goals (Out of Scope)

- Changing button shape, size, padding, border-radius, or font size.
- Modifying any `.tsx` component files.
- Adding new CSS classes or variants beyond what already exists.
- Supporting a dark mode variant.
- Changing icon or SVG colors inside buttons.
- Modifying disabled-state styling (keeping existing disabled styles).

---

## 6. Design Considerations

- **Primary button** (`.button`): Light grey background `#D1D5DB`, dark text `#1F2937`, grey border `#D1D5DB`.
- **Secondary button** (`.button-secondary`): Same light grey background `#D1D5DB`, dark text `#1F2937`, grey border `#D1D5DB`. The visual distinction between primary and secondary may be reduced; this is acceptable for this scope.
- **Hover state**: Darken to `#9CA3AF` (gray-400) for both variants.
- **Focus state**: `outline: 2px solid #6B7280` with a small offset.
- **Active state**: Darken to `#6B7280` (gray-500).

---

## 7. Technical Considerations

- All button styling is centralized in `app/globals.css` under `.button` and `.button-secondary`. No component files need changes.
- The grey values map to Tailwind's gray scale for reference: `gray-300` = `#D1D5DB`, `gray-400` = `#9CA3AF`, `gray-500` = `#6B7280`, `gray-700` = `#374151`.
- Existing disabled styles (opacity reduction via `.button:disabled`) should be left unchanged.

---

## 8. Success Metrics

- **SM1:** All buttons in the running application visually appear light grey.
- **SM2:** Button text is dark and readable (passes WCAG AA contrast ratio ≥ 4.5:1 for normal text).
- **SM3:** Hovering a button produces a visible darkening effect.
- **SM4:** Focusing a button via keyboard produces a visible focus ring.
- **SM5:** No regressions — existing button behavior (click handlers, disabled states, tab order) is unaffected.

---

## 9. Open Questions

- **OQ1:** Should `.button` and `.button-secondary` remain visually distinct from each other, or is it acceptable that they look the same after this change?
- **OQ2:** Should the disabled button state also adopt grey tones, or remain as-is?
