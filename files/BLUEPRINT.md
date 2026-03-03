# Epistemic Map — Project Blueprint

An interactive concept map exploring how generative AI extends cognition while creating epistemic vulnerabilities. Built with Astro + React islands, deployed to Vercel.

## Stack

- **Astro 5** with static output
- **React 19** via `@astrojs/react` (single island, `client:load`)
- **@astrojs/vercel** adapter
- **Vanilla CSS** with CSS custom properties
- No UI library, no Tailwind

## Project Structure

```
epistemic-map/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   └── fonts/                    # IBM Plex Sans (self-hosted, woff2)
├── src/
│   ├── pages/
│   │   └── index.astro           # Shell: meta, fonts, loads <ConceptMap client:load />
│   ├── components/
│   │   ├── ConceptMap.tsx         # Orchestrator: loads data, manages state, keyboard shortcuts
│   │   ├── Canvas.tsx             # SVG element with pan/zoom transform on outer <g>
│   │   ├── ClusterBackground.tsx  # Rounded rect + label for each cluster
│   │   ├── Edge.tsx               # Line between two nodes, with optional label
│   │   ├── Node.tsx               # Circle + multiline text, handles drag
│   │   ├── DetailPanel.tsx        # Bottom panel showing selected node description
│   │   └── ExportControls.tsx     # Buttons: Export SVG, Export PNG, Dump Positions
│   ├── data/
│   │   └── graph.json             # THE source of truth — all nodes, edges, clusters
│   ├── lib/
│   │   ├── types.ts               # TypeScript interfaces for GraphData, Node, Edge, Cluster
│   │   ├── geometry.ts            # Edge path calculation, cluster bounding boxes
│   │   └── export.ts              # SVG serialization, canvas-based PNG export
│   └── styles/
│       └── global.css             # CSS custom properties, font-face, base reset
```

## Data Architecture

`graph.json` is the only file that needs editing for content changes. It contains:

```typescript
interface GraphData {
  meta: {
    title: string;
    subtitle: string;
    note: string;
  };
  clusters: Record<string, {
    color: string;      // Stroke and label color
    fill: string;       // Background fill (rgba, low alpha)
    label: string;      // Cluster heading text
    labelPos?: { x: number; y: number };
  }>;
  nodes: Array<{
    id: string;
    label: string;      // Use \n for line breaks
    x: number;
    y: number;
    cluster: string;    // Key into clusters
    description: string;
    radius: number;
  }>;
  edges: Array<{
    from: string;       // Node id
    to: string;         // Node id
    label?: string;     // Use \n for line breaks
    style?: "solid" | "dashed" | "dotted";
  }>;
}
```

## Interaction Model

### Pan & Zoom
- Scroll wheel zooms (centered on cursor position)
- Click-drag on empty canvas pans
- Implemented as transform on a wrapper `<g>` inside the SVG
- State: `{ x: number, y: number, scale: number }`
- Clamp scale to roughly 0.3–3.0

### Node Dragging
- Pointer down on a node starts drag mode
- Pointer move updates node position in state
- Pointer up ends drag
- Must not conflict with pan — use `e.stopPropagation()` on node pointer events
- During drag, connected edges update in real time

### Keyboard Shortcuts
- `D` — dump current node positions as JSON to console (for pasting back into graph.json after dragging)
- `S` — export SVG to download
- `P` — export PNG to download
- `Escape` — deselect current node, reset zoom

### Hover & Select
- Hover highlights node + its connected edges, dims everything else
- Click selects node, shows detail panel
- Click on empty canvas deselects

## Export

### SVG Export
- Clone the SVG DOM node
- Strip transform (export at full size, no pan/zoom offset)
- Set explicit width/height attributes
- Serialize via XMLSerializer
- Trigger download as `.svg`

### PNG Export
- Render the cleaned SVG to an offscreen `<canvas>` via `Image` + blob URL
- Offer 2x resolution for print
- Trigger download as `.png`

### Position Dump
- Serialize current `nodes` array as `{ id, x, y }[]` to console
- Format: ready to paste into graph.json to persist layout changes made by dragging

## Styling Approach

CSS custom properties in `global.css`:

```css
:root {
  --color-bg: #faf9f7;
  --color-text: #1a1a2e;
  --color-text-secondary: #666;
  --color-text-muted: #999;
  --color-border: #e0ddd8;
  --color-surface: #ffffff;

  --font-body: 'IBM Plex Sans', system-ui, sans-serif;
  --font-size-xs: 9px;
  --font-size-sm: 11px;
  --font-size-base: 14px;
  --font-size-lg: 26px;

  --radius-md: 10px;
  --radius-lg: 16px;

  --transition-fast: 0.15s ease;
  --transition-normal: 0.25s ease;
}
```

Component-level styles as scoped CSS within each `.tsx` file using inline style objects (consistent with the prototype) or a co-located `.css` file imported into the component. No CSS modules needed at this scale.

## SVG Canvas Dimensions

- ViewBox: `0 0 1020 760` (matches prototype)
- Nodes are positioned in this coordinate space
- Pan/zoom transforms this space within the browser viewport
- Responsive: SVG uses `width: 100%` with aspect ratio preserved

## Build & Deploy

```bash
npm install
npm run dev          # Local dev with hot reload
npm run build        # Static build
npx vercel           # Deploy
```

Vercel config: auto-detected as Astro. No special settings needed for static output.

## Current graph.json Content

The initial data comes from the concept map we built in conversation. It contains:
- 16 nodes across 6 clusters
- ~25 edges with labels and varied styles (solid, dashed, dotted)
- See the prototype artifact in this conversation for the complete data

Copy the node/edge/cluster data from the `epistemic-expansion-concept-map.jsx` artifact into `graph.json` format to bootstrap the project.
