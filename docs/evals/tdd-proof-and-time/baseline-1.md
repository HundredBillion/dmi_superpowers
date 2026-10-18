Keep the three regression scenarios, the required real-socket smoke test, and unchanged production defaults. Change the evidence each test provides and build them one at a time.

The proposed plan has several gaps:

- **The cap test can pass without a cap.** Status 424 mentioning HTTP 503 proves nothing about why reading stopped. With the upstream held open, assert that reading completes before advancing the deadline, includes the captured body, and stops at 8 KiB. Include distinguishable bytes beyond the boundary to expose over-reading.
- **A fixture exception is not a valid RED.** Initialize and inject `ManualScheduler` first. The failing test must reach the request and fail because the approved behavior is missing.
- **Use the existing fixture and signals.** Extend or reuse `RawErrorUpstream` rather than adding a third copy. Use `bodyWritten` for body readiness and `readerStopped` for termination. `headersSent` cannot establish that the separately written body is available.
- **Replace sleeps with coordination.** Use signals and manual time in regression tests. Give the real-socket smoke test a generous test-specific deadline and synchronize body delivery; a 10 ms timing window is fragile on every-push CI. Preserve the production deadline’s start semantics.
- **Prove recovery after both termination paths.** Make a later request through the same proxy after each case, before releasing the stalled upstream body. Release fixture gates in cleanup even when assertions fail.

I would follow this sequence:

1. **Cap tracer bullet:** configure the shared fixture and scheduler; send 8 KiB plus a distinguishable suffix and keep EOF withheld. Await `bodyWritten`. Without advancing time, require `readerStopped`, status 424 mentioning upstream HTTP 503, and exactly the permitted captured body. Observe a meaningful failure, implement the minimum cap fix, and rerun.
2. **Recovery after the cap:** add a successful later request through the same proxy while the first upstream remains held open. Run it and fix any demonstrated failure.
3. **Independent deadline:** send a short body and stall. Await `bodyWritten`, verify the response remains pending before expiry, then advance the scheduler through the deadline. Require termination and status 424 mentioning HTTP 503, with no captured upstream body text. Observe the behavior failure before fixing it; if it already passes, retain it as coverage.
4. **Recovery after the deadline:** add the later successful request while the stalled body remains held open. Run and fix as needed.
5. **Real-socket smoke:** retain a focused check with coordinated delivery and generous timing, using test-only configuration.
6. Run focused tests after each change, refactor only while green, then run the complete suite.

The decisive distinction is observable: **the cap completes without deadline advancement and includes bounded body text; deadline expiry completes a shorter stalled read and omits that text.**
