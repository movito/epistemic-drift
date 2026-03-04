# ED-0002 Retro Actions

**Source**: `.agent-context/retros/ED-0002-retro.md`
**Owner**: planner2
**Date**: 2026-03-04

## Actions Taken

### 1. Add pointer event lifecycle to patterns.yml
**Finding**: Handoff didn't mention `pointercancel`; CodeRabbit caught it.
**Action**: Added `frontend.pointer_event_lifecycle` pattern to `patterns.yml`
documenting the full lifecycle (down, move, up, cancel, lostpointercapture).
**Status**: Done.

### 2. Add SVG coordinate conversion pattern
**Finding**: `getScreenCTM()` approach worked perfectly, worth codifying.
**Action**: Added `frontend.svg_coordinate_conversion` pattern to `patterns.yml`.
**Status**: Done.

### 3. Out-of-scope bot findings need tracking
**Finding**: CodeRabbit flagged `requirements-local.txt` on a drag-fix PR.
**Action**: This is a recurring theme (also in ED-0006). New planner guideline:
when bots flag infrastructure on a feature PR, triage as "won't fix in this PR"
and create a backlog task. Already captured in planner memory.
**Status**: Done (guideline captured).

### 4. requirements-local.txt dispatch-kit PyPI issue
**Finding**: CodeRabbit flagged dependency confusion risk.
**Action**: Already addressed in ED-0006 PR (moved to requirements-local.txt).
No additional backlog task needed.
**Status**: Already resolved.
