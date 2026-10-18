Keep the approved API, behavior list, production defaults, and real-socket smoke test. Change the test structure, failure evidence, and synchronization.

The proposed plan has several gaps:

- **The cap test can pass without the cap.** Status 424 and “HTTP 503” also result from the deadline. Keep the deadline inactive and assert that the response includes exactly the first 8 KiB of upstream body while EOF remains withheld. Sending an additional recognizable suffix can verify truncation.
- **A setup exception is not RED.** Initialize the scheduler and establish that the request reaches the intended path. The short-body test must fail because deadline behavior is missing or wrong; implementing the cap does not address that behavior.
- **Fixed sleeps do not establish readiness.** Reuse the existing signals and scheduler. `headersSent` cannot prove that separately written body bytes have reached the proxy; even `bodyWritten` only establishes the upstream write. Observe the proxy’s resulting response and reader termination.
- **A third fixture adds maintenance cost.** Reuse `testing/RawErrorUpstream` with its scheduler support. Share suitable helpers where necessary.
- **One final green run is insufficient evidence.** Observe the intended failure and success for each behavior. If the relevant fix already exists, temporarily remove it to prove the test detects its absence, then restore it.

I would follow this sequence:

1. **Cap: RED → GREEN.** Using the shared fixture and manual scheduler, send at least 8 KiB and withhold EOF through `releaseBody`. Leave the deadline unexpired. Assert a completed 424 response mentioning upstream HTTP 503, containing exactly the bounded body, and observe `readerStopped` before releasing EOF. Run against unfixed code, then implement only the needed cap behavior.
2. **Deadline: RED → GREEN.** Send a shorter body and hold it open. Explicitly advance virtual time to exercise the independent deadline. Assert 424 mentioning upstream HTTP 503 with the partial body omitted. Verify that removing deadline handling breaks this test, then implement any needed deadline correction.
3. **Recovery, one path at a time: RED → GREEN where changes are needed.** Extend coverage to issue a successful later request after the cap path, then after the deadline path. Verify its actual response through the public API. Keep the stalled upstream controlled until the relevant stop assertions are complete.
4. **Real-socket smoke test.** Exercise the cap with EOF withheld and a generous error-body deadline. Require the bounded body in the response so a deadline fallback cannot satisfy the test. Use signals for coordination and generous bounded waits for completion; avoid a 10 ms timing race.
5. **Finish verification.** Run focused tests throughout, refactor only while green, then run the complete suite. Confirm production defaults remain unchanged.

This keeps routine coverage fast through virtual time while retaining one meaningful check of real socket behavior.
