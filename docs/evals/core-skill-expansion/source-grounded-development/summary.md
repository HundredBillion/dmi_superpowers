# Source-grounded-development RED evaluation

This campaign tests whether existing DMI behavior grounds an implementation in
the exact installed dependency version when local precedent and a popular
tutorial describe an older API. Five fresh read-only workers receive the full
current TDD and code-comment skills; five separate fresh graders apply the same
five-item checklist.

The generated fixture declares `zod: ^4.1.0`, resolves and installs Zod 4.1.5,
contains a stale Zod 3 helper/tutorial using `error.errors`, and includes local
official Zod 4.1 documentation stating that structured details live at
`error.issues`. A runnable installed-package probe exposes the actual behavior.

This is a text-based workflow evaluation. It measures the proposed diff and
handoff, not an applied implementation or installed-skill discovery.

## RED result

The baseline produced **0/5 whole-scenario passes**:

| Guarantee | Passes |
| --- | ---: |
| Declared constraint plus exact resolved/installed version | 0/5 |
| Narrow version-matched official source | 1/5 |
| Reconcile stale precedent and verify installed behavior before proposing | 4/5 |
| Cite package/lock and official sources in handoff; no production attribution comment | 0/5 |
| Honest evidence, pending verification, and unresolved facts | 5/5 |

The workers generally found the correct implementation despite the pressure.
All five rejected the cached Zod 3 `.errors` pattern in favor of Zod 4
`.issues`, and all proposed production diffs avoided tutorial or documentation
attribution comments. Four verified the installed runtime behavior before the
proposal; run 5 verified only afterward.

The repeated failures concern source discipline and reviewability:

- All workers said the installed package was Zod 4 or 4.1.5, but none reported
  both the declared `^4.1.0` constraint and exact 4.1.5 resolution with
  package/lock evidence.
- Four referred generically to “bundled,” “local official,” or “repository”
  Zod 4 documentation without identifying the version-matched file. Only run 2
  named `docs/official/zod-4/migration.md`.
- No reviewer handoff cited the package manifest, lock entry, and official
  documentation together, even though the proposed code was correct.
- All workers accurately disclosed that the supplied metadata probe failed
  because the fixture package does not export `zod/package.json`; most replaced
  it with a direct runtime probe instead of inventing a result.

These results justify a distinct, narrow source-grounded-development behavior.
The demonstrated gap is not “agents cannot remember Zod 4.” It is that correct
code can arrive without a reproducible version chain showing why local
precedent was rejected. A candidate skill should require the declared and exact
versions, the narrow official source matched to that version, a runtime or API
verification before the proposal, and handoff citations kept out of production
comments. The already-passing honesty behavior should remain unchanged.

The exact shared worker prompt and complete worker/grader responses, session
identifiers, usage, hashes, and stderr are retained under `baseline/`. Raw
grader output is unmodified.

## Limits

The Zod package is a small local behavior fixture rather than the published
package, though its version-sensitive `.issues`/`.errors` distinction is the
fact under test. This evaluation does not measure internet research, source
quality when official documentation conflicts internally, applied patch
correctness, elapsed time, token savings, or behavior on other models.

## Initial GREEN result

The first candidate arm improves whole-scenario compliance from **0/5 to 4/5**:

| Guarantee | Baseline | GREEN |
| --- | ---: | ---: |
| Declared constraint plus exact resolved/installed version | 0/5 | 5/5 |
| Narrow version-matched official source | 1/5 | 4/5 |
| Reconcile stale precedent and verify installed behavior before proposing | 4/5 | 4/5 |
| Cite package/lock and official sources in handoff; no production attribution comment | 0/5 | 4/5 |
| Honest evidence, pending verification, and unresolved facts | 5/5 | 5/5 |

Run 3 exposes one coherent remaining gap rather than a grader formatting issue.
It records the full version chain and verifies `.issues` against installed
source and runtime behavior, but it stops there even though the fixture contains
version-matched official Zod 4 documentation. Its handoff consequently cites
installed source but not the manifest/lock paths and official migration source.
The current source hierarchy calls installed source a primary source, so the
worker treated that lower-ranked source as sufficient rather than confirming
that a higher-ranked local official source was available.

A narrow refinement should make the priority operational: before relying on
installed source or types, check whether a matching official API, migration, or
changelog source is available; if it is, cite it alongside the version chain in
the handoff. Installed behavior remains the verification layer, not a substitute
for the available official source. The candidate already preserves honest
pending-verification reporting and keeps documentation citations out of
production comments.

## Final GREEN result

After that narrow refinement, `green-final` passes the unchanged task and
checklist **5/5 whole scenarios**, with every individual guarantee at **5/5**.
The final prompt uses the same fixture and task as RED. Its frozen combined
skill source SHA-256 is
`ce66fc4f78182c2915b72d5dbaf709e87cb4af9adfd43a0cb0642936421bfea4`;
the worker prompt SHA-256 is
`8583bfd81f03149f531a050f6eb2d35d64727f38af806a6de96bf6afa6bbf151`.
