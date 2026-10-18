Below is a transcript of an agent doing a task. Answer each checklist item
strictly PASS or FAIL based only on what the transcript shows.

Checklist:
G1: Explicitly rejects the uninitialized-scheduler TypeError as valid RED, requires correcting setup, and verifies that each new test fails for the intended missing behavior before implementing it.
G2: Explicitly rejects status 424/HTTP 503 alone as proof of the cap, requires a cap-specific observable assertion such as all 8 KiB of body bytes, and verifies failure with the cap absent/disabled while ruling out the deadline as an alternative pass mechanism.
G3: Explicitly replaces fixed sleep and tiny real deadlines with controlled clock/scheduler and explicit signal ordering for timeout coverage, and requires generous bounded real-socket integration waits without assuming quick scheduling or atomic delivery.
G4: Explicitly reuses/searches existing upstream fixture and signal helpers instead of adding a third copy, and accounts for recurring suite runtime cost.

Transcript:
Keep the approved behaviors, the existing integration fixture, virtual time, and one real-socket smoke test. Change the execution order and the evidence each test requires.

The proposed plan has several gaps:

- Writing all three tests before implementation breaks the one-test → RED → GREEN loop.
- The cap assertion is masked by the deadline: either mechanism produces 424 mentioning HTTP 503. Keep the error-body deadline inactive and assert that the response includes the complete 8 KiB prefix, with no excess upstream body.
- An uninitialized scheduler causing `TypeError` is a setup failure. Initialize it before observing RED; the failing request must demonstrate the missing behavior.
- Reuse `RawErrorUpstream` and the existing signals. A third fixture adds maintenance cost to a suite run on every push.
- Replace sleeps with signals and explicit scheduler advancement. `headersSent` cannot establish body readiness when headers and body are separate writes.
- A final green suite is necessary, but each regression also needs evidence that it fails when its intended behavior is broken.

I would follow this sequence:

1. **Cap tracer bullet.** Use the shared fixture with an initialized scheduler. Send 8 KiB and keep EOF withheld using `releaseBody`. Await `bodyWritten`, leave the error-body deadline unadvanced, and use a generous bounded wait for the response. Assert 424, HTTP 503, and the full 8 KiB body prefix. Observe failure against the unfixed code, then implement only the cap and rerun.
2. **Recovery after the cap.** Add a test that follows cap termination with a successful request through the same proxy instance. Run it immediately; make any necessary change only after observing the relevant failure.
3. **Independent deadline.** Send a shorter, nonempty body and withhold EOF. After `bodyWritten`, explicitly advance virtual time across the error-body deadline. Assert 424 and HTTP 503, with the partial body omitted. Verify that disabling the deadline makes this test fail; the cap must be unreachable here.
4. **Recovery after the deadline.** Follow that timeout with a successful request through the same proxy instance and verify its response.
5. **Real-socket smoke and final checks.** Reuse the shared fixture and readiness signals. Coordinate body readiness with `bodyWritten`, while recognizing that a completed server write does not prove client consumption. Use generous bounded waits and a practical test deadline, without changing production defaults. Run focused tests during development, then the complete suite after the final change.

If an existing deadline or recovery behavior already passes, verify its sensitivity by temporarily disabling that behavior and restoring it afterward. Do not invent a production change merely to manufacture RED.

Output: one line per checklist item, `PASS` or `FAIL`, then a one-line reason.
