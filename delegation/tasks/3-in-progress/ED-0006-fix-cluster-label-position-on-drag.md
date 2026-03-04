# ED-0006: Fix cluster label position on node drag

**Status**: In Review
**Priority**: medium
**Assigned To**: feature-developer-v3
**Estimated Effort**: 1-2 hours
**Created**: 2026-03-03

## Overview

When nodes are dragged to new positions, cluster bounding boxes (`<rect>`) update
correctly because they are computed dynamically via `getClusterBounds()`. However,
the cluster **labels** (`<text>`) remain fixed at their initial positions because
they use static `cluster.labelPos` coordinates from `graph.json`.

**Context**: The concept map allows node dragging. Cluster backgrounds recalculate
their bounds from member node positions, but the label placement was designed for
static layouts and never accounted for node movement.

**Related Work**: ED-0002 (fix node drag with transform) -- same drag interaction surface

## Root Cause Analysis

In `src/components/ClusterBackground.tsx`:

- **Line 14**: `const bounds = getClusterBounds(clusterKey, nodes)` -- dynamic, updates on drag
- **Lines 33-34**: `x={cluster.labelPos.x}` / `y={cluster.labelPos.y}` -- static from `graph.json`

The `<rect>` follows `bounds`, the `<text>` follows `cluster.labelPos`. They diverge
after any node drag.

## Requirements

### Functional Requirements
1. Cluster labels must move with their cluster bounding box when nodes are dragged
2. Label positioning must remain visually correct (same relative placement to the cluster)
3. If `labelPos` defines an anchor preference (e.g., bottom-left), that preference should be preserved relative to the dynamic bounds

### Non-Functional Requirements
- [ ] No performance regression (label position computed in render, keep it cheap)
- [ ] Backward compatible: existing `labelPos` values in `graph.json` should still influence relative placement if desired, or can be removed if no longer needed

## Implementation Plan

### Approach

Compute label position from the dynamic `bounds` returned by `getClusterBounds()`
rather than from the static `cluster.labelPos`.

### Files to Modify

1. `src/components/ClusterBackground.tsx`
   - Replace `cluster.labelPos.x/y` with coordinates derived from `bounds`
   - Decide on label anchor: bottom-left of bounds is the current visual convention
     (check `graph.json` labelPos values to confirm)

2. `src/lib/types.ts` (optional)
   - `labelPos` on `ClusterData` may become unnecessary if labels are always
     derived from bounds. Could be replaced with a `labelAnchor` enum
     (e.g., `"bottom-left"` | `"top-left"`) or removed entirely.

3. `src/data/graph.json` (optional cleanup)
   - Remove or repurpose `labelPos` entries if they're no longer used

### Implemented Fix

In `ClusterBackground.tsx`, replaced the static label coordinates with dynamic
positioning derived from `getClusterBounds()`:

```tsx
// Top-center anchor: horizontally centered, near top of bounds
x={bounds.x + bounds.width / 2}
y={bounds.y + 32}
textAnchor="middle"
```

The `labelPos` field was removed from `ClusterData` and `graph.json` since
label position is now fully derived from the dynamic bounds.

## Acceptance Criteria

### Must Have
- [ ] Cluster labels move with their bounding box when any member node is dragged
- [ ] Labels remain readable and correctly positioned relative to the cluster
- [ ] No visual regression on initial page load (labels appear in same position as before)
- [ ] No performance regression

### Nice to Have
- [ ] Clean up `labelPos` from `graph.json` and `ClusterData` type if no longer needed
- [ ] Support configurable label anchor positions (top-left, bottom-left, etc.)

## Key Files for Reference

| File | Purpose |
|------|---------|
| `src/components/ClusterBackground.tsx` | The component with the bug |
| `src/lib/geometry.ts` | `getClusterBounds()` -- dynamic bounds computation |
| `src/lib/types.ts` | `ClusterData` interface (`labelPos` removed) |
| `src/data/graph.json` | Static data (`labelPos` removed) |
| `src/components/ConceptMap.tsx` | Parent orchestrator, passes node state |

## Notes

This is a small, focused fix. The minimal approach (derive label x/y from bounds)
is ~5 lines of change. The optional cleanup (removing `labelPos`) touches more files
but keeps the data model cleaner.

---

**Template Version**: 1.0.0
