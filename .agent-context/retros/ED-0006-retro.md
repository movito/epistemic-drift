## ED-0006 — Fix Cluster Label Position on Drag (PR #3)

**Date**: 2026-03-04
**Agent**: feature-developer-v3
**Scorecard**: 3 threads, 0 regressions, 3 bot rounds, 5 commits

### What Worked

1. **Clean, minimal fix** — The core change was exactly 3 files: `ClusterBackground.tsx` (swap static `cluster.labelPos.x/y` for `bounds.x + bounds.width/2` and `bounds.y + 32` with `textAnchor="middle"`), `types.ts` (remove `labelPos` field), `graph.json` (remove all `labelPos` entries). Matched the handoff's "~5-10 lines" estimate.
2. **Full cleanup over minimal fix** — Removing `labelPos` entirely (the "Nice to Have") was the right call. Dead data fields create confusion; the dynamic derivation is strictly better.
3. **Bot threads fully resolved** — All 3 CodeRabbit threads were addressed and resolved before the session ended. The owner replied on threads before the agent, which helped speed up resolution.

### What Was Surprising

1. **Unrelated commit on the branch** — Commit `c75d1c0 Add handoff files for ED-0001 through ED-0005` landed on this feature branch. This is unrelated content that pollutes the PR diff and should have been committed on `main` or its own branch.
2. **CodeRabbit flagged supply-chain risk** — The pyproject.toml `[project.optional-dependencies]` listing `dispatch-kit>=0.4.0` (a private package) was flagged as dependency confusion risk. This was a legitimate infrastructure concern but unrelated to the UI fix. The fix (moving to `requirements-local.txt`) was done in-PR rather than as a separate task, adding 2 commits of noise.
3. **Task spec suggested wrong anchor** — The spec's suggested fix used bottom-left anchoring (`bounds.x + 8`, `bounds.y + bounds.height + 16`) but the actual `labelPos` values in `graph.json` all placed labels near the **top** of the cluster. The implementation correctly used top-center, but the spec could have misled a less careful agent.

### What Should Change

1. **Enforce branch hygiene before committing** — The unrelated handoff commit should not be on this branch. Agents should run `git branch --show-current` before any `git commit` and verify the commit is relevant to the branch's task. Consider adding a pre-commit check that warns when committing files outside the task's scope.
2. **Separate infrastructure fixes from feature PRs** — The pyproject.toml dependency confusion fix (commits `00d7bd7`, `8f99a5c`) should have been a separate task/PR. Bot findings about infrastructure should be triaged as "won't fix in this PR" with a new task created instead. This keeps PRs focused and commit history clean.
3. **Verify suggested fix offsets against actual data** — Task specs with suggested code snippets should validate coordinates/offsets against the actual data. The bottom-left suggestion was wrong; a 2-minute check of `graph.json` labelPos values would have caught this before the spec was written.

### Permission Prompts Hit

None. This session was entirely read-only analysis (file reads, git commands, gh API queries). No edits or destructive commands were needed since the implementation was already complete.

### Process Actions Taken

- [ ] Rebase ED-0006 branch to remove unrelated commit `c75d1c0` (handoff files for other tasks)
- [ ] Create infrastructure task for dispatch-kit dependency hygiene (proper local-only references)
- [ ] Update task spec template to require validation of suggested fix snippets against actual data values
- [ ] Add planner guideline: bot findings about infrastructure on feature PRs should be triaged to separate tasks
