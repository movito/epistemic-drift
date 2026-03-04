# ED-0004 Handoff: Responsive Layout

**Task**: `delegation/tasks/2-todo/ED-0004-responsive-layout.md`
**Agent**: feature-developer-v3
**Created**: 2026-03-03

## IMPORTANT: Worktree

You are working in a git worktree. Your working directory is:

```
/Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0004
```

**Run `cd /Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0004` before doing any work.**

The branch `feature/ED-0004-responsive-layout` is already checked out. Do NOT create a new branch.

Skip `./scripts/project start ED-0004` -- the task file is in the main worktree, not here.

## Summary

Make the concept map work well across screen sizes. The SVG needs correct aspect
ratio handling, the overlay UI needs responsive sizing, and the detail panel needs
overflow handling.

## Changes needed

### 1. SVG viewBox (`src/components/Canvas.tsx`)
- Ensure `preserveAspectRatio="xMidYMid meet"` is set on the `<svg>` element
- The viewBox is `0 0 1020 760` -- verify this is applied correctly

### 2. Title overlay responsive sizing (`src/pages/index.astro` or relevant component)
- Use `clamp()` for font sizes so titles shrink on small screens
- Example: `font-size: clamp(1rem, 2vw, 1.5rem)`

### 3. Export controls layout (`src/components/ExportControls.tsx`)
- On narrow viewports (< 768px), stack controls vertically or hide them behind a menu
- Ensure they don't overlap the title

### 4. Detail panel scrolling (`src/components/DetailPanel.tsx`)
- Add `overflow-y: auto` with `max-height` based on viewport
- Handle long descriptions gracefully

### 5. Touch support for pan/zoom (stretch goal)
- Pinch-to-zoom using touch events on the SVG
- This is the most complex part -- implement only if time allows
- Approach: listen for `touchstart`/`touchmove` with 2+ touches, calculate
  distance delta for zoom and midpoint delta for pan

## Key files

| File | Change |
|------|--------|
| `src/components/Canvas.tsx` | preserveAspectRatio, touch events |
| `src/components/ExportControls.tsx` | Responsive layout |
| `src/components/DetailPanel.tsx` | Scrollable overflow |
| `src/pages/index.astro` | Responsive font sizes |
| `src/styles/global.css` | Media queries, responsive variables |

## Testing

Verify at these widths: **375px** (phone), **768px** (tablet), **1024px**, **1440px**, **1920px**

Use browser DevTools responsive mode.

## After completion

```bash
git add -A
git commit -m "feat(ED-0004): Add responsive layout and viewport handling"
git push origin feature/ED-0004-responsive-layout
```
