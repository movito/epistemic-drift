# ED-0003 Handoff: Visual Polish and Animations

**Task**: `delegation/tasks/2-todo/ED-0003-visual-polish-and-animations.md`
**Agent**: feature-developer-v3
**Created**: 2026-03-03

## IMPORTANT: Worktree

You are working in a git worktree. Your working directory is:

```
/Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0003
```

**Run `cd /Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0003` before doing any work.**

The branch `feature/ED-0003-visual-polish` is already checked out. Do NOT create a new branch.

Skip `./scripts/project start ED-0003` -- the task file is in the main worktree, not here.

## Summary

Add visual polish and micro-interactions to the concept map. All changes are CSS/JSX -- no logic changes.

## Changes needed

### 1. Node hover effect (`src/components/Node.tsx`)
- Add subtle scale transform on hover (e.g., `transform: scale(1.05)`)
- Use CSS transition for smooth scaling
- Cursor: `grab` default, `grabbing` during drag

### 2. Detail panel animation (`src/components/DetailPanel.tsx`)
- Add `@keyframes slideUp` animation when panel appears
- Smooth opacity + translateY transition

### 3. Edge hover highlighting (`src/components/Edge.tsx`)
- Smooth opacity transition on edges (use CSS `transition: opacity 0.2s`)

### 4. Export control buttons (`src/components/ExportControls.tsx`)
- Button hover states (background color change, subtle scale)

### 5. CSS custom properties (`src/styles/global.css`)
- Add `--transition-fast: 150ms` and `--transition-normal: 300ms`
- Use these in all transition declarations for consistency

## Key files

| File | Change |
|------|--------|
| `src/components/Node.tsx` | Hover scale + cursor |
| `src/components/DetailPanel.tsx` | Slide-up animation |
| `src/components/Edge.tsx` | Opacity transition |
| `src/components/ExportControls.tsx` | Button hover |
| `src/styles/global.css` | Transition custom properties |

## After completion

```bash
git add -A
git commit -m "feat(ED-0003): Add visual polish and micro-interactions"
git push origin feature/ED-0003-visual-polish
```
