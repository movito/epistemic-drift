# ED-0006 Handoff: Fix Cluster Label Position on Drag

**Task**: `delegation/tasks/2-todo/ED-0006-fix-cluster-label-position-on-drag.md`
**Agent**: feature-developer-v3
**Created**: 2026-03-03

## Summary

Cluster labels (the `<text>` elements in `ClusterBackground.tsx`) use static
coordinates from `graph.json` and don't move when nodes are dragged. The cluster
bounding `<rect>` moves correctly because it's computed dynamically. Fix the label
to derive its position from the dynamic bounds.

## Root Cause

`src/components/ClusterBackground.tsx` lines 33-34:

```tsx
x={cluster.labelPos.x}   // static from graph.json
y={cluster.labelPos.y}   // never updates
```

Meanwhile the `<rect>` at lines 20-23 uses `bounds.x/y/width/height` from
`getClusterBounds()` which recalculates from current node positions.

## Recommended Fix

Replace the static `cluster.labelPos` coordinates with values derived from `bounds`:

```tsx
// Derive label position from dynamic bounds
// Check graph.json to see where labels currently sit relative to their clusters
// and replicate that relative positioning using bounds
x={bounds.x + offsetX}
y={bounds.y + bounds.height + offsetY}
```

Look at the existing `labelPos` values in `graph.json` to determine what offsets
produce the same initial appearance. The goal is:
1. Same look on initial load
2. Labels follow the cluster when nodes are dragged

## Key Files

| File | What to look at |
|------|----------------|
| `src/components/ClusterBackground.tsx` | **THE file to fix** -- lines 33-34 |
| `src/lib/geometry.ts:46-72` | `getClusterBounds()` -- how bounds are computed |
| `src/lib/types.ts:1-6` | `ClusterData` interface -- `labelPos` field |
| `src/data/graph.json` | Static data with `labelPos` values per cluster |

## Scope

This is a small fix (~5-10 lines). Optional cleanup: remove `labelPos` from
`ClusterData` and `graph.json` if it becomes fully derived from bounds.

## Getting Started

```bash
git checkout -b feature/ED-0006-fix-cluster-label-drag
./scripts/project start ED-0006
npm run dev   # verify the bug, then fix and verify again
```
