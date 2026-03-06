# ED-0011: Fix Cluster Background Rounded Corners

**Status**: In Progress
**Priority**: low
**Assigned To**: feature-developer-v3
**Estimated Effort**: 30 min
**Created**: 2026-03-05

## Related Tasks

**Blocked By**: None
**Related**: ED-0010 (Separate Design Data), ED-0003 (Visual Polish)

## Overview

The cluster background `<rect>` elements use `rx="var(--radius-lg)"` for
rounded corners. CSS `var()` references in SVG geometry attributes do not
render reliably across browsers, causing the rectangles to display with
sharp corners instead of the intended 16px border radius.

This was likely a pre-existing issue that became visible during ED-0010
work.

## Requirements

- Cluster background rectangles render with rounded corners (16px radius)
- Fix works across Chrome, Firefox, and Safari
- No visual regression in other elements

## Implementation Notes

The `--radius-lg: 16px` CSS custom property is defined in `global.css`.
SVG geometry attributes (`rx`, `ry`) don't reliably support CSS `var()`
references because they are parsed as SVG lengths, not CSS values.

### Approach: SVG 2 CSS geometry properties (recommended)

Use the `style` prop instead of SVG attributes:

```tsx
<rect
  ...
  style={{ rx: 'var(--radius-lg)', ry: 'var(--radius-lg)' }}
/>
```

Remove the `rx` and `ry` attributes and set them via `style` instead. SVG 2
allows geometry properties (`rx`, `ry`, `x`, `y`, `width`, `height`) to be
set via CSS. This keeps `--radius-lg` as the single source of truth.

**Browser support**: Chrome 89+, Firefox 97+, Safari 15.4+ — all well
within our target range.

### Fallback (only if style approach fails)

Resolve `--radius-lg` via `getComputedStyle()` and pass as a numeric prop.
This adds runtime DOM coupling but preserves the token as source of truth.
Do NOT hardcode `rx={16}` — this duplicates the token value and breaks DRY.

## Files to Modify

- `src/components/ClusterBackground.tsx`

## Acceptance Criteria

- [ ] Cluster backgrounds render with rounded corners in Chrome, Firefox, Safari
- [ ] `--radius-lg` remains the single source of truth for the radius value
- [ ] No visual regression in other elements
- [ ] `npm run build` passes

## Evaluation History

- **arch-review-fast** (2026-03-05): REVISION_SUGGESTED. Recommended
  against hardcoding (Option 1). Confirmed Option 3 (CSS style prop) is
  ideal if browser support checks out. Browser support verified: SVG 2 CSS
  geometry properties supported in all target browsers.
