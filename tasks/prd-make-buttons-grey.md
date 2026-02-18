# PRD: Make Buttons Grey

## 1. Introduction / Overview

Currently, buttons across the application use various background colors that may not align with the desired visual design. This feature updates all buttons application-wide to use a light grey background (#D1D5DB), while preserving existing text colors and maintaining consistency in hover/active states.

## 2. Goals

- All buttons in the application have a light grey (#D1D5DB) background color after this change.
- No button's text color is altered.
- Hover and active states follow the same relative behavior as before (e.g., if hover previously darkened the button, it should still darken — now from the grey base).
- The change is implemented via CSS Modules / plain CSS with no changes to HTML structure or JavaScript logic.

## 3. User Stories

- **As a user**, I want buttons to appear light grey so that the UI has a consistent, neutral visual style.
- **As a developer**, I want the grey styling applied in a single, maintainable place so future color changes are easy.

## 4. Functional Requirements

1. The system must set the background color of all `<button>` elements (and any element styled as a button) to `#D1D5DB` (light grey).
2. The system must NOT change the text color of any button.
3. The system must NOT change the font, padding, border-radius, border, or any other non-background property of buttons unless required to achieve the grey background.
4. The system must preserve existing hover and active state behavior, shifting those states relative to the new grey base color (e.g., a hover that previously darkened the button must now darken from grey rather than from the old color).
5. The system must apply this change to all buttons across all pages and components in the application.
6. The system must implement the change using CSS Modules or plain CSS only — no changes to HTML or JavaScript files.

## 5. Non-Goals (Out of Scope)

- Changing button text color, font, size, padding, or border styles.
- Updating primary / CTA buttons to a different color (all buttons are treated equally here).
- Adding new button variants or design tokens.
- Modifying any JavaScript, TypeScript, or HTML files.
- Changing icon colors inside buttons.
- Updating any design system documentation or Storybook stories.

## 6. Design Considerations

- **Target color:** `#D1D5DB` (equivalent to Tailwind `gray-300`) for the default background.
- **Hover/active:** Derive hover from the grey base. A reasonable default is to darken slightly on hover (e.g., `#9CA3AF` / `gray-400`) if no explicit hover color currently exists, or keep the existing relative shift if one does.
- **Disabled state:** If a disabled style exists, do not override it unless it currently relies on the old button color.

## 7. Technical Considerations

- Locate all CSS files (`.css`, `.module.css`) that define button background colors.
- A global CSS rule (e.g., in a `global.css` or `reset.css`) targeting `button` may be the most efficient single point of change, but be careful not to override component-level specificity unintentionally.
- Check for existing `background`, `background-color`, or shorthand rules on `.btn`, `button`, and any other button class names in use.
- Ensure the change works across all browsers that the application supports.

## 8. Success Metrics

- 100% of buttons visible in the application display a `#D1D5DB` background in their default state.
- No button's text color has changed from its previous value.
- Hover and active states remain functional and visually distinct from the default state.
- No visual regressions are introduced in non-button elements.

## 9. Open Questions

- Are there any buttons that must remain a specific non-grey color for accessibility or brand reasons (e.g., a "danger" delete button in red)?
- Is there a global stylesheet already in place where a single rule would apply everywhere, or are button styles spread across many component-level CSS Modules?
- Should the disabled button state also be updated to a grey variant, or left as-is?
