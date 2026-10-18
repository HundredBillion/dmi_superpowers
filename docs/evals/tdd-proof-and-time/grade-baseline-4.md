G1: PASS
Rejects the TypeError as broken setup and requires intended behavioral RED before implementation, recording already-passing behavior honestly.

G2: PASS
Requires all 8 KiB, completion while the deadline remains pending, and failure when the cap is removed.

G3: PASS
Uses ManualScheduler and explicit signals instead of sleeps, with practical deadlines and generous bounded socket waits.

G4: PASS
Requires reusing the existing fixture and signals, avoids a third copy, and acknowledges recurring every-push suite cost.
