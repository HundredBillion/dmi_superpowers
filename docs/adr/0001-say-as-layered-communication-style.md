# `say` is a layered communication style, invoked by imperative reference

We made `say` a communication *style* that other skills layer on, not a rigid template and
not content duplicated into each skill. `grilling`, `grill-with-docs`, and
`systematic-debugging` invoke `say` via an **imperative reference placed at the exact
moment a finding is reported** ("when you report a root cause / hypothesis, format it with
`dmi-superpowers:say`"), and keep their own structure everywhere else.

We chose this over (a) a rigid four-beat template forced uniformly onto all three skills —
which fights `grilling`, whose output is a *question*, not a finding — and over (b)
inlining a copy of the four-beat into each skill for reliability. We picked the single
source of truth (purity) over belt-and-suspenders duplication (stickiness), accepting the
risk that a soft cross-skill reference may not always fire. If imperative references prove
flaky in practice, the fallback is a short inline echo in each skill, with `say` remaining
the canonical definition.
