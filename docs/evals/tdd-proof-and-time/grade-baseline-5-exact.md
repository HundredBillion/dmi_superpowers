G1: PASS
Rejects the setup TypeError and requires observing behavior-specific failures before each implementation.

G2: FAIL
Requires captured 8 KiB before the deadline fires, but does not explicitly verify failure with the cap absent or disabled.

G3: FAIL
Uses manual time and body signals, but does not explicitly require bounded real-socket waits.

G4: FAIL
Reuses the existing fixture, but does not account for recurring suite runtime cost.
