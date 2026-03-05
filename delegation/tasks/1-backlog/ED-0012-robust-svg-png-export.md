# ED-0012: Robust SVG/PNG Export

**Status**: Backlog
**Priority**: medium
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

## Implementation Notes

**Option A: CSS var resolution at export time**
Walk the cloned SVG DOM, compare each element's inline styles and
presentation attributes against `getComputedStyle()` on the live element,
and replace any `var()` references with computed values. This is the
approach started (then reverted) in ED-0010.

Challenges:
- Must handle both `style` attributes and SVG presentation attributes
- Some values (like `opacity`) may be set via CSS classes, not inline
- Need to inline font-face declarations or embed fonts

**Option B: Use a dedicated SVG export library**
Libraries like `svg-crowbar`, `saveSvgAsPng`, or `dom-to-image-more` handle
CSS resolution, font embedding, and cross-browser quirks. This is likely
more robust than a custom solution.

**Option C: Server-side rendering with Playwright/Puppeteer**
Render the page headlessly and screenshot. Most robust but adds a
dependency and won't work for client-side-only export.

**Recommendation**: Evaluate Option B first. If a library handles the CSS
var resolution and font embedding cleanly, it will be more maintainable
than a custom walker.

## Files to Modify

- `src/lib/export.ts` — Main export logic
- `package.json` — If adding a library dependency
- `src/components/ExportControls.tsx` — May need loading states

## Acceptance Criteria

- [ ] Exported SVG opens in a browser and looks identical to the live view
- [ ] Exported PNG at 2x resolution matches the live view
- [ ] All cluster colors, node strokes, edge opacities render correctly
- [ ] Rounded corners appear in exports (depends on ED-0011)
- [ ] `npm run build` passes
