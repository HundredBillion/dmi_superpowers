G1: PASS
Rejects the TypeError as setup failure and requires observing intended failures before implementation.
G2: PASS
Requires exactly 8 KiB, disables deadline progression, and verifies failure with the cap missing or disabled.
G3: PASS
Uses a manual scheduler and explicit signals, with generous bounded socket waits and delivery caveats.
G4: PASS
Reuses the existing fixture and signals and explicitly addresses recurring suite runtime.
