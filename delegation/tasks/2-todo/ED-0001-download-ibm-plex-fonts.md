# ED-0001: Download IBM Plex Sans Fonts

**Status**: Todo
**Priority**: high
**Assigned To**: feature-developer
**Estimated Effort**: 30 minutes

## Description

Download IBM Plex Sans woff2 font files and place them in `public/fonts/`:
- `IBMPlexSans-Regular.woff2` (weight 400)
- `IBMPlexSans-Medium.woff2` (weight 500)
- `IBMPlexSans-SemiBold.woff2` (weight 600)

Font-face declarations already exist in `src/styles/global.css` referencing
these paths.

## Acceptance Criteria

- [ ] Three woff2 files present in `public/fonts/`
- [ ] Build completes without font-related warnings
- [ ] Fonts render correctly in dev server
