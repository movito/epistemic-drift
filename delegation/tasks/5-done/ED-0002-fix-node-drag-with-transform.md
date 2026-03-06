# ED-0002: Fix Node Drag with Pan/Zoom Transform

**Status**: Done
**Priority**: high
**Assigned To**: feature-developer
**Estimated Effort**: 1 hour

## Description

The current `Node.tsx` drag implementation uses raw `clientX`/`clientY`
coordinates. When the canvas is panned or zoomed, the drag offset calculation
is incorrect because it doesn't account for the SVG transform
(`translate` + `scale`).

Fix the drag handler to:
1. Convert screen coordinates to SVG coordinate space using
   `svgElement.getScreenCTM()` inverse
2. Account for the current pan/zoom transform
3. Ensure smooth, 1:1 drag feel at any zoom level

## Acceptance Criteria

- [ ] Dragging works correctly when zoomed in/out
- [ ] Dragging works correctly when canvas is panned
- [ ] No jitter or offset when starting a drag
- [ ] Connected edges update in real time during drag
