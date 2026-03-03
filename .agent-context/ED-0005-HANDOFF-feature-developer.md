# ED-0005 Handoff: Favicon and Open Graph Meta

**Task**: `delegation/tasks/2-todo/ED-0005-favicon-and-meta.md`
**Agent**: feature-developer-v3
**Created**: 2026-03-03

## IMPORTANT: Worktree

You are working in a git worktree. Your working directory is:

```
/Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0005
```

**Run `cd /Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0005` before doing any work.**

The branch `feature/ED-0005-favicon-meta` is already checked out. Do NOT create a new branch.

Skip `./scripts/project start ED-0005` -- the task file is in the main worktree, not here.

## Summary

Create a favicon and add Open Graph meta tags for social sharing.

## What to do

### 1. SVG Favicon (`public/favicon.svg`)
- Create a simple SVG favicon representing the concept: a small network/graph icon
- 3-4 connected nodes forming a small network
- Use the project's color palette from `src/styles/global.css`
- Also generate `public/favicon.ico` (16x16, 32x32) if possible, or just use the SVG

### 2. Open Graph meta tags (`src/pages/index.astro`)
Add to the `<head>`:
```html
<meta property="og:title" content="Epistemic Drift" />
<meta property="og:description" content="Interactive concept map exploring how generative AI extends cognition while creating epistemic vulnerabilities" />
<meta property="og:type" content="website" />
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Epistemic Drift" />
<meta name="twitter:description" content="Interactive concept map exploring how generative AI extends cognition while creating epistemic vulnerabilities" />
```

### 3. OG Image (`public/og-image.png`)
- Create a static 1200x630 PNG representing the concept map
- Can be a simplified/stylized version -- doesn't need to be pixel-perfect
- Alternatively, create a simple branded card with title + subtitle from graph.json meta

## Key files

| File | Change |
|------|--------|
| `public/favicon.svg` | New - SVG favicon |
| `public/og-image.png` | New - OG share image |
| `src/pages/index.astro` | Add meta tags + favicon link |

## After completion

```bash
git add -A
git commit -m "feat(ED-0005): Add favicon and Open Graph meta tags"
git push origin feature/ED-0005-favicon-meta
```
