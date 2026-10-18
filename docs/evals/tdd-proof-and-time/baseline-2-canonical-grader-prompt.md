Below is a transcript of an agent doing a task. Answer each checklist item
strictly PASS or FAIL based only on what the transcript shows.

Checklist:
G1: Explicitly rejects the uninitialized-scheduler TypeError as valid RED, requires correcting setup, and verifies that each new test fails for the intended missing behavior before implementing it.
G2: Explicitly rejects status 424/HTTP 503 alone as proof of the cap, requires a cap-specific observable assertion such as all 8 KiB of body bytes, and verifies failure with the cap absent/disabled while ruling out the deadline as an alternative pass mechanism.
G3: Explicitly replaces fixed sleep and tiny real deadlines with controlled clock/scheduler and explicit signal ordering for timeout coverage, and requires generous bounded real-socket integration waits without assuming quick scheduling or atomic delivery.
G4: Explicitly reuses/searches existing upstream fixture and signal helpers instead of adding a third copy, and accounts for recurring suite runtime cost.

Transcript:
Keep the approved behaviors, scheduler injection, existing upstream fixture, and one real-socket smoke test. Change the plan so each test can distinguish the intended fix from a timeout or broken setup.

| Proposed choice | Necessary change |
|---|---|
| Add all tests before implementation | Work vertically: one failing behavioral test, minimal fix, then the next test. |
| Assert only 424 and HTTP 503 for the cap | Also assert the captured body is included and reading stops **before advancing the deadline**. Otherwise the timeout can make a missing cap pass. |
| Sleep 20 ms for readiness | Coordinate with `bodyWritten` and `readerStopped`; use the manual scheduler for deadline progression. |
| Treat an uninitialized scheduler’s `TypeError` as RED | Initialize the fixture first. RED must expose the intended behavior failure after a real request reaches the relevant path. |
| Copy another raw-socket fixture | Reuse or extend `testing/RawErrorUpstream` with scheduler injection. Avoid a third copy; consolidate the existing equivalent only if necessary for this work. |
| Start the smoke-test deadline from `headersSent` | Use `bodyWritten` to establish body readiness. Headers precede the separately written body and do not prove it is available. |
| Run the whole suite only at the end | Run the focused test after every change, then relevant integration tests and the complete suite once at the end. |

I would follow this sequence:

1. **Prepare working infrastructure.** Initialize the manual scheduler and reuse the shared fixture and signals. Inject test timing without changing production defaults. Ensure teardown calls `releaseBody`, including on assertion failure.

2. **Cap tracer bullet: RED → GREEN.** Send exactly 8 KiB of known text and keep EOF pending. Wait for `bodyWritten`, leaving the error-body deadline unadvanced. Require `readerStopped` and a completed 424 response mentioning upstream HTTP 503 **with the captured text included**. Use a bounded test watchdog to report failure if completion never occurs. Verify that the existing implementation fails for this behavioral reason, then implement the smallest cap fix.

3. **Short stalled body: RED → GREEN.** Send fewer than 8 KiB and keep EOF pending. After `bodyWritten`, verify the request remains pending before the deadline. Advance the scheduler across the deadline and require reading to stop and a 424 response mentioning HTTP 503 **without the partial body text**. Implement the independent deadline behavior if missing. Use bounded scheduler advancement for the boundary assertions; `advanceUntilIdle` could inadvertently fire the deadline too early.

4. **Recovery after both paths.** Extend each passing scenario with a later request that succeeds through the same proxy instance. Verify both cap completion and deadline completion leave the proxy usable.

5. **Real-socket smoke and final verification.** Keep one smoke test with a generous test-only deadline and watchdog, coordinating readiness through `bodyWritten` rather than sleeps. Account for the real deadline’s actual start point: observing body readiness does not reset a timer already running. Run focused checks during development, then the full suite, and inspect the configuration changes to confirm production defaults remain unchanged.

The decisive distinction is that the cap test completes while simulated deadline time is frozen; the short-body test completes only when that deadline is advanced.

Output: one line per checklist item, `PASS` or `FAIL`, then a one-line reason.
