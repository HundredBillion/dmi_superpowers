G1: PASS
Rejects the setup TypeError and requires vertical behavioral RED → GREEN verification.
G2: PASS
Requires all captured 8 KiB, completion with deadline time frozen, and verification that the existing implementation fails.
G3: PASS
Replaces sleeps with signals and manual scheduling, and requires generous bounded real-socket waits while accounting for timer start.
G4: FAIL
Reuses shared fixtures and signals, but does not explicitly account for recurring suite runtime cost.
