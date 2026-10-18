G1: PASS
Rejects the TypeError as RED, fixes setup first, and requires intended behavioral failures before implementation.

G2: PASS
Requires exactly 8 KiB of body content and observes failure against unfixed code with the independent deadline inactive.

G3: PASS
Uses controlled scheduling and signal ordering, with generous bounded socket waits and no delivery assumptions.

G4: FAIL
Explicitly reuses existing helpers, but discusses maintenance cost without accounting for recurring suite runtime cost.
