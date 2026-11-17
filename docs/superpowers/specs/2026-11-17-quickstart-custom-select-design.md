# QuickStart custom select (design addendum, small change)

Decided by Nehal on 2026-11-17: replace all remaining native `<select>` dropdowns in QuickStart with a custom component ("option 2"), after a native popup opened detached from its field in their browser.

## Intent
Every dropdown opens directly under (or above) its field, looks like the rest of the form, and works identically on desktop, tablet, phone and with keyboard / screen reader — independent of browser popup quirks.

## Pattern
WAI-ARIA Authoring Practices "Select-Only Combobox" (fallback: the ui-ux-pro-max database had no combobox-specific match; its general keyboard-navigation and accessible-name rules apply).
- Trigger: `<button type="button" role="combobox" aria-haspopup="listbox" aria-expanded aria-controls aria-labelledby="<label id> <trigger id>">` showing the selected label or placeholder "Choose…". Keeps the existing visible `<label>`.
- Popup: `<ul role="listbox" id tabindex="-1">` with `<li role="option" id aria-selected>`; focus stays on the trigger, active option via `aria-activedescendant`.
- Keyboard: Enter / Space / Alt+Down / Down / Up open; Up/Down move; Home/End; PageUp/PageDown (±10); type-ahead by first letters; Enter/Space select & close; Esc closes without change; Tab selects the active option and moves on (APG behaviour); focus returns to trigger.
- Pointer/touch: tap trigger toggles; tap option selects; tap outside closes; options ≥44px tall; list scrolls internally (max-height ~ 50% viewport) with the selected option scrolled into view on open.
- Positioning: rendered in place (absolute, below the trigger, full trigger width, z-index above form content but below the site header); flips above when there's not enough room below; never outside the viewport horizontally. No portal needed (no clipping ancestor except `.qs-ob` with `overflow:clip` — verify; if clipped, flip or use a portal).
- States: disabled (e.g. when "Not sure" ticked), invalid (`aria-invalid`, `aria-describedby` to the error), required (`aria-required`), forced-colors (Highlight on active/selected), reduced motion (no animation), focus-visible ring (emerald-700, ≥3:1).
- Forms: emits `onChange(value)`; for server-action forms (admin) also renders `<input type="hidden" name value>`.

## Scope
Replace every `<select>` under `components/quickstart/**` (wizard `Field.tsx`, onboarding `OnboardingField.tsx`, any remaining admin select). One shared component `components/quickstart/Select.tsx`; styles in `quickstart.css` (`.qs-cselect*`), scoped per R18.

## Tests
Unit tests for the pure keyboard/type-ahead reducer (no DOM env in repo). Browser verification via Playwright: keyboard-only selection, pointer selection, popup bounding box directly adjacent to the trigger (top within 8px of trigger bottom, or flipped bottom within 8px of trigger top) at 320/375/768/1024/1440 + landscape + 125/150% zoom, forced-colors, and the existing overlap audit.

## Out of scope
Searchable/multi-select comboboxes (multi questions stay checkbox chips).
