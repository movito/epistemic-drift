## ED-0009 — Add axe-core Accessibility Testing to CI (PR #9)

**Date**: 2026-03-05
**Agent**: feature-developer-v3 (manual execution, no sub-agent)
**Scorecard**: 13 threads, 0 regressions, 2 fix rounds, 3 commits (squash-merged as 1)

### What Worked

1. **Zero baseline violations** — The site passed WCAG 2.2 AA with zero violations out of the box. No `disableRules()` needed, which kept the test clean and the hard gate fully enforced. Prior work on accessible markup paid off.
2. **Fast implementation loop** — Setup through passing tests took ~15 minutes. The task spec and handoff file were detailed enough that no exploration was needed — dependencies, config shape, test structure, and CI job were all spelled out.
3. **Bot triage was efficient** — Both rounds of CodeRabbit review were triaged and resolved in single passes. The `gh-review-helper.sh` scripts for replying and resolving threads worked reliably.
4. **Non-vacuous test assertion** — CodeRabbit's round 2 suggestion to add `expect(focusableCount).toBeGreaterThan(0)` was a legitimate improvement that prevents the keyboard test from silently passing with zero elements.

### What Was Surprising

1. **13 threads from CodeRabbit on a small PR** — A 4-file implementation PR generated 13 review threads. Most were about documentation files (handoffs, task specs) rather than the actual code. The signal-to-noise ratio was low for doc-heavy PRs.
2. **Double `.md.md` extension in two handoff files** — Both ED-0008 and ED-0009 handoff files had this bug. It was pre-existing from the planner's handoff generation, not introduced by this PR, but CodeRabbit flagged it here.
3. **Rebase conflicts on merge to main** — After squash-merging PR #9, pulling main required resolving conflicts in the task file and both handoff files because local main had diverged (2 local commits vs 3 remote). The handoff files had add/add conflicts from the squash merge including our fixes.

### What Should Change

1. **Planner should validate log paths in handoff files** — The `.md.md` double extension bug appeared in both ED-0008 and ED-0009 handoffs. The handoff generation step should strip existing extensions before appending `.md`.
2. **Pull main before branching** — The rebase conflicts after merge were caused by local main being behind. A `git pull` before `git checkout -b` would have avoided this entirely.
3. **Consider filtering CodeRabbit from doc-only files** — 5 of 13 threads were about documentation files (task specs, handoffs, done tasks). A `.coderabbitignore` or path filter could reduce noise on files that aren't production code.

### Permission Prompts Hit

None. All `git` and `gh` commands were pre-approved. The `npx playwright` and `npm install` commands were approved on first use without delay.

### Process Actions Taken

- [ ] Add `.md.md` extension validation to handoff generation (planner tooling)
- [ ] Consider `.coderabbitignore` for `delegation/tasks/`, `.agent-context/` doc files
- [ ] Add `git pull` to start-task skill before branch creation
