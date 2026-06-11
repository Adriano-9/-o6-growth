# Task: Analyze Dataset

**Executor:** data-analyst
**Inputs (call-time):** dataset (file path / pasted / payload / query result) + business question.
**Output:** `outputs/data-analysis/{slug}/analysis-report.md` (lifecycle: draft)

## Steps

1. **Frame** the business question; define what a useful answer looks like.
2. **Profile** the data: shape, types, ranges, missing %, duplicates, units.
3. **Assess data quality**; flag issues and their impact on conclusions.
4. **Describe** relevant variables (central tendency, spread, distribution); segment if it changes the story.
5. **Find patterns**: correlations, trends, groupings, anomalies; name visible confounders.
6. **Synthesize** 3–7 decision-relevant insights, each with confidence + evidence.
7. **Next steps** to raise confidence (collect/clean/test).
8. **Emit** the analysis report per `templates/analysis-report-tmpl.md`.

## Done criteria

- Data profiled and quality assessed on the real data provided.
- Insights tagged with confidence and tied to evidence.
- No fabricated values; data/analysis limits stated.
- Output validates against the template; lifecycle = draft.
