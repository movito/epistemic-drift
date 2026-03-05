# ED-0012: Robust SVG/PNG Export - Implementation Handoff

**You are the feature-developer. Implement this task directly. Do not delegate or spawn other agents.**

**Date**: 2026-03-05
**From**: Planner
**To**: feature-developer-v3
**Task**: delegation/tasks/2-todo/ED-0012-robust-svg-png-export.md
**Status**: Ready for implementation
**Evaluation**: Revised (arch-review-fast, evaluator feedback addressed)

---

## Task Summary

The SVG/PNG export system (`src/lib/export.ts`) clones the SVG DOM and
serializes it. CSS custom properties (`var(--token-name)`) are serialized
as literal strings, producing broken exports — missing colors, opacity,
strokes, and rounded corners.

## Current Situation

After ED-0010's token extraction, the export is more broken than before
because more values are now CSS vars. A custom CSS walker was attempted
during ED-0010 and reverted due to complexity.

## Your Mission

Replace the current manual clone+serialize approach with a dedicated
library that handles CSS resolution, font embedding, and SVG quirks.

### Phase 1: Library evaluation (~30 min)

Evaluate these candidates in order of preference:

1. **`dom-to-image-more`** — actively maintained, handles CSS vars
2. **`html-to-image`** — similar approach, modern API
3. **`modern-screenshot`** — newer alternative

**Test criteria**: Install, call with our SVG element, check if the output:
- Resolves CSS custom properties to concrete values
- Renders cluster colors correctly
- Handles SVG markers (arrowheads)
- Handles `paint-order: stroke` (text halos on edge labels)
- Embeds/inlines IBM Plex Sans font

### Phase 2: Integration (~1-2 hours)

Replace `exportSVG()` and `exportPNG()` in `src/lib/export.ts` with the
chosen library. Keep the existing API surface:
- `exportSVG(svgElement)` — downloads .svg file
- `exportPNG(svgElement)` — downloads .png file at 2x resolution
- `dumpPositions(nodes)` — unchanged (JSON, not affected)

Keep keyboard shortcut handlers in `ConceptMap.tsx` unchanged.

### Phase 3: Verification (~30 min)

1. Press S — exported SVG opens in browser with correct colors/strokes
2. Press P — exported PNG matches the live view at 2x
3. Check cluster colors, edge opacity, arrowheads, text halos, rounded corners
4. `npm run build` passes

## Critical Details

- The SVG element ref is at `svgRef` in `ConceptMap.tsx`
- Current export functions are in `src/lib/export.ts`
- `ExportControls.tsx` has the button UI — may need a loading state if the
  library is async
- IBM Plex Sans is self-hosted in `public/fonts/` — check if the library
  can embed woff2 fonts
- The arrowhead `<marker>` uses `fill="var(--color-text)"` — verify this resolves

## Files to Touch

| File | Change |
|------|--------|
| `src/lib/export.ts` | Replace clone+serialize with library calls |
| `package.json` | Add library dependency |
| `src/components/ExportControls.tsx` | Add loading state if needed |

## What NOT to Do

- Don't write a custom CSS var walker — this was tried and reverted
- Don't add server-side dependencies (Playwright/Puppeteer)
- Don't change the keyboard shortcut bindings
- Don't modify `dumpPositions()` — it exports JSON, not affected

---

**Task File**: `delegation/tasks/2-todo/ED-0012-robust-svg-png-export.md`
**Evaluation Log**: `.adversarial/logs/ED-0012-robust-svg-png-export--arch-review-fast.md.md`
**Handoff Date**: 2026-03-05
**Coordinator**: Planner
