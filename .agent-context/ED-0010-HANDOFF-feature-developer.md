# ED-0010 Handoff: Separate Design Data from graph.json

## Context

We just completed a two-phase design system buildout:

1. **Feature commit** (`ca1251d`): Auto-fit text in circles via
   `getComputedTextLength()` measurement, Fibonacci 8:13:21 type scale,
   cluster label spacing, arrow opacity fix, edge label halo + collision
   avoidance
2. **Token extraction** (`2acae80`): ~30 CSS custom properties in `global.css`
   covering opacity, typography, spacing, sizing, and radii

The one remaining area of hardcoded design values is `graph.json`, which
currently mixes content (labels, positions, descriptions) with design decisions
(node radii, cluster colors/fills).

## What Needs to Happen

### 1. Cluster colors (6 pairs) -> CSS tokens

Current graph.json clusters look like:
```json
"cognition": {
  "color": "#2d6a4f",
  "fill": "rgba(45,106,79,0.08)",
  "label": "Cognition"
}
```

After:
```json
"cognition": {
  "label": "Cognition"
}
```

With CSS tokens in `global.css`:
```css
--cluster-cognition-color: #2d6a4f;
--cluster-cognition-fill: rgba(45,106,79,0.08);
```

The cluster key in graph.json (e.g., `"cognition"`) maps directly to
`--cluster-{key}-color` and `--cluster-{key}-fill`. No string transformation
needed.

### 2. Node radii -> size tokens

Current nodes have `"radius": 36` (or 32, 38, 48). Replace with semantic
`"size"` field:

| Current radius | Size token | CSS var |
|---------------|------------|---------|
| 32 | `"small"` | `--size-node-small: 32` |
| 36 | `"default"` | `--size-node-default: 36` |
| 38 | `"default"` | rounds to default (document this) |
| 48 | `"large"` | `--size-node-large: 48` |

### 3. Font threshold derivation

The `radius > 40` check in `ConceptMap.tsx` (appears 3 times: lines ~49, 76,
129) determines whether a node gets the large or regular base font size.
Replace the hardcoded `40` with a derived threshold — the midpoint between
`--size-node-default` and `--size-node-large`, or add an explicit
`--size-node-large-threshold` token.

### 4. Type system

Update `src/lib/types.ts`:
- `ClusterData`: remove `color` and `fill`, add `id: string`
- `NodeData`: replace `radius: number` with `size: "small" | "default" | "large"`, keep `radius` as a runtime-resolved property

### 5. SVG Export

`src/lib/export.ts` needs to inline computed colors in exported SVGs (CSS vars
won't be available in standalone SVG files). Use `getComputedStyle()` to
resolve vars at export time.

## Critical Details

- The Fibonacci measurement system in `ConceptMap.tsx` (`measureAndFit`)
  depends on `node.radius` being a number. Size resolution must happen
  BEFORE measurement runs (in `useState` initializer or early in the
  component)
- Cluster colors are used in: `ClusterBackground.tsx` (rect fill/stroke, label
  fill), `Node.tsx` (circle stroke), `DetailPanel.tsx` (indicator dot)
- The `center` cluster color `#1a1a2e` duplicates `--color-text` — you can
  alias it: `--cluster-center-color: var(--color-text)`

## Files to Touch

| File | Change |
|------|--------|
| `src/styles/global.css` | Add cluster + size tokens |
| `src/data/graph.json` | Replace radius with size, strip cluster colors |
| `src/lib/types.ts` | Update interfaces |
| `src/components/ConceptMap.tsx` | Resolve sizes + colors, fix threshold |
| `src/components/ClusterBackground.tsx` | Use CSS vars for colors |
| `src/components/Node.tsx` | Cluster color from CSS |
| `src/components/DetailPanel.tsx` | Cluster color from CSS |
| `src/lib/export.ts` | Inline resolved colors in SVG export |

## Verification

1. `npm run build` passes
2. Visual diff: screenshot before/after should be pixel-identical
3. Press S to export SVG — clusters should have correct colors
4. Press P to export PNG — same verification
5. Hover/click interactions work as before
