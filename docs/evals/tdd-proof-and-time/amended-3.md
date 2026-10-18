Keep the three approved behaviors and the real-socket smoke test. Change the test ordering, timing, assertions, and fixture reuse.

The proposed cap test cannot detect a broken cap: its deadline produces the same asserted response. The `TypeError` is a setup failure, so it cannot count as RED. Fixed sleeps and a 10 ms socket deadline also introduce races, and a third fixture copy adds maintenance cost on every push.

I would follow this sequence:

1. **Prepare the existing fixture.** Reuse `RawErrorUpstream`, its signals, and the injected `ManualScheduler`. Initialize the scheduler before making requests. Resolve setup failures separately, without changing production behavior or defaults.

2. **Cap behavior: RED → GREEN.** Send more than 8 KiB, with distinguishable content after the boundary, and keep the upstream body open. Coordinate using the existing signals; keep the independent deadline inactive by leaving virtual time unadvanced. Assert that the public response completes with status 424, mentions upstream HTTP 503, and includes exactly the first 8 KiB of upstream body, excluding the trailing content. Verify `readerStopped` while `releaseBody` remains unreleased. Then make a second request through the same proxy and assert its successful response content. Observe the intended failure against unfixed code using a generous bounded test watchdog, then implement only the cap behavior and rerun.

3. **Deadline behavior: RED → GREEN.** Send a recognizable body shorter than 8 KiB and hold it open. Wait for the fixture signals, confirm the response is still pending before expiry, and explicitly advance virtual time to the configured deadline. Assert status 424 mentioning upstream HTTP 503, with the recognizable body text omitted; verify reading stops. Make another request through the same proxy and assert success. Observe RED for the missing deadline behavior, then make the minimal fix. If that behavior already passes, temporarily disable it to demonstrate that the test detects its absence, then restore it.

4. **Retain one real-socket smoke test.** Reuse the existing fixture and configure a generous test-specific deadline. `headersSent` establishes only that headers were written; it does not establish body delivery or processing. Use `bodyWritten` for server-side coordination and public response completion for the outcome. Avoid fixed sleeps and assumptions that separate socket writes arrive together. Bound all waits and release held bodies during cleanup.

5. **Verify and tidy.** Run focused tests after each change and any refactoring, then run the full suite. Confirm production defaults remain unchanged. Investigate any unexpectedly green regression test before counting it as coverage.

This sequence proves that the cap works independently of the deadline, that the deadline handles shorter stalled bodies, and that each path leaves the proxy usable.
