# Task: Build Grand Slam Offer

**Executor:** offer-architect
**Inputs (call-time):** product/service description, ICP, price point, transformation promised, available proof/assets (optional).
**Output:** `outputs/offer-book/{slug}/offerbook-entry.yaml` (lifecycle: draft)

## Steps

1. **Gather inputs.** Confirm: what's sold, who for (ICP), price, dream outcome. Ask for any missing item — do not assume.
2. **Score the Value Equation.** Rate dream outcome, perceived likelihood, time delay, effort/sacrifice (1–5 each). Compute the directional Value Score.
3. **Enumerate obstacles → solutions.** List every obstacle between ICP and dream outcome; convert each to a deliverable.
4. **Choose delivery vehicles.** For each solution pick format (1:1 / group / DFY / DWY / tooling) balancing perceived value vs. cost-to-deliver.
5. **Stack bonuses.** Add high-perceived-value bonuses; each names the objection it dissolves.
6. **Design the guarantee.** Pick the strongest defensible guarantee; state exact terms.
7. **Add real scarcity/urgency.** Only truthful, enforceable limits.
8. **Name the offer.** Benefit-led candidates; pick one, list 2 alternates.
9. **Emit the offerbook entry** per `templates/offerbook-entry-tmpl.yaml`. Mark proof gaps with `# gap: needs proof`.

## Done criteria

- All 4 Value Equation levers scored with rationale.
- Guarantee + ≥1 bonus + at least one real scarcity/urgency mechanism present.
- No fabricated proof; gaps explicitly marked.
- Output validates against the template; lifecycle = `draft`.
