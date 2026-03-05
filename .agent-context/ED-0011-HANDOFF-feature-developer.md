# ED-0011: Fix Cluster Background Rounded Corners - Implementation Handoff

**You are the feature-developer. Implement this task directly. Do not delegate or spawn other agents.**

**Date**: 2026-03-05
**From**: Planner
**To**: feature-developer-v3
**Task**: delegation/tasks/2-todo/ED-0011-fix-cluster-rounded-corners.md
**Status**: Ready for implementation
**Evaluation**: Revised (arch-review-fast, evaluator feedback addressed)

---

## Task Summary

The `<rect>` elements in `ClusterBackground.tsx` use `rx="var(--radius-lg)"`
and `ry="var(--radius-lg)"` as SVG attributes. SVG geometry attributes don't
reliably parse CSS `var()` references, so the rects render with sharp corners.

## Current Situation

After ED-0010, all design values are CSS tokens. The `--radius-lg: 16px` token
exists in `global.css` but isn't reaching the SVG rects because it's set as an
attribute, not a CSS property.

## Your Mission

Switch `rx` and `ry` from SVG attributes to CSS style properties. This is a
one-file, ~5-line change.

## Implementation

In `src/components/ClusterBackground.tsx`, change the `<rect>` element:

**Before:**
```tsx
<rect
  x={bounds.x}
  y={bounds.y}
  width={bounds.width}
  height={bounds.height}
  rx="var(--radius-lg)"
  ry="var(--radius-lg)"
  fill={clusterFill}
  stroke={clusterColor}
  ...
/>
```

**After:**
```tsx
<rect
  x={bounds.x}
  y={bounds.y}
  width={bounds.width}
  height={bounds.height}
  fill={clusterFill}
  stroke={clusterColor}
  style={{ rx: 'var(--radius-lg)', ry: 'var(--radius-lg)' }}
  ...
/>
```

Remove the `rx` and `ry` attributes entirely and set them via `style` instead.
SVG 2 CSS geometry properties are supported in Chrome 89+, Firefox 97+,
Safari 15.4+.

## Verification

1. `npm run build` passes
2. Open dev server — cluster backgrounds should have rounded corners
3. Check in Chrome and Firefox (Safari if available)
4. No other visual changes

---

**Task File**: `delegation/tasks/2-todo/ED-0011-fix-cluster-rounded-corners.md`
**Evaluation Log**: `.adversarial/logs/ED-0011-fix-cluster-rounded-corners--arch-review-fast.md.md`
**Handoff Date**: 2026-03-05
**Coordinator**: Planner
