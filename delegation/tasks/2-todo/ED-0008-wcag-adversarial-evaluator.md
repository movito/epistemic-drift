# ED-0008: Create WCAG Adversarial Evaluator

**Status**: Todo
**Priority**: high
**Assigned To**: feature-developer-v3
**Estimated Effort**: 1-2 hours
**Created**: 2026-03-04

## Related Tasks

**Depends On**: ED-0007 (A11y MCP server -- useful for testing evaluator output)
**Related**: ED-0009 (axe-core CI)

## Overview

Create a custom adversarial evaluator that reviews front-end PRs against WCAG 2.2
criteria that automated tools (axe-core) cannot catch. This is Layer 2 of the WCAG
accessibility strategy (ADR-0001).

axe-core catches ~57% of WCAG issues. This evaluator targets the remaining ~43%:
cognitive, semantic, and interaction-design issues that require judgment.

**Context**: The adversarial-workflow system supports custom evaluators via YAML
config files in `.adversarial/evaluators/`. The evaluator runs as a one-shot LLM
call against a task file or diff.

**Related Work**: ADR-0001, `.adversarial/docs/EVALUATION-WORKFLOW.md`

## Requirements

### Functional Requirements
1. Evaluator config at `.adversarial/evaluators/wcag-reviewer.yml`
2. Invocable via `adversarial wcag-reviewer <file>`
3. Reviews against WCAG 2.2 AA criteria that axe-core misses
4. Output follows standard evaluator format in `.adversarial/logs/`

### Review Criteria (must be in the evaluator prompt)

**WCAG 2.2 new criteria:**
- 2.4.11 Focus Not Obscured (Minimum)
- 2.4.13 Focus Appearance
- 2.5.7 Dragging Movements -- alternatives to drag interactions
- 2.5.8 Target Size (Minimum) -- 24x24 CSS pixels
- 3.2.6 Consistent Help
- 3.3.7 Redundant Entry
- 3.3.8 Accessible Authentication (Minimum)

**Criteria axe-core handles poorly:**
- Focus management and keyboard navigation flow
- Reading order vs. visual order
- Meaningful link text and heading hierarchy
- Color as sole information carrier (beyond contrast ratio)
- Error identification and suggestion quality
- Content reflow at 400% zoom
- Animation and motion (prefers-reduced-motion)
- Alternative text quality (not just presence)
- Form label association quality

### Non-Functional Requirements
- [ ] Evaluator prompt is specific and actionable (not generic WCAG checklist)
- [ ] Output categorizes findings by WCAG criterion number
- [ ] Findings include severity (CRITICAL/HIGH/MEDIUM/LOW)

## Implementation Plan

### Step 1: Study existing evaluator format

```bash
adversarial list-evaluators
cat .adversarial/config.yml
# Check adversarial-workflow docs for evaluator YAML schema
```

### Step 2: Create evaluator config

Create `.adversarial/evaluators/wcag-reviewer.yml` with:
- Model selection (use a reasoning model for best judgment)
- System prompt with WCAG 2.2 AA criteria
- Instructions to focus on issues axe-core CANNOT catch
- Output format: findings grouped by criterion, with severity and remediation

### Step 3: Test against existing code

```bash
# Test against ED-0004 responsive layout task (has touch/interaction concerns)
adversarial wcag-reviewer delegation/tasks/2-todo/ED-0004-responsive-layout.md

# Test against the current codebase by pointing at a component
adversarial wcag-reviewer src/components/ConceptMap.tsx
```

### Step 4: Document usage

Add to `.agent-context/workflows/` or update the review workflow to include
WCAG evaluation as a step for front-end PRs.

## Acceptance Criteria

### Must Have
- [ ] `adversarial wcag-reviewer <file>` runs successfully
- [ ] Output includes WCAG 2.2 criterion numbers
- [ ] Findings are categorized by severity
- [ ] Evaluator focuses on issues axe-core misses (not structural/ARIA)
- [ ] Evaluator listed in `adversarial list-evaluators`

### Nice to Have
- [ ] Run against current codebase and capture initial findings
- [ ] Add to review workflow documentation

## References

- **ADR**: `docs/decisions/adr/ADR-0001-wcag-accessibility-strategy.md`
- **Evaluator workflow**: `.adversarial/docs/EVALUATION-WORKFLOW.md`
- **WCAG 2.2 What's New**: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- **WCAG 2.2 spec**: https://www.w3.org/TR/WCAG22/
