# ED-0007: Install A11y MCP Server

**Status**: Todo
**Priority**: high
**Assigned To**: feature-developer-v3
**Estimated Effort**: 30 minutes
**Created**: 2026-03-04

## Related Tasks

**Related**: ED-0008 (WCAG evaluator), ED-0009 (axe-core CI)

## Overview

Install the open-source A11y MCP server so all agents have real-time access to
axe-core accessibility checks during development. This is Layer 1 of the WCAG 2.2
accessibility strategy (ADR-0001).

**Context**: Currently agents catch a11y issues incidentally via CodeRabbit. The
MCP server gives every agent six dedicated accessibility tools they can call
during implementation.

**Related Work**: ADR-0001 (WCAG accessibility strategy), ED-0003 retro (a11y findings)

## Requirements

### Functional Requirements
1. A11y MCP server installed and available to Claude Code agents
2. All six tools functional: `test_accessibility`, `test_html_string`,
   `check_color_contrast`, `check_aria_attributes`, `get_rules`, `check_orientation_lock`
3. Server can audit `localhost:4321` (Astro dev server) when running

### Non-Functional Requirements
- [ ] No impact on dev server performance
- [ ] Server starts on-demand (not a persistent daemon)

## Implementation Plan

### Step 1: Install MCP server

```bash
claude mcp add a11y-accessibility -- npx -y a11y-mcp-server
```

### Step 2: Verify installation

```bash
claude mcp list  # should show a11y-accessibility
```

### Step 3: Test with live site

1. Run `npm run dev` in one terminal
2. In a Claude session, call `test_accessibility` against `http://localhost:4321`
3. Verify results return WCAG violations/passes

### Step 4: Document in CLAUDE.md

Add a section to CLAUDE.md noting the a11y MCP server is available and when
agents should use it (before opening PRs on front-end changes).

## Acceptance Criteria

### Must Have
- [ ] `claude mcp list` shows `a11y-accessibility`
- [ ] `test_accessibility` returns results for localhost
- [ ] `check_color_contrast` works with project colors
- [ ] CLAUDE.md documents the a11y MCP server

### Nice to Have
- [ ] Run an initial audit of the current site and capture baseline findings

## References

- **ADR**: `docs/decisions/adr/ADR-0001-wcag-accessibility-strategy.md`
- **MCP server**: https://github.com/ronantakizawa/a11ymcp
