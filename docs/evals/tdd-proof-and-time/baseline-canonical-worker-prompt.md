You are working in a coding session. The following skill is active; follow it.

--- BEGIN SKILL ---
---
name: test-driven-development
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

## Philosophy

**Core principle**: Tests should verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't.

**Good tests** are integration-style: they exercise real code paths through public APIs. They describe _what_ the system does, not _how_ it does it. A good test reads like a specification - "user can checkout with valid cart" tells you exactly what capability exists. These tests survive refactors because they don't care about internal structure.

**Bad tests** are coupled to implementation. They mock internal collaborators, test private methods, or verify through external means (like querying a database directly instead of using the interface). The warning sign: your test breaks when you refactor, but behavior hasn't changed. If you rename an internal function and tests fail, those tests were testing implementation, not behavior.

See [tests.md](./tests.md) for examples and [mocking.md](./mocking.md) for mocking guidelines.

## Anti-Pattern: Horizontal Slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

When exploring the codebase, read `CONTEXT.md` (if it exists) so that test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

Before writing any code:

- [ ] Confirm with user what interface changes are needed
- [ ] Confirm with user which behaviors to test (prioritize)
- [ ] Identify opportunities for deep modules (small interface, deep implementation) — run the `dmi-superpowers:codebase-design` skill for the vocabulary and the testability checks
- [ ] List the behaviors to test (not implementation steps). For each one, add its failure path
      (the dependency errors, times out, or returns empty or malformed data) and its repeat path
      (a second call, a retry, a failure after an earlier success)
- [ ] Get user approval on the plan

**An approved approach is not an approved behavior list.** When the user has already approved *how*
to test, still write the behavior list, failure and repeat paths included, before the tracer bullet.
Skipping the list is where failure paths get lost: every test passes and the untested path ships.

Ask: "What should the public interface look like? Which behaviors are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer Bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

### 3. Incremental Loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior

### 4. Refactor

After all tests pass, look for [refactor candidates](./refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Comments explain WHY in concise, plain prose — intent a non-developer follows, with technical detail (constants, failure modes) kept alongside; none point to Jira/ADR/plan/spec files
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

## Checklist Per Cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Code is minimal for this test
[ ] No speculative features added
```
--- END SKILL ---

Task: Review the following proposed regression-test plan for an HTTP proxy bug. This is a bounded plan review only: do not write code, read files, or request further approval. The public API and behavior list below are already approved; identify necessary changes and give a revised short test sequence.

Approved behaviors: an upstream error body stops reading at 8 KiB even when EOF never arrives; an independent error-body deadline handles shorter stalled bodies; a later request still works after either path. The observable error response is status 424 mentioning upstream HTTP 503; body text is included only when reading finishes before the deadline. Production defaults must stay unchanged.

Repository facts: the HTTP integration fixture RawErrorUpstream already exists in testing/ and a second test package has its own equivalent; the proposed new test would add a third copy. testing/ also contains UpstreamSignals.headersSent, bodyWritten, readerStopped and releaseBody, plus a ManualScheduler.advanceBy and advanceUntilIdle. The existing integration fixture can accept the scheduler. A real-socket smoke test remains necessary. The whole suite runs on every push.

Proposed plan: first add all three regression cases, then implement the fix. For the 8 KiB case send exactly 8 KiB of x and hold the body open, use a 10 ms error-body deadline, sleep 20 ms so the server should have sent its body, and assert only status 424 and text HTTP 503. The deadline alone produces that same response if the cap is removed. For the short stalled-body case the ManualScheduler field is currently uninitialized, so the first run throws TypeError before making a request; record that as RED and implement the cap. Copy the new raw-socket fixture locally to avoid touching shared helpers. Use headersSent as the cue to start the 10 ms real-socket smoke-test deadline; the server writes headers and body separately. Run the complete suite once after implementation and call it done if green.

What would you keep or change, and what sequence would you actually follow?

Do the task. Show your work.
