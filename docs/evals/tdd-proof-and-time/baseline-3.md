Keep the three approved behaviors, the existing integration fixture, and a real-socket smoke test. Change the order and the evidence each test must provide.

The proposed 8 KiB assertion cannot prove the cap works: the deadline produces the same 424 response. A setup `TypeError` also is not a valid RED because it never exercises the bug. Sleeps and a 10 ms socket deadline make both tests vulnerable to scheduling delays.

I would follow this sequence:

1. **Prove the cap independently.** Reuse `RawErrorUpstream`, initialize and inject `ManualScheduler`, and send exactly 8 KiB while holding the body open. Coordinate with `bodyWritten`; do not advance the deadline. Assert `readerStopped` and a completed 424 response mentioning upstream HTTP 503, including the capped body text. Send a later request and verify it succeeds. Run this test and confirm it fails because reading waits beyond the cap; implement only enough to make it pass.

2. **Prove the independent deadline.** Send a shorter body and hold it open. After `bodyWritten`, advance the initialized scheduler to the deadline and drain scheduled work with `advanceUntilIdle`. Assert reading stops and the response is 424 mentioning upstream HTTP 503, with the unfinished body text omitted. Verify a later request succeeds. Observe a failure caused by the missing deadline behavior, then implement it and rerun both tests.

3. **Verify real sockets.** Use the existing fixture with a generous, explicitly injected test deadline, preserving production defaults. Coordinate on `bodyWritten`, since `headersSent` does not establish that the separately written body is available. Avoid an arbitrary sleep; await observable completion with a generous outer timeout. Keep this smoke test focused on socket behavior while deterministic tests distinguish the cap from the deadline.

Reuse or minimally extend the shared helper instead of adding a third copy. Use `releaseBody` in cleanup so failures cannot leave the upstream hanging.

Run the relevant tests after each change, including cleanup or refactoring, then run the complete suite. Before calling it complete, check that removing the cap fails the cap test and disabling the deadline fails the deadline test. A green suite alone does not establish that these regressions are covered.
