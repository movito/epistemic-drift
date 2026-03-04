# ADR-0001: WCAG 2.2 Accessibility Strategy

**Status**: Accepted

**Date**: 2026-03-04

**Deciders**: Project Lead, planner2

## Context

### Problem Statement

We want everything we build to be as accessible as possible, targeting WCAG 2.2
AA conformance. Our current workflow catches some a11y issues incidentally
(CodeRabbit flagged `type="button"` and `prefers-reduced-motion` in ED-0003) but
has no systematic accessibility coverage. Issues are caught by luck, not by design.

### Forces at Play

**Technical Requirements:**
- WCAG 2.2 AA conformance for all front-end output
- Automated catching of structural/semantic violations (heading order, ARIA, contrast)
- Review of issues automation can't catch (reading order, focus management, cognitive load)
- Hard gate in CI to prevent regressions

**Constraints:**
- Small project (Astro 5 + React 19, single-page SVG concept map)
- Existing CI pipeline with BugBot + CodeRabbit (no dedicated a11y tooling)
- Agent-driven development -- tooling must be available to agents, not just humans
- axe-core catches ~57% of WCAG issues automatically; the rest requires human/LLM judgment

**Assumptions:**
- WCAG 2.2 AA is the target level (not AAA)
- Accessibility is a first-class concern, not an afterthought
- Agents should be able to check and fix a11y issues during development, not just in review

## Decision

Implement a three-layer accessibility strategy:

### Layer 1: A11y MCP Server (real-time, in-session)

Install the open-source [A11y MCP server](https://github.com/ronantakizawa/a11ymcp)
to give all agents real-time access to axe-core accessibility checks.

**Tools provided:**
- `test_accessibility` -- audit live URLs with customizable viewport
- `test_html_string` -- test raw HTML snippets
- `check_color_contrast` -- validate color combinations against WCAG
- `check_aria_attributes` -- verify ARIA usage
- `get_rules` -- list rules filterable by WCAG standard (2.0/2.1/2.2)
- `check_orientation_lock` -- detect forced orientation

**When used:** During development. Any agent can call these tools while implementing
front-end features. Feature-developer-v3 should run `test_accessibility` against
`localhost` before opening a PR.

### Layer 2: WCAG Adversarial Evaluator (pre-merge review)

Create a custom adversarial evaluator (`.adversarial/evaluators/wcag-reviewer.yml`)
that reviews PRs touching front-end files against WCAG 2.2 criteria that axe-core
cannot catch:

- Focus management and keyboard navigation
- Reading order and content structure
- Meaningful link text and heading hierarchy
- Touch target sizes (2.5.8, new in 2.2)
- Consistent help location (3.2.6, new in 2.2)
- Redundant entry avoidance (3.3.7, new in 2.2)
- Dragging alternatives (2.5.7, new in 2.2)
- Cognitive load and plain language

**When used:** After implementation, before human review. Runs via
`adversarial wcag-reviewer <file>` as part of the review pipeline.

### Layer 3: axe-core in CI (automated gate)

Add axe-core to the CI pipeline via Playwright, alongside BugBot and CodeRabbit.
A Playwright test builds the site, launches it, and runs axe-core against each
page. The build fails on any WCAG 2.2 AA violation.

**When used:** On every push. Hard gate -- no PR merges with known automated
accessibility violations.

### Core Principles

1. **Shift left**: Agents catch issues during development (Layer 1), not just in review
2. **Defense in depth**: Three layers with different coverage profiles
3. **Automated + judgment**: axe-core handles structural issues; LLM evaluator handles cognitive/semantic issues
4. **Hard gate**: CI prevents regressions from shipping

## Consequences

### Positive

- Every agent has real-time a11y checking capability via MCP
- WCAG 2.2-specific criteria (touch targets, dragging alternatives) are reviewed systematically
- CI prevents a11y regressions from merging
- Patterns already captured in `patterns.yml` (button type, reduced motion) are reinforced by tooling

### Negative

- A11y MCP server adds a dependency (Node.js, Puppeteer/headless Chrome)
- WCAG evaluator requires OpenAI API key for adversarial-workflow
- Playwright CI tests add build time (~30-60s)
- False positives from axe-core may need triaging

### Neutral

- axe-core catches ~57% of issues automatically; the remaining ~43% still requires the evaluator and human judgment
- Layer 4 (dedicated a11y agent for deep audits) is deferred until the site grows

## Alternatives Considered

### Alternative 1: Dedicated A11y Agent Only

**Description**: Create a specialized accessibility agent with WCAG expertise
in its system prompt, invoked manually for audits.

**Rejected because**:
- Only runs when someone remembers to invoke it
- No automated gate -- issues can still ship
- Doesn't give development agents real-time checking

### Alternative 2: Official Deque axe MCP Server

**Description**: Use Deque's commercial axe MCP server with Deque University
remediation guidance.

**Rejected because**:
- Likely paid/commercial license
- Open-source A11y MCP provides the same axe-core engine
- Can upgrade later if we need Deque University guidance

### Alternative 3: CI-Only (axe-core in build)

**Description**: Only add axe-core to CI, skip MCP and evaluator.

**Rejected because**:
- Late feedback loop -- issues found only after push
- Misses cognitive/semantic issues that axe-core can't detect
- Agents can't check a11y during development

## Related Decisions

- ED-0003 retro: `type="button"` and `prefers-reduced-motion` patterns added to patterns.yml
- ED-0004: Responsive layout task includes touch support considerations

## References

- [A11y MCP (GitHub)](https://github.com/ronantakizawa/a11ymcp)
- [axe-core (GitHub)](https://github.com/dequelabs/axe-core)
- [Deque axe MCP Server](https://www.deque.com/blog/a-closer-look-at-axe-mcp-server/)
- [WCAG 2.2 specification](https://www.w3.org/TR/WCAG22/)
- [What's new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)

## Revision History

- 2026-03-04: Initial decision (Accepted)
