Keep the three approved behaviors, the existing integration fixture, and one real-socket smoke test. Change how the tests distinguish the cap from the deadline.

The proposed RED results don’t establish the bug:

- The 8 KiB test can pass through the deadline even with no cap. Assert that reading stops **before advancing the deadline**, and that the 424 response mentions HTTP 503 and includes the captured body.
- An uninitialized scheduler throwing `TypeError` is a setup failure. Initialize it before recording RED; the failure must expose missing behavior.
- `headersSent` doesn’t establish that the body arrived because headers and body are written separately. Use `bodyWritten` for body readiness, and `readerStopped` to observe termination.
- Reuse `RawErrorUpstream` and its scheduler support. A third fixture copy adds maintenance work to a suite run on every push.
- Replace sleeps and the fragile 10 ms real-time window with deterministic scheduler control. Keep real-socket timing generous and bounded. Inject test settings without changing production defaults.

I would follow this sequence, completing each RED → GREEN cycle before adding the next test:

1. **Cap path:** Send exactly 8 KiB and hold the body open with `releaseBody`. Wait for `bodyWritten`; leave the deadline unadvanced. Verify `readerStopped` and a 424 response containing HTTP 503 and the captured body. Use a bounded harness timeout so missing termination fails clearly. Implement the smallest cap fix, then rerun.
2. **Recovery after the cap:** Through the same proxy instance, verify a later request succeeds. Fix anything this exposes, then rerun.
3. **Deadline path:** Send a shorter body and hold it open. Once `bodyWritten` confirms readiness, advance the initialized scheduler through the independent deadline and drain scheduled work as needed. Verify reading stops and the 424 mentions HTTP 503 **without including the partial body**. Implement the smallest deadline fix, then rerun.
4. **Recovery after the deadline:** Verify a later request succeeds through that proxy instance.
5. **Real-socket smoke:** Retain one focused transport test using `bodyWritten` for readiness, a generous timing window, and bounded cleanup that always releases the upstream body.

Run the focused tests during each cycle, then the full suite after the final change. Green is meaningful only after confirming that removing the cap breaks the cap test and removing deadline handling breaks the stalled-body test. Those checks establish that the two mechanisms cannot mask each other.
