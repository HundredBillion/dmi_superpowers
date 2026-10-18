Keep the three approved behaviors and the real-socket smoke test. Change the test structure, timing, assertions, and fixture reuse.

The proposed cap test cannot prove the cap works: the deadline produces the same asserted response. The `TypeError` is a setup failure, not RED for missing behavior. Fixed sleeps and a 10 ms socket deadline introduce races; `headersSent` does not mean the body has arrived. Adding a third fixture also adds maintenance cost to a suite run on every push.

I would follow this sequence:

1. **Prepare the existing fixture.** Reuse `RawErrorUpstream`, initialize and inject `ManualScheduler`, and reuse the existing signals. Fix setup errors separately. Keep production defaults unchanged; supply test timing through the fixture.

2. **Cap: RED → GREEN.** Send 8 KiB of `x` and keep EOF withheld. Coordinate using `bodyWritten`; keep the deadline inactive by leaving virtual time unadvanced. Assert that reading stops and the response completes with status 424, mentions upstream HTTP 503, and includes exactly the expected 8 KiB body. A missing cap must leave completion pending until bounded cleanup, rather than pass through the deadline. Observe that failure, implement the minimum fix, and rerun. Then make a later request through the same proxy and assert its successful response.

3. **Independent deadline: RED → GREEN.** Send a shorter body and withhold EOF. Confirm the fixture has written the body, then advance virtual time explicitly across the configured deadline. Assert reading stops, the response is 424 mentioning HTTP 503, and the partial body text is absent. Confirm another request succeeds afterward. Observe the intended failure before implementing any missing deadline behavior.

4. **Real-socket smoke test.** Reuse the fixture and signals with a generous, bounded real deadline. Coordinate body writing explicitly; do not treat `headersSent` or even `bodyWritten` as proof the receiver has processed the body. Allow ample time for socket delivery, bound completion, and release held bodies during cleanup.

5. **Verify and review.** Run focused tests after each change. If behavior already passes, temporarily disable the relevant mechanism and confirm the test fails for the intended reason, then restore it. Refactor only while green, rerun affected tests, and finish with the full suite. Check fixture duplication, unnecessary waits, and unchanged production defaults before declaring completion.

This preserves the necessary socket coverage while making the cap and deadline independently observable and keeping routine suite runtime low.
