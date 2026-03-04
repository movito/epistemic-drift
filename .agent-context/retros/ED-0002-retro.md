## ED-0002 — Fix Node Drag with Pan/Zoom Transform (PR #4)

**Date**: 2026-03-04
**Agent**: feature-developer-v3
**Scorecard**: 2 threads, 0 regressions, 1 fix round, 2 commits

### What Worked

1. **`getScreenCTM()` approach was the right call** — The handoff doc recommended it and it worked perfectly. One helper function (`clientToSVG`) cleanly solved the coordinate conversion for both `pointerDown` and `pointerMove`, with no need to pass transform state into the component.
2. **Single-file fix kept scope tight** — The entire bug fix was contained to `Node.tsx` (31 lines changed). No prop changes, no interface changes, no upstream modifications needed. This made bot review trivial.
3. **CodeRabbit caught a real edge case** — The `pointercancel` handler suggestion was legitimate. Touch interruptions and context switches could leave `dragging.current = true`, causing ghost drags. Good catch that wouldn't surface in desktop-only testing.

### What Was Surprising

1. **CodeRabbit flagged `requirements-local.txt`** — A pre-existing infrastructure file unrelated to this PR showed up as a Major finding. This is noise from the bot scanning the full diff against main rather than just the PR's changed files.
2. **Worktree was pre-configured** — The handoff had already created the worktree and checked out the branch, which saved setup time. The handoff doc was thorough and accurate.

### What Should Change

1. **Handoff should note pointer event edge cases** — The handoff listed the `getScreenCTM` fix but didn't mention `pointercancel`. For drag-related tasks, the spec should prompt the implementer to consider all pointer event lifecycle events (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`, `lostpointercapture`).
2. **Out-of-scope bot findings need a tracking pattern** — The `requirements-local.txt` finding is real but doesn't belong on this PR. Need a lightweight way to capture these as backlog items during triage rather than just resolving with a comment.

### Permission Prompts Hit

None.

### Process Actions Taken

- [ ] Consider adding `pointercancel` to drag implementation checklist in patterns.yml
- [ ] Create backlog task for `requirements-local.txt` dispatch-kit PyPI issue (from CodeRabbit finding)
