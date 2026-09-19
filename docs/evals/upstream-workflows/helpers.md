# Workflow helper regression checks

Baseline: DMI `a293803`. Run date: 2026-09-19.

These are executable integration tests of the bundled scripts, separate from the
skill content simulations in this directory. Each test creates a temporary Git
repository; polluter tests put a controlled `npm` executable on the fixture's
PATH. They do not run an external application's test suite.

## Baseline observations

The initial eight-case suite failed seven cases against the original scripts.
The rejection-only review test passed for the wrong reason: the original command
interpreted the new three-argument call as its old signature. The final test
checks the specific failure diagnostics to avoid counting an argument error as
range validation.

Two independent probes before implementation also reproduced the defects:

- `find-polluter.sh pollution 'src/**/*.test.ts'` in a fixture containing both
  `src/top.test.ts` and `src/nested/child.test.ts` printed `Found 1 test files`,
  ran neither test, then printed `all tests clean` and exited zero.
- `review-package HEAD HEAD <temporary-output>` exited zero and emitted an
  empty commit list and diff.

## Final coverage

Run `node --test tests/workflow-helpers.test.js` from the repository root.

- Canonical plan identity, symlink aliases, same-basename isolation, and legacy
  workspace preservation.
- Unknown ownership at a plan's expected workspace path: preserve the contents,
  select a new directory, and reuse that owned directory on the next call.
- Valid task extraction, invalid task identifiers, and path-only handoffs.
- Identical commits, non-commit objects, divergent ancestry, and a nonempty
  commit history whose net diff is empty.
- Annotated tags and review coverage across every commit in a task.
- Helper-to-helper calls after executable bits have been removed.
- Top-level and nested test discovery, optional `./`, filenames containing
  spaces, and mixed zero-depth recursive wildcard segments.
- Zero matches, failed test commands, preexisting pollution, and pollution
  produced by a failing test all remain distinguishable from a clean run.

The expanded suite passes 12/12 cases. Targeted ShellCheck and shell syntax checks
also pass. CI now runs this suite on pushes and pull requests.

Limit: the polluter still invokes `npm test <file>`; projects with a different
runner need an adapted invocation. These checks do not establish compatibility
with every npm test framework or certify installed skill activation.
