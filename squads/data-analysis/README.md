# Data Analysis Squad

Agnostic (standalone-ready) squad for **call-time dataset analysis**.
`workspace_integration.level: none` — it reads no business workspace; the dataset and
business question are provided at call time (file path, pasted data, JSON, or query result).

## Entry

`/data-analysis:data-analyst` — the standalone Data Analyst.

## Method

Frame → profile → data quality → descriptive stats → patterns/anomalies → insights →
next steps. Method reference in `data/methods.yaml`.

## Output

A draft analysis report (`templates/analysis-report-tmpl.md`) at
`outputs/data-analysis/{slug}/analysis-report.md`.

## Provenance

Rebuild-greenfield of the workspace-coupled `data` squad (which was `workspace_first`),
re-designed to take data as a call-time input with zero workspace dependency.
See `docs/stories/STORY-EXPORT-SQUAD.md`.
