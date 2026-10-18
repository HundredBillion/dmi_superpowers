Below is a transcript of an agent doing a task. Answer each checklist item
strictly PASS or FAIL based only on what the transcript shows.

Checklist:
G1: Explicitly rejects the uninitialized-scheduler TypeError as valid RED, requires correcting setup, and verifies that each new test fails for the intended missing behavior before implementing it.
G2: Explicitly rejects status 424/HTTP 503 alone as proof of the cap, requires a cap-specific observable assertion such as all 8 KiB of body bytes, and verifies failure with the cap absent/disabled while ruling out the deadline as an alternative pass mechanism.
G3: Explicitly replaces fixed sleep and tiny real deadlines with controlled clock/scheduler and explicit signal ordering for timeout coverage, and requires generous bounded real-socket integration waits without assuming quick scheduling or atomic delivery.
G4: Explicitly reuses/searches existing upstream fixture and signal helpers instead of adding a third copy, and accounts for recurring suite runtime cost.

Transcript:
Keep the three approved behaviors and the real-socket smoke test. Change how the tests distinguish those behaviors and establish RED.

- **Make the cap test discriminate.** Exactly 8 KiB followed by an open connection is useful. Wait for `bodyWritten`, keep the manual deadline pending, and assert status 424, `HTTP 503`, and the captured 8 KiB of text. Confirm `readerStopped` before advancing the deadline. Status and upstream status alone cannot distinguish the cap from the deadline.
- **Test the independent deadline.** Initialize and inject `ManualScheduler` before making the request. Send a shorter body and hold it open. Wait for `bodyWritten`, advance the deadline, then assert 424 mentioning `HTTP 503`, without the partial body text, and confirm reading stops.
- **Reject the proposed RED.** An uninitialized scheduler throwing `TypeError` proves a broken test setup. RED must reach the request and fail because the approved behavior is missing.
- **Reuse `RawErrorUpstream`.** Add the needed scheduler wiring to the existing fixture; avoid a third copy. Reconciling the two existing copies can remain separate work.
- **Remove timing guesses.** Use signals and manual time for deterministic coverage. For the real-socket smoke test, `headersSent` is too early because the body is written separately. Coordinate with `bodyWritten`, use a generous timing margin, and avoid narrow elapsed-time assertions.
- **Verify recovery and cleanup.** After each stopping path, make a successful later request through the same proxy instance. Release held bodies in teardown even when assertions fail.
- **Preserve production defaults.** Supply test timing through the fixture’s existing injection seam.

I would follow this sequence:

1. Wire the shared fixture and initialize the scheduler so the test can reach the proxy.
2. Add **one cap regression**, including the later successful request. Observe a failure attributable to missing cap behavior, implement the minimum fix, and rerun it to GREEN.
3. Add **one short-body deadline regression**, including recovery after the deadline. Observe the relevant failure, implement the minimum deadline behavior, and rerun to GREEN.
4. Add or retain the coordinated real-socket smoke test. Run the focused integration tests after any changes.
5. Refactor only while GREEN, rerun affected tests, then run the complete push suite.

The key evidence is that the cap test succeeds **before the deadline fires**, while the shorter stalled-body test succeeds **because the deadline fires**. A green suite without that distinction would leave the original bug insufficiently guarded.

Output: one line per checklist item, `PASS` or `FAIL`, then a one-line reason.
