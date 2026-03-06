# ED-0012: Robust SVG/PNG Export

**Status**: Done
**Priority**: medium
**Assigned To**: feature-developer-v3
**Estimated Effort**: 2-4 hours
**Created**: 2026-03-05

## Related Tasks

**Related**: ED-0010 (Separate Design Data), ED-0011 (Rounded Corners)

## Overview

The current SVG/PNG export (`src/lib/export.ts`) clones the SVG DOM and
serializes it. This produces broken output because CSS custom properties
used in SVG attributes (opacity, stroke width, radii, etc.) are serialized
as literal `var(--token-name)` strings, which standalone SVG files cannot
resolve. As a result:

- Colors may appear wrong or missing
- Connections (edges) may not render
- Opacity and stroke values are lost
- Rounded corners are missing

## Requirements

- Exported SVG renders identically to the in-browser view
- Exported PNG renders identically at 2x resolution
- All CSS custom property values are resolved to concrete values in export
- Keyboard shortcuts (S for SVG, P for PNG) continue to work

## Implementation Plan

### Primary approach: Use a dedicated SVG export library (Option B)

Evaluate and integrate a client-side library that handles CSS resolution,
font embedding, and cross-browser quirks. Candidates:

- **`dom-to-image-more`** — actively maintained fork of dom-to-image, handles
  CSS var resolution and font inlining
- **`html-to-image`** — similar approach, good SVG support
- **`saveSvgAsPng`** — SVG-focused, handles inline styles

**Evaluation criteria**: Does it resolve CSS custom properties? Does it
embed/inline fonts? Does it handle SVG-specific quirks (markers, paint-order)?
Bundle size impact?

Replace the current manual clone+serialize logic in `export.ts` with the
library's API. Keep the existing keyboard shortcut handlers and download
trigger logic.

### Fallback: Custom CSS var resolution (Option A)

Only pursue if no library handles our specific SVG quirks (markers,
paint-order, CSS geometry properties). A custom walker was attempted and
reverted in ED-0010 due to complexity — the challenges are well-documented:

- Must handle both `style` attributes and SVG presentation attributes
- Some values (like `opacity`) may be set via CSS classes, not inline
- Need to inline font-face declarations or embed fonts

If this path is needed, allocate significantly more effort (4-8 hours) and
write thorough tests.

### Not recommended: Server-side rendering (Option C)

Playwright/Puppeteer would add a server dependency, break client-only
deployment, and fundamentally change the architecture. Only consider if
client-side solutions are definitively proven insufficient.

## Files to Modify

- `src/lib/export.ts` — Main export logic
- `package.json` — Library dependency
- `src/components/ExportControls.tsx` — May need loading states

## Acceptance Criteria

- [ ] Exported SVG opens in a browser and looks identical to the live view
- [ ] Exported PNG at 2x resolution matches the live view
- [ ] All cluster colors, node strokes, edge opacities render correctly
- [ ] Rounded corners appear in exports (depends on ED-0011)
- [ ] Fonts render correctly in exported files
- [ ] `npm run build` passes
- [ ] Bundle size impact documented in PR description

## Evaluation History

- **arch-review-fast** (2026-03-05): REVISION_SUGGESTED. Confirmed Option B
  (library) as the right primary path. Flagged Option A (custom walker) as
  high-risk given prior revert in ED-0010. Flagged Option C (server-side) as
  architectural overkill. Task updated to make Option B the explicit primary
  approach and demote A/C to fallbacks.
