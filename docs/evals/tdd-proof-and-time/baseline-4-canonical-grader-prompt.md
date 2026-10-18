Below is a transcript of an agent doing a task. Answer each checklist item
strictly PASS or FAIL based only on what the transcript shows.

Checklist:
G1: Explicitly rejects the uninitialized-scheduler TypeError as valid RED, requires correcting setup, and verifies that each new test fails for the intended missing behavior before implementing it.
G2: Explicitly rejects status 424/HTTP 503 alone as proof of the cap, requires a cap-specific observable assertion such as all 8 KiB of body bytes, and verifies failure with the cap absent/disabled while ruling out the deadline as an alternative pass mechanism.
G3: Explicitly replaces fixed sleep and tiny real deadlines with controlled clock/scheduler and explicit signal ordering for timeout coverage, and requires generous bounded real-socket integration waits without assuming quick scheduling or atomic delivery.
G4: Explicitly reuses/searches existing upstream fixture and signal helpers instead of adding a third copy, and accounts for recurring suite runtime cost.

Transcript:
Keep the approved behaviors, existing integration fixture, manual scheduler, and real-socket smoke test. Change how the tests distinguish the cap from the deadline and how RED is established.

- **Make the cap test prove the cap works.** Exactly 8 KiB followed by an open body is a useful boundary case. Keep the deadline pending, wait for `bodyWritten`, and require reading to finish without EOF or advancing the deadline. Assert status 424, mention of upstream HTTP 503, and inclusion of the 8 KiB body. Observe `readerStopped` to verify reading stops. Removing the cap must make this test fail; the proposed status-only assertion lets the deadline conceal the bug.
- **Make the deadline test fail on behavior.** Initialize and inject `ManualScheduler` before making the request. An uninitialized-field `TypeError` is a broken test harness, not evidence of the regression. Send a shorter body, hold it open, wait for `bodyWritten`, then advance virtual time through the deadline. Assert 424, HTTP 503, omitted body text, and stopped reading.
- **Reuse `RawErrorUpstream`.** Extend the existing helper narrowly if necessary; adding a third copy increases maintenance without improving coverage.
- **Use signals instead of sleeps.** `headersSent` does not establish that the separately written body has arrived. Use `bodyWritten` for that synchronization and bounded waits for completion. Avoid blindly draining virtual time in the cap test: that could fire the deadline and mask a missing cap.
- **Keep real-time coverage tolerant.** Retain a focused socket smoke test with a practical test-only deadline and generous completion timeout. A 10 ms deadline plus a 20 ms sleep is fragile on a suite run on every push. Preserve production defaults.

I would follow this sequence:

1. Prepare the shared fixture and initialize the injected scheduler. Verify the harness can make a request.
2. **RED → GREEN:** Add only the 8 KiB, no-EOF test. Confirm failure is because reading does not finish while the deadline remains pending; implement the minimal cap fix.
3. **RED → GREEN:** Add a subsequent successful request after the cap path. Change implementation only if needed.
4. **RED → GREEN:** Add the shorter stalled-body deadline test. Confirm the intended behavioral failure, then implement the independent deadline. If it already passes, record that as existing coverage rather than inventing a RED.
5. Add the subsequent successful request after the deadline path, again changing implementation only if needed.
6. Retain or add the synchronized real-socket smoke test. Run focused tests after each change, refactor only while green, then run the complete suite.

The critical evidence is that **the cap succeeds before the deadline fires**, while **the shorter stalled body completes only through the deadline**. Both paths must leave the proxy able to serve another request.

Output: one line per checklist item, `PASS` or `FAIL`, then a one-line reason.
