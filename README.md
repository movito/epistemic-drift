# Epistemic Drift

An interactive concept map exploring how generative AI extends cognition while creating epistemic vulnerabilities.

Starting from Boris Cherny's insight -- "you have to understand the layer under the layer at which you work" -- this map clusters key concepts around the human practitioner, tracing connections between 4E cognitive architecture, failure modes, domain properties (Cynefin), foundational knowledge, and work intensification.

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:4321` in your browser.

## Stack

- **Astro 5** with static output
- **React 19** (single island, `client:load`)
- **@astrojs/vercel** adapter
- **Vanilla CSS** with CSS custom properties
- **IBM Plex Sans** (self-hosted, woff2)

## Data

All content lives in `src/data/graph.json`. This is the single source of truth for nodes, edges, and clusters. Edit this file to change the concept map content -- no code changes needed.

## Interaction

- **Pan**: Click-drag on empty canvas
- **Zoom**: Scroll wheel (centered on cursor)
- **Drag**: Pointer down on a node to reposition it
- **Hover**: Highlights node and its connections
- **Click**: Shows detail panel with description
- **Keyboard**: `D` dump positions, `S` export SVG, `P` export PNG, `Escape` deselect

## Export

- **SVG**: Full-resolution vector export
- **PNG**: 2x resolution raster export
- **Positions**: Dump current node coordinates to console (paste back into `graph.json` after dragging)

## Deploy

```bash
npm run build
npx vercel
```

Vercel auto-detects the Astro framework. No special configuration needed.

## Version

0.1.0
