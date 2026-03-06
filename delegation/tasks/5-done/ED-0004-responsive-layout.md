# ED-0004: Responsive Layout

**Status**: Done
**Priority**: medium
**Assigned To**: feature-developer
**Estimated Effort**: 1 hour

## Description

Ensure the concept map works well on different screen sizes:
1. SVG viewBox preserves aspect ratio with `preserveAspectRatio="xMidYMid meet"`
2. Title overlay is readable on small screens (responsive font size)
3. Export controls don't overlap the title on narrow viewports
4. Detail panel is scrollable if description is long
5. Touch support for pan/zoom on mobile (pinch-to-zoom)

## Acceptance Criteria

- [ ] Map renders correctly on 1024px, 1440px, and 1920px widths
- [ ] Title and controls don't overlap on narrow screens
- [ ] Detail panel handles long descriptions gracefully
