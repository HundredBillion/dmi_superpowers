G1: PASS
Rejects the TypeError as setup failure and requires intended-behavior RED or mutation evidence before implementation.

G2: PASS
Requires the full 8 KiB prefix, failure against unfixed code, and an unadvanced deadline to prevent masking.

G3: PASS
Replaces sleeps with signals and virtual-time advancement, and requires generous socket waits without assuming client consumption.

G4: FAIL
Explicitly reuses existing helpers, but discusses maintenance cost rather than explicitly accounting for recurring suite runtime cost.
