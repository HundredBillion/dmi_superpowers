# Core skill expansion evaluation

This directory records content-simulation evaluations for four new DMI skills.
Each campaign used five fresh workers and independent graders against a focused
fixture; complete prompts, transcripts, hashes, and adjudications remain in the
skill's directory.

| Skill | RED whole-scenario | Final whole-scenario | Evidence |
|---|---:|---:|---|
| `variant-analysis` | 0/5 | 5/5 adjudicated* | [record](variant-analysis/README.md) |
| `source-grounded-development` | 0/5 | 5/5 | [record](source-grounded-development/summary.md) |
| `migrating-safely` | 0/5 | 4/5 adjudicated | [record](migrating-safely/summary.md) |
| `property-based-testing` | 0/5 | 4/5 raw final-2 | [record](property-based-testing/summary.md) |

\* Variant analysis scored 4/5 raw in the final run; manual adjudication found
the remaining failure was a grader false negative, with all five workers meeting
the substantive guarantees. Migration's remaining misses are documented rather
than hidden: one worker blocked on an attribution gap, and one kept dual-field
output after the stop phase. These are rollout-fixture limitations to address in
future refinement, not evidence to claim a perfect result.

These are content simulations, not proof of installed trigger behavior, coding
quality, token savings, or wall-clock speed. Reinstall the plugin before live
verification in a harness.
