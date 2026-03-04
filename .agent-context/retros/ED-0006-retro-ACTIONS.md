# ED-0006 Retro Actions

**Source**: `.agent-context/retros/ED-0006-retro.md`
**Owner**: planner2
**Date**: 2026-03-04

## Actions Taken

### 1. Unrelated commit on feature branch
**Finding**: Planner accidentally committed handoff files to ED-0006 branch.
**Action**: Added lesson to planner memory. Going forward, planner MUST verify
`git branch --show-current` before any commit. Already partially addressed --
the commit was cherry-picked to main, but the feature branch wasn't cleaned up.
**Status**: Lesson captured. Branch cleanup deferred (agent can rebase).

### 2. Infrastructure fixes in feature PRs
**Finding**: pyproject.toml dependency confusion fix was done in the ED-0006 PR.
**Action**: New planner guideline: when bots flag infrastructure concerns on a
feature PR, triage as "won't fix in this PR" and create a separate task. Do not
let infrastructure patches pollute feature PRs.
**Status**: Done. Captured in planner memory + recurring theme across ED-0001/0002/0006 retros.

### 3. Suggested fix offsets were wrong
**Finding**: Task spec suggested bottom-left label anchor, but actual data used top-center.
**Action**: When writing task specs with code suggestions, ALWAYS cross-reference
against actual data values (check graph.json, check current rendered behavior).
**Status**: Done. Captured in planner memory.
