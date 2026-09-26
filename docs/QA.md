# Verification record

Date: 21 September 2026.

Passed:
- TypeScript check (`tsc --noEmit`).
- Production Vinext/Worker build.
- Arithmetic checks for weighted pass percentages, player per-90, zero-minute null, missing-value propagation, and undefined single-entity percentile.
- CSV checks for quoted commas, blank optional fields, invalid dates, negative minutes, duplicates, and spreadsheet-formula escaping.
- Source policy rejects StatsBomb raw and chart export.
- Browser: loaded workspace; team dropdown changed 192 records to 48; bar chart selected; chart snapshot added; report builder rendered one chart.
- Browser: SVG and PNG generation reported successful downloads. Download-event capture was not reliable in this browser environment; exported file bytes were not independently opened.
- Browser desktop screenshot review: coherent layout and controls. Fixed an initial SVG title hydration mismatch and rechecked the rendered screen.

Limitations / public-beta gates:
- Full Safari/Firefox/mobile device testing, 200% text zoom, accessibility audit, long PDF pagination, and maximum-file performance remain to be completed.
- Browser CSV import UI and project reimport require further end-to-end testing; pure ingestion and policy functions were tested.
- WebMCP was feature-detected in source, but this browser did not expose modelContext, so live tool registration/action validation was unavailable.
- StatsBomb data delivery has not been enabled or tested. Written permission is unresolved.
- No assertion of legal clearance, complete soccer coverage, or universal browser support.

## Palette, theme, legal pages, and accreditation update

- User-supplied palette applied to shared tokens, dashboard components, chart accents, favicon, and light/dark variants.
- Browser checked light/dark toggle, dark chart rendering, and theme persistence across page navigation.
- Privacy and terms routes loaded; footer links are present and open separately from the active workspace.
- Browser imported a clearly labeled synthetic QA fixture through the StatsBomb source path strictly to test accreditation. No real match data was represented by the fixture or bundled into the site.
- StatsBomb chart contains the official embedded logo; raw CSV button is disabled.
- Created a report snapshot and switched the active dataset back to demo; the snapshot retained its StatsBomb logo attribution.
- Downloaded and visually inspected the generated 1800 × 1080 PNG: white export background, correct palette, readable source credit, and intact official StatsBomb logo.
- Updated policy test: StatsBomb chart exports allowed; StatsBomb raw exports rejected; demo raw exports allowed.
- TypeScript check passed. This record supersedes the earlier statement that all StatsBomb chart exports are blocked.
- Public-launch policy contact details/jurisdiction and broader mobile/PDF pagination testing remain open; no legal compliance guarantee is made.

## StatsBomb and accessibility update — 21 September 2026

- Removed all runtime demo data and demo source controls.
- TypeScript check and production build passed.
- Normalized official events for match 3869685: 35 players, 6 goals, 30 shots, xG 5.030923875. All eight shoot-out shots excluded. Minutes include actual period stoppage time; the maximum is 141.4102 minutes for this extra-time match.
- Browser verified direct catalog/match loading, Argentina–France event load, shot map, embedded logo, adding report snapshot, disabled raw CSV export, and expanded guide headings.
- Light and dark theme visually inspected. Shot outcomes now use diamond/circle shapes, radar uses solid/dashed/dotted lines, and blue/teal alternatives are available.
- Calculated contrast: light supporting text on white 8.9:1; dark supporting text on panel 11.45:1; blue/teal on white 6.03:1 / 5.16:1. Control border contrast exceeds 3:1. These spot checks are not a full accessibility certification.
- Screenshot: docs/review-statsbomb.jpg. Broader mobile and assistive-technology beta validation remains planned.

## Standalone GitHub export

Converted delivery to Vite + React multi-page static output without modifying the hosted Sites checkout. TypeScript and static builds passed at / and /touchline-studio/. Generated HTML asset paths resolve, including nested privacy and terms pages. Source artifacts exclude credentials, Sites configuration, dependency directories, runtime caches, and provider datasets. The supplied GitHub workflow has not been executed in the user account.
