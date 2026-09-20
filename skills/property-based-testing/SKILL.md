---
name: property-based-testing
description: Use when a parser, serializer, normalizer, comparator, reversible transformation, numeric operation, or state transition should be tested over an input domain rather than only hand-picked examples
---

# Property-Based Testing

## Choose the Test Shape

Use property based testing when a behavior has a rule that can be checked for
many generated inputs. Good shapes include:

| Shape | Example property |
| --- | --- |
| Round trip | `decode(encode(x)) == x` |
| Normalization | `normalize(normalize(x)) == normalize(x)` |
| Invariant | state constraints hold before and after a transition |
| Oracle | implementation agrees with a simpler trusted reference |
| Ordered result | `is_sorted(sort(xs))` and elements are preserved |

If the behavior has no independent property or oracle, use focused examples and
say why property based testing is a poor fit. “Does not crash” alone rarely
justifies a generator.

## Design the Property

The assertion must constrain the implementation without reimplementing it.
Reject these false tests:

- **Tautology:** the expected value repeats the same calculation as the code
  under test.
- **Vacuity:** assumptions discard nearly all generated inputs, or contradictory
  assumptions run zero cases.
- **Example disguise:** a property wrapper still tests only one fixed fixture.

State what the property means independently, then choose the strongest check the
domain supports. A round trip may be invalid for a lossy normalizer; specify the
canonical result instead.

## Generate the Domain

Build generators from valid structure rather than filtering arbitrary values.
Include boundary and adversarial partitions relevant to the contract: empty
values, one element, duplicates, maximum sizes, Unicode, delimiters,
malformed input, null-like values, negative or large numbers, and combinations
of fields. Before implementation, write a partition table (at minimum: empty,
normal, representation-specific, and malformed inputs) and state which
partitions the generator reaches; a proposed property that omits a contract
partition is incomplete even if a focused example covers one defect. Add a
small number of explicit examples for known boundary cases.

Keep generation deterministic in CI while retaining enough variety to explore
the domain. Set a bounded example count and deadline appropriate to the suite.
Do not replace domain generation with a fixed corpus or a single seed merely to
make a failing test disappear.

## Preserve Counterexamples

Use the library's shrinking or minimization support. A failing case must be
replayable from the reported seed/case and reduced to the smallest useful input.
Record the property, minimized input, and whether the defect is in the code,
the generator, or the property. Do not accept a larger random sample as a
substitute for a reproducible counterexample.

## Dependency and Execution Boundaries

If the project already has a property testing library, use its established
runner and conventions. Adding one is a dependency decision: propose the
library and the concrete property first, then wait for the required approval.
The dependency decision may block execution, but it does not turn the property
into an example-only test: record the generator, shrinking/replay plan, and
pending command so the property can be implemented after approval.

The property is the tracer bullet for this behavior. A single example may
supplement it, but “highest-value example first” is not completion when the
identified contract is a domain-wide property.

When tests have not run, report the exact command and mark it pending. Do not
claim generated cases, shrinking, coverage, or a passing suite from a proposed
test.

## Review Checklist

- [ ] The property is independent of the implementation and matches the domain.
- [ ] The generator reaches valid boundaries without broad `assume` filtering.
- [ ] Empty, malformed, and representation-specific cases are covered where
      the contract permits them.
- [ ] Shrinking produces a minimal replayable counterexample.
- [ ] The test is deterministic, bounded, and uses the project's library or an
      explicitly approved dependency.
- [ ] Existing examples remain useful as named regression cases.
- [ ] If a dependency is pending, the property and generator design remain
      explicit rather than being replaced by a fixed example or corpus.
