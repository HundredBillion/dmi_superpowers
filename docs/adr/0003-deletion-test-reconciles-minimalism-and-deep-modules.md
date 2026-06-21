# The deletion test reconciles ponytail minimalism with deep modules

We are adding a persistent minimalism skill (`ponytail`) whose instinct is to *delete*
abstractions, alongside existing skills (`codebase-design`, `improve-codebase-architecture`)
built on Ousterhout **deep modules**, whose instinct is sometimes to *add* an abstraction that
hides complexity. To stop the two giving opposite advice on the same code, both are anchored to
the **deletion test** that `improve-codebase-architecture` already ships: delete the thing — if
complexity vanishes or merely moves, it was a **shallow**/speculative module, so cut it
(ponytail / YAGNI); if complexity *concentrates* because the thing was hiding real work, it is a
**deep module**, so keep it.

## Considered Options

- **Keep "genuinely complex" as its own standalone notion** (the PRD's first draft). Rejected:
  it introduces a second, fuzzy vocabulary parallel to the existing deep/shallow terms, which
  drift apart and reproduce the very contradiction we are trying to remove.
- **Import ponytail's "delete abstractions" philosophy raw.** Rejected: read literally it
  contradicts `codebase-design`'s case for deepening, and an agent would receive opposite
  guidance from two skills.

## Consequences

The rule is embedded in `ponytail`, in `requesting-code-review`'s `code-reviewer.md`, and in
`improve-codebase-architecture`, all referencing `codebase-design`'s deletion test as the single
boundary test. One philosophy, one vocabulary, across four skills.
