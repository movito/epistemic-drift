# ED-0001 Handoff: Download IBM Plex Sans Fonts

**Task**: `delegation/tasks/2-todo/ED-0001-download-ibm-plex-fonts.md`
**Agent**: feature-developer-v3
**Created**: 2026-03-03

## IMPORTANT: Worktree

You are working in a git worktree. Your working directory is:

```
/Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0001
```

**Run `cd /Users/broadcaster_three/Github/epistemic-drift/.claude/worktrees/ED-0001` before doing any work.**

The branch `feature/ED-0001-download-fonts` is already checked out. Do NOT create a new branch.

Skip `./scripts/project start ED-0001` -- the task file is in the main worktree, not here.

## Summary

Download three IBM Plex Sans woff2 font files and place them in `public/fonts/`. The `@font-face` declarations in `src/styles/global.css` already reference these paths.

## What to do

1. Download the following woff2 files from Google Fonts CDN or IBM's GitHub releases:
   - `IBMPlexSans-Regular.woff2` (weight 400)
   - `IBMPlexSans-Medium.woff2` (weight 500)
   - `IBMPlexSans-SemiBold.woff2` (weight 600)

2. Place them in `public/fonts/`

3. Verify: run `npm run build` -- no font-related warnings

## Source

The canonical source is: https://github.com/IBM/plex/tree/master/packages/plex-sans/fonts/complete/woff2

Or use Google Fonts API to get the woff2 URLs for IBM Plex Sans at weights 400, 500, 600.

## After completion

```bash
git add public/fonts/
git commit -m "feat(ED-0001): Add IBM Plex Sans woff2 font files"
git push origin feature/ED-0001-download-fonts
```
