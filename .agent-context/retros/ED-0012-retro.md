## ED-0012 — Robust SVG/PNG Export (PR #12)

**Date**: 2026-03-06
**Agent**: feature-developer-v3
**Scorecard**: 8 threads, 0 regressions, 4 fix rounds, 5 commits

### What Worked

1. **Library choice was fast and correct** — `html-to-image` was evaluated against `dom-to-image-more` and `modern-screenshot` on npm info alone; it resolved CSS vars, embedded fonts, and passed build on first try. No library swap needed.
2. **Bundle size measurement before/after** — Stashing changes and building both versions gave precise delta numbers (+13 KB raw / +5 KB gzip) for the PR description. This prevented a CodeRabbit "document bundle impact" thread.
3. **Bot findings improved the code materially** — The serialization queue (CodeRabbit), offscreen clone (BugBot), and blob URL for SVG download (BugBot) were all real improvements. The final `export.ts` is significantly more robust than the initial commit.

### What Was Surprising

1. **BugBot caught a subtle React interaction bug** — The live DOM mutation / React re-render race (thread #3) was a real issue I didn't anticipate. The old code mutated a clone so this wasn't an issue before; switching to library-based export introduced it because `html-to-image` reads from the live DOM.
2. **4 bot review rounds for a ~95-line file** — Each push triggered new findings. The rounds were individually fast (1 commit each) but the cumulative triage overhead was notable for a small change.
3. **`html-to-image` types expect HTMLElement, not SVGSVGElement** — Required `as unknown as HTMLElement` cast. The library works fine with SVG at runtime but its TypeScript types don't reflect this.

### What Should Change

1. **Consider offscreen clone pattern as default for DOM capture libraries** — The live DOM mutation issue will recur any time we use a library that reads from the live DOM during an async operation. Add a note to `patterns.yml` about this pattern.
2. **Bot round count could be reduced by anticipating async DOM patterns** — The serialization queue and offscreen clone could have been in the initial commit if the pre-implementation checklist included "does this mutate shared DOM state during async operations?"
3. **SVGSVGElement type gap should be documented** — The `as unknown as HTMLElement` cast for `html-to-image` is a footgun for future editors. A comment explaining why is warranted (already present in the code as a type cast, but no explanatory comment).

### Permission Prompts Hit

None.

### Process Actions Taken

- [ ] Add offscreen-clone pattern to `.agent-context/patterns.yml` for DOM capture libraries
- [ ] Add "shared DOM mutation during async?" to pre-implementation checklist
- [ ] Document `html-to-image` SVGSVGElement type gap in code comment
