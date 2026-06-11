# Offer Book — Architecture

Single-agent, self-contained squad. No workspace dependency (`level: none`).

- **offer-architect** (entry) — builds Grand Slam Offers from call-time inputs.
- Method ref: `data/offer-frameworks.yaml` (Value Equation, guarantee types, scarcity/urgency, naming).
- Output: draft offerbook entry per `templates/offerbook-entry-tmpl.yaml` → `outputs/offer-book/{slug}/`.
- Quality gate: `checklists/value-equation-checklist.md`.

Portable: passes export-squad PORTABLE + activation-test. See `docs/stories/STORY-EXPORT-SQUAD.md`.
