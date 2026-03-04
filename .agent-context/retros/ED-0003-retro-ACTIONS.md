# ED-0003 Retro Actions

**Source**: `.agent-context/retros/ED-0003-retro.md`
**Owner**: planner2
**Date**: 2026-03-04

## Actions Taken

### 1. Force push to feature branches
**Finding**: `git push --force-with-lease` was blocked by deny list in `.claude/settings.json`.
Rebase-then-force-push is a normal workflow step after resolving merge conflicts.
**Action**: Flagged for user decision. The deny list has:
```
"Bash(git push --force*)",
"Bash(git push -f*)",
```
To allow force pushes on feature branches only, the user could replace these with:
```
"Bash(git push --force* origin main*)",
"Bash(git push -f* origin main*)",
```
This would deny force push to main but allow it on feature branches.
**Status**: Awaiting user decision.

### 2. Add `type="button"` to patterns.yml
**Finding**: Recurring a11y finding -- buttons without explicit type attribute.
**Action**: Added `frontend.button_type_attribute` pattern to `patterns.yml`.
**Status**: Done.

### 3. Add `prefers-reduced-motion` to patterns.yml
**Finding**: Any CSS animation should respect reduced-motion preference (WCAG 2.1 AA).
**Action**: Added `frontend.reduced_motion_media_query` pattern to `patterns.yml`.
**Status**: Done.

### 4. Rebase before opening PRs when branches are in-flight
**Finding**: Merge conflict with parallel ED-0002 branch touching same files.
**Action**: Planner lesson: when spawning multiple agents touching overlapping files,
note the conflict risk in handoffs and instruct agents to rebase onto latest main
before opening the PR. Captured in planner memory.
**Status**: Done (lesson captured).
