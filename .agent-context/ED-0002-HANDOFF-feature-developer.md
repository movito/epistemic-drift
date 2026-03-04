# ED-0002 Handoff: Fix Node Drag with Pan/Zoom Transform

**Task**: `delegation/tasks/2-todo/ED-0002-fix-node-drag-with-transform.md`
**Agent**: feature-developer-v3
**Created**: 2026-03-03

## IMPORTANT: Worktree

You are working in a git worktree. Your working directory is:

```
/Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0002
```

**Run `cd /Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0002` before doing any work.**

The branch `feature/ED-0002-fix-node-drag` is already checked out. Do NOT create a new branch.

Skip `./scripts/project start ED-0002` -- the task file is in the main worktree, not here.

## Summary

Node dragging is broken when the canvas is panned or zoomed. The drag handler in
`Node.tsx` uses raw `clientX`/`clientY` screen coordinates without accounting for
the SVG transform (pan + zoom via `translate` and `scale` on the outer `<g>`).

## Root Cause

In `src/components/Node.tsx`, the `onPointerDown`/`onPointerMove` handlers calculate
drag offsets in screen space. But the nodes live inside a transformed `<g>` element
(managed by `Canvas.tsx`) that applies pan (`translate(x, y)`) and zoom (`scale(s)`).
When zoomed/panned, screen-space deltas don't match SVG-space deltas.

## Recommended Fix

Convert screen coordinates to SVG coordinates using `getScreenCTM()`:

```typescript
// Get SVG element reference
const svgEl = (e.target as SVGElement).ownerSVGElement!;
const ctm = svgEl.getScreenCTM()!;

// Convert screen coords to SVG space
const svgPoint = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
```

### Implementation steps

1. **Read `Node.tsx`** to understand the current drag implementation
2. **Read `Canvas.tsx`** to understand the transform structure (the `<g data-canvas>` with pan/zoom)
3. **Read `ConceptMap.tsx`** to see how `onNodeDrag` callback updates node positions
4. **Fix the drag handler** in `Node.tsx`:
   - On pointer down: convert `clientX/clientY` to SVG space, calculate offset from node center
   - On pointer move: convert `clientX/clientY` to SVG space, apply offset, call `onDrag`
   - This ensures 1:1 drag feel regardless of pan/zoom state
5. **Test**: run `npm run dev`, zoom in/out, pan, then drag nodes

## Key files

| File | Role |
|------|------|
| `src/components/Node.tsx` | **THE file to fix** -- drag handlers |
| `src/components/Canvas.tsx` | Transform context (`<g>` with translate + scale) |
| `src/components/ConceptMap.tsx` | State management, `onNodeDrag` callback |
| `src/lib/types.ts` | `ViewTransform` interface |

## Important: `getScreenCTM()` approach

The `getScreenCTM()` approach is the standard way to handle SVG coordinate
conversion. It accounts for ALL transforms in the chain (CSS, SVG transforms,
viewBox mapping, page scroll). This is more robust than manually applying
the inverse of the pan/zoom transform.

## After completion

```bash
git add -A
git commit -m "fix(ED-0002): Fix node drag to account for pan/zoom transform"
git push origin feature/ED-0002-fix-node-drag
```
