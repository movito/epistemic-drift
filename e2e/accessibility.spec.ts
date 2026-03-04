/**
 * Accessibility tests — WCAG 2.2 AA hard gate (ADR-0001, Layer 3)
 *
 * These tests run axe-core against the built static site and fail the build
 * on any WCAG 2.2 AA violation. The build must be run before these tests
 * (`npm run build`); Playwright serves it via `npm run preview`.
 *
 * Disabled rules (baseline violations with backlog tasks):
 *   — (none currently disabled)
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.2 AA Compliance', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Wait for React island to hydrate (ConceptMap renders [data-canvas])
    await page.waitForSelector('[data-canvas]', { timeout: 10_000 });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();

    // Format violations for clear CI output
    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({
        html: n.html.slice(0, 200),
        target: n.target,
      })),
    }));

    if (violations.length > 0) {
      const report = violations
        .map(
          (v) =>
            `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n` +
            `  Help: ${v.helpUrl}\n` +
            v.nodes.map((n) => `  Element: ${n.target.join(' > ')}\n  HTML: ${n.html}`).join('\n'),
        )
        .join('\n\n');

      // Fail with detailed report so CI shows exactly what broke
      expect(violations, `WCAG 2.2 AA violations found:\n\n${report}`).toEqual([]);
    }
  });

  test('concept map is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-canvas]', { timeout: 10_000 });

    // Count focusable elements in the page
    const focusableCount = await page.evaluate(() =>
      document.querySelectorAll('[tabindex]:not([tabindex="-1"]), a[href], button').length,
    );

    // Tab through up to 5 focusable elements and verify focus is visible
    const tabCount = Math.min(focusableCount, 5);
    for (let i = 0; i < tabCount; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          visible: rect.width > 0 && rect.height > 0,
        };
      });

      if (focused) {
        expect(focused.tag).not.toBe('BODY');
        expect(focused.visible).toBe(true);
      }
    }
  });
});
