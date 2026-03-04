# ED-0009: Add axe-core Accessibility Testing to CI - Implementation Handoff

**You are the feature-developer. Implement this task directly. Do not delegate or spawn other agents.**

**Date**: 2026-03-04
**From**: planner2
**To**: feature-developer-v3
**Task**: `delegation/tasks/2-todo/ED-0009-axe-core-ci-integration.md`
**Status**: Ready for implementation
**Evaluation**: Arch-review-fast REVISION_SUGGESTED → patched (2 findings addressed)

---

## Task Summary

Add Playwright + axe-core accessibility tests to the CI pipeline. Every push triggers
an automated WCAG 2.2 AA audit; the build fails on violations. This is Layer 3 of the
accessibility strategy (ADR-0001).

## Current Situation

- CI workflows live in `.github/workflows/` — currently `test.yml` and `sync-to-linear.yml`
- No Playwright or browser-based testing yet — this is a new dependency
- The site is a static Astro build (`npm run build` → `dist/`)
- `npm run preview` serves the built site on port 4321
- BugBot + CodeRabbit handle code quality but not axe-core

## Your Mission

### Phase 1: Setup (30 min)
- Install `@axe-core/playwright` and `@playwright/test` as dev dependencies
- Install Chromium for Playwright
- Create `playwright.config.ts` at project root

### Phase 2: Write Tests (45-60 min)
- Create `e2e/accessibility.spec.ts` with:
  - WCAG 2.2 AA axe-core scan of the homepage
  - Keyboard navigation test (tab through focusable elements, verify focus visibility)
- Build the site first, then test against the preview server

### Phase 3: CI Integration (30-45 min)
- Add an accessibility job to `.github/workflows/test.yml` (or create new workflow)
- Install Playwright + Chromium in CI
- Run `npm run build` then Playwright tests
- Upload results as artifacts (nice to have)

### Phase 4: Baseline Triage (30 min)
- Run tests locally first
- Fix quick-win violations
- For remaining issues: use `disableRules()` with:
  - A comment citing the WCAG criterion
  - A link to a backlog task (create in `delegation/tasks/1-backlog/`)
  - Add disabled rules to a tracking list in the test file header

## Evaluator Feedback (addressed in task spec)

Two findings from arch-review-fast, both patched into the task spec:

1. **disableRules() backlog management** — The task spec now requires each disabled rule
   to link to a backlog task, with a tracking list in the test file and quarterly review.

2. **Keyboard navigation test too minimal** — The test sketch now loops through multiple
   focusable elements and checks both tag and visibility, not just a single Tab press.

## Key Technical Details

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run preview',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4321',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

### CI Addition (add to test.yml or new workflow)

```yaml
accessibility:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v6
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npm run build
    - run: npx playwright test e2e/accessibility.spec.ts
```

### Wait for React hydration

The concept map is a React island with `client:load`. Wait for it:

```typescript
await page.waitForSelector('[data-canvas]');
```

### SVG viewBox

The SVG is `0 0 1020 760`. Interactive nodes are `<circle>` elements inside `<g>` groups.
They may or may not have `tabindex` yet — check during implementation.

## Acceptance Criteria (Must Have)

- [ ] `npx playwright test e2e/accessibility.spec.ts` passes locally
- [ ] GitHub Actions runs the test on every push
- [ ] Build fails on WCAG 2.2 AA violations
- [ ] Error output shows criterion ID and affected element
- [ ] No flaky failures
- [ ] Any disabled rules have linked backlog tasks

## Non-Functional Requirements

- CI time increase < 60 seconds
- No flaky tests (static site, deterministic output)
- Works with Astro's static build output

## Time Estimate

**Estimated**: 2-3 hours
- Phase 1 (Setup): 30 min
- Phase 2 (Tests): 45-60 min
- Phase 3 (CI): 30-45 min
- Phase 4 (Baseline): 30 min

## Starting Point

1. `npm install -D @axe-core/playwright @playwright/test`
2. `npx playwright install chromium`
3. Create `playwright.config.ts`
4. Create `e2e/accessibility.spec.ts`
5. Run `npm run build && npx playwright test` locally
6. Add to CI workflow

## References

- **ADR**: `docs/decisions/adr/ADR-0001-wcag-accessibility-strategy.md`
- **Existing CI**: `.github/workflows/test.yml`
- **axe-core tags**: `wcag2a`, `wcag2aa`, `wcag22aa`
- **Astro preview**: `npm run preview` serves on port 4321

---

**Task File**: `delegation/tasks/2-todo/ED-0009-axe-core-ci-integration.md`
**Evaluation Log**: `.adversarial/logs/ED-0009-axe-core-ci-integration--arch-review-fast.md`
**Handoff Date**: 2026-03-04
**Coordinator**: planner2
