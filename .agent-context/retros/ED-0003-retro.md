## ED-0003 — Visual Polish and Animations (PR #5)

**Date**: 2026-03-04
**Agent**: feature-developer-v3
**Scorecard**: 6 threads, 0 regressions, 2 fix rounds, 3 commits

### What Worked

1. **CSS-only hover/active approach** — Using `:hover` and `:active` pseudo-classes with a CSS class (`.node-group`, `.export-btn`) avoided React state and re-renders entirely. CodeRabbit's round-1 finding about inline cursor specificity validated this was the right direction — just needed the `cursor: grab` in the stylesheet instead of inline.
2. **Batch-fix-then-push pattern** — Fixing all 3 round-1 threads in a single commit (`b0cc55b`) and all 2 round-2 threads in another (`a2fba5c`) kept the PR clean and minimized bot re-scan cycles.
3. **CodeRabbit caught a real CSS specificity bug** — The inline `cursor: "grab"` overriding `.node-group:active { cursor: grabbing }` was a genuine issue that would have been hard to spot in manual review. Worth the bot round.

### What Was Surprising

1. **Merge conflict from parallel ED-0002** — The drag fix (adding `groupRef`, `clientToSVG`) landed on main while this branch was open, causing a `CONFLICTING` merge state. The conflict was small (just the `<g>` opening tag) but required a rebase and force push, adding friction.
2. **Force push permission completely blocked** — Despite user approval via `AskUserQuestion` and multiple retries with both `--force-with-lease` and `-f`, the permission system refused all force pushes. The user had to run the command manually. This is the biggest process friction in this session.
3. **6 threads from a 3-file CSS PR** — CodeRabbit was thorough: round 1 had 3 Major findings (button type, cursor specificity, keyframe naming), round 2 had 2 Trivial nitpicks (reduced-motion, !important). All were legitimate. The reduced-motion a11y finding was a nice catch for a CSS-only PR.

### What Should Change

1. **Add force push to feature branches to allow list** — `git push --force-with-lease origin feature/*` should be pre-approved in `.claude/settings.json`. Rebase-then-force-push is a normal part of the PR workflow and should not require manual user intervention. This blocked the session for several minutes.
2. **Check for recently merged PRs before starting work** — If we had rebased onto latest main before starting (or at least before opening the PR), the merge conflict would have been avoided entirely. The planner should note when multiple branches are in-flight touching the same files.
3. **Pre-apply `type="button"` in all new button elements** — This is a recurring a11y finding. Consider adding it to `.agent-context/patterns.yml` as a canonical pattern so future PRs include it from the start.

### Permission Prompts Hit

1. `git push --force-with-lease origin feature/ED-0003-visual-polish` — Blocked twice. User approved via AskUserQuestion but the Bash permission system still rejected it. User had to run manually. ~3 minutes of delay.
2. `git push -f origin feature/ED-0003-visual-polish` — Also blocked (tried as fallback). Same issue.
3. These are NOT in `.claude/settings.json` allow list. New pattern that needs to be added.

### Process Actions Taken

- [ ] Add `git push --force-with-lease origin feature/*` to `.claude/settings.json` allow list
- [ ] Add `type="button"` to patterns.yml as canonical pattern for HTML buttons
- [ ] Consider adding `prefers-reduced-motion` media query as a standard pattern for any PR adding CSS animations
