# touchline-dashboard
A browser-based football analysis workspace. Load a StatsBomb match, compare players or teams, create charts, assemble a report, and export your work.

No application accounts, database, API key, or server-side report storage are required. This repository uses **React**, **TypeScript**, and **Vite**.

![Argentina vs France analysis](/docs/review-statsbomb.jpg)

## Features

- **StatsBomb Open Data:** choose an available competition, season, and match. Events load directly from the official repository.
- **15 statistics:** goals, assists, shots, expected goals, pass attempts, tackles, pass completion, shots on target, non-penalty xG, key passes, successful dribbles, carries, interceptions, ball recoveries, and pressures.
- **5 chart types:** scatter, bar, date trend, percentile radar, and shot map.
- **Analysis controls:** player/team views, filters, totals or player per-90 values, sortable tables, selectable columns, and comparisons of up to three entities.
- **Reports:** combine up to 12 chart snapshots, reorder them, add notes, and print or save as PDF.
- **Exports:** PNG, SVG, configuration JSON, and CSV for permitted local sources. StatsBomb raw CSV export is disabled.
- **Local imports:** player-match CSV files up to 5 MB / 10,000 rows; file contents stay in the browser.
- **Accreditation:** the official StatsBomb logo is embedded into StatsBomb-derived charts and report images.
- **Display:** persistent light/dark preference, responsive grids, complimentary color palette, and shape/pattern distinctions.

## How to Use

1. Select a **Competition / season** and **Match**, then choose **Load match**.
2. Filter the loaded data and select a chart type and metric.
3. Select table rows to compare players or teams. Team views use totals.
4. Export the chart, or choose **Add to report** to preserve a snapshot.
5. In Report builder, reorder charts and use **Print / save PDF**.

A new match replaces the current dataset but preserves existing report snapshots. Closing or reloading the page clears the session. Export before leaving.\
Project JSON files contain chart configuration and filters, not the underlying data or report pages. Load the original dataset before restoring a project.

## Data and calculation details

Data comes from [StatsBomb Open Data](https://github.com/hudl/open-data), currently accessed at `raw.githubusercontent.com/hudl/open-data/master/data/`.

- Only competition/seasons and matches actually available in that repository appear.
- **One match loads at a time.** Full-season aggregation, live feeds, tracking data, and 360 views are not implemented.
- Match periods 1–4 are included; penalty shoot-outs are excluded.
- Playing time uses starting lineups, substitutions, dismissals, and period timestamps, including stoppage time and extra time. It can differ from published rounded minutes. Temporary off-field absences are not modeled.
- Player goals exclude own goals. Summed player goals may therefore differ from the match score.
- Missing imported metrics remain unavailable; they are not silently converted to zero.
- Per-90 values use recorded player minutes. Pass completion is a ratio of completed to attempted passes, not an average of percentages.
- Percentiles describe the loaded, filtered cohort, not the entire competition.
- Trend charts become more useful with multi-match CSVs; one loaded match produces one date point.
- Position labels describe the starting/substitution role, not a time-weighted tactical role.

Definitions and caveats are also available in the in-app Metric Guide. Provider outages, changed files, or rate limits can interrupt loading; the interface reports failures without replacing the last successfully loaded dataset.

## CSV format

Required columns:

```text
player,team,position,competition,season,date,minutes
```

Optional columns:

```text
goals,assists,shots,xg,passes,completed,tackles,sot,npxg,key_passes,dribbles,carries,interceptions,recoveries,pressures
```

Use one player/team/match-date per row, dates in `YYYY-MM-DD` format, and blank cells for unknown values. Download the full header template from **Import CSV**. This CSV format does not include shot coordinates; shot maps use the StatsBomb event adapter. Label StatsBomb-derived imports as StatsBomb so required attribution follows their outputs.

## Project structure

| Path | Purpose |
| --- | --- |
| `main.tsx` | React entry point; selects workspace, privacy, or terms page |
| `index.html`, `privacy/index.html`, `terms/index.html` | Static page entry points |
| `app/page.tsx` | Analysis workspace, report builder, references, and import/export controls |
| `app/globals.css` | Shared themes, grids, contrast, responsive and print styles |
| `app/privacy/page.tsx`, `app/terms/page.tsx` | Policy content to review for your deployment |
| `components/touchline/` | Charts, theme controls, and shared legal layout |
| `components/ui/`, `hooks/` | Shared interface primitives and hooks |
| `lib/touchline/statsbomb.ts` | Provider requests and event normalization |
| `lib/touchline/data.ts` | Metrics, aggregation, formatting, percentiles |
| `lib/touchline/csv.ts` | Local CSV validation and downloads |
| `lib/touchline/policy.ts` | Source attribution and export restrictions |
| `lib/touchline/branding.ts` | Embedded official logo for portable chart exports |
| `lib/touchline/paths.ts` | Base-path-aware local links and assets |
| `public/` | Favicon, official logo, and downloadable architecture |
| `.github/workflows/deploy.yml` | GitHub Pages build/deployment workflow |
| `docs/` | Architecture, QA history, and screenshots |

- [Architecture and phased roadmap](/docs/ARCHITECTURE.md)
- [QA history](/docs/QA.md)

## Data Collection 

Research data, uploaded files, notes, and reports are processed in browser memory. There is no application upload endpoint, database, analytics service, or advertising integration. Theme preference is stored locally; the sidebar component may set a navigation-preference cookie. \
No data whatsoever is collected, besides the navigation-preference cookie. All user-uploaded data, final reports, and curated dashboards are all gone once the browser's session ends.

## Attribution and Licensing

This is an independent project and is not endorsed by StatsBomb or Hudl. Data access is subject to the applicable [StatsBomb provider agreement](https://github.com/hudl/open-data/blob/master/LICENSE.pdf). Preserve the StatsBomb brand logo and source credit on published analysis. The application supports noncommercial research and disables raw StatsBomb CSV exports; those implementation choices do not grant broader data rights. \
See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). No new open-source license has been chosen for the application code.
