# Offer Book Squad

Agnostic (standalone-ready) squad for architecting **irresistible offers** (Grand Slam
Offers). `workspace_integration.level: none` — it reads no business workspace; all inputs
(product, ICP, price, transformation) are provided at call time.

## Entry

`/offer-book:offer-architect` — the Offer Architect.

## Method

Value Equation `(dream × likelihood) / (time × effort)` + Grand Slam components
(core offer, bonus stack, guarantees, real scarcity/urgency, naming).

## Output

A draft offerbook entry (`templates/offerbook-entry-tmpl.yaml`) at
`outputs/offer-book/{slug}/offerbook-entry.yaml`.

## Integrity

Real proof only — gaps are marked `# gap: needs proof`, never fabricated. Scarcity and
urgency must be truthful and enforceable.

## Provenance

Greenfield build seeded from the Hormozi offer methodology (`hormozi-offers` agent) and the
`offerbook-entry` template, distilled into a self-contained squad with no DNA/workspace
dependencies. See `docs/stories/STORY-EXPORT-SQUAD.md`.
