# ED-0010: Separate Design Data from graph.json

**Status**: In Progress
**Priority**: medium
**Assigned To**: feature-developer-v3
**Estimated Effort**: 2-4 hours
**Created**: 2026-03-05

## Related Tasks

**Related**: ED-0003 (Visual Polish), ED-0009 (A11y CI)

## Overview

`src/data/graph.json` currently mixes content data (node labels, descriptions,
positions, cluster assignments) with design decisions (node radii, cluster
colors and fills). This coupling makes it impossible to theme the diagram or
adjust the design system without editing the content file.

This task separates design tokens from content by:
1. Moving cluster `color`/`fill` values into CSS custom properties
2. Moving node `radius` values into a design config (or deriving them from a
   small set of size tokens)
3. Keeping `graph.json` as pure content: id, label, x, y, cluster, description

**Context**: We just completed a design token extraction (commit `2acae80`)
that tokenized opacity, typography, spacing, and sizing values across all
components. Cluster colors and node radii in `graph.json` are the remaining
untokenized design values. The Fibonacci type scale measurement system in
`ConceptMap.tsx` already uses node radius to determine font sizing, so the
radius abstraction must integrate cleanly with that.

## Requirements

### Functional Requirements

1. **Cluster colors as CSS tokens**: Define `--cluster-{name}-color` and
   `--cluster-{name}-fill` custom properties in `global.css` for all 6
   clusters (center, cognition, failure, domain, foundation, intensification)
2. **Node size tokens**: Define `--size-node-default`, `--size-node-large`,
   `--size-node-small` CSS custom properties. Each node in graph.json gets a
   `size` field ("small" | "default" | "large") instead of a numeric `radius`
3. **Runtime resolution**: Components resolve tokens at render time.
   `ConceptMap.tsx` maps size names to pixel values from CSS. Cluster colors
   are read from CSS rather than from data
4. **Cluster ID to CSS mapping**: The cluster key in graph.json (e.g.,
   `"cognition"`, `"failure"`) maps directly to CSS vars via
   `--cluster-{key}-color` and `--cluster-{key}-fill`. No transformation
   needed — keys are already lowercase kebab-compatible
5. **Font threshold derived from tokens**: The `radius > 40` threshold in
   ConceptMap.tsx that determines font sizing must be replaced with a
   comparison against the resolved `--size-node-large` token value (not a
   hardcoded `40`). Add `--size-node-large-threshold` token or derive it as
   the midpoint between `--size-node-default` and `--size-node-large`
6. **graph.json cleaned**: Remove `radius` (replace with `size`), remove
   `color`/`fill` from cluster definitions. Cluster entries keep only `label`
7. **Type system updated**: Update `types.ts` interfaces to reflect new shapes
8. **No visual changes**: The rendered diagram must look identical before and
   after this refactoring

### Non-Functional Requirements

- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors
- [ ] All existing keyboard shortcuts and interactions work
- [ ] Export SVG/PNG still works (cluster colors must be inline in exported SVG)

## Implementation Plan

### Files to Modify

1. `src/styles/global.css` — Add cluster color tokens and node size tokens
2. `src/data/graph.json` — Replace `radius` with `size`, strip cluster colors
3. `src/lib/types.ts` — Update `ClusterData` and `NodeData` interfaces
4. `src/components/ConceptMap.tsx` — Resolve size tokens to px values, resolve
   cluster colors from CSS
5. `src/components/ClusterBackground.tsx` — Use CSS vars for cluster styling
6. `src/components/Node.tsx` — May need minor adjustments
7. `src/components/DetailPanel.tsx` — Cluster color indicator
8. `src/lib/export.ts` — Ensure exported SVG inlines computed colors

### Approach

**Step 1: Add CSS tokens**

Add to `global.css`:
```css
/* Cluster colors */
--cluster-center-color: #1a1a2e;
--cluster-center-fill: rgba(255,255,255,0);
--cluster-cognition-color: #2d6a4f;
--cluster-cognition-fill: rgba(45,106,79,0.08);
/* ... etc for all 6 clusters */

/* Node sizes */
--size-node-small: 32;
--size-node-default: 36;
--size-node-large: 48;
```

**Step 2: Update graph.json**

- Replace each node's `"radius": N` with `"size": "small"|"default"|"large"`
  (exception: `"The Layer Underneath"` at r=38 rounds to "default")
- Strip `color` and `fill` from cluster objects, keeping only `label`

**Step 3: Update types and components**

- `NodeData.radius` stays as a runtime property, but `NodeData.size` is the
  data field. `ConceptMap` resolves `size` to `radius` on load
- `ClusterData` gets `id` field; colors resolved from CSS
- Components reference CSS vars instead of data properties for colors

**Step 4: Verify exports**

- SVG export must compute and inline actual color values (not CSS vars) since
  exported SVGs won't have the stylesheet
- Test with "S" key export

## Acceptance Criteria

### Must Have
- [ ] graph.json contains no hex colors, no rgba values, no pixel radii
- [ ] All 6 cluster color pairs are CSS custom properties
- [ ] All node sizes are CSS custom properties (3 tokens: small, default, large)
- [ ] Diagram renders identically to current state
- [ ] Build passes with no TypeScript errors
- [ ] SVG/PNG export produces correct colors

### Should Have
- [ ] `types.ts` interfaces are clean and documented
- [ ] CSS tokens are grouped and commented in global.css

### Nice to Have
- [ ] Foundation node (r=38) gets its own size token or is documented as rounding to default

## Risks & Mitigations

### Risk 1: SVG export breaks
**Likelihood**: Medium
**Impact**: Medium
**Mitigation**: `getComputedStyle()` can resolve CSS vars at export time.
Check `src/lib/export.ts` early to understand the export pipeline.

### Risk 2: Fibonacci measurement system coupling
**Likelihood**: Low
**Impact**: High
**Mitigation**: The `radius > 40` threshold in ConceptMap determines font
sizing. After refactoring, this threshold must use the resolved pixel value,
not a CSS var string. Ensure size resolution happens before measurement.

## Time Estimate

| Phase | Time |
|-------|------|
| Add CSS tokens + update graph.json | 30 min |
| Update types.ts + ConceptMap resolution | 45 min |
| Update cluster components | 30 min |
| Fix SVG export | 30 min |
| Testing & verification | 15 min |
| **Total** | **~2.5 hours** |

## References

- Design token extraction: commit `2acae80`
- Design system audit findings: session 2026-03-05 (4 sub-agent audits)
- Current CSS tokens: `src/styles/global.css`
- Fibonacci type scale: `src/components/ConceptMap.tsx` (measureAndFit)
