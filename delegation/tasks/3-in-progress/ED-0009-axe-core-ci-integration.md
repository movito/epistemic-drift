# ED-0009: Add axe-core Accessibility Testing to CI

**Status**: In Progress
**Priority**: medium
**Assigned To**: feature-developer-v3
**Estimated Effort**: 2-3 hours
**Created**: 2026-03-04

## Related Tasks

**Depends On**: ED-0007 (A11y MCP server -- validates the approach works)
**Related**: ED-0008 (WCAG evaluator)

## Overview

Add axe-core accessibility testing to the CI pipeline via Playwright. Every push
triggers an automated accessibility audit; the build fails on any WCAG 2.2 AA
violation. This is Layer 3 of the WCAG accessibility strategy (ADR-0001) and
complements existing BugBot + CodeRabbit checks.

**Context**: BugBot and CodeRabbit catch code quality issues but don't run
axe-core. Adding a dedicated a11y test ensures no accessibility regressions
ship, even if agents forget to run the MCP server during development.

**Related Work**: ADR-0001, existing CI in `.github/workflows/`

## Requirements

### Functional Requirements
1. Playwright test that builds the static site and audits it with axe-core
2. Targets WCAG 2.2 AA standard
3. Tests run on every push via GitHub Actions
4. Build fails on any violation (hard gate)
5. Clear error output showing which WCAG criteria failed and where

### Non-Functional Requirements
- [ ] CI time increase < 60 seconds
- [ ] No flaky tests (static site, deterministic output)
- [ ] Works with Astro's static build output

## Implementation Plan

### Step 1: Install dependencies

```bash
npm install -D @axe-core/playwright @playwright/test
npx playwright install chromium
```

### Step 2: Create Playwright config

Create `playwright.config.ts` (or `e2e/playwright.config.ts`) with:
- Base URL pointing to the built static site
- Chromium-only (lightweight)
- Web server config to serve the built site during tests

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run preview',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4321',
  },
});
```

### Step 3: Write accessibility test

Create `e2e/accessibility.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage has no WCAG 2.2 AA violations', async ({ page }) => {
  await page.goto('/');

  // Wait for React island to hydrate
  await page.waitForSelector('[data-canvas]');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});

test('concept map is keyboard accessible', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[data-canvas]');

  // Tab through interactive elements and verify focus lands on them
  const focusableCount = await page.evaluate(() =>
    document.querySelectorAll('[tabindex], a[href], button').length
  );

  for (let i = 0; i < Math.min(focusableCount, 5); i++) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => ({
      tag: document.activeElement?.tagName,
      visible: document.activeElement?.getBoundingClientRect().width > 0,
    }));
    expect(focused.tag).not.toBe('BODY');
    expect(focused.visible).toBe(true);
  }
});
```

### Step 4: Add to GitHub Actions

Update `.github/workflows/ci.yml` to include:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Build site
  run: npm run build

- name: Run accessibility tests
  run: npx playwright test e2e/accessibility.spec.ts
```

### Step 5: Handle baseline violations

If the current site has existing violations:
1. Run the test locally first: `npx playwright test`
2. Fix any violations that are quick wins
3. For remaining issues, use `axe.disableRules()` with:
   - A comment citing the specific WCAG criterion
   - A link to a backlog task (create one per disabled rule in `1-backlog/`)
   - Add all disabled rules to a tracking list in the test file header
4. Never ship NEW violations
5. Revisit disabled rules quarterly or when related components change

## Acceptance Criteria

### Must Have
- [ ] `npx playwright test e2e/accessibility.spec.ts` passes locally
- [ ] GitHub Actions runs the test on every push
- [ ] Build fails on WCAG 2.2 AA violations
- [ ] Error output shows criterion ID and affected element
- [ ] No flaky failures

### Should Have
- [ ] Keyboard navigation test covers tab order through nodes
- [ ] Test runs against multiple viewport sizes (mobile, desktop)

### Nice to Have
- [ ] Accessibility test report uploaded as CI artifact
- [ ] Badge in README showing a11y pass/fail status

## Risks & Mitigations

### Risk 1: Existing violations fail the build immediately
**Likelihood**: High
**Impact**: Medium
**Mitigation**: Run locally first, fix quick wins, use `disableRules()` with
backlog tasks for the rest. Ratchet down over time.

### Risk 2: SVG content not fully auditable by axe-core
**Likelihood**: Medium
**Impact**: Low
**Mitigation**: axe-core handles SVG elements. Some SVG-specific a11y
(like `<title>` and `<desc>` on groups) may need manual rules.

## References

- **ADR**: `docs/decisions/adr/ADR-0001-wcag-accessibility-strategy.md`
- **axe-core**: https://github.com/dequelabs/axe-core
- **@axe-core/playwright**: https://www.npmjs.com/package/@axe-core/playwright
- **Playwright**: https://playwright.dev/
- **Existing CI**: `.github/workflows/`
