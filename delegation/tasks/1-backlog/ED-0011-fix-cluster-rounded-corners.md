# ED-0011: Fix Cluster Background Rounded Corners

**Status**: Backlog
**Priority**: low
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

**Options:**
1. Hardcode `rx={16}` and `ry={16}` in `ClusterBackground.tsx`
2. Resolve `--radius-lg` via `getComputedStyle()` and pass as a number
3. Use the `style` prop: `style={{ rx: 'var(--radius-lg)' }}` (SVG 2 CSS
   geometry properties — check browser support)

Option 1 is simplest. Option 2 keeps the design token as source of truth.

## Files to Modify

- `src/components/ClusterBackground.tsx`
