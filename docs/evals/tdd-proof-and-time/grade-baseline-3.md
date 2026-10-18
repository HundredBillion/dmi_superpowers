G1: PASS
Rejects setup TypeError as valid RED and requires intended-behavior failures before implementation.

G2: PASS
Requires capped body text, prevents deadline advancement, and verifies failure when the cap is removed.

G3: PASS
Uses controlled scheduling and explicit signals, plus generous bounded socket waits without sleeps or atomic-delivery assumptions.

G4: FAIL
Requires shared helper reuse but does not account for recurring suite runtime cost.
