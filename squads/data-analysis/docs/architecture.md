# Data Analysis — Architecture

Single-agent, self-contained squad (`level: none`). Rebuild-greenfield of the
workspace-coupled `data` squad as a standalone analyst.

- **data-analyst** (entry) — analyzes datasets provided at call time.
- Method ref: `data/methods.yaml` (profiling, descriptive, patterns, integrity rules).
- Output: draft analysis report per `templates/analysis-report-tmpl.md` → `outputs/data-analysis/{slug}/`.
- Quality gate: `checklists/analysis-quality-checklist.md`.

Key difference from the legacy `data` squad: that one was `workspace_first` (read business
data from the business workspace). This one takes data as a call-time input — no workspace.

Portable: passes export-squad PORTABLE + activation-test. See `docs/stories/STORY-EXPORT-SQUAD.md`.
