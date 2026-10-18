Keep the approved behaviors, injectable scheduler, and real-socket smoke test. Change the proposed evidence: the cap test can pass through the deadline alone, and the uninitialized scheduler’s `TypeError` does not demonstrate the bug.

I would follow this sequence:

1. **Prepare the fixture.** Reuse `testing/RawErrorUpstream`, initialize and inject `ManualScheduler`, and reuse the existing signals. Avoid a third fixture copy. Keep production defaults unchanged.

2. **Prove the cap first.** Write one test that sends exactly 8 KiB of `x` and holds the upstream body open. Coordinate through signals instead of sleeping. Keep the deadline inactive and assert that reading stops, the response is 424 mentioning upstream HTTP 503, and the bounded body text is included. This distinguishes the cap from the deadline fallback. Run against unfixed code and observe the intended failure; then implement the minimum fix and rerun.

3. **Prove recovery after the cap.** Add a subsequent request through the same proxy and assert its expected successful response. Observe RED before changing implementation if recovery needs a fix.

4. **Prove the independent deadline.** Send a shorter body and stall. Wait for explicit readiness, advance virtual time to just before the deadline and verify the request remains pending, then cross the deadline. Assert 424 mentioning upstream HTTP 503, with the partial body omitted. Observe the intended RED, implement only what is needed, and rerun.

5. **Prove recovery after the deadline.** Make another request through the same proxy and verify success. Keep this incremental rather than writing every case before implementation.

6. **Retain a small real-socket smoke test.** Use the shared fixture, explicit readiness signals, and generous bounded waits. `headersSent` does not establish that the client received the separately written body; even `bodyWritten` establishes sending rather than receipt. Assert observable completion and response content without depending on a 10 ms timing race.

Run each focused test during its RED→GREEN cycle, then the relevant integration tests and complete required suite after the final change. If any test passes before its behavior exists, investigate the masking mechanism; a green suite alone does not establish regression coverage. Reuse helpers and virtual time to keep the every-push suite fast.
