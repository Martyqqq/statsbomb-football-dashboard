# Touchline Studio — architecture and launch plan

> Standalone GitHub edition: the current delivery stack is Vite + React, with three static HTML entry points and GitHub Actions deployment. Historical Sites/Vinext references below describe the original hosted implementation. There are no Sites credentials, access gates, database bindings, or hosting configuration in this export. See README.md for authoritative setup instructions.

Status: working private foundation. This is not a live comprehensive soccer data service.

## Product contract

Visitors choose a dataset, filter it, create charts or tables, compose a report, export, and leave. No application accounts, bookmarks, saved dashboards, database, or server-side upload endpoint. A local theme preference and sidebar cookie do not contain research data. React state holds the current session. Closing/reloading the page discards it. A downloaded project stores configuration only. Hosting-level owner access is separate from application user accounts.

## License review and change to the original plan

Reviewed: user-supplied StatsBomb Public Data User Agreement, last updated 8 September 2023, five pages. Also checked the official repository README at https://github.com/hudl/open-data on 21 September 2026. This is a practical engineering interpretation, not a guarantee of legal compliance or legal advice. A future launch must establish which current terms govern the intended use.

| Provision | Meaning for this product | Implemented response |
| --- | --- | --- |
| Introduction; 1.1 | Research/analysis purpose; analysis may be shared publicly | No assumption that this permits a data-delivery service |
| 1.2.1, page 1 | Restricts editing, distortion, distribution, reproduction, sale, or providing data to third parties | Direct browser fetch from the official provider repository for research; no application-hosted mirror, proxy, or raw data exports |
| 1.2.2, page 1 | Prohibits commercial exploitation of data or derived analysis | No monetized StatsBomb integration; future ads, sponsorships, paid features and commercial users require clarification |
| 1.4, page 2 | Requires StatsBomb brand logo for published analysis | Official provider logo embedded in StatsBomb-derived UI charts, PNG/SVG exports, and report snapshots; raw CSV export disabled |
| 2.1, page 2 | GitHub delivery can be withheld without notice | Future source adapters need failure handling, explicit coverage, refresh dates, and permitted retention rules |
| 2.2, page 2 | Asks users for name/email via provider website | Direct people to the provider's current process if integration is approved; do not collect or submit registration details on their behalf |
| 3.2–3.4, page 2 | As-is data, accuracy/completeness not warranted | Methodology, provenance and missing-data policies must remain visible |
| 6, pages 3–4 | Suspension/termination rights | Owner-controlled source disablement and provider-specific purge procedure before integration |
| 7, page 4 | Data ownership; prior written consent for restricted exploitation | Do not enable based only on the word “open” or repository availability |
| 9, page 5 | England and Wales law / English courts | Include in qualified legal review if needed |

Written clarification should describe this exact service: anonymous public users, client-side filtering, chart generation, browser delivery of records, any hosting/cache/precomputation, PNG/SVG/PDF analysis exports, CSV exports, expected traffic, and whether any commercial activity is anticipated. Clarify whether interactive access constitutes redistribution; what aggregation is allowed; what logo/credit format is required; and what retention/deletion obligations apply. Request zero-fee permission consistent with the user's budget. If permission is unavailable, retain the independent editor and use a source with suitable rights. A browser-direct GitHub fetch is not treated as a licensing workaround.

The current StatsBomb policy enables direct browser loading of selected Open Data matches, local noncommercial research imports, and attributed chart/report exports. No dataset mirror or raw CSV data export is provided. Importers identify the source and affirm their research rights. The official logo is embedded into each StatsBomb-derived SVG; PNG and report snapshots inherit it. Export stops if its logo marker is absent. Mixed reports preserve each snapshot’s attribution. This follows the owner’s stated noncommercial research intent; a local import declaration does not verify ownership or establish blanket public redistribution rights.

## Information architecture

| View | Main action | Supporting content |
| --- | --- | --- |
| Analysis workspace | Filter, compare, visualize | Shared controls, source notice, summary cards, charts, table |
| Report builder | Arrange chart snapshots and notes | Reorder/remove; browser print/save PDF; maximum 12 pages |
| Data sources | Load a StatsBomb match or import authorized CSV | Coverage, rights, restricted-source explanation |
| Metric guide | Inspect calculations | Per-90, missing values, weighted pass %, cohort percentile |
| Architecture & roadmap | Review delivery scope | Component boundaries, feature status, phased launch gates |

No oversized marketing landing page; visitors open directly into the working surface.

## Runtime and boundaries

1. Presentation: React/TypeScript in the Vinext starter; shared Shadcn/Radix controls; CSS tokens and responsive grids. No external fonts or image/CDN dependencies.
2. Session state: page-owned data, filters, selections, chart configuration, and report snapshots. No localStorage of research data and no analytics service. Only the theme preference is retained in localStorage. The sidebar component can set a seven-day preference cookie.
3. Data: lib/touchline/data.ts supplies normalized types, aggregation, formatting, and percentile calculations.
4. Ingestion: lib/touchline/csv.ts validates local CSV; uses File.text; never uploads file bytes. Future CPU-heavy parsing should run in a browser worker.
5. Permissions: lib/touchline/policy.ts centralizes source availability and export rules. UI and export functions consult this policy. Server enforcement is additionally required if future server endpoints exist.
6. Visualization: components/touchline/chart.tsx renders SVG geometry for scatter, ranked bars, daily trends, percentile radar, and real StatsBomb shot maps. Same SVG is used in downloads and report snapshots.
7. Export: SVG serialization; canvas PNG; spreadsheet-formula-safe CSV; print CSS for PDF; JSON configuration import/export. No arbitrary HTML injection.
8. Delivery: Sites hosting with no D1/R2 bindings. Worker serving the frontend is not a persistent user-data backend. Hosting access/logs are separate from app behavior.

### Current schema

One row per player/team/date/competition/season. Required columns: player, team, position, competition, season, date (YYYY-MM-DD), minutes. Optional metrics: goals, assists, shots, xg, passes, completed, tackles, sot, npxg, key_passes, dribbles, carries, interceptions, recoveries, pressures. Missing metrics use null. Dates and finite nonnegative counts are validated, minutes limited to 160 (including extra/stoppage time), completed <= passes, goals <= shots, duplicate player-match keys rejected. Minimum-minute eligibility is applied after date/team/competition/position filtering and aggregation. Files are limited to 5 MB and 10,000 rows.

Current CSV assumption: one match per player/team/date. For tournaments with multiple same-day matches, introduce explicit match_id before ingestion. Player names are source-local identifiers in this MVP; stable provider IDs and transfer-aware entity resolution are a phase-3 integration requirement.

Future source schema: SourcePolicy, DatasetManifest (version, license version, provider, attribution, coverage, freshness, checksum), Competition, Season, Team, Player, Match, PlayerMatchStats, Event, Shot. Stable source-qualified identifiers must prevent accidental cross-provider joins. Each metric needs definition, unit, denominator, completeness, and provenance. Never blend provider xG models under a single unlabeled metric.

### Calculation rules

- Totals sum complete source values. If any included row is missing a given metric, that metric is unavailable for the aggregate.
- Player per-90 = metric total / sum minutes * 90; zero-minute rates are unavailable.
- Team totals aggregate supplied player records and can be partial. Team per-90 is disabled without verified team-match duration; summed player-minutes would be misleading as team per-90.
- Pass completion = 100 * sum completed / sum attempts; no mean of match percentages. Zero attempts or incomplete counts => unavailable.
- Percentiles = midrank scaled from 0 to 100 within the eligible cohort. Fewer than two non-missing values => unavailable.
- Table percentile cohort is before name search. Radar uses the visible cohort and omits profiles without all six metrics. Comparisons select up to three visible entities. Trend aggregates selected rows by date; it is not a live timeline.
- StatsBomb event periods 1–4 are analyzed; shoot-outs are excluded. Playing time uses starting lineups, substitutions, dismissals, and period timestamps, including stoppage time. Positions describe the starting/substitution role, not time-weighted tactical roles. Own goals are excluded from player goal counts; team scores can therefore differ from summed player goals.

## Design system

Palette supplied by the user: white #FFFFFF; annatto #935146; black #000000; rose #BD6063; burgundy #490627; burnt orange #7B2800; brick #8E3B39. Burgundy anchors navigation and primary actions. Rose supplies active accents. Readability extensions provide light canvas #FAF7F8, ink #291B23, dark canvas #171216 and dark surfaces #211B20, with lighter #E4A0AB accents for contrast. A sticky menu-bar toggle selects light/dark mode. Theme is the only localStorage value and is disclosed in the privacy notice. Export rendering uses a separate light SVG so image and PDF outputs remain printable and source logos retain their original colors.

Grid: fixed 235px desktop navigation; maximum 1700px content; 32px desktop gutters; five-column filter area; four-column summary; fluid chart + 266px settings; 20–24px section gaps. Collapse settings below chart at 1050px and navigation to a mobile sheet below 768px. Mobile has two-column filters/summary, single-column content, independently scrollable tables.

Typography: system Arial/Helvetica; 32px page heading; 18px section heading; 16px body; 14px controls and tables; 12px supporting metadata. Chart typography is scaled inside exported SVG; table supplies a readable alternative on narrow displays. Spacing uses 4/8/12/16/20/24/32px rhythm. Corners 4–7px. Use labels above controls, sentence case for actions, consistent metric names and units. Never use color as the only state indicator. Native focus behavior, keyboard-operable primitives, reduced motion, semantic tables, image descriptions, and visible empty/error states are included.

## Feature inventory

Implemented: StatsBomb competition/season catalog, match selector, direct browser event loading, real shot coordinates; rights-declared local CSV; competition/season/team/position/date/minimum-minute filters; players/teams; totals/player per-90; search; sort; paginated table; selectable columns; up-to-three comparisons; cohort percentiles; five SVG chart types; chart title/accent/labels/notes; SVG and PNG exports; CSV table export; report snapshots/reordering/notes; browser print/save PDF; project configuration export/import; data/metric/architecture reference views; source export policy; favicon; responsive layout; optional feature-detected WebMCP chart configuration.

Bounded/deferred: bulk season processing and application-hosted data distribution; general event/shot CSV import; cross-provider merging; automated refresh/caching; passing networks; heat maps; 360 views; possession-adjusted metrics; tracking; custom formula editor; arbitrary drag-and-drop report layout; XLSX; live feeds; direct server-rendered PDF; background workers for larger datasets. No fabricated “live” values or inactive buttons masquerading as these capabilities.

## Roadmap with acceptance gates

| Phase | Deliverables | Exit gate | Current status |
| --- | --- | --- | --- |
| 1: Data/rights, estimated 1–2 weeks | Target competition/season/metric matrix; written rights; actual sample payload review; export/retention policy | Provider rights explicitly fit public delivery and exports | Private research match loading enabled; public launch remains separate |
| 2: End-to-end slice, about 1 week | Dataset -> filters -> chart -> exported artifact | One complete accurate workflow | Implemented with StatsBomb matches and local data |
| 3: Data foundation, 1–2 weeks | Stable IDs; manifests/checksums; schema adapters; missing-value and unit tests; permitted cache/refresh; worker profiling | Calculations reconciled to source; corrections/versioning defined | StatsBomb match adapter implemented; bulk pipeline deferred |
| 4: Editor, 2–3 weeks | Consistent controls, charts, table, comparisons, report composition | Every active control works and uses common filtered data | Implemented foundation; advanced event views deferred |
| 5: Exports/QA, 1–2 weeks | Browser compatibility, mobile memory, keyboard/accessibility, PNG/SVG, CSV, PDF pagination, large-file tests | No materially incorrect numbers; usable exported reports; no restricted-source leakage | Automated and browser checks performed as recorded in QA.md; broader beta needed |
| 6: Public beta, about 1 week | Cleared source, hosting audience decision, limits, monitoring, feedback, update/rollback process | Licensing and operational gates passed | Private review release only |

Timings are planning estimates for a focused release, not completion guarantees. Comprehensive current global soccer coverage is not available in this implementation and has not been verified at zero data cost.

## Future deployment without a database

If authorized: scheduled ingestion obtains provider data, normalizes it, validates it, and writes versioned compact files partitioned by league/season/match. A coverage manifest drives the dropdowns. Serve immutable files via a CDN/object store, refresh a small index, and keep private credentials only in a backend. A cache is shared soccer data, not user report persistence. Retention/rehosting must be permitted. Do not put a paid API key in browser code.

Only add a statistical database when cross-season queries and permitted multi-source joins outgrow prepared files. This remains independent of user accounts. Accounts, saved dashboards, subscriptions and collaboration are explicitly out of scope until requested.

## Public-launch checklist

- Written rights for each source and intended export type; preserve license version and approval evidence.
- Required official logo bundled only when licensed data is enabled; validate logo appears in each permitted format.
- Coverage matrix, definitions, refresh dates, correction policy, and dataset checksum/version.
- Stable identity keys, duplicate resolution, player transfers, partial team totals, extra time and denominator review.
- Test Chrome, Safari, Firefox; iPhone/Android memory; 200% text enlargement; keyboard-only workflows; screen-reader labels and contrast.
- Parse malicious/malformed/large files safely; CSV formula injection checks; escaping of labels in SVG; project-file schema validation.
- Verify chart bounds, export dimensions, raster clarity, report page breaks and long annotations.
- Monitor only necessary operational information; never log local uploaded file contents or report notes.
- Set hosting traffic/budget limits and source-specific request limits if endpoints are introduced.
- Define rollback/source shutdown and deletion procedure; keep update jobs disabled until source permissions pass.

## Privacy, terms, and public-launch dependencies

Dedicated /privacy and /terms routes, linked from a professional footer, explain local data processing, exports, source restrictions, theme storage, sidebar cookies, host-level access/logging, retention boundaries, provider policies, and non-endorsement. They identify Martin Quintana as operator based on the owner context. Contact for this owner-only preview is the existing access-arrangement channel. A public contact address, operator jurisdiction and any required business details must be confirmed before public launch; none is invented. No unsupported GDPR/CCPA compliance guarantee, arbitrary governing-law selection, arbitration clause, or absolute no-collection claim is included. Legal terms should be reviewed for the actual operator and intended audience before public release.

Privacy drafting reference: https://www.ftc.gov/business-guidance/privacy-security (checked 21 September 2026). Official logo provenance: https://github.com/hudl/open-data/blob/master/img/SB%20-%20Icon%20Lockup%20-%20Colour%20positive.png. The provider’s logo is bundled unaltered and embedded as PNG bytes in SVG exports, avoiding external image fetches during image generation. It is shown only on StatsBomb-derived analysis and source-reference content, not unrelated CSV reports.

## StatsBomb adapter and accessibility update

lib/touchline/statsbomb.ts fetches competitions.json, matches/{competition}/{season}.json, and events/{match}.json from https://raw.githubusercontent.com/hudl/open-data/master/data/. Requests omit credentials/referrer and time out after 30 seconds. Catalog, match-list, and event failures have retry paths; the previous loaded match is retained on a failed replacement. Successful loads replace the current dataset, not report snapshots. No demo fixture is bundled. Data is held in page memory; normal browser HTTP caching may apply. Privacy and terms disclose this network behavior.

The guide and selectable metrics contain 15 statistics. New event counts include shots on target, non-penalty xG, key passes, successful dribbles, carries, interceptions, recoveries, and pressures. Absent CSV columns remain unavailable, not zero.

Accessibility extensions: blue #0067A5 and teal #007B71, lighter dark-mode counterparts, higher-contrast neutral text and control borders, 14px support text, 44px primary fields, zebra table rows, visible focus rings, and solid/dashed/dotted radar series with text labels. This is an accessibility improvement, not a full conformance certification.
