# ED-0008: Create WCAG Adversarial Evaluator - Implementation Handoff

**You are the feature-developer. Implement this task directly. Do not delegate or spawn other agents.**

**Date**: 2026-03-04
**From**: planner2
**To**: feature-developer-v3
**Task**: `delegation/tasks/2-todo/ED-0008-wcag-adversarial-evaluator.md`
**Status**: Ready for implementation
**Evaluation**: Arch-review-fast APPROVED (no findings)

---

## Task Summary

Create a custom adversarial evaluator YAML config at `.adversarial/evaluators/wcag-reviewer.yml`
that reviews front-end PRs against WCAG 2.2 AA criteria that axe-core cannot catch (~43% of issues).
This is Layer 2 of the accessibility strategy (ADR-0001).

## Current Situation

- We have 22 evaluators in `.adversarial/evaluators/` — all follow the same YAML pattern
- The adversarial-workflow system handles invocation, model routing, and output formatting
- axe-core (Layer 1 MCP + Layer 3 CI) covers structural/semantic issues
- This evaluator fills the gap: cognitive, interaction-design, and judgment-based WCAG criteria

## Your Mission

1. **Study the evaluator format** — read an existing config like `openai-code-reviewer.yml` for the YAML schema
2. **Create the WCAG evaluator config** at `.adversarial/evaluators/wcag-reviewer.yml`
3. **Test it** against existing front-end code
4. **Document usage** in the review workflow

## Reference Evaluator (copy this structure)

Use `openai-code-reviewer.yml` as your structural template. Key fields:

```yaml
name: wcag-reviewer
description: ...
model: <pick a reasoning model>
api_key_env: <matching key>
output_suffix: -wcag-reviewer.md
timeout: 600

prompt: |
  <your WCAG review prompt here>
  {content}
  ...
```

The `{content}` placeholder is where the file being evaluated gets injected.

## WCAG Criteria to Cover (from task spec)

**WCAG 2.2 new criteria** (these are the most important — they're new and poorly tooled):
- 2.4.11 Focus Not Obscured (Minimum)
- 2.4.13 Focus Appearance
- 2.5.7 Dragging Movements — alternatives to drag interactions
- 2.5.8 Target Size (Minimum) — 24x24 CSS pixels
- 3.2.6 Consistent Help
- 3.3.7 Redundant Entry
- 3.3.8 Accessible Authentication (Minimum)

**Criteria axe-core handles poorly**:
- Focus management and keyboard navigation flow
- Reading order vs. visual order
- Meaningful link text and heading hierarchy
- Color as sole information carrier (beyond contrast ratio)
- Error identification and suggestion quality
- Content reflow at 400% zoom
- Animation and motion (prefers-reduced-motion)
- Alternative text quality (not just presence)
- Form label association quality

## Key Design Decisions

- **Model choice**: Use a reasoning model (o1, o3, or gemini-2.5-flash) for best judgment on subjective criteria. Gemini Flash is cheap and fast — good default.
- **Output format**: Findings must include WCAG criterion number, severity (CRITICAL/HIGH/MEDIUM/LOW), and actionable remediation. Group by criterion.
- **Focus**: The prompt must explicitly tell the model NOT to check structural/ARIA issues that axe-core handles. Focus on judgment calls.

## Acceptance Criteria (Must Have)

- [ ] `adversarial wcag-reviewer <file>` runs successfully
- [ ] Output includes WCAG 2.2 criterion numbers
- [ ] Findings are categorized by severity
- [ ] Evaluator focuses on issues axe-core misses (not structural/ARIA)
- [ ] Evaluator listed in `adversarial list-evaluators`

## Testing

```bash
# After creating the config, test it:
adversarial wcag-reviewer src/components/ConceptMap.tsx
adversarial wcag-reviewer src/components/Node.tsx

# Verify it appears in the list:
adversarial list-evaluators
```

## Time Estimate

**Estimated**: 1-2 hours
- Study existing evaluators: 15 min
- Write YAML config + prompt: 30-45 min
- Test and iterate on prompt: 30-45 min
- Documentation: 15 min

## Starting Point

1. `cat .adversarial/evaluators/openai-code-reviewer.yml` — reference structure
2. `adversarial list-evaluators` — see naming patterns
3. Create `.adversarial/evaluators/wcag-reviewer.yml`
4. Test with `adversarial wcag-reviewer src/components/ConceptMap.tsx`

---

**Task File**: `delegation/tasks/2-todo/ED-0008-wcag-adversarial-evaluator.md`
**Evaluation Log**: `.adversarial/logs/ED-0008-wcag-adversarial-evaluator--arch-review-fast.md.md`
**Handoff Date**: 2026-03-04
**Coordinator**: planner2
